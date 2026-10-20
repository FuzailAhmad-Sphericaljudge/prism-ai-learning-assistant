from sqlalchemy import Column, String, Float, Integer, Text, ForeignKey, JSON, Boolean, DateTime
from sqlalchemy.orm import relationship
from api.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Attempt(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Practice & diagnostic probe attempt executed by a student.
    Captures exact answer, correctness, detected misconception category,
    linked evidence, and revision action.
    """
    __tablename__ = "attempts"

    session_id = Column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=True, index=True)
    diagnostic_id = Column(String(100), nullable=True, index=True)
    concept_tag = Column(String(255), nullable=True, index=True)
    question_type = Column(String(50), nullable=False, default="mcq")  # 'mcq' | 'short_answer'
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=True)
    user_answer = Column(Text, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    misconception_tag = Column(String(100), nullable=True, index=True)
    feedback = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    revision_action = Column(JSON, nullable=True)
    linked_evidence = Column(JSON, nullable=True, default=list)

    # Relationships
    session = relationship("Session", back_populates="attempts")
    user = relationship("User", backref="attempts")
    course = relationship("Course", backref="attempts")

    def __repr__(self) -> str:
        return f"<Attempt(id={self.id}, concept='{self.concept_tag}', correct={self.is_correct})>"


class MasteryRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Longitudinal mastery tracking per student per course concept.
    Stores ASSESSED evidence only (attempts, correctness, misconception text, linked evidence),
    never guessed percentages.
    """
    __tablename__ = "mastery_records"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    concept = Column(String(255), nullable=False, index=True)
    status = Column(String(50), nullable=False, default="not_assessed", index=True)  # "not_assessed" | "gap_found" | "improving" | "demonstrated"
    mastery_score = Column(Float, nullable=False, default=0.0)  # 0.0 to 1.0 (derived from attempt history)
    attempts_count = Column(Integer, nullable=False, default=0)
    correct_count = Column(Integer, nullable=False, default=0)
    misconceptions = Column(JSON, nullable=True, default=list)
    last_assessed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="mastery_records")
    course = relationship("Course", back_populates="mastery_records")

    def __repr__(self) -> str:
        return f"<MasteryRecord(user={self.user_id}, concept='{self.concept}', status='{self.status}', score={self.mastery_score})>"
