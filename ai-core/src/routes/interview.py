from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel

from ..agents.interview_agent import InterviewAgent
from ..deps import get_interview_agent, verify_secret

router = APIRouter(prefix="/interview", tags=["interview"])


class TurnRequest(BaseModel):
    history: list[dict]


class TurnResponse(BaseModel):
    reply: str
    captured_facts: list[str]


@router.post("/turn", response_model=TurnResponse, dependencies=[Depends(verify_secret)])
async def interview_turn(
    body: TurnRequest,
    agent: InterviewAgent = Depends(get_interview_agent),
):
    reply, facts = await agent.turn(body.history)
    return TurnResponse(reply=reply, captured_facts=facts)
