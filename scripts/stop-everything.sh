#!/usr/bin/env bash
# Stop processes started by start-everything.sh (backend, frontend, ML, Ollama, tunnel).
# By default keeps Docker Postgres running.
# Use --all to also stop Postgres (docker compose down).
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

for p in 4000 5173 5174 8000 11434 4040; do
  lsof -ti ":$p" | xargs kill -9 2>/dev/null || true
done

pkill -f "ngrok http 4000" 2>/dev/null || true
pkill -f "cloudflared tunnel --url http://127.0.0.1:4000" 2>/dev/null || true

echo "Backend, frontend, ML service, Ollama, and tunnel stopped."

if [[ "${1:-}" == "--all" ]]; then
  echo "Stopping Postgres (docker compose down)…"
  docker compose down
else
  echo "Postgres left running (cwb-postgres). Use --all to stop it too."
fi
