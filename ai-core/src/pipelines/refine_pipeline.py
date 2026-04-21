from ..agents.style_analyzer import StyleAnalyzer
from ..schemas.voice_profile import VoiceProfile


class RefinePipeline:
    """Merges new samples into an existing voice profile."""

    def __init__(self, analyzer: StyleAnalyzer):
        self.analyzer = analyzer

    async def refine(
        self,
        existing_profile: VoiceProfile,
        new_samples: list[str],
    ) -> VoiceProfile:
        # Re-analyze with new samples; existing profile context is prepended as a sample
        context_sample = (
            f"[Existing voice profile summary]\n{existing_profile.model_dump_json(indent=2)}"
        )
        return await self.analyzer.analyze([context_sample, *new_samples])
