from sqlalchemy import Column, String, Integer, Float, Text, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from api.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Source(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Represents an ingested educational resource (video, pdf, ppt, notes) belonging to a course.
    """
    __tablename__ = "sources"

    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False, index=True)  # 'video' | 'pdf' | 'ppt' | 'notes'
    title = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=True)
    version = Column(Integer, nullable=False, default=1)
    status = Column(String(50), nullable=False, default="pending", index=True)  # 'pending' | 'processing' | 'ready' | 'failed'
    error_message = Column(Text, nullable=True)
    duration_sec = Column(Float, nullable=True)
    page_count = Column(Integer, nullable=True)
    meta = Column(JSON, nullable=True, default=dict)

    # Relationships
    course = relationship("Course", back_populates="sources")
    chunks = relationship("Chunk", back_populates="source", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("course_id", "title", "version", name="uq_source_course_title_version"),
    )

    def __repr__(self) -> str:
        return f"<Source(id={self.id}, type='{self.type}', title='{self.title}', status='{self.status}', v={self.version})>"
