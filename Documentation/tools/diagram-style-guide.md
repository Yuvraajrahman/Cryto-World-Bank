# Diagram and Table Style Guide — Crypto World Bank Thesis

Use this guide for all Mermaid figures, TikZ diagrams, and tables in `Pre-thesis_v11.tex` / future `Pre-thesis_v12_acm.tex`.

## Master reference

Every new figure must map to a row in **Table: Banking Capability Matrix** (`tab:banking-matrix`). Caption template:

> *Figure X: … (rows A–C, Table~\ref{tab:banking-matrix}).*

## Color palette (Mermaid + TikZ)

| Role | Hex | Usage |
|------|-----|--------|
| Primary tier / core | `#1E3A8A` | World Bank, primary nodes |
| Mid tier | `#2563EB` | National Bank |
| Local / accent | `#3B82F6` | Local Bank, highlights |
| Light fill | `#EFF6FF` / `#DBEAFE` | Supporting boxes |
| Text | `#000000` | All labels |
| Planned module | dashed stroke, `stroke-dasharray: 5 5` | Not yet implemented |

Config file: `Documentation/tools/mermaid.config.json` (`htmlLabels: false`, `fontSize: 16`).

## Build pipeline

```bash
cd Documentation
python3 tools/build_mermaid_pdfs.py
pdflatex -interaction=nonstopmode Pre-thesis_v11.tex
pdflatex -interaction=nonstopmode Pre-thesis_v11.tex
```

- Output: `Documentation/Diagrams/mermaid-pdf/*.png`
- LaTeX: `\FigureImageMaxFit{filename.png}` with `\graphicspath{{Diagrams/mermaid-pdf/}}`
- **Do not** use SVG → `rsvg-convert` (blank labels in PDF).

## Notation standards

| Diagram type | Standard | Planned elements |
|--------------|----------|------------------|
| ERD | Crow’s Foot (IE notation) | Dashed entity boxes, caption states “planned entities dashed” |
| EER | Chen / extended ER | Specialization circles, optional participation `O` |
| Use case | UML 2.x | `<<planned>>` stereotype on use cases not in prototype |
| Activity | UML activity | Swimlanes: Borrower, Local Bank, National Bank, World Bank |
| DFD | Gane–Sarson | Level 0 / 1 labeled in caption |
| Sequence | UML sequence | Oracle + AI service as lifelines where relevant |

## Mermaid rules

- Short node labels; use `\n` for line breaks, not long sentences.
- No emoji in thesis figures.
- `graph TB` / `LR` preferred over experimental chart types unless already validated by `mmdc`.
- Filename = kebab-case matching section: `blockchain-tx-lifecycle.png`, `ai-unified-9b-architecture.png`.

## LaTeX figure environment

```latex
\begin{figure}[t]
  \centering
  \FigureImageMaxFit{ai-unified-9b-architecture.png}
  \caption{Unified fine-tuned 9B assistant: chat, RAG, and security advisory with tabular risk score and static-analysis guardrails (Table~\ref{tab:banking-matrix}, risk and ancillary rows).}
  \label{fig:ai-unified-9b}
\end{figure}
```

For ACM migration later: caption below figure; add `\Description{...}` when using `acmart`.

## Tables (ACM-inspired on `report`)

- `tabularx` + `booktabs`: `\toprule`, `\midrule`, `\bottomrule`
- Context paragraph immediately above table body:
  `\noindent\textit{\small Table~X …}`
- Status column: `\tmarkDone{}` Implemented · `\tmarkPartial{}` Partial · `\tmarkPlanned{}` Planned

## Diagram inventory (target)

| PNG | Chapter | Banking functions |
|-----|---------|-------------------|
| `flat-vs-hierarchical-architecture.png` | 1 | Governance, credit |
| `cross-tier-capital-flow.png` | 1 | Liquidity, interbank |
| `blockchain-stack-layers.png` | 2–3 | Settlement, contracts |
| `blockchain-tx-lifecycle.png` | 3 | Payment, settlement |
| `ai-unified-9b-architecture.png` | 3–4 | Risk, chat, security assist |
| `aiml-security-pipeline.png` | 4 | Risk (guardrails) |
| `borrower-tier-access.png` | 3 | Credit, tiers |
| ERD/EER (TikZ) | 3 | All entities |

## Sources of truth

1. **`Documentation/Diagrams/All diagrams.md`** — master archive (46 diagrams; run `python3 tools/rebuild_all_diagrams_md.py` to refresh)
2. **`Documentation/Diagrams/new-diagrams-build.md`** — edit new thesis diagrams here, then rebuild All diagrams.md
3. **`Documentation/Diagrams/mermaid-src/*.mmd`** — per-diagram copies from last PNG build
4. **`Documentation/tools/build_mermaid_pdfs.py`** — Mermaid → PNG
