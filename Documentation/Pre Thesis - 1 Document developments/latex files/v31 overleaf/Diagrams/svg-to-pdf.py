#!/usr/bin/env python3
"""Render SVG to PDF with headless Chrome; page size matches SVG viewBox."""
from __future__ import annotations

import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def find_chrome() -> str:
    candidates = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        shutil.which("google-chrome"),
        shutil.which("chromium"),
        shutil.which("chromium-browser"),
    ]
    for c in candidates:
        if c and Path(c).exists():
            return c
    raise SystemExit(
        "Chrome/Chromium required for diagram PDF export (renders foreignObject text)."
    )


def svg_page_size(svg_text: str) -> tuple[float, float]:
    root = re.search(
        r"<svg\b[^>]*\bviewBox=\"([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\"",
        svg_text,
        re.IGNORECASE,
    )
    if root:
        return float(root.group(3)), float(root.group(4))

    tag = re.search(r"<svg\b([^>]*)>", svg_text, re.IGNORECASE | re.DOTALL)
    if tag:
        attrs = tag.group(1)
        w_m = re.search(r"\bwidth=\"([0-9.]+)", attrs)
        h_m = re.search(r"\bheight=\"([0-9.]+)", attrs)
        if w_m and h_m:
            return float(w_m.group(1)), float(h_m.group(1))

    return 1200.0, 800.0


def svg_to_pdf(svg_path: Path, pdf_path: Path, chrome: str) -> None:
    svg_text = svg_path.read_text(encoding="utf-8", errors="replace")
    width, height = svg_page_size(svg_text)
    # Avoid zero-size pages from malformed exports.
    width = max(width, 200.0)
    height = max(height, 200.0)

    with tempfile.TemporaryDirectory(prefix="cwb-svg-pdf-") as tmp:
        html_path = Path(tmp) / "page.html"
        html_path.write_text(
            f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
@page {{ size: {width:.2f}px {height:.2f}px; margin: 0; }}
html, body {{
  margin: 0; padding: 0;
  width: {width:.2f}px; height: {height:.2f}px;
  background: white; overflow: hidden;
}}
svg {{ width: {width:.2f}px; height: {height:.2f}px; display: block; }}
</style></head>
<body>{svg_text}</body></html>""",
            encoding="utf-8",
        )
        subprocess.run(
            [
                chrome,
                "--headless",
                "--disable-gpu",
                "--no-pdf-header-footer",
                f"--print-to-pdf={pdf_path}",
                f"file://{html_path.resolve()}",
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit(f"usage: {sys.argv[0]} input.svg output.pdf")

    svg_path = Path(sys.argv[1]).resolve()
    pdf_path = Path(sys.argv[2]).resolve()
    if not svg_path.is_file():
        raise SystemExit(f"missing SVG: {svg_path}")

    chrome = find_chrome()
    svg_to_pdf(svg_path, pdf_path, chrome)


if __name__ == "__main__":
    main()
