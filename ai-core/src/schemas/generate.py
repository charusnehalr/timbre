from pydantic import BaseModel

from .voice_profile import VoiceProfile
from .critique import Critique
from .intent import Intent


class GenerationAttempt(BaseModel):
    attempt_number: int
    draft: str
    critique: Critique


class GenerateRequest(BaseModel):
    user_name: str
    profile: VoiceProfile
    task: str
    intent: Intent | None = None
    retrieved_samples: list[str] = []
    space_id: str = ""


class GenerateResponse(BaseModel):
    draft: str
    voice_match_score: float
    attempts: list[GenerationAttempt]
