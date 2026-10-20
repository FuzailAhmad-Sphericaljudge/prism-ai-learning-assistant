from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from api.schemas.practice import RevisionAction
from api.schemas.chat import CitationItem


class ConceptMastery(BaseModel):
    """
    Assessed mastery metrics for a single curricular concept.
    Derived strictly from attempt history, never speculative.
    """
    concept_tag: str = Field(..., json_schema_extra={"example": "BST Invariant"})
    status: str = Field(..., json_schema_extra={"example": "demonstrated"})  # "not_assessed" | "gap_found" | "improving" | "demonstrated"
    mastery_score: float = Field(0.0, ge=0.0, le=1.0, json_schema_extra={"example": 0.92})
    attempts_count: int = Field(0, ge=0, json_schema_extra={"example": 4})
    correct_count: int = Field(0, ge=0, json_schema_extra={"example": 3})
    misconceptions: List[str] = Field(default_factory=list, json_schema_extra={"example": ["Local Parent-Child Fallacy"]})
    last_assessed_at: Optional[datetime] = None
    evidence_landmarks: List[str] = Field(default_factory=list, json_schema_extra={"example": ["05:25", "Slide 3", "p. 1"]})


class NextBestAction(BaseModel):
    """
    Actionable next pedagogical step recommended by the system,
    prioritizing active gaps, followed by unassessed core prerequisites.
    """
    concept_tag: str = Field(..., json_schema_extra={"example": "In-Order Successor"})
    reason: str = Field(..., json_schema_extra={"example": "Active gap detected: missed ancestor traversal case in last attempt"})
    recommended_type: str = Field("revise", json_schema_extra={"example": "revise"})  # 'revise' | 'practice' | 'explore'
    action_url: str = Field(..., json_schema_extra={"example": "/learn/00000000-0000-0000-0000-000000000002?t=1015"})
    coordinate: Optional[str] = Field(None, json_schema_extra={"example": "16:55"})
    label: str = Field(..., json_schema_extra={"example": "Revise In-Order Successor at 16:55 in Video"})


class MasteryDashboardResponse(BaseModel):
    """
    Full mastery dashboard response for a student in a course.
    """
    course_id: str
    user_id: str
    total_concepts: int
    assessed_concepts: int
    demonstrated_count: int
    improving_count: int
    gap_count: int
    unassessed_count: int
    overall_mastery_percentage: float  # Percentage across ASSESSED concepts only
    concepts: List[ConceptMastery] = Field(default_factory=list)
    next_best_action: Optional[NextBestAction] = None


class TimelineAttemptItem(BaseModel):
    """
    Chronological ledger entry of an assessed student attempt.
    """
    id: str
    concept_tag: str
    question_text: str
    user_answer: str
    is_correct: bool
    misconception_tag: Optional[str] = None
    feedback: Optional[str] = None
    explanation: Optional[str] = None
    created_at: datetime
    revision_action: Optional[RevisionAction] = None
    linked_evidence: List[CitationItem] = Field(default_factory=list)


class MasteryTimelineResponse(BaseModel):
    """
    Audit trail of evidence-backed attempts for the mastery timeline.
    """
    course_id: str
    user_id: str
    total_attempts: int
    timeline: List[TimelineAttemptItem] = Field(default_factory=list)
