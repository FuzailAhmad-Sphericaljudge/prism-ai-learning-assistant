from sqlalchemy import Column, String, Float, Integer, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from api.database import Base
from api.models.base import UUIDMixin, TimestampMixin


class DocumentChunk(Base, UUIDMixin, TimestampMixin):
    """
    Multimodal knowledge chunk bounded by temporal intervals for the Temporal Evidence Firewall.
    Embeddings are 3072-dimensional vectors powered by pgvector.
    """

    __tablename__ = "document_chunks"

    lecture_id = Column(
        ForeignKey("video_lectures.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    chunk_type = Column(
        String(32),
        nullable=False,
        index=True,
        # 'transcript' | 'slide' | 'page' | 'note'
    )

    # Temporal boundaries in seconds
    start_time = Column(Float, nullable=True, index=True)
    end_time = Column(Float, nullable=True, index=True)

    # Document pagination anchors
    page_number = Column(Integer, nullable=True, index=True)
    slide_number = Column(Integer, nullable=True, index=True)

    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    metadata_json = Column(JSON, nullable=True)

    # pgvector 3072-dimensional vector embedding (matching gemini-embedding-001)
    embedding = Column(Vector(3072), nullable=True)

    # Relationships
    lecture = relationship("VideoLecture", back_populates="chunks")
