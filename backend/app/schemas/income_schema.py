from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field
from datetime import date, datetime

class IncomeBase(BaseModel):
    amount: float = Field(..., gt=0, description="Amount must be greater than 0")
    date: date
    source: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    category_id: UUID

class IncomeCreate(IncomeBase):
    pass

class IncomeUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    date: Optional[date] = None
    source: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    category_id: Optional[UUID] = None

class IncomeResponse(IncomeBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    category_name: Optional[str] = None

    class Config:
        from_attributes = True
