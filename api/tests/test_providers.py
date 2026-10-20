import pytest
import math
from api.providers.mock import MockProvider
from api.providers.factory import get_provider
from api.config import Settings


@pytest.mark.asyncio
async def test_mock_provider_generation():
    provider = MockProvider()
    assert provider.name == "mock"

    res = await provider.generate_response("Explain self-attention")
    assert res.provider == "mock"
    assert "dot-product" in res.content
    assert res.prompt_tokens > 0
    assert res.completion_tokens > 0


@pytest.mark.asyncio
async def test_mock_provider_embeddings():
    provider = MockProvider()
    res = await provider.generate_embedding("Temporal Evidence Firewall")

    assert res.provider == "mock"
    assert res.dimension in (768, 3072)
    assert len(res.embedding) in (768, 3072)

    # Check approximate unit length normalization
    norm = math.sqrt(sum(x * x for x in res.embedding))
    assert 0.99 <= norm <= 1.01


@pytest.mark.asyncio
async def test_mock_provider_health():
    provider = MockProvider()
    health = await provider.health_check()
    assert health["status"] == "ok"
    assert health["provider"] == "mock"


def test_provider_factory_mock():
    provider = get_provider()
    assert provider is not None
    assert provider.name in ["mock", "gemini"]
