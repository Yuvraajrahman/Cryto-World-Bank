#!/usr/bin/env bash
# Rebuild Diagrams/*.pdf from Diagrams/*.mmd (mmdc) and SVG exports (Ch1/Ch4 legacy).
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Self-contained: shared style + puppeteer config live alongside the .mmd sources in Diagrams/.
MERMAID_STYLE="$DIR/mermaid-config.json"
MERMAID_PUPPET="$DIR/puppeteer-config.json"
[[ -f "$MERMAID_STYLE" ]] || MERMAID_STYLE="$DIR/../mermaid-diagrams/style/mermaid-config.json"
[[ -f "$MERMAID_PUPPET" ]] || MERMAID_PUPPET="$DIR/../mermaid-diagrams/style/puppeteer-config.json"

# Width x height (px) tuned for thesis figure slots
figure_canvas() {
  local base="$1"
  case "$base" in
    fig-erd-core|fig-erd-extended|fig-eer-model|fig-db-full-schema)
      echo "2000 1500" ;;
    Ch3_use-case-nine-actor-taxonomy|fig-activity-onboarding-id)
      echo "1900 1400" ;;
    fig-activity-lending)
      echo "4110 3030" ;;
    Ch3_data-flow-diagrams)
      echo "2280 1680" ;;
    Ch3_multi-entity-cross-tier-operations)
      echo "7200 5400" ;;
    fig-seq-chat-chatbot)
      echo "2160 1560" ;;
    fig-seq-*)
      echo "1800 1300" ;;
    fig-db-1nf|fig-db-2nf|fig-db-3nf|fig-db-bcnf)
      echo "1800 2800" ;;
    fig-kinked-rate-curve|fig-liquidation-engine)
      echo "1200 950" ;;
    fig-credit-passport)
      echo "2000 1000" ;;
    fig-oracle-architecture)
      echo "2400 1300" ;;
    fig-ml-explainability)
      echo "1900 1700" ;;
    Ch4_dataset-timeline|Ch4_ml-evidence-pipeline)
      echo "1920 1200" ;;
    fig-tier-model|fig-five-stage-funnel|fig-agent-six-step-pipeline)
      echo "1400 1000" ;;
    Ch3_actor-permission-matrix)
      echo "1100 1500" ;;
    Ch4_mvt-status)
      echo "1600 1800" ;;
    Ch1_system-overview-four-tier-stack)
      echo "2200 1500" ;;
    Ch1_six-banking-functions)
      echo "1900 1100" ;;
    Ch1_cross-tier-lending-flows)
      echo "1800 1200" ;;
    fig-three-layer-arch)
      echo "1800 1300" ;;
    fig-component-architecture)
      echo "2200 1500" ;;
    fig-uml-class)
      echo "2000 1400" ;;
    fig-blockchain-stack)
      echo "1700 1250" ;;
    fig-data-partitioning|fig-financial-data-lifecycle)
      echo "2000 1300" ;;
    fig-activity-aux)
      echo "1900 1400" ;;
    fig-hierarchical-banking)
      echo "1500 1300" ;;
    fig-group-lending-lifecycle)
      echo "1900 1200" ;;
    fig-governance-dual-path)
      echo "2000 1200" ;;
    fig-sar-aml-workflow)
      echo "1900 1300" ;;
    fig-defense-in-depth)
      echo "1700 1300" ;;
    fig-security-controls)
      echo "1800 1300" ;;
    Ch4_ml-oracle-commit-reveal)
      echo "2000 1300" ;;
    Ch4_four-phase-roadmap-sdlc)
      echo "1900 1500" ;;
    Ch4_dev-verification-toolchain)
      echo "1900 1400" ;;
    fig-savings-vault)
      echo "1800 1050" ;;
    fig-local-llm)
      echo "1800 1400" ;;
    fig-local-llm-compact)
      echo "1600 1100" ;;
    fig-ml-metrics-bars|fig-ml-confusion-matrix|fig-ml-shap-importance|Ch4_rq2-latency-plan|fig-revenue-by-tier|fig-apr-spread)
      echo "1500 950" ;;
    *)
      echo "1600 1150" ;;
  esac
}

mmdc_common_opts() {
  MMC_OPTS=(-b white -q)
  [[ -f "$MERMAID_STYLE" ]] && MMC_OPTS+=(-c "$MERMAID_STYLE")
  [[ -f "$MERMAID_PUPPET" ]] && MMC_OPTS+=(-p "$MERMAID_PUPPET")
}

# Sequence diagrams embed inline 16px labels; scale by factor for thesis readability.
scale_svg_inline_fonts() {
  local svg="$1" factor="$2"
  python3 - "$svg" "$factor" <<'PY'
import re, sys
from pathlib import Path
path, factor = Path(sys.argv[1]), float(sys.argv[2])
text = path.read_text()

def repl(m):
    size = float(m.group(1))
    return f"font-size: {size * factor:.1f}px"

text = re.sub(r"font-size:\s*([0-9.]+)px", repl, text)
path.write_text(text)
PY
}

# Sequence diagrams are participant-wide; at \linewidth their native 13px labels
# shrink to ~3pt. Enlarge the inline fonts (geometry stays fixed) then re-render the
# SVG to PDF so the thesis copy is legible.
finalize_figure_pdf() {
  local name="$1" width="$2"
  local svg="$DIR/${name}.svg" pdf="$DIR/${name}.pdf"
  if [[ "$name" == fig-seq-* ]]; then
    scale_svg_inline_fonts "$svg" 1.5
    if command -v rsvg-convert >/dev/null 2>&1; then
      echo "rsvg  $name (scaled labels x1.5)"
      rsvg-convert -w "$width" -f pdf -o "$pdf" "$svg"
    fi
  fi
}

if command -v mmdc >/dev/null 2>&1; then
  mmdc_common_opts
  shopt -s nullglob
  mmd_files=("$DIR"/*.mmd)
  shopt -u nullglob
  if ((${#mmd_files[@]} == 0)); then
    echo "WARN: no .mmd files in $DIR; skipping Mermaid PDFs" >&2
  else
    for mmd in "${mmd_files[@]}"; do
      name="$(basename "$mmd" .mmd)"
      read -r W H <<<"$(figure_canvas "$name")"
      echo "mmdc  $name (${W}x${H})"
      mmdc -i "$mmd" -o "$DIR/${name}.pdf" "${MMC_OPTS[@]}" -w "$W" -H "$H" -e pdf -f
      mmdc -i "$mmd" -o "$DIR/${name}.svg" "${MMC_OPTS[@]}" -w "$W" -H "$H" || true
      finalize_figure_pdf "$name" "$W"
    done
  fi
else
  echo "WARN: mmdc missing; skipping Mermaid PDFs" >&2
fi

if command -v rsvg-convert >/dev/null 2>&1; then
  for svg in "$DIR"/*.svg; do
    [[ -f "$svg" ]] || continue
    name="$(basename "$svg" .svg)"
    # Mermaid PDFs from mmdc keep node labels; rsvg-convert drops foreignObject text.
    if [[ -f "$DIR/${name}.mmd" ]]; then
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
