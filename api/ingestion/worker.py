import logging
from typing import Optional, Union
from sqlalchemy import select, delete, func
from api.database import AsyncSessionLocal
from api.models.source import Source
from api.models.chunk import Chunk
from api.parsers import parse_source
from api.chunking import chunk_blocks
from api.ingestion.embedder import generate_chunk_embeddings

logger = logging.getLogger("prism.ingestion.worker")


async def run_ingestion_job(
    source_id: str,
    file_source: Union[str, bytes],
    filename: Optional[str] = None,
) -> None:
    """
    Asynchronous background ingestion pipeline for FastAPI BackgroundTasks.
    Parses multi-modal course sources, chunks by temporal or document boundaries,
    computes 768-dim vector embeddings, and idempotently upserts Chunk records.
    """
    logger.info(f"Starting background ingestion for source={source_id} (file={filename})")

    async with AsyncSessionLocal() as session:
        # 1. Fetch Source record
        stmt = select(Source).where(Source.id == source_id)
        result = await session.execute(stmt)
        source = result.scalar_one_or_none()

        if not source:
            logger.error(f"Ingestion aborted: Source {source_id} not found in database.")
            return

        # 2. Transition status to 'processing'
        source.status = "processing"
        source.error_message = None
        await session.commit()

        try:
            # 3. Parse source content into standardized ParsedBlock units
            blocks = parse_source(
                content_or_path=file_source,
                source_type=source.type,
                filename=filename or source.title,
            )
            logger.info(f"Parsed {len(blocks)} raw blocks from source {source_id}")

            if not blocks:
                logger.warning(f"No content blocks extracted from source {source_id}")
                source.status = "ready"
                source.meta = {**(source.meta or {}), "chunk_count": 0}
                await session.commit()
                return

            # 4. Chunk blocks into retrieval windows
            chunks_data = chunk_blocks(blocks, source.type)
            logger.info(f"Generated {len(chunks_data)} chunks for source {source_id}")

            # 5. Generate 768-dim vector embeddings in batches
            embeddings = await generate_chunk_embeddings(chunks_data, batch_size=32, dimension=768)

            # 6. Idempotent cleanup: delete any existing chunks for this source
            del_stmt = delete(Chunk).where(Chunk.source_id == source_id)
            await session.execute(del_stmt)

            # 7. Insert new Chunk records with PostgreSQL tsvector computation
            chunk_models = []
            max_end_sec = 0.0
            max_page = 0
            max_slide = 0

            for cd, emb in zip(chunks_data, embeddings):
                if cd.end_sec and cd.end_sec > max_end_sec:
                    max_end_sec = cd.end_sec
                if cd.page and cd.page > max_page:
                    max_page = cd.page
                if cd.slide and cd.slide > max_slide:
                    max_slide = cd.slide

                chunk_models.append(
                    Chunk(
                        source_id=source_id,
                        text=cd.text,
                        start_sec=cd.start_sec,
                        end_sec=cd.end_sec,
                        page=cd.page,
                        slide=cd.slide,
                        embedding=emb,
                        tsv=func.to_tsvector("english", cd.text),
                    )
                )

            session.add_all(chunk_models)

            # 8. Update source metadata and mark ready
            if max_end_sec > 0:
                source.duration_sec = round(max_end_sec, 2)
            if max_page > 0:
                source.page_count = max_page
            elif max_slide > 0:
                source.page_count = max_slide

            source.status = "ready"
            source.meta = {
                **(source.meta or {}),
                "chunk_count": len(chunk_models),
                "total_blocks": len(blocks),
            }

            await session.commit()
            logger.info(f"Ingestion succeeded for source {source_id}: {len(chunk_models)} chunks stored.")

        except Exception as exc:
            logger.error(f"Ingestion pipeline failed for source {source_id}: {exc}", exc_info=True)
            await session.rollback()

            # Record failure status
            source.status = "failed"
            source.error_message = str(exc)
            await session.commit()
