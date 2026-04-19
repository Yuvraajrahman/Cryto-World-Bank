# ML Service

FastAPI service that hosts the Random Forest fraud classifier, Isolation Forest
anomaly detector, and SHAP explainer described in the thesis (Chapter 3 / 4).

Currently this is a **stub implementation** so the rest of the stack can be
integrated and deployed end-to-end. Real model training and SHAP wiring will
land in Sprint 3.

## Running locally

```bash
cd ml-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Endpoints:
- `GET  /health`           service heartbeat
- `POST /score`            credit-risk score + SHAP-style feature attribution
- `POST /anomaly`          wallet anomaly score (Isolation Forest placeholder)
