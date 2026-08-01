#!/usr/bin/env python3
"""Generate appendix full relational ERD sheets (academic Chen notation)."""

from __future__ import annotations

import pathlib
import subprocess

from erd_academic_style import (
    ENTITY_W,
    WHITE,
    Column,
    Entity,
    PlacedEntity,
    PlacedRelationV,
    Relation,
    column_content_height,
    draw_entity,
    draw_relationship_v,
    entity_height,
    frame_border,
    layout_column,
    legend_block,
    svg_defs,
)


def build_columns() -> list[Column]:
    return [
        Column("Institutions and Actors (M1)", [
            (Entity("INSTITUTION", "M1", [
                ("PK", "institution_id"), ("", "name"), ("UK", "contract_address"),
            ]), None),
            (Entity("WORLD_BANK", "M1", [
                ("PK", "institution_id"), ("FK", "to INSTITUTION"), ("", "singleton CHECK"),
            ]), Relation("specialises", "1", "0..1")),
            (Entity("COUNTRY", "M1", [
                ("PK", "country_code"), ("", "country_name"),
            ]), Relation("governs", "1", "1")),
            (Entity("NATIONAL_BANK", "M1", [
                ("PK", "institution_id"), ("FK", "country_code"), ("FK", "parent_world_bank_id"),
            ]), Relation("hosts", "1", "1")),
            (Entity("LOCAL_BANK", "M1", [
                ("PK", "institution_id"), ("FK", "national_bank_id"),
            ]), Relation("supervises", "1", "N")),
            (Entity("BORROWER", "M1", [
                ("PK", "borrower_id"), ("UK", "wallet_address"), ("FK", "registered_local_bank_id"),
            ]), Relation("registers", "1", "N")),
            (Entity("BANK_USER", "M1", [
                ("PK", "bank_user_id"), ("FK", "institution_id"), ("", "bank_type"),
            ]), Relation("serves", "1", "N")),
        ]),
        Column("Lending Lifecycle and Audit (M1)", [
            (Entity("ASSETS", "M1", [
                ("PK", "asset_id"), ("UK", "symbol"), ("", "asset_type"),
            ]), None),
            (Entity("LOAN_REQUEST", "M1", [
                ("PK", "request_id"), ("FK", "borrower_id"), ("FK", "local_bank_id"),
            ]), Relation("registers", "1", "N")),
            (Entity("LOAN", "M1", [
                ("PK", "loan_id"), ("FK", "loan_request_id"), ("FK", "loan_asset_id"),
            ]), Relation("submits", "1", "1")),
            (Entity("INSTALLMENT", "M1", [
                ("PK", "loan_id"), ("PK", "installment_no"), ("FK", "payment_event_log_id"),
            ]), Relation("disburses", "1", "N")),
            (Entity("BLOCKCHAIN_EVENT_LOG", "M1", [
                ("PK", "event_id"), ("UK", "tx_hash"), ("", "event_name"),
            ]), Relation("repays", "1", "N")),
            (Entity("AUDIT_LOGS", "M1", [
                ("PK", "audit_id"), ("FK", "bank_user_id"), ("", "action_type"),
            ]), Relation("caches", "0..1", "N")),
        ]),
        Column("Ledger and Credit A (M2/M3)", [
            (Entity("INTEREST_RATE_TIER", "M2", [
                ("PK", "tier_id"), ("UK", "bank_tier_type"), ("", "base_rate"),
            ]), None),
            (Entity("TRANSACTION", "M2", [
                ("PK", "transaction_id"), ("FK", "borrower_id"), ("FK", "origin_institution_id"),
            ]), Relation("prices", "1", "N")),
            (Entity("BORROWING_LIMIT", "M2", [
                ("PK", "limit_id"), ("FK", "borrower_id"), ("UK", "on_chain_limit"),
            ]), Relation("posts", "1", "N")),
            (Entity("CREDIT_PASSPORT", "M2", [
                ("PK", "passport_id"), ("FK", "borrower_id"), ("", "credit_score"),
            ]), Relation("caps", "1", "1")),
            (Entity("CREDIT_PASSPORT_HISTORY", "M2", [
                ("PK", "history_id"), ("FK", "passport_id"), ("", "append_only"),
            ]), Relation("issues", "1", "1")),
        ]),
        Column("Ledger and Credit B (M2/M3)", [
            (Entity("INCOME_PROOF", "M2", [
                ("PK", "proof_id"), ("FK", "borrower_id"), ("", "document_hash"),
            ]), None),
            (Entity("MODEL_REGISTRY", "M3", [
                ("PK", "model_id"), ("", "model_name"), ("", "version"),
            ]), Relation("submits", "1", "N")),
            (Entity("LOAN_RISK_ASSESSMENT", "M3", [
                ("PK", "assessment_id"), ("FK", "loan_request_id"), ("FK", "model_id"),
            ]), Relation("versions", "1", "N")),
            (Entity("SECURITY_EVENT_LOG", "M3", [
                ("PK", "security_event_id"), ("", "event_type"), ("", "append_only"),
            ]), Relation("scores", "1", "N")),
        ]),
        Column("Group Lending and Agent Sessions (M2/M3)", [
            (Entity("LOAN_GROUP", "M2", [
                ("PK", "group_id"), ("FK", "local_bank_id"),
            ]), None),
            (Entity("GROUP_MEMBER", "M2", [
                ("PK", "member_id"), ("FK", "group_id"), ("FK", "borrower_id"),
            ]), Relation("contains", "1", "N")),
            (Entity("GROUP_CONSENT", "M2", [
                ("PK", "consent_id"), ("FK", "loan_request_id"), ("FK", "member_id"),
            ]), Relation("joins", "1", "N")),
            (Entity("SESSIONS", "M3", [
                ("PK", "session_id"), ("FK", "borrower_id"), ("", "expires_at"),
            ]), Relation("consents", "1", "N")),
            (Entity("AGENT_CONVERSATION_TURN", "M3", [
                ("PK", "turn_id"), ("FK", "session_id"),
            ]), Relation("opens", "1", "N")),
            (Entity("AGENT_ACTION_LOG", "M3", [
                ("PK", "action_id"), ("FK", "session_id"), ("FK", "confirmation_turn_id"),
            ]), Relation("turns", "1", "N")),
            (Entity("SESSION_ANCESTOR", "M3", [
                ("PK", "session_id"), ("PK", "ancestor_session_id"),
            ]), Relation("audits", "1", "N")),
            (Entity("SESSION_KEY_PERMISSION", "P4", [
                ("PK", "permission_id"), ("FK", "session_id"), ("", "tool_allowlist"),
            ]), Relation("lineage", "1", "N")),
        ]),
        Column("Capital Ops and Deposits (M2/Stub)", [
            (Entity("SAVINGS_ACCOUNT", "M2", [
                ("PK", "account_id"), ("FK", "borrower_id"), ("FK", "local_bank_id"),
            ]), None),
            (Entity("INTERBANK_LOAN", "M2", [
                ("PK", "interbank_loan_id"), ("FK", "lender_institution_id"), ("FK", "borrower_institution_id"),
            ]), Relation("holds", "1", "N")),
            (Entity("UPWARD_DEPOSIT", "M2", [
                ("PK", "deposit_id"), ("FK", "depositor_institution_id"), ("FK", "parent_institution_id"),
            ]), Relation("lends", "1", "N")),
            (Entity("FIXED_DEPOSIT", "STUB", [
                ("PK", "deposit_id"), ("FK", "borrower_id"), ("FK", "local_bank_id"),
            ]), Relation("repatriates", "1", "N")),
            (Entity("CURRENT_ACCOUNT", "STUB", [
                ("PK", "account_id"), ("FK", "borrower_id"), ("FK", "local_bank_id"),
            ]), Relation("offers", "1", "N")),
            (Entity("INSURANCE_FUND", "STUB", [
                ("PK", "fund_id"), ("FK", "local_bank_id"),
            ]), Relation("backs", "1", "N")),
            (Entity("SYNDICATE", "STUB", [
                ("PK", "syndicate_id"), ("FK", "lead_institution_id"), ("FK", "borrower_id"),
            ]), Relation("leads", "1", "N")),
        ]),
    ]


def render_page(page_columns: list[Column], rows_layout: list[list[int]], _page_label: str) -> str:
    col_gap = 24
    margin_x = 16
    margin_y = 12
    legend_h = 48

    row_heights = [
        max(column_content_height(page_columns[i]) for i in row_idx)
        for row_idx in rows_layout
    ]
    row_w = 3 * ENTITY_W + 2 * col_gap
    total_w = margin_x * 2 + row_w
    total_h = margin_y + sum(row_heights) + legend_h + 16

    entities: list[PlacedEntity] = []
    connectors: list[PlacedRelationV] = []

    y_cursor = margin_y
    for ri, row_idx in enumerate(rows_layout):
        for ci, col_i in enumerate(row_idx):
            col = page_columns[col_i]
            x = margin_x + ci * (ENTITY_W + col_gap)
            ents, conns, _ = layout_column(x, y_cursor, col)
            entities.extend(ents)
            connectors.extend(conns)
        y_cursor += row_heights[ri] + 6

    parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total_w} {total_h}" '
        f'width="595pt" height="{595 * total_h / total_w:.2f}pt">',
        svg_defs(),
        f'<rect width="{total_w}" height="{total_h}" fill="{WHITE}"/>',
        frame_border(total_w, total_h),
    ]
    parts.append('<g id="entities">')
    parts.extend(draw_entity(e) for e in entities)
    parts.append("</g>")
    parts.append('<g id="connectors">')
    parts.extend(draw_relationship_v(c) for c in connectors)
    parts.append("</g>")
    parts.append(legend_block(total_w, total_h - legend_h))
    parts.append("</svg>")
    return "\n".join(parts)


def main() -> None:
    out_dir = pathlib.Path(__file__).parent
    columns = build_columns()
    pages = [
        ("ERD_diagram_relational_p1", [[0, 1, 2]], "(sheet 1 of 2)"),
        ("ERD_diagram_relational_p2", [[3, 4, 5]], "(sheet 2 of 2)"),
    ]
    for stem, layout, label in pages:
        svg_path = out_dir / f"{stem}.svg"
        svg_path.write_text(render_page(columns, layout, label), encoding="utf-8")
        subprocess.run(
            ["rsvg-convert", "-f", "pdf", "-o", str(out_dir / f"{stem}.pdf"), str(svg_path)],
            check=True,
        )
        print(f"Wrote {stem}.svg/pdf")


if __name__ == "__main__":
    main()
