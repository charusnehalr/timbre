import structlog
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ..agents.style_analyzer import StyleAnalyzer
from ..schemas.voice_profile import VoiceProfile
from ..deps import get_style_analyzer, verify_secret

log = structlog.get_logger(__name__)
router = APIRouter(prefix="/analyze", tags=["analyze"])


class StyleRequest(BaseModel):
    samples: list[str]


@router.post("/style", response_model=VoiceProfile, dependencies=[Depends(verify_secret)])
async def analyze_style(
    body: StyleRequest,
    analyzer: StyleAnalyzer = Depends(get_style_analyzer),
):
    total_words = sum(len(s.split()) for s in body.samples)
    log.info("analyze_style_start", samples=len(body.samples), total_words=total_words)
    try:
        result = await analyzer.analyze(body.samples)
        log.info("analyze_style_done", tone=result.tone)
        return result
    except Exception as exc:
        log.error("analyze_style_error", error=str(exc))
        raise
