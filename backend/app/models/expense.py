from sqlalchemy import Column, String, Numeric, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel

class Expense(BaseModel):
    __tablename__ = "expenses"

    merchant = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    amount = Column(Numeric(12, 2), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    payment_method = Column(String(100), nullable=True)
    date = Column(Date, nullable=False, index=True)
    receipt_url = Column(String(1024), nullable=True)
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="expenses")
    category = relationship("Category", back_populates="expenses")
