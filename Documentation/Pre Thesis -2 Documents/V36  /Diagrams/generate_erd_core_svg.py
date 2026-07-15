#!/usr/bin/env python3
"""Generate core entity ERD (Figure 4.5) — detailed academic Chen-notation diagram."""

from __future__ import annotations

import pathlib
import subprocess

from erd_academic_style import (
    ENTITY_W,
    Entity,
    PlacedEntity,
    PlacedRelationH,
    PlacedRelationV,
    Relation,
    draw_entity_chen,
    draw_relationship_h,
    draw_relationship_polyline,
    draw_relationship_v,
    entity_anchor,
    entity_height_from_fields,
    svg_header,
)

# Schema-aligned attribute rows: (key_tag, column_name)
CORE_SCHEMA: dict[str, list[tuple[str, str]]] = {
    "INSTITUTION": [
        ("PK", "institution_id"),
        ("", "name"),
        ("", "institution_type"),
        ("", "wallet_address"),
    ],
    "WORLD_BANK": [
        ("PK/FK", "institution_id"),
        ("", "chain_id"),
    ],
    "COUNTRY": [
        ("PK", "country_code"),
        ("", "country_name"),
        ("", "stablecoin_sym"),
    ],
    "NATIONAL_BANK": [
        ("PK/FK", "institution_id"),
        ("FK", "country_code"),
        ("FK", "parent_wb_id"),
    ],
    "LOCAL_BANK": [
        ("PK/FK", "institution_id"),
        ("FK", "national_bank_id"),
    ],
    "BANK_USER": [
        ("PK", "bank_user_id"),
        ("FK", "institution_id"),
        ("", "bank_type"),
    ],
    "BORROWER": [
        ("PK", "borrower_id"),
        ("UK", "wallet_address"),
        ("FK", "reg_local_bank_id"),
        ("", "kyc_level"),
    ],
    "LOAN_REQUEST": [
        ("PK", "request_id"),
        ("FK", "borrower_id"),
        ("FK", "local_bank_id"),
        ("", "status"),
        ("", "oracle_state"),
    ],
    "LOAN": [
        ("PK", "loan_id"),
        ("FK", "loan_request_id"),
        ("FK", "loan_asset_id"),
        ("FK", "disburse_evt_id"),
    ],
    "INSTALLMENT": [
        ("PK/FK", "loan_id"),
        ("PK", "installment_no"),
        ("FK", "pay_evt_log_id"),
        ("", "due_date"),
    ],
    "ASSETS": [
        ("PK", "asset_id"),
        ("UK", "symbol"),
        ("", "asset_type"),
    ],
    "BLOCKCHAIN_EVENT_LOG": [
        ("PK", "event_id"),
        ("UK", "tx_hash"),
        ("", "event_name"),
        ("", "block_number"),
    ],
    "AUDIT_LOGS": [
        ("PK", "audit_id"),
        ("FK", "bank_user_id"),
        ("", "action_type"),
        ("", "timestamp"),
    ],
}


def _place(
    name: str,
    x: float,
    y: float,
    *,
    weak: bool = False,
) -> PlacedEntity:
    fields = CORE_SCHEMA[name]
    h = entity_height_from_fields(len(fields))
    return PlacedEntity(
        Entity(name, "M1", fields),
        x,
        y,
        h,
        ENTITY_W,
        weak=weak,
    )


def render_core_erd() -> str:
    y0 = 28
    col_l = 28
    col_m = 310
    col_r = 592
    row1 = y0
    row2 = y0 + 136
    row3 = y0 + 282
    row4 = y0 + 442
    row5 = y0 + 598

    entities = {
        "INSTITUTION": _place("INSTITUTION", col_m, row1),
        "WORLD_BANK": _place("WORLD_BANK", col_l, row1),
        "COUNTRY": _place("COUNTRY", col_l, row2),
        "NATIONAL_BANK": _place("NATIONAL_BANK", col_m, row2),
        "LOCAL_BANK": _place("LOCAL_BANK", col_r, row2),
        "BANK_USER": _place("BANK_USER", col_l, row3),
        "BORROWER": _place("BORROWER", col_r, row3),
        "LOAN_REQUEST": _place("LOAN_REQUEST", col_m, row3),
        "LOAN": _place("LOAN", col_m, row4),
        "ASSETS": _place("ASSETS", col_r, row4),
        "AUDIT_LOGS": _place("AUDIT_LOGS", col_l, row4),
        "INSTALLMENT": _place("INSTALLMENT", col_m, row5, weak=True),
        "BLOCKCHAIN_EVENT_LOG": _place("BLOCKCHAIN_EVENT_LOG", col_l, row5),
    }

    inst = entities["INSTITUTION"]
    wb = entities["WORLD_BANK"]
    country = entities["COUNTRY"]
    nb = entities["NATIONAL_BANK"]
    lb = entities["LOCAL_BANK"]
    bu = entities["BANK_USER"]
    borr = entities["BORROWER"]
    lr = entities["LOAN_REQUEST"]
    loan = entities["LOAN"]
    instl = entities["INSTALLMENT"]
    assets = entities["ASSETS"]
    bel = entities["BLOCKCHAIN_EVENT_LOG"]
    audit = entities["AUDIT_LOGS"]

    inst_cx = inst.x + inst.w / 2
    lr_cx = lr.x + lr.w / 2

    connectors: list[str] = []

    # Institution hierarchy (row 1–2)
    connectors.append(draw_relationship_h(PlacedRelationH(
        Relation("ISA", "1", "1"),
        entity_anchor(wb, "right")[0], entity_anchor(inst, "left")[0],
        wb.y + 28,
    )))
    connectors.append(draw_relationship_v(PlacedRelationV(
        Relation("ISA", "1", "0..1"), inst_cx, inst.y + inst.h, nb.y,
    )))
    connectors.append(draw_relationship_h(PlacedRelationH(
        Relation("ISA", "1", "0..1"),
        entity_anchor(nb, "right")[0], entity_anchor(lb, "left")[0],
        nb.y + 24,
    )))
    connectors.append(draw_relationship_h(PlacedRelationH(
        Relation("hosts", "1", "N"),
        entity_anchor(country, "right")[0], entity_anchor(nb, "left")[0],
        country.y + country.h / 2,
    )))

    # Capital allocation — left margin lane (avoids centre-column ISA)
    wb_b = entity_anchor(wb, "bottom")
    nb_t = entity_anchor(nb, "top")
    lane_left = 50
    connectors.append(draw_relationship_polyline(
        [wb_b, (lane_left, wb_b[1]), (lane_left, nb_t[1] - 18), (nb_t[0], nb_t[1] - 18), nb_t],
        Relation("allocates", "1", "N"), label_seg=1,
        card_start="1", card_end="N",
    ))
    connectors.append(draw_relationship_h(PlacedRelationH(
        Relation("allocates", "1", "N"),
        entity_anchor(nb, "right")[0], entity_anchor(lb, "left")[0],
        nb.y + nb.h - 10,
    )))

    # Staff — top margin lane
    employs_y = 14
    employs_x = 268
    connectors.append(draw_relationship_polyline(
        [entity_anchor(inst, "left"), (employs_x, employs_y), (bu.x + bu.w / 2, employs_y),
         entity_anchor(bu, "top")],
        Relation("employs", "1", "N"), label_seg=1,
        card_start="1", card_end="N",
    ))

    # Borrower registration — right column
    connectors.append(draw_relationship_v(PlacedRelationV(
        Relation("registers", "1", "N"), lb.x + lb.w / 2, lb.y + lb.h, borr.y,
    )))

    # Lending lifecycle — separated lanes
    submit_y = lr.y - 12
    connectors.append(draw_relationship_polyline(
        [entity_anchor(borr, "bottom"), (borr.x + borr.w / 2, submit_y),
         (lr_cx, submit_y), entity_anchor(lr, "top")],
        Relation("submits", "1", "N"), label_seg=1,
        card_start="1", card_end="N",
    ))
    receive_x = lr.x + lr.w + 58
    lb_mid_y = lb.y + lb.h / 2
    lr_mid_y = lr.y + lr.h / 2
    connectors.append(draw_relationship_polyline(
        [entity_anchor(lb, "left"), (receive_x, lb_mid_y),
         (receive_x, lr_mid_y), entity_anchor(lr, "right")],
        Relation("receives", "1", "N"), label_seg=1,
        card_start="1", card_end="N",
    ))
    connectors.append(draw_relationship_v(PlacedRelationV(
        Relation("becomes", "1", "1"), lr_cx, lr.y + lr.h, loan.y,
    )))
    connectors.append(draw_relationship_v(PlacedRelationV(
        Relation("schedules", "1", "N"), lr_cx, loan.y + loan.h, instl.y,
    )))
    connectors.append(draw_relationship_h(PlacedRelationH(
        Relation("collateralised by", "N", "1"),
        entity_anchor(loan, "right")[0], entity_anchor(assets, "left")[0],
        loan.y + loan.h / 2,
    )))

    # On-chain sync and audit — dedicated lanes
    connectors.append(draw_relationship_h(PlacedRelationH(
        Relation("records", "1", "N"),
        entity_anchor(instl, "left")[0], entity_anchor(bel, "right")[0],
        instl.y + instl.h / 2,
    )))
    disb_x = loan.x - 42
    connectors.append(draw_relationship_polyline(
        [entity_anchor(loan, "left"), (disb_x, loan.y + loan.h / 2),
         (disb_x, bel.y + bel.h / 2), entity_anchor(bel, "right")],
        Relation("disbursed via", "1", "1"), label_seg=1,
        card_start="1", card_end="1",
    ))
    writes_y = audit.y - 22
    connectors.append(draw_relationship_polyline(
        [entity_anchor(bu, "bottom"), (bu.x + bu.w / 2, writes_y),
         (audit.x + audit.w / 2, writes_y), entity_anchor(audit, "top")],
        Relation("writes", "1", "N"), label_seg=1,
        card_start="1", card_end="N",
    ))

    total_w = 792
    bottom = max(e.y + e.h for e in entities.values()) + 20
    total_h = bottom + 12

    parts = svg_header(total_w, total_h)
    parts.append('<g id="connectors">')
    parts.extend(connectors)
    parts.append("</g>")
    parts.append('<g id="entities">')
    parts.extend(draw_entity_chen(e) for e in entities.values())
    parts.append("</g>")
    parts.append("</svg>")
    return "\n".join(parts)


def main() -> None:
    out_dir = pathlib.Path(__file__).parent
    svg_path = out_dir / "fig-erd-core.svg"
    pdf_path = out_dir / "fig-erd-core.pdf"
    svg_path.write_text(render_core_erd(), encoding="utf-8")
    subprocess.run(
        ["rsvg-convert", "-w", "1400", "-f", "pdf", "-o", str(pdf_path), str(svg_path)],
        check=True,
    )
    print(f"Wrote {svg_path.name} and {pdf_path.name}")


if __name__ == "__main__":
    main()
