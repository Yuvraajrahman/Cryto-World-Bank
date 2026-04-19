"""
Crypto World Bank — ML inference service (placeholder).

This service is intentionally minimal for the current milestone. It exposes
the shape the backend expects (`/score`, `/anomaly`, `/health`) but returns
deterministic stub scores so the rest of the stack can be integrated and
deployed today. Real models (Random Forest + Isolation Forest + SHAP) will
be trained in a later sprint and slotted in behind the same HTTP interface.
"""

from __future__ import annotations

import hashlib
from typing import List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Crypto World Bank ML Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ScoreRequest(BaseModel):
    wallet: str = Field(..., description="0x-prefixed borrower wallet address")
    principal_wei: str = Field(..., description="Loan principal in wei")
    term_months: int = Field(..., ge=1, le=60)
    prior_loan_count: int = 0
    prior_default_count: int = 0
    monthly_income_usd: Optional[float] = None
    tx_count_6m: int = 0


class ShapFeature(BaseModel):
    name: str
    value: float
    contribution: float


class ScoreResponse(BaseModel):
    risk_score: float = Field(..., ge=0, le=1)
    decision: str
    model: str
    features: List[ShapFeature]


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "ml", "version": "0.1.0", "model_loaded": False}


def _deterministic_score(payload: ScoreRequest) -> float:
    """Hash-based stub so scores are stable across calls for demos."""
    h = hashlib.sha256(payload.model_dump_json().encode()).hexdigest()
    base = int(h[:8], 16) / 0xFFFFFFFF
    # tilt by defaults — more prior defaults → higher risk
    tilt = min(0.4, payload.prior_default_count * 0.1)
    return round(min(0.99, base * 0.6 + tilt + 0.05), 4)


@app.post("/score", response_model=ScoreResponse)
def score(payload: ScoreRequest) -> ScoreResponse:
    risk = _deterministic_score(payload)
    decision = "APPROVE" if risk < 0.4 else "REVIEW" if risk < 0.7 else "REJECT"

    # Placeholder SHAP-style feature attribution. Real service will use
    # shap.TreeExplainer on a trained RandomForest classifier.
    features = [
        ShapFeature(name="prior_default_count", value=payload.prior_default_count, contribution=0.35),
        ShapFeature(name="tx_count_6m", value=payload.tx_count_6m, contribution=-0.15),
        ShapFeature(name="principal_wei", value=float(int(payload.principal_wei) / 1e18), contribution=0.25),
        ShapFeature(name="term_months", value=payload.term_months, contribution=0.05),
    ]

    return ScoreResponse(
        risk_score=risk,
        decision=decision,
        model="stub-v0",
        features=features,
    )


class AnomalyRequest(BaseModel):
    wallet: str
    features: List[float]


@app.post("/anomaly")
def anomaly(payload: AnomalyRequest) -> dict:
    # Placeholder Isolation-Forest response.
    h = hashlib.sha256(payload.wallet.encode()).hexdigest()
    score = int(h[:4], 16) / 0xFFFF
    return {"wallet": payload.wallet, "anomaly_score": round(score, 4), "is_anomaly": score > 0.85}
