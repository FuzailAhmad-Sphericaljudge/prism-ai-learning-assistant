import os
import sys
import asyncio
import logging
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from sqlalchemy import select
from api.database import SessionLocal
from api.models.user import User
from api.models.course import Course
from api.models.source import Source
from api.models.chunk import Chunk
from api.ingestion.worker import run_ingestion_job

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("prism.scripts.seed_demo")

DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"
DEMO_COURSE_ID = "00000000-0000-0000-0000-000000000002"

DEMO_DATA_DIR = os.path.join(BASE_DIR, "demo-data")

DEMO_SOURCES = [
    {
        "filename": "bst_lecture.vtt",
        "type": "video",
        "title": "Lecture 14: Binary Search Trees (Recording Transcript)",
        "version": 1,
    },
    {
        "filename": "bst_slides.pptx",
        "type": "ppt",
        "title": "Lecture 14: Slide Deck",
        "version": 1,
    },
    {
        "filename": "bst_notes.pdf",
        "type": "pdf",
        "title": "Lecture 14: Course Reading & Invariant Proofs",
        "version": 1,
    },
    {
        "filename": "bst_notes.md",
        "type": "notes",
        "title": "Lecture 14: Summary & Algorithm Reference",
        "version": 1,
    },
]


async def seed():
    logger.info("==================================================")
    logger.info(" PRISM Multi-Modal Demo Ingestion & Database Seed")
    logger.info(" Team The Falcons — Phase 2 Ingestion Pipeline")
    logger.info("==================================================")

    if SessionLocal is None:
        raise RuntimeError("DATABASE_URL is not set or SessionLocal failed to initialize.")

    with SessionLocal() as session:
        # 1. Seed Demo User
        u_stmt = select(User).where(User.id == DEMO_USER_ID)
        user = session.execute(u_stmt).scalar_one_or_none()
        if not user:
            logger.info("Creating demo student user: Alex Mercer (demo-learner@prism.edu)...")
            user = User(
                id=DEMO_USER_ID,
                email="demo-learner@prism.edu",
                name="Alex Mercer",
                role="student",
            )
            session.add(user)
        else:
            logger.info("Demo user already exists.")

        # 2. Seed Demo Course
        c_stmt = select(Course).where(Course.id == DEMO_COURSE_ID)
        course = session.execute(c_stmt).scalar_one_or_none()
        if not course:
            logger.info("Creating demo course: CS-201 Binary Search Trees...")
            course = Course(
                id=DEMO_COURSE_ID,
                code="CS-201",
                title="CS 201: Binary Search Trees & Balanced Structures",
                description="Comprehensive foundations of dynamic ordered sets, BST invariants, traversal proofs, and O(h) complexity bounds.",
                instructor="Dr. Elena Rostova",
                term="Fall 2026",
            )
            session.add(course)
        else:
            logger.info("Demo course already exists.")

        session.commit()

        # 3. Ingest Demo Sources from demo-data/
        for item in DEMO_SOURCES:
            file_path = os.path.join(DEMO_DATA_DIR, item["filename"])
            if not os.path.exists(file_path):
                logger.error(f"Missing demo file: {file_path}")
                continue

            s_stmt = select(Source).where(
                Source.course_id == DEMO_COURSE_ID,
                Source.title == item["title"],
                Source.version == item["version"],
            )
            source = session.execute(s_stmt).scalar_one_or_none()

            if not source:
                logger.info(f"Registering Source: '{item['title']}' ({item['type']})...")
                source = Source(
                    course_id=DEMO_COURSE_ID,
                    type=item["type"],
                    title=item["title"],
                    file_path=str(file_path),
                    version=item["version"],
                    status="pending",
                    meta={"filename": item["filename"]},
                )
                session.add(source)
                session.commit()
                session.refresh(source)
            else:
                logger.info(f"Source already registered: '{item['title']}' (id={source.id}). Re-ingesting...")
                source.file_path = str(file_path)
                source.status = "pending"
                session.commit()

            # Execute background ingestion synchronously for seed script
            logger.info(f"Running ingestion pipeline for source={source.id}...")
            await run_ingestion_job(
                source_id=source.id,
                file_source=str(file_path),
                filename=item["filename"],
            )

        # 4. Final verification & summary
        logger.info("--------------------------------------------------")
        logger.info(" INGESTION AUDIT & VERIFICATION")
        logger.info("--------------------------------------------------")
        sources_stmt = select(Source).where(Source.course_id == DEMO_COURSE_ID)
        all_sources = session.execute(sources_stmt).scalars().all()

        total_chunks = 0
        for s in all_sources:
            c_cnt_stmt = select(Chunk).where(Chunk.source_id == s.id)
            chunks = session.execute(c_cnt_stmt).scalars().all()
            total_chunks += len(chunks)
            logger.info(
                f"Source: {s.title} | Type: {s.type} | Status: {s.status} | Chunks: {len(chunks)} | Duration: {s.duration_sec}s | Pages: {s.page_count}"
            )

        logger.info(f"Total multi-modal chunks indexed with pgvector & GIN: {total_chunks}")
        logger.info("==================================================")
        logger.info(" DEMO SEED COMPLETED SUCCESSFULLY")
        logger.info("==================================================")


if __name__ == "__main__":
    asyncio.run(seed())
