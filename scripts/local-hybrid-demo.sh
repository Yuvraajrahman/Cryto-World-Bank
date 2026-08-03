#!/usr/bin/env bash
# Vercel UI + local backend demo — quick checklist
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== Crypto World Bank — hybrid demo (Vercel FE + local BE) ==="
echo

if ! docker ps --format '{{.Names}}' | grep -q cwb-postgres; then
  echo "Starting Postgres..."
  docker compose up -d
else
  echo "✓ Postgres (cwb-postgres) running"
fi

if curl -sf http://127.0.0.1:4000/health >/dev/null 2>&1; then
  echo "✓ Backend :4000 responding"
else
  echo "✗ Backend not up — run: cd backend && npm run dev"
fi

if command -v ngrok >/dev/null 2>&1; then
  echo
  echo "Start tunnel in another terminal:"
  echo "  ngrok http 4000"
elif command -v cloudflared >/dev/null 2>&1; then
  echo
  echo "Start tunnel in another terminal:"
  echo "  cloudflared tunnel --url http://127.0.0.1:4000"
else
  echo
  echo "Install a tunnel: brew install ngrok  OR  brew install cloudflared"
fi

echo
echo "Then set Vercel env (Production):"
echo "  VITE_API_BASE_URL = https://YOUR-TUNNEL-URL"
echo "Redeploy frontend: vercel deploy --prod  (or git push main)"
echo
echo "Full guide: Documentation/hybrid-vercel-local-backend.md"
