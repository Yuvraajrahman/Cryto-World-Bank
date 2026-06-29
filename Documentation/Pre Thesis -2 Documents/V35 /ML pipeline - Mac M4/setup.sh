#!/usr/bin/env bash
# macOS M4 Air one-time setup
set -euo pipefail
cd "$(dirname "$0")"

echo "=== CWB ML — Mac M4 setup ==="

pick_python() {
  for c in python3.12 python3.11 python3.10 python3; do
    if command -v "$c" &>/dev/null; then
      if "$c" -c 'import sys; sys.exit(0 if sys.version_info[:2] >= (3, 10) else 1)' 2>/dev/null; then
        echo "$c"
        return 0
      fi
    fi
  done
  return 1
}

PY="$(pick_python)" || {
  echo "Install Python 3.10+ via Homebrew: brew install python@3.12"
  exit 1
}
echo "Python: $PY ($($PY --version))"

if [[ -d .venv ]] && [[ ! -x .venv/bin/python ]]; then
  rm -rf .venv
fi

if [[ ! -d .venv ]]; then
  "$PY" -m venv .venv
fi

.venv/bin/pip install -q -U pip wheel setuptools
.venv/bin/pip install -q -r requirements.txt

[[ -f .env ]] || cp .env.example .env
echo "$PY" > .python-bin
chmod +x run.sh run_awake.sh
mkdir -p data artifacts results/mmd results/svg agent

if ! xcode-select -p &>/dev/null; then
  echo "Note: if pip build fails, run: xcode-select --install"
fi

echo "Done. Run: ./run.sh  (or ./run_awake.sh to prevent sleep)"
