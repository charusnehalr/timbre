from typing import AsyncIterator

import google.generativeai as genai

from .base import LLMProvider


class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str, embed_model: str = "models/text-embedding-004"):
        genai.configure(api_key=api_key)
        self.embed_model = embed_model

    async def chat(self, model: str, messages: list[dict], **kwargs) -> str:
        gemini_model = genai.GenerativeModel(model)
        prompt = self._messages_to_prompt(messages)
        response = await gemini_model.generate_content_async(prompt)
        return response.text

    async def chat_stream(self, model: str, messages: list[dict], **kwargs) -> AsyncIterator[str]:
        gemini_model = genai.GenerativeModel(model)
        prompt = self._messages_to_prompt(messages)
        async for chunk in await gemini_model.generate_content_async(prompt, stream=True):
            if chunk.text:
                yield chunk.text

    async def embed(self, text: str) -> list[float]:
        result = genai.embed_content(
            model=self.embed_model,
            content=text,
        )
        return result["embedding"]

    def _messages_to_prompt(self, messages: list[dict]) -> str:
        return "\n\n".join(f"{m['role'].upper()}: {m['content']}" for m in messages)
