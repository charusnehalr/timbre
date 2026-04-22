import logging
from typing import AsyncIterator

from openai import APIError

from .base import LLMProvider

logger = logging.getLogger(__name__)


class ProviderRouter(LLMProvider):
    """Routes calls to primary (Groq); falls back to Gemini on any API error."""

    def __init__(self, primary: LLMProvider, fallback: LLMProvider, fallback_model: str):
        self.primary = primary
        self.fallback = fallback
        self.fallback_model = fallback_model

    async def chat(self, model: str, messages: list[dict], **kwargs) -> str:
        try:
            return await self.primary.chat(model, messages, **kwargs)
        except Exception as exc:
            logger.warning("Primary provider error (%s: %s) — falling back to Gemini", type(exc).__name__, exc)
            # Gemini doesn't support response_format — strip it before forwarding
            kwargs.pop("response_format", None)
            try:
                return await self.fallback.chat(self.fallback_model, messages, **kwargs)
            except Exception as fallback_exc:
                logger.error("Fallback provider also failed (%s: %s)", type(fallback_exc).__name__, fallback_exc)
                raise RuntimeError(
                    f"Both providers failed. Primary: {type(exc).__name__}: {exc}. "
                    f"Fallback: {type(fallback_exc).__name__}: {fallback_exc}"
                ) from fallback_exc

    async def chat_stream(self, model: str, messages: list[dict], **kwargs) -> AsyncIterator[str]:
        try:
            async for chunk in self.primary.chat_stream(model, messages, **kwargs):
                yield chunk
        except Exception as exc:
            logger.warning("Primary stream error (%s: %s) — falling back to Gemini", type(exc).__name__, exc)
            kwargs.pop("response_format", None)
            async for chunk in self.fallback.chat_stream(self.fallback_model, messages, **kwargs):
                yield chunk
