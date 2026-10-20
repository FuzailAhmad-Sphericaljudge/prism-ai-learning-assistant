import json
import logging
from typing import AsyncGenerator, List, Optional, Union
import httpx
from api.providers.base import LLMProvider, ProviderResult, EmbeddingResult

logger = logging.getLogger("prism.providers.gemini")


class GeminiProvider(LLMProvider):
    """
    Production Google Gemini provider adapter.
    Uses gemini-2.5-flash / gemini-1.5-flash for Socratic dialog and text-embedding-004 / gemini-embedding-001 for 768-dim temporal retrieval.
    """

    GEN_MODEL = "gemini-1.5-flash"
    EMBED_MODEL = "text-embedding-004"
    BASE_URL = "https://generativelanguage.googleapis.com/v1beta"

    def __init__(self, api_key: str):
        self.api_key = api_key
        if not self.api_key:
            logger.warning("GeminiProvider initialized without an API key.")

    @property
    def name(self) -> str:
        return "gemini"

    async def embed(
        self, text_or_texts: Union[str, List[str]], dimension: int = 768
    ) -> List[List[float]]:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")

        if isinstance(text_or_texts, str):
            texts = [text_or_texts]
        else:
            texts = text_or_texts

        if not texts:
            return []

        # Batch in slices of up to 50 items for API compliance
        batch_size = 50
        all_embeddings: List[List[float]] = []

        url = f"{self.BASE_URL}/models/{self.EMBED_MODEL}:batchEmbedContents?key={self.api_key}"

        async with httpx.AsyncClient(timeout=30.0) as client:
            for i in range(0, len(texts), batch_size):
                chunk_texts = texts[i : i + batch_size]
                requests_payload = [
                    {
                        "model": f"models/{self.EMBED_MODEL}",
                        "content": {"parts": [{"text": t}]},
                        "outputDimensionality": dimension,
                    }
                    for t in chunk_texts
                ]

                resp = await client.post(url, json={"requests": requests_payload})
                if resp.status_code != 200:
                    # Fallback to single embedContent if batchEmbedContents is unsupported
                    logger.warning(
                        f"batchEmbedContents error ({resp.status_code}), falling back to single embed: {resp.text}"
                    )
                    for t in chunk_texts:
                        single_url = f"{self.BASE_URL}/models/{self.EMBED_MODEL}:embedContent?key={self.api_key}"
                        single_payload = {
                            "model": f"models/{self.EMBED_MODEL}",
                            "content": {"parts": [{"text": t}]},
                            "outputDimensionality": dimension,
                        }
                        s_resp = await client.post(single_url, json=single_payload)
                        if s_resp.status_code != 200:
                            raise RuntimeError(
                                f"Gemini Embedding API returned HTTP {s_resp.status_code}: {s_resp.text}"
                            )
                        vals = s_resp.json().get("embedding", {}).get("values", [])
                        if len(vals) > dimension:
                            vals = vals[:dimension]
                        all_embeddings.append(vals)
                    continue

                data = resp.json()
                for item in data.get("embeddings", []):
                    vals = item.get("values", [])
                    if len(vals) > dimension:
                        vals = vals[:dimension]
                    all_embeddings.append(vals)

        return all_embeddings

    async def generate(
        self, prompt: str, system_prompt: Optional[str] = None, max_tokens: int = 1024
    ) -> ProviderResult:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")

        url = f"{self.BASE_URL}/models/{self.GEN_MODEL}:generateContent?key={self.api_key}"

        contents = []
        if system_prompt:
            contents.append(
                {"role": "user", "parts": [{"text": f"System Directive: {system_prompt}"}]}
            )
            contents.append(
                {
                    "role": "model",
                    "parts": [{"text": "Understood. I will strictly follow the temporal evidence directive."}],
                }
            )

        contents.append({"role": "user", "parts": [{"text": prompt}]})

        generation_config = {
            "maxOutputTokens": max_tokens,
            "temperature": 0.2,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                url, json={"contents": contents, "generationConfig": generation_config}
            )
            if resp.status_code != 200:
                logger.error(f"Gemini generation error ({resp.status_code}): {resp.text}")
                raise RuntimeError(f"Gemini API returned HTTP {resp.status_code}: {resp.text}")

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

    async def stream(
        self, prompt: str, system_prompt: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")

        url = f"{self.BASE_URL}/models/{self.GEN_MODEL}:streamGenerateContent?alt=sse&key={self.api_key}"

        contents = []
        if system_prompt:
            contents.append(
                {"role": "user", "parts": [{"text": f"System Directive: {system_prompt}"}]}
            )
            contents.append(
                {
                    "role": "model",
                    "parts": [{"text": "Understood. I will strictly follow the temporal evidence directive."}],
                }
            )

        contents.append({"role": "user", "parts": [{"text": prompt}]})

        async with httpx.AsyncClient(timeout=45.0) as client:
            async with client.stream(
                "POST", url, json={"contents": contents, "generationConfig": {"temperature": 0.2}}
            ) as response:
                if response.status_code != 200:
                    err_body = await response.aread()
                    raise RuntimeError(f"Gemini streaming error {response.status_code}: {err_body.decode()}")

                async for line in response.aiter_lines():
                    if not line:
                        continue
                    if line.startswith("data: "):
                        json_str = line[6:].strip()
                        if not json_str or json_str == "[DONE]":
                            continue
                        try:
                            payload = json.loads(json_str)
                            candidates = payload.get("candidates", [])
                            if candidates:
                                parts = candidates[0].get("content", {}).get("parts", [])
                                for part in parts:
                                    text_piece = part.get("text", "")
                                    if text_piece:
                                        yield text_piece
                        except json.JSONDecodeError:
                            continue

    async def health_check(self) -> dict:
        if not self.api_key:
            return {"status": "unconfigured", "provider": "gemini", "error": "Missing GEMINI_API_KEY"}

        try:
            res = await self.embed("PRISM Temporal Verification", dimension=768)
            dim = len(res[0]) if res else 0
            return {
                "status": "ok",
                "provider": "gemini",
                "gen_model": self.GEN_MODEL,
                "embed_model": self.EMBED_MODEL,
                "embedding_dim": dim,
            }
        except Exception as exc:
            return {"status": "error", "provider": "gemini", "error": str(exc)}
