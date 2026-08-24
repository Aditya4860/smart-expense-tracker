# pyrefly: ignore [missing-import]
from fastapi import APIRouter

api_router = APIRouter()

# Example router inclusions (commented out until modules are created)
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.expense import router as expenses_router
from app.api.v1.income import router as income_router
from app.api.v1.budget import router as budget_router
from app.api.v1.goals import router as goals_router
from app.api.v1.category import router as category_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.recurring_transactions import router as recurring_router
from app.api.v1.reminders import router as reminders_router
from app.api.v1.reports import router as reports_router
from app.api.v1.ai import router as ai_router
from app.api.v1.oauth import router as oauth_router
from app.api.v1.enquiries import router as enquiries_router

api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(oauth_router, prefix="/oauth", tags=["OAuth"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(expenses_router, prefix="/expenses", tags=["Expenses"])
api_router.include_router(income_router, prefix="/income", tags=["Income"])
api_router.include_router(budget_router, prefix="/budget", tags=["Budget"])
api_router.include_router(goals_router, prefix="/goals", tags=["Goals"])
api_router.include_router(category_router, prefix="/categories", tags=["Categories"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(recurring_router, prefix="/recurring-transactions", tags=["Recurring Transactions"])
api_router.include_router(reminders_router, prefix="/reminders", tags=["Reminders"])
api_router.include_router(reports_router, prefix="/reports", tags=["Reports"])
api_router.include_router(ai_router, prefix="/ai", tags=["AI Insights"])
api_router.include_router(enquiries_router, prefix="/enquiries", tags=["Enquiries"])


