import asyncio
import json
import hashlib
import math
from typing import AsyncGenerator, List, Optional, Union
from api.providers.base import LLMProvider, ProviderResult, EmbeddingResult
from api.providers.demo_cache import match_demo_question


class MockProvider(LLMProvider):
    """
    Deterministic mock provider adapter for offline hackathon evaluations, CI, and testing.
    Guarantees reproducible, zero-cost, latency-free responses, demo-cached answers,
    and 768-dim embeddings.
    """

    DIMENSION = 768

    @property
    def name(self) -> str:
        return "mock"

    def _deterministic_vector(self, text: str, dimension: int) -> List[float]:
        """Generates a deterministic unit-normalized pseudo-embedding for any text string."""
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        seed = sum(digest)
        raw = [math.sin(seed + i * 0.17) for i in range(dimension)]
        norm = math.sqrt(sum(x * x for x in raw)) or 1.0
        return [round(x / norm, 6) for x in raw]

    async def embed(
        self, text_or_texts: Union[str, List[str]], dimension: int = 768
    ) -> List[List[float]]:
        if isinstance(text_or_texts, str):
            texts = [text_or_texts]
        else:
            texts = text_or_texts
        return [self._deterministic_vector(t, dimension) for t in texts]

    async def generate(
        self, prompt: str, system_prompt: Optional[str] = None, max_tokens: int = 1024
    ) -> ProviderResult:
        prompt_lower = prompt.lower()

        # 1. Check for demo cache match
        demo_match = match_demo_question(prompt)
        if demo_match:
            # Build structured JSON payload expected by TutorWorkflow
            citations_payload = []
            if demo_match.get("citations"):
                for c in demo_match["citations"]:
                    citations_payload.append({
                        "evidence_id": c.get("citation_id", "E1"),
                        "quote": c.get("quote", "verified lecture evidence"),
                    })
            elif not demo_match.get("is_not_covered"):
                citations_payload.append({"evidence_id": "E1", "quote": "verified lecture content"})

            check_payload = None
            if demo_match.get("check"):
                chk = demo_match["check"]
                check_payload = {
                    "question": chk.get("question", ""),
                    "options": chk.get("options", []),
                    "correct_index": chk.get("correct_index", 0),
                    "explanation": chk.get("explanation", ""),
                }

            json_body = {
                "answer": demo_match["answer"],
                "citations": citations_payload,
                "diagnostic_check": check_payload,
                "is_not_covered": demo_match.get("is_not_covered", False),
                "not_covered_topic": demo_match.get("not_covered_topic", None),
            }
            content = json.dumps(json_body)
            return ProviderResult(
                content=content,
                model="mock-prism-engine-v1",
                provider="mock",
                prompt_tokens=len(prompt.split()),
                completion_tokens=len(content.split()),
            )

        # 2. General deterministic fallback matching prompt content
        if "attention" in prompt_lower:
            ans = (
                "Based strictly on the verified transcript [E1], the query-key attention scores represent raw "
                "dot-product affinities. Softmax normalization scales these values into a valid probability distribution."
            )
            concept = "Self-Attention"
        elif "bst" in prompt_lower or "binary search tree" in prompt_lower:
            ans = (
                "Based strictly on the content covered up to this timestamp [E1], a Binary Search Tree satisfies "
                "the invariant that every node in the left subtree has a key strictly less than the root, and every "
                "node in the right subtree has a key greater than or equal to the root."
            )
            concept = "BST Invariant"
        elif "firewall" in prompt_lower or "timestamp" in prompt_lower or "temporal" in prompt_lower:
            ans = (
                "Based strictly on the verified transcript up to this timestamp [E1], we can only reference definitions "
                "and examples introduced prior to this moment. Later topics have not yet been presented."
            )
            concept = "Temporal Scoping"
        else:
            ans = (
                "Based strictly on the verified content covered up to this timestamp in the lecture [E1], the foundational "
                "principles apply directly to analyze this query without referencing unrevealed material."
            )
            concept = "Lecture Foundations"

        json_body = {
            "answer": ans,
            "citations": [{"evidence_id": "E1", "quote": "verified content covered up to this timestamp"}],
            "diagnostic_check": {
                "question": f"Which statement best describes {concept} as presented in the lecture?",
                "options": [
                    "The property holds consistently across all subtrees",
                    "The mechanism relies exclusively on unrevealed future material",
                    "The calculation is randomized without deterministic bounds",
                    "None of the above",
                ],
                "correct_index": 0,
                "explanation": "Grounded lecture explanations strictly preserve the foundational properties established up to the current playback coordinate.",
            },
            "is_not_covered": False,
            "not_covered_topic": None,
        }
        content = json.dumps(json_body)

        return ProviderResult(
            content=content,
            model="mock-prism-engine-v1",
            provider="mock",
            prompt_tokens=len(prompt.split()),
            completion_tokens=len(content.split()),
        )

    async def stream(
        self, prompt: str, system_prompt: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        result = await self.generate(prompt=prompt, system_prompt=system_prompt)
        words = result.content.split(" ")
        for i, word in enumerate(words):
            chunk = word + (" " if i < len(words) - 1 else "")
            yield chunk
            await asyncio.sleep(0.005)

    async def health_check(self) -> dict:
        return {
            "status": "ok",
            "provider": "mock",
            "mode": "deterministic_cached_demo",
            "dimension": self.DIMENSION,
            "demo_questions_count": 6,
        }
