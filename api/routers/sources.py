import os
import shutil
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.database import get_db
from api.models.course import Course
from api.models.source import Source
from api.schemas.source import SourceResponse, SourceStatusResponse
from api.ingestion.worker import run_ingestion_job

logger = logging.getLogger("prism.routers.sources")

# Router mounted at root or /courses and /sources
router = APIRouter(tags=["Sources"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def infer_source_type(filename: str, explicit_type: Optional[str]) -> str:
    if explicit_type and explicit_type.strip() in ("video", "pdf", "ppt", "notes"):
        return explicit_type.strip()
    fn = filename.lower()
    if fn.endswith(".vtt") or fn.endswith(".srt") or fn.endswith(".mp4"):
        return "video"
    elif fn.endswith(".pdf"):
        return "pdf"
    elif fn.endswith(".pptx") or fn.endswith(".ppt"):
        return "ppt"
    elif fn.endswith(".md") or fn.endswith(".txt"):
        return "notes"
    return "notes"


@router.post(
    "/courses/{course_id}/sources",
    response_model=SourceResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Upload and ingest a multi-modal source",
    description="Uploads a lecture video/transcript, PDF textbook, PPTX slide deck, or Markdown notes and schedules background ingestion.",
)
async def upload_source(
    course_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    type: Optional[str] = Form(None),
    version: int = Form(1),
    db: AsyncSession = Depends(get_db),
) -> SourceResponse:
    # 1. Verify course
    c_stmt = select(Course).where(Course.id == course_id)
    course = (await db.execute(c_stmt)).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course '{course_id}' not found.")

    source_type = infer_source_type(file.filename or "", type)
    source_title = (title or file.filename or "Untitled Source").strip()

    # 2. Save uploaded file to persistent storage
    course_upload_dir = os.path.join(UPLOAD_DIR, course_id)
    os.makedirs(course_upload_dir, exist_ok=True)
    destination_path = os.path.join(course_upload_dir, f"v{version}_{file.filename}")

    try:
        with open(destination_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as exc:
        logger.error(f"Failed to save uploaded file: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not persist uploaded file: {exc}",
        )

    # 3. Check for existing source with same (course_id, title, version)
    s_stmt = select(Source).where(
        Source.course_id == course_id,
        Source.title == source_title,
        Source.version == version,
    )
    existing_source = (await db.execute(s_stmt)).scalar_one_or_none()

    if existing_source:
        source = existing_source
        source.file_path = destination_path
        source.type = source_type
        source.status = "pending"
        source.error_message = None
    else:
        source = Source(
            course_id=course_id,
            title=source_title,
            type=source_type,
            file_path=destination_path,
            version=version,
            status="pending",
            meta={"filename": file.filename},
        )
        db.add(source)

    await db.commit()
    await db.refresh(source)

    # 4. Schedule asynchronous background ingestion
    background_tasks.add_task(
        run_ingestion_job,
        source_id=source.id,
        file_source=destination_path,
        filename=file.filename,
    )

    return SourceResponse(
        id=source.id,
        course_id=source.course_id,
        type=source.type,
        title=source.title,
        file_path=source.file_path,
        version=source.version,
        status=source.status,
        error_message=source.error_message,
        duration_sec=source.duration_sec,
        page_count=source.page_count,
        meta=source.meta,
        created_at=source.created_at,
        updated_at=source.updated_at,
    )


@router.get(
    "/sources/{source_id}/status",
    response_model=SourceStatusResponse,
    summary="Get source ingestion progress status",
    description="Polls ingestion state (pending, processing, ready, failed) and chunk count for a source.",
)
async def get_source_status(
    source_id: str,
    db: AsyncSession = Depends(get_db),
) -> SourceStatusResponse:
    s_stmt = select(Source).where(Source.id == source_id)
    source = (await db.execute(s_stmt)).scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Source '{source_id}' not found.")

    # Count generated chunks
    from api.models.chunk import Chunk
    c_stmt = select(func.count(Chunk.id)).where(Chunk.source_id == source_id)
    chunk_count = (await db.execute(c_stmt)).scalar() or 0

    return SourceStatusResponse(
        id=source.id,
        course_id=source.course_id,
        type=source.type,
        title=source.title,
        status=source.status,
        chunk_count=chunk_count,
        duration_sec=source.duration_sec,
        page_count=source.page_count,
        error_message=source.error_message,
        version=source.version,
    )


@router.get(
    "/sources/{source_id}/file",
    summary="Download raw course source file",
    description="Streams original uploaded video/transcript, PDF, PPTX, or notes file.",
)
async def get_source_file(
    source_id: str,
    db: AsyncSession = Depends(get_db),
):
    s_stmt = select(Source).where(Source.id == source_id)
    source = (await db.execute(s_stmt)).scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Source '{source_id}' not found.")

    if not source.file_path or not os.path.exists(source.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found on server storage.")

    media_type_map = {
        "video": "text/vtt" if source.file_path.endswith(".vtt") else "video/mp4",
        "pdf": "application/pdf",
        "ppt": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "notes": "text/markdown",
    }
    media_type = media_type_map.get(source.type, "application/octet-stream")
    filename = os.path.basename(source.file_path)

    return FileResponse(
        path=source.file_path,
        media_type=media_type,
        filename=filename,
    )


