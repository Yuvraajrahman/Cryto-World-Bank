"""Dataset acquisition: local path, URL download (resume), or synthetic fallback."""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import zipfile
from pathlib import Path
from urllib.parse import urlparse

import pandas as pd
import requests

from pipeline.paths import ROOT
from pipeline.synthetic_data import generate_synthetic_bccc_csv


def _load_dotenv() -> None:
    env_file = ROOT / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))


def _find_local(cfg: dict) -> Path | None:
    _load_dotenv()
    explicit = os.environ.get("DATASET_LOCAL_PATH", "").strip()
    if explicit:
        p = Path(explicit).expanduser()
        if p.is_file():
            return p.resolve()

    for rel in cfg["dataset"]["local_paths"]:
        p = Path(rel).expanduser()
        if not p.is_absolute():
            p = ROOT / rel
        if p.is_file():
            return p.resolve()
    return None


def _download_curl_wget(url: str, target: Path) -> bool:
    """Linux-friendly resume using curl -C - or wget -c."""
    part = target.with_suffix(target.suffix + ".part")
    target.parent.mkdir(parents=True, exist_ok=True)

    if shutil.which("curl"):
        offset = part.stat().st_size if part.exists() else 0
        cmd = ["curl", "-fL", "--retry", "5", "--retry-delay", "3", "-C", "-", "-o", str(part), url]
        print(f"[download] curl resume → {part}")
        subprocess.run(cmd, check=True)
        part.replace(target)
        return True

    if shutil.which("wget"):
        cmd = ["wget", "-c", "-O", str(part), url]
        print(f"[download] wget resume → {part}")
        subprocess.run(cmd, check=True)
        part.replace(target)
        return True
    return False


def _download_requests(url: str, target: Path) -> Path:
    target.parent.mkdir(parents=True, exist_ok=True)
    tmp = target.with_suffix(target.suffix + ".part")
    headers: dict[str, str] = {}
    mode = "ab"
    pos = 0
    if tmp.exists():
        pos = tmp.stat().st_size
        headers["Range"] = f"bytes={pos}-"

    print(f"[download] requests {url} → {target} (resume from {pos} bytes)")
    with requests.get(url, stream=True, headers=headers, timeout=300) as r:
        r.raise_for_status()
        with open(tmp, mode) as f:
            for chunk in r.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    f.write(chunk)

    tmp.replace(target)
    return target


def _extract_zip_if_needed(target: Path) -> Path:
    if target.suffix.lower() != ".zip":
        return target
    extract_dir = target.parent / "extracted"
    extract_dir.mkdir(exist_ok=True)
    with zipfile.ZipFile(target, "r") as zf:
        zf.extractall(extract_dir)
    csvs = sorted(extract_dir.rglob("*.csv"), key=lambda p: p.stat().st_size, reverse=True)
    if not csvs:
        raise RuntimeError("ZIP contained no CSV files")
    csv_path = target.parent / "bccc.csv"
    if csv_path.exists():
        csv_path.unlink()
    csvs[0].replace(csv_path)
    return csv_path


def _download(url: str, target: Path) -> Path:
    try:
        _download_requests(url, target)
    except Exception as exc:
        print(f"[download] requests failed ({exc}), trying curl/wget …")
        if not _download_curl_wget(url, target):
            raise
    return _extract_zip_if_needed(target)


def validate_csv(csv_path: Path, cfg: dict) -> dict:
    print(f"[validate] Reading {csv_path} …")
    df = pd.read_csv(csv_path, nrows=5000, low_memory=False)
    numeric_cols = sum(pd.api.types.is_numeric_dtype(df[c]) for c in df.columns)
    report = {
        "path": str(csv_path),
        "columns": len(df.columns),
        "numeric_columns": int(numeric_cols),
        "sample_rows_read": len(df),
        "file_size_mb": round(csv_path.stat().st_size / (1024**2), 2),
    }
    full_rows = sum(1 for _ in open(csv_path, encoding="utf-8", errors="replace")) - 1
    report["total_rows"] = full_rows
    if full_rows < cfg["dataset"]["min_rows"]:
        raise ValueError(f"Dataset has only {full_rows} rows; need >= {cfg['dataset']['min_rows']}")
    (ROOT / "artifacts" / "dataset_report.json").write_text(json.dumps(report, indent=2))
    print(f"[validate] OK — {full_rows:,} rows, {len(df.columns)} columns, {report['file_size_mb']} MB")
    return report


def acquire(cfg: dict) -> Path:
    _load_dotenv()
    local = _find_local(cfg)
    if local:
        print(f"[dataset] Using local file: {local}")
        validate_csv(local, cfg)
        return local

    url = os.environ.get("DATASET_URL", "").strip()
    target = ROOT / cfg["dataset"]["download_target"]
    if url:
        parsed = urlparse(url)
        if not parsed.scheme.startswith("http"):
            raise ValueError("DATASET_URL must be http(s)")
        if not target.suffix:
            ext = Path(parsed.path).suffix or ".csv"
            target = target.with_suffix(ext)
        downloaded = _download(url, target)
        validate_csv(downloaded, cfg)
        return downloaded

    if cfg["dataset"].get("allow_synthetic_fallback", False):
        print("[dataset] No BCCC file or URL — generating SYNTHETIC stand-in for pipeline test.")
        print("[dataset] Request real data: " + cfg["dataset"]["request_page"])
        syn = generate_synthetic_bccc_csv(ROOT / "data" / "synthetic_bccc.csv", rows=60_000)
        validate_csv(syn, cfg)
        meta = {"synthetic": True, "note": "Replace with real BCCC when available"}
        (ROOT / "artifacts" / "dataset_source.json").write_text(json.dumps(meta, indent=2))
        return syn

    raise FileNotFoundError(
        "No dataset found. Options:\n"
        "  1. Place CSV at data/bccc.csv\n"
        "  2. Set DATASET_LOCAL_PATH in .env\n"
        "  3. Set DATASET_URL in .env (after BCCC approval)\n"
        f"  4. Request dataset: {cfg['dataset']['request_page']}"
    )
