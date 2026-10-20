from sqlalchemy import Column, String, Float, Integer, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from api.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Chunk(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Multimodal knowledge chunk bounded by temporal intervals and document coordinates
    for the Temporal Evidence Firewall. Supports 768-dim pgvector and GIN full-text search.
    """
    __tablename__ = "chunks"

    source_id = Column(String(36), ForeignKey("sources.id", ondelete="CASCADE"), nullable=False, index=True)
    text = Column(Text, nullable=False)
    
    # Temporal boundaries in seconds
    start_sec = Column(Float, nullable=True, index=True)
    end_sec = Column(Float, nullable=True, index=True)

    # Multi-modal pagination anchors
    page = Column(Integer, nullable=True, index=True)
    slide = Column(Integer, nullable=True, index=True)

    # Vector embedding (768 dimensions for hybrid vector search)
    embedding = Column(Vector(768), nullable=True)

    # Full-text search vector for BM25/lexical hybrid retrieval
    tsv = Column(TSVECTOR, nullable=True)

    # Relationships
    source = relationship("Source", back_populates="chunks")

    __table_args__ = (
        Index("ix_chunks_tsv_gin", "tsv", postgresql_using="gin"),
        Index("ix_chunks_source_time", "source_id", "start_sec", "end_sec"),
    )

    def __repr__(self) -> str:
        coords = f"[{self.start_sec}-{self.end_sec}]" if self.start_sec is not None else f"p.{self.page}" if self.page else f"s.{self.slide}"
        return f"<Chunk(id={self.id}, source_id={self.source_id}, coords={coords})>"


# Backwards compatibility alias for Phase 0A
DocumentChunk = Chunk
