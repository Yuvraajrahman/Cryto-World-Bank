#!/bin/bash
# Build Pre-thesis_v12_acm.pdf (ACM acmsmall + PNG diagram pipeline from v11).
set -e
cd "$(dirname "$0")/.."
export TEXINPUTS="texmf-local/tex/latex//:${TEXINPUTS:-}"

python3 tools/migrate_to_acmart.py
python3 tools/build_mermaid_pdfs.py

pdflatex -interaction=nonstopmode Pre-thesis_v12_acm.tex
bibtex Pre-thesis_v12_acm 2>/dev/null || true
pdflatex -interaction=nonstopmode Pre-thesis_v12_acm.tex
pdflatex -interaction=nonstopmode Pre-thesis_v12_acm.tex

echo "Output: Pre-thesis_v12_acm.pdf"
