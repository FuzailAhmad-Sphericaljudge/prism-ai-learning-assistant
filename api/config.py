import os
from pathlib import Path
from functools import lru_cache
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import json

_CONFIG_DIR = Path(__file__).resolve().parent
_API_ENV = _CONFIG_DIR / ".env"
_ROOT_ENV = _CONFIG_DIR.parent / ".env"


class Settings(BaseSettings):
    APP_NAME: str = "PRISM API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    VERSION: str = "1.0.0"

    # CORS settings: accepts list of strings or JSON-encoded string
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://prism-web.vercel.app",
        "https://web-one-blue-mbb8ovavhb.vercel.app",
        "https://prism-api-z7c9.onrender.com",
    ]

    # LLM & Embedding provider configuration
    LLM_PROVIDER: str = "mock"  # 'mock' | 'gemini' | 'bedrock'
    GEMINI_API_KEY: str = ""

    # Database & Vector Store settings (Production Cloud Supabase with fallback)
    DATABASE_URL: str = "postgresql://postgres.qhqoyhqkqfoqcgcaposk:QutX7FCd3%25-%40iUV@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=(_API_ENV, _ROOT_ENV, ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, v: Union[str, bool, int]) -> bool:
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            v_lower = v.strip().lower()
            if v_lower in ("true", "1", "t", "yes", "y", "dev", "development", "debug"):
                return True
            if v_lower in ("false", "0", "f", "no", "n", "prod", "production", "release"):
                return False
        return bool(v)

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("["):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, v: str) -> str:
        if isinstance(v, str) and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v


def validate_environment(settings: Settings = None) -> dict:
    """
    Validates runtime environment variables, provider credentials, and database readiness.
    Provides automated fallbacks to keep the demo resilient.
    """
    import logging
    logger = logging.getLogger("prism.config")

    if settings is None:
        settings = get_settings()

    issues = []
    warnings = []

    # 1. Database check
    if not settings.DATABASE_URL:
        issues.append("DATABASE_URL is empty.")

    # 2. LLM Provider verification
    if settings.LLM_PROVIDER == "gemini" and not settings.GEMINI_API_KEY:
        warnings.append(
            "GEMINI_API_KEY is not configured while LLM_PROVIDER='gemini'. "
            "Falling back to high-fidelity mock provider for demo resilience."
        )

    for warn in warnings:
        logger.warning(f"[STARTUP WARNING] {warn}")
    for issue in issues:
        logger.error(f"[STARTUP CRITICAL] {issue}")

    return {
        "status": "healthy" if not issues else "degraded",
        "app_env": settings.APP_ENV,
        "llm_provider": settings.LLM_PROVIDER,
        "database_configured": bool(settings.DATABASE_URL),
        "issues": issues,
        "warnings": warnings,
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()
