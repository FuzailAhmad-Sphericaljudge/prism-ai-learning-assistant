from typing import Optional, List
from pydantic import BaseModel, Field
from api.firewall.types import FirewallMode


class RetrieveDebugRequest(BaseModel):
    query: str = Field(..., json_schema_extra={"example": "What is the binary search tree property?"})
    course_id: str = Field(..., json_schema_extra={"example": "00000000-0000-0000-0000-000000000002"})
    playback_sec: float = Field(..., ge=0.0, json_schema_extra={"example": 1122.0})
    mode: FirewallMode = Field(FirewallMode.LEARN_SO_FAR, json_schema_extra={"example": "learn_so_far"})
    top_k: int = Field(5, ge=1, le=25, json_schema_extra={"example": 5})


class AdmittedChunkDebug(BaseModel):
    chunk_id: str
    source_id: str
    source_type: str
    text: str
    start_sec: Optional[float] = None
    end_sec: Optional[float] = None
    page: Optional[int] = None
    slide: Optional[int] = None
    similarity_score: Optional[float] = None
    status: str
    reason: str


class BlockedChunkDebug(BaseModel):
    chunk_id: str
    source_id: str
    source_type: str
    start_sec: Optional[float] = None
    end_sec: Optional[float] = None
    page: Optional[int] = None
    slide: Optional[int] = None
    status: str
    reason: str


class RetrieveDebugResponse(BaseModel):
    query: str
    course_id: str
    playback_sec: float
    mode: str
    admitted_count: int
    blocked_count: int
    admitted: List[AdmittedChunkDebug]
    blocked: List[BlockedChunkDebug]
    scoped_prompt_preview: str
