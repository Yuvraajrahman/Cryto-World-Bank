#!/usr/bin/env bash
# Rebuild Diagrams/*.pdf from .svg sources.
# Uses headless Chrome via svg-to-pdf.py (not rsvg-convert):
#   - Mermaid labels live in foreignObject HTML (librsvg drops them)
#   - Chrome must use a custom page size matching each SVG viewBox (letter size crops wide figures)
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PY="$DIR/svg-to-pdf.py"
chmod +x "$PY"

count=0
for svg in "$DIR"/*.svg; do
  [[ -f "$svg" ]] || continue
  name="$(basename "$svg" .svg)"
  echo "pdf  $name"
  python3 "$PY" "$svg" "$DIR/${name}.pdf"
  count=$((count + 1))
done

echo "Done. Rebuilt $count PDF(s) in $DIR"
