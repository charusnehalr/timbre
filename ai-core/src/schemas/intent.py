from typing import Literal

from pydantic import BaseModel


IntentType = Literal[
    "linkedin_post",
    "cold_email",
    "resume_bullet",
    "cover_letter",
    "portfolio_blurb",
    "thank_you_note",
    "blog_post",
    "tweet",
    "other",
]


class Intent(BaseModel):
    intent: IntentType = "other"
    audience: str = ""
    desired_length: Literal["short", "medium", "long"] = "medium"
    tone_modifier: Literal["none", "warmer", "more_formal", "punchier"] = "none"


class IntentRequest(BaseModel):
    task: str
