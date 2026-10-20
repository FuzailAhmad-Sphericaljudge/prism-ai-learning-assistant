import logging
from typing import Optional
import httpx
from api.providers.base import BaseLLMProvider, ProviderResult, EmbeddingResult

logger = logging.getLogger("prism.providers.gemini")


class GeminiProvider(BaseLLMProvider):
    """
    Production Google Gemini provider adapter.
    Uses gemini-3.5-flash-lite for Socratic dialog and gemini-embedding-001 for temporal retrieval.
    """

    GEN_MODEL = "gemini-3.5-flash-lite"
    EMBED_MODEL = "gemini-embedding-001"
    BASE_URL = "https://generativelanguage.googleapis.com/v1beta"

    def __init__(self, api_key: str):
        self.api_key = api_key
        if not self.api_key:
            logger.warning("GeminiProvider initialized without an API key.")

    @property
    def name(self) -> str:
        return "gemini"

    async def generate_response(
        self, prompt: str, system_prompt: Optional[str] = None
    ) -> ProviderResult:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")

        url = f"{self.BASE_URL}/models/{self.GEN_MODEL}:generateContent?key={self.api_key}"
        
        contents = []
        if system_prompt:
            contents.append({"role": "user", "parts": [{"text": f"System Directive: {system_prompt}"}]})
            contents.append({"role": "model", "parts": [{"text": "Understood. I will strictly follow the temporal evidence directive."}]})

        contents.append({"role": "user", "parts": [{"text": prompt}]})

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json={"contents": contents})
            if resp.status_code != 200:
                logger.error(f"Gemini generation error ({resp.status_code}): {resp.text}")
                raise RuntimeError(f"Gemini API returned HTTP {resp.status_code}")

            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise RuntimeError("No candidates returned by Gemini")

            text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            usage = data.get("usageMetadata", {})

            return ProviderResult(
                content=text,
                model=self.GEN_MODEL,
                provider="gemini",
                prompt_tokens=usage.get("promptTokenCount"),
                completion_tokens=usage.get("candidatesTokenCount"),
            )

    async def generate_embedding(self, text: str) -> EmbeddingResult:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")

        url = f"{self.BASE_URL}/models/{self.EMBED_MODEL}:embedContent?key={self.api_key}"
        payload = {
            "model": f"models/{self.EMBED_MODEL}",
            "content": {"parts": [{"text": text}]},
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                logger.error(f"Gemini embedding error ({resp.status_code}): {resp.text}")
                raise RuntimeError(f"Gemini Embedding API returned HTTP {resp.status_code}")

            data = resp.json()
            embedding_vals = data.get("embedding", {}).get("values", [])

            return EmbeddingResult(
                embedding=embedding_vals,
                dimension=len(embedding_vals),
                model=self.EMBED_MODEL,
                provider="gemini",
            )

    async def health_check(self) -> dict:
        if not self.api_key:
            return {"status": "unconfigured", "provider": "gemini", "error": "Missing GEMINI_API_KEY"}

        try:
            res = await self.generate_embedding("Ping")
            return {
                "status": "ok",
                "provider": "gemini",
                "gen_model": self.GEN_MODEL,
                "embed_model": self.EMBED_MODEL,
                "embedding_dim": res.dimension,
            }
        except Exception as exc:
            return {"status": "error", "provider": "gemini", "error": str(exc)}
