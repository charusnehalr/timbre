import json

from ..providers.base import LLMProvider
from ..rag.assembler import PromptAssembler
from ..schemas.voice_profile import VoiceProfile

_assembler = PromptAssembler()
_SCHEMA = json.dumps(VoiceProfile.model_json_schema(), indent=2)


class StyleAnalyzer:
    def __init__(self, provider: LLMProvider, model: str):
        self.provider = provider
        self.model = model

    async def analyze(self, samples: list[str]) -> VoiceProfile:
        combined = "\n\n---\n\n".join(samples)
        prompt = _assembler.build(
            "style_analysis.md",
            {"samples": combined, "schema": _SCHEMA},
        )
        messages = [{"role": "user", "content": prompt}]
        raw = await self.provider.chat(
            self.model,
            messages,
            response_format={"type": "json_object"},
        )
        return VoiceProfile.model_validate_json(raw)
