from typing import List, Optional
from enum import Enum
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

class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the message author: 'user' or 'assistant'")
    content: str = Field(..., description="Text content of the message")

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., description="Conversation history")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "messages": [
                    {"role": "user", "content": "How much did I spend this month?"}
                ]
            }
        }
    )

class ChatResponse(BaseModel):
    success: bool = True
    reply: str = Field(..., description="The AI assistant's reply")
    provider: str = Field(..., description="The AI provider used")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "success": True,
                "reply": "You have spent ₹42,500.50 so far this month.",
                "provider": "mock"
            }
        }
    )

class RecommendationType(str, Enum):
    BUDGET = "BUDGET"
    SAVINGS = "SAVINGS"
    SPENDING = "SPENDING"
    GOAL = "GOAL"
    WARNING = "WARNING"

class Recommendation(BaseModel):
    title: str = Field(..., description="Short title of the recommendation")
    description: str = Field(..., description="Detailed actionable suggestion")
    type: RecommendationType = Field(..., description="Category of the recommendation")
    evidence: str = Field(..., description="The specific math or financial fact driving this suggestion")

class RecommendationResponse(BaseModel):
    success: bool = True
    recommendations: List[Recommendation] = Field(..., description="A list of structured AI-generated recommendations")
    provider: str = Field(..., description="The AI provider used")
    cached: bool = Field(False, description="Whether these recommendations were retrieved from cache")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "success": True,
                "recommendations": [
                    {
                        "title": "Reduce Dining Out",
                        "description": "Consider cooking at home more often to stay within your food budget.",
                        "type": "SPENDING",
                        "evidence": "You have spent 85% of your ₹10,000 Food budget with 10 days left in the month."
                    }
                ],
                "provider": "mock",
                "cached": False
            }
        }
    )
