from sqlalchemy import Column, String, Numeric, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel

class Expense(BaseModel):
    __tablename__ = "expenses"

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    amount = Column(Numeric(12, 2), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    payment_method = Column(String(100), nullable=True)
    transaction_date = Column(Date, nullable=False, index=True)
    notes = Column(Text, nullable=True)
    receipt_url = Column(String(1024), nullable=True)
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="expenses")
