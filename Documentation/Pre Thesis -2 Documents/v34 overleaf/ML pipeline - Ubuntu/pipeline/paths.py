"""Project root and standard directories."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = ROOT.parents[4]  # Cryto-World-Bank repo root


def dir_paths(cfg: dict) -> dict[str, Path]:
    return {
        "root": ROOT,
        "data": ROOT / "data",
        "artifacts": ROOT / cfg["outputs"]["artifacts_dir"],
        "mmd": ROOT / cfg["outputs"]["results_mmd_dir"],
        "svg": ROOT / cfg["outputs"]["results_svg_dir"],
        "venv": ROOT / cfg["environment"]["venv_dir"],
        "evidence": ROOT.parent / "evidence",
    }
