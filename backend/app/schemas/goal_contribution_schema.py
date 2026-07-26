from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field
from datetime import date, datetime

class GoalContributionBase(BaseModel):
    amount: float = Field(..., gt=0)
    date: date

class GoalContributionCreate(GoalContributionBase):
    goal_id: UUID

class GoalContributionUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    date: Optional[date] = None

class GoalContributionResponse(GoalContributionBase):
    id: UUID
    goal_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
