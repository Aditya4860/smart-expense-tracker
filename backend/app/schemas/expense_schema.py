from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, HttpUrl
from datetime import date, datetime

class ExpenseBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    amount: float = Field(..., gt=0, description="Amount must be greater than 0")
    category: str = Field(..., min_length=1)
    payment_method: Optional[str] = None
    transaction_date: date
    notes: Optional[str] = None
    receipt_url: Optional[HttpUrl] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, min_length=1)
    payment_method: Optional[str] = None
    transaction_date: Optional[date] = None
    notes: Optional[str] = None
    receipt_url: Optional[HttpUrl] = None

class ExpenseResponse(ExpenseBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
