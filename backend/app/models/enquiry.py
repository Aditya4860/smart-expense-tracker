from sqlalchemy import Column, String, Text
from app.models.base import BaseModel

class Enquiry(BaseModel):
    __tablename__ = "enquiries"

    name = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    query = Column(Text, nullable=False)
