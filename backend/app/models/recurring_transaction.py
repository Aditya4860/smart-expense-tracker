from sqlalchemy import Column, String, Numeric, Date, Boolean, ForeignKey, Enum, Text, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import date
from app.models.base import BaseModel
from app.models.enums import TransactionType, RecurringFrequency, RecurringStatus

class RecurringTransaction(BaseModel):
    __tablename__ = "recurring_transactions"

    type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    frequency = Column(Enum(RecurringFrequency), nullable=False)
    
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    merchant = Column(String(255), nullable=True) # Merchant name for expenses or Source for incomes
    payment_method = Column(String(100), nullable=True)
    
    start_date = Column(Date, nullable=False, default=date.today)
    end_date = Column(Date, nullable=True)
    is_never_ending = Column(Boolean, default=True, nullable=False)
    
    next_date = Column(Date, nullable=False, index=True)
    last_processed_date = Column(Date, nullable=True)
    
    status = Column(Enum(RecurringStatus), default=RecurringStatus.ACTIVE, nullable=False, index=True)
    auto_process = Column(Boolean, default=True, nullable=False)
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="recurring_transactions")
    category = relationship("Category", back_populates="recurring_transactions")

    __table_args__ = (
        Index("ix_recurring_user_status_next", "user_id", "status", "next_date"),
        Index("ix_recurring_user_type", "user_id", "type"),
    )

