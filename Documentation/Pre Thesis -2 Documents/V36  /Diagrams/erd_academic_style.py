"""Shared academic Chen-notation ERD drawing primitives (black & white)."""

from __future__ import annotations

import html
from dataclasses import dataclass
from typing import Literal

Tier = Literal["M1", "M2", "M3", "STUB", "FUTURE", "P4"]

BLACK = "#111111"
WHITE = "#FFFFFF"
GRAY = "#666666"
GRID = "#CCCCCC"
LINE = "#111111"

FONT = "Arial, Helvetica, sans-serif"

ENTITY_W = 172
ENTITY_H = 34
HEADER_H = 22
ROW_H = 12.5
ATTR_RX = 54
ATTR_RY = 15
ENT_PAD = 14
REL_GAP_V = 54
REL_GAP_H = 56

FONT_ENTITY = 10.5
FONT_FIELD = 7.5
FONT_ATTR = 9.5
FONT_REL = 8.5
FONT_CARD = 8
FONT_LEGEND = 9
FONT_TITLE = 13
FONT_SUBTITLE = 9.5
STROKE_CONN = 1.25
STROKE_SHAPE = 1.25


@dataclass
class Entity:
    name: str
    tier: Tier = "M1"
    attrs: list[tuple[str, str]] | None = None


@dataclass
class Relation:
    label: str
    card_parent: str
    card_child: str


@dataclass
class PlacedEntity:
    ent: Entity
    x: float
    y: float
    h: float = ENTITY_H
    w: float = ENTITY_W
    weak: bool = False


@dataclass
class PlacedAttribute:
    label: str
    cx: float
    cy: float


@dataclass
class PlacedRelationV:
    rel: Relation
    cx: float
    y1: float
    y2: float


@dataclass
class PlacedRelationH:
    rel: Relation
    x1: float
    x2: float
    cy: float


@dataclass
class Column:
    title: str
    items: list[tuple[Entity, Relation | None]]


def esc(text: str) -> str:
    return html.escape(text, quote=True)


def entity_height(ent: Entity) -> float:
    n = len(ent.attrs or [])
    return entity_height_from_fields(n)


def entity_height_from_fields(n: int) -> float:
    if n <= 0:
        return ENTITY_H
    return HEADER_H + n * ROW_H + 10


def _field_tag(key_tag: str) -> str:
    tag = key_tag.upper()
    if "PK" in tag and "FK" in tag:
        return "PK"
    if tag.startswith("PK"):
        return "PK"
    if "FK" in tag:
        return "FK"
    if tag == "UK":
        return "UK"
    return ""


def draw_entity_chen(pe: PlacedEntity, stub: bool = False) -> str:
    """Chen entity: rectangle with centred name (name-only fallback)."""
    if pe.ent.attrs:
        return draw_entity_detailed(pe, stub=stub)
    x, y, w, h = pe.x, pe.y, pe.w, pe.h
    dash = ' stroke-dasharray="5 3"' if stub or pe.ent.tier in ("STUB", "FUTURE") else ""
    return "\n".join([
        f'<g id="ent-{pe.ent.name}">',
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{WHITE}" '
        f'stroke="{LINE}" stroke-width="{STROKE_SHAPE}"{dash}/>',
        f'<line x1="{x}" y1="{y + 20}" x2="{x + w}" y2="{y + 20}" '
        f'stroke="{LINE}" stroke-width="0.8"/>',
        f'<text x="{x + w / 2}" y="{y + 14}" text-anchor="middle" font-family="{FONT}" '
        f'font-size="{FONT_ENTITY}" font-weight="700" fill="{BLACK}">{esc(pe.ent.name)}</text>',
        "</g>",
    ])


def _text_halo(x: float, y: float, text: str, *, size: float, weight: str = "500",
               anchor: str = "middle", fill: str = BLACK) -> str:
    return (
        f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="{FONT}" '
        f'font-size="{size}" font-weight="{weight}" fill="{fill}" stroke="{WHITE}" '
        f'stroke-width="3" paint-order="stroke fill">{text}</text>'
    )


def draw_entity_detailed(pe: PlacedEntity, stub: bool = False) -> str:
    """Chen entity with PK/FK attribute rows in the lower compartment."""
    fields = pe.ent.attrs or []
    x, y, w, h = pe.x, pe.y, pe.w, pe.h
    dash = ' stroke-dasharray="5 3"' if stub or pe.ent.tier in ("STUB", "FUTURE") else ""
    parts = [f'<g id="ent-{pe.ent.name}">']
    if pe.weak:
        parts.append(
            f'<rect x="{x - 4}" y="{y - 4}" width="{w + 8}" height="{h + 8}" fill="none" '
            f'stroke="{LINE}" stroke-width="1"/>'
        )
    parts.extend([
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{WHITE}" '
        f'stroke="{LINE}" stroke-width="{STROKE_SHAPE}"{dash}/>',
        f'<line x1="{x}" y1="{y + HEADER_H}" x2="{x + w}" y2="{y + HEADER_H}" '
        f'stroke="{LINE}" stroke-width="0.9"/>',
    ])
    if pe.weak:
        parts.append(
            f'<text x="{x + w / 2}" y="{y + 15}" text-anchor="middle" font-family="{FONT}" '
            f'font-size="{FONT_ENTITY}" font-weight="700" fill="{BLACK}">'
            f'{esc(pe.ent.name)}<tspan font-size="7.5" font-weight="400" fill="{GRAY}"> (weak)</tspan>'
            f"</text>"
        )
    else:
        parts.append(
            f'<text x="{x + w / 2}" y="{y + 15}" text-anchor="middle" font-family="{FONT}" '
            f'font-size="{FONT_ENTITY}" font-weight="700" fill="{BLACK}">{esc(pe.ent.name)}</text>'
        )

    ay = y + HEADER_H + 11
    for key_tag, attr in fields:
        badge = _field_tag(key_tag)
        text_x = x + 8
        if badge:
            parts.append(
                f'<text x="{text_x}" y="{ay}" font-family="{FONT}" font-size="7" '
                f'font-weight="700" fill="{BLACK}">{esc(badge)}</text>'
            )
            text_x = x + 24
        parts.append(
            f'<text x="{text_x}" y="{ay}" font-family="{FONT}" font-size="{FONT_FIELD}" '
            f'fill="{BLACK}">{esc(attr)}</text>'
        )
        if badge in ("PK", "UK"):
            tw = max(28, len(attr) * 4.6)
            parts.append(
                f'<line x1="{text_x}" y1="{ay + 2}" x2="{text_x + tw}" y2="{ay + 2}" '
                f'stroke="{LINE}" stroke-width="0.8"/>'
            )
        ay += ROW_H

    parts.append("</g>")
    return "\n".join(parts)


def entity_anchor(pe: PlacedEntity, side: str) -> tuple[float, float]:
    x, y, w, h = pe.x, pe.y, pe.w, pe.h
    if side == "top":
        return x + w / 2, y
    if side == "bottom":
        return x + w / 2, y + h
    if side == "left":
        return x, y + h / 2
    if side == "right":
        return x + w, y + h / 2
    return x + w / 2, y + h / 2


def _cardinality_text(rel: Relation) -> str:
    return f"{rel.card_parent}:{rel.card_child}"


def _diamond_size(label: str) -> tuple[float, float]:
    n = len(label)
    dw = min(58, max(24, 12 + n * 3.0))
    dh = 24 if n <= 9 else (26 if n <= 12 else 28)
    return dw, dh


def _rel_font_size(label: str) -> float:
    return 7.5 if len(label) > 11 else FONT_REL


def draw_attribute(pa: PlacedAttribute, underline: bool = False) -> str:
    """Chen attribute oval."""
    cx, cy = pa.cx, pa.cy
    parts = [
        f'<g id="attr-{pa.label}">',
        f'<ellipse cx="{cx}" cy="{cy}" rx="{ATTR_RX}" ry="{ATTR_RY}" fill="{WHITE}" '
        f'stroke="{LINE}" stroke-width="{STROKE_SHAPE}"/>',
        f'<text x="{cx}" y="{cy + 4}" text-anchor="middle" font-family="{FONT}" '
        f'font-size="{FONT_ATTR}" fill="{BLACK}">{esc(pa.label)}</text>',
    ]
    if underline:
        tw = len(pa.label) * 5.2
        parts.append(
            f'<line x1="{cx - tw / 2}" y1="{cy + 7}" x2="{cx + tw / 2}" y2="{cy + 7}" '
            f'stroke="{LINE}" stroke-width="0.9"/>'
        )
    parts.append("</g>")
    return "\n".join(parts)


def draw_attr_connector(ent: PlacedEntity, pa: PlacedAttribute) -> str:
    if pa.cy < ent.y - 4:
        ex, ey = entity_anchor(ent, "top")
    elif pa.cy > ent.y + ent.h + 4:
        ex, ey = entity_anchor(ent, "bottom")
    elif pa.cx < ent.x:
        ex, ey = entity_anchor(ent, "left")
    else:
        ex, ey = entity_anchor(ent, "right")
    return (
        f'<line x1="{ex}" y1="{ey}" x2="{pa.cx}" y2="{pa.cy}" '
        f'stroke="{LINE}" stroke-width="{STROKE_CONN}"/>'
    )


def _cardinality_mark(x: float, y: float, card: str, anchor: str) -> str:
    dx, dy = 0.0, 0.0
    if anchor == "above":
        dy = -11
    elif anchor == "below":
        dy = 12
    elif anchor == "left":
        dx = -16
    elif anchor == "right":
        dx = 14
    return _text_halo(
        x + dx, y + dy, esc(card), size=FONT_CARD, weight="600", anchor="middle",
    )


def _diamond_at(
    cx: float, cy: float, rel: Relation,
    card_from: tuple[float, float, str] | None = None,
    card_to: tuple[float, float, str] | None = None,
) -> list[str]:
    dw, dh = _diamond_size(rel.label)
    fs = _rel_font_size(rel.label)
    parts = [
        f'<polygon points="{cx - dw},{cy} {cx},{cy - dh / 2} {cx + dw},{cy} {cx},{cy + dh / 2}" '
        f'fill="{WHITE}" stroke="{LINE}" stroke-width="{STROKE_SHAPE}"/>',
        _text_halo(cx, cy + 4, esc(rel.label), size=fs, weight="500"),
    ]
    if card_from:
        parts.append(_cardinality_mark(card_from[0], card_from[1], card_from[2], card_from[3]))
    if card_to:
        parts.append(_cardinality_mark(card_to[0], card_to[1], card_to[2], card_to[3]))
    return parts


def draw_relationship_v(pr: PlacedRelationV) -> str:
    cx, y1, y2 = pr.cx, pr.y1, pr.y2
    mid_y = (y1 + y2) / 2
    rel = pr.rel
    _, dh = _diamond_size(rel.label)
    sw = STROKE_CONN
    parts = [
        f'<line x1="{cx}" y1="{y1}" x2="{cx}" y2="{mid_y - dh / 2}" stroke="{LINE}" '
        f'stroke-width="{sw}"/>',
        f'<line x1="{cx}" y1="{mid_y + dh / 2}" x2="{cx}" y2="{y2}" stroke="{LINE}" '
        f'stroke-width="{sw}"/>',
    ]
    parts.extend(_diamond_at(
        cx, mid_y, rel,
        (cx - 24, (y1 + mid_y) / 2, rel.card_parent, "left"),
        (cx + 24, (mid_y + y2) / 2, rel.card_child, "right"),
    ))
    return "\n".join(parts)


def draw_relationship_h(pr: PlacedRelationH) -> str:
    x1, x2, cy = pr.x1, pr.x2, pr.cy
    mid_x = (x1 + x2) / 2
    rel = pr.rel
    dw, _ = _diamond_size(rel.label)
    sw = STROKE_CONN
    parts = [
        f'<line x1="{x1}" y1="{cy}" x2="{mid_x - dw}" y2="{cy}" stroke="{LINE}" stroke-width="{sw}"/>',
        f'<line x1="{mid_x + dw}" y1="{cy}" x2="{x2}" y2="{cy}" stroke="{LINE}" stroke-width="{sw}"/>',
    ]
    # Wide labels: put cardinality below the connector to clear the diamond.
    if dw > 44:
        card_anchor = "below"
        card_y = cy + 16
    else:
        card_anchor = "above"
        card_y = cy - 14
    parts.extend(_diamond_at(
        mid_x, cy, rel,
        (x1 + 18, card_y, rel.card_parent, card_anchor),
        (x2 - 18, card_y, rel.card_child, card_anchor),
    ))
    return "\n".join(parts)


def draw_relationship_polyline(
    points: list[tuple[float, float]],
    rel: Relation,
    label_seg: int = 0,
    card_start: str | None = None,
    card_end: str | None = None,
) -> str:
    if len(points) < 2:
        return ""
    sw = STROKE_CONN
    parts: list[str] = []
    seg = max(0, min(label_seg, len(points) - 2))
    px0, py0 = points[seg]
    px1, py1 = points[seg + 1]
    mid_x = (px0 + px1) / 2
    mid_y = (py0 + py1) / 2
    dw, dh = _diamond_size(rel.label)

    for i in range(len(points) - 1):
        x0, y0 = points[i]
        x1, y1 = points[i + 1]
        if i == seg:
            if abs(x1 - x0) >= abs(y1 - y0):
                parts.append(
                    f'<line x1="{x0}" y1="{y0}" x2="{mid_x - dw}" y2="{y0}" '
                    f'stroke="{LINE}" stroke-width="{sw}"/>'
                )
                parts.append(
                    f'<line x1="{mid_x + dw}" y1="{y0}" x2="{x1}" y2="{y1}" '
                    f'stroke="{LINE}" stroke-width="{sw}"/>'
                )
            else:
                parts.append(
                    f'<line x1="{x0}" y1="{y0}" x2="{x0}" y2="{mid_y - dh / 2}" '
                    f'stroke="{LINE}" stroke-width="{sw}"/>'
                )
                parts.append(
                    f'<line x1="{x0}" y1="{mid_y + dh / 2}" x2="{x1}" y2="{y1}" '
                    f'stroke="{LINE}" stroke-width="{sw}"/>'
                )
        else:
            parts.append(
                f'<line x1="{x0}" y1="{y0}" x2="{x1}" y2="{y1}" stroke="{LINE}" stroke-width="{sw}"/>'
            )

    if card_start:
        sx, sy = points[0]
        x1, y1 = points[1]
        if abs(x1 - sx) >= abs(y1 - sy):
            parts.append(_cardinality_mark(sx, sy, card_start, "above"))
        else:
            parts.append(_cardinality_mark(sx, sy, card_start, "left"))
    if card_end:
        ex, ey = points[-1]
        x0, y0 = points[-2]
        if abs(ex - x0) >= abs(ey - y0):
            parts.append(_cardinality_mark(ex, ey, card_end, "above"))
        else:
            parts.append(_cardinality_mark(ex, ey, card_end, "right"))

    parts.extend(_diamond_at(mid_x, mid_y, rel))
    return "\n".join(parts)


def legend_block(total_w: float, ly: float) -> str:
    """Chen notation legend (black & white, two rows)."""
    lh = 68
    parts = [
        f'<rect x="16" y="{ly}" width="{total_w - 32}" height="{lh}" rx="4" '
        f'fill="{WHITE}" stroke="{GRID}" stroke-width="1"/>',
        f'<text x="28" y="{ly + 18}" font-family="{FONT}" font-size="{FONT_LEGEND}" '
        f'font-weight="700" fill="{BLACK}">Notation</text>',
    ]
    row1 = [
        ("rect", "Entity", 28),
        ("diamond", "Relationship", 118),
        ("pk", "PK underlined", 228),
        ("fk", "FK foreign key", 348),
    ]
    row2 = [
        ("weak", "Double border = weak entity", 28),
        ("card", "1 : N cardinality", 248),
    ]
    for kind, desc, lx in row1:
        ly_item = ly + 30
        if kind == "rect":
            parts.append(
                f'<rect x="{lx}" y="{ly_item}" width="30" height="14" fill="{WHITE}" '
                f'stroke="{LINE}" stroke-width="1"/>'
            )
            ox = 42
        elif kind == "diamond":
            parts.append(
                f'<polygon points="{lx + 15},{ly_item} {lx + 26},{ly_item + 7} {lx + 15},{ly_item + 14} '
                f'{lx + 4},{ly_item + 7}" fill="{WHITE}" stroke="{LINE}" stroke-width="1"/>'
            )
            ox = 42
        elif kind == "pk":
            parts.append(
                f'<text x="{lx}" y="{ly_item + 11}" font-family="{FONT}" font-size="7.5" '
                f'font-weight="700" fill="{BLACK}">PK</text>'
            )
            parts.append(
                f'<line x1="{lx + 14}" y1="{ly_item + 12}" x2="{lx + 34}" y2="{ly_item + 12}" '
                f'stroke="{LINE}" stroke-width="0.8"/>'
            )
            ox = 40
        else:
            parts.append(
                f'<text x="{lx}" y="{ly_item + 11}" font-family="{FONT}" font-size="7.5" '
                f'font-weight="700" fill="{BLACK}">FK</text>'
            )
            ox = 22
        parts.append(
            f'<text x="{lx + ox}" y="{ly_item + 11}" font-family="{FONT}" '
            f'font-size="8" fill="{BLACK}">{esc(desc)}</text>'
        )
    for kind, desc, lx in row2:
        ly_item = ly + 50
        if kind == "weak":
            parts.append(
                f'<rect x="{lx}" y="{ly_item}" width="22" height="14" fill="none" '
                f'stroke="{LINE}" stroke-width="1"/>'
            )
            parts.append(
                f'<rect x="{lx + 3}" y="{ly_item + 3}" width="16" height="8" fill="{WHITE}" '
                f'stroke="{LINE}" stroke-width="0.8"/>'
            )
            ox = 30
        else:
            parts.append(
                f'<text x="{lx}" y="{ly_item + 11}" font-family="{FONT}" font-size="{FONT_CARD}" '
                f'font-weight="600" fill="{BLACK}">1:N</text>'
            )
            ox = 28
        parts.append(
            f'<text x="{lx + ox}" y="{ly_item + 11}" font-family="{FONT}" '
            f'font-size="8" fill="{BLACK}">{esc(desc)}</text>'
        )
    return "\n".join(parts)


def title_block(total_w: float, title: str, subtitle: str) -> list[str]:
    return [
        f'<text x="{total_w / 2}" y="28" text-anchor="middle" font-family="{FONT}" '
        f'font-size="{FONT_TITLE}" font-weight="700" fill="{BLACK}">{esc(title)}</text>',
        f'<text x="{total_w / 2}" y="46" text-anchor="middle" font-family="{FONT}" '
        f'font-size="{FONT_SUBTITLE}" fill="{GRAY}">{esc(subtitle)}</text>',
        f'<line x1="24" y1="54" x2="{total_w - 24}" y2="54" stroke="{GRID}" stroke-width="1"/>',
    ]


def svg_header(total_w: float, total_h: float) -> list[str]:
    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total_w} {total_h}" '
        f'width="595pt" height="{595 * total_h / total_w:.2f}pt">',
        f'<rect width="{total_w}" height="{total_h}" fill="{WHITE}"/>',
    ]


# Legacy helpers kept for other generators
def draw_entity(pe: PlacedEntity) -> str:
    return draw_entity_chen(pe, stub=pe.ent.tier in ("STUB", "FUTURE"))


def layout_column(
    x: float, y0: float, col: Column,
) -> tuple[list[PlacedEntity], list[PlacedRelationV], float]:
    placed: list[PlacedEntity] = []
    y = y0 + 4
    for idx, (ent, _rel) in enumerate(col.items):
        if idx > 0:
            y += REL_GAP_V
        placed.append(PlacedEntity(ent, x, y, entity_height(ent)))
        y += entity_height(ent)
    connectors: list[PlacedRelationV] = []
    cx = x + ENTITY_W / 2
    for idx, (_ent, rel) in enumerate(col.items):
        if idx > 0 and rel is not None:
            upper = placed[idx - 1]
            lower = placed[idx]
            connectors.append(PlacedRelationV(rel, cx, upper.y + upper.h, lower.y))
    return placed, connectors, y + 8


def column_content_height(col: Column) -> float:
    _, _, bottom = layout_column(0, 0, col)
    return bottom + 10


def svg_defs() -> str:
    return ""


def frame_border(total_w: float, total_h: float) -> str:
    return ""
