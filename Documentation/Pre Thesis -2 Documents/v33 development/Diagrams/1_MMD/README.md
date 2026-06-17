# Chapter 4 Mermaid sources

Edit `.mmd` files here, then rebuild PDFs for LaTeX:

```bash
cd "../.."   # v33 development/
./Diagrams/build-pdfs.sh
pdflatex Pre-thesis_v33.tex && pdflatex Pre-thesis_v33.tex
```

| Source | LaTeX label | Purpose |
|--------|-------------|---------|
| `Ch4_mvt-status.mmd` | `fig:mvt-status` | MVT done vs pending |
| `Ch4_ml-oracle-commit-reveal.mmd` | `fig:ml-oracle-commit-reveal` | Oracle gate sequence |
| `Ch4_dataset-timeline.mmd` | `fig:dataset-timeline` | Synthetic → BCCC path |
| `Ch4_ml-evidence-pipeline.mmd` | `fig:ml-evidence-pipeline` | Reproducibility chain |
| `Ch4_rq2-latency-plan.mmd` | `fig:rq2-latency-plan` | RQ2 measurement plan |

Outputs: `../Ch4_*.pdf` and `../Ch4_*.svg`
