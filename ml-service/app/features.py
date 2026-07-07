"""Map CWB loan-application inputs to a 22-dimensional feature vector."""

from __future__ import annotations

from typing import Any

CWB_FEATURE_NAMES: list[str] = [
    "principal_eth",
    "term_months",
    "prior_default_count",
    "consecutive_paid_loans",
    "monthly_income_usd",
    "tx_count_6m",
    "wallet_age_days",
    "credit_score_norm",
    "open_loans",
    "completed_cycles",
    "apr_bps_norm",
    "income_to_principal_ratio",
    "term_to_income_ratio",
    "default_rate_history",
    "utilization_ratio",
    "avg_tx_value_norm",
    "unique_counterparties",
    "night_tx_ratio",
    "gas_spent_norm",
    "contract_interactions",
    "stablecoin_ratio",
    "purpose_length_norm",
]


def _f(payload: dict[str, Any], key: str, default: float = 0.0) -> float:
    v = payload.get(key, default)
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def build_feature_vector(payload: dict[str, Any]) -> list[float]:
    principal = _f(payload, "principal_eth", 0.1)
    term = _f(payload, "term_months", 12)
    defaults = _f(payload, "prior_default_count")
    paid = _f(payload, "consecutive_paid_loans")
    income = max(_f(payload, "monthly_income_usd", 500), 1.0)
    tx6 = _f(payload, "tx_count_6m", 5)
    wallet_age = _f(payload, "wallet_age_days", 180)
    credit = _f(payload, "credit_score_norm", 0.5)
    open_loans = _f(payload, "open_loans")
    cycles = _f(payload, "completed_cycles")
    apr_bps = _f(payload, "apr_bps", 800)

    income_ratio = income / max(principal * 3000, 1.0)
    term_income = term / max(income / 100, 1.0)
    default_rate = defaults / max(defaults + paid + 1, 1.0)
    utilization = principal / max(_f(payload, "max_principal_eth", 1.0), 0.01)

    vec = [
        principal,
        term,
        defaults,
        paid,
        income / 1000.0,
        tx6,
        wallet_age / 365.0,
        credit,
        open_loans,
        cycles,
        apr_bps / 10000.0,
        min(income_ratio, 5.0),
        min(term_income, 5.0),
        default_rate,
        min(utilization, 3.0),
        _f(payload, "avg_tx_value_norm", 0.3),
        _f(payload, "unique_counterparties", 8),
        _f(payload, "night_tx_ratio", 0.15),
        _f(payload, "gas_spent_norm", 0.2),
        _f(payload, "contract_interactions", 12),
        _f(payload, "stablecoin_ratio", 0.4),
        min(len(str(payload.get("purpose", ""))) / 80.0, 1.0),
    ]
    return vec[:22]
