#!/usr/bin/env python3
"""Post-process Mermaid sequence SVGs: centered step badges and text layout fixes."""

from __future__ import annotations

import re
import sys
from pathlib import Path

MARKER_LINE_RE = re.compile(
    r'<line x1="([\d.]+)" y1="([\d.]+)" x2="\1" y2="\2" stroke-width="0" '
    r'marker-start="url\(#my-svg-sequencenumber\)"/>'
)
SEQUENCE_TEXT_RE = re.compile(
    r'<text x="([\d.]+)" y="([\d.]+)"[^>]*class="sequenceNumber">(\d+)</text>'
)

NOTE_GROUP_RE = re.compile(
    r'(<g data-et="note"[^>]*>)'
    r'(<rect x="([\d.]+)" y="([\d.]+)" fill="(?:#EDF2AE|#F6F6F6|#EBF5FC)" stroke="#666" '
    r'width="([\d.]+)" height="([\d.]+)" class="note"/>)'
    r'<text x="[\d.]+" y="[\d.]+"[^>]*class="noteText"[^>]*>'
    r'(<tspan x="[\d.]+">([^<]*)</tspan>)'
    r'</text></g>',
    re.DOTALL,
)

ACTOR_GROUP_RE = re.compile(
    r'(<g>)<rect x="([\d.]+)" y="([\d.]+)" fill="#eaeaea" stroke="#666" '
    r'width="([\d.]+)" height="([\d.]+)" name="([^"]*)" rx="3" ry="3" '
    r'class="actor actor-(?:top|bottom)"/>'
    r'<text x="([\d.]+)" y="([\d.]+)"[^>]*class="actor[^"]*actor-box"[^>]*>'
    r'<tspan x="([\d.]+)">([^<]*)</tspan></text></g>',
    re.DOTALL,
)

NOTE_FILL = "#EBF5FC"  # very light blue (replaces Mermaid default yellow #EDF2AE)
NOTE_PAD = 10.0
BADGE_LIFT = 14.0
BADGE_RADIUS = 10.0
CHAR_WIDTH = 9.0
ACTOR_PAD = 32.0


def _badge_svg(x: float, y: float, num: str) -> str:
    cy = y - BADGE_LIFT
    return (
        f'<g class="seq-step-badge">'
        f'<circle cx="{x:.1f}" cy="{cy:.1f}" r="{BADGE_RADIUS:.1f}" '
        f'fill="#2d2d2d" stroke="none"/>'
        f'<text x="{x:.1f}" y="{cy:.1f}" text-anchor="middle" dy="0.33em" '
        f'fill="#ffffff" font-family="sans-serif" font-size="11px" '
        f'font-weight="600" class="sequenceNumber">{num}</text>'
        f"</g>"
    )


def _fix_notes(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        g_open, _rect, x, y, w, h, _tspan, note_text = match.groups()
        x_f, y_f, w_f, h_f = float(x), float(y), float(w), float(h)
        new_h = h_f + NOTE_PAD
        new_y = y_f - NOTE_PAD / 2
        cx = x_f + w_f / 2
        cy = new_y + new_h / 2
        rect = (
            f'<rect x="{x_f}" y="{new_y}" fill="{NOTE_FILL}" stroke="#666" '
            f'width="{w_f}" height="{new_h}" class="note"/>'
        )
        label = (
            f'<text x="{cx}" y="{cy}" text-anchor="middle" '
            f'dominant-baseline="central" alignment-baseline="central" '
            f'class="noteText" style="font-family: Inter, &quot;Helvetica Neue&quot;, '
            f'Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400;">'
            f'<tspan x="{cx}">{note_text}</tspan></text>'
        )
        return f"{g_open}{rect}{label}</g>"

    return NOTE_GROUP_RE.sub(repl, text)


def _fix_actors(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        g_open, x, y, w, h, name, tx, ty, _tspan_x, label = match.groups()
        x_f, y_f, w_f, h_f, tx_f, ty_f = (
            float(x),
            float(y),
            float(w),
            float(h),
            float(tx),
            float(ty),
        )
        min_w = len(label) * CHAR_WIDTH + ACTOR_PAD
        if min_w <= w_f:
            return match.group(0)

        new_w = min_w
        new_x = tx_f - new_w / 2
        text_block = (
            f'<text x="{tx_f}" y="{ty_f}" dominant-baseline="central" '
            f'alignment-baseline="central" class="actor actor-box" '
            f'style="text-anchor: middle; font-size: 16px; font-weight: 400; '
            f'font-family: Inter, &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif;">'
            f'<tspan x="{tx_f}">{label}</tspan></text>'
        )
        rect = (
            f'<rect x="{new_x}" y="{y_f}" fill="#eaeaea" stroke="#666" '
            f'width="{new_w}" height="{h_f}" name="{name}" rx="3" ry="3" '
            f'class="actor actor-{"top" if "actor-top" in match.group(0) else "bottom"}"/>'
        )
        return f"{g_open}{rect}{text_block}</g>"

    return ACTOR_GROUP_RE.sub(repl, text)


def _fix_badges(text: str) -> str:
    lines = list(MARKER_LINE_RE.finditer(text))
    labels = list(SEQUENCE_TEXT_RE.finditer(text))
    if not lines or not labels or len(lines) != len(labels):
        return text

    lines_sorted = sorted(lines, key=lambda m: float(m.group(2)))
    labels_sorted = sorted(labels, key=lambda m: float(m.group(2)))

    for line_m, label_m in zip(lines_sorted, labels_sorted):
        x = float(line_m.group(1))
        y = float(line_m.group(2))
        num = label_m.group(3)
        badge = _badge_svg(x, y, num)
        text = text.replace(line_m.group(0), badge, 1)
        text = text.replace(label_m.group(0), "", 1)
    return text


def fix_svg(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    text = _fix_badges(original)
    text = _fix_notes(text)
    text = _fix_actors(text)
    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("Usage: fix-sequence-svg.py <file.svg> [...]", file=sys.stderr)
        return 1

    changed = 0
    for arg in argv[1:]:
        path = Path(arg)
        if fix_svg(path):
            changed += 1
            print(f"fixed  {path.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
