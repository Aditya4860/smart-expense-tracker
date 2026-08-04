from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import date, datetime
from app.core.sanitization import sanitize_string

class IncomeBase(BaseModel):
    amount: float = Field(..., gt=0, description="Amount must be greater than 0")
    date: date
    source: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    category_id: UUID

    @field_validator("source", "description", mode="before")
    @classmethod
    def sanitize_text(cls, v):
        return sanitize_string(v) if isinstance(v, str) else v

class IncomeCreate(IncomeBase):
    pass

class IncomeUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    date: Optional[date] = None
    source: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    category_id: Optional[UUID] = None

    @field_validator("source", "description", mode="before")
    @classmethod
    def sanitize_text(cls, v):
        return sanitize_string(v) if isinstance(v, str) else v

class IncomeResponse(IncomeBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    category_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
