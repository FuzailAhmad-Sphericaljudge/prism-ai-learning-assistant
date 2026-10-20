from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from api.firewall.types import FirewallMode


class SessionCreate(BaseModel):
    course_id: str = Field(..., json_schema_extra={"example": "00000000-0000-0000-0000-000000000002"})
    user_id: Optional[str] = Field("00000000-0000-0000-0000-000000000001", json_schema_extra={"example": "00000000-0000-0000-0000-000000000001"})
    playback_sec: float = Field(0.0, ge=0.0, json_schema_extra={"example": 1122.0})
    mode: FirewallMode = Field(FirewallMode.LEARN_SO_FAR, json_schema_extra={"example": "learn_so_far"})
    title: Optional[str] = Field("Interactive Lecture Session", json_schema_extra={"example": "BST Lecture 14 Session"})


class SessionPlaybackPatch(BaseModel):
    playback_sec: float = Field(..., ge=0.0, json_schema_extra={"example": 1122.0})
    mode: Optional[FirewallMode] = Field(None, json_schema_extra={"example": "learn_so_far"})


class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    course_id: str
    current_playback_sec: float
    mode: str
    title: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
