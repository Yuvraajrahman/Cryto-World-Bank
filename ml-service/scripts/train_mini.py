#!/usr/bin/env python3
"""
BCCC mini training pipeline with staged checkpoints for resume after power cuts.

Stages (each skips if already complete when --resume is set):
  1. preprocess  → artifacts/preprocessed.joblib
  2. rf            → artifacts/rf_model.pkl
  3. if            → artifacts/if_model.pkl
  4. meta          → artifacts/meta_learner.json
  5. evaluate      → artifacts/metrics.json
  6. shap          → artifacts/shap_examples.json

Usage:
  python scripts/train_mini.py --csv data/bccc.csv
  python scripts/train_mini.py --csv data/bccc.csv --resume
  python scripts/train_mini.py --status
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split

try:
    import shap
except ImportError:
    shap = None  # type: ignore

SCRIPT_DIR = Path(__file__).resolve().parent
ML_ROOT = SCRIPT_DIR.parent
ARTIFACTS = ML_ROOT / "artifacts"
CHECKPOINT_FILE = ARTIFACTS / "checkpoint.json"

STAGES = ("preprocess", "rf", "if", "meta", "evaluate", "shap")

LABEL_CANDIDATES = (
    "label",
    "class",
    "fraud",
    "is_fraud",
    "isfraud",
    "target",
    "y",
    "fraudulent",
    "is_fraudulent",
)


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_checkpoint() -> dict:
    if CHECKPOINT_FILE.exists():
        return json.loads(CHECKPOINT_FILE.read_text())
    return {"completed_stages": [], "seed": 42, "csv_path": None, "updated_at": None}


def save_checkpoint(state: dict) -> None:
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    state["updated_at"] = utc_now()
    CHECKPOINT_FILE.write_text(json.dumps(state, indent=2))


def stage_done(state: dict, stage: str) -> bool:
    return stage in state.get("completed_stages", [])


def mark_stage(state: dict, stage: str) -> None:
    done = state.setdefault("completed_stages", [])
    if stage not in done:
        done.append(stage)
    save_checkpoint(state)


def detect_label_column(df: pd.DataFrame) -> str:
    lower_map = {c.lower().strip(): c for c in df.columns}
    for cand in LABEL_CANDIDATES:
        if cand in lower_map:
            return lower_map[cand]
    for col in df.columns:
        if df[col].dtype in ("int64", "int32", "bool", "uint8") and df[col].nunique() == 2:
            return col
    raise ValueError(
        f"Could not detect label column. Tried {LABEL_CANDIDATES}. "
        "Pass --label-column explicitly."
    )


def load_and_subsample(
    csv_path: Path,
    label_col: str | None,
    sample_size: int,
    seed: int,
) -> tuple[pd.DataFrame, str, list[str]]:
    print(f"[preprocess] Loading {csv_path} …")
    df = pd.read_csv(csv_path, low_memory=False)
    label = label_col or detect_label_column(df)
    print(f"[preprocess] Label column: {label}")

    df = df.dropna(subset=[label])
    y = df[label]
    if y.dtype == object:
        y = y.astype(str).str.lower().isin({"1", "true", "fraud", "yes", "malicious"}).astype(int)
    else:
        y = y.astype(int)

    df = df.assign(_label=y)
    df = df.drop(columns=[label])

  # numeric features only
    feature_cols = [
        c
        for c in df.columns
        if c != "_label" and pd.api.types.is_numeric_dtype(df[c])
    ]
    if not feature_cols:
        raise ValueError("No numeric feature columns found.")

    work = df[feature_cols + ["_label"]].replace([np.inf, -np.inf], np.nan).dropna()
    if len(work) > sample_size:
        work = (
            work.groupby("_label", group_keys=False)
            .apply(lambda g: g.sample(min(len(g), sample_size // 2), random_state=seed))
            .reset_index(drop=True)
        )
        if len(work) > sample_size:
            work = work.sample(n=sample_size, random_state=seed)

    print(f"[preprocess] Working set: {len(work)} rows, {len(feature_cols)} features")
    return work, "_label", feature_cols


def run_preprocess(args: argparse.Namespace, state: dict) -> dict:
    bundle_path = ARTIFACTS / "preprocessed.joblib"
    if args.resume and stage_done(state, "preprocess") and bundle_path.exists():
        print("[preprocess] Skipping (checkpoint)")
        return joblib.load(bundle_path)

    work, label, feature_cols = load_and_subsample(
        Path(args.csv), args.label_column, args.sample_size, args.seed
    )
    X = work[feature_cols].values.astype(np.float32)
    y = work[label].values.astype(int)

    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.3, random_state=args.seed, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=args.seed, stratify=y_temp
    )

    bundle = {
        "feature_cols": feature_cols,
        "X_train": X_train,
        "y_train": y_train,
        "X_val": X_val,
        "y_val": y_val,
        "X_test": X_test,
        "y_test": y_test,
        "seed": args.seed,
        "sample_size": len(work),
    }
    joblib.dump(bundle, bundle_path)
    state["csv_path"] = str(args.csv)
    state["seed"] = args.seed
    mark_stage(state, "preprocess")
    print(f"[preprocess] Saved {bundle_path}")
    return bundle


def run_rf(bundle: dict, args: argparse.Namespace, state: dict) -> RandomForestClassifier:
    rf_path = ARTIFACTS / "rf_model.pkl"
    if args.resume and stage_done(state, "rf") and rf_path.exists():
        print("[rf] Skipping (checkpoint)")
        return joblib.load(rf_path)

    print(f"[rf] Training RandomForest (n_estimators={args.rf_trees}) …")
    rf = RandomForestClassifier(
        n_estimators=args.rf_trees,
        max_depth=12,
        class_weight="balanced",
        random_state=args.seed,
        n_jobs=-1,
        warm_start=args.rf_chunks > 1,
    )

    if args.rf_chunks > 1:
        chunk = max(1, args.rf_trees // args.rf_chunks)
        built = 0
        while built < args.rf_trees:
            built = min(built + chunk, args.rf_trees)
            rf.n_estimators = built
            rf.fit(bundle["X_train"], bundle["y_train"])
            joblib.dump(rf, rf_path)
            print(f"[rf] Checkpoint: {built}/{args.rf_trees} trees")
    else:
        rf.fit(bundle["X_train"], bundle["y_train"])
        joblib.dump(rf, rf_path)

    mark_stage(state, "rf")
    print(f"[rf] Saved {rf_path}")
    return rf


def run_if(bundle: dict, args: argparse.Namespace, state: dict) -> IsolationForest:
    if_path = ARTIFACTS / "if_model.pkl"
    if args.resume and stage_done(state, "if") and if_path.exists():
        print("[if] Skipping (checkpoint)")
        return joblib.load(if_path)

    non_fraud_mask = bundle["y_val"] == 0
    X_if = bundle["X_val"][non_fraud_mask]
    if len(X_if) < 10:
        X_if = bundle["X_val"]
    print(f"[if] Training IsolationForest on {len(X_if)} validation rows …")
    iso = IsolationForest(
        n_estimators=100,
        contamination="auto",
        random_state=args.seed,
        n_jobs=-1,
    )
    iso.fit(X_if)
    joblib.dump(iso, if_path)
    mark_stage(state, "if")
    print(f"[if] Saved {if_path}")
    return iso


def anomaly_scores(iso: IsolationForest, X: np.ndarray) -> np.ndarray:
    raw = -iso.score_samples(X)
    lo, hi = raw.min(), raw.max()
    if hi - lo < 1e-9:
        return np.zeros_like(raw)
    return (raw - lo) / (hi - lo)


def run_meta(
    rf: RandomForestClassifier,
    iso: IsolationForest,
    bundle: dict,
    state: dict,
    args: argparse.Namespace,
) -> dict:
    meta_path = ARTIFACTS / "meta_learner.json"
    if args.resume and stage_done(state, "meta") and meta_path.exists():
        print("[meta] Skipping (checkpoint)")
        return json.loads(meta_path.read_text())

    p_f = rf.predict_proba(bundle["X_val"])[:, 1]
    s_if = anomaly_scores(iso, bundle["X_val"])
    meta_X = np.column_stack([p_f, s_if])
    meta = LogisticRegression(random_state=args.seed, max_iter=500)
    meta.fit(meta_X, bundle["y_val"])

    payload = {
        "coefficients": meta.coef_.tolist(),
        "intercept": meta.intercept_.tolist(),
        "features": ["p_f", "s_if"],
    }
    meta_path.write_text(json.dumps(payload, indent=2))
    mark_stage(state, "meta")
    print(f"[meta] Saved {meta_path}")
    return payload


def composite_score(p_f: np.ndarray, s_if: np.ndarray, meta: dict) -> np.ndarray:
    coef = np.array(meta["coefficients"])[0]
    intercept = meta["intercept"][0]
    logit = intercept + coef[0] * p_f + coef[1] * s_if
    return 1.0 / (1.0 + np.exp(-logit))


def run_evaluate(
    rf: RandomForestClassifier,
    iso: IsolationForest,
    meta: dict,
    bundle: dict,
    args: argparse.Namespace,
    state: dict,
) -> dict:
    metrics_path = ARTIFACTS / "metrics.json"
    if args.resume and stage_done(state, "evaluate") and metrics_path.exists():
        print("[evaluate] Skipping (checkpoint)")
        return json.loads(metrics_path.read_text())

    p_f = rf.predict_proba(bundle["X_test"])[:, 1]
    s_if = anomaly_scores(iso, bundle["X_test"])
    scores = composite_score(p_f, s_if, meta)
    y_pred = (scores >= 0.5).astype(int)

    metrics = {
        "dataset": "BCCC-DeFiFraudTrans-2025",
        "subset": "mini",
        "n_train": int(len(bundle["y_train"])),
        "n_val": int(len(bundle["y_val"])),
        "n_test": int(len(bundle["y_test"])),
        "n_features": len(bundle["feature_cols"]),
        "seed": args.seed,
        "models": ["RandomForest", "IsolationForest", "LogisticStacking"],
        "test": {
            "precision": float(precision_score(bundle["y_test"], y_pred, zero_division=0)),
            "recall": float(recall_score(bundle["y_test"], y_pred, zero_division=0)),
            "f1": float(f1_score(bundle["y_test"], y_pred, zero_division=0)),
            "roc_auc": float(roc_auc_score(bundle["y_test"], scores)),
        },
        "note": "Pipeline validation; full 1M train + 22-dim CWB mapping per Section 4.",
        "generated_at": utc_now(),
    }
    metrics_path.write_text(json.dumps(metrics, indent=2))
    joblib.dump(
        {"feature_cols": bundle["feature_cols"], "seed": args.seed},
        ARTIFACTS / "feature_schema.joblib",
    )
    mark_stage(state, "evaluate")
    print(f"[evaluate] test F1={metrics['test']['f1']:.4f} AUC={metrics['test']['roc_auc']:.4f}")
    print(f"[evaluate] Saved {metrics_path}")
    return metrics


def run_shap(
    rf: RandomForestClassifier,
    bundle: dict,
    args: argparse.Namespace,
    state: dict,
) -> list:
    shap_path = ARTIFACTS / "shap_examples.json"
    if args.resume and stage_done(state, "shap") and shap_path.exists():
        print("[shap] Skipping (checkpoint)")
        return json.loads(shap_path.read_text())

    if shap is None:
        print("[shap] shap not installed — skipping")
        return []

    n = min(args.shap_samples, len(bundle["X_test"]))
    X_sample = bundle["X_test"][:n]
    print(f"[shap] TreeExplainer on {n} rows …")
    explainer = shap.TreeExplainer(rf)
    values = explainer.shap_values(X_sample)
    if isinstance(values, list):
        values = values[1] if len(values) > 1 else values[0]

    examples = []
    for i in range(min(5, n)):
        row_shap = values[i]
        top_idx = np.argsort(np.abs(row_shap))[-3:][::-1]
        examples.append(
            {
                "row_index": i,
                "true_label": int(bundle["y_test"][i]),
                "top_features": [
                    {
                        "name": bundle["feature_cols"][j],
                        "shap_value": float(row_shap[j]),
                        "feature_value": float(X_sample[i, j]),
                    }
                    for j in top_idx
                ],
            }
        )

    shap_path.write_text(json.dumps(examples, indent=2))
    mark_stage(state, "shap")
    print(f"[shap] Saved {shap_path} ({len(examples)} examples)")
    return examples


def print_status() -> None:
    state = load_checkpoint()
    print("Checkpoint:", CHECKPOINT_FILE)
    print("Completed stages:", state.get("completed_stages", []))
    print("Pending:", [s for s in STAGES if s not in state.get("completed_stages", [])])
    for name, path in [
        ("preprocessed", ARTIFACTS / "preprocessed.joblib"),
        ("rf_model", ARTIFACTS / "rf_model.pkl"),
        ("if_model", ARTIFACTS / "if_model.pkl"),
        ("meta_learner", ARTIFACTS / "meta_learner.json"),
        ("metrics", ARTIFACTS / "metrics.json"),
        ("shap_examples", ARTIFACTS / "shap_examples.json"),
    ]:
        print(f"  {name}: {'yes' if path.exists() else 'no'}")


def main() -> int:
    parser = argparse.ArgumentParser(description="BCCC mini train with resume checkpoints")
    parser.add_argument("--csv", type=str, help="Path to BCCC CSV")
    parser.add_argument("--label-column", type=str, default=None)
    parser.add_argument("--sample-size", type=int, default=50_000)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--rf-trees", type=int, default=100)
    parser.add_argument(
        "--rf-chunks",
        type=int,
        default=1,
        help="Train RF in N chunks (saves rf_model.pkl after each); use 5–10 on flaky power",
    )
    parser.add_argument("--shap-samples", type=int, default=300)
    parser.add_argument("--resume", action="store_true", help="Skip completed stages")
    parser.add_argument("--status", action="store_true", help="Show checkpoint status")
    parser.add_argument("--reset", action="store_true", help="Clear checkpoint and artifacts")
    args = parser.parse_args()

    if args.status:
        print_status()
        return 0

    if args.reset:
        for p in ARTIFACTS.glob("*"):
            if p.is_file():
                p.unlink()
        print("Cleared artifacts/")
        return 0

    if not args.csv:
        parser.error("--csv is required (unless using --status or --reset)")

    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    state = load_checkpoint()
    if not args.resume:
        state = {"completed_stages": [], "seed": args.seed, "csv_path": args.csv}
        save_checkpoint(state)

    bundle = run_preprocess(args, state)
    rf = run_rf(bundle, args, state)
    iso = run_if(bundle, args, state)
    meta = run_meta(rf, iso, bundle, state, args)
    run_evaluate(rf, iso, meta, bundle, args, state)
    run_shap(rf, bundle, args, state)

    print("\nDone. Re-run with --resume after a power cut to continue from last stage.")
    print_status()
    return 0


if __name__ == "__main__":
    sys.exit(main())
