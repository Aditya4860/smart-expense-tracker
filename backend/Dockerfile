# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 – Builder
# Install dependencies in an isolated layer for a lean final image
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

# System build deps (needed for asyncpg / cryptography compilation)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first to leverage Docker layer caching
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt


# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 – Runtime
# Minimal image with only the installed packages and application code
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

WORKDIR /app

# Runtime system deps only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from builder
COPY --from=builder /install /usr/local

# Create non-root user for security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy application source
COPY . .

# Set ownership
RUN chown -R appuser:appgroup /app

USER appuser

# Expose application port
EXPOSE 8000

# Default: run with Gunicorn + Uvicorn workers
# Override CMD for development: uvicorn main:app --reload
CMD ["gunicorn", "-c", "gunicorn.conf.py", "main:app"]

# Health check – Docker will mark the container unhealthy if this fails
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1
