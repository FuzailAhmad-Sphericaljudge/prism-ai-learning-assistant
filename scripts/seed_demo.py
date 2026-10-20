#!/usr/bin/env python3
"""
PRISM Demo Data Seeding Script
Populates a sample video lecture with synced transcripts, slides, notes, and embeddings.
"""

import sys
import asyncio
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))
load_dotenv(ROOT_DIR / "api" / ".env")
load_dotenv(ROOT_DIR / ".env")

from api.database import SessionLocal
from api.models import VideoLecture, DocumentChunk, DiagnosticCheck
from api.providers import get_provider


async def seed_data():
    print("==================================================")
    print("  Seeding PRISM Demo Lecture & Multimodal Chunks")
    print("==================================================")

    if SessionLocal is None:
        print("[FAIL] Database SessionLocal not configured.")
        return

    db = SessionLocal()
    provider = get_provider()
    print(f"Using provider: {provider.name}")

    try:
        # Check if already seeded
        existing = db.query(VideoLecture).filter_by(title="Transformer Attention Mechanics").first()
        if existing:
            print("Demo lecture already exists. Skipping.")
            return

        # 1. Create Video Lecture
        lecture = VideoLecture(
            title="Transformer Attention Mechanics",
            description="Deep dive into Query, Key, Value transformations and scaled dot-product attention.",
            video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            duration_seconds=600.0,
            course_name="CS301: Deep Sequence Models",
            topic="Attention Mechanisms",
        )
        db.add(lecture)
        db.flush()

        chunks_data = [
            {
                "chunk_type": "transcript",
                "start_time": 0.0,
                "end_time": 45.0,
                "title": "Introduction to Attention",
                "content": "Welcome to lecture four. Today we introduce the transformer attention mechanism and contrast it with recurrent neural networks.",
            },
            {
                "chunk_type": "transcript",
                "start_time": 45.0,
                "end_time": 150.0,
                "title": "Query-Key Dot Product",
                "content": "The query matrix Q and key matrix K are multiplied using a dot product to compute unnormalized affinity scores across all sequence tokens.",
            },
            {
                "chunk_type": "slide",
                "start_time": 45.0,
                "end_time": 150.0,
                "slide_number": 4,
                "title": "Slide 4: Scaled Dot-Product Formulation",
                "content": "Formula: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) V. Matrix dimensions must match on key dimension d_k.",
            },
            {
                "chunk_type": "page",
                "start_time": 0.0,
                "end_time": 300.0,
                "page_number": 7,
                "title": "Course Notes Page 7",
                "content": "Why scale by sqrt(d_k)? For large values of d_k, the dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients.",
            },
        ]

        for item in chunks_data:
            print(f"Generating embedding for '{item['title']}'...")
            emb_res = await provider.generate_embedding(item["content"])
            chunk = DocumentChunk(
                lecture_id=lecture.id,
                chunk_type=item["chunk_type"],
                start_time=item.get("start_time"),
                end_time=item.get("end_time"),
                slide_number=item.get("slide_number"),
                page_number=item.get("page_number"),
                title=item["title"],
                content=item["content"],
                embedding=emb_res.embedding,
            )
            db.add(chunk)

        # 3. Add Diagnostic Check
        diagnostic = DiagnosticCheck(
            lecture_id=lecture.id,
            trigger_timestamp=150.0,
            concept_name="Scaling Factor in Attention",
            probe_question="Why do we divide QK^T by sqrt(d_k) before taking softmax?",
            options_json=[
                "To reduce memory usage in backpropagation",
                "To prevent vanishing gradients when dot products become very large",
                "To ensure the resulting matrix is symmetric",
                "To speed up matrix multiplication hardware",
            ],
            expected_answer="To prevent vanishing gradients when dot products become very large",
            rubric_explanation="For large d_k, dot products grow large, pushing softmax into saturation where gradients are near zero.",
        )
        db.add(diagnostic)

        db.commit()
        print("--------------------------------------------------")
        print("SUCCESS: Demo lecture and chunks seeded! [OK]")
    except Exception as exc:
        db.rollback()
        print(f"[FAIL] Error seeding demo data: {exc}")
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(seed_data())
