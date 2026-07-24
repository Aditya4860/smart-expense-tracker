from sqlalchemy import Column, Numeric, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
from app.models.enums import TransactionType, RecurringFrequency

class RecurringTransaction(BaseModel):
    __tablename__ = "recurring_transactions"

    amount = Column(Numeric(12, 2), nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    frequency = Column(Enum(RecurringFrequency), nullable=False)
    next_date = Column(Date, nullable=False, index=True)
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="recurring_transactions")
    category = relationship("Category", back_populates="recurring_transactions")
