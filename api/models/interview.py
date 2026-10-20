from sqlalchemy import Column, String, Float, Integer, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from api.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class InterviewSession(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Adaptive mock oral interview session linked to course topics and rubrics.
    Interrogates the learner on core concepts with Socratic follow-ups.
    """
    __tablename__ = "interview_sessions"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    target_concept = Column(String(255), nullable=False)
    role = Column(String(255), nullable=True, default="Algorithm Specialist")
    topic = Column(String(255), nullable=True, default="Binary Search Trees & Structural Invariants")
    current_round = Column(Integer, nullable=False, default=0)
    max_rounds = Column(Integer, nullable=False, default=3)
    status = Column(String(50), nullable=False, default="in_progress", index=True)  # 'in_progress' | 'completed' | 'evaluated'
    overall_score = Column(Float, nullable=True)  # 0.0 to 100.0
    rubric = Column(JSON, nullable=True, default=dict)
    transcript_json = Column(JSON, nullable=True, default=list)
    report_json = Column(JSON, nullable=True, default=dict)
    feedback = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="interview_sessions")
    course = relationship("Course", back_populates="interview_sessions")
    exchanges = relationship(
        "InterviewExchange",
        back_populates="interview_session",
        cascade="all, delete-orphan",
        order_by="InterviewExchange.created_at",
    )

    def __repr__(self) -> str:
        return f"<InterviewSession(id={self.id}, role='{self.role}', status='{self.status}')>"


class InterviewExchange(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Individual Socratic dialogue exchange within an oral defense mock interview.
    Stores the candidate response and the justified reason for the follow-up question.
    """
    __tablename__ = "interview_exchanges"

    interview_session_id = Column(
        String(36), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    round_number = Column(Integer, nullable=False, default=1)
    question_text = Column(Text, nullable=False)
    learner_response = Column(Text, nullable=True)
    justification = Column(Text, nullable=True)  # Pedagogical justification for this follow-up
    evaluation = Column(JSON, nullable=True, default=dict)
    socratic_feedback = Column(Text, nullable=True)
    rubric_scores = Column(JSON, nullable=True, default=dict)
    revision_links = Column(JSON, nullable=True, default=list)

    # Relationships
    interview_session = relationship("InterviewSession", back_populates="exchanges")

    def __repr__(self) -> str:
        return f"<InterviewExchange(id={self.id}, round={self.round_number}, session={self.interview_session_id})>"


# Backwards compatibility alias
MockInterview = InterviewSession
