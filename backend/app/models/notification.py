from sqlalchemy import Column, String, Boolean, ForeignKey, Index, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
from app.models.enums import NotificationType

class Notification(BaseModel):
    __tablename__ = "notifications"

    title = Column(String(255), nullable=False)
    message = Column(String, nullable=False)
    type = Column(String(50), default=NotificationType.SYSTEM.value, nullable=False, index=True)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    data = Column(JSON, nullable=True)
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="notifications")

    __table_args__ = (
        Index("ix_notifications_user_read", "user_id", "is_read"),
        Index("ix_notifications_user_type_created", "user_id", "type", "created_at"),
    )

