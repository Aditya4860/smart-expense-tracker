from sqlalchemy import Column, Numeric, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel

class GoalContribution(BaseModel):
    __tablename__ = "goal_contributions"

    amount = Column(Numeric(12, 2), nullable=False)
    date = Column(Date, nullable=False, index=True)
    
    goal_id = Column(UUID(as_uuid=True), ForeignKey("goals.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationships
    goal = relationship("Goal", back_populates="contributions")
