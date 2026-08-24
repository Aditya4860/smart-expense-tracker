from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db_session
from app.models.enquiry import Enquiry
from app.schemas.enquiry import EnquiryCreate, EnquiryResponse
from app.services.email_service import send_enquiry_email

router = APIRouter()

@router.post("/", response_model=EnquiryResponse)
async def create_enquiry(
    enquiry_in: EnquiryCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db_session)
):
    # Create the enquiry in the database
    new_enquiry = Enquiry(
        name=enquiry_in.name,
        email=enquiry_in.email,
        query=enquiry_in.query
    )
    db.add(new_enquiry)
    await db.commit()
    await db.refresh(new_enquiry)

    # Trigger email send in background to not block the response
    background_tasks.add_task(
        send_enquiry_email,
        name=new_enquiry.name,
        email=new_enquiry.email,
        query=new_enquiry.query
    )

    return new_enquiry
