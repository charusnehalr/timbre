# Timbre AI Core

FastAPI service handling all LLM/embedding work.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/interview/turn` | One interview turn (returns reply + captured facts) |
| POST | `/analyze/style` | Analyze writing samples → VoiceProfile |
| POST | `/generate` | Generate voice-matched draft (SSE) |
| POST | `/transcribe` | Audio file → text (Groq Whisper) |
| POST | `/embed` | Text → 768-dim embedding (Gemini) |
| GET | `/health` | Provider status |

All routes require `X-Internal-Secret` header matching `AI_CORE_SECRET` env var.

## Dev

```bash
uv sync
uv run uvicorn src.main:app --reload --port 5000
```

## Tests

```bash
uv run pytest
```
