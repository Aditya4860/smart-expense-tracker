import json
import uuid
import time
from datetime import date
from typing import List, Tuple
import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import logger
from app.services.report_service import ReportService

# ── Simple In-Memory TTLCache ────────────────────────────────────────────────
# We cache AI insights per user for 5 minutes (300 seconds) to avoid heavy API usage.
_INSIGHTS_CACHE = {}
CACHE_TTL = 300

class AIService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.report_service = ReportService(db)
        self.provider = settings.AI_PROVIDER.lower()
        self.api_key = settings.AI_API_KEY
        self.model = settings.AI_MODEL

    async def get_insights(self, user_id: uuid.UUID, currency: str) -> Tuple[List[str], bool, str]:
        """
        Returns (insights: List[str], cached: bool, provider: str).
        """
        cache_key = str(user_id)
        current_time = time.time()

        # Check Cache
        if cache_key in _INSIGHTS_CACHE:
            cached_data, timestamp = _INSIGHTS_CACHE[cache_key]
            if current_time - timestamp < CACHE_TTL:
                logger.info(f"Returning cached AI insights for user {user_id}")
                return cached_data, True, self.provider
            else:
                del _INSIGHTS_CACHE[cache_key]

        # Gather context
        context_data = await self._gather_financial_context(user_id, currency)
        
        # Check if insufficient data
        if not context_data:
            return ["Insufficient financial data to generate insights. Start adding income, expenses, or budgets!"], False, self.provider

        # Call AI Provider
        if self.provider == "mock":
            insights = self._generate_mock_insights(context_data)
        elif self.provider == "openai":
            insights = await self._call_openai(context_data)
        elif self.provider == "gemini":
            insights = await self._call_gemini(context_data)
        elif self.provider == "anthropic":
            insights = await self._call_anthropic(context_data)
        else:
            logger.warning(f"Unknown AI provider '{self.provider}', falling back to mock.")
            insights = self._generate_mock_insights(context_data)

        # Update cache
        if insights and not "Error generating" in insights[0]:
            _INSIGHTS_CACHE[cache_key] = (insights, current_time)

        return insights, False, self.provider

    async def _gather_financial_context(self, user_id: uuid.UUID, currency: str) -> dict:
        """
        Safely fetch user-scoped financial data from ReportService.
        """
        today = date.today()
        # Fetch current month report
        monthly_rep = await self.report_service.monthly_report(user_id, today.year, today.month, currency)
        
        # If user has no transactions this month, maybe fetch yearly to see if they are active at all
        if monthly_rep.income_transaction_count == 0 and monthly_rep.expense_transaction_count == 0:
            yearly_rep = await self.report_service.yearly_report(user_id, today.year, currency)
            if yearly_rep.total_income == 0 and yearly_rep.total_expenses == 0:
                return {} # Entirely empty

        # Let's get budget and goals as well
        budget_rep = await self.report_service.budget_report(user_id, today.year, today.month, currency)
        savings_rep = await self.report_service.savings_goal_report(user_id, currency)

        context = {
            "month": f"{today.year}-{today.month:02d}",
            "currency": currency,
            "monthly_summary": {
                "total_income": monthly_rep.total_income,
                "total_expenses": monthly_rep.total_expenses,
                "net_balance": monthly_rep.net_balance,
                "savings_rate_percentage": monthly_rep.savings_rate,
                "expenses_by_category": [
                    {"category": c.category_name, "amount": c.amount}
                    for c in monthly_rep.expense_by_category
                ]
            },
            "budgets": {
                "overall_utilization_percentage": budget_rep.overall_utilization_percentage,
                "over_budget_categories": [
                    c.category_name for c in budget_rep.over_budget_categories
                ]
            },
            "savings_goals": {
                "overall_progress_percentage": savings_rep.overall_progress_percentage,
                "active_goals": savings_rep.active_goals
            }
        }
        return context

    def _get_system_prompt(self) -> str:
        return (
            "You are an expert AI Financial Advisor for 'Smart Expense Tracker'. "
            "Analyze the provided JSON financial summary and generate 3 to 4 concise, actionable, and specific insights. "
            "Output your insights as a JSON array of strings. "
            "RULES:\n"
            "- Do NOT invent or hallucinate any numbers or categories not present in the data.\n"
            "- Keep each insight under 120 characters.\n"
            "- Focus on spending patterns, budget utilization, and savings performance.\n"
            "- Output strictly valid JSON."
        )

    def _generate_mock_insights(self, data: dict) -> List[str]:
        """Deterministic mock insights based on actual user data without external calls."""
        insights = []
        monthly = data.get("monthly_summary", {})
        budgets = data.get("budgets", {})
        savings = data.get("savings_goals", {})
        
        income = monthly.get("total_income", 0)
        expenses = monthly.get("total_expenses", 0)
        
        # Insight 1: Net balance
        if income > expenses:
            insights.append(f"You have a positive net balance this month with a surplus of {data['currency']} {income - expenses:.2f}.")
        elif expenses > income and income > 0:
            insights.append(f"Warning: Your expenses ({data['currency']} {expenses}) currently exceed your income ({data['currency']} {income}).")
        
        # Insight 2: Budgets
        over = budgets.get("over_budget_categories", [])
        if over:
            insights.append(f"You have exceeded your budget in: {', '.join(over)}.")
        elif budgets.get("overall_utilization_percentage", 0) > 80:
            insights.append("Your overall budget utilization is running high (over 80%).")
        
        # Insight 3: Savings
        if monthly.get("savings_rate_percentage", 0) > 15:
            insights.append(f"Great job! Your savings rate is a healthy {monthly['savings_rate_percentage']}%.")
        elif savings.get("overall_progress_percentage", 0) > 0:
            insights.append(f"Your savings goals are progressing well at {savings['overall_progress_percentage']}% completion overall.")

        if not insights:
            insights.append("Keep logging your transactions to get more personalized insights!")

        return insights[:4]

    async def _call_openai(self, data: dict) -> List[str]:
        if not self.api_key:
            return ["Error: OpenAI API key is missing. Contact administrator."]
        
        model = self.model or "gpt-4o-mini"
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": self._get_system_prompt()},
                {"role": "user", "content": json.dumps(data)}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.5
        }
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(url, headers=headers, json=payload, timeout=15.0)
                resp.raise_for_status()
                result = resp.json()
                content = result["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                # handle varying json structures that might be returned
                if isinstance(parsed, list):
                    return parsed
                elif isinstance(parsed, dict) and "insights" in parsed:
                    return parsed["insights"]
                else:
                    return [str(v) for v in parsed.values() if isinstance(v, (str, list))]
        except Exception as e:
            logger.error(f"OpenAI API Error: {e}")
            return ["Error generating insights. Please try again later."]

    async def _call_gemini(self, data: dict) -> List[str]:
        if not self.api_key:
            return ["Error: Gemini API key is missing. Contact administrator."]
        
        model = self.model or "gemini-1.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{
                "parts": [
                    {"text": self._get_system_prompt()},
                    {"text": json.dumps(data)}
                ]
            }],
            "generationConfig": {
                "temperature": 0.5,
                "responseMimeType": "application/json"
            }
        }
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(url, headers=headers, json=payload, timeout=15.0)
                resp.raise_for_status()
                result = resp.json()
                content = result["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(content)
                if isinstance(parsed, list):
                    return parsed
                elif isinstance(parsed, dict) and "insights" in parsed:
                    return parsed["insights"]
                else:
                    return [str(v) for v in parsed.values() if isinstance(v, (str, list))]
        except Exception as e:
            logger.error(f"Gemini API Error: {e}")
            return ["Error generating insights. Please try again later."]

    async def _call_anthropic(self, data: dict) -> List[str]:
        if not self.api_key:
            return ["Error: Anthropic API key is missing. Contact administrator."]
        
        model = self.model or "claude-3-haiku-20240307"
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model,
            "max_tokens": 512,
            "temperature": 0.5,
            "system": self._get_system_prompt(),
            "messages": [
                {"role": "user", "content": json.dumps(data)}
            ]
        }
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(url, headers=headers, json=payload, timeout=15.0)
                resp.raise_for_status()
                result = resp.json()
                content = result["content"][0]["text"]
                # Anthropic does not guarantee strict JSON without careful prompting, but we can try parsing
                try:
                    parsed = json.loads(content)
                    if isinstance(parsed, list):
                        return parsed
                    elif isinstance(parsed, dict) and "insights" in parsed:
                        return parsed["insights"]
                except json.JSONDecodeError:
                    # Fallback if it returned bullet points
                    return [line.strip("- *") for line in content.split("\n") if line.strip("- *")]
        except Exception as e:
            logger.error(f"Anthropic API Error: {e}")
            return ["Error generating insights. Please try again later."]
