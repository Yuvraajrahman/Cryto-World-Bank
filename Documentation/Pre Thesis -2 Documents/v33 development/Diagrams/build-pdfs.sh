#!/usr/bin/env bash
# Rebuild Diagrams/*.pdf from 1_MMD/*.mmd, Diagrams/*.mmd (mmdc), and SVG exports (Ch*).
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MMD_DIR="$DIR/1_MMD"
MERMAID_STYLE="$DIR/../mermaid-diagrams/style/mermaid-config.json"
MERMAID_PUPPET="$DIR/../mermaid-diagrams/style/puppeteer-config.json"
OLD_DIAG="$(cd "$DIR/../../../../Previous plans/Old Diagrams" 2>/dev/null && pwd || true)"
OUT_SRC=""
if [[ -n "$OLD_DIAG" ]]; then
  OUT_SRC="${OLD_DIAG}/mermaid-pdf/improved diagrams"
fi

figure_canvas() {
  local base="$1"
  case "$base" in
    Ch1_six-banking-functions)
      echo "2400 1400" ;;
    fig-blockchain-stack)
      echo "1800 520" ;;
    Ch3_multi-entity-cross-tier-operations)
      echo "7200 5400" ;;
    Ch4_mvt-status)
      echo "1600 2000" ;;
    Ch4_dataset-timeline|Ch4_ml-evidence-pipeline)
      echo "1920 1200" ;;
    fig-db-1nf|fig-db-2nf|fig-db-3nf|fig-db-bcnf)
      echo "1800 2800" ;;
    fig-seq-*)
      echo "1800 1300" ;;
    *)
      echo "1600 1150" ;;
  esac
}

mmdc_common_opts() {
  MMC_OPTS=(-b white -q)
  [[ -f "$MERMAID_STYLE" ]] && MMC_OPTS+=(-c "$MERMAID_STYLE")
  [[ -f "$MERMAID_PUPPET" ]] && MMC_OPTS+=(-p "$MERMAID_PUPPET")
}

render_mmd() {
  local mmd="$1"
  local name
  name="$(basename "$mmd" .mmd)"
  read -r W H <<<"$(figure_canvas "$name")"
  echo "mmdc  $name (${W}x${H})"
  if [[ "$name" == "Ch4_mvt-status" || "$name" == fig-db-* || "$name" == Ch1_six-banking-functions || "$name" == fig-blockchain-stack ]]; then
    mmdc -i "$mmd" -o "$DIR/${name}.pdf" -b white -q -w "$W" -H "$H" -e pdf -f
    mmdc -i "$mmd" -o "$DIR/${name}.svg" -b white -q -w "$W" -H "$H" || true
  else
    mmdc_common_opts
    mmdc -i "$mmd" -o "$DIR/${name}.pdf" "${MMC_OPTS[@]}" -w "$W" -H "$H" -e pdf -f
    mmdc -i "$mmd" -o "$DIR/${name}.svg" "${MMC_OPTS[@]}" -w "$W" -H "$H" || true
  fi
}

if command -v mmdc >/dev/null 2>&1; then
  shopt -s nullglob
  for mmd in "$MMD_DIR"/*.mmd "$DIR"/*.mmd; do
    [[ -f "$mmd" ]] || continue
    render_mmd "$mmd"
  done
  shopt -u nullglob
else
  echo "WARN: mmdc missing; skipping Mermaid PDFs" >&2
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
    if [[ -f "$MMD_DIR/${name}.mmd" || -f "$DIR/${name}.mmd" ]]; then
      echo "skip rsvg $name (mmdc PDF kept)"
      continue
    fi
    echo "rsvg  $name"
    rsvg-convert -w 1200 -f pdf -o "$DIR/${name}.pdf" "$svg"
  done
else
  echo "WARN: rsvg-convert missing; skipping SVG PDFs" >&2
fi

echo "Done. PDFs in $DIR"
