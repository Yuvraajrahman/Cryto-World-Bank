# CWB Pre-Thesis v33 — New Diagrams

Implementation follows [`CWB_v33_Diagram_Implementation_Plan.md`](CWB_v33_Diagram_Implementation_Plan.md).

## Layout

| Path | Purpose |
|------|---------|
| `style/cwb-diagram-styles.tex` | Shared TikZ colours and styles (Part 0 palette) |
| `style/monochrome_chart_style.py` | Matplotlib template for Ch5 charts |
| `tikz/ch03/` … `ch06/` | Standalone TikZ figure sources |
| `pdf/` | Compiled PDF outputs for `\includegraphics` |
| `ch01/`, `ch02/` | Copied Ch1–Ch2 assets (no rebuild) |
| `build/compile-tikz.sh` | Batch-compile all `tikz/**/*.tex` |
| `build/build-charts.py` | Generate Ch5 matplotlib PDFs |

## Build

```bash
cd "Documentation/Pre Thesis -2 Documents/v33 development/new diagrams"
chmod +x build/compile-tikz.sh
./build/compile-tikz.sh
```

## LaTeX integration

Point `\ThesisDiagDir` in `Pre-thesis_v33.tex` to `new diagrams/pdf/ch03/` (or per-chapter subpaths) once figures are validated.

## Priority order

1. `tikz/ch03/fig-db-1nf` … `fig-db-bcnf` (normalization)
2. `fig-erd-core`, `fig-erd-extended`, `fig-eer-model`
3. UML: use case, activity, DFD, sequence
4. Ch4 methodology figures
5. Ch5 matplotlib charts
6. Ch6 conclusion figures
