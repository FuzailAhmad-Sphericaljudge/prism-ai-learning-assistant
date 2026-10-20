from datetime import datetime, timezone
import time
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from api.config import Settings, get_settings
from api.database import verify_database_connection
from api.providers import get_provider

router = APIRouter(tags=["System"])

SERVER_START_TIME = time.time()


class HealthResponse(BaseModel):
    status: str = Field(..., json_schema_extra={"example": "ok"})
    app: str = Field(..., json_schema_extra={"example": "PRISM API"})
    version: str = Field(..., json_schema_extra={"example": "0.1.0"})
    environment: str = Field(..., json_schema_extra={"example": "development"})
    llm_provider: str = Field(..., json_schema_extra={"example": "gemini"})
    uptime_seconds: float = Field(..., json_schema_extra={"example": 12.34})
    timestamp: str = Field(..., json_schema_extra={"example": "2026-10-20T03:45:00.000000Z"})
    database: Optional[Dict[str, Any]] = None
    provider: Optional[Dict[str, Any]] = None


class VersionResponse(BaseModel):
    app: str
    version: str
    team: str
    firewall: str
    llm_provider: str


@router.get("/health", response_model=HealthResponse)
async def get_health(settings: Settings = Depends(get_settings)) -> HealthResponse:
    """
    Comprehensive health check probe for monitoring uptime, environment, database, and LLM provider.
    """
    now_utc = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    uptime = round(time.time() - SERVER_START_TIME, 2)

    db_health = verify_database_connection()
    provider = get_provider()
    provider_health = await provider.health_check()

    return HealthResponse(
        status="ok",
        app=settings.APP_NAME,
        version=settings.VERSION,
        environment=settings.APP_ENV,
        llm_provider=settings.LLM_PROVIDER,
        uptime_seconds=uptime,
        timestamp=now_utc,
        database=db_health,
        provider=provider_health,
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
