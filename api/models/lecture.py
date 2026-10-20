from sqlalchemy import Column, String, Float, Text
from sqlalchemy.orm import relationship
from api.database import Base
from api.models.base import UUIDMixin, TimestampMixin


class VideoLecture(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "video_lectures"

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    video_url = Column(String(512), nullable=False)
    duration_seconds = Column(Float, nullable=False, default=0.0)
    course_name = Column(String(255), nullable=True)
    topic = Column(String(255), nullable=True)

    # Relationships
    chunks = relationship(
        "DocumentChunk", back_populates="lecture", cascade="all, delete-orphan"
    )
    diagnostics = relationship(
        "DiagnosticCheck", back_populates="lecture", cascade="all, delete-orphan"
    )
    interviews = relationship(
        "MockInterview", back_populates="lecture", cascade="all, delete-orphan"
    )
