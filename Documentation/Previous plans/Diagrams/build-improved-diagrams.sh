#!/usr/bin/env bash
#
# Render every Mermaid source file under
#   Documentation/Diagrams/mermaid-src/improved diagrams/
# into a vector PDF under
#   Documentation/Diagrams/mermaid-pdf/improved diagrams/
#
# Requires:  mmdc  (Mermaid CLI v10+;   npm install -g @mermaid-js/mermaid-cli)
#            puppeteer (auto-installed by mmdc)
#
# Run from the repository root or from anywhere -- the script resolves its own
# location so all paths are relative to the Documentation/Diagrams/ folder.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="${SCRIPT_DIR}/mermaid-src/improved diagrams"
OUT_DIR="${SCRIPT_DIR}/mermaid-pdf/improved diagrams"
CFG_FILE="${SCRIPT_DIR}/mmdc-config.json"
PUPPETEER_CFG="${SCRIPT_DIR}/mmdc-puppeteer.json"

mkdir -p "${OUT_DIR}"

# A larger viewport gives mmdc more room before its built-in shrink-to-fit.
# Otherwise the resulting PDF is forced into a 1200x800 box and text becomes tiny.
cat > "${CFG_FILE}" <<'JSON'
{
  "theme": "default",
  "themeCSS": ".label { font-family: 'Inter', Helvetica, Arial, sans-serif; }",
  "deterministicIds": true,
  "sequence": { "actorMargin": 60, "boxMargin": 10, "messageMargin": 35 },
  "flowchart": { "curve": "basis", "htmlLabels": true, "useMaxWidth": true }
}
JSON

cat > "${PUPPETEER_CFG}" <<'JSON'
{
  "args": ["--no-sandbox", "--font-render-hinting=none"]
}
JSON

if ! command -v mmdc >/dev/null 2>&1; then
  echo "ERROR: mmdc not found. Install with: npm install -g @mermaid-js/mermaid-cli" >&2
  exit 1
fi

shopt -s nullglob
count=0
fail=0
for src in "${SRC_DIR}"/*.mmd; do
  name="$(basename "${src}" .mmd)"
  out="${OUT_DIR}/${name}.pdf"
  if [[ -f "${out}" && "${out}" -nt "${src}" ]]; then
    continue
  fi
  printf "  render  %s\n" "${name}"
  if ! mmdc -i "${src}" -o "${out}" \
      -c "${CFG_FILE}" -p "${PUPPETEER_CFG}" \
      -t default -b white --pdfFit \
      --quiet >/dev/null 2>&1; then
    printf "  FAILED  %s\n" "${name}" >&2
    fail=$((fail + 1))
  else
    count=$((count + 1))
  fi
done
shopt -u nullglob

echo
echo "Rendered ${count} new diagram(s)${fail:+, ${fail} failed}."
