from pydantic import BaseModel, Field

from .voice_profile import VoiceProfile


class Critique(BaseModel):
    score: float = Field(ge=0.0, le=1.0)
    issues: list[str] = []
    suggestions: list[str] = []
    strengths: list[str] = []


class CritiqueRequest(BaseModel):
    draft: str
    profile: VoiceProfile
