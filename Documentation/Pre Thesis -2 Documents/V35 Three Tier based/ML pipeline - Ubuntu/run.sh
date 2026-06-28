#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

pick_python() {
  if [[ -f .python-bin ]]; then
    local s; s="$(tr -d '[:space:]' < .python-bin)"
    command -v "$s" &>/dev/null && { echo "$s"; return; }
  fi
  for c in python3.12 python3.11 python3.10 python3; do
    command -v "$c" &>/dev/null && { echo "$c"; return; }
  done
  echo "python3"
}

if [[ -d .venv ]] && [[ ! -x .venv/bin/python ]]; then
  echo "Broken .venv — run ./setup.sh"
  exit 1
fi

if [[ ! -d .venv ]]; then
  PY="$(pick_python)"
  "$PY" -m venv .venv
  .venv/bin/pip install -q -U pip wheel
  .venv/bin/pip install -q -r requirements.txt
fi

[[ -f .env ]] || cp .env.example .env
mkdir -p artifacts
LOG="artifacts/run.log"
echo "=== $(date -Iseconds) ubuntu run.sh $* ===" >> "$LOG"

exec .venv/bin/python run.py "$@" 2>&1 | tee -a "$LOG"
