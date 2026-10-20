import math
from typing import Optional
from api.providers.base import BaseLLMProvider, ProviderResult, EmbeddingResult


class MockProvider(BaseLLMProvider):
    """
    Deterministic mock provider adapter for offline hackathon evaluations and testing.
    Guarantees reproducible, zero-cost, latency-free responses and embeddings.
    """

    DIMENSION = 3072

    @property
    def name(self) -> str:
        return "mock"

    async def generate_response(
        self, prompt: str, system_prompt: Optional[str] = None
    ) -> ProviderResult:
        # Grounded mock response simulating Temporal Evidence Firewall
        content = (
            "Based strictly on the content covered up to this timestamp in the lecture, "
            "the query-key attention scores represent raw dot-product affinities. "
            "Softmax normalization scales these values into a valid probability distribution."
        )
        return ProviderResult(
            content=content,
            model="mock-prism-engine-v1",
            provider="mock",
            prompt_tokens=len(prompt.split()),
            completion_tokens=len(content.split()),
        )

    async def generate_embedding(self, text: str) -> EmbeddingResult:
        # Generates deterministic unit-normalized pseudo-embedding based on text hash
        seed = sum(ord(c) for c in text)
        raw = [math.sin(seed + i) for i in range(self.DIMENSION)]
        norm = math.sqrt(sum(x * x for x in raw)) or 1.0
        normalized = [round(x / norm, 6) for x in raw]

        return EmbeddingResult(
            embedding=normalized,
            dimension=self.DIMENSION,
            model="mock-embedding-3072",
            provider="mock",
        )

    async def health_check(self) -> dict:
        return {
            "status": "ok",
            "provider": "mock",
            "mode": "deterministic_cached_demo",
            "dimension": self.DIMENSION,
        }
