import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from api.config import get_settings

logger = logging.getLogger("prism.database")

Base = declarative_base()


def get_engine():
    settings = get_settings()
    db_url = settings.DATABASE_URL
    if not db_url:
        logger.warning("DATABASE_URL is not set. Database operations will fail.")
        return None

    # Supabase connection pool configuration
    return create_engine(
        db_url,
        pool_size=5,
        max_overflow=10,
        pool_timeout=30,
        pool_recycle=300,
        pool_pre_ping=True,
    )


engine = get_engine()

SessionLocal = (
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
    if engine
    else None
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session and guarantees closure.
    """
    if SessionLocal is None:
        raise RuntimeError("Database engine not initialized. Please configure DATABASE_URL.")

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_database_connection() -> dict:
    """
    Executes a health check against the PostgreSQL database and checks pgvector.
    """
    if engine is None:
        return {"connected": False, "error": "Engine not configured"}

    try:
        with engine.connect() as conn:
            ver = conn.execute(text("SELECT version();")).scalar()
            vec = conn.execute(
                text("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';")
            ).fetchone()

            return {
                "connected": True,
                "version": ver.split(",")[0] if ver else "unknown",
                "pgvector_active": vec is not None,
                "pgvector_version": vec[1] if vec else None,
            }
    except Exception as exc:
        logger.error(f"Database health check failed: {exc}")
        return {"connected": False, "error": str(exc)}
