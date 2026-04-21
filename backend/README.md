# Timbre Backend

# Full Stack Application Setup Guide

This project consists of three main components:
- **Backend** (Next.js)
- **AI Core** (FastAPI)
- **Frontend**

---

## Prerequisites

Make sure you have the following installed:

- Node.js (v18+ recommended)
- Python 3.11+
- [`uv`](https://github.com/astral-sh/uv) (Python package manager)

---

## Backend Setup (Next.js)

**Port:** 4000

```bash
cd backend
npm install
npm run dev
```

### Environment Variables
- Already configured in `backend/.env.local`
- Add `ANTHROPIC_API_KEY` if any feature requires it

---

## AI Core Setup (FastAPI)

**Port:** 5000

```bash
cd ai-core
uv sync
uv run uvicorn src.main:app --reload --port 5000
```

### Environment Variables
- Already configured in `ai-core/.env`
- Includes API keys for:
  - Groq
  - Gemini

---

## How They Connect

- Backend communicates with AI Core at:
  ```
  http://localhost:5000
  ```
- Controlled via `AI_CORE_URL` in backend environment variables
- Both services share the same `AI_CORE_SECRET` for internal authentication
- Secrets are already matched in both `.env` files

---

## Frontend Setup

```bash
npm install
npm run dev
```

---

## Quick Start Checklist

1. Start AI Core (port 5000)
2. Start Backend (port 4000)
3. Verify AI Core health:
   ```
   GET http://localhost:5000/health
   ```
4. Access Backend:
   ```
   http://localhost:4000
   ```

---

## Notes

- Run Backend and AI Core in **separate terminals**
- Ensure ports **4000** and **5000** are available
- If AI features fail, double-check API keys

---

You're all set 