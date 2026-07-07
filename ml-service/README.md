# ML Service

FastAPI service for Phase III: Random Forest + Isolation Forest + stacking + SHAP.

## Running locally

```bash
cd ml-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Endpoints

- `GET  /health` — model load status
- `POST /v1/score` — composite risk score + SHAP features
- `POST /v1/brief` — Authority Brief for approvers
- `POST /score` — legacy alias (same as `/v1/score`)

Without `artifacts/` from `scripts/train_mini.py`, the service bootstraps a small RF+IF model in memory for local demos.
