import logging
from typing import List
from api.chunking.base import ChunkData
from api.providers.factory import get_provider

logger = logging.getLogger("prism.ingestion.embedder")


async def generate_chunk_embeddings(
    chunks: List[ChunkData], batch_size: int = 32, dimension: int = 768
) -> List[List[float]]:
    """
    Generates 768-dimensional dense vector embeddings for a list of ChunkData items in batches.
    Uses the active LLMProvider adapter (Gemini in production, Mock in offline/eval).
    """
    if not chunks:
        return []

    provider = get_provider()
    texts = [c.text for c in chunks]
    all_embeddings: List[List[float]] = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        try:
            embs = await provider.embed(batch, dimension=dimension)
            all_embeddings.extend(embs)
        except Exception as exc:
            logger.error(f"Failed to generate embeddings for batch {i}..{i+len(batch)}: {exc}")
            raise

    return all_embeddings
