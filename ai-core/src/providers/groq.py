import time
from typing import AsyncIterator

import structlog
from openai import AsyncOpenAI

from .base import LLMProvider

log = structlog.get_logger(__name__)


class GroqProvider(LLMProvider):
    def __init__(self, api_key: str, whisper_model: str = "whisper-large-v3"):
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1",
        )
        self.whisper_model = whisper_model
        log.info("groq_provider_ready", whisper_model=whisper_model)

    async def chat(self, model: str, messages: list[dict], **kwargs) -> str:
        log.info("groq_chat_start", model=model, turns=len(messages))
        start = time.perf_counter()
        try:
            res = await self.client.chat.completions.create(
                model=model, messages=messages, **kwargs,
            )
            log.info("groq_chat_done", model=model, ms=round((time.perf_counter() - start) * 1000))
            return res.choices[0].message.content
        except Exception as exc:
            log.error("groq_chat_failed", model=model, error=str(exc))
            raise

    async def chat_stream(self, model: str, messages: list[dict], **kwargs) -> AsyncIterator[str]:
        log.info("groq_chat_stream_start", model=model)
        try:
            stream = await self.client.chat.completions.create(
                model=model, messages=messages, stream=True, **kwargs,
            )
            async for chunk in stream:
                if content := chunk.choices[0].delta.content:
                    yield content
        except Exception as exc:
            log.error("groq_chat_stream_failed", model=model, error=str(exc))
            raise

    async def transcribe(self, audio_bytes: bytes, filename: str = "audio.webm") -> str:
        log.info("groq_transcribe_start", bytes=len(audio_bytes))
        start = time.perf_counter()
        try:
            res = await self.client.audio.transcriptions.create(
                model=self.whisper_model, file=(filename, audio_bytes),
            )
            log.info("groq_transcribe_done", ms=round((time.perf_counter() - start) * 1000))
            return res.text
        except Exception as exc:
            log.error("groq_transcribe_failed", error=str(exc))
            raise
