# CWB v33 — Mermaid Diagram Pipeline

Replaces the TikZ `new diagrams/` workflow for Ch3–6 structural figures.

## Pipeline

```
src/<chapter>/<stem>.mmd  →  svg/.../<stem>.svg  →  pdf/<stem>.pdf
```

Build:

```bash
chmod +x build/build-mermaid.sh
./build/build-mermaid.sh
```

**Quality settings:** 2× device pixel ratio (Puppeteer), per-figure canvas sizing (1200–2000 px), 17 px fonts, thicker strokes, direct PDF export with `--pdfFit`.

## Styling

Monochrome palette per `CWB_v33_Diagram_Implementation_Plan.md` Part 0:

| Role | Hex |
|------|-----|
| Black borders/text | `#000000` |
| Dark grey labels | `#444444` |
| Light grey fills | `#F0F0F0` |
| Light blue highlights | `#E8F0FE` |
| White background | `#FFFFFF` |

Configured in `style/mermaid-config.json`.

## LaTeX integration

`Pre-thesis_v33.tex` uses `\ThesisNewDiagDir{mermaid-diagrams/pdf/}` so rebuilt PDFs override `Diagrams/` archive.

## Diagram type mapping

| Plan type | Mermaid diagram |
|-----------|-----------------|
| ERD / normalization | `erDiagram` |
| Sequence | `sequenceDiagram` |
| Activity / architecture / DFD | `flowchart TB/LR` with subgraphs |
| State machine | `stateDiagram-v2` |
| Charts (Ch5) | Python matplotlib (not Mermaid) |

## Folder layout

```
mermaid-diagrams/
  src/ch03/*.mmd       # 37 Chapter 3 sources (see src/ch03/MANIFEST.md)
  svg/ch03/*.svg
  pdf/*.pdf            # flat copies for LaTeX stems
  pdf/ch03/*.pdf
  style/mermaid-config.json
  build/build-mermaid.sh
```

**Chapter 3 coverage:** all 36 figure slots in `Pre-thesis_v33.tex` plus `fig-db-full-schema` (plan supplement).
