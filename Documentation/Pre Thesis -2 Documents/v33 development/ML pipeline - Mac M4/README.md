# ML Pipeline — MacBook Air M4 (fallback)

**Machine:** MacBook Air M4, 16 GB RAM  
**Use when:** Ubuntu unavailable, loadshedding, portable work, travel  
**Sleep:** Use `./run_awake.sh` so training is not killed when display sleeps

## Quick start

```bash
cd "Documentation/Pre Thesis -2 Documents/v33 development/ML pipeline - Mac M4"
chmod +x setup.sh run.sh run_awake.sh
./setup.sh
./run.sh
```

Prevent sleep during long runs:

```bash
./run_awake.sh
```

## After interruption (sleep, lid, crash)

```bash
./run.sh
./run.sh --status
```

## Dataset

- Copy BCCC to `data/bccc.csv`, or `~/Downloads/bccc.csv` (auto-checked), or
- `.env` → `DATASET_URL` / `DATASET_LOCAL_PATH`
- No file → synthetic test data

## Outputs

| Path | Notes |
|------|-------|
| `artifacts/metrics.json` | Thesis metrics (`device_profile: mac-m4-air-16gb`) |
| `results/svg/` | Diagrams |
| `../evidence/mac-m4/` | Auto-copied for paper |

## Mac tips

- Keep lid open or use `run_awake.sh`
- Close heavy apps during SHAP step
- Same BCCC CSV can be copied from Ubuntu via USB/cloud — drop in `data/`
- **No PyTorch** needed for this pipeline

## vs Ubuntu folder

Ubuntu is faster (more cores, larger SHAP batch). Use Mac when portability matters; thesis can cite either run with device noted in caption.
