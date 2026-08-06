#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/start.sh — Production backend startup script
#
# Runs Alembic migrations then starts Gunicorn.
# Intended to be used as the Docker CMD or a systemd ExecStart.
#
# Usage:
#   ./scripts/start.sh
#   GUNICORN_WORKERS=5 ./scripts/start.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")/backend"

echo "==> Starting Smart Expense Tracker API"
echo "    Environment : ${ENVIRONMENT:-development}"
echo "    Workers     : ${GUNICORN_WORKERS:-auto}"
echo "    Bind        : ${GUNICORN_BIND:-0.0.0.0:8000}"

# ── 1. Run Alembic migrations ─────────────────────────────────────────────────
echo "==> Running database migrations..."
cd "$BACKEND_DIR"
alembic upgrade head
echo "    Migrations applied ✓"

# ── 2. Start Gunicorn ─────────────────────────────────────────────────────────
echo "==> Starting Gunicorn..."
exec gunicorn -c gunicorn.conf.py main:app
