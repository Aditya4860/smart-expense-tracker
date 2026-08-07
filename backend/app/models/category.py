from sqlalchemy import Column, String, ForeignKey, Enum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
from app.models.enums import TransactionType

class Category(BaseModel):
    __tablename__ = "categories"

    name = Column(String(100), nullable=False)
    type = Column(Enum(TransactionType), nullable=False, index=True)
    icon = Column(String(50), nullable=True)
    color = Column(String(20), nullable=True)
    
    # Every category must belong to a user
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="categories")
    incomes = relationship("Income", back_populates="category")
    expenses = relationship("Expense", back_populates="category")
    budgets = relationship("Budget", back_populates="category")
    recurring_transactions = relationship("RecurringTransaction", back_populates="category")
    reminders = relationship("Reminder", back_populates="category")


    __table_args__ = (
        Index("ix_categories_user_type", "user_id", "type"),
        Index("ix_categories_user_name", "user_id", "name"),
    )
