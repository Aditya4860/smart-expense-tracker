import json
import logging
from typing import List
from google import genai
from google.genai import types

from app.services.ai_providers.base import LLMProvider
from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiProvider(LLMProvider):
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY environment variable is missing. Cannot use GeminiProvider.")
        
        # Use v1alpha for best compatibility and aio for async support
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY, 
            http_options={'api_version': 'v1alpha'}
        )
        self.model = settings.AI_MODEL or "gemini-3.5-flash"

    async def get_insights(self, data: dict) -> List[str]:
        system_prompt = (
            "You are an expert AI Financial Advisor for 'Smart Expense Tracker'. "
            "Analyze the provided JSON financial summary and generate 3 to 4 concise, actionable, and specific insights. "
            "Output your insights as a JSON array of strings. "
            "RULES:\n"
            "- Do NOT invent or hallucinate any numbers or categories not present in the data.\n"
            "- Keep each insight under 120 characters.\n"
            "- Focus on spending patterns, budget utilization, and savings performance.\n"
            "- Output strictly valid JSON array."
        )
        
        contents = [
            types.Content(role="user", parts=[
                types.Part.from_text(text=system_prompt),
                types.Part.from_text(text=json.dumps(data))
            ])
        ]
        
        try:
            response = await self.client.aio.models.generate_content(
                model=self.model,
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.5
                )
            )
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            elif text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            parsed = json.loads(text.strip())
            # Ensure it is a list of strings
            if isinstance(parsed, list):
                return [str(i) for i in parsed]
            elif isinstance(parsed, dict) and "insights" in parsed:
                return [str(i) for i in parsed["insights"]]
            return []
        except Exception as e:
            logger.error(f"Gemini Insights Error: {e}")
            raise RuntimeError("Failed to generate insights with Gemini API") from e

    async def get_recommendations(self, data: dict) -> List[dict]:
        system_prompt = (
            "You are an expert AI Financial Advisor. "
            "Generate a maximum of 5 highly personalized, explainable financial recommendations based strictly on the provided JSON data. "
            "Output strictly valid JSON with a single key 'recommendations' containing an array of objects. "
            "Each object must have exactly these keys: 'title' (string), 'description' (string, actionable suggestion), 'type' (string, one of: BUDGET, SAVINGS, SPENDING, GOAL, WARNING), and 'evidence' (string, the exact math/fact driving this). "
            "RULES:\n"
            "- Never present predictions as guaranteed outcomes.\n"
            "- Do NOT invent numbers.\n"
            "- Be non-destructive (do not suggest deleting records blindly)."
        )
        
        contents = [
            types.Content(role="user", parts=[
                types.Part.from_text(text=system_prompt),
                types.Part.from_text(text=json.dumps(data))
            ])
        ]
        
        try:
            response = await self.client.aio.models.generate_content(
                model=self.model,
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.5
                )
            )
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            elif text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            parsed = json.loads(text.strip())
            if isinstance(parsed, dict):
                return parsed.get("recommendations", [])
            elif isinstance(parsed, list):
                return parsed
            return []
        except Exception as e:
            logger.error(f"Gemini Recommendation Error: {e}")
            raise RuntimeError("Failed to generate recommendations with Gemini API") from e

    async def get_chat_reply(self, messages: List[dict], context_data: dict) -> str:
        system_prompt = (
            "You are a helpful Financial Assistant. "
            "You have access to the user's financial summary in JSON format. "
            "Use ONLY this data to answer the user's questions. Do NOT invent numbers. "
            "If the user asks something outside the scope of this data, politely decline."
            "\n\nFINANCIAL DATA:\n" + json.dumps(context_data)
        )
        
        contents = [
            types.Content(role="user", parts=[types.Part.from_text(text=system_prompt)])
        ]
        
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append(
                types.Content(role=role, parts=[types.Part.from_text(text=msg["content"])])
            )
            
        try:
            response = await self.client.aio.models.generate_content(
                model=self.model,
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=0.7
                )
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini Chat Error: {e}")
            raise RuntimeError("Failed to generate chat reply with Gemini API") from e
