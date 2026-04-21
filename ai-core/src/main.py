import traceback
import time
import structlog
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routes import interview, analyze, generate, transcribe, embed

structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer(),
    ]
)

log = structlog.get_logger()

app = FastAPI(title="Timbre AI Core", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    log.info("request_started", method=request.method, path=request.url.path)
    try:
        response = await call_next(request)
        elapsed = round((time.perf_counter() - start) * 1000)
        log.info(
            "request_finished",
            method=request.method,
            path=request.url.path,
            status=response.status_code,
            ms=elapsed,
        )
        return response
    except Exception as exc:
        elapsed = round((time.perf_counter() - start) * 1000)
        log.error("request_failed", method=request.method, path=request.url.path, ms=elapsed, error=str(exc))
        raise


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    log.error("unhandled_exception", path=request.url.path, error=str(exc), traceback=tb)
    return JSONResponse(
        status_code=500,
        content={"detail": f"{type(exc).__name__}: {exc}"},
    )


app.include_router(interview.router)
app.include_router(analyze.router)
app.include_router(generate.router)
app.include_router(transcribe.router)
app.include_router(embed.router)

log.info(
    "ai_core_started",
    host=settings.host,
    port=settings.port,
    embed_model=settings.embed_model,
    heavy_model=settings.heavy_model,
    light_model=settings.light_model,
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "providers_ready": ["groq", "gemini"],
        "models": {
            "heavy": settings.heavy_model,
            "light": settings.light_model,
            "embed": settings.embed_model,
            "whisper": settings.whisper_model,
        },
    }
