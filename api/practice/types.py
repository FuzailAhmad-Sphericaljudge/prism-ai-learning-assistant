from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from api.schemas.practice import RevisionAction


class MisconceptionRule(BaseModel):
    """
    Diagnostic mapping defining a known cognitive trap, distractor index,
    remedial timestamp, and slide location for targeted revision.
    """
    concept_tag: str
    distractor_index: int  # 1, 2, 3 (when index 0 is correct)
    misconception_tag: str
    diagnosis: str
    remedial_timestamp_sec: float
    remedial_slide: int
    remedial_page: int
    remedial_label: str


class EvaluationResult(BaseModel):
    """
    Deterministic evaluation verdict produced by the PracticeEvaluator.
    """
    is_correct: bool
    score: float
    misconception_tag: Optional[str] = None
    feedback: str
    explanation: str
    revision_action: Optional[RevisionAction] = None
