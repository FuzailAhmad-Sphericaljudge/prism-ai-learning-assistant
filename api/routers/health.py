from datetime import datetime, timezone
import time
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from api.config import Settings, get_settings

router = APIRouter(tags=["System"])

SERVER_START_TIME = time.time()


class HealthResponse(BaseModel):
    status: str = Field(..., example="ok")
    app: str = Field(..., example="PRISM API")
    version: str = Field(..., example="0.1.0")
    environment: str = Field(..., example="development")
    llm_provider: str = Field(..., example="mock")
    uptime_seconds: float = Field(..., example=12.34)
    timestamp: str = Field(..., example="2026-10-19T17:15:00.000000Z")


class VersionResponse(BaseModel):
    app: str
    version: str
    team: str
    firewall: str
    llm_provider: str


@router.get("/health", response_model=HealthResponse)
async def get_health(settings: Settings = Depends(get_settings)) -> HealthResponse:
    """
    Health check probe for monitoring uptime, environment, and provider modes.
    """
    now_utc = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    uptime = round(time.time() - SERVER_START_TIME, 2)

    return HealthResponse(
        status="ok",
        app=settings.APP_NAME,
        version=settings.VERSION,
        environment=settings.APP_ENV,
        llm_provider=settings.LLM_PROVIDER,
        uptime_seconds=uptime,
        timestamp=now_utc,
    )


@router.get("/version", response_model=VersionResponse)
async def get_version(settings: Settings = Depends(get_settings)) -> VersionResponse:
    """
    Returns application metadata and team ownership.
    """
    return VersionResponse(
        app=settings.APP_NAME,
        version=settings.VERSION,
        team="The Falcons",
        firewall="Temporal Evidence Firewall v1.0",
        llm_provider=settings.LLM_PROVIDER,
    )
