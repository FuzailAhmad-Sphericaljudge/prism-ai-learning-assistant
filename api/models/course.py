from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship
from api.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Course(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Represents an academic course or lecture series containing multi-modal sources.
    """
    __tablename__ = "courses"

    title = Column(String(255), nullable=False, index=True)
    code = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=True)
    instructor = Column(String(255), nullable=False, default="Faculty Instructor")
    term = Column(String(50), nullable=True, default="Fall 2026")

    # Relationships
    sources = relationship("Source", back_populates="course", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="course", cascade="all, delete-orphan")
    mastery_records = relationship("MasteryRecord", back_populates="course", cascade="all, delete-orphan")
    interview_sessions = relationship("InterviewSession", back_populates="course", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Course(id={self.id}, code='{self.code}', title='{self.title}')>"
