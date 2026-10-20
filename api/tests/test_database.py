from pathlib import Path
from dotenv import load_dotenv

# Ensure api/.env is loaded before importing database modules
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
if ENV_PATH.exists():
    load_dotenv(ENV_PATH)

import pytest
from api.database import verify_database_connection, get_db, SessionLocal


def test_verify_database_connection():
    result = verify_database_connection()
    assert isinstance(result, dict)
    assert "connected" in result

    if result["connected"]:
        assert "version" in result
        assert "pgvector_active" in result
        assert result["pgvector_active"] is True


def test_get_db_session_lifecycle():
    # If SessionLocal is configured and connected, test generator
    health = verify_database_connection()
    if health["connected"] and SessionLocal is not None:
        db_gen = get_db()
        db_session = next(db_gen)
        assert db_session is not None
        from sqlalchemy import text
        res = db_session.execute(text("SELECT 1;")).scalar()
        assert res == 1
        with pytest.raises(StopIteration):
            next(db_gen)
