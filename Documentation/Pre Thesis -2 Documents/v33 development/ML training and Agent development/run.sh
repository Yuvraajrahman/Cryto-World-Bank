#!/usr/bin/env bash
# Ubuntu / Linux entrypoint — environment → dataset → train → MMD/SVG
set -euo pipefail
cd "$(dirname "$0")"

pick_python() {
  if [[ -f .python-bin ]]; then
    local saved
    saved="$(tr -d '[:space:]' < .python-bin)"
    if command -v "$saved" &>/dev/null; then
      echo "$saved"
      return
    fi
  fi
  for c in python3.12 python3.11 python3.10 python3; do
    if command -v "$c" &>/dev/null; then
      if "$c" -c 'import sys; sys.exit(0 if sys.version_info[:2] >= (3, 10) else 1)' 2>/dev/null; then
        echo "$c"
        return
      fi
    fi
  done
  echo "python3"
}

# venv from another machine (e.g. macOS) will not run on Linux
if [[ -d .venv ]] && [[ ! -x .venv/bin/python ]]; then
  echo "[run.sh] Removing broken .venv — run ./setup_ubuntu.sh first"
  rm -rf .venv
fi

if [[ ! -d .venv ]]; then
  PY="$(pick_python)"
  echo "[run.sh] Creating .venv with $PY …"
  "$PY" -m venv .venv
  .venv/bin/pip install -q -U pip wheel
  .venv/bin/pip install -q -r requirements.txt
fi

if [[ ! -f .env ]] && [[ -f .env.example ]]; then
  cp .env.example .env
  echo "[run.sh] Created .env — add DATASET_URL when BCCC link arrives"
fi

# Log full output for post-loadshedding review
mkdir -p artifacts
LOG="artifacts/run.log"
echo "=== $(date -Iseconds) run.sh $* ===" >> "$LOG"

exec .venv/bin/python run.py "$@" 2>&1 | tee -a "$LOG"
