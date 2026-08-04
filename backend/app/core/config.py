from functools import lru_cache
from pathlib import Path
from typing import List, Optional, Union

from pydantic import AnyHttpUrl, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Expense Tracker API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"  # development, staging, production, testing

    SECRET_KEY: str = "your-super-secret-key-for-jwt-do-not-use-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    ALGORITHM: str = "HS256"

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True

    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str, info) -> str:
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

    DATABASE_URL: Optional[PostgresDsn] = None
    ALEMBIC_DATABASE_URL: Optional[PostgresDsn] = None

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        extra="ignore",
        case_sensitive=True,
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()