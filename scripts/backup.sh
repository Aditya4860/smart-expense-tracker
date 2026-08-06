#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/backup.sh — PostgreSQL database backup with rotation
#
# Creates a timestamped pg_dump of the database, stores it in ./backups/,
# and removes backups older than RETENTION_DAYS (default: 30).
#
# Recommended: run via cron (e.g., daily at 2 AM):
#   0 2 * * * /path/to/scripts/backup.sh >> /var/log/expense_tracker_backup.log 2>&1
#
# Requirements:
#   - pg_dump must be available on PATH
#   - Environment variables must be set (DATABASE_URL or individual vars)
#
# Usage:
#   ./scripts/backup.sh
#   RETENTION_DAYS=7 ./scripts/backup.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_DIR}/backups"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Database connection — prefer explicit vars, fall back to parsing DATABASE_URL
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-expense_tracker}"
DB_USER="${POSTGRES_USER:-postgres}"
export PGPASSWORD="${POSTGRES_PASSWORD:-postgres}"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/expense_tracker_${TIMESTAMP}.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "==> Starting database backup: $BACKUP_FILE"
echo "    Host     : $DB_HOST:$DB_PORT"
echo "    Database : $DB_NAME"
echo "    User     : $DB_USER"

# ── Perform backup ────────────────────────────────────────────────────────────
pg_dump \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USER" \
    --dbname="$DB_NAME" \
    --format=plain \
    --no-password \
    | gzip > "$BACKUP_FILE"

BACKUP_SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "    Backup complete ✓ (size: $BACKUP_SIZE)"

# ── Rotate old backups ────────────────────────────────────────────────────────
echo "==> Removing backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "expense_tracker_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete
REMAINING=$(find "$BACKUP_DIR" -name "expense_tracker_*.sql.gz" | wc -l)
echo "    Remaining backups: $REMAINING"

# ── Restore instructions ──────────────────────────────────────────────────────
echo ""
echo "To restore this backup:"
echo "  gunzip -c $BACKUP_FILE | psql -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME"

unset PGPASSWORD
