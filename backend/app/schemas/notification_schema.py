from typing import Optional, Dict, Any, List
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import datetime
from app.core.sanitization import sanitize_string
from app.models.enums import NotificationType

class NotificationBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1)
    type: NotificationType = Field(default=NotificationType.SYSTEM)
    is_read: bool = False
    data: Optional[Dict[str, Any]] = None

    @field_validator("title", "message", mode="before")
    @classmethod
    def sanitize_text(cls, v):
        return sanitize_string(v) if isinstance(v, str) else v

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None
    title: Optional[str] = None
    message: Optional[str] = None

class NotificationCountResponse(BaseModel):
    unread_count: int = 0
    total_count: int = 0

class NotificationResponse(NotificationBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

