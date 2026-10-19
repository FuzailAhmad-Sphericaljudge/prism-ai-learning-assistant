import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("prism.api")


class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that records structured timing and status logs for every request.
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        start_time = time.perf_counter()
        request_id = getattr(request.state, "request_id", "unknown")

        try:
            response = await call_next(request)
            process_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
            response.headers["X-Process-Time-Ms"] = str(process_time_ms)

            logger.info(
                f"method={request.method} path={request.url.path} "
                f"status={response.status_code} duration_ms={process_time_ms} "
                f"request_id={request_id} client={request.client.host if request.client else 'unknown'}"
            )
            return response
        except Exception as exc:
            process_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.error(
                f"method={request.method} path={request.url.path} "
                f"status=500 duration_ms={process_time_ms} "
                f"request_id={request_id} error={str(exc)}"
            )
            raise exc
