from sqlalchemy import Column, String, Float, Integer, Text, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from api.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Attempt(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Diagnostic probe attempt executed by a student following an explanation.
    Captures exact answer, correctness, and detected misconception category.
    """
    __tablename__ = "attempts"

    session_id = Column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    diagnostic_id = Column(String(100), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    user_answer = Column(Text, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    misconception_tag = Column(String(100), nullable=True, index=True)
    explanation = Column(Text, nullable=True)

    # Relationships
    session = relationship("Session", back_populates="attempts")

    def __repr__(self) -> str:
        return f"<Attempt(id={self.id}, diagnostic={self.diagnostic_id}, correct={self.is_correct})>"


class MasteryRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Longitudinal mastery tracking per student per course concept.
    Stores the Misconception-to-Mastery progression.
    """
    __tablename__ = "mastery_records"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    concept = Column(String(255), nullable=False, index=True)
    mastery_score = Column(Float, nullable=False, default=0.0)  # 0.0 to 1.0
    attempts_count = Column(Integer, nullable=False, default=0)
    misconceptions = Column(JSON, nullable=True, default=list)

    # Relationships
    user = relationship("User", back_populates="mastery_records")
    course = relationship("Course", back_populates="mastery_records")

    def __repr__(self) -> str:
        return f"<MasteryRecord(user={self.user_id}, concept='{self.concept}', score={self.mastery_score})>"
