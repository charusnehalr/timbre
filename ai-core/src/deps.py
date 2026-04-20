from fastapi import Depends, HTTPException, Header

from .config import settings
from .providers.groq import GroqProvider
from .providers.gemini import GeminiProvider
from .providers.router import ProviderRouter
from .agents.interview_agent import InterviewAgent
from .agents.style_analyzer import StyleAnalyzer
from .agents.critique_agent import CritiqueAgent
from .agents.generator_agent import GeneratorAgent
from .pipelines.generate_pipeline import GeneratePipeline

# Singletons — constructed once at startup
_groq = GroqProvider(api_key=settings.groq_api_key, whisper_model=settings.whisper_model)
_gemini = GeminiProvider(api_key=settings.gemini_api_key, embed_model=settings.embed_model)
_router = ProviderRouter(primary=_groq, fallback=_gemini, fallback_model=settings.fallback_model)


async def verify_secret(x_internal_secret: str = Header(...)):
    if x_internal_secret != settings.ai_core_secret:
        raise HTTPException(status_code=401, detail="Unauthorized")


def get_groq_provider() -> GroqProvider:
    return _groq


def get_gemini_provider() -> GeminiProvider:
    return _gemini


def get_interview_agent() -> InterviewAgent:
    return InterviewAgent(provider=_router, model=settings.heavy_model)


def get_style_analyzer() -> StyleAnalyzer:
    return StyleAnalyzer(provider=_router, model=settings.heavy_model)


def get_generate_pipeline() -> GeneratePipeline:
    generator = GeneratorAgent(provider=_router, model=settings.generator_model)
    critique = CritiqueAgent(provider=_router, model=settings.light_model)
    return GeneratePipeline(
        generator=generator,
        critique=critique,
        router_provider=_router,
        light_model=settings.light_model,
    )
