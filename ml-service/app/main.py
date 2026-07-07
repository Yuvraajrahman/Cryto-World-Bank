"""
Crypto World Bank — ML inference service (Phase III).

Exposes /v1/score and /v1/brief (RF + IF + stacking + SHAP) plus legacy /score.
"""

from __future__ import annotations

import hashlib
from typing import Any, List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .scoring import build_brief, ensure_models, model_info, score_payload

app = FastAPI(title="Crypto World Bank ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ScoreRequest(BaseModel):
    wallet: str = Field(..., description="0x-prefixed borrower wallet address")
    principal_wei: Optional[str] = Field(None, description="Loan principal in wei")
    principal_eth: Optional[float] = None
    term_months: int = Field(12, ge=1, le=60)
    prior_loan_count: int = 0
    prior_default_count: int = 0
    consecutive_paid_loans: int = 0
    monthly_income_usd: Optional[float] = None
    tx_count_6m: int = 0
    purpose: Optional[str] = None
    loan_id: Optional[str] = None


class ShapFeature(BaseModel):
    name: str
    value: float
    contribution: float


class ScoreResponse(BaseModel):
    risk_score: float = Field(..., ge=0, le=1)
    anomaly_score: float = 0.0
    decision: str
    model: str
    features: List[ShapFeature]
    score_bps: int = 0


def _to_payload(body: ScoreRequest) -> dict[str, Any]:
    principal_eth = body.principal_eth
    if principal_eth is None and body.principal_wei:
        principal_eth = int(body.principal_wei) / 1e18
    if principal_eth is None:
        principal_eth = 0.1
    return {
        "wallet": body.wallet,
        "principal_eth": principal_eth,
        "term_months": body.term_months,
        "prior_default_count": body.prior_default_count,
        "consecutive_paid_loans": body.consecutive_paid_loans or body.prior_loan_count,
        "monthly_income_usd": body.monthly_income_usd or 800.0,
        "tx_count_6m": body.tx_count_6m,
        "purpose": body.purpose or "",
        "loan_id": body.loan_id,
    }


@app.on_event("startup")
def _warm_models() -> None:
    ensure_models()


@app.get("/health")
def health() -> dict:
    info = model_info()
    return {"status": "ok", "service": "ml", "version": "1.0.0", **info}


@app.post("/v1/score", response_model=ScoreResponse)
def v1_score(payload: ScoreRequest) -> ScoreResponse:
    result = score_payload(_to_payload(payload))
    return ScoreResponse(**result)


@app.post("/v1/brief")
def v1_brief(payload: ScoreRequest) -> dict:
    p = _to_payload(payload)
    score = score_payload(p)
    return {"authority_brief": build_brief(p, score), "score": score}


def _deterministic_score(payload: ScoreRequest) -> float:
    h = hashlib.sha256(payload.model_dump_json().encode()).hexdigest()
    base = int(h[:8], 16) / 0xFFFFFFFF
    tilt = min(0.4, payload.prior_default_count * 0.1)
    return round(min(0.99, base * 0.6 + tilt + 0.05), 4)


@app.post("/score", response_model=ScoreResponse)
def score_legacy(payload: ScoreRequest) -> ScoreResponse:
    try:
        return v1_score(payload)
    except Exception:
        risk = _deterministic_score(payload)
        decision = "APPROVE" if risk < 0.4 else "REVIEW" if risk < 0.7 else "REJECT"
        features = [
            ShapFeature(name="prior_default_count", value=payload.prior_default_count, contribution=0.35),
            ShapFeature(name="tx_count_6m", value=payload.tx_count_6m, contribution=-0.15),
            ShapFeature(name="principal_eth", value=float(payload.principal_eth or 0.1), contribution=0.25),
            ShapFeature(name="term_months", value=payload.term_months, contribution=0.05),
        ]
        return ScoreResponse(
            risk_score=risk,
            anomaly_score=risk * 0.6,
            decision=decision,
            model="stub-v0",
            features=features,
            score_bps=int(risk * 10000),
        )


class AnomalyRequest(BaseModel):
    wallet: str
    features: List[float]


@app.post("/anomaly")
def anomaly(payload: AnomalyRequest) -> dict:
    p = {"wallet": payload.wallet, "tx_count_6m": len(payload.features) * 3}
    score = score_payload(p)
    return {
        "wallet": payload.wallet,
        "anomaly_score": score["anomaly_score"],
        "is_anomaly": score["anomaly_score"] > 0.85,
    }
