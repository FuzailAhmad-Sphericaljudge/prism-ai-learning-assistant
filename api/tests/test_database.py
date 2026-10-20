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
    if SessionLocal is not None:
        db_gen = get_db()
        db_session = next(db_gen)
        assert db_session is not None
        # Ensure session can execute a simple query
        from sqlalchemy import text
        res = db_session.execute(text("SELECT 1;")).scalar()
        assert res == 1
        # Close generator
        with pytest.raises(StopIteration):
            next(db_gen)

