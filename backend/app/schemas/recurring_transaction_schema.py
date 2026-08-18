from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator
from datetime import date, datetime
from app.models.enums import TransactionType, RecurringFrequency, RecurringStatus
from app.core.sanitization import sanitize_string

class RecurringTransactionBase(BaseModel):
    type: TransactionType
    amount: float = Field(..., gt=0, description="Amount must be greater than 0")
    frequency: RecurringFrequency
    category_id: UUID
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    merchant: Optional[str] = Field(None, max_length=255, description="Merchant for expense or Source for income")
    payment_method: Optional[str] = Field(None, max_length=100)
    start_date: date = Field(default_factory=date.today)
    end_date: Optional[date] = None
    is_never_ending: bool = True
    auto_process: bool = True

    @field_validator("title", "description", "merchant", "payment_method", mode="before")
    @classmethod
    def sanitize_text(cls, v):
        return sanitize_string(v) if isinstance(v, str) else v

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date:
            if self.end_date < self.start_date:
                raise ValueError("end_date must be on or after start_date")
            self.is_never_ending = False
        return self

class RecurringTransactionCreate(RecurringTransactionBase):
    next_date: Optional[date] = None

class RecurringTransactionUpdate(BaseModel):
    type: Optional[TransactionType] = None
    amount: Optional[float] = Field(None, gt=0)
    frequency: Optional[RecurringFrequency] = None
    category_id: Optional[UUID] = None
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    merchant: Optional[str] = Field(None, max_length=255)
    payment_method: Optional[str] = Field(None, max_length=100)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_never_ending: Optional[bool] = None
    next_date: Optional[date] = None
    status: Optional[RecurringStatus] = None
    auto_process: Optional[bool] = None

    @field_validator("title", "description", "merchant", "payment_method", mode="before")
    @classmethod
    def sanitize_text(cls, v):
        return sanitize_string(v) if isinstance(v, str) else v

    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        if self.end_date is not None:
            self.is_never_ending = False
        return self

class RecurringTransactionResponse(RecurringTransactionBase):
    id: UUID
    user_id: UUID
    next_date: date
    last_processed_date: Optional[date] = None
    status: RecurringStatus
    created_at: datetime
    updated_at: datetime
    category_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class RecurringProcessResult(BaseModel):
    processed_count: int
    generated_transactions: List[Dict[str, Any]] = []
    messages: List[str] = []

class RecurringCountResponse(BaseModel):
    active_count: int
    paused_count: int
    total_count: int
    total_active: int
    active_expenses: int
    active_income: int
    cancelled_count: int
    total_monthly_recurring_expense: float
    total_monthly_recurring_income: float
