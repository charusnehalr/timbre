import logging
from typing import AsyncIterator

from openai import RateLimitError

from .base import LLMProvider

logger = logging.getLogger(__name__)


class ProviderRouter(LLMProvider):
    """Routes calls to the primary provider; falls back on rate-limit errors."""

    def __init__(self, primary: LLMProvider, fallback: LLMProvider, fallback_model: str):
        self.primary = primary
        self.fallback = fallback
        self.fallback_model = fallback_model

    async def chat(self, model: str, messages: list[dict], **kwargs) -> str:
        try:
            return await self.primary.chat(model, messages, **kwargs)
        except RateLimitError:
            logger.warning("Primary provider rate-limited — falling back to Gemini")
            return await self.fallback.chat(self.fallback_model, messages, **kwargs)

    async def chat_stream(self, model: str, messages: list[dict], **kwargs) -> AsyncIterator[str]:
        try:
            async for chunk in self.primary.chat_stream(model, messages, **kwargs):
                yield chunk
        except RateLimitError:
            logger.warning("Primary provider rate-limited (stream) — falling back to Gemini")
            async for chunk in self.fallback.chat_stream(self.fallback_model, messages, **kwargs):
                yield chunk
