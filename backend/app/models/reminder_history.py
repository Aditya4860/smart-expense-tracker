from sqlalchemy import Column, String, Date, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import date
from app.models.base import BaseModel

class ReminderHistory(BaseModel):
    __tablename__ = "reminder_histories"

    reminder_id = Column(UUID(as_uuid=True), ForeignKey("reminders.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    action = Column(String(50), nullable=False) # NOTIFIED, COMPLETED, SNOOZED, DISMISSED, CREATED, ADVANCED
    action_date = Column(Date, nullable=False, default=date.today)
    notes = Column(Text, nullable=True)

    # Relationships
    reminder = relationship("Reminder", back_populates="history")
    user = relationship("User")

    __table_args__ = (
        Index("ix_reminder_histories_user_date", "user_id", "action_date"),
    )
