from sqlalchemy import Column, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from api.database import Base
from api.models.base import UUIDMixin, TimestampMixin


class MockInterview(Base, UUIDMixin, TimestampMixin):
    """
    Adaptive mock oral interview session linked to course topics and rubrics.
    """

    __tablename__ = "mock_interviews"

    lecture_id = Column(
        ForeignKey("video_lectures.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    learner_id = Column(String(128), nullable=False, index=True)
    target_concept = Column(String(255), nullable=False)
    difficulty = Column(String(32), nullable=False, default="intermediate")
    status = Column(String(32), nullable=False, default="in_progress")

    # Relationships
    lecture = relationship("VideoLecture", back_populates="interviews")
    exchanges = relationship(
        "InterviewExchange", back_populates="interview", cascade="all, delete-orphan"
    )


class InterviewExchange(Base, UUIDMixin, TimestampMixin):
    """
    Individual Socratic dialogue exchange within a mock interview.
    """

    __tablename__ = "interview_exchanges"

    interview_id = Column(
        ForeignKey("mock_interviews.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question_text = Column(Text, nullable=False)
    learner_response = Column(Text, nullable=True)
    socratic_feedback = Column(Text, nullable=True)
    rubric_scores = Column(JSON, nullable=True)
    revision_links = Column(JSON, nullable=True)

    # Relationships
    interview = relationship("MockInterview", back_populates="exchanges")
