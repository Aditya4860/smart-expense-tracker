from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel

class Notification(BaseModel):
    __tablename__ = "notifications"

    title = Column(String(255), nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="notifications")
