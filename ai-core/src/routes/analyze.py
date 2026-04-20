from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ..agents.style_analyzer import StyleAnalyzer
from ..schemas.voice_profile import VoiceProfile
from ..deps import get_style_analyzer, verify_secret

router = APIRouter(prefix="/analyze", tags=["analyze"])


class StyleRequest(BaseModel):
    samples: list[str]


@router.post("/style", response_model=VoiceProfile, dependencies=[Depends(verify_secret)])
async def analyze_style(
    body: StyleRequest,
    analyzer: StyleAnalyzer = Depends(get_style_analyzer),
):
    return await analyzer.analyze(body.samples)
