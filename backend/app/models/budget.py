from sqlalchemy import Column, Numeric, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
from app.models.enums import BudgetPeriod

class Budget(BaseModel):
    __tablename__ = "budgets"

    amount = Column(Numeric(12, 2), nullable=False)
    period = Column(Enum(BudgetPeriod), nullable=False)
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")

    __table_args__ = (
        UniqueConstraint("user_id", "category_id", "period", name="uix_user_category_period"),
    )
