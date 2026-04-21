from typing import AsyncIterator

from ..providers.base import LLMProvider


class GeneratorAgent:
    def __init__(self, provider: LLMProvider, model: str):
        self.provider = provider
        self.model = model

    async def generate(self, system_prompt: str, feedback: str | None = None) -> str:
        messages: list[dict] = [{"role": "system", "content": system_prompt}]
        if feedback:
            messages.append(
                {
                    "role": "user",
                    "content": f"Previous attempt issues to fix:\n{feedback}\n\nWrite an improved draft.",
                }
            )
        else:
            messages.append({"role": "user", "content": "Write the draft now."})
        return await self.provider.chat(self.model, messages)

    async def generate_stream(
        self, system_prompt: str, feedback: str | None = None
    ) -> AsyncIterator[str]:
        messages: list[dict] = [{"role": "system", "content": system_prompt}]
        if feedback:
            messages.append(
                {
                    "role": "user",
                    "content": f"Previous attempt issues to fix:\n{feedback}\n\nWrite an improved draft.",
                }
            )
        else:
            messages.append({"role": "user", "content": "Write the draft now."})
        async for chunk in self.provider.chat_stream(self.model, messages):
            yield chunk
