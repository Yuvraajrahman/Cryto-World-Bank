"""Generate Mermaid (.mmd) reports and SVG figures from training artifacts."""
from __future__ import annotations

import json
import re
import shutil
import subprocess
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

from pipeline.paths import ROOT, dir_paths

FONT_SCALE = 1.2
_MPL_FONT_RC = {
    "font.size": 10 * FONT_SCALE,
    "axes.titlesize": 12 * FONT_SCALE,
    "axes.labelsize": 10 * FONT_SCALE,
    "xtick.labelsize": 10 * FONT_SCALE,
    "ytick.labelsize": 10 * FONT_SCALE,
}
_ANNOT_FS = 10 * FONT_SCALE


def _load_json(path: Path) -> dict | list:
    return json.loads(path.read_text())


def _load_shap_importance_fallback(paths: dict[str, Path]) -> list[dict]:
    """Reuse bar order/weights from an existing thesis SHAP SVG if artifacts are missing."""
    candidates = [
        paths["root"].parent / "Diagrams" / "fig-ml-shap-importance.svg",
        paths["evidence"] / "mac-m4" / "shap_importance.svg",
    ]
    for svg_path in candidates:
        if not svg_path.exists():
            continue
        text = svg_path.read_text()
        features = re.findall(r"<!-- (feature_\d+) -->", text)
        bar_ends = re.findall(
            r'path d="M 71\.8 [\d.]+ \nL ([\d.]+) [\d.]+ \nL \1 [\d.]+ \nL 71\.8',
            text,
        )
        if features and bar_ends and len(features) == len(bar_ends):
            return [
                {"feature": feat, "mean_abs_shap": float(end) - 71.8}
                for feat, end in zip(features, bar_ends)
            ]
    return []


def _copy_thesis_ml_diagrams(paths: dict[str, Path]) -> None:
    thesis_diag = paths["root"].parent / "Diagrams"
    mapping = {
        "metrics_bars.svg": "fig-ml-metrics-bars.svg",
        "confusion_matrix.svg": "fig-ml-confusion-matrix.svg",
        "shap_importance.svg": "fig-ml-shap-importance.svg",
    }
    for src_name, dest_name in mapping.items():
        src = paths["svg"] / src_name
        if src.exists():
            shutil.copy2(src, thesis_diag / dest_name)


def write_mmd_files(cfg: dict, metrics: dict) -> list[Path]:
    paths = dir_paths(cfg)
    mmd_dir = paths["mmd"]
    mmd_dir.mkdir(parents=True, exist_ok=True)
    t = metrics.get("test", {})
    syn = metrics.get("synthetic", False)
    syn_note = " — SYNTHETIC stand-in" if syn else ""

    files: dict[str, str] = {}

    files["01_pipeline_flow.mmd"] = f"""%%{{init: {{'theme': 'base', 'themeVariables': {{ 'fontSize': '14px'}}}}}}%%
flowchart LR
    A["Dataset CSV{syn_note}"] --> B["Preprocess / subsample n={metrics.get('n_train', 0) + metrics.get('n_val', 0) + metrics.get('n_test', 0)}"]
    B --> C[Random Forest<br/>{metrics.get('rf_trees', 100)} trees]
    B --> D[Isolation Forest<br/>anomaly]
    C --> E[Logistic stacking]
    D --> E
    E --> F[Evaluate held-out test]
    F --> G[SHAP TreeExplainer]
    G --> H[metrics.json + diagrams]
"""

    files["02_training_metrics.mmd"] = f"""%%{{init: {{'theme': 'base'}}}}%%
xychart-beta
    title "Held-out test metrics{syn_note}"
    x-axis ["Precision", "Recall", "F1", "ROC-AUC"]
    y-axis "Score" 0 --> 1
    bar [{t.get('precision', 0):.3f}, {t.get('recall', 0):.3f}, {t.get('f1', 0):.3f}, {t.get('roc_auc', 0):.3f}]
"""

    cm = metrics.get("confusion_matrix", [[0, 0], [0, 0]])
    tn, fp, fn, tp = cm[0][0], cm[0][1], cm[1][0], cm[1][1]
    files["03_confusion_summary.mmd"] = f"""%%{{init: {{'theme': 'base'}}}}%%
flowchart TB
    subgraph Actual
        F[Actual Fraud]
        L[Actual Legitimate]
    end
    subgraph Predicted
        PF[Pred Fraud]
        PL[Pred Legitimate]
    end
    F -->|TP {tp}| PF
    F -->|FN {fn}| PL
    L -->|FP {fp}| PF
    L -->|TN {tn}| PL
"""

    shap_path = paths["artifacts"] / "shap_global.json"
    if shap_path.exists():
        imp = _load_json(shap_path)[:5]
        lines = "\n".join(
            f'    {i+1}["{row["feature"][:28]}<br/>mean abs SHAP {row["mean_abs_shap"]:.4f}"]'
            for i, row in enumerate(imp)
        )
        files["04_shap_top_features.mmd"] = f"""%%{{init: {{'theme': 'base'}}}}%%
flowchart TB
    subgraph top5 ["Top 5 mean abs SHAP features"]
{lines}
    end
"""

    files["05_results_dashboard.mmd"] = f"""%%{{init: {{'theme': 'base'}}}}%%
mindmap
  root(("CWB ML Results{syn_note}"))
    Dataset
      {metrics.get('dataset', 'BCCC')}
      Features {metrics.get('n_features', 0)}
      Train {metrics.get('n_train', 0)}
      Test {metrics.get('n_test', 0)}
    Models
      RandomForest
      IsolationForest
      LogisticStacking
    Test metrics
      F1 {t.get('f1', 0):.3f}
      AUC {t.get('roc_auc', 0):.3f}
    Explainability
      SHAP TreeExplainer
      Authority Brief ready
"""

    written = []
    for name, body in files.items():
        p = mmd_dir / name
        p.write_text(body)
        written.append(p)
    return written


def render_mmd_to_svg(mmd_files: list[Path], svg_dir: Path) -> list[Path]:
    svg_dir.mkdir(parents=True, exist_ok=True)
    rendered = []
    mmdc = shutil.which("mmdc")
    if not mmdc:
        print("[report] mmdc not found — install: npm install -g @mermaid-js/mermaid-cli")
        print("[report] MMD source files are in results/mmd/; matplotlib SVGs still generated.")
        return rendered
    for mmd in mmd_files:
        out = svg_dir / mmd.name.replace(".mmd", ".svg")
        try:
            subprocess.run(
                [mmdc, "-i", str(mmd), "-o", str(out), "-b", "white", "-q"],
                check=True,
                capture_output=True,
            )
            rendered.append(out)
            print(f"[report] SVG {out.name}")
        except subprocess.CalledProcessError as e:
            print(f"[report] mmdc failed for {mmd.name}: {e.stderr.decode()[:200]}")
    return rendered


def matplotlib_svgs(cfg: dict, metrics: dict) -> list[Path]:
    paths = dir_paths(cfg)
    svg_dir = paths["svg"]
    svg_dir.mkdir(parents=True, exist_ok=True)
    out_files = []
    t = metrics.get("test", {})

    with plt.rc_context(_MPL_FONT_RC):
        # Metrics bar chart (monochrome / print-safe)
        fig, ax = plt.subplots(figsize=(8, 5))
        names = ["Precision", "Recall", "F1", "ROC-AUC"]
        vals = [t.get("precision", 0), t.get("recall", 0), t.get("f1", 0), t.get("roc_auc", 0)]
        colors = ["#1a1a1a", "#4d4d4d", "#808080", "#b3b3b3"]
        bars = ax.bar(names, vals, color=colors, edgecolor="#ffffff", linewidth=0.8)
        ax.set_ylim(0, 1.05)
        ax.set_ylabel("Score")
        title = "CWB Fraud Model — Held-out Test Metrics"
        if metrics.get("synthetic"):
            title += " (synthetic data)"
        ax.set_title(title)
        for b, v in zip(bars, vals):
            ax.text(
                b.get_x() + b.get_width() / 2,
                v + 0.02,
                f"{v:.3f}",
                ha="center",
                fontsize=_ANNOT_FS,
            )
        fig.tight_layout()
        p1 = svg_dir / "metrics_bars.svg"
        fig.savefig(p1, format="svg")
        plt.close(fig)
        out_files.append(p1)

        # Confusion matrix heatmap
        cm = np.array(metrics.get("confusion_matrix", [[1, 0], [0, 1]]))
        fig, ax = plt.subplots(figsize=(6, 5))
        im = ax.imshow(cm, cmap="Greys", vmin=0, vmax=cm.max() if cm.max() > 0 else 1)
        ax.set_xticks([0, 1], labels=["Pred 0", "Pred 1"])
        ax.set_yticks([0, 1], labels=["True 0", "True 1"])
        for i in range(2):
            for j in range(2):
                ax.text(
                    j,
                    i,
                    str(cm[i, j]),
                    ha="center",
                    va="center",
                    fontsize=_ANNOT_FS,
                    color="white" if cm[i, j] > cm.max() / 2 else "black",
                )
        ax.set_title("Confusion Matrix (test)")
        cbar = fig.colorbar(im, ax=ax, fraction=0.046)
        cbar.ax.tick_params(labelsize=10 * FONT_SCALE)
        fig.tight_layout()
        p2 = svg_dir / "confusion_matrix.svg"
        fig.savefig(p2, format="svg")
        plt.close(fig)
        out_files.append(p2)

        # SHAP global importance
        shap_global = paths["artifacts"] / "shap_global.json"
        if shap_global.exists():
            imp = _load_json(shap_global)[:10]
        else:
            imp = _load_shap_importance_fallback(paths)[:10]
        if imp:
            fig, ax = plt.subplots(figsize=(9, 5))
            feats = [r["feature"][:24] for r in imp][::-1]
            vals = [r["mean_abs_shap"] for r in imp][::-1]
            ax.barh(feats, vals, color="#404040", edgecolor="#ffffff", linewidth=0.5)
            ax.set_xlabel("Mean |SHAP|")
            ax.set_title("Global feature importance (SHAP)")
            fig.tight_layout()
            p3 = svg_dir / "shap_importance.svg"
            fig.savefig(p3, format="svg")
            plt.close(fig)
            out_files.append(p3)

    print(f"[report] matplotlib SVGs → {svg_dir}")
    return out_files


def copy_evidence(cfg: dict, metrics: dict) -> None:
    if not cfg["outputs"].get("evidence_copy", True):
        return
    paths = dir_paths(cfg)
    ev = paths["evidence"]
    sub = cfg["outputs"].get("evidence_subdir")
    if sub:
        ev = ev / sub
    ev.mkdir(parents=True, exist_ok=True)
    for name in ("metrics.json", "shap_examples.json", "env_report.json", "dataset_report.json"):
        src = paths["artifacts"] / name
        if src.exists():
            shutil.copy2(src, ev / name)
    for name in ("metrics_bars.svg", "confusion_matrix.svg", "shap_importance.svg"):
        src = paths["svg"] / name
        if src.exists():
            shutil.copy2(src, ev / name)
    print(f"[report] Evidence copies → {ev}")


def generate_reports(cfg: dict) -> dict:
    paths = dir_paths(cfg)
    metrics_path = paths["artifacts"] / "metrics.json"
    if not metrics_path.exists():
        raise FileNotFoundError("metrics.json missing — run training first")
    metrics = _load_json(metrics_path)
    mmd_files = write_mmd_files(cfg, metrics)
    mmd_svgs = render_mmd_to_svg(mmd_files, paths["svg"])
    chart_svgs = matplotlib_svgs(cfg, metrics)
    copy_evidence(cfg, metrics)
    _copy_thesis_ml_diagrams(paths)

    summary = {
        "mmd_files": [str(p) for p in mmd_files],
        "mermaid_svgs": [str(p) for p in mmd_svgs],
        "chart_svgs": [str(p) for p in chart_svgs],
        "metrics": metrics.get("test", {}),
    }
    (paths["artifacts"] / "report_summary.json").write_text(json.dumps(summary, indent=2))
    return summary
