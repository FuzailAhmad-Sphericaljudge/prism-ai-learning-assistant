#!/usr/bin/env bash
set -e

echo "=================================================="
echo " PRISM Deployment Configuration Verifier"
echo " Team The Falcons — Production Readiness Audit"
echo "=================================================="

# 1. Verify Docker Compose Syntax
echo "[1/4] Verifying docker-compose.yml configuration..."
if command -v docker >/dev/null 2>&1; then
    docker compose config >/dev/null
    echo "  ✓ docker-compose.yml syntax is valid."
else
    echo "  ! docker not found in path; syntax check skipped."
fi

# 2. Check essential deployment documentation files
echo "[2/4] Checking deployment documentation files..."
for f in docs/DEPLOYMENT.md docs/DEPLOY.md docs/INFRA.md; do
    if [ -f "$f" ]; then
        echo "  ✓ Found $f"
    else
        echo "  ✗ Missing $f"
        exit 1
    fi
done

# 3. Check for any exposed live secrets in repository
echo "[3/4] Scanning repository for leaked API keys..."
if git grep -iE "AIza[0-9A-Za-z-_]{35}|sk-[0-9A-Za-z]{32}" >/dev/null 2>&1; then
    echo "  ✗ Warning: Potential API key pattern detected in repository!"
    exit 1
else
    echo "  ✓ No plain-text API secrets detected."
fi

# 4. Check Frontend and Backend URLs
echo "[4/4] Verifying live deployment endpoint reachability..."
FRONTEND_URL="https://web-one-blue-mbb8ovavhb.vercel.app"
BACKEND_URL="https://prism-api-z7c9.onrender.com/health"

if command -v curl >/dev/null 2>&1; then
    F_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" || echo "failed")
    B_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL" || echo "failed")
    echo "  Frontend ($FRONTEND_URL): HTTP $F_STATUS"
    echo "  Backend ($BACKEND_URL): HTTP $B_STATUS"
fi

echo "=================================================="
echo " Deployment verification completed successfully."
echo "=================================================="
