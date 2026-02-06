from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import os

router = APIRouter(prefix="/api/fraud", tags=["Fraud Detection"])

detector = None
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "models", "trained", "fraud_detector.pkl")


def get_detector():
    global detector
    if detector is None:
        from app.ml.fraud_detector import FraudDetector
        detector = FraudDetector()
        if os.path.exists(MODEL_PATH):
            detector.load(MODEL_PATH)
        else:
            raise HTTPException(status_code=503, detail="Model not trained. Run: python scripts/train_fraud.py")
    return detector


class LoanCheckRequest(BaseModel):
    wallet: str
    amount: float
    purpose: str
    wallet_age_days: Optional[float] = None
    wallet_balance: Optional[float] = None
    previous_loans: Optional[int] = None
    avg_tx_amount: Optional[float] = None
    tx_count: Optional[int] = None


class FeatureImpact(BaseModel):
    name: str
    value: float
    impact: float


class FraudCheckResponse(BaseModel):
    wallet: str
    is_fraudulent: bool
    fraud_score: float
    risk_category: str
    recommendation: str
    reasons: list
    top_features: list


def _infer_missing_features(amount: float, purpose: str) -> dict:
    purpose_len = len(purpose.strip())
    if amount > 10:
        wallet_age = 15.0
        wallet_balance = 0.5
        previous_loans = 4
        avg_tx_amount = 0.01
        tx_count = 3
    elif purpose_len < 20:
        wallet_age = 20.0
        wallet_balance = 1.0
        previous_loans = 2
        avg_tx_amount = 0.5
        tx_count = 10
    else:
        wallet_age = 90.0
        wallet_balance = 5.0
        previous_loans = 1
        avg_tx_amount = 1.0
        tx_count = 25
    return {
        "amount": amount,
        "purpose_length": purpose_len,
        "wallet_age_days": wallet_age,
        "wallet_balance": wallet_balance,
        "previous_loans": previous_loans,
        "avg_tx_amount": avg_tx_amount,
        "tx_count": tx_count,
    }


@router.post("/check-loan", response_model=FraudCheckResponse)
async def check_loan_fraud(req: LoanCheckRequest):
    det = get_detector()
    features = {
        "amount": req.amount,
        "purpose_length": len(req.purpose.strip()),
        "wallet_age_days": req.wallet_age_days if req.wallet_age_days is not None else 45.0,
        "wallet_balance": req.wallet_balance if req.wallet_balance is not None else 2.0,
        "previous_loans": req.previous_loans if req.previous_loans is not None else 1,
        "avg_tx_amount": req.avg_tx_amount if req.avg_tx_amount is not None else 0.5,
        "tx_count": req.tx_count if req.tx_count is not None else 15,
    }
    X = pd.DataFrame([features])
    predictions, probabilities = det.predict(X)
    score = float(probabilities[0])
    is_fraud = bool(predictions[0])
    if score > 0.8:
        risk = "HIGH"
        recommendation = "reject"
    elif score > 0.5:
        risk = "MEDIUM"
        recommendation = "flag"
    else:
        risk = "LOW"
        recommendation = "approve"
    reasons = []
    if features["wallet_age_days"] < 14:
        reasons.append("Very new wallet (less than 14 days)")
    if req.amount > features["wallet_balance"] * 10:
        reasons.append("Loan amount much larger than typical balance")
    if features["previous_loans"] > 4:
        reasons.append("Multiple previous loans")
    if features["tx_count"] < 5:
        reasons.append("Very low transaction history")
    if len(req.purpose.strip()) < 15:
        reasons.append("Short or vague purpose description")
    top_features = []
    try:
        expl = det.explain(X)
        top_features = [{"name": f["name"], "value": f["value"], "impact": f["impact"]} for f in expl]
    except Exception:
        pass
    return FraudCheckResponse(
        wallet=req.wallet,
        is_fraudulent=is_fraud,
        fraud_score=score,
        risk_category=risk,
        recommendation=recommendation,
        reasons=reasons if reasons else ["No specific risk factors identified"],
        top_features=top_features,
    )
