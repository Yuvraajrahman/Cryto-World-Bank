#!/usr/bin/env python3
"""Generate Diagrams/tikz/{stem}.tex from Diagrams/mermaid-src/{stem}.mmd (v13 vector figures)."""
from __future__ import annotations

import re
from pathlib import Path

DOC = Path(__file__).resolve().parents[1]
SRC = DOC / "Diagrams" / "mermaid-src"
OUT = DOC / "Diagrams" / "tikz"
SKIP = {"test"}

NODE_RE = re.compile(
    r"^\s*([A-Za-z0-9_]+)(?:\[([^\]]+)\])?\s*(?:\(([^)]*)\))?\s*$"
)
EDGE_RE = re.compile(
    r"^\s*([A-Za-z0-9_]+)\s*"
    r"(<-->|<-\.->|<-\.->|<--|==>|-->|-.->|\.->|--)\s*"
    r"(?:\|([^|]*)\|\s*)?"
    r"([A-Za-z0-9_]+)\s*$"
)
PART_RE = re.compile(r"^\s*participant\s+(\w+)\s+as\s+(.+)$", re.I)
MSG_RE = re.compile(
    r"^\s*(\w+)\s*(-?->>|-->>)\s*(\w+)\s*:\s*(.+)$"
)
QUAD_POINT = re.compile(r"^\s*([^:]+):\s*\[([0-9.]+),\s*([0-9.]+)\]\s*$")


def clean_label(s: str) -> str:
    s = s.strip().strip('"').strip("'")
    s = re.sub(r"<br\s*/?>", r"\\\\", s, flags=re.I)
    s = s.replace(r"\n", r"\\\\")  # mermaid line breaks in node text
    # Keep word "pct" as text; only escape real % signs
    s = re.sub(r"(?<!\\)%", r"\\%", s)
    s = s.replace("#", r"\#")
    s = s.replace("&", r"\&")
    s = s.replace("%", r"\%")
    s = s.replace("_", r"\_")
    return s


def parse_nodes(lines: list[str]) -> dict[str, str]:
    nodes: dict[str, str] = {}
    for line in lines:
        line = line.strip()
        if not line or line.startswith(("%%", "subgraph", "end", "style", "direction", "classDef")):
            continue
        m = re.match(r"^([A-Za-z0-9_]+)\s*\[([^\]]+)\]", line)
        if m:
            nodes[m.group(1)] = clean_label(m.group(2))
            continue
        m = re.match(r"^([A-Za-z0-9_]+)\s*\(([^)]+)\)", line)
        if m:
            nodes[m.group(1)] = clean_label(m.group(2))
    return nodes


def parse_edges(lines: list[str]) -> list[tuple[str, str, str, bool]]:
    edges: list[tuple[str, str, str, bool]] = []
    for line in lines:
        line = line.strip()
        m = EDGE_RE.match(line)
        if not m:
            continue
        a, op, lbl, b = m.group(1), m.group(2), (m.group(3) or "").strip(), m.group(4)
        dashed = ".->" in op or "-.->" in op or "<-..->" in op or "..>" in op
        edges.append((a, b, clean_label(lbl), dashed))
    return edges


def flow_to_tikz(stem: str, lines: list[str], direction: str) -> str:
    nodes = parse_nodes(lines)
    edges = parse_edges(lines)
    if not nodes:
        return (
            f"% {stem}: no nodes parsed\n"
            "\\begin{center}\\fbox{\\parbox{0.8\\linewidth}{\\centering\\small TikZ: "
            + stem
            + " (reparse needed)}}\\end{center}\n"
        )

    order: list[str] = []
    for a, b, _, _ in edges:
        for nid in (a, b):
            if nid in nodes and nid not in order:
                order.append(nid)
    for nid in nodes:
        if nid not in order:
            order.append(nid)

    is_lr = direction.upper() in ("LR", "RL")
    n = len(order)
    cols = min(4, n) if is_lr else 2
    import math

    rows = max(1, math.ceil(n / cols))

    body = [
        f"% Auto-generated TikZ from mermaid-src/{stem}.mmd",
        "\\begin{center}",
        "\\begin{tikzpicture}[cwb, node distance=0.7cm and 1.0cm]",
    ]
    for i, nid in enumerate(order[:20]):
        r, c = divmod(i, cols)
        x, y = c * 2.8, -r * 1.4
        style = "cwb box"
        if "planned" in nodes[nid].lower() or "Planned" in nodes[nid]:
            style = "cwb box planned"
        if nid in ("WB", "WR") or "World Bank" in nodes[nid]:
            style = "cwb box wb"
        lbl = nodes[nid]
        body.append(f"  \\node[{style}, align=center] ({nid}) at ({x},{y}) {{{lbl}}};")

    for a, b, lbl, dashed in edges[:30]:
        if a not in nodes or b not in nodes:
            continue
        style = "cwb arr dash" if dashed else "cwb arr"
        if lbl:
            body.append(
                f"  \\draw[{style}] ({a}) -- node[midway,font=\\tiny,align=center] {{{lbl}}} ({b});"
            )
        else:
            body.append(f"  \\draw[{style}] ({a}) -- ({b});")

    body += ["\\end{tikzpicture}", "\\end{center}", ""]
    return "\n".join(body)


def sequence_to_tikz(stem: str, lines: list[str]) -> str:
    parts: list[tuple[str, str]] = []
    msgs: list[tuple[str, str, str, bool]] = []
    for line in lines:
        line = line.strip()
        m = PART_RE.match(line)
        if m:
            parts.append((m.group(1), clean_label(m.group(2))))
        m = MSG_RE.match(line)
        if m:
            dashed = m.group(2).startswith("--")
            msgs.append((m.group(1), m.group(3), clean_label(m.group(4)), dashed))

    if not parts:
        return f"% empty sequence {stem}\n"

    n = len(parts)
    body = [
        f"% Auto-generated TikZ sequence from {stem}.mmd",
        "\\begin{center}",
        "\\begin{tikzpicture}[cwb, x=1.35cm, y=0.55cm]",
    ]
    for i, (pid, name) in enumerate(parts):
        x = i * 2
        body.append(f"  \\node[font=\\scriptsize\\bfseries] (h{pid}) at ({x},0) {{{name}}};")
        body.append(f"  \\draw[dashed,gray!60] ({x},-0.35) -- ({x},-5);")

    y = -1
    for fr, to, lbl, dashed in msgs:
        xi = next(i * 2 for i, (p, _) in enumerate(parts) if p == fr)
        xj = next(i * 2 for i, (p, _) in enumerate(parts) if p == to)
        style = "cwb arr dash" if dashed else "cwb arr"
        body.append(
            f"  \\draw[{style}] ({xi},{y}) -- node[above,font=\\tiny,align=center] {{{lbl}}} ({xj},{y});"
        )
        y -= 0.7

    body += ["\\end{tikzpicture}", "\\end{center}", ""]
    return "\n".join(body)


def quadrant_to_tikz(stem: str, lines: list[str]) -> str:
    points: list[tuple[str, float, float]] = []
    title = "Competitor positioning"
    for line in lines:
        if line.strip().startswith("title "):
            title = clean_label(line.split("title", 1)[1].strip())
        m = QUAD_POINT.match(line)
        if m:
            points.append((clean_label(m.group(1)), float(m.group(2)), float(m.group(3))))

    body = [
        f"% Quadrant chart {stem}",
        "\\begin{center}",
        "\\begin{tikzpicture}[cwb]",
        "  \\draw[gray!50] (0,0) rectangle (8,8);",
        "  \\draw[gray!50] (0,4) -- (8,4);",
        "  \\draw[gray!50] (4,0) -- (4,8);",
        f"  \\node[font=\\small\\bfseries] at (4,8.4) {{{title}}};",
        "  \\node[font=\\tiny,gray] at (4,-0.4) {Retail $\\rightarrow$ Institutional};",
        "  \\node[font=\\tiny,gray,rotate=90] at (-0.5,4) {Flat $\\rightarrow$ Hierarchical};",
    ]
    for name, x, y in points:
        px, py = x * 7 + 0.5, y * 7 + 0.5
        fill = "PrimaryBlue" if "Crypto" in name or "CWB" in name else "AccentBlue"
        body.append(f"  \\fill[{fill}!70] ({px},{py}) circle (3pt);")
        body.append(f"  \\node[font=\\tiny,anchor=west] at ({px+0.15},{py}) {{{name}}};")
    body += ["\\end{tikzpicture}", "\\end{center}", ""]
    return "\n".join(body)


def convert_file(mmd: Path) -> str:
    lines = mmd.read_text(encoding="utf-8").splitlines()
    first = next((ln.strip() for ln in lines if ln.strip() and not ln.strip().startswith("%%")), "")
    stem = mmd.stem

    if first.startswith("sequenceDiagram"):
        return sequence_to_tikz(stem, lines)
    if first.startswith("quadrantChart"):
        return quadrant_to_tikz(stem, lines)

    direction = "TB"
    if first.startswith("graph") or first.startswith("flowchart"):
        parts = first.split()
        if len(parts) >= 2:
            direction = parts[1]

    return flow_to_tikz(stem, lines, direction)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    n = 0
    for mmd in sorted(SRC.glob("*.mmd")):
        if mmd.stem in SKIP:
            continue
        tex = OUT / f"{mmd.stem}.tex"
        tex.write_text(convert_file(mmd), encoding="utf-8")
        n += 1
    print(f"Wrote {n} TikZ files -> {OUT}")


if __name__ == "__main__":
    main()
