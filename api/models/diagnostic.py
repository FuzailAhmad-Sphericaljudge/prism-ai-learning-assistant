from sqlalchemy import Column, String, Float, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from api.database import Base
from api.models.base import UUIDMixin, TimestampMixin


class DiagnosticCheck(Base, UUIDMixin, TimestampMixin):
    """
    Diagnostic probes generated after answers to measure conceptual drift.
    """

    __tablename__ = "diagnostic_checks"

    lecture_id = Column(
        ForeignKey("video_lectures.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    trigger_timestamp = Column(Float, nullable=False, index=True)
    concept_name = Column(String(255), nullable=False)
    probe_question = Column(Text, nullable=False)
    options_json = Column(JSON, nullable=True)
    expected_answer = Column(Text, nullable=False)
    rubric_explanation = Column(Text, nullable=True)

    # Relationships
    lecture = relationship("VideoLecture", back_populates="diagnostics")
    records = relationship(
        "MisconceptionRecord", back_populates="diagnostic", cascade="all, delete-orphan"
    )


class MisconceptionRecord(Base, UUIDMixin, TimestampMixin):
    """
    Misconception-to-Mastery progress record for learners.
    """

    __tablename__ = "misconception_records"

    diagnostic_id = Column(
        ForeignKey("diagnostic_checks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    learner_id = Column(String(128), nullable=False, index=True)
    chosen_answer = Column(Text, nullable=False)
    is_correct = Column(Boolean, nullable=False, default=False)
    identified_misconception = Column(Text, nullable=True)
    mastery_score = Column(Float, nullable=False, default=0.0)
    remedial_timestamp = Column(Float, nullable=True)

    # Relationships
    diagnostic = relationship("DiagnosticCheck", back_populates="records")
