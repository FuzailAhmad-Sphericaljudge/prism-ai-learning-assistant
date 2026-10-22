"""
PRISM Structured JSON Logging with Request-ID & Trace-ID Correlation.
Complies with OpenTelemetry/Cloud-Native structured observability standards.
"""
import json
import logging
import sys
from contextvars import ContextVar
from datetime import datetime, timezone
from typing import Any, Dict, Optional

# Context variables for distributed request and trace propagation across async boundaries
_request_id_ctx: ContextVar[str] = ContextVar("request_id", default="")
_trace_id_ctx: ContextVar[str] = ContextVar("trace_id", default="")


def get_request_id() -> str:
    """Retrieve the current async request ID or empty string if outside request context."""
    return _request_id_ctx.get()


def set_request_id(request_id: str) -> None:
    """Bind a request ID to the current async context."""
    _request_id_ctx.set(request_id)


def get_trace_id() -> str:
    """Retrieve the current async trace ID or empty string if outside trace context."""
    return _trace_id_ctx.get()


def set_trace_id(trace_id: str) -> None:
    """Bind a trace ID to the current async context."""
    _trace_id_ctx.set(trace_id)


class JSONLogFormatter(logging.Formatter):
    """
    Standardizes log output into high-performance, single-line JSON records.
    Automatically captures request_id and trace_id from async contextvars.
    """

    def format(self, record: logging.LogRecord) -> str:
        payload: Dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": get_request_id() or getattr(record, "request_id", None) or "none",
            "trace_id": get_trace_id() or getattr(record, "trace_id", None) or "none",
            "module": record.module,
            "line": record.lineno,
        }

        # Include custom telemetry attributes if supplied via extra
        for attr in ("duration_ms", "status_code", "method", "path", "playback_sec", "mode", "citations_count"):
            if hasattr(record, attr):
                payload[attr] = getattr(record, attr)

        # Include arbitrary extra fields
        if hasattr(record, "extra_data") and isinstance(record.extra_data, dict):
            payload.update(record.extra_data)

        # Include stack trace if exception info is present
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, default=str)


def configure_structured_logging(level: int = logging.INFO) -> None:
    """
    Configures the root and PRISM loggers with the JSONLogFormatter.
    Redirects output to stdout.
    """
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONLogFormatter())

    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Remove existing handlers to avoid double printing
    for existing_handler in list(root_logger.handlers):
        root_logger.removeHandler(existing_handler)

    root_logger.addHandler(handler)

    # Specific PRISM namespace logger
    prism_logger = logging.getLogger("prism")
    prism_logger.setLevel(level)
    prism_logger.propagate = True


def get_logger(name: str = "prism") -> logging.Logger:
    """Convenience getter for configured logger."""
    return logging.getLogger(name)
