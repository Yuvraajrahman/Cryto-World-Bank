#!/usr/bin/env bash
# Prevent Mac sleep during training (lid open recommended)
set -euo pipefail
cd "$(dirname "$0")"
echo "Keeping Mac awake during training (Ctrl+C to stop)…"
exec caffeinate -dimsu ./run.sh "$@"
