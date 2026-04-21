import json
from unittest.mock import AsyncMock

import pytest

from src.agents.style_analyzer import StyleAnalyzer
from src.schemas.voice_profile import VoiceProfile


@pytest.fixture
def mock_provider():
    provider = AsyncMock()
    profile = VoiceProfile(
        tone="direct and confident",
        quirks=["starts with a claim, not context"],
    )
    provider.chat.return_value = profile.model_dump_json()
    return provider


@pytest.mark.asyncio
async def test_analyze_returns_voice_profile(mock_provider):
    analyzer = StyleAnalyzer(provider=mock_provider, model="llama-3.3-70b-versatile")
    samples = ["I shipped it. Nobody asked. I just did.", "The meeting was a waste. Here's why."]
    result = await analyzer.analyze(samples)
    assert isinstance(result, VoiceProfile)
    assert result.tone == "direct and confident"
    mock_provider.chat.assert_called_once()
