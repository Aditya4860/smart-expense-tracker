# Production Deployment Checklist — Smart Expense Tracker

Use this checklist before every production deployment. Tick off each item.

---

## 🔐 Security & Secrets

- [ ] `SECRET_KEY` is a cryptographically random string ≥ 32 characters  
  ```bash
  python -c "import secrets; print(secrets.token_hex(32))"
  ```
- [ ] `POSTGRES_PASSWORD` is a strong, unique password (not `postgres`)
- [ ] `.env` is **not committed** to version control (check `.gitignore`)
- [ ] `ENVIRONMENT=production` is set in production `.env`
- [ ] `BACKEND_CORS_ORIGINS` is set to your **exact** frontend domain (no wildcards)
- [ ] `RATE_LIMIT_ENABLED=true` is set
- [ ] Swagger UI (`/docs`, `/redoc`) is disabled in production — verified by hitting the URL
- [ ] Default admin/seed credentials changed or removed
- [ ] Sentry DSN configured (or alternative error tracking in place)

---

## 🗄️ Database

- [ ] `DATABASE_URL` points to the **production** database, not a dev/staging instance
- [ ] Database migrations are up to date: `alembic upgrade head`
- [ ] Database is accessible from the backend container (network/firewall rules)
- [ ] Postgres port **NOT** exposed to the public internet (only accessible within the Docker network)
- [ ] Database user has **least-privilege** permissions (SELECT/INSERT/UPDATE/DELETE only — not SUPERUSER)
- [ ] Automated backup job is scheduled (e.g., cron calling `./scripts/backup.sh`)
- [ ] At least one manual backup has been tested and verified restorable

---

## 🐳 Docker & Infrastructure

- [ ] Docker images build without errors: `docker compose -f docker-compose.yml -f docker-compose.prod.yml build`
- [ ] All containers start and pass health checks: `docker compose ps`
- [ ] Backend health endpoint returns HTTP 200: `curl https://your-domain.com/health`
- [ ] Frontend loads correctly in browser
- [ ] API calls from frontend succeed (check Network tab for 4xx/5xx)
- [ ] Resource limits are set in `docker-compose.prod.yml`
- [ ] Containers restart on failure (`restart: always`)

---

## 🌐 Network & SSL

- [ ] Frontend is served over **HTTPS** (not HTTP)
- [ ] SSL certificate is valid and not expiring within 30 days
- [ ] HTTP → HTTPS redirect is in place
- [ ] `Strict-Transport-Security` header is present in responses
- [ ] API is not directly accessible from public internet (should go through Nginx proxy)

---

## 📦 Frontend Build

- [ ] Production build succeeds: `npm run build:prod`
- [ ] No JavaScript console errors on first load
- [ ] Lazy-loaded pages work (navigate to `/dashboard`, `/analytics` etc.)
- [ ] All page routes resolve correctly (no 404 on browser refresh)
- [ ] Bundle chunk sizes are reasonable (< 600 kB per chunk)

---

## 📋 Logging & Monitoring

- [ ] `LOG_LEVEL=INFO` in production (not DEBUG)
- [ ] Log output is being collected (Docker logging driver, or cloud log aggregator)
- [ ] Slow request warnings appear in logs (requests > 500ms logged as WARN)
- [ ] Error monitoring is active (Sentry or alternative)
- [ ] Uptime monitoring is configured (e.g., UptimeRobot, Better Uptime)

---

## 🧪 Smoke Tests (post-deployment)

Run these after every deployment:

- [ ] `GET /health` → HTTP 200, `status: "healthy"`, `database: "ok"`
- [ ] Register a new user → HTTP 201
- [ ] Login with that user → HTTP 200, receives tokens
- [ ] Create an expense → HTTP 201
- [ ] View dashboard → loads correctly
- [ ] View analytics page → loads without blank screen
- [ ] Rate limiting: send 6 rapid login requests → 6th returns HTTP 429

---

## 🔄 Rollback Plan

In case of critical issue:

1. `docker compose down` on production server
2. `git checkout <previous-tag>`  
3. `./scripts/migrate.sh downgrade -1` (if migration was applied)
4. `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build`

---

*Last updated: 2026-08-06*
