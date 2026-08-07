from sqlalchemy import Column, String, Numeric, Date, Boolean, ForeignKey, Enum, Text, DateTime, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import date
from app.models.base import BaseModel
from app.models.enums import ReminderType, ReminderFrequency, ReminderStatus

class Reminder(BaseModel):
    __tablename__ = "reminders"

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    amount = Column(Numeric(12, 2), nullable=True)
    
    type = Column(Enum(ReminderType), nullable=False, index=True)
    frequency = Column(Enum(ReminderFrequency), default=ReminderFrequency.ONCE, nullable=False)
    
    due_date = Column(Date, nullable=False, index=True)
    due_time = Column(String(10), nullable=True)
    
    status = Column(Enum(ReminderStatus), default=ReminderStatus.PENDING, nullable=False, index=True)
    is_auto_notified = Column(Boolean, default=True, nullable=False)
    last_notified_at = Column(DateTime, nullable=True)
    snooze_until = Column(Date, nullable=True)
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)

    # Relationships
    user = relationship("User", back_populates="reminders")
    category = relationship("Category", back_populates="reminders")
    history = relationship("ReminderHistory", back_populates="reminder", cascade="all, delete-orphan", order_by="desc(ReminderHistory.created_at)")

    __table_args__ = (
        Index("ix_reminders_user_status_due", "user_id", "status", "due_date"),
        Index("ix_reminders_user_type", "user_id", "type"),
    )
