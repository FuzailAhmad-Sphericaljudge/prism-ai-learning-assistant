"""
PRISM Observability Package.
Contains structured logging, trace context propagation, evaluation metric tracking,
and real-time analytics for the Temporal Evidence Firewall.
"""
from api.observability.logging import (
    get_request_id,
    set_request_id,
    get_trace_id,
    set_trace_id,
    JSONLogFormatter,
    configure_structured_logging,
    get_logger,
)
from api.observability.middleware import TraceContextMiddleware
from api.observability.metrics import MetricsCollector, metrics_collector

__all__ = [
    "get_request_id",
    "set_request_id",
    "get_trace_id",
    "set_trace_id",
    "JSONLogFormatter",
    "configure_structured_logging",
    "get_logger",
    "TraceContextMiddleware",
    "MetricsCollector",
    "metrics_collector",
]
