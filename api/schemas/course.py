from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from api.schemas.source import SourceResponse


class CourseCreate(BaseModel):
    title: str = Field(..., example="Introduction to Data Structures & Algorithms")
    code: str = Field(..., example="CS-201")
    description: Optional[str] = Field(None, example="Comprehensive foundations of trees, graphs, and algorithmic complexity.")
    instructor: Optional[str] = Field("Faculty Instructor", example="Dr. Elena Rostova")
    term: Optional[str] = Field("Fall 2026", example="Fall 2026")


class CourseResponse(BaseModel):
    id: str
    title: str
    code: str
    description: Optional[str] = None
    instructor: str
    term: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    source_count: Optional[int] = 0

    class Config:
        from_attributes = True


class TranscriptCueResponse(BaseModel):
    text: str
    start_sec: float
    end_sec: float
    speaker: Optional[str] = None


class CourseTranscriptResponse(BaseModel):
    course_id: str
    source_id: Optional[str] = None
    source_title: Optional[str] = None
    total_cues: int
    duration_sec: Optional[float] = None
    max_time_sec: Optional[float] = None
    cues: List[TranscriptCueResponse]


class CourseResourcesResponse(BaseModel):
    course_id: str
    total_sources: int
    resources: Dict[str, List[SourceResponse]]
