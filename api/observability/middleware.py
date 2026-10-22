"""
PRISM Trace Context and Observability Middleware.
Binds unique request-id and trace-id to every incoming HTTP request,
computes high-precision response times, and standardizes telemetry propagation.
"""
import time
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from api.observability.logging import (
    set_request_id,
    set_trace_id,
    get_request_id,
    get_trace_id,
)

logger = logging.getLogger("prism.http")


class TraceContextMiddleware(BaseHTTPMiddleware):
    """
    OpenTelemetry-compatible tracing middleware.
    Ensures every request has both X-Request-ID and X-Trace-ID headers,
    populates async context variables, measures duration, and logs structured records.
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        start_time = time.perf_counter()

        # Extract or generate Request-ID and Trace-ID
        request_id = request.headers.get("x-request-id") or f"req-{uuid.uuid4().hex[:12]}"
        trace_id = request.headers.get("x-trace-id") or f"trc-{uuid.uuid4().hex[:16]}"

        # Bind to async context variables
        set_request_id(request_id)
        set_trace_id(trace_id)

        # Also store on request state for endpoint handlers
        request.state.request_id = request_id
        request.state.trace_id = trace_id
        request.state.start_time = start_time

        try:
            response = await call_next(request)
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

            # Set standard headers on response
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Trace-ID"] = trace_id
            response.headers["X-Process-Time-Ms"] = str(duration_ms)

            # Do not spam static or root health checks in normal logs, but log all API routes
            path = request.url.path
            if not path.startswith("/favicon") and not path.endswith(".png"):
                logger.info(
                    f"{request.method} {path} - {response.status_code} ({duration_ms}ms)",
                    extra={
                        "method": request.method,
                        "path": path,
                        "status_code": response.status_code,
                        "duration_ms": duration_ms,
                        "request_id": request_id,
                        "trace_id": trace_id,
                    },
                )

            return response
        except Exception as exc:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.error(
                f"{request.method} {request.url.path} - 500 ERROR ({duration_ms}ms): {exc}",
                exc_info=True,
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": 500,
                    "duration_ms": duration_ms,
                    "request_id": request_id,
                    "trace_id": trace_id,
                },
            )
            raise exc
