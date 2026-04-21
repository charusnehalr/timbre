import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from ..pipelines.generate_pipeline import GeneratePipeline
from ..schemas.generate import GenerateRequest, GenerateResponse
from ..deps import get_generate_pipeline, verify_secret

router = APIRouter(prefix="/generate", tags=["generate"])


@router.post("", dependencies=[Depends(verify_secret)])
async def generate(
    body: GenerateRequest,
    pipeline: GeneratePipeline = Depends(get_generate_pipeline),
):
    result = await pipeline.run(body)

    async def _stream():
        yield f"data: {result.model_dump_json()}\n\n"

    return StreamingResponse(_stream(), media_type="text/event-stream")
