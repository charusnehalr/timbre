from ..agents.interview_agent import InterviewAgent
from ..agents.style_analyzer import StyleAnalyzer
from ..schemas.voice_profile import VoiceProfile


class OnboardingPipeline:
    def __init__(self, interview_agent: InterviewAgent, style_analyzer: StyleAnalyzer):
        self.interview = interview_agent
        self.analyzer = style_analyzer

    async def interview_turn(
        self, history: list[dict]
    ) -> tuple[str, list[str]]:
        return await self.interview.turn(history)

    async def analyze_style(self, samples: list[str]) -> VoiceProfile:
        return await self.analyzer.analyze(samples)
