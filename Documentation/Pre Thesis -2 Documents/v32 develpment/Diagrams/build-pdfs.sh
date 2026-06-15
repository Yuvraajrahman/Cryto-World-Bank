#!/usr/bin/env bash
# Rebuild Diagrams/*.pdf from Mermaid sources (fig-*) and SVG exports (Ch*).
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OLD_DIAG="$(cd "$DIR/../../../../Previous plans/Old Diagrams" 2>/dev/null && pwd || true)"
OUT_SRC=""
if [[ -n "$OLD_DIAG" ]]; then
  OUT_SRC="${OLD_DIAG}/mermaid-pdf/improved diagrams"
fi

if [[ -n "$OLD_DIAG" ]] && command -v mmdc >/dev/null 2>&1 && [[ -x "${OLD_DIAG}/build-improved-diagrams.sh" ]]; then
  echo "Rendering fig-* via ${OLD_DIAG}/build-improved-diagrams.sh"
  FORCE=1 "${OLD_DIAG}/build-improved-diagrams.sh"
  if [[ -d "$OUT_SRC" ]]; then
    cp -f "$OUT_SRC"/fig-*.pdf "$DIR/"
  fi
else
  echo "WARN: mmdc or Old Diagrams tree missing; skipping fig-* mermaid PDFs" >&2
fi

if command -v rsvg-convert >/dev/null 2>&1; then
  for svg in "$DIR"/*.svg; do
    [[ -f "$svg" ]] || continue
    name="$(basename "$svg" .svg)"
    echo "rsvg  $name"
    rsvg-convert -w 1200 -f pdf -o "$DIR/${name}.pdf" "$svg"
  done
else
  echo "WARN: rsvg-convert missing; skipping SVG PDFs" >&2
fi

echo "Done. PDFs in $DIR"
