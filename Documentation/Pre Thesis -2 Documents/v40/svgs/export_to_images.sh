#!/usr/bin/env bash
# Export edited SVGs in this folder to matching PDFs in ../images/
# Usage: ./export_to_images.sh [stem ...]
#   no args → export every *.svg here
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
OUT="$(cd "$DIR/../images" && pwd)"
if ! command -v rsvg-convert >/dev/null 2>&1; then
  echo "Need rsvg-convert (brew install librsvg)" >&2
  exit 1
fi
export_one() {
  local svg="$1"
  local stem base
  base="$(basename "$svg")"
  stem="${base%.svg}"
  rsvg-convert -f pdf -o "$OUT/${stem}.pdf" "$svg"
  echo "OK  $stem.svg → images/${stem}.pdf"
}
if [[ $# -eq 0 ]]; then
  shopt -s nullglob
  for svg in "$DIR"/*.svg; do export_one "$svg"; done
else
  for stem in "$@"; do
    stem="${stem%.svg}"
    export_one "$DIR/${stem}.svg"
  done
fi
