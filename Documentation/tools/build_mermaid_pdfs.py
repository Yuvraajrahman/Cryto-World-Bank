#!/usr/bin/env python3
"""
Render Mermaid diagrams as high-resolution PNG via mmdc (Chromium screenshot).

Why PNG (not SVG→PDF): Mermaid still embeds HTML (foreignObject) labels in SVG.
rsvg-convert cannot render those → blank boxes in PDF. mmdc PNG bakes all text.

Usage:
  cd Documentation && python3 tools/build_mermaid_pdfs.py
"""
from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path

DOC = Path(__file__).resolve().parents[1]
ALL_MD = DOC / "Diagrams" / "All diagrams.md"
NEW_MD = DOC / "Diagrams" / "new-diagrams-build.md"
CONFIG = Path(__file__).resolve().parent / "mermaid.config.json"
# All diagrams.md is the master archive (rebuild via rebuild_all_diagrams_md.py).
# new-diagrams-build.md remains the editable staging file for Part 2 diagrams.
SOURCE_FILES = (ALL_MD, NEW_MD)
SRC_DIR = DOC / "Diagrams" / "mermaid-src"
OUT_DIR = DOC / "Diagrams" / "mermaid-pdf"

SECTION = re.compile(
    r"^## (.+?)\n\n"
    r"(?:.*?\n)*?"
    r"- \*\*Rendered (?:PDF|PNG):\*\* `Diagrams/mermaid-pdf/([^`]+)`\n"
    r"(?:- \*\*Mermaid archive:\*\*[^\n]*\n)?"
    r"\n?"
    r"```mermaid\n(.*?)```",
    re.MULTILINE | re.DOTALL,
)

# (output filename, width, scale) — scale multiplies Chromium screenshot DPI
RENDER: dict[str, tuple[int, float]] = {
    # New thesis diagrams (Chapter 1–5)
    "financial-inclusion-gap.png": (2800, 2.5),
    "flat-vs-hierarchical.png": (3000, 2.5),
    "cross-tier-flow.png": (3200, 2.5),
    "borrower-tier-access.png": (2600, 2.5),
    "correspondent-vs-onchain.png": (3200, 2.5),
    "monetary-policy-comparison.png": (3000, 2.5),
    "institutional-adoption-timeline.png": (3000, 2.5),
    "aiml-security-pipeline.png": (3200, 2.5),
    "market-sizing-funnel.png": (2400, 2.5),
    "defi-tvl-comparison.png": (2800, 2.5),
    "competitive-feature-matrix.png": (3000, 2.5),
    "competitor-quadrant.png": (2800, 2.5),
    "interest-rate-waterfall.png": (2800, 2.5),
    "gtm-roadmap.png": (3600, 2.5),
    "usecase-diagram.png": (3200, 3),
    "activity-loan-request.png": (2800, 3),
    "activity-hierarchical-banking.png": (2600, 3),
    "activity-income-verification.png": (2400, 3),
    "activity-chat-system.png": (2400, 3),
    "activity-ai-chatbot.png": (2400, 3),
    "activity-market-data.png": (2400, 3),
    "activity-profile-management.png": (2400, 3),
    "component-diagram.png": (2800, 2.5),
    "dfd-level1-part1.png": (3000, 2.5),
    "dfd-level1-part2.png": (2800, 2.5),
}

DEFAULT_WIDTH = 2400
DEFAULT_SCALE = 2.5
TIMEOUT_SEC = 240


def sanitize_mermaid(source: str) -> str:
    lines = []
    for line in source.splitlines():
        stripped = line.strip()
        if stripped.startswith("%%{init:") and stripped.endswith("}%%"):
            continue
        if stripped.startswith("%%"):
            continue
        line = re.sub(r"<br\s*/?>", r"\\n", line, flags=re.IGNORECASE)
        lines.append(line)
    text = "\n".join(lines).strip()
    text = re.sub(r"[\U0001F300-\U0001FAFF\U00002600-\U000027BF]", "", text)
    return text + "\n"


def parse_all_diagrams(text: str) -> list[tuple[str, str, str]]:
    items = []
    for m in SECTION.finditer(text):
        name = m.group(2)
        if name.endswith(".pdf"):
            name = name[:-4] + ".png"
        items.append((m.group(1), name, m.group(3).strip()))
    return items


def find_mmdc() -> str:
    return shutil.which("mmdc") or shutil.which("mmdc.cmd") or "mmdc"


def render_png(mmdc: str, mmd: Path, png: Path, width: int, scale: float) -> None:
    png.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            mmdc,
            "-i",
            str(mmd),
            "-o",
            str(png),
            "-c",
            str(CONFIG),
            "-b",
            "white",
            "-w",
            str(width),
            "-s",
            str(scale),
        ],
        check=True,
        timeout=TIMEOUT_SEC,
        capture_output=True,
        text=True,
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--only", help="Render single stem, e.g. usecase-diagram")
    args = parser.parse_args()

    mmdc = find_mmdc()
    if args.check:
        subprocess.run([mmdc, "--version"], check=True)
        print(f"OK: {mmdc} (PNG pipeline, scale up to 3x)")
        return 0

    diagrams_by_stem: dict[str, tuple[str, str, str]] = {}
    for path in SOURCE_FILES:
        if not path.is_file() or path.stat().st_size < 20:
            continue
        parsed = parse_all_diagrams(path.read_text(encoding="utf-8"))
        if parsed:
            print(f"Parsed {len(parsed)} diagram(s) from {path.name}")
            for title, out_name, source in parsed:
                stem = Path(out_name).stem
                diagrams_by_stem[stem] = (title, out_name, source)
    diagrams = list(diagrams_by_stem.values())
    if not diagrams:
        print("No diagrams parsed from source markdown files.", file=sys.stderr)
        return 1

    print(f"Pipeline: mmdc → PNG (fixes blank HTML labels in PDF)\n")

    SRC_DIR.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    ok, failed = 0, []
    for title, out_name, source in diagrams:
        stem = Path(out_name).stem
        if args.only and stem != args.only:
            continue
        width, scale = RENDER.get(out_name, (DEFAULT_WIDTH, DEFAULT_SCALE))
        mmd_path = SRC_DIR / f"{stem}.mmd"
        png_path = OUT_DIR / out_name
        mmd_path.write_text(sanitize_mermaid(source), encoding="utf-8")
        print(f"[{ok + 1}/{len(diagrams)}] {title} (w={width}, s={scale}) ...", flush=True)
        try:
            render_png(mmdc, mmd_path, png_path, width, scale)
            print(f"  OK -> {png_path.name} ({png_path.stat().st_size // 1024} KB)", flush=True)
            ok += 1
        except subprocess.TimeoutExpired:
            print(f"  TIMEOUT: {title}", flush=True)
            failed.append(title)
        except subprocess.CalledProcessError as exc:
            err = (exc.stderr or exc.stdout or "")[:600]
            print(f"  ERROR: {title}\n{err}", flush=True)
            failed.append(title)
        except FileNotFoundError:
            print("mmdc not found: npm install -g @mermaid-js/mermaid-cli", file=sys.stderr)
            return 1

    print(f"\nDone: {ok}/{len(diagrams)} PNGs -> {OUT_DIR}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
