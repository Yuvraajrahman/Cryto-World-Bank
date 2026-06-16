# Ubuntu setup (i5-10400, 32 GB RAM)

Run these commands **on your Ubuntu machine** after cloning or copying the repo.

## 1. One-time system + Python setup

```bash
cd "Documentation/Pre Thesis -2 Documents/v33 development/ML training and Agent development"

chmod +x setup_ubuntu.sh run.sh run_in_tmux.sh
./setup_ubuntu.sh
```

If `setup_ubuntu.sh` warns about missing apt packages:

```bash
sudo apt update
sudo apt install -y python3.12 python3.12-venv python3-pip build-essential curl wget unzip tmux
./setup_ubuntu.sh
```

**Do not copy `.venv` from macOS** — always run `setup_ubuntu.sh` on Linux (it recreates `.venv`).

## 2. Dataset (choose one)

| Option | Action |
|--------|--------|
| **BCCC CSV on disk** | Copy to `data/bccc.csv` |
| **BCCC download link** | Edit `.env`: `DATASET_URL=https://...` |
| **Path elsewhere** | Edit `.env`: `DATASET_LOCAL_PATH=/home/you/Downloads/bccc.csv` |
| **No dataset yet** | Leave as-is — pipeline uses **synthetic** data to verify install |

Download resumes after loadshedding (`curl -C -` / `.part` files).

## 3. Run training

```bash
./run.sh
```

After a **power cut**, run the same command — checkpoints resume automatically:

```bash
./run.sh
./run.sh --status   # see completed stages
```

## 4. Optional: tmux (SSH / long session)

```bash
./run_in_tmux.sh
tmux attach -t cwb-ml-train
```

Detach with `Ctrl+B` then `D`. After loadshedding, re-attach or run `./run.sh` again.

## 5. Outputs

| File | Purpose |
|------|---------|
| `artifacts/metrics.json` | F1, AUC for thesis |
| `artifacts/checkpoint.json` | Resume state |
| `artifacts/run.log` | Full console log |
| `results/svg/*.svg` | Figures for paper |
| `results/mmd/*.mmd` | Mermaid sources |
| `../evidence/` | Auto-copied metrics + SVG |

## 6. Optional: Mermaid CLI → extra SVGs

```bash
sudo apt install -y nodejs npm   # or use nvm
npm install -g @mermaid-js/mermaid-cli
./run.sh --report-only
```

## Hardware notes (your box)

- **RF / IF / SHAP** are CPU-bound — your **i5-10400 + 32 GB** is ideal.
- **RX 9060 XT** is not used by this sklearn pipeline (GPU idle is normal).
- Mini run (50k rows): ~15–45 min depending on SHAP.
- Full BCCC later: increase `sample_size` in `config.yaml` or use full CSV without subsample (edit `train.py`).

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `bad interpreter` / `.venv` broken | `rm -rf .venv && ./setup_ubuntu.sh` |
| Out of memory | Lower `training.shap_samples` to 100 in `config.yaml` |
| Stuck after outage | `./run.sh --status` then `./run.sh` |
| Start fresh | `./run.sh --reset` then `./run.sh` |

## Copy models to live ML service (after training)

```bash
cp artifacts/*.pkl ../../../ml-service/artifacts/ 2>/dev/null || \
cp artifacts/*.pkl ../../../../ml-service/artifacts/
cp artifacts/metrics.json ../../../../ml-service/artifacts/
```

Adjust path to your repo root if needed.
