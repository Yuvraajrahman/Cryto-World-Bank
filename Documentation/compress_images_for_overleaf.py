from __future__ import annotations

import argparse
import os
from pathlib import Path

from PIL import Image


def _iter_images(root: Path, *, skip_under: Path | None) -> list[Path]:
    exts = {".png", ".jpg", ".jpeg"}
    out: list[Path] = []
    skip_resolved = skip_under.resolve() if skip_under is not None else None
    for p in root.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in exts:
            continue
        if skip_resolved is not None:
            try:
                p.resolve().relative_to(skip_resolved)
                continue
            except ValueError:
                pass
        out.append(p)
    return out


def _safe_rel(root: Path, p: Path) -> Path:
    try:
        return p.relative_to(root)
    except Exception:
        return Path(p.name)


def compress_one(
    src: Path,
    dst: Path,
    *,
    max_px: int,
    jpeg_quality: int,
    png_optimize: bool,
) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(src) as im:
        im.load()

        # Convert palette/LA to RGB to keep output simple for pdflatex.
        if im.mode not in ("RGB", "L"):
            im = im.convert("RGB")

        w, h = im.size
        scale = min(1.0, max_px / max(w, h))
        if scale < 1.0:
            im = im.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)

        # Rule of thumb: screenshots compress far better as JPEG.
        # Keep the same basename, but prefer .jpg output.
        out_ext = ".jpg"
        out_path = dst.with_suffix(out_ext)

        im.save(
            out_path,
            format="JPEG",
            quality=jpeg_quality,
            optimize=True,
            progressive=True,
        )

        # Optionally also write a PNG if user wants identical extension; off by default.
        if png_optimize and src.suffix.lower() == ".png":
            png_path = dst.with_suffix(".png")
            # Re-open from current 'im' and write optimized PNG (still often big vs JPEG).
            im.save(png_path, format="PNG", optimize=True)


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Create a smaller image set for Overleaf (writes to ./compressed/)."
    )
    ap.add_argument(
        "root",
        nargs="?",
        default=".",
        help="Folder to scan for images (default: current directory).",
    )
    ap.add_argument(
        "--out",
        default="compressed",
        help='Output folder (default: "compressed").',
    )
    ap.add_argument(
        "--max-px",
        type=int,
        default=1100,
        help="Max width/height in pixels (default: 1100, tuned for Overleaf free-tier RAM/time).",
    )
    ap.add_argument(
        "--jpeg-quality",
        type=int,
        default=72,
        help="JPEG quality 1-95 (default: 72).",
    )
    ap.add_argument(
        "--also-png",
        action="store_true",
        help="Also write optimized PNGs for PNG inputs (usually not needed).",
    )

    args = ap.parse_args()
    root = Path(args.root).resolve()
    out_root = Path(args.out).resolve()

    imgs = _iter_images(root, skip_under=out_root)
    if not imgs:
        print(f"No images found under: {root}")
        return 0

    print(f"Found {len(imgs)} images under: {root}")
    print(f"Writing compressed copies to: {out_root}")

    for src in imgs:
        rel = _safe_rel(root, src)
        dst = out_root / rel
        compress_one(
            src,
            dst,
            max_px=args.max_px,
            jpeg_quality=args.jpeg_quality,
            png_optimize=bool(args.also_png),
        )

    print("Done.")
    print(
        'Next: upload the "compressed/" folder to Overleaf (same project root as your .tex).'
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

