from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class ConfusionHeatmapBucket(BaseModel):
    """
    Temporal bucket aggregating learner friction along the lecture video timeline.
    """
    bucket_index: int
    start_sec: float
    end_sec: float
    coordinate_label: str  # e.g., "04:00 - 06:00"
    query_count: int = 0
    misconception_count: int = 0
    confusion_intensity: float = Field(0.0, ge=0.0, le=1.0)  # Normalized 0.0 to 1.0
    most_confused_topic: str = "General"


class TopMisconceptionItem(BaseModel):
    misconception_tag: str
    concept_tag: str
    occurrences: int
    prevalence_percentage: float
    landmark_coordinate: str
    remediation_action: str


class TopQuestionItem(BaseModel):
    question: str
    occurrences: int
    concept_tag: str
    playback_coordinate: str
    timestamp_sec: float


class ConceptMasteryDistribution(BaseModel):
    concept_tag: str
    demonstrated_count: int
    improving_count: int
    gap_count: int
    unassessed_count: int
    average_score: float


class EducatorInsightsResponse(BaseModel):
    """
    Aggregated educator analytics dashboard payload identifying friction points,
    temporal confusion hot-spots, and recurring cognitive gaps.
    """
    course_id: str
    total_questions_asked: int
    total_practice_attempts: int
    total_interviews: int
    active_students: int
    avg_course_mastery_percentage: float
    confusion_heatmap: List[ConfusionHeatmapBucket] = Field(default_factory=list)
    top_misconceptions: List[TopMisconceptionItem] = Field(default_factory=list)
    top_questions: List[TopQuestionItem] = Field(default_factory=list)
    concept_distributions: List[ConceptMasteryDistribution] = Field(default_factory=list)
