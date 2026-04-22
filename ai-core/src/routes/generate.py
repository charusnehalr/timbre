import traceback

import structlog
from fastapi import APIRouter, Depends, HTTPException

from ..pipelines.generate_pipeline import GeneratePipeline
from ..schemas.generate import GenerateRequest, GenerateResponse
from ..deps import get_generate_pipeline, verify_secret

router = APIRouter(prefix="/generate", tags=["generate"])
log = structlog.get_logger(__name__)


@router.post("", response_model=GenerateResponse, dependencies=[Depends(verify_secret)])
async def generate(
    body: GenerateRequest,
    pipeline: GeneratePipeline = Depends(get_generate_pipeline),
) -> GenerateResponse:
    try:
        result = await pipeline.run(body)
    except Exception as exc:
        tb = traceback.format_exc()
        log.error("pipeline_error", error=str(exc), type=type(exc).__name__, traceback=tb)
        raise HTTPException(
            status_code=500,
            detail=f"{type(exc).__name__}: {exc}",
        )
    return result
