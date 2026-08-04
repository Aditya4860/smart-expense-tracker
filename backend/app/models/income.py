from sqlalchemy import Column, String, Numeric, Date, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel

class Income(BaseModel):
    __tablename__ = "incomes"

    amount = Column(Numeric(12, 2), nullable=False)
    date = Column(Date, nullable=False, index=True)
    source = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="incomes")
    category = relationship("Category", back_populates="incomes")

    __table_args__ = (
        Index("ix_incomes_user_date", "user_id", "date"),
        Index("ix_incomes_user_category", "user_id", "category_id"),
        Index("ix_incomes_user_source", "user_id", "source"),
    )
