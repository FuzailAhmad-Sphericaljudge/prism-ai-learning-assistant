from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class FirewallMode(str, Enum):
    LEARN_SO_FAR = "learn_so_far"
    EXPLORE_AHEAD = "explore_ahead"


class AdmitStatus(str, Enum):
    ADMITTED = "admitted"
    STRADDLING_INTERPOLATED = "straddling_interpolated"
    EXCLUDED_FUTURE = "excluded_future"
    EXCLUDED_RESOURCE_POLICY = "excluded_resource_policy"
    EXCLUDED_MODE_RESET = "excluded_mode_reset"


class ChunkCandidate(BaseModel):
    chunk_id: str
    source_id: str
    source_type: str  # 'video' | 'pdf' | 'ppt' | 'notes'
    text: str
    start_sec: Optional[float] = None
    end_sec: Optional[float] = None
    page: Optional[int] = None
    slide: Optional[int] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class FirewallDecision(BaseModel):
    chunk_id: str
    status: AdmitStatus
    admitted: bool
    permitted_text: str
    original_text: str
    reason: str
    playback_sec: float
    start_sec: Optional[float] = None
    end_sec: Optional[float] = None
    effective_end_sec: Optional[float] = None
    source_type: str = "video"


class SessionPolicy(BaseModel):
    session_id: Optional[str] = None
    user_id: str
    course_id: str
    playback_sec: float = 0.0
    mode: FirewallMode = FirewallMode.LEARN_SO_FAR
    explored_ahead_turn_ids: List[str] = Field(default_factory=list)
