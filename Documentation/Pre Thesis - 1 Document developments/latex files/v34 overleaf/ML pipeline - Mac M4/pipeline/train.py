"""Staged RF + IF + stacking + SHAP training with checkpoint resume."""
from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    confusion_matrix,
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

try:
    from tqdm import tqdm
except ImportError:
    def tqdm(iterable=None, total=None, desc=None, **kwargs):  # type: ignore
        return iterable if iterable is not None else range(total or 0)

from pipeline.paths import dir_paths

STAGES = ("preprocess", "rf", "if", "meta", "evaluate", "shap")
LABEL_CANDIDATES = (
    "label", "class", "fraud", "is_fraud", "isfraud", "target", "y",
    "fraudulent", "is_fraudulent",
)


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class TrainConfig:
    csv_path: Path
    artifacts: Path
    sample_size: int
    seed: int
    rf_trees: int
    rf_max_depth: int
    rf_chunks: int
    if_estimators: int
    shap_samples: int
    shap_examples: int
    label_column: str | None
    resume: bool
    dataset_name: str
    synthetic: bool
    n_jobs: int
    device_profile: str


def load_train_config(cfg: dict, csv_path: Path, synthetic: bool) -> TrainConfig:
    t = cfg["training"]
    paths = dir_paths(cfg)
    return TrainConfig(
        csv_path=csv_path,
        artifacts=paths["artifacts"],
        sample_size=t["sample_size"],
        seed=t["seed"],
        rf_trees=t["rf_trees"],
        rf_max_depth=t["rf_max_depth"],
        rf_chunks=t["rf_chunks"],
        if_estimators=t["if_estimators"],
        shap_samples=t["shap_samples"],
        shap_examples=t["shap_examples_export"],
        label_column=cfg["dataset"].get("label_column"),
        resume=t.get("resume", True),
        dataset_name=cfg["dataset"]["name"],
        synthetic=synthetic,
        n_jobs=int(t.get("n_jobs", -1)),
        device_profile=str(cfg.get("device", {}).get("profile", "unknown")),
    )


def checkpoint_file(artifacts: Path) -> Path:
    return artifacts / "checkpoint.json"


def load_checkpoint(artifacts: Path) -> dict:
    p = checkpoint_file(artifacts)
    if p.exists():
        return json.loads(p.read_text())
    return {"completed_stages": [], "seed": 42, "csv_path": None}


def save_checkpoint(artifacts: Path, state: dict) -> None:
    artifacts.mkdir(parents=True, exist_ok=True)
    state["updated_at"] = utc_now()
    checkpoint_file(artifacts).write_text(json.dumps(state, indent=2))


def stage_done(state: dict, stage: str) -> bool:
    return stage in state.get("completed_stages", [])


def mark_stage(artifacts: Path, state: dict, stage: str) -> None:
    done = state.setdefault("completed_stages", [])
    if stage not in done:
        done.append(stage)
    save_checkpoint(artifacts, state)


def detect_label_column(df: pd.DataFrame) -> str:
    lower_map = {c.lower().strip(): c for c in df.columns}
    for cand in LABEL_CANDIDATES:
        if cand in lower_map:
            return lower_map[cand]
    for col in df.columns:
        if df[col].dtype in ("int64", "int32", "bool", "uint8") and df[col].nunique() == 2:
            return col
    raise ValueError(f"Could not detect label column among {list(df.columns)[:10]}…")


def load_and_subsample(tc: TrainConfig) -> tuple[pd.DataFrame, str, list[str]]:
    print(f"[preprocess] Loading {tc.csv_path} …")
    df = pd.read_csv(tc.csv_path, low_memory=False)
    label = tc.label_column or detect_label_column(df)
    df = df.dropna(subset=[label])
    y = df[label]
    if y.dtype == object:
        y = y.astype(str).str.lower().isin({"1", "true", "fraud", "yes", "malicious"}).astype(int)
    else:
        y = y.astype(int)
    df = df.assign(_label=y).drop(columns=[label])
    feature_cols = [c for c in df.columns if c != "_label" and pd.api.types.is_numeric_dtype(df[c])]
    if not feature_cols:
        raise ValueError("No numeric features")
    work = df[feature_cols + ["_label"]].replace([np.inf, -np.inf], np.nan).dropna()
    if len(work) > tc.sample_size:
        half = max(1, tc.sample_size // 2)
        work = (
            work.groupby("_label", group_keys=False)
            .apply(lambda g: g.sample(min(len(g), half), random_state=tc.seed))
            .reset_index(drop=True)
        )
        if len(work) > tc.sample_size:
            work = work.sample(n=tc.sample_size, random_state=tc.seed)
    print(f"[preprocess] {len(work)} rows × {len(feature_cols)} features")
    return work, "_label", feature_cols


def run_preprocess(tc: TrainConfig, state: dict) -> dict:
    bundle_path = tc.artifacts / "preprocessed.joblib"
    if tc.resume and stage_done(state, "preprocess") and bundle_path.exists():
        print("[preprocess] skip (checkpoint)")
        return joblib.load(bundle_path)
    work, label, feature_cols = load_and_subsample(tc)
    X = work[feature_cols].values.astype(np.float32)
    y = work[label].values.astype(int)
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.3, random_state=tc.seed, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=tc.seed, stratify=y_temp
    )
    bundle = {
        "feature_cols": feature_cols,
        "X_train": X_train, "y_train": y_train,
        "X_val": X_val, "y_val": y_val,
        "X_test": X_test, "y_test": y_test,
        "seed": tc.seed, "sample_size": len(work),
    }
    joblib.dump(bundle, bundle_path)
    state["csv_path"] = str(tc.csv_path)
    mark_stage(tc.artifacts, state, "preprocess")
    return bundle


def run_rf(tc: TrainConfig, bundle: dict, state: dict) -> RandomForestClassifier:
    rf_path = tc.artifacts / "rf_model.pkl"
    if tc.resume and stage_done(state, "rf") and rf_path.exists():
        print("[rf] skip (checkpoint)")
        return joblib.load(rf_path)
    print(f"[rf] Training {tc.rf_trees} trees (chunks={tc.rf_chunks}) …")
    rf = RandomForestClassifier(
        n_estimators=tc.rf_trees,
        max_depth=tc.rf_max_depth,
        class_weight="balanced",
        random_state=tc.seed,
        n_jobs=tc.n_jobs,
        warm_start=tc.rf_chunks > 1,
    )
    if tc.rf_chunks > 1:
        chunk = max(1, tc.rf_trees // tc.rf_chunks)
        steps = list(range(chunk, tc.rf_trees + 1, chunk))
        if steps[-1] != tc.rf_trees:
            steps.append(tc.rf_trees)
        for built in tqdm(steps, desc="RF trees", unit="chunk"):
            rf.n_estimators = built
            rf.fit(bundle["X_train"], bundle["y_train"])
            joblib.dump(rf, rf_path)
    else:
        rf.fit(bundle["X_train"], bundle["y_train"])
        joblib.dump(rf, rf_path)
    mark_stage(tc.artifacts, state, "rf")
    return rf


def run_if(tc: TrainConfig, bundle: dict, state: dict) -> IsolationForest:
    if_path = tc.artifacts / "if_model.pkl"
    if tc.resume and stage_done(state, "if") and if_path.exists():
        print("[if] skip (checkpoint)")
        return joblib.load(if_path)
    mask = bundle["y_val"] == 0
    X_if = bundle["X_val"][mask] if mask.sum() >= 10 else bundle["X_val"]
    print(f"[if] Training on {len(X_if)} rows …")
    iso = IsolationForest(
        n_estimators=tc.if_estimators,
        contamination="auto",
        random_state=tc.seed,
        n_jobs=tc.n_jobs,
    )
    iso.fit(X_if)
    joblib.dump(iso, if_path)
    mark_stage(tc.artifacts, state, "if")
    return iso


def anomaly_scores(iso: IsolationForest, X: np.ndarray) -> np.ndarray:
    raw = -iso.score_samples(X)
    lo, hi = raw.min(), raw.max()
    if hi - lo < 1e-9:
        return np.zeros_like(raw)
    return (raw - lo) / (hi - lo)


def run_meta(tc, rf, iso, bundle, state) -> dict:
    meta_path = tc.artifacts / "meta_learner.json"
    if tc.resume and stage_done(state, "meta") and meta_path.exists():
        print("[meta] skip (checkpoint)")
        return json.loads(meta_path.read_text())
    p_f = rf.predict_proba(bundle["X_val"])[:, 1]
    s_if = anomaly_scores(iso, bundle["X_val"])
    meta = LogisticRegression(random_state=tc.seed, max_iter=500)
    meta.fit(np.column_stack([p_f, s_if]), bundle["y_val"])
    payload = {
        "coefficients": meta.coef_.tolist(),
        "intercept": meta.intercept_.tolist(),
        "features": ["p_f", "s_if"],
    }
    meta_path.write_text(json.dumps(payload, indent=2))
    mark_stage(tc.artifacts, state, "meta")
    return payload


def composite_score(p_f, s_if, meta) -> np.ndarray:
    c = np.array(meta["coefficients"])[0]
    b = meta["intercept"][0]
    z = b + c[0] * p_f + c[1] * s_if
    return 1.0 / (1.0 + np.exp(-z))


def run_evaluate(tc, rf, iso, meta, bundle, state) -> dict:
    metrics_path = tc.artifacts / "metrics.json"
    if tc.resume and stage_done(state, "evaluate") and metrics_path.exists():
        print("[evaluate] skip (checkpoint)")
        return json.loads(metrics_path.read_text())
    p_f = rf.predict_proba(bundle["X_test"])[:, 1]
    s_if = anomaly_scores(iso, bundle["X_test"])
    scores = composite_score(p_f, s_if, meta)
    y_pred = (scores >= 0.5).astype(int)
    cm = confusion_matrix(bundle["y_test"], y_pred).tolist()
    metrics = {
        "dataset": tc.dataset_name,
        "subset": "mini",
        "synthetic": tc.synthetic,
        "n_train": int(len(bundle["y_train"])),
        "n_val": int(len(bundle["y_val"])),
        "n_test": int(len(bundle["y_test"])),
        "n_features": len(bundle["feature_cols"]),
        "seed": tc.seed,
        "rf_trees": tc.rf_trees,
        "device_profile": tc.device_profile,
        "models": ["RandomForest", "IsolationForest", "LogisticStacking"],
        "test": {
            "precision": float(precision_score(bundle["y_test"], y_pred, zero_division=0)),
            "recall": float(recall_score(bundle["y_test"], y_pred, zero_division=0)),
            "f1": float(f1_score(bundle["y_test"], y_pred, zero_division=0)),
            "roc_auc": float(roc_auc_score(bundle["y_test"], scores)),
        },
        "confusion_matrix": cm,
        "note": "Pipeline validation; full 1M train + 22-dim CWB mapping per Section 4.",
        "generated_at": utc_now(),
    }
    metrics_path.write_text(json.dumps(metrics, indent=2))
    joblib.dump({"feature_cols": bundle["feature_cols"]}, tc.artifacts / "feature_schema.joblib")
    mark_stage(tc.artifacts, state, "evaluate")
    print(f"[evaluate] F1={metrics['test']['f1']:.4f} AUC={metrics['test']['roc_auc']:.4f}")
    return metrics


def run_shap(tc, rf, bundle, state) -> list:
    shap_path = tc.artifacts / "shap_examples.json"
    if tc.resume and stage_done(state, "shap") and shap_path.exists():
        print("[shap] skip (checkpoint)")
        return json.loads(shap_path.read_text())
    if shap is None:
        print("[shap] package missing")
        return []
    n = min(tc.shap_samples, len(bundle["X_test"]))
    Xs = bundle["X_test"][:n]
    print(f"[shap] TreeExplainer on {n} rows …")
    explainer = shap.TreeExplainer(rf)
    values = explainer.shap_values(Xs)
    if isinstance(values, list):
        values = values[1] if len(values) > 1 else values[0]
    if getattr(values, "ndim", 0) == 3:
        values = values[:, :, 1] if values.shape[2] > 1 else values[:, :, 0]
    feat_names = list(bundle["feature_cols"])
    examples = []
    n_show = min(tc.shap_examples, n)
    for i in tqdm(range(n_show), desc="SHAP examples", unit="row"):
        row = np.asarray(values[i]).ravel()
        top = np.argsort(np.abs(row))[-3:][::-1]
        examples.append({
            "row_index": i,
            "true_label": int(bundle["y_test"][i]),
            "top_features": [
                {
                    "name": feat_names[int(j)],
                    "shap_value": float(row[int(j)]),
                    "feature_value": float(Xs[i, int(j)]),
                }
                for j in top
            ],
        })
    shap_path.write_text(json.dumps(examples, indent=2))
    mean_abs = np.abs(values).mean(axis=0).ravel()
    top_global = np.argsort(mean_abs)[-10:][::-1]
    global_imp = [
        {"feature": feat_names[int(j)], "mean_abs_shap": float(mean_abs[int(j)])}
        for j in top_global
    ]
    (tc.artifacts / "shap_global.json").write_text(json.dumps(global_imp, indent=2))
    mark_stage(tc.artifacts, state, "shap")
    return examples


def run_training(cfg: dict, csv_path: Path, synthetic: bool = False) -> dict:
    tc = load_train_config(cfg, csv_path, synthetic)
    tc.artifacts.mkdir(parents=True, exist_ok=True)
    state = load_checkpoint(tc.artifacts)
    if not tc.resume:
        state = {"completed_stages": [], "seed": tc.seed, "csv_path": str(csv_path)}
        save_checkpoint(tc.artifacts, state)

    stages = ["preprocess", "rf", "if", "meta", "evaluate", "shap"]
    pbar = tqdm(total=len(stages), desc="Pipeline", unit="stage")

    bundle = run_preprocess(tc, state)
    pbar.update(1)
    pbar.set_postfix_str("preprocess")

    rf = run_rf(tc, bundle, state)
    pbar.update(1)
    pbar.set_postfix_str("rf done")

    iso = run_if(tc, bundle, state)
    pbar.update(1)
    pbar.set_postfix_str("if done")

    meta = run_meta(tc, rf, iso, bundle, state)
    pbar.update(1)
    pbar.set_postfix_str("meta done")

    metrics = run_evaluate(tc, rf, iso, meta, bundle, state)
    pbar.update(1)
    pbar.set_postfix_str("evaluate done")

    run_shap(tc, rf, bundle, state)
    pbar.update(1)
    pbar.set_postfix_str("complete")
    pbar.close()

    return metrics
