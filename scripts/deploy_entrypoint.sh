#!/usr/bin/env bash
# ========================================================
# PRISM Production Deployment Entrypoint
# Team The Falcons — Hackathon 2026
# Runs Alembic migrations, verifies demo seeding, then boots uvicorn.
# ========================================================
set -e

echo "=================================================="
echo " Starting PRISM Production Deployment Sequence"
echo " Team The Falcons — Hackathon 2026"
echo "=================================================="

# 1. Run Alembic Database Migrations
echo ">> Running Alembic database migrations to head..."
python -m alembic -c api/alembic.ini upgrade head

# 2. Check and run demo seeding if needed
echo ">> Ingesting and verifying demo course data..."
python scripts/seed_demo.py || echo "[WARN] seed_demo.py encountered non-fatal error; continuing."

echo ">> Ingesting sample mastery assessment attempts..."
python scripts/seed_mastery_attempts.py || echo "[WARN] seed_mastery_attempts.py non-fatal error; continuing."

echo ">> Ingesting interview rubric and educator insights..."
python scripts/seed_interview_educator.py || echo "[WARN] seed_interview_educator.py non-fatal error; continuing."

# 3. Boot production uvicorn server
PORT="${PORT:-8000}"
echo ">> Booting Uvicorn ASGI Server on port ${PORT}..."
exec uvicorn api.main:app --host 0.0.0.0 --port "${PORT}" --workers 2
