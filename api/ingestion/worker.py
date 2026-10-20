import logging
from typing import Optional, Union
from sqlalchemy import select, delete, func
from api.database import SessionLocal
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

    if SessionLocal is None:
        logger.error("SessionLocal is not initialized. Database URL missing.")
        return

    # 1. Fetch Source record and mark 'processing'
    with SessionLocal() as session:
        stmt = select(Source).where(Source.id == source_id)
        source = session.execute(stmt).scalar_one_or_none()

        if not source:
            logger.error(f"Ingestion aborted: Source {source_id} not found in database.")
            return

        source_type = source.type
        source_title = source.title

        source.status = "processing"
        source.error_message = None
        session.commit()

    try:
        # 2. Parse source content into standardized ParsedBlock units
        blocks = parse_source(
            content_or_path=file_source,
            source_type=source_type,
            filename=filename or source_title,
        )
        logger.info(f"Parsed {len(blocks)} raw blocks from source {source_id}")

        if not blocks:
            logger.warning(f"No content blocks extracted from source {source_id}")
            with SessionLocal() as session:
                s = session.execute(select(Source).where(Source.id == source_id)).scalar_one_or_none()
                if s:
                    s.status = "ready"
                    s.meta = {**(s.meta or {}), "chunk_count": 0}
                    session.commit()
            return

        # 3. Chunk blocks into retrieval windows
        chunks_data = chunk_blocks(blocks, source_type)
        logger.info(f"Generated {len(chunks_data)} chunks for source {source_id}")

        # 4. Generate 768-dim vector embeddings in batches
        embeddings = await generate_chunk_embeddings(chunks_data, batch_size=32, dimension=768)

        # 5. Idempotent database upsert
        with SessionLocal() as session:
            # Delete any existing chunks for this source
            del_stmt = delete(Chunk).where(Chunk.source_id == source_id)
            session.execute(del_stmt)

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

            # Update Source status and metadata
            s = session.execute(select(Source).where(Source.id == source_id)).scalar_one_or_none()
            if s:
                if max_end_sec > 0:
                    s.duration_sec = round(max_end_sec, 2)
                if max_page > 0:
                    s.page_count = max_page
                elif max_slide > 0:
                    s.page_count = max_slide

                s.status = "ready"
                s.meta = {
                    **(s.meta or {}),
                    "chunk_count": len(chunk_models),
                    "total_blocks": len(blocks),
                }

            session.commit()
            logger.info(f"Ingestion succeeded for source {source_id}: {len(chunk_models)} chunks stored.")

    except Exception as exc:
        logger.error(f"Ingestion pipeline failed for source {source_id}: {exc}", exc_info=True)
        with SessionLocal() as session:
            s = session.execute(select(Source).where(Source.id == source_id)).scalar_one_or_none()
            if s:
                s.status = "failed"
                s.error_message = str(exc)
                session.commit()
