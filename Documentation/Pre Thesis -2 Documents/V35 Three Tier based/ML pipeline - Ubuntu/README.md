# ML Pipeline — Ubuntu (primary)

**Machine:** Ubuntu, i5-10400, 32 GB RAM  
**Use when:** At home desk, power available, full 50k BCCC mini-train  
**Loadshedding:** `./run.sh` resumes checkpoints; use `./run_in_tmux.sh` for SSH

## Quick start

```bash
cd "Documentation/Pre Thesis -2 Documents/v33 development/ML pipeline - Ubuntu"
chmod +x setup.sh run.sh run_in_tmux.sh
./setup.sh
./run.sh
```

## After power cut

```bash
./run.sh
./run.sh --status
```

## Dataset

- `data/bccc.csv` after BCCC approval, or
- `.env` → `DATASET_URL` / `DATASET_LOCAL_PATH`
- No file → synthetic test data (pipeline still runs)

## Outputs

| Path | Notes |
|------|-------|
| `artifacts/metrics.json` | Thesis metrics |
| `results/svg/` | Diagrams |
| `../evidence/ubuntu/` | Auto-copied for paper |

## vs Mac folder

| | Ubuntu | Mac M4 |
|--|--------|--------|
| Sample size | 50,000 | 30,000 |
| RF trees | 100 | 80 |
| SHAP rows | 300 | 120 |
| CPU threads | all (`n_jobs: -1`) | 4 (thermals) |
| Est. time | ~20–45 min | ~25–50 min |

**No PyTorch required** — sklearn + SHAP only.
