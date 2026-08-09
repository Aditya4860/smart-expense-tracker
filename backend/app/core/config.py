from functools import lru_cache
from pathlib import Path
from typing import List, Literal, Optional

from pydantic import AnyHttpUrl, PostgresDsn, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    # ── Application ────────────────────────────────────────────────────────────
    PROJECT_NAME: str = "Smart Expense Tracker API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: Literal["development", "staging", "production", "testing"] = "development"

    # ── Security ───────────────────────────────────────────────────────────────
    SECRET_KEY: str = "your-super-secret-key-for-jwt-do-not-use-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    ALGORITHM: str = "HS256"

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True

    # ── CORS ───────────────────────────────────────────────────────────────────
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # ── Database ───────────────────────────────────────────────────────────────
    DATABASE_URL: Optional[PostgresDsn] = None
    ALEMBIC_DATABASE_URL: Optional[PostgresDsn] = None

    # ── Logging ────────────────────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"                   # DEBUG | INFO | WARNING | ERROR

    # ── Server ─────────────────────────────────────────────────────────────────
    WORKERS: int = 1                          # overridden by gunicorn.conf.py in prod
    GUNICORN_BIND: str = "0.0.0.0:8000"

    # ── Monitoring ─────────────────────────────────────────────────────────────
    SENTRY_DSN: Optional[str] = None         # Set in production to enable Sentry

    # ── AI Financial Assistant ──────────────────────────────────────────────────
    AI_PROVIDER: Literal["mock", "openai", "gemini", "anthropic"] = "mock"
    AI_API_KEY: Optional[str] = None
    AI_MODEL: Optional[str] = None  # Example: "gpt-4o-mini" or "gemini-1.5-flash"

    # ── Validators ─────────────────────────────────────────────────────────────
    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if len(v) < 32:
            import warnings
            warnings.warn("SECRET_KEY should be at least 32 characters for security.", UserWarning)
        return v

    @field_validator("ACCESS_TOKEN_EXPIRE_MINUTES", "REFRESH_TOKEN_EXPIRE_MINUTES")
    @classmethod
    def validate_token_expiry(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Token expiration minutes must be greater than 0")
        return v

    @model_validator(mode="after")
    def validate_production_requirements(self) -> "Settings":
        """Fail fast if dangerous defaults are used in production."""
        if self.ENVIRONMENT == "production":
            insecure_default = "your-super-secret-key-for-jwt-do-not-use-in-production"
            if self.SECRET_KEY == insecure_default or len(self.SECRET_KEY) < 32:
                raise ValueError(
                    "FATAL: SECRET_KEY must be a secure random string of at least 32 "
                    "characters in production. Generate one with: "
                    "python -c \"import secrets; print(secrets.token_hex(32))\""
                )
            if not self.DATABASE_URL:
                raise ValueError(
                    "FATAL: DATABASE_URL must be set in production environment."
                )
            if not self.BACKEND_CORS_ORIGINS:
                import warnings
                warnings.warn(
                    "BACKEND_CORS_ORIGINS is empty in production. "
                    "Set it to your frontend domain to restrict CORS.",
                    UserWarning,
                )
        return self

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        extra="ignore",
        case_sensitive=True,
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()