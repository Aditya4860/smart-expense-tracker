from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

class InsightResponse(BaseModel):
    success: bool = True
    insights: List[str] = Field(..., description="A list of concise AI-generated financial insights")
    provider: str = Field(..., description="The AI provider that generated these insights (e.g. mock, openai, gemini)")
    cached: bool = Field(False, description="Whether these insights were retrieved from cache")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "success": True,
                "insights": [
                    "Food spending increased 18% compared with last month.",
                    "Your entertainment category is approaching its monthly budget.",
                    "Your savings rate improved compared with the previous month."
                ],
                "provider": "mock",
                "cached": False
            }
        }
    )
