#!/usr/bin/env bash
# Seed script — inserts a test user + space for local development.
# Requires backend .env.local to be filled and the DB to be migrated.
set -euo pipefail

API="http://localhost:4000"

echo "→ Creating test user…"
curl -s -X POST "$API/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@timbre.dev","password":"password123","displayName":"Test User"}' | jq .

echo ""
echo "→ Logging in…"
TOKEN=$(curl -s -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@timbre.dev","password":"password123"}' | jq -r '.accessToken')

echo "Token: $TOKEN"

echo ""
echo "→ Creating default space…"
curl -s -X POST "$API/api/spaces" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"My Voice","description":"Default space"}' | jq .

echo ""
echo "✓ Seed complete. Use test@timbre.dev / password123 to log in."
