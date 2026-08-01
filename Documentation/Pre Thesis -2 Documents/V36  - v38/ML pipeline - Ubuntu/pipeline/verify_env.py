"""Environment verification before training."""
from __future__ import annotations

import importlib.util
import json
import platform
import shutil
import sys
from pathlib import Path

from pipeline.paths import ROOT, dir_paths

REQUIRED_PACKAGES = (
    "numpy",
    "pandas",
    "sklearn",
    "joblib",
    "yaml",
    "matplotlib",
    "shap",
)


def _pkg_version(name: str) -> str | None:
    mapping = {"sklearn": "scikit-learn", "yaml": "pyyaml"}
    mod = importlib.import_module(name)
    return getattr(mod, "__version__", "unknown")


def free_disk_gb(path: Path) -> float:
    usage = shutil.disk_usage(path)
    return usage.free / (1024**3)


def verify(cfg: dict) -> dict:
    paths = dir_paths(cfg)
    paths["data"].mkdir(parents=True, exist_ok=True)
    paths["artifacts"].mkdir(parents=True, exist_ok=True)
    paths["mmd"].mkdir(parents=True, exist_ok=True)
    paths["svg"].mkdir(parents=True, exist_ok=True)

    py_min = tuple(int(x) for x in cfg["environment"]["min_python"].split("."))
    py_ok = sys.version_info[:2] >= py_min

    packages: dict[str, str | None] = {}
    missing: list[str] = []
    for pkg in REQUIRED_PACKAGES:
        try:
            packages[pkg] = _pkg_version(pkg)
        except Exception:
            packages[pkg] = None
            missing.append(pkg)

    disk_gb = free_disk_gb(ROOT)
    disk_ok = disk_gb >= cfg["environment"]["min_free_disk_gb"]

    report = {
        "ok": py_ok and not missing and disk_ok,
        "python": {
            "version": sys.version,
            "executable": sys.executable,
            "meets_minimum": py_ok,
            "required": cfg["environment"]["min_python"],
        },
        "platform": platform.platform(),
        "packages": packages,
        "missing_packages": missing,
        "disk_free_gb": round(disk_gb, 2),
        "disk_ok": disk_ok,
        "directories": {k: str(v) for k, v in paths.items()},
    }

    out = paths["artifacts"] / "env_report.json"
    out.write_text(json.dumps(report, indent=2))
    return report


def print_report(report: dict) -> None:
    print("\n=== Environment check ===")
    print(f"Python: {report['python']['version'].split()[0]} ({'OK' if report['python']['meets_minimum'] else 'FAIL'})")
    if report["missing_packages"]:
        print(f"Missing packages: {', '.join(report['missing_packages'])}")
    else:
        print("Packages: all required imports OK")
    print(f"Free disk: {report['disk_free_gb']} GB ({'OK' if report['disk_ok'] else 'LOW'})")
    print(f"Overall: {'PASS' if report['ok'] else 'FAIL'}")
    print("=========================\n")
