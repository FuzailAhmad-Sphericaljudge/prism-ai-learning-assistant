#!/usr/bin/env python3
"""
PRISM Database Initialization Script
Creates all tables and verifies vector extension on Supabase PostgreSQL.
"""

import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))
load_dotenv(ROOT_DIR / "api" / ".env")
load_dotenv(ROOT_DIR / ".env")

from sqlalchemy import text
from api.database import engine, Base
import api.models  # Registers all models with Base.metadata


def init_database():
    print("==================================================")
    print("  Initializing PRISM Database Schema on Supabase")
    print("==================================================")

    if engine is None:
        print("[FAIL] Database engine not configured. Check DATABASE_URL in api/.env.")
        sys.exit(1)

    try:
        with engine.connect() as conn:
            print("1. Enabling pgvector extension...")
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            conn.commit()
            print("   -> pgvector extension verified.")

        print("2. Creating database tables from SQLAlchemy metadata...")
        Base.metadata.create_all(bind=engine)
        print("   -> Tables created successfully.")

        # Verify created tables
        with engine.connect() as conn:
            tables = conn.execute(
                text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
            ).fetchall()
            table_names = [t[0] for t in tables]
            print(f"3. Active public tables: {', '.join(table_names)}")

        print("--------------------------------------------------")
        print("SUCCESS: PRISM database schema initialized! [OK]")
    except Exception as exc:
        print(f"[FAIL] Error initializing database: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    init_database()
