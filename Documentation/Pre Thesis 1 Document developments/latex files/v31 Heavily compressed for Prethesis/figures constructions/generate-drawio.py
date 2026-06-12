#!/usr/bin/env python3
"""Generate editable draw.io (diagrams.net) files for ERD, EER, and normalization diagrams."""

from __future__ import annotations

import html
import textwrap
from pathlib import Path

OUT = Path(__file__).resolve().parent


def esc(s: str) -> str:
    return html.escape(s, quote=True)


def entity_cell(
    cid: str,
    x: int,
    y: int,
    w: int,
    title: str,
    lines: list[str],
    *,
    weak: bool = False,
    fill: str = "#dae8fc",
    stroke: str = "#6c8ebf",
) -> str:
    dash = "dashed=1;dashPattern=8 8;" if weak else ""
    body = "<br/>".join(esc(line) for line in lines)
    value = (
        f"<b>{esc(title)}</b><hr size='1'/>"
        f"<div style='text-align:left;font-size:11px;'>{body}</div>"
    )
    return f"""    <mxCell id="{cid}" value="{value}" style="rounded=0;whiteSpace=wrap;html=1;{dash}fillColor={fill};strokeColor={stroke};align=center;verticalAlign=top;spacingTop=4;fontSize=12;" vertex="1" parent="1">
      <mxGeometry x="{x}" y="{y}" width="{w}" height="{max(72, 28 + len(lines) * 16)}" as="geometry"/>
    </mxCell>"""


def note_cell(cid: str, x: int, y: int, w: int, h: int, text: str, fill: str = "#fff2cc", stroke: str = "#d6b656") -> str:
    return f"""    <mxCell id="{cid}" value="{esc(text)}" style="shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;fillColor={fill};strokeColor={stroke};align=left;verticalAlign=top;spacingLeft=8;fontSize=11;" vertex="1" parent="1">
      <mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/>
    </mxCell>"""


def edge(cid: str, src: str, tgt: str, label: str = "", style: str = "") -> str:
    lbl = f'value="{esc(label)}"' if label else 'value=""'
    base = "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=ERmany;startArrow=ERone;endFill=0;startFill=0;"
    return f"""    <mxCell id="{cid}" {lbl} style="{base}{style}" edge="1" parent="1" source="{src}" target="{tgt}">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>"""


def wrap_drawio(diagram_name: str, diagram_id: str, cells: list[str]) -> str:
    inner = "\n".join(cells)
    return textwrap.dedent(
        f"""\
        <mxfile host="app.diagrams.net" modified="2026-06-12" agent="generate-drawio.py" version="22.1.0" type="device">
          <diagram name="{esc(diagram_name)}" id="{diagram_id}">
            <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1200" math="0" shadow="0">
              <root>
                <mxCell id="0"/>
                <mxCell id="1" parent="0"/>
        {inner}
              </root>
            </mxGraphModel>
          </diagram>
        </mxfile>
        """
    )


def multi_page_drawio(pages: list[tuple[str, str, list[str]]]) -> str:
    parts = [
        '<mxfile host="app.diagrams.net" modified="2026-06-12" agent="generate-drawio.py" version="22.1.0" type="device">'
    ]
    for name, did, cells in pages:
        inner = "\n".join(cells)
        parts.append(f'  <diagram name="{esc(name)}" id="{did}">')
        parts.append(
            '    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1200" math="0" shadow="0">'
        )
        parts.append("      <root>")
        parts.append('        <mxCell id="0"/>')
        parts.append('        <mxCell id="1" parent="0"/>')
        parts.append(inner)
        parts.append("      </root>")
        parts.append("    </mxGraphModel>")
        parts.append("  </diagram>")
    parts.append("</mxfile>")
    return "\n".join(parts) + "\n"


def build_core_erd() -> list[str]:
    cells: list[str] = []
    cells.append(
        note_cell(
            "n0",
            20,
            20,
            520,
            100,
            "Core ERD (20 PostgreSQL entities) — drag any box to rearrange. "
            "Open in diagrams.net or VS Code Draw.io extension. "
            "Dashed border = weak entity (INSTALLMENT).",
        )
    )

    entities: dict[str, dict] = {
        "wb": {"title": "WORLD_BANK", "x": 40, "y": 160, "w": 200, "lines": ["world_bank_id PK", "name UK", "reserve_ratio", "interest_rate_tier_id FK"]},
        "nb": {"title": "NATIONAL_BANK", "x": 300, "y": 160, "w": 220, "lines": ["national_bank_id PK", "world_bank_id FK", "name", "country", "allocated_capital"]},
        "lb": {"title": "LOCAL_BANK", "x": 580, "y": 160, "w": 220, "lines": ["local_bank_id PK", "national_bank_id FK", "name", "city", "pool_balance"]},
        "bu": {"title": "BANK_USER", "x": 300, "y": 360, "w": 220, "lines": ["bank_user_id PK", "wallet UK", "bank_type", "national_bank_id FK", "local_bank_id FK", "role"]},
        "br": {"title": "BORROWER", "x": 860, "y": 360, "w": 220, "lines": ["borrower_id PK", "wallet UK", "local_bank_id FK", "kyc_level", "tier"]},
        "lr": {"title": "LOAN_REQUEST", "x": 620, "y": 560, "w": 230, "lines": ["request_id PK", "borrower_id FK", "local_bank_id FK", "amount", "status", "approved_by FK"]},
        "ln": {"title": "LOAN", "x": 900, "y": 560, "w": 220, "lines": ["loan_id PK", "loan_request_id FK UK", "principal", "collateral_asset_id FK", "loan_asset_id FK", "status"]},
        "in": {"title": "INSTALLMENT", "x": 900, "y": 760, "w": 220, "lines": ["loan_id FK (PK part)", "installment_number PK", "amount_due", "due_date", "status"], "weak": True, "fill": "#e1d5e7", "stroke": "#9673a6"},
        "tx": {"title": "TRANSACTION", "x": 620, "y": 760, "w": 220, "lines": ["transaction_id PK", "borrower_id FK", "related_loan_id FK", "amount", "transaction_date"]},
        "bl": {"title": "BORROWING_LIMIT", "x": 1140, "y": 360, "w": 220, "lines": ["limit_id PK", "borrower_id FK UK", "six_month_remaining*", "one_year_remaining*"]},
        "ip": {"title": "INCOME_PROOF", "x": 1140, "y": 560, "w": 220, "lines": ["proof_id PK", "borrower_id FK", "file_hash", "status"]},
        "cm": {"title": "CHAT_MESSAGE", "x": 400, "y": 760, "w": 220, "lines": ["message_id PK", "loan_request_id FK", "sender_id", "body"]},
        "ml": {"title": "AI_ML_SECURITY_LOG", "x": 180, "y": 560, "w": 240, "lines": ["security_log_id PK", "loan_id FK", "transaction_id FK", "risk_score", "explanation JSON"]},
        "md": {"title": "MARKET_DATA", "x": 40, "y": 560, "w": 200, "lines": ["market_data_id PK", "symbol", "price_usd", "source", "recorded_at"]},
        "ps": {"title": "PROFILE_SETTING", "x": 1140, "y": 160, "w": 220, "lines": ["profile_id PK", "client_id FK UK", "display_currency", "preferences JSON"]},
        "ss": {"title": "SESSIONS", "x": 40, "y": 360, "w": 200, "lines": ["session_id PK", "borrower_id FK", "session_key_scope JSON", "parent_session_id FK"]},
        "al": {"title": "AGENT_ACTION_LOG", "x": 40, "y": 760, "w": 220, "lines": ["action_id PK", "session_id FK", "tool_name", "tx_hash", "INSERT-only RLS"]},
        "rt": {"title": "INTEREST_RATE_TIER", "x": 40, "y": 960, "w": 220, "lines": ["tier_id PK", "base_rate", "kink_utilisation", "rate_above_kink"]},
        "as": {"title": "ASSETS", "x": 300, "y": 960, "w": 200, "lines": ["asset_id PK", "symbol UK", "decimals", "oracle_feed_address"]},
        "cb": {"title": "AI_CHATBOT_LOG", "x": 580, "y": 960, "w": 220, "lines": ["log_id PK", "user_wallet", "question", "response", "intent"]},
        "cp": {"title": "CREDIT_PASSPORT", "x": 860, "y": 160, "w": 220, "lines": ["on-chain SBT (optional mirror)", "credit_score", "risk_tier", "open_loans"], "fill": "#f8cecc", "stroke": "#b85450"},
    }

    eid = 10
    idmap: dict[str, str] = {}
    for key, spec in entities.items():
        cid = f"e{eid}"
        idmap[key] = cid
        eid += 1
        kw = {k: spec[k] for k in ("weak", "fill", "stroke") if k in spec}
        cells.append(entity_cell(cid, spec["x"], spec["y"], spec["w"], spec["title"], spec["lines"], **kw))

    links = [
        ("e1", "wb", "nb", "1:N registers"),
        ("e2", "nb", "lb", "1:N registers"),
        ("e3", "lb", "bu", "1:N employs"),
        ("e4", "lb", "br", "1:N onboards"),
        ("e5", "br", "lr", "1:N submits"),
        ("e6", "bu", "lr", "1:N approves"),
        ("e7", "lr", "ln", "1:1 produces"),
        ("e8", "ln", "in", "1:N schedules"),
        ("e9", "br", "bl", "1:1"),
        ("e10", "br", "ip", "1:N"),
        ("e11", "br", "tx", "1:N"),
        ("e12", "ln", "tx", "1:N"),
        ("e13", "lr", "cm", "1:N"),
        ("e14", "ln", "ml", "1:N"),
        ("e15", "br", "ss", "1:N"),
        ("e16", "ss", "al", "1:N"),
        ("e17", "wb", "rt", "uses"),
        ("e18", "ln", "as", "collateral/loan asset"),
        ("e19", "br", "ps", "1:1"),
        ("e20", "br", "cp", "0:1 holds"),
    ]
    for i, (_, src, tgt, lbl) in enumerate(links, start=100):
        cells.append(edge(f"r{i}", idmap[src], idmap[tgt], lbl))

    return cells


def build_extended_erd() -> list[str]:
    cells: list[str] = []
    cells.append(
        note_cell(
            "n0",
            20,
            20,
            560,
            110,
            "Extended ERD (14 entities, Phase II–III). "
            "Draw dashed FK lines to Core ERD: BORROWER, LOCAL_BANK, NATIONAL_BANK, LOAN, ASSETS. "
            "Include LOCAL→NATIONAL and NATIONAL→WORLD upward deposits.",
        )
    )

    specs: list[dict] = [
        {"key": "sa", "title": "SAVINGS_ACCOUNT", "x": 40, "y": 180, "lines": ["account_id PK", "borrower_id FK", "balance", "yield_bps", "≡ SavingsVault"]},
        {"key": "fd", "title": "FIXED_DEPOSIT", "x": 40, "y": 380, "lines": ["deposit_id PK", "borrower_id FK", "principal", "term_days", "apy_bps", "≡ FixedDeposit"]},
        {"key": "ca", "title": "CURRENT_ACCOUNT", "x": 40, "y": 600, "lines": ["account_id PK", "borrower_id FK", "balance", "≡ CurrentAccount"]},
        {"key": "lg", "title": "LOAN_GROUP", "x": 320, "y": 180, "lines": ["group_id PK", "local_bank_id FK", "shared_collateral", "≡ GroupLendingPool"]},
        {"key": "gm", "title": "GROUP_MEMBER", "x": 320, "y": 380, "lines": ["group_id FK (PK)", "borrower_id FK (PK)", "consent_sig"]},
        {"key": "ifn", "title": "INSURANCE_FUND", "x": 320, "y": 600, "lines": ["fund_id PK", "local_bank_id FK UK", "balance", "premium_bps"]},
        {"key": "ibl", "title": "INTERBANK_LOAN", "x": 600, "y": 180, "lines": ["loan_id PK", "tier", "lender_bank_id FK", "borrower_bank_id FK", "rate_bps", "≡ IBLP"]},
        {"key": "upd", "title": "UPWARD_DEPOSIT", "x": 600, "y": 380, "lines": ["deposit_id PK", "depositing_bank_id FK", "parent_bank_id FK", "principal", "yield_owed"]},
        {"key": "syn", "title": "SYNDICATE", "x": 880, "y": 180, "lines": ["syndicate_id PK", "lead_arranger_id FK", "borrower_id FK", "loan_id FK", "total_amount"]},
        {"key": "sym", "title": "SYNDICATE_MEMBER", "x": 880, "y": 380, "lines": ["syndicate_id FK (PK)", "lender_bank_id FK (PK)", "share_bps"]},
        {"key": "tp", "title": "TRANCHED_POOL", "x": 1160, "y": 180, "lines": ["pool_id PK", "local_bank_id FK", "borrower_id FK", "loan_id FK", "senior/junior principal"]},
        {"key": "ts", "title": "TREASURY_SWAP", "x": 1160, "y": 380, "lines": ["swap_id PK", "bank_id FK", "asset_from_id FK", "asset_to_id FK", "oracle_reading"]},
        {"key": "nb", "title": "NETTING_BATCH", "x": 600, "y": 600, "lines": ["batch_id PK", "tier", "coordinator_id FK", "batch_root Merkle"]},
        {"key": "ne", "title": "NETTING_ENTRY", "x": 880, "y": 600, "lines": ["batch_id FK (PK)", "src_bank_id FK", "dst_bank_id FK", "net_amount"]},
        {"key": "core", "title": "CORE REFERENCES", "x": 1160, "y": 600, "lines": ["BORROWER", "LOCAL_BANK", "NATIONAL_BANK", "WORLD_BANK", "LOAN", "ASSETS"], "fill": "#f5f5f5", "stroke": "#666666"},
    ]

    idmap: dict[str, str] = {}
    eid = 10
    for spec in specs:
        key = spec["key"]
        cid = f"e{eid}"
        idmap[key] = cid
        eid += 1
        fill = spec.get("fill", "#d5e8d4")
        stroke = spec.get("stroke", "#82b366")
        cells.append(entity_cell(cid, spec["x"], spec["y"], 230, spec["title"], spec["lines"], fill=fill, stroke=stroke))

    ext_links = [
        ("sa", "core", "borrower"),
        ("fd", "core", "borrower"),
        ("ca", "core", "borrower"),
        ("lg", "core", "local bank"),
        ("gm", "core", "borrower+group"),
        ("ifn", "core", "local bank"),
        ("ibl", "core", "banks"),
        ("upd", "core", "bank hierarchy"),
        ("syn", "core", "borrower+loan"),
        ("sym", "core", "banks"),
        ("tp", "core", "loan"),
        ("ts", "core", "assets"),
        ("nb", "core", "coordinator"),
        ("ne", "nb", "contains"),
    ]
    for i, (src, tgt, lbl) in enumerate(ext_links, start=100):
        cells.append(edge(f"r{i}", idmap[src], idmap[tgt], lbl))

    return cells


def build_eer() -> list[str]:
    cells: list[str] = []
    cells.append(
        note_cell(
            "n0",
            20,
            20,
            600,
            90,
            "EER overlay — specialization (BANK_USER), weak entity (INSTALLMENT), "
            "multi-valued (INCOME_PROOF), aggregation (AI_ML_SECURITY_LOG), participation constraints.",
        )
    )

    cells.append(
        entity_cell(
            "e10",
            80,
            160,
            240,
            "BANK_USER (superclass)",
            ["bank_user_id PK", "wallet UK", "bank_type discriminator"],
        )
    )
    for i, (title, x) in enumerate(
        [("NationalBankAdmin", 40), ("LocalBankAdmin", 300), ("Approver", 560)], start=11
    ):
        cells.append(
            entity_cell(
                f"e{i}",
                x,
                340,
                200,
                title,
                ["subtype of BANK_USER", "disjoint + total"],
                fill="#ffe6cc",
                stroke="#d79b00",
            )
        )
        cells.append(edge(f"r{i}", "e10", f"e{i}", "d"))

    cells.append(
        entity_cell(
            "e20",
            820,
            160,
            220,
            "LOAN",
            ["loan_id PK", "strong entity"],
        )
    )
    cells.append(
        entity_cell(
            "e21",
            820,
            360,
            220,
            "INSTALLMENT",
            ["weak entity", "PK: (loan_id, installment_number)", "identifying rel."],
            weak=True,
            fill="#e1d5e7",
            stroke="#9673a6",
        )
    )
    cells.append(edge("r20", "e20", "e21", "1:N identifying"))

    cells.append(
        entity_cell("e30", 1080, 160, 220, "BORROWER", ["borrower_id PK"])
    )
    cells.append(
        entity_cell(
            "e31",
            1080,
            360,
            220,
            "{INCOME_PROOF}",
            ["multi-valued → separate table", "1NF compliance"],
            fill="#fff2cc",
            stroke="#d6b656",
        )
    )
    cells.append(edge("r30", "e30", "e31", "1:N"))

    cells.append(
        entity_cell("e40", 80, 560, 200, "BORROWER", ["participant"])
    )
    cells.append(
        entity_cell("e41", 320, 560, 200, "LOAN_REQUEST", ["association entity"])
    )
    cells.append(
        entity_cell("e42", 560, 560, 200, "LOCAL_BANK", ["participant"])
    )
    cells.append(
        entity_cell(
            "e43",
            800,
            540,
            260,
            "LOAN-CENTRIC aggregation",
            ["CHAT_MESSAGE", "AI_ML_SECURITY_LOG", "TRANSACTION"],
            fill="#f8cecc",
            stroke="#b85450",
        )
    )
    cells.append(edge("r40", "e40", "e41"))
    cells.append(edge("r41", "e42", "e41"))
    cells.append(edge("r42", "e41", "e43", "aggregates"))

    cells.append(
        entity_cell("e50", 80, 780, 200, "LOAN_REQUEST", [])
    )
    cells.append(
        entity_cell("e51", 320, 780, 200, "LOAN", [])
    )
    cells.append(edge("r50", "e50", "e51", "total 1:1"))

    cells.append(
        entity_cell("e52", 560, 780, 200, "BORROWER", [])
    )
    cells.append(
        entity_cell("e53", 800, 780, 220, "CREDIT_PASSPORT", ["SBT 0:1 partial"])
    )
    cells.append(edge("r51", "e52", "e53", "partial"))

    return cells


def norm_page_unnormalized() -> list[str]:
    cells = [
        note_cell(
            "n0",
            20,
            20,
            700,
            120,
            "0NF / Unnormalized (violations to fix)\n"
            "• Repeating group: multiple income proofs embedded in one BORROWER row\n"
            "• Repeating group: installment schedule columns duplicated in LOAN\n"
            "• Transitive dependency: interest-rate parameters stored inside each bank row",
        ),
        entity_cell(
            "e1",
            60,
            180,
            520,
            "BORROWER (unnormalized)",
            [
                "borrower_id",
                "wallet",
                "name",
                "income_proof_1_hash, income_proof_2_hash, …  ← repeating",
                "income_proof_1_status, income_proof_2_status, …",
            ],
            fill="#f8cecc",
            stroke="#b85450",
        ),
        entity_cell(
            "e2",
            60,
            420,
            520,
            "LOAN (unnormalized)",
            [
                "loan_id",
                "principal",
                "inst_1_due, inst_1_amount, inst_2_due, inst_2_amount, …  ← repeating",
            ],
            fill="#f8cecc",
            stroke="#b85450",
        ),
        entity_cell(
            "e3",
            640,
            180,
            480,
            "LOCAL_BANK (unnormalized)",
            [
                "local_bank_id",
                "name",
                "base_rate, kink_util, rate_above_kink  ← transitive via tier",
            ],
            fill="#f8cecc",
            stroke="#b85450",
        ),
    ]
    return cells


def norm_page_1nf() -> list[str]:
    cells = [
        note_cell(
            "n0",
            20,
            20,
            720,
            100,
            "1NF — Atomic values; no repeating groups\n"
            "Fix: extract INCOME_PROOF and INSTALLMENT into separate relations.\n"
            "Rule: every attribute holds a single atomic value per row.",
        ),
        entity_cell("e1", 60, 160, 240, "BORROWER", ["borrower_id PK", "wallet UK", "name", "kyc_level"]),
        entity_cell(
            "e2",
            360,
            160,
            260,
            "INCOME_PROOF",
            ["proof_id PK", "borrower_id FK", "file_hash", "status", "one row per document"],
            fill="#d5e8d4",
            stroke="#82b366",
        ),
        entity_cell("e3", 680, 160, 240, "LOAN", ["loan_id PK", "borrower_id FK", "principal", "status"]),
        entity_cell(
            "e4",
            680,
            360,
            260,
            "INSTALLMENT",
            ["loan_id FK", "installment_number", "amount_due", "due_date", "one row per installment"],
            fill="#d5e8d4",
            stroke="#82b366",
        ),
        edge("r1", "e1", "e2", "1:N"),
        edge("r2", "e3", "e4", "1:N"),
        note_cell(
            "n1",
            60,
            420,
            560,
            100,
            "Functional dependency example:\n"
            "borrower_id → name, wallet, kyc_level\n"
            "proof_id → borrower_id, file_hash, status",
            fill="#e1d5e7",
            stroke="#9673a6",
        ),
    ]
    return cells


def norm_page_2nf() -> list[str]:
    cells = [
        note_cell(
            "n0",
            20,
            20,
            760,
            110,
            "2NF — No partial dependencies on a composite key\n"
            "INSTALLMENT composite PK: (loan_id, installment_number)\n"
            "All non-key attributes must depend on the FULL key, not just loan_id.",
        ),
        entity_cell(
            "e1",
            80,
            180,
            300,
            "LOAN",
            ["loan_id PK", "borrower_id FK", "principal", "apr_bps", "term_months"],
        ),
        entity_cell(
            "e2",
            460,
            180,
            320,
            "INSTALLMENT ✓ 2NF",
            [
                "PK: (loan_id, installment_number)",
                "amount_due → full key",
                "due_date → full key",
                "NOT: borrower_name → loan_id only ✗",
            ],
            weak=True,
            fill="#d5e8d4",
            stroke="#82b366",
        ),
        entity_cell(
            "e3",
            80,
            420,
            360,
            "VIOLATION example (remove this)",
            [
                "PK: (loan_id, installment_number)",
                "borrower_wallet → depends only on loan_id ✗ partial",
                "local_bank_city → depends only on loan_id ✗ partial",
            ],
            fill="#f8cecc",
            stroke="#b85450",
        ),
        entity_cell(
            "e4",
            500,
            420,
            360,
            "2NF fix",
            [
                "Move borrower_wallet to LOAN or BORROWER",
                "Move local_bank_city to LOCAL_BANK",
                "Keep only installment-specific attrs on INSTALLMENT",
            ],
            fill="#fff2cc",
            stroke="#d6b656",
        ),
        edge("r1", "e1", "e2", "1:N"),
    ]
    return cells


def norm_page_3nf() -> list[str]:
    cells = [
        note_cell(
            "n0",
            20,
            20,
            780,
            110,
            "3NF — No transitive dependencies\n"
            "Violation: bank_tier → rate parameters stored inside bank rows\n"
            "Fix: INTEREST_RATE_TIER(tier_id) referenced by bank entities.",
        ),
        entity_cell(
            "e1",
            60,
            180,
            340,
            "BEFORE (not 3NF)",
            [
                "local_bank_id → name, city",
                "local_bank_id → base_rate, kink_util  ✗ transitive",
                "(tier determines rates, not local_bank_id directly)",
            ],
            fill="#f8cecc",
            stroke="#b85450",
        ),
        entity_cell(
            "e2",
            460,
            180,
            280,
            "INTEREST_RATE_TIER",
            [
                "tier_id PK",
                "base_rate",
                "kink_utilisation",
                "rate_above_kink",
                "max_rate",
            ],
            fill="#d5e8d4",
            stroke="#82b366",
        ),
        entity_cell(
            "e3",
            60,
            420,
            300,
            "WORLD_BANK",
            ["world_bank_id PK", "interest_rate_tier_id FK"],
        ),
        entity_cell(
            "e4",
            400,
            420,
            300,
            "NATIONAL_BANK",
            ["national_bank_id PK", "interest_rate_tier_id FK"],
        ),
        entity_cell(
            "e5",
            740,
            420,
            280,
            "LOCAL_BANK",
            ["local_bank_id PK", "interest_rate_tier_id FK"],
        ),
        edge("r1", "e2", "e3", "FK"),
        edge("r2", "e2", "e4", "FK"),
        edge("r3", "e2", "e5", "FK"),
        note_cell(
            "n1",
            60,
            600,
            700,
            120,
            "Additional 3NF rules in CWB schema:\n"
            "• BORROWING_LIMIT.six_month_remaining derived from TRANSACTION — store limit_id→borrower_id only; compute at query time\n"
            "• BCNF: BANK_USER bank_type CHECK — determinant is candidate key",
            fill="#e1d5e7",
            stroke="#9673a6",
        ),
    ]
    return cells


def main() -> None:
    (OUT / "erd-core-improved.drawio").write_text(
        wrap_drawio("Core ERD", "erd-core", build_core_erd()), encoding="utf-8"
    )
    (OUT / "erd-extended-improved.drawio").write_text(
        wrap_drawio("Extended ERD", "erd-ext", build_extended_erd()), encoding="utf-8"
    )
    (OUT / "eer-improved.drawio").write_text(
        wrap_drawio("EER Model", "eer", build_eer()), encoding="utf-8"
    )
    (OUT / "normalization-1nf-2nf-3nf.drawio").write_text(
        multi_page_drawio(
            [
                ("0NF Problems", "nf0", norm_page_unnormalized()),
                ("1NF", "nf1", norm_page_1nf()),
                ("2NF", "nf2", norm_page_2nf()),
                ("3NF", "nf3", norm_page_3nf()),
            ]
        ),
        encoding="utf-8",
    )
    print("Wrote draw.io files to", OUT)


if __name__ == "__main__":
    main()
