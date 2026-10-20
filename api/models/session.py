from sqlalchemy import Column, String, Float, Text, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from api.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Session(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Represents an active learning session where a student is watching a course lecture.
    Tracks the active temporal firewall boundary `current_playback_sec`.
    """
    __tablename__ = "sessions"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    current_playback_sec = Column(Float, nullable=False, default=0.0, index=True)
    title = Column(String(255), nullable=True, default="Interactive Lecture Session")

    # Relationships
    user = relationship("User", back_populates="sessions")
    course = relationship("Course", back_populates="sessions")
    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan", order_by="Message.created_at")
    attempts = relationship("Attempt", back_populates="session", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Session(id={self.id}, user_id={self.user_id}, t={self.current_playback_sec}s)>"


class Message(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Individual chat exchange between learner and PRISM Temporal Assistant.
    Stores strict attribution citations and playback temporal position.
    """
    __tablename__ = "messages"

    session_id = Column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), nullable=False)  # 'user' | 'assistant' | 'system'
    content = Column(Text, nullable=False)
    playback_sec = Column(Float, nullable=False, default=0.0)
    citations = Column(JSON, nullable=True, default=list)
    is_firewalled = Column(Boolean, nullable=False, default=True)

    # Relationships
    session = relationship("Session", back_populates="messages")

    def __repr__(self) -> str:
        return f"<Message(id={self.id}, session_id={self.session_id}, role='{self.role}', t={self.playback_sec})>"
