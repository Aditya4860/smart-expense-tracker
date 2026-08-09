from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db_session
from app.models.user import User
from app.schemas.ai_schema import InsightResponse
from app.services.ai_service import AIService

router = APIRouter(tags=["AI Insights"])

def _get_ai_service(db: AsyncSession = Depends(get_db_session)) -> AIService:
    return AIService(db)

@router.get("/insights", response_model=InsightResponse)
async def get_financial_insights(
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(_get_ai_service)
):
    """
    Generate or retrieve cached AI financial insights for the current user.
    """
    currency = current_user.currency_preference or "INR"
    insights, cached, provider = await ai_service.get_insights(current_user.id, currency)
    
    return InsightResponse(
        success=True,
        insights=insights,
        provider=provider,
        cached=cached
    )
