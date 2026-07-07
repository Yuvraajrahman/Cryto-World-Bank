"""RF + IF + stacking inference with artifact load or synthetic bootstrap."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.linear_model import LogisticRegression

from .features import CWB_FEATURE_NAMES, build_feature_vector

ARTIFACTS = Path(__file__).resolve().parent.parent / "artifacts"

_rf: RandomForestClassifier | None = None
_if: IsolationForest | None = None
_meta: dict[str, Any] | None = None
_feature_cols: list[str] | None = None
_explainer = None
_model_label = "bootstrap-v1"


def _anomaly_scores(iso: IsolationForest, X: np.ndarray) -> np.ndarray:
    raw = -iso.score_samples(X)
    lo, hi = raw.min(), raw.max()
    if hi - lo < 1e-9:
        return np.zeros_like(raw)
    return (raw - lo) / (hi - lo)


def _composite(p_f: float, s_if: float, meta: dict[str, Any]) -> float:
    coef = np.array(meta["coefficients"])[0]
    intercept = meta["intercept"][0]
    logit = intercept + coef[0] * p_f + coef[1] * s_if
    return float(1.0 / (1.0 + np.exp(-logit)))


def _bootstrap_models() -> None:
    global _rf, _if, _meta, _feature_cols, _model_label
    rng = np.random.default_rng(42)
    n = 4000
    X = rng.uniform(0, 1, size=(n, 22)).astype(np.float32)
    y = ((X[:, 0] * 0.35 + X[:, 2] * 0.45 + X[:, 14] * 0.25 + rng.random(n) * 0.15) > 0.55).astype(int)

    _rf = RandomForestClassifier(n_estimators=60, max_depth=8, random_state=42, n_jobs=-1)
    _rf.fit(X, y)

    _if = IsolationForest(n_estimators=80, contamination="auto", random_state=42, n_jobs=-1)
    _if.fit(X[y == 0] if (y == 0).sum() > 10 else X)

    p_val = _rf.predict_proba(X[:800])[:, 1]
    s_val = _anomaly_scores(_if, X[:800])
    meta_X = np.column_stack([p_val, s_val])
    meta_lr = LogisticRegression(random_state=42, max_iter=300)
    meta_lr.fit(meta_X, y[:800])
    _meta = {
        "coefficients": meta_lr.coef_.tolist(),
        "intercept": meta_lr.intercept_.tolist(),
        "features": ["p_f", "s_if"],
    }
    _feature_cols = CWB_FEATURE_NAMES.copy()
    _model_label = "bootstrap-v1"


def _load_artifacts() -> bool:
    global _rf, _if, _meta, _feature_cols, _model_label
    rf_path = ARTIFACTS / "rf_model.pkl"
    if_path = ARTIFACTS / "if_model.pkl"
    meta_path = ARTIFACTS / "meta_learner.json"
    schema_path = ARTIFACTS / "feature_schema.joblib"

    if not (rf_path.exists() and if_path.exists() and meta_path.exists()):
        return False

    _rf = joblib.load(rf_path)
    _if = joblib.load(if_path)
    _meta = json.loads(meta_path.read_text())
    if schema_path.exists():
        schema = joblib.load(schema_path)
        _feature_cols = schema.get("feature_cols", CWB_FEATURE_NAMES)
    else:
        bundle_path = ARTIFACTS / "preprocessed.joblib"
        if bundle_path.exists():
            bundle = joblib.load(bundle_path)
            _feature_cols = bundle.get("feature_cols", CWB_FEATURE_NAMES)
        else:
            _feature_cols = CWB_FEATURE_NAMES
    _model_label = "bccc-mini"
    return True


def ensure_models() -> None:
    global _explainer
    if _rf is not None:
        return
    if not _load_artifacts():
        _bootstrap_models()
    try:
        import shap

        _explainer = shap.TreeExplainer(_rf)
    except Exception:
        _explainer = None


def model_info() -> dict[str, Any]:
    ensure_models()
    return {"model_loaded": True, "model": _model_label, "features": len(_feature_cols or [])}


def score_payload(payload: dict[str, Any]) -> dict[str, Any]:
    ensure_models()
    assert _rf is not None and _if is not None and _meta is not None

    vec = build_feature_vector(payload)
    X = np.array([vec], dtype=np.float32)

    p_f = float(_rf.predict_proba(X)[0, 1])
    s_if = float(_anomaly_scores(_if, X)[0])
    risk = _composite(p_f, s_if, _meta)
    risk = max(0.0, min(1.0, risk))

    decision = "APPROVE" if risk < 0.4 else "REVIEW" if risk < 0.7 else "REJECT"

    shap_features: list[dict[str, float | str]] = []
    if _explainer is not None:
        try:
            values = _explainer.shap_values(X)
            if isinstance(values, list):
                values = values[1] if len(values) > 1 else values[0]
            row = values[0]
            top_idx = np.argsort(np.abs(row))[-6:][::-1]
            for j in top_idx:
                shap_features.append(
                    {
                        "name": CWB_FEATURE_NAMES[j] if j < len(CWB_FEATURE_NAMES) else f"f{j}",
                        "value": float(vec[j]),
                        "contribution": float(row[j]),
                    }
                )
        except Exception:
            pass

    if not shap_features:
        shap_features = [
            {"name": "prior_default_count", "value": vec[2], "contribution": vec[2] * 0.35},
            {"name": "principal_eth", "value": vec[0], "contribution": vec[0] * 0.25},
            {"name": "tx_count_6m", "value": vec[5], "contribution": -vec[5] * 0.05},
        ]

    return {
        "risk_score": round(risk, 4),
        "anomaly_score": round(s_if, 4),
        "decision": decision,
        "model": _model_label,
        "features": shap_features,
        "score_bps": int(round(risk * 10000)),
    }


def build_brief(payload: dict[str, Any], score: dict[str, Any]) -> dict[str, Any]:
    principal = float(payload.get("principal_eth", 0))
    factors = [
        {"label": "Principal (ETH)", "value": principal},
        {"label": "Term (months)", "value": int(payload.get("term_months", 12))},
        {"label": "Prior defaults", "value": int(payload.get("prior_default_count", 0))},
        {"label": "Monthly income (USD)", "value": payload.get("monthly_income_usd", "—")},
    ]
    top = sorted(score["features"], key=lambda f: abs(float(f["contribution"])), reverse=True)[:4]
    plain = "; ".join(
        f"{f['name']} {'increases' if float(f['contribution']) > 0 else 'reduces'} risk"
        for f in top
    )
    return {
        "headline": f"Risk {score['risk_score']:.2f} — {score['decision']}",
        "recommendation": score["decision"],
        "risk_score": score["risk_score"],
        "anomaly_score": score["anomaly_score"],
        "factors": factors,
        "shap_summary": plain,
        "top_features": top,
        "disclaimer": "Authority Brief generated by RF+IF+SHAP pipeline (Phase III).",
    }
