# Timbre

A personal voice AI that makes everything you write — LinkedIn posts, resumes, cold emails, portfolios — actually sound like *you*, not generic AI.

## Stack

| Module | Tech |
|--------|------|
| `frontend/` | Next.js 14 + TypeScript + Tailwind + shadcn/ui |
| `backend/` | Next.js 14 API routes + TypeScript + Drizzle + Supabase |
| `ai-core/` | Python + FastAPI + Groq + Gemini |

All free tier. No credit cards. No local models. No GPU required.

## Quick start

### 1. Create accounts (see docs/setup.md for details)
- [Groq](https://console.groq.com) — LLM + Whisper
- [Google AI Studio](https://aistudio.google.com) — Gemini embeddings + fallback LLM
- [Supabase](https://supabase.com) — Postgres + pgvector + auth + storage
- [Upstash](https://upstash.com) — Redis queue
- [Vercel](https://vercel.com) — frontend deploy (week 4)
- [Render](https://render.com) — backend + ai-core deploy (week 4)

### 2. Clone and fill env files
```bash
git clone <repo-url> timbre && cd timbre
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env.local
cp ai-core/.env.example ai-core/.env
# fill in API keys from step 1
```

### 3. Bootstrap
```bash
./setup.sh
```

### 4. Start dev servers
```bash
# Terminal 1
cd backend && npm run dev        # port 4000

# Terminal 2
cd ai-core && uv run uvicorn src.main:app --reload --port 5000

# Terminal 3
cd frontend && npm run dev       # port 3000
```

Visit http://localhost:3000

## Hardware requirements
- 4 GB RAM sufficient
- No GPU
- No local model downloads
- Internet required (API calls to Groq / Gemini / Supabase)
