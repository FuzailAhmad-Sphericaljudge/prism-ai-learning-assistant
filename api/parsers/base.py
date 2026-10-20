from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class ParsedBlock(BaseModel):
    """
    Standardized parsed content unit extracted from multi-modal course materials.
    Preserves exact temporal coordinates (start_sec, end_sec) or spatial coordinates (page, slide).
    """
    text: str = Field(..., description="Cleaned textual content of this block")
    start_sec: Optional[float] = Field(None, description="Start timestamp in seconds (for video/audio/transcripts)")
    end_sec: Optional[float] = Field(None, description="End timestamp in seconds (for video/audio/transcripts)")
    page: Optional[int] = Field(None, description="1-based page number (for PDF / document sources)")
    slide: Optional[int] = Field(None, description="1-based slide number (for PPTX presentations)")
    speaker: Optional[str] = Field(None, description="Speaker identifier if indicated in transcript cues")
    notes: Optional[str] = Field(None, description="Presenter or speaker notes attached to this slide/section")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional source-specific extraction metadata")


class ParsedDocument(BaseModel):
    """
    Container for all parsed blocks extracted from a source file.
    """
    source_type: str
    total_blocks: int
    blocks: List[ParsedBlock]
    metadata: Dict[str, Any] = Field(default_factory=dict)
