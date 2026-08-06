# Deployment Guide — Smart Expense Tracker

> This guide covers deploying the Smart Expense Tracker with Docker Compose.  
> For local development setup, see [README.md](../README.md).

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Docker | 24.0+ |
| Docker Compose | v2.20+ |
| PostgreSQL (if not using Docker) | 15+ |
| Node.js (for manual frontend build) | 20+ |
| Python (for manual backend) | 3.12+ |

---

## Quick Start with Docker Compose

### 1. Clone and configure

```bash
git clone https://github.com/your-org/expense-tracker.git
cd expense-tracker

# Create your production .env from the template
cp .env.example .env
```

Edit `.env` and fill in **all REQUIRED fields**:
- `SECRET_KEY` — generate with: `python -c "import secrets; print(secrets.token_hex(32))"`
- `POSTGRES_PASSWORD` — a strong, unique password
- `BACKEND_CORS_ORIGINS` — your actual frontend domain

### 2. Build and start (development)

```bash
docker compose up --build
```

The services will be available at:
- Frontend: http://localhost
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs *(not available in production)*

### 3. Build and start (production)

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### 4. Run database migrations

Migrations run automatically on startup via `scripts/start.sh`.  
To run manually:

```bash
# Inside the running backend container
docker compose exec backend alembic upgrade head

# Or via the migration script
./scripts/migrate.sh
```

---

## Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENVIRONMENT` | No | `development` | One of: `development`, `staging`, `production`, `testing` |
| `SECRET_KEY` | **YES** | — | JWT signing secret, min 32 chars |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `60` | Access token lifetime (production) |
| `REFRESH_TOKEN_EXPIRE_MINUTES` | No | `10080` | Refresh token lifetime (7 days) |
| `DATABASE_URL` | **YES** | — | `postgresql+asyncpg://user:pass@host:5432/db` |
| `POSTGRES_DB` | **YES** | `expense_tracker` | Database name |
| `POSTGRES_USER` | **YES** | `postgres` | Database user |
| `POSTGRES_PASSWORD` | **YES** | — | Database password |
| `BACKEND_CORS_ORIGINS` | **YES** | — | Comma-separated allowed origins |
| `LOG_LEVEL` | No | `INFO` | `DEBUG` / `INFO` / `WARNING` / `ERROR` |
| `RATE_LIMIT_ENABLED` | No | `true` | Toggle request rate limiting |
| `GUNICORN_WORKERS` | No | `auto` | Number of Gunicorn workers |
| `SENTRY_DSN` | No | — | Sentry project DSN for error tracking |
| `FRONTEND_PORT` | No | `80` | Host port for the frontend container |
| `BACKEND_PORT` | No | `8000` | Host port for the backend API |

---

## Manual Deployment (without Docker)

### Backend

```bash
cd backend

# 1. Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt
pip install gunicorn  # not in requirements.txt as it's prod-only

# 3. Set environment variables
cp .env.example .env
# Edit .env with your values

# 4. Run migrations
alembic upgrade head

# 5. Start with Gunicorn (production)
gunicorn -c gunicorn.conf.py main:app

# 5. Start with Uvicorn (development)
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# 1. Install dependencies
npm ci

# 2. Set API base URL (if different from localhost)
# Edit src/services/api.js or set VITE_API_URL env var

# 3. Build for production
npm run build:prod

# 4. Serve with Nginx or any static file server
# The built files are in: frontend/dist/
```

---

## Health Check

The API exposes a health endpoint that checks database connectivity:

```bash
curl http://localhost:8000/health
```

**Healthy response (HTTP 200):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production",
  "services": {
    "database": "ok"
  }
}
```

**Degraded response (HTTP 503):**
```json
{
  "status": "degraded",
  "services": {
    "database": "error",
    "database_error": "Database unreachable"
  }
}
```

---

## Database Backup

Use the provided backup script:

```bash
# Single backup
./scripts/backup.sh

# Add to crontab for daily backups at 2 AM
crontab -e
# Add: 0 2 * * * /path/to/scripts/backup.sh >> /var/log/expense_tracker_backup.log 2>&1
```

Backups are stored in `./backups/` as gzipped SQL dumps, and automatically rotated after 30 days (configurable via `RETENTION_DAYS`).

**Restore a backup:**
```bash
gunzip -c backups/expense_tracker_20260101_020000.sql.gz | \
  psql -h localhost -U expense_user expense_tracker
```

---

## SSL / TLS

SSL termination should be handled by a reverse proxy **in front of** Docker Compose, not within the application itself. Recommended options:

- **Nginx Proxy Manager** — GUI-based, easy Let's Encrypt integration
- **Traefik** — automatic HTTPS with Let's Encrypt, Docker-native
- **Caddy** — automatic HTTPS, single-binary
- **AWS ALB / CloudFront** — for cloud deployments

The backend should run over HTTP internally (port 8000); the proxy handles HTTPS (443) and terminates SSL before passing requests to the backend.

---

## Rollback Procedure

```bash
# 1. Identify the previous image tag or git commit
git log --oneline -10

# 2. Roll back the database migration (if applicable)
./scripts/migrate.sh downgrade -1

# 3. Check out the previous version
git checkout <previous-commit>

# 4. Rebuild and redeploy
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

---

## Monitoring

### Logs

```bash
# All services
docker compose logs -f

# Backend only
docker compose logs -f backend

# Tail last 100 lines
docker compose logs --tail=100 backend
```

### Sentry (optional)

Set `SENTRY_DSN` in your `.env` to automatically report all unhandled exceptions to Sentry.  
Install the Sentry SDK in the backend virtual environment:

```bash
pip install sentry-sdk
```

---

## Security Checklist Before Going Live

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for the full pre-deployment checklist.
