from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import date, datetime
from app.models.enums import ReminderType, ReminderFrequency, ReminderStatus
from app.core.sanitization import sanitize_string

class ReminderHistoryResponse(BaseModel):
    id: UUID
    reminder_id: UUID
    user_id: UUID
    action: str
    action_date: date
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ReminderBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0, description="Amount must be positive if provided")
    type: ReminderType = Field(default=ReminderType.CUSTOM)
    frequency: ReminderFrequency = Field(default=ReminderFrequency.ONCE)
    due_date: date
    due_time: Optional[str] = Field(None, max_length=10, description="e.g. 09:00, 18:30")
    category_id: Optional[UUID] = None
    is_auto_notified: bool = True

    @field_validator("title", "description", "due_time", mode="before")
    @classmethod
    def sanitize_text(cls, v):
        return sanitize_string(v) if isinstance(v, str) else v

class ReminderCreate(ReminderBase):
    pass

class ReminderUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    type: Optional[ReminderType] = None
    frequency: Optional[ReminderFrequency] = None
    due_date: Optional[date] = None
    due_time: Optional[str] = Field(None, max_length=10)
    category_id: Optional[UUID] = None
    status: Optional[ReminderStatus] = None
    is_auto_notified: Optional[bool] = None
    snooze_until: Optional[date] = None

    @field_validator("title", "description", "due_time", mode="before")
    @classmethod
    def sanitize_text(cls, v):
        return sanitize_string(v) if isinstance(v, str) else v

class ReminderSnooze(BaseModel):
    days: int = Field(default=1, ge=1, le=365, description="Number of days to snooze the reminder")
    snooze_until: Optional[date] = None

class ReminderResponse(ReminderBase):
    id: UUID
    user_id: UUID
    status: ReminderStatus
    last_notified_at: Optional[datetime] = None
    snooze_until: Optional[date] = None
    created_at: datetime
    updated_at: datetime
    category_name: Optional[str] = None
    is_overdue: bool = False
    history: List[ReminderHistoryResponse] = []

    model_config = ConfigDict(from_attributes=True)

class ReminderCountResponse(BaseModel):
    pending_count: int = 0
    overdue_count: int = 0
    completed_count: int = 0
    total_count: int = 0

class ReminderProcessResult(BaseModel):
    notified_count: int = 0
    processed_reminders: List[Dict[str, Any]] = []
    messages: List[str] = []
