from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from app.models.enums import BudgetPeriod

class BudgetBase(BaseModel):
    amount: float = Field(..., gt=0)
    period: BudgetPeriod
    category_id: UUID

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    period: Optional[BudgetPeriod] = None
    category_id: Optional[UUID] = None

class BudgetResponse(BudgetBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    category_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class BudgetUtilizationResponse(BaseModel):
    budget_id: UUID
    category_id: UUID
    category_name: str
    budget_amount: float
    utilized_amount: float
    remaining_amount: float
    period: BudgetPeriod

    model_config = ConfigDict(from_attributes=True)
