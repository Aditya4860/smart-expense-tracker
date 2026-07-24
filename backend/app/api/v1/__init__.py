# pyrefly: ignore [missing-import]
from fastapi import APIRouter

api_router = APIRouter()

# Example router inclusions (commented out until modules are created)
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
# from app.api.v1.expenses import router as expenses_router
# from app.api.v1.income import router as income_router
# from app.api.v1.budget import router as budget_router
# from app.api.v1.goals import router as goals_router
# from app.api.v1.analytics import router as analytics_router

api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
# api_router.include_router(expenses_router, prefix="/expenses", tags=["Expenses"])
# api_router.include_router(income_router, prefix="/income", tags=["Income"])
# api_router.include_router(budget_router, prefix="/budget", tags=["Budget"])
# api_router.include_router(goals_router, prefix="/goals", tags=["Goals"])
# api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
