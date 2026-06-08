#!/usr/bin/env bash
#
# Render every Mermaid source file under
#   Documentation/Diagrams/mermaid-src/improved diagrams/
# into a vector PDF under
#   Documentation/Diagrams/mermaid-pdf/improved diagrams/
#
# Requires: mmdc  (Mermaid CLI v10+; npm install -g @mermaid-js/mermaid-cli)
#
# Design tokens are pinned in mmdc-config.json (low-profile greyscale palette,
# Inter font, professional notation). Every .mmd source inherits them.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="${SCRIPT_DIR}/mermaid-src/improved diagrams"
OUT_DIR="${SCRIPT_DIR}/mermaid-pdf/improved diagrams"
CFG_FILE="${SCRIPT_DIR}/mmdc-config.json"
CSS_FILE="${SCRIPT_DIR}/mmdc-fonts.css"
CHART_CFG="${SCRIPT_DIR}/mmdc-charts-config.json"
PUPPETEER_CFG="${SCRIPT_DIR}/mmdc-puppeteer.json"
CHART_DIAGRAMS="fig-revenue-by-tier fig-apr-spread fig-kinked-rate-curve fig-phase-effort-bar fig-revenue-mix-pie fig-market-tam-pie"
COMPACT_DIAGRAMS="fig-optional-agent-addon fig-intro-system-overview fig-banking-functions fig-cross-tier-lending"
COMPACT_CFG="${SCRIPT_DIR}/mmdc-config-compact.json"
# Large canvas + 2× scale keeps label text readable after --pdfFit shrinks to page.
MMDC_WIDTH="${MMDC_WIDTH:-3600}"
MMDC_HEIGHT="${MMDC_HEIGHT:-2800}"
MMDC_SCALE="${MMDC_SCALE:-2}"
MMDC_ARGS=(-w "${MMDC_WIDTH}" -H "${MMDC_HEIGHT}" -s "${MMDC_SCALE}")

# ER diagrams and flowcharts use Mermaid foreignObject labels. rsvg-convert drops
# that HTML, so labels render invisible in PDF. Use mmdc --pdfFit (Chromium) instead.
ER_DIAGRAMS="fig-erd-core fig-erd-extended"

mkdir -p "${OUT_DIR}"

if ! command -v mmdc >/dev/null 2>&1; then
  echo "ERROR: mmdc not found. Install with: npm install -g @mermaid-js/mermaid-cli" >&2
  exit 1
fi

FORCE="${FORCE:-0}"

shopt -s nullglob
count=0
fail=0
failed_names=()
for src in "${SRC_DIR}"/*.mmd; do
  name="$(basename "${src}" .mmd)"
  out="${OUT_DIR}/${name}.pdf"
  if [[ "${FORCE}" != "1" && -f "${out}" && "${out}" -nt "${src}" ]]; then
    continue
  fi
  cfg="${CFG_FILE}"
  svg_tmp=""
  if [[ " ${CHART_DIAGRAMS} " == *" ${name} "* ]]; then
    cfg="${CHART_CFG}"
    svg_tmp="${OUT_DIR}/${name}.svg"
    printf "  render  %s (chart B&W)\n" "${name}"
    if ! mmdc -i "${src}" -o "${svg_tmp}" \
        -c "${cfg}" -C "${CSS_FILE}" -p "${PUPPETEER_CFG}" \
        "${MMDC_ARGS[@]}" \
        -b white --quiet >/dev/null 2>&1; then
      printf "  FAILED  %s (svg)\n" "${name}" >&2
      failed_names+=("${name}")
      fail=$((fail + 1))
      continue
    fi
    # Mermaid xychart embeds olive #131300 on axes; force strict B&W (match fig-apr-spread).
    sed -i '' \
      -e 's/#131300/#000000/g' \
      -e 's/stroke="#888888" stroke-width="0"/stroke="#000000" stroke-width="0.8"/g' \
      "${svg_tmp}"
    if ! rsvg-convert -f pdf -o "${out}" "${svg_tmp}" 2>/dev/null; then
      printf "  FAILED  %s (pdf via rsvg-convert)\n" "${name}" >&2
      failed_names+=("${name}")
      fail=$((fail + 1))
    else
      count=$((count + 1))
    fi
    continue
  fi
  mmdc_width=("${MMDC_ARGS[@]}")
  if [[ " ${COMPACT_DIAGRAMS} " == *" ${name} "* ]]; then
    cfg="${COMPACT_CFG}"
    mmdc_width=(-w 1800 -H 1400 -s 1)
    printf "  render  %s (compact)\n" "${name}"
  elif [[ " ${ER_DIAGRAMS} " == *" ${name} "* ]]; then
    mmdc_width=(-w 4400 -H 3400 -s "${MMDC_SCALE}")
    printf "  render  %s (ER diagram)\n" "${name}"
  else
    printf "  render  %s\n" "${name}"
  fi
  if ! mmdc -i "${src}" -o "${out}" \
      -c "${cfg}" -C "${CSS_FILE}" -p "${PUPPETEER_CFG}" \
      "${mmdc_width[@]}" \
      -b white --pdfFit \
      --quiet >/dev/null 2>&1; then
    printf "  FAILED  %s\n" "${name}" >&2
    failed_names+=("${name}")
    fail=$((fail + 1))
  else
    count=$((count + 1))
  fi
done
shopt -u nullglob

echo
echo "Rendered ${count} diagram(s)${fail:+, ${fail} failed}."
if (( fail > 0 )); then
  printf "Failed: %s\n" "${failed_names[@]}"
  exit 1
fi
