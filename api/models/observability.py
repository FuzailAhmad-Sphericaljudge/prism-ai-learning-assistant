"""
PRISM Observability Data Models.
Persists evaluation telemetry, firewall admission stats, latency, and verification records per answer.
"""
from sqlalchemy import Column, String, Float, Integer, Boolean, Text, JSON
from api.models.base import Base, UUIDPrimaryKeyMixin, TimestampMixin


class EvaluationRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Evaluation telemetry captured for every query answer produced by the PRISM assistant.
    Tracks latency, firewall status, citation validity, and leakage detection.
    """
    __tablename__ = "evaluation_records"

    trace_id = Column(String(64), nullable=False, index=True)
    request_id = Column(String(64), nullable=True)
    session_id = Column(String(36), nullable=True, index=True)
    message_id = Column(String(36), nullable=True)
    query = Column(Text, nullable=False)
    latency_ms = Column(Float, nullable=False, default=0.0)
    playback_sec = Column(Float, nullable=False, default=0.0)
    mode = Column(String(32), nullable=False, default="learn_so_far")
    citation_count = Column(Integer, nullable=False, default=0)
    admitted_chunks = Column(Integer, nullable=False, default=0)
    blocked_chunks = Column(Integer, nullable=False, default=0)
    validation_passed = Column(Boolean, nullable=False, default=True)
    leakage_detected = Column(Boolean, nullable=False, default=False)
    diagnostic_generated = Column(Boolean, nullable=False, default=False)
    eval_metadata = Column(JSON, nullable=True)

    def __repr__(self) -> str:
        return (
            f"<EvaluationRecord(id={self.id}, trace_id={self.trace_id}, "
            f"latency={self.latency_ms}ms, valid={self.validation_passed})>"
        )
