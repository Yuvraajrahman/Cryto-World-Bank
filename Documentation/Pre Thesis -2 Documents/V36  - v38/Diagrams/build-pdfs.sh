#!/usr/bin/env bash
# Rebuild Diagrams/*.pdf from Diagrams/*.mmd (mmdc) and SVG exports (Ch1/Ch4 legacy).
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Self-contained: shared style + puppeteer config live alongside the .mmd sources in Diagrams/.
MERMAID_STYLE="$DIR/mermaid-config.json"
MERMAID_PUPPET="$DIR/puppeteer-config.json"
[[ -f "$MERMAID_STYLE" ]] || MERMAID_STYLE="$DIR/../mermaid-diagrams/style/mermaid-config.json"
[[ -f "$MERMAID_PUPPET" ]] || MERMAID_PUPPET="$DIR/../mermaid-diagrams/style/puppeteer-config.json"

# Hand-authored SVG exports from test figures/ — skip mmdc and rebuild PDF via rsvg.
is_hand_authored_svg() {
  case "$1" in
    fig-blockchain-stack|fig-component-architecture|fig-erd-core|fig-erd-extended|ERD_diagram_relational|\
    Ch3_use-case-nine-actor-taxonomy|fig-activity-lending|fig-activity-onboarding-id|fig-dfd-level0-lending|\
    fig-uml-class|fig-governance-dual-path|fig-sar-aml-workflow|fig-defense-in-depth|fig-local-llm-compact|\
    1_InterBankLendingPool|2_UpwardDepositFacility|3_SyndicatedLoan|4_TranchedPool|5_TreasurySwap|6_NettingEngine|\
    fig-blockchain-stack_updated|fig-component-architecture_updated|fig-erd-core_updated|\
    Ch3_use-case-nine-actor-taxonomy_updated|fig-activity-lending_updated|fig-activity-onboarding-id_updated|\
    fig-dfd-level0-lending_updated|fig-uml-class_updated|fig-governance-dual-path_updated|\
    fig-sar-aml-workflow_updated|fig-defense-in-depth_updated|fig-local-llm-compact_updated|\
    1_InterBankLendingPool_updated|2_UpwardDepositFacility_updated|3_SyndicatedLoan_updated|\
    4_TranchedPool_updated|5_TreasurySwap_updated|6_NettingEngine_updated|\
    fig-frontend-gateway-flow|fig-tx-construction-confirmation|\
    fig-server-state-synchronization|fig-onchain-state-transition)
      return 0 ;;
    *)
      return 1 ;;
  esac
}

# Width x height (px) tuned for thesis figure slots
figure_canvas() {
  local base="$1"
  case "$base" in
    fig-erd-core|fig-erd-core_updated|fig-erd-extended|fig-eer-model|fig-db-full-schema)
      echo "2000 1500" ;;
    ERD_diagram_relational)
      echo "16800 9600" ;;
    Ch3_use-case-nine-actor-taxonomy|Ch3_use-case-nine-actor-taxonomy_updated|fig-activity-onboarding-id|fig-activity-onboarding-id_updated)
      echo "1900 1400" ;;
    fig-activity-lending|fig-activity-lending_updated)
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
    fig-dfd-level0-lending|fig-dfd-level0-lending_updated)
      echo "1800 1440" ;;
    fig-dfd-level1-lending)
      echo "3840 2160" ;;
    d1_system_component_architecture)
      echo "2800 4200" ;;
    fig-component-architecture|fig-component-architecture_updated)
      echo "2200 1500" ;;
    fig-uml-class|fig-uml-class_updated)
      echo "2400 1700" ;;
    fig-blockchain-stack|fig-blockchain-stack_updated)
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
    fig-governance-dual-path|fig-governance-dual-path_updated)
      echo "2000 1200" ;;
    fig-sar-aml-workflow|fig-sar-aml-workflow_updated)
      echo "1900 1300" ;;
    fig-defense-in-depth|fig-defense-in-depth_updated)
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
    fig-local-llm-compact|fig-local-llm-compact_updated)
      echo "1600 1100" ;;
    fig-ml-metrics-bars|fig-ml-confusion-matrix|fig-ml-shap-importance|Ch4_rq2-latency-plan|fig-revenue-by-tier|fig-apr-spread)
      echo "1500 950" ;;
    1_InterBankLendingPool|1_InterBankLendingPool_updated|5_TreasurySwap|5_TreasurySwap_updated)
      echo "2000 1120" ;;
    2_UpwardDepositFacility|2_UpwardDepositFacility_updated)
      echo "2000 1170" ;;
    3_SyndicatedLoan|3_SyndicatedLoan_updated)
      echo "2000 1270" ;;
    4_TranchedPool|4_TranchedPool_updated|6_NettingEngine|6_NettingEngine_updated)
      echo "2000 1220" ;;
    fig-frontend-gateway-flow|fig-tx-construction-confirmation|fig-server-state-synchronization|fig-onchain-state-transition)
      echo "2000 1200" ;;
    *)
      echo "1600 1150" ;;
  esac
}

svg_to_pdf() {
  local name="$1" svg="$2"
  if [[ "$name" == "ERD_diagram_relational" ]]; then
    rsvg-convert -f pdf -o "$DIR/${name}.pdf" "$svg"
    return
  fi
  read -r W _H <<<"$(figure_canvas "$name")"
  rsvg-convert -w "$W" -f pdf -o "$DIR/${name}.pdf" "$svg"
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
      if is_hand_authored_svg "$name" && [[ -f "$DIR/${name}.svg" ]]; then
        echo "skip mmdc $name (hand-authored SVG)"
        continue
      fi
      read -r W H <<<"$(figure_canvas "$name")"
      echo "mmdc  $name (${W}x${H})"
      mmdc -i "$mmd" -o "$DIR/${name}.pdf" "${MMC_OPTS[@]}" -w "$W" -H "$H" -e pdf -f \
        || echo "WARN: mmdc failed for $name (continuing with SVG/rsvg if available)" >&2
      mmdc -i "$mmd" -o "$DIR/${name}.svg" "${MMC_OPTS[@]}" -w "$W" -H "$H" \
        || true
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
    # Keep mmdc PDFs unless a hand-authored SVG is the source of truth.
    if [[ -f "$DIR/${name}.mmd" ]] && ! is_hand_authored_svg "$name"; then
      echo "skip rsvg $name (mmdc PDF kept)"
      continue
    fi
    read -r W _H <<<"$(figure_canvas "$name")"
    echo "rsvg  $name (${W}px wide)"
    svg_to_pdf "$name" "$svg"
  done
else
  echo "WARN: rsvg-convert missing; skipping SVG PDFs" >&2
fi

echo "Done. PDFs in $DIR"
