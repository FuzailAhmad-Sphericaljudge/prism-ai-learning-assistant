"""
PRISM Admin & Observability Router.
Provides endpoints for monitoring temporal firewall efficacy, latency percentiles,
validation pass rates, and live request traces.
"""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session as DBSession
from pydantic import BaseModel, Field

from api.database import get_db
from api.observability.metrics import metrics_collector
from api.evals.runner import run_eval_suite
from api.models.observability import EvaluationRecord

router = APIRouter(prefix="/admin", tags=["admin-observability"])


class LatencyDistributionBucket(BaseModel):
    bucket: str
    count: int


class TimelinePoint(BaseModel):
    timestamp: str
    latency_ms: float
    validation_passed: bool
    query: str
    playback_sec: float
    mode: str


class AdminMetricsResponse(BaseModel):
    total_queries: int
    p50_latency_ms: float
    p95_latency_ms: float
    p99_latency_ms: float
    mean_latency_ms: float
    validation_pass_rate: float
    firewall_leak_rate: float
    temporal_enforcement_rate: float
    learn_so_far_count: int
    explore_ahead_count: int
    latency_distribution: List[LatencyDistributionBucket]
    recent_timeline: List[TimelinePoint]


class TraceItem(BaseModel):
    id: str
    trace_id: str
    request_id: Optional[str] = None
    session_id: Optional[str] = None
    query: str
    latency_ms: float
    playback_sec: float
    mode: str
    citation_count: int
    admitted_chunks: int
    blocked_chunks: int
    validation_passed: bool
    leakage_detected: bool
    diagnostic_generated: bool
    timestamp: str


class RecordTraceRequest(BaseModel):
    query: str
    latency_ms: float
    playback_sec: float = 0.0
    mode: str = "learn_so_far"
    citation_count: int = 0
    admitted_chunks: int = 0
    blocked_chunks: int = 0
    validation_passed: bool = True
    leakage_detected: bool = False
    diagnostic_generated: bool = False
    trace_id: Optional[str] = None
    request_id: Optional[str] = None
    session_id: Optional[str] = None
    eval_metadata: Optional[Dict[str, Any]] = None


@router.get("/metrics", response_model=AdminMetricsResponse)
def get_admin_metrics(db: DBSession = Depends(get_db)):
    """
    Returns aggregated observability metrics including latency percentiles,
    validation pass rate, firewall leakage prevention rate, and distribution buckets.
    """
    summary = metrics_collector.get_summary_metrics(db=db)
    return summary


@router.get("/traces", response_model=List[TraceItem])
def get_admin_traces(
    limit: int = Query(50, ge=1, le=200),
    db: DBSession = Depends(get_db),
):
    """
    Returns recent telemetry traces with execution details.
    """
    traces = metrics_collector.get_recent_traces(limit=limit, db=db)
    return traces


@router.post("/record-trace", response_model=TraceItem)
def record_trace(
    body: RecordTraceRequest,
    db: DBSession = Depends(get_db),
):
    """
    Manually record an evaluation telemetry event.
    """
    rec = metrics_collector.record_trace(
        query=body.query,
        latency_ms=body.latency_ms,
        playback_sec=body.playback_sec,
        mode=body.mode,
        citation_count=body.citation_count,
        admitted_chunks=body.admitted_chunks,
        blocked_chunks=body.blocked_chunks,
        validation_passed=body.validation_passed,
        leakage_detected=body.leakage_detected,
        diagnostic_generated=body.diagnostic_generated,
        trace_id=body.trace_id,
        request_id=body.request_id,
        session_id=body.session_id,
        eval_metadata=body.eval_metadata,
        db=db,
    )
    return rec


@router.post("/run-eval")
def trigger_eval_run():
    """
    Trigger full Phase 8 benchmark evaluation suite and record metrics.
    """
    try:
        report = run_eval_suite()
        return {
            "status": "success",
            "summary": report.summary,
            "total_questions": len(report.results),
            "generated_at": report.generated_at,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Eval run failed: {str(exc)}")
