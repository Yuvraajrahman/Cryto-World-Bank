#!/usr/bin/env bash
# Sync vector figure bundle into Diagrams/.
# PDFs must come from build-improved-diagrams.sh (mmdc --pdfFit). Never rsvg-convert
# Mermaid SVGs here — foreignObject labels disappear in PDF.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIAGRAMS_ROOT="${SCRIPT_DIR}/../../../Diagrams"
MMD_SRC="${DIAGRAMS_ROOT}/mermaid-src/improved diagrams"
MMD_OUT="${DIAGRAMS_ROOT}/mermaid-pdf/improved diagrams"
DST_DIR="${SCRIPT_DIR}/Diagrams"
CFG="${DIAGRAMS_ROOT}/mmdc-config.json"
COMPACT_CFG="${DIAGRAMS_ROOT}/mmdc-config-compact.json"
CSS="${DIAGRAMS_ROOT}/mmdc-fonts.css"
PUPPETEER_CFG="${DIAGRAMS_ROOT}/mmdc-puppeteer.json"

mkdir -p "${DST_DIR}" "${MMD_OUT}"

# Archive SVG sources only (editable); do not derive PDF from these SVGs.
if command -v mmdc >/dev/null 2>&1; then
  for src in "${MMD_SRC}"/fig-*.mmd; do
    [[ -f "${src}" ]] || continue
    name="$(basename "${src}" .mmd)"
    svg_out="${MMD_OUT}/${name}.svg"
    if [[ -f "${svg_out}" && "${svg_out}" -nt "${src}" ]]; then
      continue
    fi
    cfg="${CFG}"
    dims=(-w 3600 -H 2800 -s 2)
    if [[ "${name}" == fig-banking-functions || "${name}" == fig-intro-system-overview || "${name}" == fig-cross-tier-lending || "${name}" == fig-optional-agent-addon ]]; then
      cfg="${COMPACT_CFG}"
      dims=(-w 1800 -H 1400 -s 1)
    fi
    echo "  svg     ${name}"
    mmdc -i "${src}" -o "${svg_out}" \
      -c "${cfg}" -C "${CSS}" -p "${PUPPETEER_CFG}" \
      "${dims[@]}" -b white --quiet
  done
fi

svg_count=0
pdf_count=0
for svg in "${MMD_OUT}"/fig-*.svg; do
  [[ -f "${svg}" ]] || continue
  cp "${svg}" "${DST_DIR}/"
  svg_count=$((svg_count + 1))
done
for pdf in "${MMD_OUT}"/fig-*.pdf; do
  [[ -f "${pdf}" ]] || continue
  cp "${pdf}" "${DST_DIR}/"
  pdf_count=$((pdf_count + 1))
done

for orphan in \
  Ch1_six-banking-functions.png \
  Ch3_four-layer-dapp-architecture.png \
  Ch3_core-entity-relationship-diagram.png \
  Ch3_extended-erd-banking-multi-entity.png \
  Ch3_enhanced-eer-model.png \
  Ch3_four-tier-capital-flow.png \
  Ch3_five-layer-defense-in-depth.png \
  Ch4_realtime-dashboard-monitoring-pipeline.png \
  Ch4_optional-conversational-agent-addon.png
do
  rm -f "${DST_DIR}/${orphan}"
done

# Remove stale raster figure exports (logo PNG is kept separately).
find "${DST_DIR}" -maxdepth 1 -type f -name 'fig-*.png' -delete
find "${DST_DIR}" -maxdepth 1 -type f -name 'Ch*.png' -delete
find "${DST_DIR}" -maxdepth 1 -type f -name '*-svg-tex.pdf' -delete

# Hand-authored Ch*.svg uses native <text>; rsvg-convert is safe.
ch_pdf_count=0
if command -v rsvg-convert >/dev/null 2>&1; then
  for svg in "${DST_DIR}"/Ch*.svg; do
    [[ -f "${svg}" ]] || continue
    name="$(basename "${svg}" .svg)"
    pdf="${DST_DIR}/${name}.pdf"
    if [[ "${FORCE:-0}" != "1" && -f "${pdf}" && "${pdf}" -nt "${svg}" ]]; then
      ch_pdf_count=$((ch_pdf_count + 1))
      continue
    fi
    echo "  ch-pdf  ${name}"
    rsvg-convert -f pdf -o "${pdf}" "${svg}"
    ch_pdf_count=$((ch_pdf_count + 1))
  done
else
  echo "WARN: rsvg-convert not found; Ch*.pdf not rebuilt" >&2
fi

echo "Synced ${svg_count} fig-*.svg, ${pdf_count} fig-*.pdf, ${ch_pdf_count} Ch*.pdf → Diagrams/"
