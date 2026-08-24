import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr

class EnquiryBase(BaseModel):
    name: str
    email: EmailStr
    query: str

class EnquiryCreate(EnquiryBase):
    pass

class EnquiryResponse(EnquiryBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
