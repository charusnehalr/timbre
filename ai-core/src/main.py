import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routes import interview, analyze, generate, transcribe, embed

structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)

app = FastAPI(title="Timbre AI Core", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interview.router)
app.include_router(analyze.router)
app.include_router(generate.router)
app.include_router(transcribe.router)
app.include_router(embed.router)


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
