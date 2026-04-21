import structlog
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ..agents.interview_agent import InterviewAgent
from ..deps import get_interview_agent, verify_secret

log = structlog.get_logger(__name__)
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
    log.info("interview_turn", history_len=len(body.history))
    try:
        reply, facts = await agent.turn(body.history)
        log.info("interview_turn_done", facts_captured=len(facts))
        return TurnResponse(reply=reply, captured_facts=facts)
    except Exception as exc:
        log.error("interview_turn_error", error=str(exc))
        raise
