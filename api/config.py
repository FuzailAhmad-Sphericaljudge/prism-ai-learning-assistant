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
    VERSION: str = "0.1.0"

    # CORS settings: accepts list of strings or JSON-encoded string
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://prism-web.vercel.app",
    ]

    # LLM & Embedding provider configuration
    LLM_PROVIDER: str = "mock"  # 'mock' | 'gemini' | 'bedrock'
    GEMINI_API_KEY: str = ""

    # Database & Vector Store settings
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/prism"
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=(_API_ENV, _ROOT_ENV, ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

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


@lru_cache()
def get_settings() -> Settings:
    return Settings()
