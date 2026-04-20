from typing import Literal

from pydantic import BaseModel


class SentenceRhythm(BaseModel):
    avg_length: int = 15
    variance: Literal["low", "medium", "high"] = "medium"
    signature_move: str = ""


class Vocabulary(BaseModel):
    favorites: list[str] = []
    avoid: list[str] = []
    fillers: list[str] = []


class Structure(BaseModel):
    opening_move: str = ""
    closing_move: str = ""
    paragraphing: Literal["short", "medium", "long"] = "medium"


class Forbidden(BaseModel):
    corporate_speak: bool = True
    excessive_punctuation: bool = True
    emoji: Literal["never", "sparingly", "freely"] = "sparingly"


class VoiceProfile(BaseModel):
    tone: str = ""
    sentence_rhythm: SentenceRhythm = SentenceRhythm()
    vocabulary: Vocabulary = Vocabulary()
    structure: Structure = Structure()
    values: list[str] = []
    domain_expertise: list[str] = []
    forbidden: Forbidden = Forbidden()
    quirks: list[str] = []
