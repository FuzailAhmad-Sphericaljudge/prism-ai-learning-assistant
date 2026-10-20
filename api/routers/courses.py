import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

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
async def create_course(
    payload: CourseCreate,
    db: AsyncSession = Depends(get_db),
) -> CourseResponse:
    # Check if course code already exists
    stmt = select(Course).where(Course.code == payload.code)
    existing = (await db.execute(stmt)).scalar_one_or_none()
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
    await db.commit()
    await db.refresh(course)

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
async def list_courses(
    db: AsyncSession = Depends(get_db),
) -> List[CourseResponse]:
    stmt = select(Course).options(selectinload(Course.sources)).order_by(Course.created_at.desc())
    result = await db.execute(stmt)
    courses = result.scalars().all()

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
async def get_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
) -> CourseResponse:
    stmt = select(Course).options(selectinload(Course.sources)).where(Course.id == course_id)
    result = await db.execute(stmt)
    course = result.scalar_one_or_none()

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
