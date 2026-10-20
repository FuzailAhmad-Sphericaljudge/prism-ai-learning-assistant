from abc import ABC, abstractmethod
from typing import List, Optional
from pydantic import BaseModel, Field


class ProviderResult(BaseModel):
    content: str
    model: str
    provider: str
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None


class EmbeddingResult(BaseModel):
    embedding: List[float]
    dimension: int
    model: str
    provider: str


class BaseLLMProvider(ABC):
    """
    Abstract interface for LLM & Embedding provider adapters in PRISM.
    Supports Gemini (production), Mock (demo/offline), and Bedrock (stub).
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Returns the provider name (e.g. 'gemini', 'mock', 'bedrock')"""
        pass

    @abstractmethod
    async def generate_response(
        self, prompt: str, system_prompt: Optional[str] = None
    ) -> ProviderResult:
        """Generates Socratic response or rubric evaluation text."""
        pass

    @abstractmethod
    async def generate_embedding(self, text: str) -> EmbeddingResult:
        """Generates dense vector embeddings for temporal vector retrieval."""
        pass

    @abstractmethod
    async def health_check(self) -> dict:
        """Runs a connectivity probe against the provider API."""
        pass
