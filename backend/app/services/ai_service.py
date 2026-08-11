import uuid
import time
from datetime import date, datetime
from decimal import Decimal
from typing import List, Tuple

from app.core.config import settings
from app.core.logging import logger
from app.services.report_service import ReportService
from app.schemas.ai_schema import ChatMessage
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ai_providers.base import LLMProvider
from app.services.ai_providers.mock_provider import MockProvider

class DecimalEncoder:
    # We don't necessarily need to subclass json.JSONEncoder since pydantic/fastapi handles this,
    # but we'll convert Decimals to float in the context gatherer for simplicity before passing to providers.
    pass

# ── Simple In-Memory TTLCache ────────────────────────────────────────────────
# We cache AI insights per user for 5 minutes (300 seconds) to avoid heavy API usage.
_INSIGHTS_CACHE = {}
_RECOMMENDATIONS_CACHE = {}
CACHE_TTL = 300

class AIService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.report_service = ReportService(db)
        self.provider_name = settings.AI_PROVIDER.lower()
        self.provider: LLMProvider = self._initialize_provider()

    def _initialize_provider(self) -> LLMProvider:
        if self.provider_name == "gemini":
            try:
                from app.services.ai_providers.gemini_provider import GeminiProvider
                return GeminiProvider()
            except ValueError as e:
                logger.error(f"GeminiProvider initialization failed: {e}. Falling back to MockProvider.")
                self.provider_name = "mock"
                return MockProvider()
        else:
            if self.provider_name != "mock":
                logger.warning(f"Provider '{self.provider_name}' is not fully implemented in the new architecture. Falling back to MockProvider.")
            self.provider_name = "mock"
            return MockProvider()

    async def get_insights(self, user_id: uuid.UUID, currency: str) -> Tuple[List[str], bool, str]:
        """
        Returns (insights: List[str], cached: bool, provider: str).
        """
        cache_key = str(user_id)
        current_time = time.time()

        if cache_key in _INSIGHTS_CACHE:
            cached_data, timestamp = _INSIGHTS_CACHE[cache_key]
            if current_time - timestamp < CACHE_TTL:
                logger.info(f"Returning cached AI insights for user {user_id}")
                return cached_data, True, self.provider_name
            else:
                del _INSIGHTS_CACHE[cache_key]

        context_data = await self._gather_financial_context(user_id, currency)
        
        if not context_data:
            return ["Insufficient financial data to generate insights. Start adding income, expenses, or budgets!"], False, self.provider_name

        insights = await self.provider.get_insights(context_data)

        if insights and not any("Error generating" in i for i in insights):
            _INSIGHTS_CACHE[cache_key] = (insights, current_time)

        return insights, False, self.provider_name

    async def get_recommendations(self, user_id: uuid.UUID, currency: str) -> Tuple[List[dict], bool, str]:
        """
        Returns (recommendations: List[dict], cached: bool, provider: str).
        """
        cache_key = str(user_id)
        current_time = time.time()

        if cache_key in _RECOMMENDATIONS_CACHE:
            cached_data, timestamp = _RECOMMENDATIONS_CACHE[cache_key]
            if current_time - timestamp < CACHE_TTL:
                logger.info(f"Returning cached AI recommendations for user {user_id}")
                return cached_data, True, self.provider_name
            else:
                del _RECOMMENDATIONS_CACHE[cache_key]

        context_data = await self._gather_financial_context(user_id, currency)
        if not context_data:
            return [], False, self.provider_name

        recs = await self.provider.get_recommendations(context_data)

        if recs:
            _RECOMMENDATIONS_CACHE[cache_key] = (recs, current_time)

        return recs, False, self.provider_name

    async def chat(self, user_id: uuid.UUID, currency: str, messages: List[ChatMessage]) -> str:
        """
        Conversational assistant method.
        Limits to last 10 messages to prevent token overflow.
        """
        if len(messages) > 10:
            messages = messages[-10:]

        context_data = await self._gather_financial_context(user_id, currency)
        if not context_data:
            return "I don't have enough financial data to answer that. Try logging some income or expenses first!"

        message_dicts = [{"role": m.role, "content": m.content} for m in messages]
        return await self.provider.get_chat_reply(message_dicts, context_data)

    async def _gather_financial_context(self, user_id: uuid.UUID, currency: str) -> dict:
        """
        Safely fetch user-scoped financial data from ReportService.
        Converts Decimals to floats to avoid JSON serialization issues in providers.
        """
        today = date.today()
        monthly_rep = await self.report_service.monthly_report(user_id, today.year, today.month, currency)
        
        if monthly_rep.income_transaction_count == 0 and monthly_rep.expense_transaction_count == 0:
            yearly_rep = await self.report_service.yearly_report(user_id, today.year, currency)
            if yearly_rep.total_income == 0 and yearly_rep.total_expenses == 0:
                return {}

        budget_rep = await self.report_service.budget_report(user_id, today.year, today.month, currency)
        savings_rep = await self.report_service.savings_goal_report(user_id, currency)

        context = {
            "month": f"{today.year}-{today.month:02d}",
            "currency": currency,
            "monthly_summary": {
                "total_income": float(monthly_rep.total_income),
                "total_expenses": float(monthly_rep.total_expenses),
                "net_balance": float(monthly_rep.net_balance),
                "savings_rate_percentage": float(monthly_rep.savings_rate),
                "expenses_by_category": [
                    {"category": c.category_name, "amount": float(c.total_amount)}
                    for c in monthly_rep.expense_by_category
                ]
            },
            "budgets": {
                "overall_utilization_percentage": float(budget_rep.overall_utilization_percentage),
                "total_budgets": len(budget_rep.budgets),
                "over_budget_categories": [
                    c.category_name for c in budget_rep.over_budget_categories
                ]
            },
            "savings_goals": {
                "overall_progress_percentage": float(savings_rep.overall_progress_percentage),
                "active_goals": savings_rep.active_goals
            }
        }
        return context
