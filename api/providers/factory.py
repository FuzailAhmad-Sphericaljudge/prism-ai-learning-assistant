import logging
from functools import lru_cache
from api.config import get_settings
from api.providers.base import LLMProvider, BaseLLMProvider
from api.providers.mock import MockProvider
from api.providers.gemini import GeminiProvider
from api.providers.bedrock import BedrockProvider

logger = logging.getLogger("prism.providers.factory")


@lru_cache()
def get_provider() -> LLMProvider:
    """
    Factory that returns the configured LLM & Embedding provider adapter.
    Supports 'gemini' (production), 'bedrock' (AWS enterprise stub), and 'mock' (deterministic CI/eval).
    Defaults to MockProvider if LLM_PROVIDER=mock or if GEMINI_API_KEY is not set.
    """
    settings = get_settings()
    provider_name = settings.LLM_PROVIDER.lower().strip()

    if provider_name == "gemini":
        if settings.GEMINI_API_KEY:
            logger.info("Initializing production GeminiProvider.")
            return GeminiProvider(api_key=settings.GEMINI_API_KEY)
        else:
            logger.warning("GEMINI_API_KEY not set. Falling back to MockProvider.")
            return MockProvider()

    elif provider_name == "bedrock":
        logger.info("Initializing BedrockProvider stub.")
        return BedrockProvider()

    elif provider_name == "mock":
        logger.info("Initializing MockProvider (deterministic demo mode).")
        return MockProvider()

    else:
        logger.warning(f"Unknown provider '{provider_name}'. Falling back to MockProvider.")
        return MockProvider()
