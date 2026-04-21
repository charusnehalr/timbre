from fastapi import APIRouter, Depends, UploadFile, File
from pydantic import BaseModel

from ..providers.groq import GroqProvider
from ..deps import get_groq_provider, verify_secret

router = APIRouter(prefix="/transcribe", tags=["transcribe"])


class TranscribeResponse(BaseModel):
    text: str


@router.post("", response_model=TranscribeResponse, dependencies=[Depends(verify_secret)])
async def transcribe(
    file: UploadFile = File(...),
    groq: GroqProvider = Depends(get_groq_provider),
):
    audio_bytes = await file.read()
    text = await groq.transcribe(audio_bytes, filename=file.filename or "audio.webm")
    return TranscribeResponse(text=text)
