import sys
from pathlib import Path

# Ensure root directory is in sys.path whether executed from root or api/
_BASE_DIR = Path(__file__).resolve().parent
_ROOT_DIR = _BASE_DIR.parent
if str(_ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(_ROOT_DIR))
if str(_BASE_DIR) not in sys.path:
    sys.path.insert(0, str(_BASE_DIR))

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.config import Settings, get_settings, validate_environment
from api.middleware.request_id import RequestIdMiddleware
from api.middleware.logging import StructuredLoggingMiddleware
from api.observability.middleware import TraceContextMiddleware
from api.observability.logging import configure_structured_logging
from api.routers import health, courses, sources, sessions, retrieve, chat, practice, mastery, interview, educator, admin

# Setup structured logging
configure_structured_logging()
logger = logging.getLogger("prism.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    env_validation = validate_environment(settings)
    logger.info("==================================================")
    logger.info(f" Starting {settings.APP_NAME} v{settings.VERSION}")
    logger.info(" Team The Falcons — Hackathon 2026")
    logger.info(f" Mode: {settings.APP_ENV} | LLM: {settings.LLM_PROVIDER}")
    logger.info(" Temporal Evidence Firewall: ACTIVE")
    logger.info(f" Environment Status: {env_validation['status'].upper()}")
    logger.info("==================================================")
    yield
    logger.info(f" Shutting down {settings.APP_NAME} gracefully.")


def create_app(settings: Settings = None) -> FastAPI:
    if settings is None:
        settings = get_settings()

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.VERSION,
        description="Temporal Evidence Firewall & Timestamp-Aware Learning Assistant API",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # 1. CORS Configuration with Vercel Wildcard Support
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 2. Request tracing and structured observability
    app.add_middleware(TraceContextMiddleware)
    app.add_middleware(StructuredLoggingMiddleware)
    app.add_middleware(RequestIdMiddleware)

    # 3. Mount Routers
    app.include_router(health.router)
    app.include_router(courses.router)
    app.include_router(sources.router)
    app.include_router(sessions.router)
    app.include_router(retrieve.router)
    app.include_router(chat.router)
    app.include_router(practice.router)
    app.include_router(mastery.router)
    app.include_router(interview.router)
    app.include_router(educator.router)
    app.include_router(admin.router)

    # 4. Root Welcome Route
    @app.get("/", tags=["System"])
    async def root():
        return {
            "app": settings.APP_NAME,
            "version": settings.VERSION,
            "team": "The Falcons",
            "documentation": "/docs",
            "health": "/health",
            "firewall": "Temporal Evidence Firewall Active",
        }

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "api.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
