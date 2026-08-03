#!/usr/bin/env bash
# One command to bring up the local pieces of the stack.
#
# ============================================================================
# ARCHITECTURE NOTE FOR FUTURE AI AGENTS / FUTURE YOU (as of 2026-08-03)
# ============================================================================
# The transactional workload (users, banks, loans, deposits, groups, ... —
# everything Prisma/Postgres touches) now runs ENTIRELY on Vercel + Neon.
# There is no "local Postgres is primary, Neon is backup" mode anymore — the
# live website must keep working with this laptop completely OFF.
#
# The only things that are genuinely local-only (not deployed anywhere) are:
#   1. The AI agent/chatbot's LLM (Ollama, see LLM_BASE_URL) — routes in
#      backend/src/routes/agent.ts, chatbot.ts, ai.ts.
#   2. The ML fraud/credit scoring service (ml-service/, FastAPI on :8000).
# Those only work while this script (or the equivalent manual commands) is
# running on this machine. Everything else — DB, API, frontend — is already
# live on Vercel/Neon 24/7 regardless of this laptop's power state.
#
# The old local-Docker-Postgres-primary + Neon-sync architecture is DISABLED
# below, not deleted, via `: <<'LEGACY' ... LEGACY` no-op blocks so it can be
# restored later without rewriting it. To restore it:
#   1. Delete the `: <<'LEGACY_DOCKER_POSTGRES'` / `LEGACY_DOCKER_POSTGRES`
#      marker lines around Section 1 below (and the matching pair around
#      Section 2) to re-enable that code.
#   2. Follow the restore instructions at the top of backend/.env (switch
#      DATABASE_URL back to the local one, re-enable SYNC_NEON_*).
#   3. `docker compose up -d` (see docker-compose.yml, also marked legacy).
# See also: Documentation/hybrid-vercel-local-backend.md
#
# Usage:
#   ./scripts/start-everything.sh
#   npm run start:all
#
# Logs are written to logs/*.log (repo root). Stop with: ./scripts/stop-everything.sh
# ============================================================================
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

LOG_DIR="$ROOT/logs"
mkdir -p "$LOG_DIR"
PID_FILE="$ROOT/.dev-pids"
: > "$PID_FILE"

info()  { printf '\033[1;34m▸ %s\033[0m\n' "$1"; }
ok()    { printf '\033[1;32m✓ %s\033[0m\n' "$1"; }
warn()  { printf '\033[1;33m! %s\033[0m\n' "$1"; }
fail()  { printf '\033[1;31m✗ %s\033[0m\n' "$1"; }

# ---------------------------------------------------------------------------
# 1. [LEGACY/DISABLED] Docker + local Postgres
#    Neon is primary now — the backend connects straight to Neon via
#    backend/.env, so no local database container is needed. Block kept
#    intact below for easy revert (see architecture note above).
# ---------------------------------------------------------------------------
: <<'LEGACY_DOCKER_POSTGRES'
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
  fail "Docker still isn't ready. Start Docker Desktop manually and re-run this script."
  exit 1
fi
ok "Docker is running"

info "Starting Postgres (docker compose up -d)…"
docker compose up -d

for _ in $(seq 1 30); do
  status="$(docker inspect -f '{{.State.Health.Status}}' cwb-postgres 2>/dev/null || echo "starting")"
  [[ "$status" == "healthy" ]] && break
  sleep 1
done
if [[ "${status:-}" == "healthy" ]]; then
  ok "Postgres is healthy (cwb-postgres)"
else
  warn "Postgres did not report healthy in time — continuing anyway"
fi
LEGACY_DOCKER_POSTGRES

# ---------------------------------------------------------------------------
# 2. [LEGACY/DISABLED] Reverse sync: Neon → local
#    Not needed — there's only one database (Neon) now, nothing to catch up.
# ---------------------------------------------------------------------------
: <<'LEGACY_REVERSE_SYNC'
NEON_URL=""
if [[ -f "$ROOT/backend/.env" ]]; then
  NEON_URL="$(grep -E '^(NEON_SYNC_URL|DATABASE_URL_UNPOOLED)=' "$ROOT/backend/.env" | head -1 | cut -d= -f2-)"
fi

if [[ -n "$NEON_URL" ]]; then
  info "Pulling latest data from Neon → local (in case Neon was live while Mac was off)…"
  if NEON_SYNC_URL="$NEON_URL" bash "$ROOT/backend/scripts/sync-neon-to-local.sh"; then
    ok "Local Postgres caught up with Neon"
  else
    warn "Neon → local pull failed or timed out — continuing with existing local data"
  fi
else
  warn "No NEON_SYNC_URL/DATABASE_URL_UNPOOLED set in backend/.env — skipping reverse sync"
fi
LEGACY_REVERSE_SYNC

# ---------------------------------------------------------------------------
# 3. Local-only services: ML scoring (:8000) + Ollama LLM for the AI agent
#    These are never deployed — they only run here, on this machine.
# ---------------------------------------------------------------------------
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
  warn "ollama not installed — AI agent chat will be unavailable locally (brew install ollama)"
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
    || warn "ML service not responding yet — check logs/ml-service.log (run 'pip install -r ml-service/requirements.txt' if it's a fresh checkout)"
else
  warn "ml-service/ directory not found — skipping"
fi

# ---------------------------------------------------------------------------
# 4. Backend (:4000) + frontend (:5173) dev servers — optional, for local
#    development only. They talk straight to Neon via backend/.env; nothing
#    here is required for the live Vercel site to work.
# ---------------------------------------------------------------------------
info "Freeing ports 4000/5173/5174 if in use…"
for p in 4000 5173 5174; do
  lsof -ti ":$p" | xargs kill -9 2>/dev/null || true
done

info "Regenerating Prisma client…"
(cd "$ROOT/backend" && npx prisma generate) >"$LOG_DIR/prisma-generate.log" 2>&1 || warn "prisma generate failed — check logs/prisma-generate.log"

info "Starting backend (:4000)…"
nohup env -u VERCEL \
    npm --prefix "$ROOT/backend" run dev \
    >"$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
disown "$BACKEND_PID" 2>/dev/null || true
echo "backend:$BACKEND_PID" >> "$PID_FILE"

for _ in $(seq 1 30); do
  curl -sf http://127.0.0.1:4000/health >/dev/null 2>&1 && break
  sleep 1
done
if curl -sf http://127.0.0.1:4000/health >/dev/null 2>&1; then
  ok "Backend healthy at http://127.0.0.1:4000 (Neon-backed)"
else
  warn "Backend not responding yet — check logs/backend.log"
fi

info "Starting frontend (:5173)…"
(
  cd "$ROOT/frontend"
  npm run dev -- --host 127.0.0.1 --port 5173
) >"$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "frontend:$FRONTEND_PID" >> "$PID_FILE"

for _ in $(seq 1 30); do
  curl -sf http://127.0.0.1:5173 >/dev/null 2>&1 && break
  sleep 1
done
if curl -sf http://127.0.0.1:5173 >/dev/null 2>&1; then
  ok "Frontend ready at http://127.0.0.1:5173"
else
  warn "Frontend not responding yet — check logs/frontend.log"
fi

echo
ok "All done."
echo "  Frontend (local dev): http://127.0.0.1:5173  (log: logs/frontend.log, pid $FRONTEND_PID)"
echo "  Backend  (local dev): http://127.0.0.1:4000 → Neon  (log: logs/backend.log, pid $BACKEND_PID)"
echo "  ML service:            http://127.0.0.1:8000  (log: logs/ml-service.log)"
echo "  Ollama (agent LLM):     http://127.0.0.1:11434  (log: logs/ollama.log)"
echo "  Live site (always on, Neon-backed): https://cryto-world-bank.vercel.app"
echo "  Stop everything: ./scripts/stop-everything.sh"
