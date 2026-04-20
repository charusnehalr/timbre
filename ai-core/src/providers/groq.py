from typing import AsyncIterator

from openai import AsyncOpenAI

from .base import LLMProvider


class GroqProvider(LLMProvider):
    def __init__(self, api_key: str, whisper_model: str = "whisper-large-v3"):
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1",
        )
        self.whisper_model = whisper_model

    async def chat(self, model: str, messages: list[dict], **kwargs) -> str:
        res = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            **kwargs,
        )
        return res.choices[0].message.content

    async def chat_stream(self, model: str, messages: list[dict], **kwargs) -> AsyncIterator[str]:
        stream = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            stream=True,
            **kwargs,
        )
        async for chunk in stream:
            if content := chunk.choices[0].delta.content:
                yield content

    async def transcribe(self, audio_bytes: bytes, filename: str = "audio.webm") -> str:
        res = await self.client.audio.transcriptions.create(
            model=self.whisper_model,
            file=(filename, audio_bytes),
        )
        return res.text
