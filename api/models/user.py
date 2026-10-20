from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from api.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Represents a student learner or instructor in the PRISM platform.
    """
    __tablename__ = "users"

    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="student")  # 'student' | 'instructor' | 'admin'

    # Relationships
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    mastery_records = relationship("MasteryRecord", back_populates="user", cascade="all, delete-orphan")
    interview_sessions = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"
