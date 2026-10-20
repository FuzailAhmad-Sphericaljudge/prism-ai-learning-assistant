from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from api.schemas.chat import CitationItem
from api.schemas.practice import RevisionAction


class RubricCriterion(BaseModel):
    """
    Individual evaluation criterion derived from verified course evidence.
    """
    id: str = Field(..., json_schema_extra={"example": "crit-01"})
    name: str = Field(..., json_schema_extra={"example": "BST Invariant & Ancestral Property"})
    description: str = Field(..., json_schema_extra={"example": "Demonstrates that BST invariant holds ancestrally across all descendants, not merely immediate children."})
    weight: float = Field(1.0, ge=0.1, le=5.0, json_schema_extra={"example": 1.0})
    expected_points: List[str] = Field(
        default_factory=list,
        json_schema_extra={
            "example": [
                "Left subtree keys strictly less than root",
                "Right subtree keys greater than or equal to root",
                "Recursive ancestral property across all descendants",
            ]
        },
    )
    linked_evidence: List[CitationItem] = Field(default_factory=list)
    score: Optional[float] = Field(None, ge=0.0, le=100.0)
    justification: Optional[str] = None


class InterviewRubric(BaseModel):
    criteria: List[RubricCriterion] = Field(default_factory=list)
    passing_score: float = Field(70.0, json_schema_extra={"example": 70.0})


class InterviewStartRequest(BaseModel):
    course_id: str = Field("00000000-0000-0000-0000-000000000002")
    user_id: Optional[str] = Field("00000000-0000-0000-0000-000000000001")
    role: str = Field(
        "Algorithm & Systems Engineer",
        json_schema_extra={"example": "Algorithm & Systems Engineer"},
    )
    topic: str = Field(
        "Binary Search Trees & Structural Invariants",
        json_schema_extra={"example": "Binary Search Trees & Structural Invariants"},
    )
    max_rounds: int = Field(3, ge=2, le=6, json_schema_extra={"example": 3})


class InterviewStartResponse(BaseModel):
    session_id: str
    course_id: str
    user_id: str
    role: str
    topic: str
    current_round: int
    max_rounds: int
    initial_question: str
    rubric: List[RubricCriterion]
    status: str = "in_progress"


class TurnEvaluation(BaseModel):
    criterion_id: str
    criterion_name: str
    score: float  # 0.0 to 100.0
    justification: str
    missed_points: List[str] = Field(default_factory=list)
    demonstrated_points: List[str] = Field(default_factory=list)


class InterviewTurnRequest(BaseModel):
    session_id: str
    user_answer: str = Field(..., min_length=1, json_schema_extra={"example": "The BST invariant ensures every node in the left subtree is less than the root."})


class InterviewTurnResponse(BaseModel):
    session_id: str
    round_number: int
    max_rounds: int
    is_completed: bool
    evaluation: Optional[TurnEvaluation] = None
    rubric: List[RubricCriterion] = Field(default_factory=list)
    next_question: Optional[str] = None
    justification: Optional[str] = None  # Reason for the specific follow-up question
    feedback: Optional[str] = None


class CriterionReport(BaseModel):
    criterion_id: str
    name: str
    score: float
    weight: float
    justification: str
    linked_evidence: List[CitationItem] = Field(default_factory=list)


class InterviewReportResponse(BaseModel):
    session_id: str
    course_id: str
    user_id: str
    role: str
    topic: str
    status: str
    overall_score: float  # 0.0 to 100.0
    criteria_scores: List[CriterionReport] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    gaps: List[str] = Field(default_factory=list)
    revision_links: List[RevisionAction] = Field(default_factory=list)
    transcript: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
