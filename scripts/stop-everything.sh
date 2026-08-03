#!/usr/bin/env bash
# Stop the backend/frontend/ML/Ollama processes started by start-everything.sh.
# The live Vercel + Neon site is unaffected by this — it doesn't depend on
# anything running on this laptop. Local Postgres (docker-compose) is legacy
# and is not started by start-everything.sh anymore; `--all` still stops it
# via `docker compose down` in case you've re-enabled that mode.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PID_FILE="$ROOT/.dev-pids"

if [[ -f "$PID_FILE" ]]; then
  while IFS=: read -r name pid; do
    [[ -z "${pid:-}" ]] && continue
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null && echo "Stopped $name (pid $pid)"
    fi
  done < "$PID_FILE"
  rm -f "$PID_FILE"
fi

for p in 4000 5173 5174 8000 11434; do
  lsof -ti ":$p" | xargs kill -9 2>/dev/null || true
done

echo "Backend, frontend, ML service, and Ollama stopped."

if [[ "${1:-}" == "--all" ]]; then
  echo "Stopping Postgres (docker compose down) — only relevant if you re-enabled local-Postgres-primary mode…"
  docker compose down
fi
