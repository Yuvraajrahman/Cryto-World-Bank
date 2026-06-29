#!/usr/bin/env bash
# Ubuntu one-time setup — i5-10400, 32 GB
set -euo pipefail
cd "$(dirname "$0")"

echo "=== CWB ML — Ubuntu setup ==="

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
  echo "Install Python 3.10+: sudo apt install -y python3.12 python3.12-venv python3-pip"
  exit 1
}
echo "Python: $PY ($($PY --version))"

MISSING=()
for pkg in python3-venv python3-pip build-essential curl wget unzip tmux; do
  dpkg -s "$pkg" &>/dev/null || MISSING+=("$pkg")
done
if ((${#MISSING[@]})); then
  echo "Recommended: sudo apt update && sudo apt install -y ${MISSING[*]}"
fi

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
chmod +x run.sh run_in_tmux.sh
mkdir -p data artifacts results/mmd results/svg agent

echo "Done. Run: ./run.sh"
