from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, HttpUrl, ConfigDict, field_validator
from datetime import date, datetime
from app.core.sanitization import sanitize_string

class ExpenseBase(BaseModel):
    merchant: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    amount: float = Field(..., gt=0, description="Amount must be greater than 0")
    category_id: UUID
    payment_method: Optional[str] = Field(None, max_length=100)
    date: date
    receipt_url: Optional[HttpUrl] = None

    @field_validator("merchant", "description", "payment_method", mode="before")
    @classmethod
    def sanitize_text(cls, v):
        return sanitize_string(v) if isinstance(v, str) else v

    @field_validator("receipt_url", mode="before")
    @classmethod
    def sanitize_receipt_url(cls, v):
        if not v or (isinstance(v, str) and not v.strip()):
            return None
        return v

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    merchant: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    category_id: Optional[UUID] = None
    payment_method: Optional[str] = Field(None, max_length=100)
    date: Optional[date] = None
    receipt_url: Optional[HttpUrl] = None

    @field_validator("merchant", "description", "payment_method", mode="before")
    @classmethod
    def sanitize_text(cls, v):
        return sanitize_string(v) if isinstance(v, str) else v

    @field_validator("receipt_url", mode="before")
    @classmethod
    def sanitize_receipt_url(cls, v):
        if not v or (isinstance(v, str) and not v.strip()):
            return None
        return v

class ExpenseResponse(ExpenseBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    category_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
