#!/usr/bin/env python3
"""
Rebuild Diagrams/All diagrams.md — master archive of every Mermaid source.

Sources (in priority order per diagram):
  1. Existing section in new-diagrams-build.md (thesis extensions)
  2. Diagrams/mermaid-src/{stem}.mmd (from last mmdc build)
  3. Skip test.mmd

Usage:
  cd Documentation && python3 tools/rebuild_all_diagrams_md.py
"""
from __future__ import annotations

import re
from pathlib import Path

DOC = Path(__file__).resolve().parents[1]
NEW_MD = DOC / "Diagrams" / "new-diagrams-build.md"
SRC_DIR = DOC / "Diagrams" / "mermaid-src"
OUT = DOC / "Diagrams" / "All diagrams.md"

SECTION = re.compile(
    r"^## (.+?)\n\n"
    r"(?:.*?\n)*?"
    r"- \*\*Rendered (?:PDF|PNG):\*\* `Diagrams/mermaid-pdf/([^`]+)`\n"
    r"(?:- \*\*Mermaid archive:\*\*[^\n]*\n)?"
    r"\n?"
    r"```mermaid\n(.*?)```",
    re.MULTILINE | re.DOTALL,
)

# CSE471 / Ch.3 UML diagrams (not in new-diagrams-build.md)
CSE471_ORDER: list[tuple[str, str]] = [
    ("component-diagram", "Component Diagram"),
    ("usecase-diagram", "Use Case Diagram"),
    ("activity-loan-request", "Activity — Loan Request to Repayment"),
    ("activity-hierarchical-banking", "Activity — Hierarchical Banking"),
    ("activity-income-verification", "Activity — Income Verification"),
    ("activity-chat-system", "Activity — Chat System"),
    ("activity-ai-chatbot", "Activity — AI Chatbot"),
    ("activity-market-data", "Activity — Market Data Viewing"),
    ("activity-profile-management", "Activity — Profile Management"),
    ("dfd-context", "DFD Context (Level 0)"),
    ("dfd-level1-part1", "DFD Level 1 Part 1"),
    ("dfd-level1-part2", "DFD Level 1 Part 2"),
    ("sequence-loan-approval", "Sequence 1 — Loan Approval"),
    ("sequence-reject-path", "Sequence 1B — Reject Path"),
    ("sequence-installment", "Sequence 2 — Installment Loop"),
    ("sequence-income-verification", "Sequence 3 — Income Verification"),
    ("sequence-chat-system", "Sequence 4 — Chat System"),
    ("sequence-ai-chatbot", "Sequence 5 — AI Chatbot"),
    ("sequence-hierarchical-banking", "Sequence 6 — Hierarchical Banking"),
    ("sequence-market-data", "Sequence 7 — Market Data"),
    ("sequence-borrowing-limit", "Sequence 8 — Borrowing Limit"),
]

SKIP_STEMS = {"test"}


def parse_md(path: Path) -> dict[str, tuple[str, str]]:
    """stem -> (title, mermaid source)"""
    if not path.is_file():
        return {}
    out: dict[str, tuple[str, str]] = {}
    for m in SECTION.finditer(path.read_text(encoding="utf-8")):
        png = m.group(2)
        stem = Path(png).stem
        out[stem] = (m.group(1).strip(), m.group(3).strip())
    return out


def section_block(title: str, png_name: str, source: str) -> str:
    return (
        f"## {title}\n\n"
        f"- **Rendered PNG:** `Diagrams/mermaid-pdf/{png_name}`\n"
        f"- **Mermaid archive:** `Diagrams/mermaid-src/{Path(png_name).stem}.mmd`\n\n"
        f"```mermaid\n{source.rstrip()}\n```\n\n"
    )


def main() -> None:
    from_new = parse_md(NEW_MD)
    lines = [
        "# All Mermaid Diagrams — Master Source Archive",
        "",
        "Every diagram used in `Pre-thesis_v11.tex` is stored here as **Mermaid source**.",
        "PNG files in `Diagrams/mermaid-pdf/` are generated from this file and `new-diagrams-build.md`.",
        "",
        "**Regenerate this file:** `python3 tools/rebuild_all_diagrams_md.py`  ",
        "**Build PNGs:** `python3 tools/build_mermaid_pdfs.py`",
        "",
        "---",
        "",
        "## Part 1 — CSE471 system analysis (UML, DFD, sequences)",
        "",
    ]

    for stem, title in CSE471_ORDER:
        mmd = SRC_DIR / f"{stem}.mmd"
        if stem in from_new:
            _, src = from_new[stem]
        elif mmd.is_file():
            src = mmd.read_text(encoding="utf-8").strip()
        else:
            print(f"WARN: missing source for {stem}")
            continue
        lines.append(section_block(title, f"{stem}.png", src))

    lines.extend(
        [
            "---",
            "",
            "## Part 2 — Thesis extensions (Ch.1–5, AI, blockchain, planned banking)",
            "",
            "_Sections below mirror `new-diagrams-build.md`._",
            "",
        ]
    )

    if NEW_MD.is_file():
        body = NEW_MD.read_text(encoding="utf-8")
        # drop build file header; keep from first ##
        idx = body.find("\n## ")
        if idx >= 0:
            lines.append(body[idx + 1 :].rstrip())
            lines.append("")

    # Any mermaid-src not yet included (safety net)
    included = {s for s, _ in CSE471_ORDER} | set(from_new.keys())
    extra = []
    for mmd in sorted(SRC_DIR.glob("*.mmd")):
        stem = mmd.stem
        if stem in SKIP_STEMS or stem in included:
            continue
        title = stem.replace("-", " ").title()
        extra.append(section_block(title, f"{stem}.png", mmd.read_text(encoding="utf-8").strip()))
        included.add(stem)

    if extra:
        lines.extend(["---", "", "## Part 3 — Additional archived sources", ""])
        lines.extend(extra)

    OUT.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    n1 = len(CSE471_ORDER)
    n2 = len(from_new)
    print(f"Wrote {OUT.name}: Part1={n1} CSE471, Part2={n2} from new-diagrams-build, extra={len(extra)}")


if __name__ == "__main__":
    main()
