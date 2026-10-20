import asyncio
import hashlib
import math
from typing import AsyncGenerator, List, Optional, Union
from api.providers.base import LLMProvider, ProviderResult, EmbeddingResult


class MockProvider(LLMProvider):
    """
    Deterministic mock provider adapter for offline hackathon evaluations, CI, and testing.
    Guarantees reproducible, zero-cost, latency-free responses and 768-dim embeddings.
    """

    DIMENSION = 768

    # Cached responses keyed by prompt pattern
    CACHED_RESPONSES = {
        "bst": (
            "Based strictly on the content covered up to this timestamp in the lecture, "
            "a Binary Search Tree satisfies the invariant that every node in the left subtree "
            "has a key strictly less than the root, and every node in the right subtree has a key "
            "greater than or equal to the root."
        ),
        "temporal": (
            "Based strictly on the verified transcript up to this timestamp, "
            "we can only reference definitions and examples introduced prior to this moment. "
            "Later topics (such as AVL rotations or Red-Black balance invariants) have not yet been presented."
        ),
        "default": (
            "Based strictly on the content covered up to this timestamp in the lecture, "
            "the foundational concepts have been introduced and can be applied directly "
            "to analyze this question without referencing unrevealed material."
        ),
    }

    @property
    def name(self) -> str:
        return "mock"

    def _deterministic_vector(self, text: str, dimension: int) -> List[float]:
        """Generates a deterministic unit-normalized pseudo-embedding for any text string."""
        # Use sha256 to seed deterministic pseudo-random values
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
        if "bst" in prompt_lower or "binary search tree" in prompt_lower:
            content = self.CACHED_RESPONSES["bst"]
        elif "firewall" in prompt_lower or "timestamp" in prompt_lower or "temporal" in prompt_lower:
            content = self.CACHED_RESPONSES["temporal"]
        else:
            content = self.CACHED_RESPONSES["default"]

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
        }
