from typing import Optional, List
from pydantic import BaseModel, Field
from api.firewall.types import FirewallMode
from api.schemas.chat import CitationItem


class RevisionAction(BaseModel):
    """
    Actionable remediation link targeting the exact moment, slide, or page
    in the lecture where the misunderstood concept was originally established.
    """
    type: str = Field(..., json_schema_extra={"example": "video"})
    coordinate: str = Field(..., json_schema_extra={"example": "05:25"})
    timestamp_sec: Optional[float] = Field(None, json_schema_extra={"example": 325.0})
    slide: Optional[int] = Field(None, json_schema_extra={"example": 3})
    page: Optional[int] = Field(None, json_schema_extra={"example": 1})
    label: str = Field(..., json_schema_extra={"example": "Revise Dr. Rostova's explanation at 05:25"})


class PracticeQuestion(BaseModel):
    """
    Practice question derived directly from admitted temporal evidence.
    """
    id: str = Field(..., json_schema_extra={"example": "pq-001"})
    course_id: str = Field(..., json_schema_extra={"example": "00000000-0000-0000-0000-000000000002"})
    concept_tag: str = Field(..., json_schema_extra={"example": "BST Invariant"})
    question_type: str = Field("mcq", json_schema_extra={"example": "mcq"})  # 'mcq' | 'short_answer'
    question_text: str = Field(..., json_schema_extra={"example": "What distinguishes a BST invariant from a heap property?"})
    options: Optional[List[str]] = Field(
        None,
        json_schema_extra={
            "example": [
                "BST enforces left < root <= right globally; heap enforces parent-child order only",
                "Heap requires keys to be strictly unique, while BST does not",
                "BST can only store integer keys",
                "Heap search runs in O(1) time",
            ]
        },
    )
    correct_answer: str = Field(..., json_schema_extra={"example": "A"})
    correct_index: Optional[int] = Field(0, json_schema_extra={"example": 0})
    explanation: str = Field(
        ...,
        json_schema_extra={"example": "The BST property is global across all left and right descendants; heaps only enforce local parent-child dominance."},
    )
    evidence_links: List[CitationItem] = Field(default_factory=list)


class PracticeGenerateRequest(BaseModel):
    """
    Request payload to generate practice questions grounded in verified evidence.
    """
    course_id: str = Field(..., json_schema_extra={"example": "00000000-0000-0000-0000-000000000002"})
    playback_sec: Optional[float] = Field(None, ge=0.0, json_schema_extra={"example": 700.0})
    mode: FirewallMode = Field(FirewallMode.LEARN_SO_FAR, json_schema_extra={"example": "learn_so_far"})
    concept_tag: Optional[str] = Field(None, json_schema_extra={"example": "BST Invariant"})
    question_type: Optional[str] = Field("mcq", json_schema_extra={"example": "mcq"})  # 'mcq' | 'short_answer' | 'all'
    count: int = Field(1, ge=1, le=10, json_schema_extra={"example": 1})


class PracticeGenerateResponse(BaseModel):
    course_id: str
    playback_sec: Optional[float] = None
    mode: FirewallMode
    questions: List[PracticeQuestion] = Field(default_factory=list)
    available_concepts: List[str] = Field(default_factory=list)


class AttemptSubmitRequest(BaseModel):
    """
    Submission of a student's answer for evaluation and mastery recording.
    """
    question_id: str = Field(..., json_schema_extra={"example": "pq-001"})
    course_id: str = Field(..., json_schema_extra={"example": "00000000-0000-0000-0000-000000000002"})
    user_id: Optional[str] = Field("00000000-0000-0000-0000-000000000001")
    session_id: Optional[str] = None
    concept_tag: str = Field(..., json_schema_extra={"example": "BST Invariant"})
    question_text: str = Field(..., json_schema_extra={"example": "What distinguishes a BST invariant from a heap property?"})
    question_type: str = Field("mcq", json_schema_extra={"example": "mcq"})
    user_answer: str = Field(..., json_schema_extra={"example": "A"})
    playback_sec: Optional[float] = None


class AttemptSubmitResponse(BaseModel):
    """
    Evaluation feedback containing correctness, misconception diagnostic,
    remedial jump link, and updated derived mastery status.
    """
    attempt_id: str
    is_correct: bool
    score: float
    misconception_tag: Optional[str] = None
    feedback: str
    explanation: str
    revision_action: Optional[RevisionAction] = None
    linked_evidence: List[CitationItem] = Field(default_factory=list)
    concept_tag: str
    updated_mastery_status: str  # "not_assessed" | "gap_found" | "improving" | "demonstrated"
    updated_mastery_score: float
