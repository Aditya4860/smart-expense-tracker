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
from app.schemas.ai_schema import ChatMessage

# ── Simple In-Memory TTLCache ────────────────────────────────────────────────
# We cache AI insights per user for 5 minutes (300 seconds) to avoid heavy API usage.
_INSIGHTS_CACHE = {}
_RECOMMENDATIONS_CACHE = {}
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

    # ── Financial Recommendations Methods ────────────────────────────────────

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
                return cached_data, True, self.provider
            else:
                del _RECOMMENDATIONS_CACHE[cache_key]

        context_data = await self._gather_financial_context(user_id, currency)
        if not context_data:
            return [], False, self.provider

        system_prompt = self._get_recommendations_system_prompt()

        if self.provider == "mock":
            recs = self._recommend_mock(context_data)
        elif self.provider == "openai":
            recs = await self._recommend_openai(system_prompt, context_data)
        elif self.provider == "gemini":
            recs = await self._recommend_gemini(system_prompt, context_data)
        elif self.provider == "anthropic":
            recs = await self._recommend_anthropic(system_prompt, context_data)
        else:
            recs = self._recommend_mock(context_data)

        if recs:
            _RECOMMENDATIONS_CACHE[cache_key] = (recs, current_time)

        return recs, False, self.provider

    def _get_recommendations_system_prompt(self) -> str:
        return (
            "You are an expert AI Financial Advisor. "
            "Generate a maximum of 5 highly personalized, explainable financial recommendations based strictly on the provided JSON data. "
            "Output strictly valid JSON with a single key 'recommendations' containing an array of objects. "
            "Each object must have exactly these keys: 'title' (string), 'description' (string, actionable suggestion), 'type' (string, one of: BUDGET, SAVINGS, SPENDING, GOAL, WARNING), and 'evidence' (string, the exact math/fact driving this). "
            "RULES:\n"
            "- Never present predictions as guaranteed outcomes.\n"
            "- Do NOT invent numbers.\n"
            "- Be non-destructive (do not suggest deleting records blindly)."
        )

    def _recommend_mock(self, data: dict) -> List[dict]:
        recs = []
        monthly = data.get("monthly_summary", {})
        budgets = data.get("budgets", {})
        savings = data.get("savings_goals", {})

        income = monthly.get("total_income", 0)
        expenses = monthly.get("total_expenses", 0)

        if expenses > income and income > 0:
            recs.append({
                "title": "Immediate Spending Reduction",
                "description": "Consider halting all non-essential discretionary spending immediately until your next income cycle.",
                "type": "WARNING",
                "evidence": f"Your expenses ({data['currency']} {expenses}) currently exceed your income ({data['currency']} {income})."
            })
        
        over_budget = budgets.get("over_budget_categories", [])
        if over_budget:
            recs.append({
                "title": "Adjust Category Budgets",
                "description": f"You are overspending in some categories. Consider increasing the budget limit or reducing consumption for {', '.join(over_budget[:2])}.",
                "type": "BUDGET",
                "evidence": f"You have exceeded your allocated budget for {len(over_budget)} categor{'y' if len(over_budget) == 1 else 'ies'}."
            })

        if monthly.get("savings_rate_percentage", 0) < 20 and (income - expenses) > 0:
            recs.append({
                "title": "Increase Monthly Savings",
                "description": "Try transferring a portion of your remaining surplus into your savings goals to accelerate progress.",
                "type": "SAVINGS",
                "evidence": f"Your savings rate is currently {monthly.get('savings_rate_percentage', 0)}%, which is below the recommended 20% target."
            })
        
        if not recs:
            recs.append({
                "title": "Keep Up the Good Work!",
                "description": "You are managing your finances well. No urgent recommendations at this time.",
                "type": "GOAL",
                "evidence": "You have a positive net balance and no over-budget categories."
            })

        return recs[:5]

    async def _recommend_openai(self, system_prompt: str, data: dict) -> List[dict]:
        if not self.api_key: return []
        payload = {
            "model": self.model or "gpt-4o-mini",
            "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": json.dumps(data)}],
            "response_format": {"type": "json_object"},
            "temperature": 0.5
        }
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post("https://api.openai.com/v1/chat/completions", headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}, json=payload, timeout=20.0)
                resp.raise_for_status()
                parsed = json.loads(resp.json()["choices"][0]["message"]["content"])
                return parsed.get("recommendations", [])
        except Exception as e:
            logger.error(f"OpenAI Recommendation Error: {e}")
            return []

    async def _recommend_gemini(self, system_prompt: str, data: dict) -> List[dict]:
        if not self.api_key: return []
        payload = {
            "contents": [{"parts": [{"text": system_prompt}, {"text": json.dumps(data)}]}],
            "generationConfig": {"temperature": 0.5, "responseMimeType": "application/json"}
        }
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(f"https://generativelanguage.googleapis.com/v1beta/models/{self.model or 'gemini-1.5-flash'}:generateContent?key={self.api_key}", headers={"Content-Type": "application/json"}, json=payload, timeout=20.0)
                resp.raise_for_status()
                parsed = json.loads(resp.json()["candidates"][0]["content"]["parts"][0]["text"])
                return parsed.get("recommendations", [])
        except Exception as e:
            logger.error(f"Gemini Recommendation Error: {e}")
            return []

    async def _recommend_anthropic(self, system_prompt: str, data: dict) -> List[dict]:
        if not self.api_key: return []
        payload = {
            "model": self.model or "claude-3-haiku-20240307",
            "max_tokens": 1024,
            "temperature": 0.5,
            "system": system_prompt,
            "messages": [{"role": "user", "content": json.dumps(data)}]
        }
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post("https://api.anthropic.com/v1/messages", headers={"x-api-key": self.api_key, "anthropic-version": "2023-06-01", "Content-Type": "application/json"}, json=payload, timeout=20.0)
                resp.raise_for_status()
                content = resp.json()["content"][0]["text"]
                parsed = json.loads(content)
                return parsed.get("recommendations", [])
        except Exception as e:
            logger.error(f"Anthropic Recommendation Error: {e}")
            return []

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

    # ── Conversational Chat Methods ──────────────────────────────────────────

    async def chat(self, user_id: uuid.UUID, currency: str, messages: List[ChatMessage]) -> str:
        """
        Conversational assistant method.
        Limits to last 10 messages to prevent token overflow.
        """
        # Truncate history
        if len(messages) > 10:
            messages = messages[-10:]

        context_data = await self._gather_financial_context(user_id, currency)
        if not context_data:
            return "I don't have enough financial data to answer that. Try logging some income or expenses first!"

        system_prompt = self._get_chat_system_prompt(context_data)

        if self.provider == "mock":
            return self._chat_mock(messages, context_data)
        elif self.provider == "openai":
            return await self._chat_openai(system_prompt, messages)
        elif self.provider == "gemini":
            return await self._chat_gemini(system_prompt, messages)
        elif self.provider == "anthropic":
            return await self._chat_anthropic(system_prompt, messages)
        else:
            logger.warning(f"Unknown AI provider '{self.provider}', falling back to mock chat.")
            return self._chat_mock(messages, context_data)

    def _get_chat_system_prompt(self, data: dict) -> str:
        data_str = json.dumps(data)
        return (
            "You are an expert AI Financial Assistant for 'Smart Expense Tracker'. "
            "You must answer the user's questions based strictly on the following JSON financial summary:\n\n"
            f"{data_str}\n\n"
            "RULES:\n"
            "- Do NOT invent, assume, or hallucinate any numbers.\n"
            "- If the data does not contain the answer, explicitly state that you don't have that information.\n"
            "- You cannot modify, create, or delete any financial records. If requested, politely decline.\n"
            "- Keep your answers concise, professional, and directly address the user's question."
        )

    def _chat_mock(self, messages: List[ChatMessage], data: dict) -> str:
        # Very simple deterministic mock based on the last user message
        last_msg = messages[-1].content.lower()
        if "spend" in last_msg or "spent" in last_msg or "expense" in last_msg:
            return f"You have spent {data['currency']} {data['monthly_summary'].get('total_expenses', 0):.2f} this month."
        if "save" in last_msg or "saving" in last_msg:
            return f"Your savings rate is {data['monthly_summary'].get('savings_rate_percentage', 0)}% this month."
        if "budget" in last_msg:
            return f"Your budget utilization is {data['budgets'].get('overall_utilization_percentage', 0)}%."
        return "I am a mock assistant. Please connect a real AI provider to answer complex questions!"

    async def _chat_openai(self, system_prompt: str, messages: List[ChatMessage]) -> str:
        if not self.api_key:
            return "Error: OpenAI API key is missing. Contact administrator."
        
        model = self.model or "gpt-4o-mini"
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload_messages = [{"role": "system", "content": system_prompt}]
        for m in messages:
            payload_messages.append({"role": m.role, "content": m.content})
            
        payload = {
            "model": model,
            "messages": payload_messages,
            "temperature": 0.5
        }
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(url, headers=headers, json=payload, timeout=20.0)
                resp.raise_for_status()
                return resp.json()["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"OpenAI Chat API Error: {e}")
            return "I'm sorry, but I'm having trouble connecting to my servers right now."

    async def _chat_gemini(self, system_prompt: str, messages: List[ChatMessage]) -> str:
        if not self.api_key:
            return "Error: Gemini API key is missing. Contact administrator."
        
        model = self.model or "gemini-1.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        
        contents = []
        for m in messages:
            role = "model" if m.role == "assistant" else "user"
            contents.append({
                "role": role,
                "parts": [{"text": m.content}]
            })
            
        payload = {
            "systemInstruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": contents,
            "generationConfig": {
                "temperature": 0.5
            }
        }
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(url, headers=headers, json=payload, timeout=20.0)
                resp.raise_for_status()
                return resp.json()["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            logger.error(f"Gemini Chat API Error: {e}")
            return "I'm sorry, but I'm having trouble connecting to my servers right now."

    async def _chat_anthropic(self, system_prompt: str, messages: List[ChatMessage]) -> str:
        if not self.api_key:
            return "Error: Anthropic API key is missing. Contact administrator."
        
        model = self.model or "claude-3-haiku-20240307"
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        }
        
        payload_messages = [{"role": m.role, "content": m.content} for m in messages]
        
        payload = {
            "model": model,
            "max_tokens": 512,
            "temperature": 0.5,
            "system": system_prompt,
            "messages": payload_messages
        }
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(url, headers=headers, json=payload, timeout=20.0)
                resp.raise_for_status()
                return resp.json()["content"][0]["text"]
        except Exception as e:
            logger.error(f"Anthropic Chat API Error: {e}")
            return "I'm sorry, but I'm having trouble connecting to my servers right now."
