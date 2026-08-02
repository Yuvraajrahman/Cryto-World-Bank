#!/usr/bin/env bash
# Regenerate live page SVGs under All current frontend designs/
# Usage:
#   ./regenerate.sh                         # both devices × both themes
#   ./regenerate.sh both both               # same
#   ./regenerate.sh desktop daymode
#   ./regenerate.sh phone darkmode
#   ./regenerate.sh both darkmode           # desktop+phone, dark only
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT"

PROFILE="${1:-${CWB_PROFILE:-both}}"
THEME="${2:-${CWB_THEME:-both}}"
export CWB_PROFILE="$PROFILE"
export CWB_THEME="$THEME"

echo "Repo: $ROOT"
echo "Profile (device): $CWB_PROFILE"
echo "Theme: $CWB_THEME"
echo "Checking API (:4000) and Vite (:5173)…"
curl -sf "http://127.0.0.1:4000/health" >/dev/null || {
  echo "API not up. Start: cd backend && npm run dev"
  exit 1
}
curl -sf -o /dev/null "http://127.0.0.1:5173/" || {
  echo "Vite not up. Start: cd frontend && npm run dev"
  exit 1
}

node "$SCRIPT_DIR/capture-page-svgs.mjs"
echo "Done. SVGs written next to phase folders; index at All current frontend designs/00-index.md"
