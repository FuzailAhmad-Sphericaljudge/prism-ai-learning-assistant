import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.orm import Session, selectinload

from api.database import get_db
from api.models.course import Course
from api.models.source import Source
from api.models.chunk import Chunk
from api.schemas.course import (
    CourseCreate,
    CourseResponse,
    CourseTranscriptResponse,
    CourseResourcesResponse,
    TranscriptCueResponse,
)
from api.schemas.source import SourceResponse

logger = logging.getLogger("prism.routers.courses")
router = APIRouter(prefix="/courses", tags=["Courses"])


@router.post(
    "",
    response_model=CourseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new course",
    description="Registers a new academic course or lecture series.",
)
def create_course(
    payload: CourseCreate,
    db: Session = Depends(get_db),
) -> CourseResponse:
    # Check if course code already exists
    stmt = select(Course).where(Course.code == payload.code)
    existing = db.execute(stmt).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Course with code '{payload.code}' already exists.",
        )

    course = Course(
        title=payload.title,
        code=payload.code,
        description=payload.description,
        instructor=payload.instructor or "Faculty Instructor",
        term=payload.term or "Fall 2026",
    )
    db.add(course)
    db.commit()
    db.refresh(course)

    return CourseResponse(
        id=course.id,
        title=course.title,
        code=course.code,
        description=course.description,
        instructor=course.instructor,
        term=course.term,
        created_at=course.created_at,
        updated_at=course.updated_at,
        source_count=0,
    )


@router.get(
    "",
    response_model=List[CourseResponse],
    summary="List all courses",
    description="Returns all registered courses with active multi-modal source counts.",
)
def list_courses(
    db: Session = Depends(get_db),
) -> List[CourseResponse]:
    stmt = select(Course).options(selectinload(Course.sources)).order_by(Course.created_at.desc())
    courses = db.execute(stmt).scalars().all()

    return [
        CourseResponse(
            id=c.id,
            title=c.title,
            code=c.code,
            description=c.description,
            instructor=c.instructor,
            term=c.term,
            created_at=c.created_at,
            updated_at=c.updated_at,
            source_count=len(c.sources),
        )
        for c in courses
    ]


@router.get(
    "/{course_id}",
    response_model=CourseResponse,
    summary="Get course by ID",
    description="Retrieves course metadata and ingested source count.",
)
def get_course(
    course_id: str,
    db: Session = Depends(get_db),
) -> CourseResponse:
    stmt = select(Course).options(selectinload(Course.sources)).where(Course.id == course_id)
    course = db.execute(stmt).scalar_one_or_none()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course '{course_id}' not found.",
        )

    return CourseResponse(
        id=course.id,
        title=course.title,
        code=course.code,
        description=course.description,
        instructor=course.instructor,
        term=course.term,
        created_at=course.created_at,
        updated_at=course.updated_at,
        source_count=len(course.sources),
    )


@router.get(
    "/{course_id}/transcript",
    response_model=CourseTranscriptResponse,
    summary="Get lecture transcript with Temporal Firewall boundary filtering",
    description="Returns ordered transcript cues. If max_time_sec is passed, enforces temporal boundary cutoff and partial boundary truncation.",
)
def get_course_transcript(
    course_id: str,
    max_time_sec: Optional[float] = Query(None, description="Optional temporal cutoff in seconds"),
    db: Session = Depends(get_db),
) -> CourseTranscriptResponse:
    # 1. Verify course existence
    c_stmt = select(Course).where(Course.id == course_id)
    course = db.execute(c_stmt).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course '{course_id}' not found.")

    # 2. Find video/transcript source
    s_stmt = (
        select(Source)
        .where(Source.course_id == course_id, Source.type.in_(["video", "transcript"]))
        .order_by(Source.version.desc())
    )
    source = db.execute(s_stmt).scalars().first()

    if not source:
        return CourseTranscriptResponse(
            course_id=course_id,
            source_id=None,
            source_title=None,
            total_cues=0,
            duration_sec=0.0,
            max_time_sec=max_time_sec,
            cues=[],
        )

    # 3. Retrieve chunks with timestamps
    q_chunks = (
        select(Chunk)
        .where(Chunk.source_id == source.id, Chunk.start_sec.isnot(None))
        .order_by(Chunk.start_sec.asc())
    )
    chunks = db.execute(q_chunks).scalars().all()

    cues: List[TranscriptCueResponse] = []
    for c in chunks:
        start_sec = c.start_sec or 0.0
        end_sec = c.end_sec or start_sec

        # Temporal firewall cutoff: ignore any chunk starting strictly after max_time_sec
        if max_time_sec is not None and start_sec > max_time_sec:
            continue

        # Boundary condition: if chunk spans across max_time_sec, truncate end_sec to max_time_sec
        effective_end = end_sec
        if max_time_sec is not None and end_sec > max_time_sec:
            effective_end = max_time_sec

        cues.append(
            TranscriptCueResponse(
                text=c.text,
                start_sec=start_sec,
                end_sec=effective_end,
                speaker=None,
            )
        )

    return CourseTranscriptResponse(
        course_id=course_id,
        source_id=source.id,
        source_title=source.title,
        total_cues=len(cues),
        duration_sec=source.duration_sec or (chunks[-1].end_sec if chunks else 0.0),
        max_time_sec=max_time_sec,
        cues=cues,
    )


@router.get(
    "/{course_id}/resources",
    response_model=CourseResourcesResponse,
    summary="Get multi-modal course resources",
    description="Returns all ingested sources grouped by modality (video, pdf, ppt, notes) with ingestion status.",
)
def get_course_resources(
    course_id: str,
    db: Session = Depends(get_db),
) -> CourseResourcesResponse:
    # 1. Verify course
    c_stmt = select(Course).where(Course.id == course_id)
    course = db.execute(c_stmt).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course '{course_id}' not found.")

    # 2. Query sources
    s_stmt = select(Source).where(Source.course_id == course_id).order_by(Source.created_at.asc())
    sources = db.execute(s_stmt).scalars().all()

    grouped: dict = {"video": [], "pdf": [], "ppt": [], "notes": []}
    for s in sources:
        stype = s.type if s.type in grouped else "notes"
        grouped[stype].append(
            SourceResponse(
                id=s.id,
                course_id=s.course_id,
                type=s.type,
                title=s.title,
                file_path=s.file_path,
                version=s.version,
                status=s.status,
                error_message=s.error_message,
                duration_sec=s.duration_sec,
                page_count=s.page_count,
                meta=s.meta,
                created_at=s.created_at,
                updated_at=s.updated_at,
            )
        )

    return CourseResourcesResponse(
        course_id=course_id,
        total_sources=len(sources),
        resources=grouped,
    )
