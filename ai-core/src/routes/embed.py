from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ..providers.gemini import GeminiProvider
from ..deps import get_gemini_provider, verify_secret

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
    embedding = await gemini.embed(body.text)
    return EmbedResponse(embedding=embedding)
