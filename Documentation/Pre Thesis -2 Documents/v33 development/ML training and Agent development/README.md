# ML Training — choose your device

This folder is split into **two self-contained pipelines**. Use only one — whichever machine you have available.

| Folder | Machine | When to use |
|--------|---------|-------------|
| **[ML pipeline - Ubuntu](./ML%20pipeline%20-%20Ubuntu/)** | i5-10400, 32 GB | **Primary** — faster, full 50k sample, tmux + loadshedding resume |
| **[ML pipeline - Mac M4](./ML%20pipeline%20-%20Mac%20M4/)** | M4 Air 16 GB | **Fallback** — portable, if Ubuntu power fails or you're on the go |

## One-liner

**Ubuntu:**
```bash
cd "ML pipeline - Ubuntu" && ./setup.sh && ./run.sh
```

**Mac:**
```bash
cd "ML pipeline - Mac M4" && ./setup.sh && ./run.sh
```

## Shared features (both folders)

- Auto venv + dependency install
- BCCC download resume (curl/wget) or `data/bccc.csv`
- Synthetic fallback if no dataset yet
- RF + IF + stacking + SHAP
- Checkpoint resume after power cut (`./run.sh` again)
- `results/mmd/` + `results/svg/` diagrams
- Evidence copied to `../evidence/ubuntu/` or `../evidence/mac-m4/`

## Do not

- Copy `.venv` between Mac and Ubuntu — run `./setup.sh` on each machine
- Mix artifacts between folders — each has its own `artifacts/` and checkpoints

## PyTorch

**Not required** for either setup (sklearn-only MVT).
