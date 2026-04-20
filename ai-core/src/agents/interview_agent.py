from ..providers.base import LLMProvider
from ..rag.assembler import PromptAssembler

_assembler = PromptAssembler()


class InterviewAgent:
    def __init__(self, provider: LLMProvider, model: str):
        self.provider = provider
        self.model = model
        self._system = _assembler.build("interview_system.md", {})

    async def turn(self, history: list[dict]) -> tuple[str, list[str]]:
        """
        Returns (reply_text, captured_facts).
        history is a list of {"role": "user"|"assistant", "content": str}.
        """
        messages = [{"role": "system", "content": self._system}, *history]
        reply = await self.provider.chat(self.model, messages)
        captured_facts = self._extract_facts(history)
        return reply, captured_facts

    def _extract_facts(self, history: list[dict]) -> list[str]:
        return [m["content"] for m in history if m["role"] == "user" and len(m["content"]) > 20]
