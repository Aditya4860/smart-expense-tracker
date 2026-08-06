#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/migrate.sh — Run Alembic database migrations
#
# Safe to run multiple times (idempotent — Alembic tracks applied revisions).
# Intended for CI/CD pre-deployment step or manual rollout.
#
# Usage:
#   ./scripts/migrate.sh              # upgrade to head
#   ./scripts/migrate.sh downgrade -1 # roll back one revision
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")/backend"

COMMAND="${1:-upgrade}"
TARGET="${2:-head}"

echo "==> Alembic migration: $COMMAND $TARGET"
echo "    Database: ${DATABASE_URL:-<not set — will use .env>}"

cd "$BACKEND_DIR"

if [ "$COMMAND" = "upgrade" ]; then
    alembic upgrade "$TARGET"
    echo "    Migration complete ✓"
elif [ "$COMMAND" = "downgrade" ]; then
    echo "    WARNING: Rolling back migrations. Make sure you have a database backup."
    alembic downgrade "$TARGET"
    echo "    Rollback complete."
elif [ "$COMMAND" = "history" ]; then
    alembic history --verbose
elif [ "$COMMAND" = "current" ]; then
    alembic current
else
    echo "Usage: $0 [upgrade|downgrade|history|current] [target]"
    exit 1
fi
