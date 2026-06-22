"""BCCC preprocessing: leakage removal, feature selection, scaling, grouped splits."""
from __future__ import annotations

import re
from typing import Any

import numpy as np
import pandas as pd
from sklearn.model_selection import GroupShuffleSplit, train_test_split
from sklearn.preprocessing import StandardScaler

# Columns that encode the label or dataset split — must never be model inputs.
LEAKAGE_COLUMNS = frozenset({
    "flag",
    "fraud",
    "is_fraud",
    "isfraud",
    "label",
    "class",
    "target",
    "y",
})

# Non-predictive identifiers (string cols are already excluded; drop numeric index junk).
DROP_COLUMNS = frozenset({
    "unnamed: 0",
})

# BCCC behavioral columns aligned to the thesis 22-D intent (subset available in DeFiTransLyzer CSV).
CWB_BCCC_FEATURES: list[tuple[str, str]] = [
    ("tx_count_30d", "num_transaction"),
    ("duration_seconds", "duration_seconds"),
    ("error_rate", "error_rate"),
    ("gas_used_avg", "gas_used.gas_used_average"),
    ("gas_used_std", "gas_used.gas_used_standard_deviation"),
    ("gas_price_avg", "gas_prices.gas_prices_average"),
    ("value_avg", "values.values_average"),
    ("value_std", "values.values_standard_deviation"),
    ("unique_from_addrs", "number_of_unique_from_address"),
    ("unique_to_addrs", "number_of_unique_to_address"),
    ("from_addr_count", "number_of_from_address"),
    ("to_addr_count", "number_of_to_address"),
    ("token_transfer_amt", "token_transfer_amount"),
    ("normalized_transfer", "normalized_token_transfer"),
    ("gas_efficiency", "gas_efficiency"),
    ("event_activity", "event_activity_flag"),
    ("log_count", "log_count"),
    ("num_errors", "number_of_errors"),
    ("nonce_avg", "nonce.nonce_average"),
    ("chain_id", "chain_id"),
    ("erc20_log_qty", "erc_20_Log_Normalized_Quantity"),
    ("erc20_qty_int", "erc_20_Quantity_Is_Int"),
]


def _norm(name: str) -> str:
    return name.strip().lower()


def drop_leakage_columns(columns: list[str]) -> list[str]:
    out = []
    for c in columns:
        n = _norm(c)
        if n in LEAKAGE_COLUMNS or n in DROP_COLUMNS:
            continue
        out.append(c)
    return out


def select_bccc_features(df: pd.DataFrame, cfg: dict) -> list[str]:
    """Prefer thesis-aligned behavioral columns; fall back to numeric cols with variance."""
    available = {_norm(c): c for c in df.columns}
    selected: list[str] = []
    for _, bccc_col in CWB_BCCC_FEATURES:
        src = available.get(_norm(bccc_col))
        if src and pd.api.types.is_numeric_dtype(df[src]):
            selected.append(src)
    if len(selected) >= 10:
        return selected

    numeric = [
        c for c in df.columns
        if pd.api.types.is_numeric_dtype(df[c]) and _norm(c) not in LEAKAGE_COLUMNS | DROP_COLUMNS
    ]
    max_miss = float(cfg.get("preprocessing", {}).get("max_missing_fraction", 0.95))
    kept = []
    for c in numeric:
        miss = df[c].isna().mean()
        if miss > max_miss:
            continue
        if df[c].nunique(dropna=True) <= 1:
            continue
        kept.append(c)
    return kept


def clean_matrix(df: pd.DataFrame, feature_cols: list[str]) -> pd.DataFrame:
    work = df[feature_cols].replace([np.inf, -np.inf], np.nan).copy()
    work = work.fillna(0)
    f32_max = float(np.finfo(np.float32).max)
    return work.clip(lower=-f32_max, upper=f32_max)


def subsample_rows(df: pd.DataFrame, label_col: str, sample_size: int, seed: int, balanced: bool) -> pd.DataFrame:
    if len(df) <= sample_size:
        return df
    if balanced:
        half = max(1, sample_size // 2)
        parts = [
            g.sample(min(len(g), half), random_state=seed)
            for _, g in df.groupby(label_col)
        ]
        work = pd.concat(parts, ignore_index=True)
        if len(work) > sample_size:
            work = work.sample(n=sample_size, random_state=seed)
        return work
    return df.sample(n=sample_size, random_state=seed)


def split_train_val_test(
    X: np.ndarray,
    y: np.ndarray,
    groups: np.ndarray | None,
    seed: int,
    test_size: float = 0.3,
    group_col: str | None = None,
) -> dict[str, Any]:
    if groups is not None and group_col:
        gss = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=seed)
        train_idx, temp_idx = next(gss.split(X, y, groups))
        X_train, y_train = X[train_idx], y[train_idx]
        X_temp, y_temp = X[temp_idx], y[temp_idx]
        g_temp = groups[temp_idx]
        gss2 = GroupShuffleSplit(n_splits=1, test_size=0.5, random_state=seed)
        val_idx, test_idx = next(gss2.split(X_temp, y_temp, g_temp))
        return {
            "X_train": X_train, "y_train": y_train,
            "X_val": X_temp[val_idx], "y_val": y_temp[val_idx],
            "X_test": X_temp[test_idx], "y_test": y_temp[test_idx],
            "split_mode": f"grouped_by_{group_col}",
        }
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=test_size, random_state=seed, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=seed, stratify=y_temp
    )
    return {
        "X_train": X_train, "y_train": y_train,
        "X_val": X_val, "y_val": y_val,
        "X_test": X_test, "y_test": y_test,
        "split_mode": "stratified_random",
    }


def build_preprocessed_bundle(df: pd.DataFrame, label: str, cfg: dict, tc_sample_size: int, seed: int) -> dict:
    pp = cfg.get("preprocessing", {})
    balanced = bool(cfg.get("training", {}).get("balanced_sample", False))
    group_col = pp.get("group_split_column") or cfg.get("training", {}).get("group_split_column")

    y = df[label].astype(int)
    work = df.drop(columns=[label])
    feature_cols = select_bccc_features(work, cfg)
    if not feature_cols:
        raise ValueError("No features selected after preprocessing")

    bundle_df = work[feature_cols].copy()
    bundle_df[label] = y.values
    bundle_df = subsample_rows(bundle_df, label, tc_sample_size, seed, balanced)

    groups = None
    if group_col and group_col in df.columns:
        # align groups to subsampled rows via index
        idx = bundle_df.index
        groups = df.loc[idx, group_col].astype(str).values

    X_df = clean_matrix(bundle_df, feature_cols)
    y_arr = bundle_df[label].values.astype(int)

    splits = split_train_val_test(
        X_df.values.astype(np.float64),
        y_arr,
        groups,
        seed,
        test_size=float(cfg.get("training", {}).get("test_size", 0.3)),
        group_col=group_col if groups is not None else None,
    )

    scaler = None
    if pp.get("scale", True):
        scaler = StandardScaler()
        splits["X_train"] = scaler.fit_transform(splits["X_train"])
        splits["X_val"] = scaler.transform(splits["X_val"])
        splits["X_test"] = scaler.transform(splits["X_test"])

    fraud_rate = float(y_arr.mean())
    return {
        "feature_cols": feature_cols,
        "cwb_feature_map": {a: b for a, b in CWB_BCCC_FEATURES if b in feature_cols},
        "X_train": splits["X_train"].astype(np.float32),
        "y_train": splits["y_train"],
        "X_val": splits["X_val"].astype(np.float32),
        "y_val": splits["y_val"],
        "X_test": splits["X_test"].astype(np.float32),
        "y_test": splits["y_test"],
        "scaler": scaler,
        "seed": seed,
        "sample_size": len(bundle_df),
        "fraud_rate": fraud_rate,
        "split_mode": splits["split_mode"],
        "balanced_sample": balanced,
    }
