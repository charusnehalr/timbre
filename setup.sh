#!/usr/bin/env bash
set -euo pipefail

echo "=== Timbre setup ==="

# ── 1. Check required tools ──────────────────────────────────────────────────
for cmd in node npm uv; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: '$cmd' not found. Please install it first."
    echo "  node/npm → https://nodejs.org"
    echo "  uv       → https://github.com/astral-sh/uv"
    exit 1
  fi
done

echo "✓ node $(node --version), npm $(npm --version), uv $(uv --version)"

# ── 2. Check env files ────────────────────────────────────────────────────────
for f in frontend/.env.local backend/.env.local ai-core/.env; do
  if [ ! -f "$f" ]; then
    echo "ERROR: $f not found. Copy from .env.example and fill in your API keys."
    echo "  cp ${f%.*}.env.example $f"
    exit 1
  fi
done
echo "✓ env files present"

# ── 3. Install frontend deps ──────────────────────────────────────────────────
echo ""
echo "→ Installing frontend dependencies…"
(cd frontend && npm install --legacy-peer-deps)
echo "✓ frontend deps installed"

# ── 4. Install backend deps ───────────────────────────────────────────────────
echo ""
echo "→ Installing backend dependencies…"
(cd backend && npm install)
echo "✓ backend deps installed"

# ── 5. Install ai-core deps ───────────────────────────────────────────────────
echo ""
echo "→ Installing ai-core dependencies (uv)…"
(cd ai-core && uv sync)
echo "✓ ai-core deps installed"

# ── 6. Run DB migrations ──────────────────────────────────────────────────────
echo ""
echo "→ Running Drizzle migrations against Supabase…"
(cd backend && npm run db:generate && npm run db:migrate)
echo "✓ migrations applied"
echo ""
echo "NOTE: Apply RLS policies manually in Supabase SQL editor:"
echo "  cat backend/src/db/rls.sql  → paste into Supabase SQL editor"

# ── 7. Smoke test AI providers ────────────────────────────────────────────────
echo ""
echo "→ Smoke-testing ai-core (start it first in another terminal if needed)"
echo "  Run: cd ai-core && uv run uvicorn src.main:app --port 5000"
echo "  Then: curl http://localhost:5000/health"

echo ""
echo "=== Setup complete ==="
echo ""
echo "Start dev servers:"
echo "  Terminal 1: cd backend  && npm run dev          # port 4000"
echo "  Terminal 2: cd ai-core  && uv run uvicorn src.main:app --reload --port 5000"
echo "  Terminal 3: cd frontend && npm run dev          # port 3000"
echo ""
echo "Then open http://localhost:3000"
