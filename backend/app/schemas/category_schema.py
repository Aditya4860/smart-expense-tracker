from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import datetime
from app.models.enums import TransactionType
from app.core.sanitization import sanitize_string

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: TransactionType
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, max_length=50)

    @field_validator("name", "icon", "color", mode="before")
    @classmethod
    def sanitize_text(cls, v):
        return sanitize_string(v) if isinstance(v, str) else v

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[TransactionType] = None
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, max_length=50)

    @field_validator("name", "icon", "color", mode="before")
    @classmethod
    def sanitize_text(cls, v):
        return sanitize_string(v) if isinstance(v, str) else v

class CategoryResponse(CategoryBase):
    id: UUID
    user_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
