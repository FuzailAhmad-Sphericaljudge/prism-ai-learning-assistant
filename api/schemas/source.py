from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class SourceCreate(BaseModel):
    type: str = Field(..., description="Source medium type: video | pdf | ppt | notes")
    title: str = Field(..., description="Human-readable title or lecture topic")
    version: Optional[int] = Field(1, description="Sequential document version for idempotent upgrades")
    meta: Optional[Dict[str, Any]] = Field(default_factory=dict)


class SourceResponse(BaseModel):
    id: str
    course_id: str
    type: str
    title: str
    file_path: Optional[str] = None
    version: int
    status: str
    error_message: Optional[str] = None
    duration_sec: Optional[float] = None
    page_count: Optional[int] = None
    meta: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SourceStatusResponse(BaseModel):
    id: str
    course_id: str
    type: str
    title: str
    status: str
    chunk_count: int
    duration_sec: Optional[float] = None
    page_count: Optional[int] = None
    error_message: Optional[str] = None
    version: int
