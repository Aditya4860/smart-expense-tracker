from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import date, datetime
from app.models.enums import GoalStatus
from app.schemas.goal_contribution_schema import GoalContributionResponse
from app.core.sanitization import sanitize_string

class GoalBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    target_amount: float = Field(..., gt=0)
    deadline: Optional[date] = None
    description: Optional[str] = Field(None, max_length=500)
    priority: str = Field("medium", max_length=20)
    status: GoalStatus = GoalStatus.ACTIVE

    @field_validator("name", "description", "priority", mode="before")
    @classmethod
    def sanitize_text(cls, v):
        return sanitize_string(v) if isinstance(v, str) else v

class GoalCreate(GoalBase):
    current_amount: float = Field(0.0, ge=0)

class GoalUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    target_amount: Optional[float] = Field(None, gt=0)
    deadline: Optional[date] = None
    description: Optional[str] = Field(None, max_length=500)
    priority: Optional[str] = Field(None, max_length=20)
    status: Optional[GoalStatus] = None

    @field_validator("name", "description", "priority", mode="before")
    @classmethod
    def sanitize_text(cls, v):
        return sanitize_string(v) if isinstance(v, str) else v

class GoalResponse(GoalBase):
    id: UUID
    user_id: UUID
    current_amount: float
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class GoalProgressResponse(GoalResponse):
    remaining_amount: float
    completion_percentage: float

    # Optionally include history if needed, but typically a separate endpoint or field
