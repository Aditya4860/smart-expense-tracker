import re
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from app.models.enums import Role
from datetime import datetime
from app.core.sanitization import sanitize_string

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    currency_preference: Optional[str] = "USD"

    @field_validator("full_name", "currency_preference", mode="before")
    @classmethod
    def sanitize_fields(cls, v):
        return sanitize_string(v) if isinstance(v, str) else v

class UserCreate(UserBase):
    full_name: str
    password: str

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if len(v) > 128:
            raise ValueError("Password must not exceed 128 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>\-_=+/\\~`]", v):
            raise ValueError("Password must contain at least one special character")
        return v

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    currency_preference: Optional[str] = None

    @field_validator("full_name", "currency_preference", mode="before")
    @classmethod
    def sanitize_fields(cls, v):
        return sanitize_string(v) if isinstance(v, str) else v

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    role: Role
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

