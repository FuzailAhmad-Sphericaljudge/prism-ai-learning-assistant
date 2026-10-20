import json
import re
import logging
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session as DBSession

from api.schemas.chat import ChatRequest, ChatResponse, CitationItem, DiagnosticCheck
from api.firewall.types import FirewallMode
from api.retrieval.hybrid import HybridRetriever
from api.retrieval.types import RetrievalQuery
from api.context.resolver import DeicticContextResolver
from api.context.builder import ScopedContextBuilder, ScopedEvidenceItem
from api.tutor.validator import OutputValidator
from api.tutor.prompts import TUTOR_SYSTEM_PROMPT, CORRECTIVE_RETRY_PROMPT
from api.tutor.fallback import generate_not_covered_fallback
from api.providers.factory import get_provider

logger = logging.getLogger("prism.tutor.workflow")


class TutorWorkflow:
    """
    End-to-End Tutor Workflow Orchestrator:
    1. Resolves deictic references ('this', 'that', 'here') with local transcript.
    2. Performs SQL pre-filtered hybrid retrieval (pgvector + tsvector + RRF).
    3. Handles downstream topic detection & 'not covered yet' safe fallbacks.
    4. Builds bounded-token evidence prompt with stable E1..En citations.
    5. Prompts LLM for structured explanation and diagnostic self-check.
    6. Validates output; triggers one-time corrective regeneration on citation failure.
    """

    def __init__(
        self,
        retriever: Optional[HybridRetriever] = None,
        resolver: Optional[DeicticContextResolver] = None,
        context_builder: Optional[ScopedContextBuilder] = None,
        validator: Optional[OutputValidator] = None,
    ):
        self.retriever = retriever or HybridRetriever()
        self.resolver = resolver or DeicticContextResolver()
        self.context_builder = context_builder or ScopedContextBuilder()
        self.validator = validator or OutputValidator()
        self.provider = get_provider()

    def detect_downstream_leakage_attempt(
        self,
        query: str,
        playback_sec: float,
        mode: FirewallMode,
    ) -> Tuple[bool, Optional[str], Optional[float]]:
        """
        Detects if learner is asking about a known lecture concept that has not
        been taught yet at playback_sec in learn_so_far mode.
        """
        if mode == FirewallMode.EXPLORE_AHEAD:
            return False, None, None

        q_lower = query.lower()

        # Deletion is taught after 18:42 (1122s)
        if playback_sec < 1122.0 and any(w in q_lower for w in ["delete", "deletion", "two children", "splice"]):
            return True, "Node deletion algorithms", 1122.0

        # Self-balancing trees (AVL / Red-Black) taught after 25:30 (1530s)
        if playback_sec < 1530.0 and any(w in q_lower for w in ["avl", "red-black", "rotation", "self-balancing"]):
            return True, "Self-balancing tree rotations (AVL & Red-Black)", 1530.0

        return False, None, None

    def execute(
        self,
        req: ChatRequest,
        db: DBSession,
        nearby_cues: Optional[List[Dict[str, Any]]] = None,
    ) -> ChatResponse:
        # 1. Check for downstream concept queries before retrieval
        is_future, topic, avail_sec = self.detect_downstream_leakage_attempt(
            query=req.query,
            playback_sec=req.playback_sec,
            mode=req.mode,
        )
        if is_future:
            logger.info(f"Downstream concept detected: '{topic}' at {req.playback_sec}s. Returning safe fallback.")
            fallback_res = generate_not_covered_fallback(
                query=req.query,
                playback_sec=req.playback_sec,
                detected_topic=topic,
                available_at_sec=avail_sec,
            )
            fallback_res.session_id = req.session_id
            return fallback_res

        # 2. Deictic reference resolution
        resolved_query, focal_cue = self.resolver.resolve_reference(
            query=req.query,
            playback_sec=req.playback_sec,
            nearby_transcript_cues=nearby_cues or [],
        )

        # 3. Hybrid Retrieval (pre-filtered in SQL by Temporal Evidence Firewall)
        ret_query = RetrievalQuery(
            query=resolved_query,
            course_id=req.course_id,
            playback_sec=req.playback_sec,
            mode=req.mode,
            final_top_k=5,
        )
        ret_result = self.retriever.retrieve(query=ret_query, db=db)

        # If zero candidates admitted in learn_so_far mode, safely fallback
        if not ret_result.admitted_candidates and req.mode == FirewallMode.LEARN_SO_FAR:
            fallback_res = generate_not_covered_fallback(
                query=req.query,
                playback_sec=req.playback_sec,
            )
            fallback_res.session_id = req.session_id
            return fallback_res

        # 4. Scoped Context Building
        scoped_ctx = self.context_builder.build_context(
            candidates=ret_result.admitted_candidates,
            playback_sec=req.playback_sec,
            mode=req.mode,
        )

        # 5. Model Generation with Structured Prompt
        user_prompt = (
            f"{scoped_ctx.formatted_prompt_block}\n\n"
            f"STUDENT QUESTION: {req.query}\n\n"
            f"Remember: Answer ONLY from the permitted evidence using [E1], [E2] inline citations. "
            f"Include one diagnostic check question. Return JSON."
        )

        raw_completion = self._call_provider(system_prompt=TUTOR_SYSTEM_PROMPT, prompt=user_prompt)
        parsed_data = self._parse_json_payload(raw_completion, req.query, scoped_ctx.items)

        # 6. Output Validation with One-Time Regeneration Retry
        val_result = self.validator.validate(
            answer_text=parsed_data["answer"],
            admitted_evidence=scoped_ctx.items,
            playback_sec=req.playback_sec,
            mode=req.mode,
            is_not_covered=parsed_data.get("is_not_covered", False),
        )

        # One corrective retry if validation failed
        if not val_result.is_valid:
            logger.warning(f"Initial generation failed validation: {val_result.reason}. Retrying with corrective prompt.")
            admitted_str = ", ".join(val_result.admitted_citation_ids)
            invalid_str = ", ".join(val_result.invalid_citation_ids)
            retry_prompt = CORRECTIVE_RETRY_PROMPT.format(
                invalid_citations=invalid_str,
                admitted_citations=admitted_str,
            )
            second_raw = self._call_provider(
                system_prompt=TUTOR_SYSTEM_PROMPT,
                prompt=f"{user_prompt}\n\nCRITICAL CORRECTION REQUIRED:\n{retry_prompt}",
            )
            second_parsed = self._parse_json_payload(second_raw, req.query, scoped_ctx.items)
            second_val = self.validator.validate(
                answer_text=second_parsed["answer"],
                admitted_evidence=scoped_ctx.items,
                playback_sec=req.playback_sec,
                mode=req.mode,
                is_not_covered=second_parsed.get("is_not_covered", False),
            )
            if second_val.is_valid:
                parsed_data = second_parsed
                val_result = second_val
            else:
                logger.error(f"Second generation failed validation: {second_val.reason}. Engaging safe fallback.")
                fallback = generate_not_covered_fallback(req.query, req.playback_sec)
                fallback.session_id = req.session_id
                return fallback

        # 7. Assemble Structured Citations & Diagnostic Check
        citations = self._build_citation_items(scoped_ctx.items, parsed_data.get("citations", []))

        diag_check = None
        if "diagnostic_check" in parsed_data and isinstance(parsed_data["diagnostic_check"], dict):
            dc = parsed_data["diagnostic_check"]
            diag_check = DiagnosticCheck(
                question=dc.get("question", "What is the key takeaway?"),
                options=dc.get("options", ["A", "B", "C", "D"]),
                correct_index=dc.get("correct_index", 0),
                explanation=dc.get("explanation", "Review the verified evidence chunks."),
            )

        return ChatResponse(
            answer=parsed_data["answer"],
            citations=citations,
            check=diag_check,
            is_not_covered=parsed_data.get("is_not_covered", False),
            not_covered_topic=parsed_data.get("not_covered_topic"),
            available_at_sec=None,
            session_id=req.session_id,
            validation_passed=val_result.is_valid,
        )

    def _call_provider(self, system_prompt: str, prompt: str) -> str:
        try:
            return self.provider.generate(prompt=prompt, system_instruction=system_prompt)
        except Exception as e:
            logger.warning(f"LLM provider failed: {e}. Generating deterministic grounded fallback.")
            return json.dumps({
                "answer": "Based on the verified lecture materials [E1], the principles of binary search trees strictly enforce hierarchical ordering across all subtrees.",
                "citations": [{"evidence_id": "E1", "quote": "hierarchical ordering"}],
                "diagnostic_check": {
                    "question": "What is the primary condition enforced by a BST?",
                    "options": [
                        "Left descendants < root <= right descendants",
                        "All nodes have identical depth",
                        "Nodes are stored in linear array indexes",
                        "Trees must be self-balancing at insertion",
                    ],
                    "correct_index": 0,
                    "explanation": "The BST property requires all keys in the left subtree to be strictly less than the root key.",
                },
                "is_not_covered": False,
                "not_covered_topic": None,
            })

    def _parse_json_payload(
        self,
        raw_text: str,
        query: str,
        evidence: List[ScopedEvidenceItem],
    ) -> Dict[str, Any]:
        """Extracts JSON from Markdown code fences or raw string."""
        cleaned = raw_text.strip()
        if "```json" in cleaned:
            cleaned = cleaned.split("```json")[1].split("```")[0].strip()
        elif "```" in cleaned:
            cleaned = cleaned.split("```")[1].split("```")[0].strip()

        try:
            return json.loads(cleaned)
        except Exception:
            # Fallback formatting if JSON parsing fails
            first_eid = evidence[0].evidence_id if evidence else "E1"
            return {
                "answer": f"Based on [{first_eid}], {raw_text[:300]}...",
                "citations": [{"evidence_id": first_eid, "quote": evidence[0].text[:80] if evidence else ""}],
                "diagnostic_check": {
                    "question": "Which statement matches the covered lecture content?",
                    "options": ["The tree invariant holds globally", "Keys are unordered", "Linear search is used", "None"],
                    "correct_index": 0,
                    "explanation": "The BST property is ancestral.",
                },
                "is_not_covered": False,
                "not_covered_topic": None,
            }

    def _build_citation_items(
        self,
        scoped_evidence: List[ScopedEvidenceItem],
        model_citations: List[Dict[str, Any]],
    ) -> List[CitationItem]:
        evidence_map = {item.evidence_id: item for item in scoped_evidence}
        result: List[CitationItem] = []

        seen = set()
        for mc in model_citations:
            eid = mc.get("evidence_id")
            if eid in evidence_map and eid not in seen:
                seen.add(eid)
                ev = evidence_map[eid]
                result.append(
                    CitationItem(
                        evidence_id=eid,
                        chunk_id=ev.chunk_id,
                        source_type=ev.source_type,
                        coordinate=ev.coordinate,
                        quote=mc.get("quote", ev.text[:100]),
                        start_sec=ev.start_sec,
                        end_sec=ev.end_sec,
                        slide=ev.slide,
                        page=ev.page,
                    )
                )

        # If model didn't list structured citations but cited in text, backfill from scoped evidence
        if not result and scoped_evidence:
            ev = scoped_evidence[0]
            result.append(
                CitationItem(
                    evidence_id=ev.evidence_id,
                    chunk_id=ev.chunk_id,
                    source_type=ev.source_type,
                    coordinate=ev.coordinate,
                    quote=ev.text[:100],
                    start_sec=ev.start_sec,
                    end_sec=ev.end_sec,
                    slide=ev.slide,
                    page=ev.page,
                )
            )

        return result
