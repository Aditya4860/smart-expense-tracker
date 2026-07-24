from sqlalchemy import Column, String, Numeric, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
from app.models.enums import GoalStatus

class Goal(BaseModel):
    __tablename__ = "goals"

    name = Column(String(255), nullable=False)
    target_amount = Column(Numeric(12, 2), nullable=False)
    current_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    deadline = Column(Date, nullable=True)
    status = Column(Enum(GoalStatus), default=GoalStatus.ACTIVE, nullable=False, index=True)
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="goals")
    contributions = relationship("GoalContribution", back_populates="goal", cascade="all, delete-orphan")
