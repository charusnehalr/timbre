import structlog
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ..providers.gemini import GeminiProvider
from ..deps import get_gemini_provider, verify_secret

log = structlog.get_logger(__name__)
router = APIRouter(prefix="/embed", tags=["embed"])


class EmbedRequest(BaseModel):
    text: str


class EmbedResponse(BaseModel):
    embedding: list[float]


@router.post("", response_model=EmbedResponse, dependencies=[Depends(verify_secret)])
async def embed(
    body: EmbedRequest,
    gemini: GeminiProvider = Depends(get_gemini_provider),
):
    log.info("embed_request", chars=len(body.text))
    try:
        embedding = await gemini.embed(body.text)
        log.info("embed_success", dims=len(embedding))
        return EmbedResponse(embedding=embedding)
    except Exception as exc:
        log.error("embed_error", error=str(exc))
        raise
