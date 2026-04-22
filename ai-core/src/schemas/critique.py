from pydantic import BaseModel, Field, field_validator

from .voice_profile import VoiceProfile


class Critique(BaseModel):
    score: float = 0.75
    issues: list[str] = []
    suggestions: list[str] = []
    strengths: list[str] = []

    @field_validator("score", mode="before")
    @classmethod
    def clamp_score(cls, v):
        try:
            return max(0.0, min(1.0, float(v)))
        except (TypeError, ValueError):
            return 0.75


class CritiqueRequest(BaseModel):
    draft: str
    profile: VoiceProfile
