#!/usr/bin/env bash
# Copy rendered Mermaid PDFs into overleaf/ (LaTeX graphicspath primary location).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="${SCRIPT_DIR}/../../../Diagrams/mermaid-pdf/improved diagrams"
DST_DIR="${SCRIPT_DIR}/overleaf"

if [[ ! -d "${SRC_DIR}" ]]; then
  echo "ERROR: diagram output not found: ${SRC_DIR}" >&2
  exit 1
fi

mkdir -p "${DST_DIR}"
count=0
for pdf in "${SRC_DIR}"/fig-*.pdf; do
  [[ -f "${pdf}" ]] || continue
  cp "${pdf}" "${DST_DIR}/"
  count=$((count + 1))
done

echo "Synced ${count} fig-*.pdf → overleaf/"
