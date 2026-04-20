import json

from ..providers.base import LLMProvider
from ..rag.assembler import PromptAssembler
from ..schemas.critique import Critique
from ..schemas.voice_profile import VoiceProfile

_assembler = PromptAssembler()


class CritiqueAgent:
    def __init__(self, provider: LLMProvider, model: str):
        self.provider = provider
        self.model = model

    async def critique(self, draft: str, profile: VoiceProfile) -> Critique:
        prompt = _assembler.build(
            "critique_system.md",
            {
                "profile": profile.model_dump_json(indent=2),
                "draft": draft,
            },
        )
        messages = [{"role": "user", "content": prompt}]
        raw = await self.provider.chat(
            self.model,
            messages,
            response_format={"type": "json_object"},
        )
        data = json.loads(raw)
        return Critique.model_validate(data)
