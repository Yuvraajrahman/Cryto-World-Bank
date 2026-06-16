#!/usr/bin/env bash
# One-time setup for Ubuntu (i5 / 32 GB / loadshedding-friendly).
# Usage: chmod +x setup_ubuntu.sh && ./setup_ubuntu.sh
set -euo pipefail
cd "$(dirname "$0")"

echo "============================================================"
echo "  CWB ML Training — Ubuntu setup"
echo "============================================================"

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
  echo "ERROR: Need Python 3.10+. Install:"
  echo "  sudo apt update && sudo apt install -y python3.12 python3.12-venv python3-pip"
  exit 1
}

echo "[1/5] Using interpreter: $PY ($($PY --version))"

# System packages (optional — script continues if apt not available)
APT_PKGS=(python3-venv python3-pip build-essential curl wget unzip)
MISSING=()
for pkg in "${APT_PKGS[@]}"; do
  dpkg -s "$pkg" &>/dev/null || MISSING+=("$pkg")
done
if ((${#MISSING[@]})); then
  echo "[2/5] Recommended apt packages missing: ${MISSING[*]}"
  echo "      Run (once, with sudo):"
  echo "        sudo apt update && sudo apt install -y ${MISSING[*]}"
  echo "      Continuing with pip-only setup …"
else
  echo "[2/5] System packages: OK"
fi

# Remove broken venv (e.g. copied from macOS)
if [[ -d .venv ]] && [[ ! -x .venv/bin/python ]]; then
  echo "[3/5] Removing incompatible .venv (wrong OS/arch) …"
  rm -rf .venv
fi

if [[ ! -d .venv ]]; then
  echo "[3/5] Creating virtual environment …"
  "$PY" -m venv .venv
else
  echo "[3/5] Reusing existing .venv"
fi

echo "[4/5] Installing Python dependencies (may take 2–5 min) …"
.venv/bin/pip install -q -U pip wheel setuptools
.venv/bin/pip install -q -r requirements.txt

if [[ ! -f .env ]] && [[ -f .env.example ]]; then
  cp .env.example .env
  echo "[5/5] Created .env from .env.example"
else
  echo "[5/5] .env already exists"
fi

chmod +x run.sh run_in_tmux.sh 2>/dev/null || true
mkdir -p data artifacts results/mmd results/svg agent

echo "$PY" > .python-bin
echo ""
echo "Setup complete."
echo ""
echo "  Next steps:"
echo "    1. (Optional) Put BCCC CSV at data/bccc.csv"
echo "    2. Or set DATASET_URL / DATASET_LOCAL_PATH in .env"
echo "    3. Run pipeline:"
echo "         ./run.sh"
echo "    4. After power cut:"
echo "         ./run.sh          # auto-resumes checkpoints"
echo "    5. Long session in tmux:"
echo "         ./run_in_tmux.sh"
echo ""
echo "  Mermaid SVG (optional): npm install -g @mermaid-js/mermaid-cli"
echo "============================================================"
