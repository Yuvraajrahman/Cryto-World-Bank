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
    ERD_diagram_relational)
      echo "16800 9600" ;;
    Ch3_use-case-nine-actor-taxonomy|fig-activity-onboarding-id)
      echo "1900 1400" ;;
    fig-activity-lending)
      echo "4110 3030" ;;
    Ch3_data-flow-diagrams)
      echo "2280 1680" ;;
    Ch3_multi-entity-cross-tier-operations)
      echo "3800 2200" ;;
    fig-seq-loan-flow)
      echo "2000 2800" ;;
    fig-seq-installment-income)
      echo "2000 2400" ;;
    fig-seq-banking-data)
      echo "2000 2000" ;;
    fig-seq-chat-chatbot)
      echo "2200 2600" ;;
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
    fig-architecture-data-flow)
      echo "1900 1400" ;;
    fig-dfd-level0-lending)
      echo "1800 1440" ;;
    fig-dfd-level1-lending)
      echo "3840 2160" ;;
    d1_system_component_architecture)
      echo "2800 4200" ;;
    fig-component-architecture)
      echo "2200 1500" ;;
    fig-uml-class)
      echo "2400 1700" ;;
    fig-blockchain-stack)
      echo "2400 1100" ;;
    fig-data-partitioning)
      echo "1200 420" ;;
    fig-financial-data-lifecycle)
      echo "1300 520" ;;
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
    fig-ml-preprocessing-split)
      echo "1400 1500" ;;
    fig-ml-inference-service)
      echo "1400 900" ;;
    Ch4_four-phase-roadmap-sdlc)
      echo "1900 1500" ;;
    Ch4_dev-verification-toolchain)
      echo "1600 520" ;;
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

# Sequence diagrams: keep mmdc PDF geometry (message spacing matches labels).
# Do not scale inline SVG fonts — that enlarges text without moving arrows.
finalize_figure_pdf() {
  local name="$1" width="$2"
  if [[ "$name" == fig-seq-* ]]; then
    echo "keep  $name (mmdc PDF, native spacing)"
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
      if [[ "$name" == "ERD_diagram_relational" && -f "$DIR/ERD_diagram_relational.svg" ]]; then
        echo "skip mmdc $name (hand-authored SVG)"
        continue
      fi
      if [[ "$name" == "fig-erd-core" && -f "$DIR/fig-erd-core.svg" ]]; then
        echo "skip mmdc $name (hand-authored SVG)"
        continue
      fi
      if [[ "$name" == "fig-erd-extended" && -f "$DIR/fig-erd-extended.svg" ]]; then
        echo "skip mmdc $name (hand-authored SVG)"
        continue
      fi
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
    # Hand-authored SVG replaces mmdc output for the full relational ERD.
    if [[ -f "$DIR/${name}.mmd" && "$name" != "ERD_diagram_relational" && "$name" != "fig-erd-core" && "$name" != "fig-erd-extended" ]]; then
      echo "skip rsvg $name (mmdc PDF kept)"
      continue
    fi
    echo "rsvg  $name"
    if [[ "$name" == "ERD_diagram_relational" ]]; then
      rsvg-convert -f pdf -o "$DIR/${name}.pdf" "$svg"
    else
      rsvg-convert -w 1200 -f pdf -o "$DIR/${name}.pdf" "$svg"
    fi
  done
else
  echo "WARN: rsvg-convert missing; skipping SVG PDFs" >&2
fi

echo "Done. PDFs in $DIR"
