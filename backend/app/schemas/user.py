from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr
from app.models.enums import Role
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    currency_preference: Optional[str] = "USD"

class UserCreate(UserBase):
    full_name: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    currency_preference: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    role: Role
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
