from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, HttpUrl, ConfigDict
from datetime import date, datetime

class ExpenseBase(BaseModel):
    merchant: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    amount: float = Field(..., gt=0, description="Amount must be greater than 0")
    category_id: UUID
    payment_method: Optional[str] = Field(None, max_length=100)
    date: date
    receipt_url: Optional[HttpUrl] = None

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

class ExpenseResponse(ExpenseBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    category_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
