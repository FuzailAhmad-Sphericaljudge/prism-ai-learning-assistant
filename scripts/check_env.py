#!/usr/bin/env python3
"""
PRISM Environment & Infrastructure Verification Script
Checks:
1. GEMINI_API_KEY validity (Embeddings + Generate Content probe)
2. DATABASE_URL connectivity (PostgreSQL / Supabase connection)
3. pgvector extension installed in database

Rules:
- NEVER print secrets.
- Print PASS / FAIL per item.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import httpx

# Load .env from api/.env or root .env
ROOT_DIR = Path(__file__).resolve().parent.parent
API_ENV_PATH = ROOT_DIR / "api" / ".env"
ROOT_ENV_PATH = ROOT_DIR / ".env"

if API_ENV_PATH.exists():
    load_dotenv(API_ENV_PATH)
elif ROOT_ENV_PATH.exists():
    load_dotenv(ROOT_ENV_PATH)
else:
    load_dotenv()


def mask_secret(secret: str | None) -> str:
    if not secret:
        return "<NOT SET>"
    if len(secret) <= 8:
        return "****"
    return f"...{secret[-4:]}"


def check_gemini() -> bool:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        print("[FAIL] GEMINI_API_KEY: Missing or empty in environment")
        return False

    masked = mask_secret(api_key)

    # 1. Test generateContent
    generate_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={api_key}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": "Ping from PRISM AI Learning Assistant. Reply with 'PONG'."}
                ]
            }
        ]
    }

    try:
        with httpx.Client(timeout=20.0) as client:
            resp = client.post(generate_url, json=payload)
            if resp.status_code != 200:
                print(f"[FAIL] GEMINI_API_KEY ({masked}): Generate probe failed (HTTP {resp.status_code})")
                return False

            # 2. Test gemini-embedding-001
            embed_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={api_key}"
            embed_payload = {
                "model": "models/gemini-embedding-001",
                "content": {"parts": [{"text": "Temporal Evidence Firewall"}]},
            }
            embed_resp = client.post(embed_url, json=embed_payload)
            if embed_resp.status_code != 200:
                print(f"[FAIL] GEMINI_API_KEY ({masked}): Embeddings probe failed (HTTP {embed_resp.status_code})")
                return False

            data = embed_resp.json()
            embedding_values = data.get("embedding", {}).get("values", [])
            dim = len(embedding_values)

            print(f"[PASS] GEMINI_API_KEY ({masked}): Text generation (gemini-3.5-flash-lite) and embeddings (gemini-embedding-001) verified (dim={dim})")
            return True
    except Exception as exc:
        print(f"[FAIL] GEMINI_API_KEY ({masked}): Network error: {exc}")
        return False


def check_database() -> bool:
    db_url = os.getenv("DATABASE_URL", "").strip()
    if not db_url:
        print("[FAIL] DATABASE_URL: Missing or empty in environment")
        return False

    masked = mask_secret(db_url)

    try:
        import sqlalchemy
        from sqlalchemy import text

        # Handle postgresql:// schema if needed for SQLAlchemy
        engine_url = db_url
        if engine_url.startswith("postgres://"):
            engine_url = engine_url.replace("postgres://", "postgresql+psycopg://", 1)
        elif engine_url.startswith("postgresql://") and not engine_url.startswith("postgresql+"):
            try:
                import psycopg  # noqa: F401
                engine_url = engine_url.replace("postgresql://", "postgresql+psycopg://", 1)
            except ImportError:
                pass

        engine = sqlalchemy.create_engine(engine_url, connect_args={"connect_timeout": 8})

        with engine.connect() as conn:
            # 1. Check connection and version
            ver_result = conn.execute(text("SELECT version();")).scalar()
            print(f"[PASS] DATABASE_URL ({masked}): Connected successfully ({ver_result.split(',')[0]})")

            # 2. Check pgvector extension
            vec_result = conn.execute(
                text("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';")
            ).fetchone()

            if vec_result:
                print(f"[PASS] pgvector: Extension active (version {vec_result[1]})")
                return True
            else:
                print(f"[FAIL] pgvector: Extension 'vector' is NOT enabled in database. Run: CREATE EXTENSION IF NOT EXISTS vector;")
                return False
    except ImportError as exc:
        print(f"[FAIL] DATABASE_URL: Import error: {exc}")
        return False
    except Exception as exc:
        print(f"[FAIL] DATABASE_URL ({masked}): Connection error: {exc}")
        return False


def main():
    print("==================================================")
    print("  PRISM Infrastructure & Environment Verification")
    print("==================================================")

    gemini_ok = check_gemini()
    db_ok = check_database()

    print("--------------------------------------------------")
    if gemini_ok and db_ok:
        print("RESULT: ALL INFRASTRUCTURE CHECKS PASSED [OK]")
        sys.exit(0)
    else:
        print("RESULT: ONE OR MORE CHECKS FAILED [ACTION REQUIRED]")
        sys.exit(1)


if __name__ == "__main__":
    main()

