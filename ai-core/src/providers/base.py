from abc import ABC, abstractmethod
from typing import AsyncIterator


class LLMProvider(ABC):
    @abstractmethod
    async def chat(self, model: str, messages: list[dict], **kwargs) -> str: ...

    @abstractmethod
    async def chat_stream(self, model: str, messages: list[dict], **kwargs) -> AsyncIterator[str]: ...
