from abc import ABC, abstractmethod
from typing import List

class LLMProvider(ABC):
    @abstractmethod
    async def get_insights(self, data: dict) -> List[str]:
        """Generate financial insights based on the provided data."""
        pass

    @abstractmethod
    async def get_recommendations(self, data: dict) -> List[dict]:
        """Generate financial recommendations based on the provided data."""
        pass

    @abstractmethod
    async def get_chat_reply(self, messages: List[dict], context_data: dict) -> str:
        """Generate a chat reply based on conversation history and context data."""
        pass
