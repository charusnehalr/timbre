import time
from typing import AsyncIterator

import httpx
import structlog
from google import genai

from .base import LLMProvider

log = structlog.get_logger(__name__)

_EMBED_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:embedContent"


class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str, embed_model: str = "gemini-embedding-001"):
        self.client = genai.Client(api_key=api_key)
        self.api_key = api_key
        self.embed_model = embed_model
        log.info("gemini_provider_ready", embed_model=embed_model)

    async def chat(self, model: str, messages: list[dict], **kwargs) -> str:
        log.info("gemini_chat_start", model=model, turns=len(messages))
        start = time.perf_counter()
        contents = self._messages_to_prompt(messages)
        response = await self.client.aio.models.generate_content(
            model=model,
            contents=contents,
        )
        log.info("gemini_chat_done", model=model, ms=round((time.perf_counter() - start) * 1000))
        text = response.text or ""
        # Strip markdown code fences that Gemini sometimes wraps around JSON
        if text.startswith("```"):
            text = text.split("```", 2)[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.rsplit("```", 1)[0].strip()
        return text

    async def chat_stream(self, model: str, messages: list[dict], **kwargs) -> AsyncIterator[str]:
        log.info("gemini_chat_stream_start", model=model)
        async for chunk in await self.client.aio.models.generate_content_stream(
            model=model,
            contents=self._messages_to_prompt(messages),
        ):
            if chunk.text:
                yield chunk.text

    async def embed(self, text: str) -> list[float]:
        log.info("gemini_embed_start", model=self.embed_model, chars=len(text))
        start = time.perf_counter()
        url = _EMBED_URL.format(model=self.embed_model)
        payload = {
            "content": {"parts": [{"text": text}]},
            "taskType": "RETRIEVAL_DOCUMENT",
            "outputDimensionality": 768,
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, params={"key": self.api_key})
            if not resp.is_success:
                log.error("gemini_embed_failed", status=resp.status_code, body=resp.text)
                raise RuntimeError(f"Gemini embed failed {resp.status_code}: {resp.text}")
            values = resp.json()["embedding"]["values"]
            log.info("gemini_embed_done", dims=len(values), ms=round((time.perf_counter() - start) * 1000))
            return values

    def _messages_to_prompt(self, messages: list[dict]) -> str:
        return "\n\n".join(f"{m['role'].upper()}: {m['content']}" for m in messages)
