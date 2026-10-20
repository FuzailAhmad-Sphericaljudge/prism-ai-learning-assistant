import re
import logging
from typing import List, Set, Dict, Any
from api.tutor.types import OutputValidationResult
from api.context.builder import ScopedEvidenceItem
from api.firewall.types import FirewallMode

logger = logging.getLogger("prism.tutor.validator")

CITATION_REGEX = re.compile(r"\[(E\d+)\]")


class OutputValidator:
    """
    Validates model generation against strict evidence grounding invariants:
    1. Every citation tag [En] in the text must exist in the admitted evidence pool.
    2. Every cited item must be within temporal playback scope in learn_so_far mode.
    3. Detects hallucinated or unpermitted evidence markers.
    4. Logs detailed validation audit results.
    """

    def validate(
        self,
        answer_text: str,
        admitted_evidence: List[ScopedEvidenceItem],
        playback_sec: float,
        mode: FirewallMode = FirewallMode.LEARN_SO_FAR,
        is_not_covered: bool = False,
    ) -> OutputValidationResult:
        admitted_id_map: Dict[str, ScopedEvidenceItem] = {
            item.evidence_id: item for item in admitted_evidence
        }
        admitted_ids: Set[str] = set(admitted_id_map.keys())

        # Extract citation tokens from answer text
        detected_ids: List[str] = CITATION_REGEX.findall(answer_text)
        unique_detected: Set[str] = set(detected_ids)

        invalid_citations: List[str] = []
        temporal_violations: List[str] = []

        for cid in unique_detected:
            # 1. Existence check
            if cid not in admitted_ids:
                invalid_citations.append(cid)
                continue

            # 2. Temporal scope check
            item = admitted_id_map[cid]
            if mode == FirewallMode.LEARN_SO_FAR:
                if item.source_type == "video" and item.start_sec is not None:
                    if item.start_sec > playback_sec:
                        temporal_violations.append(
                            f"{cid} (start: {item.start_sec}s > playback: {playback_sec}s)"
                        )

        # Invariant judgment
        unsupported_claims = len(invalid_citations) > 0 or len(temporal_violations) > 0
        has_citations = len(unique_detected) > 0

        # If answer is not marked "not covered yet" and we provided evidence,
        # an answer with zero citations is flagged as unsupported
        if not is_not_covered and len(admitted_evidence) > 0 and not has_citations:
            unsupported_claims = True
            reasons = ["Answer contains factual explanations but cites zero admitted evidence tags."]
        else:
            reasons = []

        if invalid_citations:
            reasons.append(f"Invalid citation IDs not in admitted set: {invalid_citations}")
        if temporal_violations:
            reasons.append(f"Temporal firewall violations: {temporal_violations}")

        is_valid = not unsupported_claims
        failure_reason = " | ".join(reasons) if reasons else None

        audit_log: Dict[str, Any] = {
            "is_valid": is_valid,
            "detected_citations": list(unique_detected),
            "admitted_citations": list(admitted_ids),
            "invalid_citations": invalid_citations,
            "temporal_violations": temporal_violations,
            "playback_sec": playback_sec,
            "mode": mode.value if hasattr(mode, "value") else str(mode),
            "is_not_covered": is_not_covered,
        }

        if is_valid:
            logger.info(f"Output validation PASSED. Validated citations: {list(unique_detected)}")
        else:
            logger.warning(f"Output validation FAILED. Reason: {failure_reason} | Audit: {audit_log}")

        return OutputValidationResult(
            is_valid=is_valid,
            detected_citation_ids=list(unique_detected),
            admitted_citation_ids=list(admitted_ids),
            invalid_citation_ids=invalid_citations + temporal_violations,
            unsupported_claims_flagged=unsupported_claims,
            reason=failure_reason,
            audit_log=audit_log,
        )
