#!/usr/bin/env python3
"""Create Pre-thesis_v13.tex from v11: TikZ-coded diagrams instead of PNG."""
from pathlib import Path

DOC = Path(__file__).resolve().parents[1]
V11 = DOC / "Pre-thesis_v11.tex"
V13 = DOC / "Pre-thesis_v13.tex"
TIKZ_DIR = DOC / "Diagrams" / "tikz"

TIKZ_PREAMBLE = r"""
% === v13: vector TikZ diagrams (no PNG figure pipeline) ===
\input{Diagrams/tikz/cwb-tikz-styles.tex}
\newcommand{\CWBIncludeDiagram}[1]{%
  \IfFileExists{Diagrams/tikz/#1.tex}{%
    \input{Diagrams/tikz/#1.tex}%
  }{%
    \begin{center}%
    \fbox{\parbox{0.88\linewidth}{\centering\small\ttfamily Missing TikZ: Diagrams/tikz/#1.tex\\Run: python3 tools/mmd\_to\_tikz.py}}%
    \end{center}%
  }%
}
"""


def strip_png_ext(name: str) -> str:
    return name.replace(".png", "").replace(".pdf", "")


def main() -> None:
    text = V11.read_text(encoding="utf-8")
    # Insert TikZ block after OnePageDiagram definition
    anchor = r"\newcommand{\OnePageDiagram}[2][]{"
    if anchor not in text:
        raise SystemExit("Anchor not found in v11")
    end = text.find("% [most] loads many libraries", text.find(anchor))
    text = text[:end] + TIKZ_PREAMBLE + "\n" + text[end:]

    # Title comment
    text = text.replace(
        r"\documentclass[12pt,a4paper]{report}",
        r"\documentclass[12pt,a4paper]{report}  % v13: TikZ vector diagrams via \CWBIncludeDiagram",
        1,
    )

    # Replace PNG includes with stem-only (FigureImageMaxFit already redefined)
    import re

    def repl(m: re.Match) -> str:
        stem = strip_png_ext(m.group(1))
        return m.group(0).replace(m.group(1), stem + ".tex")  # macro strips .tex via filename@base

    text = re.sub(
        r"\\FigureImageMaxFit\{([^}]+)\}",
        lambda m: f"\\CWBIncludeDiagram{{{strip_png_ext(m.group(1))}}}",
        text,
    )
    text = re.sub(
        r"\\OnePageDiagram(?:\[[^\]]*\])?\{([^}]+)\}",
        lambda m: f"\\CWBIncludeDiagram{{{strip_png_ext(m.group(1))}}}",
        text,
    )

    header = (
        "%% Pre-thesis v13 — TikZ-coded diagrams (Documentation/Diagrams/tikz/*.tex)\n"
        "%% Regenerate diagrams: python3 tools/mmd_to_tikz.py\n"
        "%% Regenerate this file:  python3 tools/create_v13.py\n"
        "%%\n"
    )
    V13.write_text(header + text, encoding="utf-8")
    print(f"Wrote {V13} ({V13.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
