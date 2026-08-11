from typing import List
from app.services.ai_providers.base import LLMProvider

class MockProvider(LLMProvider):
    async def get_insights(self, data: dict) -> List[str]:
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
            insights.append(f"Great job! Your savings rate is a healthy {monthly.get('savings_rate_percentage', 0)}%.")
        
        if not insights:
            insights.append("Your spending is stable. Keep tracking your expenses to get deeper insights.")
            
        return insights[:4]

    async def get_recommendations(self, data: dict) -> List[dict]:
        recs = []
        monthly = data.get("monthly_summary", {})
        budgets = data.get("budgets", {})
        
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

    async def get_chat_reply(self, messages: List[dict], context_data: dict) -> str:
        last_msg = messages[-1]["content"].lower() if messages else ""
        monthly = context_data.get("monthly_summary", {})
        
        if "spend" in last_msg or "expense" in last_msg:
            return f"Based on your data, you have spent {context_data['currency']} {monthly.get('total_expenses', 0):.2f} this month."
        elif "save" in last_msg or "saving" in last_msg:
            return f"Your savings rate is {monthly.get('savings_rate_percentage', 0)}% this month."
        elif "budget" in last_msg:
            budgets = context_data.get("budgets", {})
            return f"Your overall budget utilization is {budgets.get('overall_utilization_percentage', 0)}% across {budgets.get('total_budgets', 0)} budgets."
        
        return "I can help you analyze your spending, check your budgets, or review your savings goals. What would you like to know?"
