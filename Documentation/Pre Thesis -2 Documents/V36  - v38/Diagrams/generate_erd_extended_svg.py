#!/usr/bin/env python3
"""Generate extended banking-product ERD (Figure 4.5) in academic Chen notation."""

from __future__ import annotations

import pathlib
import subprocess

from erd_academic_style import (
    ENTITY_W,
    WHITE,
    Entity,
    PlacedEntity,
    PlacedRelationH,
    PlacedRelationV,
    Relation,
    draw_entity,
    draw_relationship_h,
    draw_relationship_polyline,
    draw_relationship_v,
    entity_anchor,
    entity_height,
    frame_border,
    legend_block,
    svg_defs,
)

ENT_H = 43
GAP_V = 58
GAP_H = 52


def _place(ent: Entity, x: float, y: float) -> PlacedEntity:
    return PlacedEntity(ent, x, y, entity_height(ent))


def render_extended_erd() -> str:
    margin = 20
    legend_h = 48

    col1 = margin
    col2 = col1 + ENTITY_W + GAP_H
    col3 = col2 + ENTITY_W + GAP_H
    col4 = col3 + ENTITY_W + GAP_H
    col5 = col4 + ENTITY_W + GAP_H

    row1 = margin
    row2 = row1 + ENT_H + GAP_V
    row3 = row2 + ENT_H + GAP_V
    row4 = row3 + ENT_H + GAP_V

    entities = {
        "INSTITUTION": _place(Entity("INSTITUTION", "M1", [("PK", "institution_id")]), col3, row1),
        "LOCAL_BANK": _place(Entity("LOCAL_BANK", "M1", [("PK", "institution_id")]), col3, row2),
        "LOAN_GROUP": _place(Entity("LOAN_GROUP", "M2", [("PK", "group_id")]), col1, row3),
        "INSURANCE_FUND": _place(Entity("INSURANCE_FUND", "STUB", [("PK", "fund_id")]), col2, row3),
        "BORROWER": _place(Entity("BORROWER", "M1", [("PK", "borrower_id")]), col4, row3),
        "GROUP_MEMBER": _place(Entity("GROUP_MEMBER", "M2", [("PK", "member_id")]), col1, row4),
        "SAVINGS_ACCOUNT": _place(Entity("SAVINGS_ACCOUNT", "M2", [("PK", "account_id")]), col2, row4),
        "FIXED_DEPOSIT": _place(Entity("FIXED_DEPOSIT", "STUB", [("PK", "deposit_id")]), col4, row4),
        "CURRENT_ACCOUNT": _place(Entity("CURRENT_ACCOUNT", "STUB", [("PK", "ca_id")]), col5, row4),
    }

    inst = entities["INSTITUTION"]
    local = entities["LOCAL_BANK"]
    loan = entities["LOAN_GROUP"]
    insurance = entities["INSURANCE_FUND"]
    borrower = entities["BORROWER"]
    member = entities["GROUP_MEMBER"]
    savings = entities["SAVINGS_ACCOUNT"]
    fixed = entities["FIXED_DEPOSIT"]
    current = entities["CURRENT_ACCOUNT"]

    connectors: list[str] = []

    connectors.append(draw_relationship_v(PlacedRelationV(
        Relation("ISA", "1", "0..1"),
        inst.x + inst.w / 2,
        inst.y + inst.h,
        local.y,
    )))

    local_left = entity_anchor(local, "left")
    loan_top = entity_anchor(loan, "top")
    route_y = local_left[1] + 22
    connectors.append(draw_relationship_polyline(
        [local_left, (local_left[0], route_y), (loan_top[0], route_y), loan_top],
        Relation("operates", "1", "N"),
        label_seg=1,
    ))

    ins_right = entity_anchor(insurance, "right")
    connectors.append(draw_relationship_h(PlacedRelationH(
        Relation("funds", "1", "1"),
        ins_right[0], local_left[0], local_left[1],
    )))

    local_right = entity_anchor(local, "right")
    br_left = entity_anchor(borrower, "left")
    connectors.append(draw_relationship_h(PlacedRelationH(
        Relation("registers", "1", "N"),
        local_right[0], br_left[0], br_left[1],
    )))

    local_bottom = entity_anchor(local, "bottom")
    sav_top = entity_anchor(savings, "top")
    hold_lane = local_bottom[1] + 30
    connectors.append(draw_relationship_polyline(
        [local_bottom, (local_bottom[0], hold_lane), (sav_top[0], hold_lane), sav_top],
        Relation("holds", "1", "N"),
        label_seg=2,
    ))

    connectors.append(draw_relationship_v(PlacedRelationV(
        Relation("includes", "1", "N"),
        loan.x + loan.w / 2,
        loan.y + loan.h,
        member.y,
    )))

    br_bottom = entity_anchor(borrower, "bottom")
    mem_top = entity_anchor(member, "top")
    join_lane = br_bottom[1] + 18
    connectors.append(draw_relationship_polyline(
        [br_bottom, (br_bottom[0], join_lane), (mem_top[0], join_lane), mem_top],
        Relation("joins", "1", "N"),
        label_seg=2,
    ))

    own_targets = [savings, fixed, current]
    for idx, target in enumerate(own_targets):
        top = entity_anchor(target, "top")
        lane_y = br_bottom[1] + 34 + idx * 16
        connectors.append(draw_relationship_polyline(
            [br_bottom, (br_bottom[0], lane_y), (top[0], lane_y), top],
            Relation("owns", "1", "N"),
            label_seg=2,
        ))

    placed = list(entities.values())
    total_w = col5 + ENTITY_W + margin
    total_h = row4 + ENT_H + legend_h + 24

    parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total_w} {total_h}" '
        f'width="595pt" height="{595 * total_h / total_w:.2f}pt">',
        svg_defs(),
        f'<rect width="{total_w}" height="{total_h}" fill="{WHITE}"/>',
        frame_border(total_w, total_h),
        '<g id="entities">',
        * (draw_entity(e) for e in placed),
        '</g>',
        '<g id="connectors">',
        *connectors,
        '</g>',
        legend_block(total_w, total_h - legend_h),
        '</svg>',
    ]
    return "\n".join(parts)


def main() -> None:
    out_dir = pathlib.Path(__file__).parent
    svg_path = out_dir / "fig-erd-extended.svg"
    pdf_path = out_dir / "fig-erd-extended.pdf"
    svg_path.write_text(render_extended_erd(), encoding="utf-8")
    subprocess.run(["rsvg-convert", "-f", "pdf", "-o", str(pdf_path), str(svg_path)], check=True)
    print(f"Wrote {svg_path.name} and {pdf_path.name}")


if __name__ == "__main__":
    main()
