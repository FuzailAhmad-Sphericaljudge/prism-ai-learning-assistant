from typing import Optional, Dict, Any
import uuid
from pydantic import BaseModel, Field


class ChunkData(BaseModel):
    """
    Normalized chunk payload ready for dense vector embedding and database insertion.
    Preserves exact temporal bounds [start_sec, end_sec] or structural coordinates (page, slide).
    """
    text: str = Field(..., description="Chunk text content for semantic embedding & tsvector indexing")
    start_sec: Optional[float] = Field(None, description="Start boundary timestamp in seconds")
    end_sec: Optional[float] = Field(None, description="End boundary timestamp in seconds")
    page: Optional[int] = Field(None, description="Document page number")
    slide: Optional[int] = Field(None, description="Presentation slide number")
    chunk_index: int = Field(0, description="Sequential index within the source")
    metadata: Dict[str, Any] = Field(default_factory=dict)
