#!/usr/bin/env bash
# Local-primary stack: Docker Postgres + backend + frontend + tunnel for Vercel UI.
#
# Architecture:
#   Browser → cryto-world-bank.vercel.app (or local :5173)
#          → HTTPS tunnel (ngrok/cloudflared)
#          → Mac :4000 (Express) → Docker Postgres :5432
#          → ml-service :8000, Ollama :11434 (optional)
#
# Usage:
#   ./scripts/start-everything.sh          # from Terminal.app / iTerm (recommended)
#   npm run start:all
#
# Important: run this in your own terminal (not only via an agent). Background
# servers use nohup/disown so they keep running after the script exits.
#
# Flags:
#   --skip-vercel   start local stack + tunnel, but do not update/redeploy Vercel
#   --skip-ml       skip Ollama + ml-service
#
# Logs: logs/*.log   Stop: ./scripts/stop-everything.sh
# Guide: Documentation/hybrid-vercel-local-backend.md
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SKIP_VERCEL=0
SKIP_ML=0
for arg in "$@"; do
  case "$arg" in
    --skip-vercel) SKIP_VERCEL=1 ;;
    --skip-ml)     SKIP_ML=1 ;;
  esac
done

LOG_DIR="$ROOT/logs"
mkdir -p "$LOG_DIR"
PID_FILE="$ROOT/.dev-pids"
: > "$PID_FILE"

LOCAL_DB_URL="postgresql://cwb:cwb@localhost:5432/crypto_world_bank"
VERCEL_FRONTEND_URL="https://cryto-world-bank.vercel.app"
CLOUD_API_FALLBACK="https://cryto-world-bank-api.vercel.app"

info()  { printf '\033[1;34m▸ %s\033[0m\n' "$1"; }
ok()    { printf '\033[1;32m✓ %s\033[0m\n' "$1"; }
warn()  { printf '\033[1;33m! %s\033[0m\n' "$1"; }
fail()  { printf '\033[1;31m✗ %s\033[0m\n' "$1"; }

# ---------------------------------------------------------------------------
# 1. Docker + local Postgres
# ---------------------------------------------------------------------------
info "Checking Docker…"
if ! docker info >/dev/null 2>&1; then
  if [[ "$(uname)" == "Darwin" ]]; then
    warn "Docker daemon not running — launching Docker Desktop…"
    open -a Docker 2>/dev/null || true
    for _ in $(seq 1 60); do
      docker info >/dev/null 2>&1 && break
      sleep 2
    done
  fi
fi

if ! docker info >/dev/null 2>&1; then
  fail "Docker still isn't ready. Start Docker Desktop manually and re-run."
  exit 1
fi
ok "Docker is running"

info "Starting Postgres (docker compose up -d)…"
docker compose up -d

status="starting"
for _ in $(seq 1 45); do
  status="$(docker inspect -f '{{.State.Health.Status}}' cwb-postgres 2>/dev/null || echo "starting")"
  [[ "$status" == "healthy" ]] && break
  sleep 1
done
if [[ "$status" == "healthy" ]]; then
  ok "Postgres is healthy (cwb-postgres @ localhost:5432)"
else
  warn "Postgres did not report healthy in time — continuing anyway"
fi

info "Applying Prisma migrations to local Postgres…"
if (cd "$ROOT/backend" && DATABASE_URL="$LOCAL_DB_URL" npx prisma migrate deploy) >"$LOG_DIR/prisma-migrate.log" 2>&1; then
  ok "Migrations up to date (logs/prisma-migrate.log)"
else
  warn "migrate deploy failed — check logs/prisma-migrate.log"
fi

info "Checking local seed data…"
INST_COUNT="$(cd "$ROOT/backend" && DATABASE_URL="$LOCAL_DB_URL" npx tsx -e "
(async () => {
  const { PrismaClient } = await import('@prisma/client');
  const p = new PrismaClient();
  const n = await p.institution.count();
  console.log(n);
  await p.\$disconnect();
})().catch(() => { console.log('0'); process.exit(0); });
" 2>/dev/null | tail -1)"
if [[ "${INST_COUNT:-0}" -lt 1 ]]; then
  warn "Local DB has no institutions — run: cd backend && npm run db:seed:testing"
else
  ok "Local DB has ${INST_COUNT} institutions (Docker Postgres)"
fi

# ---------------------------------------------------------------------------
# 2. Local-only: Ollama + ML scoring
# ---------------------------------------------------------------------------
if [[ "$SKIP_ML" -eq 0 ]]; then
  info "Starting Ollama (AI agent LLM)…"
  if command -v ollama >/dev/null 2>&1; then
    if curl -sf http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
      ok "Ollama already running"
    else
      nohup ollama serve >"$LOG_DIR/ollama.log" 2>&1 &
      OLLAMA_PID=$!
      disown "$OLLAMA_PID" 2>/dev/null || true
      echo "ollama:$OLLAMA_PID" >> "$PID_FILE"
      for _ in $(seq 1 15); do
        curl -sf http://127.0.0.1:11434/api/tags >/dev/null 2>&1 && break
        sleep 1
      done
      curl -sf http://127.0.0.1:11434/api/tags >/dev/null 2>&1 \
        && ok "Ollama ready at http://127.0.0.1:11434" \
        || warn "Ollama not responding yet — check logs/ollama.log"
    fi
  else
    warn "ollama not installed — AI agent chat unavailable (brew install ollama)"
  fi

  info "Starting ML scoring service (:8000)…"
  if [[ -d "$ROOT/ml-service" ]]; then
    lsof -ti ":8000" | xargs kill -9 2>/dev/null || true
    (
      cd "$ROOT/ml-service"
      if [[ -d ".venv" ]]; then source .venv/bin/activate; fi
      uvicorn app.main:app --port 8000
    ) >"$LOG_DIR/ml-service.log" 2>&1 &
    ML_PID=$!
    disown "$ML_PID" 2>/dev/null || true
    echo "ml-service:$ML_PID" >> "$PID_FILE"
    for _ in $(seq 1 30); do
      curl -sf http://127.0.0.1:8000/health >/dev/null 2>&1 && break
      sleep 1
    done
    curl -sf http://127.0.0.1:8000/health >/dev/null 2>&1 \
      && ok "ML service ready at http://127.0.0.1:8000" \
      || warn "ML service not responding — check logs/ml-service.log"
  else
    warn "ml-service/ not found — skipping"
  fi
else
  warn "Skipping Ollama + ML (--skip-ml)"
fi

# ---------------------------------------------------------------------------
# 3. Backend (:4000) + frontend (:5173) — forced onto local Postgres
# ---------------------------------------------------------------------------
info "Freeing ports 4000/5173/5174 if in use…"
for p in 4000 5173 5174; do
  lsof -ti ":$p" | xargs kill -9 2>/dev/null || true
done
sleep 1

info "Regenerating Prisma client…"
(cd "$ROOT/backend" && DATABASE_URL="$LOCAL_DB_URL" npx prisma generate) >"$LOG_DIR/prisma-generate.log" 2>&1 \
  || warn "prisma generate failed — check logs/prisma-generate.log"

info "Starting backend (:4000 → Docker Postgres)…"
# backend `npm run dev` does `env -u DATABASE_URL` so Prisma loads backend/.env (local Docker).
# Launch via a detached subshell so the process survives after this script exits.
(
  cd "$ROOT/backend"
  # Unset empty JWT_SECRET/DATABASE_URL so dotenv can load backend/.env
  # (Vercel env pull can leave blank JWT_SECRET in the shell).
  exec env -u VERCEL -u JWT_SECRET -u DATABASE_URL SYNC_NEON_ON_START=0 \
    CORS_ORIGIN="http://localhost:5173,http://127.0.0.1:5173,${VERCEL_FRONTEND_URL}" \
    npm run dev
) >"$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
disown "$BACKEND_PID" 2>/dev/null || true
echo "backend:$BACKEND_PID" >> "$PID_FILE"

for _ in $(seq 1 45); do
  curl -sf http://127.0.0.1:4000/health >/dev/null 2>&1 && break
  sleep 1
done
if curl -sf http://127.0.0.1:4000/health >/dev/null 2>&1; then
  ok "Backend healthy at http://127.0.0.1:4000 (local Postgres)"
else
  warn "Backend not responding yet — check logs/backend.log"
fi

info "Starting frontend (:5173)…"
(
  cd "$ROOT/frontend"
  npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
) >"$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
disown "$FRONTEND_PID" 2>/dev/null || true
echo "frontend:$FRONTEND_PID" >> "$PID_FILE"

for _ in $(seq 1 45); do
  curl -sf http://127.0.0.1:5173 >/dev/null 2>&1 && break
  sleep 1
done
if curl -sf http://127.0.0.1:5173 >/dev/null 2>&1; then
  ok "Frontend ready at http://127.0.0.1:5173"
else
  warn "Frontend not responding yet — check logs/frontend.log"
fi

# ---------------------------------------------------------------------------
# 4. HTTPS tunnel so Vercel frontend can reach local API
# ---------------------------------------------------------------------------
TUNNEL_URL=""
TUNNEL_FILE="$LOG_DIR/tunnel.url"
: > "$LOG_DIR/tunnel.log"

info "Starting HTTPS tunnel (:4000) for Vercel…"
pkill -f "ngrok http 4000" 2>/dev/null || true
pkill -f "cloudflared tunnel --url http://127.0.0.1:4000" 2>/dev/null || true
sleep 1

if command -v cloudflared >/dev/null 2>&1; then
  nohup cloudflared tunnel --url "http://127.0.0.1:4000" --no-autoupdate \
    >"$LOG_DIR/tunnel.log" 2>&1 &
  TUNNEL_PID=$!
  disown "$TUNNEL_PID" 2>/dev/null || true
  echo "tunnel:$TUNNEL_PID" >> "$PID_FILE"
  for _ in $(seq 1 40); do
    TUNNEL_URL="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG_DIR/tunnel.log" 2>/dev/null | head -1 || true)"
    [[ -n "$TUNNEL_URL" ]] && break
    sleep 1
  done
elif command -v ngrok >/dev/null 2>&1; then
  nohup ngrok http 4000 --log=stdout >"$LOG_DIR/tunnel.log" 2>&1 &
  TUNNEL_PID=$!
  disown "$TUNNEL_PID" 2>/dev/null || true
  echo "tunnel:$TUNNEL_PID" >> "$PID_FILE"
  for _ in $(seq 1 40); do
    TUNNEL_URL="$(curl -sf http://127.0.0.1:4040/api/tunnels 2>/dev/null \
      | python3 -c "import sys,json; d=json.load(sys.stdin); print(next((t['public_url'] for t in d.get('tunnels',[]) if t.get('public_url','').startswith('https')), ''))" 2>/dev/null || true)"
    [[ -n "$TUNNEL_URL" ]] && break
    sleep 1
  done
else
  warn "Install a tunnel: brew install ngrok   OR   brew install cloudflared"
fi

if [[ -n "$TUNNEL_URL" ]]; then
  echo "$TUNNEL_URL" > "$TUNNEL_FILE"
  ok "Tunnel ready: $TUNNEL_URL"
  # ngrok free tier may need a Host header / browser interstitial; health may 404 briefly
  if curl -sf -o /dev/null -w "%{http_code}" "$TUNNEL_URL/health" 2>/dev/null | grep -qE '200|301|302'; then
    ok "Tunnel → local API health check passed"
  else
    # retry once after brief delay (tunnel warm-up)
    sleep 2
    if curl -sf "$TUNNEL_URL/health" >/dev/null 2>&1; then
      ok "Tunnel → local API health check passed"
    else
      warn "Tunnel up but /health not reachable yet — open $TUNNEL_URL/health in a browser once (ngrok interstitial)"
    fi
  fi
else
  warn "Could not detect tunnel URL — check logs/tunnel.log"
fi

# Point Vercel UI at Mac via same-origin rewrites (avoids ngrok free-tier CORS interstitial).
# Browser → cryto-world-bank.vercel.app/api/* → rewrite → tunnel → localhost:4000
# Project link lives at repo root (.vercel → cryto-world-bank).
if [[ "$SKIP_VERCEL" -eq 1 ]]; then
  warn "Skipping Vercel env/redeploy (--skip-vercel)"
elif [[ -n "$TUNNEL_URL" ]] && command -v vercel >/dev/null 2>&1; then
  info "Writing Vercel API rewrites → tunnel (same-origin, no CORS)…"
  VERCEL_CWD="$ROOT"
  cat > "$ROOT/frontend/vercel.json" <<EOF
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "${TUNNEL_URL}/api/\$1" },
    { "source": "/health", "destination": "${TUNNEL_URL}/health" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
EOF
  ok "frontend/vercel.json rewrites → $TUNNEL_URL"

  mkdir -p "$ROOT/frontend/.vercel"
  if [[ -f "$ROOT/.vercel/project.json" ]]; then
    cp "$ROOT/.vercel/project.json" "$ROOT/frontend/.vercel/project.json"
  fi

  vercel env rm VITE_API_PRIMARY_URL production --yes --cwd "$VERCEL_CWD" \
    >"$LOG_DIR/vercel-env.log" 2>&1 || true
  # same-origin → frontend calls /api on vercel.app (rewritten to tunnel)
  if printf '%s\n' "same-origin" | vercel env add VITE_API_PRIMARY_URL production --cwd "$VERCEL_CWD" \
      >>"$LOG_DIR/vercel-env.log" 2>&1; then
    ok "Vercel VITE_API_PRIMARY_URL = same-origin"

    vercel env rm VITE_API_FALLBACK_URL production --yes --cwd "$VERCEL_CWD" \
      >>"$LOG_DIR/vercel-env.log" 2>&1 || true
    printf '%s\n' "$CLOUD_API_FALLBACK" | vercel env add VITE_API_FALLBACK_URL production --cwd "$VERCEL_CWD" \
      >>"$LOG_DIR/vercel-env.log" 2>&1 || true

    info "Redeploying Vercel frontend (rewrites + same-origin API)…"
    if (cd "$ROOT" && vercel deploy --prod --yes) >"$LOG_DIR/vercel-deploy.log" 2>&1; then
      ok "Vercel frontend redeployed → $VERCEL_FRONTEND_URL"
    else
      warn "Vercel deploy failed — see logs/vercel-deploy.log"
    fi
  else
    warn "Could not set Vercel env — see logs/vercel-env.log"
  fi
elif [[ -n "$TUNNEL_URL" ]]; then
  warn "vercel CLI not found — write frontend/vercel.json rewrites to $TUNNEL_URL and redeploy"
fi

echo
ok "All done — local-primary mode (Neon deferred)."
echo "  Local frontend:  http://127.0.0.1:5173  (log: logs/frontend.log)"
echo "  Local backend:   http://127.0.0.1:4000  → Docker Postgres  (log: logs/backend.log)"
echo "  Postgres:        localhost:5432 / crypto_world_bank"
echo "  ML service:      http://127.0.0.1:8000"
echo "  Ollama:          http://127.0.0.1:11434"
if [[ -n "$TUNNEL_URL" ]]; then
  echo "  Tunnel (Vercel): $TUNNEL_URL  (saved: logs/tunnel.url)"
  echo "  Live site:       $VERCEL_FRONTEND_URL  → tunnel → local API → Docker Postgres"
  echo "  Login:           admin@gmail.com / i_am_admin"
else
  echo "  Live site:       $VERCEL_FRONTEND_URL  (tunnel not running — start ngrok manually)"
fi
echo "  Stop:            ./scripts/stop-everything.sh"
echo "  Stop + Postgres: ./scripts/stop-everything.sh --all"
