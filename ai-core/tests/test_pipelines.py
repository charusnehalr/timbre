import json
from unittest.mock import AsyncMock, patch

import pytest

from src.pipelines.generate_pipeline import GeneratePipeline
from src.agents.generator_agent import GeneratorAgent
from src.agents.critique_agent import CritiqueAgent
from src.schemas.generate import GenerateRequest
from src.schemas.voice_profile import VoiceProfile
from src.schemas.critique import Critique
from src.schemas.intent import Intent


FIXTURE_PROFILE = VoiceProfile(tone="direct", quirks=["punchy short sentences"])
FIXTURE_INTENT = Intent(intent="linkedin_post", desired_length="short")


@pytest.fixture
def mock_generator():
    agent = AsyncMock(spec=GeneratorAgent)
    agent.generate.return_value = "I built it. Shipped it. Done."
    return agent


@pytest.fixture
def mock_critique():
    agent = AsyncMock(spec=CritiqueAgent)
    agent.critique.return_value = Critique(
        score=0.91,
        strengths=["punchy"],
        issues=[],
        suggestions=[],
    )
    return agent


@pytest.fixture
def mock_router():
    provider = AsyncMock()
    provider.chat.return_value = FIXTURE_INTENT.model_dump_json()
    return provider


@pytest.mark.asyncio
async def test_pipeline_returns_best_draft(mock_generator, mock_critique, mock_router):
    pipeline = GeneratePipeline(
        generator=mock_generator,
        critique=mock_critique,
        router_provider=mock_router,
        light_model="llama-3.1-8b-instant",
    )
    req = GenerateRequest(
        user_name="Alex",
        profile=FIXTURE_PROFILE,
        task="Write a LinkedIn post about shipping fast",
        intent=FIXTURE_INTENT,
        retrieved_samples=["I shipped it. Nobody asked."],
    )
    result = await pipeline.run(req)
    assert result.draft == "I built it. Shipped it. Done."
    assert result.voice_match_score == pytest.approx(0.91)
    assert len(result.attempts) == 1  # stopped early (score >= 0.85)
