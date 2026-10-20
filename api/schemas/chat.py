from typing import Optional, List
from pydantic import BaseModel, Field
from api.firewall.types import FirewallMode


class DiagnosticCheck(BaseModel):
    """
    Diagnostic self-check question generated alongside the tutor explanation
    to test the learner's immediate understanding of the grounded concept.
    """
    question: str = Field(..., json_schema_extra={"example": "Why does searching a binary search tree take O(h) time?"})
    options: List[str] = Field(
        ...,
        json_schema_extra={
            "example": [
                "Because each step discards half the remaining nodes along a root-to-leaf path",
                "Because it checks every node in the tree linearly",
                "Because tree height is always strictly O(1)",
                "Because insertions always keep the tree completely full",
            ]
        },
    )
    correct_index: int = Field(0, ge=0, le=3, json_schema_extra={"example": 0})
    explanation: str = Field(
        ...,
        json_schema_extra={"example": "Search traces a single root-to-leaf path touching at most h+1 nodes."},
    )


class CitationItem(BaseModel):
    evidence_id: str = Field(..., json_schema_extra={"example": "E1"})
    chunk_id: str
    source_type: str = Field(..., json_schema_extra={"example": "video"})
    coordinate: str = Field(..., json_schema_extra={"example": "16:30 - 18:00"})
    quote: str
    start_sec: Optional[float] = None
    end_sec: Optional[float] = None
    slide: Optional[int] = None
    page: Optional[int] = None


class ChatRequest(BaseModel):
    query: str = Field(..., json_schema_extra={"example": "What is the binary search tree property?"})
    course_id: str = Field(..., json_schema_extra={"example": "00000000-0000-0000-0000-000000000002"})
    playback_sec: float = Field(..., ge=0.0, json_schema_extra={"example": 1122.0})
    mode: FirewallMode = Field(FirewallMode.LEARN_SO_FAR, json_schema_extra={"example": "learn_so_far"})
    session_id: Optional[str] = Field(None, json_schema_extra={"example": "00000000-0000-0000-0000-000000000010"})
    user_id: Optional[str] = Field("00000000-0000-0000-0000-000000000001")


class ChatResponse(BaseModel):
    answer: str
    citations: List[CitationItem] = Field(default_factory=list)
    check: Optional[DiagnosticCheck] = None
    is_not_covered: bool = False
    not_covered_topic: Optional[str] = None
    available_at_sec: Optional[float] = None
    session_id: Optional[str] = None
    message_id: Optional[str] = None
    validation_passed: bool = True
