# ACM `acmsmall` — build Pre-thesis v12 PDF

## Recommended workflow (PNG diagrams)

| File | Use |
|------|-----|
| **`Pre-thesis_v11.tex`** | Main thesis — BRAC `report`, **Mermaid → PNG** pipeline |
| **`Pre-thesis_v12_acm.tex`** | Same content, **ACM `acmsmall`** layout |
| **`Pre-thesis_v13.tex`** | Deprecated (auto-TikZ); use v11 instead |

Diagram pipeline (unchanged):

```bash
cd Documentation
python3 tools/build_mermaid_pdfs.py    # Mermaid → Diagrams/mermaid-pdf/*.png
pdflatex Pre-thesis_v11.tex            # ×2 for v11 PDF
```

## Install LaTeX packages (one time)

You already installed **`acmart`** and **`libertine`**.  
`newtxtext` / `newtxmath` are not separate package names on TeX Live 2026 — install **`newtx`** instead:

```bash
cd Documentation
bash tools/install_acmart_deps.sh
```

Or manually:

```bash
sudo tlmgr install xstring totpages hyperxmp manyfoot newtx zi4 draftwatermark pbalance
```

## Build v12 PDF

```bash
cd Documentation
bash tools/build_v12_pdf.sh
```

Output: **`Pre-thesis_v12_acm.pdf`**

## Overleaf (if local `tlmgr` is painful)

1. New project → ACM Conference Proceedings Template (`acmsmall`)
2. Upload `Pre-thesis_v12_acm.tex` + folder `Diagrams/mermaid-pdf/` (all PNGs)
3. Set compiler: **pdfLaTeX**
4. Compile

## Regenerate v12 after editing v11

```bash
python3 tools/migrate_to_acmart.py
```
