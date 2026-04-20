import json
from unittest.mock import AsyncMock

import pytest

from src.agents.critique_agent import CritiqueAgent
from src.schemas.critique import Critique
from src.schemas.voice_profile import VoiceProfile


@pytest.fixture
def mock_provider():
    provider = AsyncMock()
    provider.chat.return_value = json.dumps({
        "score": 0.82,
        "issues": ["uses 'leverage' which is in avoid list"],
        "suggestions": ["replace 'leverage' with 'use'"],
        "strengths": ["strong opening claim"],
    })
    return provider


@pytest.mark.asyncio
async def test_critique_returns_score(mock_provider):
    agent = CritiqueAgent(provider=mock_provider, model="llama-3.1-8b-instant")
    profile = VoiceProfile(tone="blunt")
    result = await agent.critique(draft="We leverage synergies.", profile=profile)
    assert isinstance(result, Critique)
    assert result.score == pytest.approx(0.82)
    assert len(result.issues) == 1
