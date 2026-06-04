#!/usr/bin/env bash
# Render v29 Mermaid sources to PDF (greyscale, Inter via mmdc-config.json).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="${SCRIPT_DIR}/mermaid-src"
OUT_DIR="${SCRIPT_DIR}/mermaid-pdf"
CFG_FILE="${SCRIPT_DIR}/mmdc-config.json"
CHART_CFG="${SCRIPT_DIR}/mmdc-charts-config.json"
PUPPETEER_CFG="${SCRIPT_DIR}/mmdc-puppeteer.json"
CHART_DIAGRAMS="fig-revenue-by-tier fig-apr-spread"

mkdir -p "${OUT_DIR}"

if ! command -v mmdc >/dev/null 2>&1; then
  echo "ERROR: mmdc not found. Install: npm install -g @mermaid-js/mermaid-cli" >&2
  exit 1
fi

FORCE="${FORCE:-0}"
ALIASES=(
  "fig-seq-chat-chatbot:fig-seq-agent-banking"
)

shopt -s nullglob
count=0
fail=0
failed_names=()

render_one() {
  local src="$1"
  local name="$2"
  local out="${OUT_DIR}/${name}.pdf"
  local cfg="${CFG_FILE}"
  if [[ "${FORCE}" != "1" && -f "${out}" && "${out}" -nt "${src}" ]]; then
    return 0
  fi
  if [[ " ${CHART_DIAGRAMS} " == *" ${name} "* ]]; then
    local svg_tmp="${OUT_DIR}/${name}.svg"
    cfg="${CHART_CFG}"
    printf "  render  %s (chart)\n" "${name}"
    if ! mmdc -i "${src}" -o "${svg_tmp}" -c "${cfg}" -p "${PUPPETEER_CFG}" -b white --quiet; then
      failed_names+=("${name}")
      return 1
    fi
    sed -i '' -e 's/#131300/#000000/g' \
      -e 's/stroke="#888888" stroke-width="0"/stroke="#000000" stroke-width="0.8"/g' \
      "${svg_tmp}" 2>/dev/null || sed -i -e 's/#131300/#000000/g' "${svg_tmp}"
    if ! rsvg-convert -f pdf -o "${out}" "${svg_tmp}"; then
      failed_names+=("${name}")
      return 1
    fi
    return 0
  fi
  printf "  render  %s\n" "${name}"
  if ! mmdc -i "${src}" -o "${out}" -c "${cfg}" -p "${PUPPETEER_CFG}" -b white --pdfFit --quiet; then
    failed_names+=("${name}")
    return 1
  fi
  return 0
}

for src in "${SRC_DIR}"/*.mmd; do
  name="$(basename "${src}" .mmd)"
  if render_one "${src}" "${name}"; then
    count=$((count + 1))
  else
    fail=$((fail + 1))
  fi
done

for pair in "${ALIASES[@]}"; do
  alias_name="${pair%%:*}"
  source_name="${pair##*:}"
  src="${SRC_DIR}/${source_name}.mmd"
  if [[ -f "${src}" ]]; then
    if render_one "${src}" "${alias_name}"; then
      count=$((count + 1))
    else
      fail=$((fail + 1))
    fi
  fi
done

shopt -u nullglob
echo
echo "Rendered ${count} PDF(s)${fail:+, ${fail} failed}."
if (( fail > 0 )); then
  printf "Failed: %s\n" "${failed_names[@]}"
  exit 1
fi
