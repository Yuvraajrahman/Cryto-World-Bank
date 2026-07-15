"""Master orchestrator: verify → download → train → report."""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from pipeline.download import acquire  # noqa: E402
from pipeline.paths import dir_paths  # noqa: E402
from pipeline.report import generate_reports  # noqa: E402
from pipeline.train import run_training  # noqa: E402
from pipeline.verify_env import print_report, verify  # noqa: E402


def load_config() -> dict:
    with open(ROOT / "config.yaml") as f:
        return yaml.safe_load(f)


def bootstrap_dependencies() -> None:
    """Install requirements into current interpreter if imports fail."""
    try:
        import shap  # noqa: F401
        import sklearn  # noqa: F401
        return
    except ImportError:
        pass
    print("[setup] Installing Python dependencies …")
    req = ROOT / "requirements.txt"
    subprocess.run(
        [sys.executable, "-m", "pip", "install", "-q", "-r", str(req)],
        check=True,
        cwd=ROOT,
    )


def create_venv_if_requested() -> None:
    venv_py = ROOT / ".venv" / "bin" / "python"
    if venv_py.exists():
        return
    print("[setup] Creating .venv (first run) …")
    subprocess.run([sys.executable, "-m", "venv", str(ROOT / ".venv")], check=True)
    subprocess.run(
        [str(venv_py), "-m", "pip", "install", "-q", "-U", "pip"],
        check=True,
    )
    subprocess.run(
        [str(venv_py), "-m", "pip", "install", "-q", "-r", str(ROOT / "requirements.txt")],
        check=True,
    )
    print("[setup] Created .venv — re-run via: ./run.sh")


def is_synthetic_path(csv_path: Path) -> bool:
    if "synthetic" in csv_path.name.lower():
        return True
    meta = ROOT / "artifacts" / "dataset_source.json"
    if meta.exists():
        return json.loads(meta.read_text()).get("synthetic", False)
    return False


def run_agent_check(cfg: dict) -> None:
    rel = cfg["agent"]["repo_backend_chatbot"]
    chatbot = (ROOT / rel).resolve()
    agent_dir = ROOT / "agent"
    agent_dir.mkdir(exist_ok=True)
    log = agent_dir / "agent_action_log.jsonl"
    status = {
        "chatbot_source_exists": chatbot.is_file(),
        "chatbot_path": str(chatbot),
        "log_path": str(log),
        "next_steps": [
            "Add loan_apply intent to backend/src/routes/chatbot.ts",
            "See agent/README.md for copy-paste snippets",
            "Demo: POST /api/chatbot/message with 'apply for loan'",
        ],
    }
    (ROOT / "artifacts" / "agent_status.json").write_text(json.dumps(status, indent=2))
    print("\n=== Agent demo (manual wiring) ===")
    print(f"Chatbot file: {'found' if status['chatbot_source_exists'] else 'MISSING'}")
    print("Details: agent/README.md")
    print("================================\n")


def main() -> int:
    parser = argparse.ArgumentParser(description="CWB ML training — full automated pipeline")
    parser.add_argument("--create-venv", action="store_true", help="Create .venv only, then exit")
    parser.add_argument("--status", action="store_true", help="Show checkpoint / artifact status")
    parser.add_argument("--report-only", action="store_true", help="Regenerate mmd/svg from existing metrics")
    parser.add_argument("--skip-train", action="store_true", help="Download + validate only")
    parser.add_argument("--reset", action="store_true", help="Clear artifacts and checkpoints")
    args = parser.parse_args()

    cfg = load_config()
    paths = dir_paths(cfg)

    if args.create_venv:
        create_venv_if_requested()
        return 0

    if args.reset:
        for p in paths["artifacts"].glob("*"):
            if p.is_file():
                p.unlink()
        print("Cleared artifacts/")
        return 0

    if args.status:
        cp = paths["artifacts"] / "checkpoint.json"
        if cp.exists():
            print(cp.read_text())
        else:
            print("No checkpoint yet.")
        for name in ("metrics.json", "rf_model.pkl", "env_report.json"):
            p = paths["artifacts"] / name
            print(f"  {name}: {'yes' if p.exists() else 'no'}")
        return 0

    print("\n" + "=" * 60)
    dev = cfg.get("device", {})
    print(f"  Crypto World Bank — ML Training ({dev.get('name', 'pipeline')})")
    print("=" * 60 + "\n")

    bootstrap_dependencies()

    print("[1/5] Verifying environment …")
    env_report = verify(cfg)
    print_report(env_report)
    if not env_report["ok"]:
        print("Fix environment issues above, then re-run ./run.sh")
        return 1

    if args.report_only:
        print("[report] Regenerating diagrams …")
        summary = generate_reports(cfg)
        print(json.dumps(summary["metrics"], indent=2))
        return 0

    print("[2/5] Acquiring dataset …")
    csv_path = acquire(cfg)
    synthetic = is_synthetic_path(csv_path)

    if args.skip_train:
        print(f"Dataset ready: {csv_path}")
        return 0

    print("[3/5] Training (resume-safe) …")
    metrics = run_training(cfg, csv_path, synthetic=synthetic)

    print("[4/5] Generating MMD + SVG results …")
    summary = generate_reports(cfg)

    print("[5/5] Agent demo checklist …")
    run_agent_check(cfg)

    print("\n" + "=" * 60)
    print("  DONE")
    print("=" * 60)
    print(f"  Metrics:  {paths['artifacts'] / 'metrics.json'}")
    print(f"  MMD:      {paths['mmd']}/")
    print(f"  SVG:      {paths['svg']}/")
    print(f"  F1={metrics['test']['f1']:.4f}  AUC={metrics['test']['roc_auc']:.4f}")
    if synthetic:
        print("  NOTE: Used SYNTHETIC data — add data/bccc.csv or DATASET_URL for real BCCC")
    print("  Re-run after power cut: ./run.sh  (auto-resumes checkpoints)")
    print("=" * 60 + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
