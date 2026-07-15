"""Synthetic CSV mimicking BCCC shape when real data is not yet available."""
from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd


def generate_synthetic_bccc_csv(path: Path, rows: int = 60_000, seed: int = 42) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(seed)
    n_features = 79
    X = rng.normal(0, 1, size=(rows, n_features))
    logits = X[:, :8].sum(axis=1) * 0.3 + rng.normal(0, 0.5, rows)
    y = (logits > np.median(logits)).astype(int)
    cols = {f"feature_{i+1:02d}": X[:, i] for i in range(n_features)}
    cols["fraud"] = y
    df = pd.DataFrame(cols)
    df.to_csv(path, index=False)
    print(f"[synthetic] Wrote {path} ({rows} rows, {n_features} features)")
    return path
