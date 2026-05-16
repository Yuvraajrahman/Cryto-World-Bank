#!/usr/bin/env python3
"""Pre-thesis 1 content pass: design-phase tone + geo generalization."""
from pathlib import Path

TEX = Path(__file__).resolve().parents[1] / "Pre-thesis_v11.tex"

REPLACEMENTS = [
    (
        "Here we present \\textit{Crypto World Bank}, a prototype framework that models",
        "Here we present \\textit{Crypto World Bank}, a proposed architecture that models",
    ),
    (
        "We show that hierarchical capital flows",
        "We specify how hierarchical capital flows",
    ),
    (
        "The Crypto World Bank implements a complete institutional banking architecture",
        "The Crypto World Bank is designed as a complete institutional banking architecture",
    ),
    (
        "demonstrating that a complete, hierarchically governed banking institution can be implemented on open blockchain infrastructure.",
        "demonstrating how a complete, hierarchically governed banking institution may be realized on open blockchain infrastructure.",
    ),
    (
        "The Crypto World Bank is not a lending protocol. It is a complete institutional banking architecture implemented on programmable blockchain infrastructure.",
        "The Crypto World Bank is not a lending protocol. It is a complete institutional banking architecture specified for implementation on programmable blockchain infrastructure.",
    ),
    (
        "The platform implements a group lending module",
        "The platform is designed to implement a group lending module",
    ),
    (
        "The current prototype implements three core contracts",
        "The target prototype is designed around three core contracts",
    ),
    (
        "The current prototype fully implements the downward capital distribution",
        "The design fully specifies downward capital distribution",
    ),
    (
        "The current prototype fully implements the Tier~1 World Bank Reserve contract and the lending request/approval workflow",
        "The design specifies the Tier~1 World Bank Reserve contract and the lending request/approval workflow",
    ),
    (
        "This architecture is specifically applied to a developing-economy (Bangladesh) context with wallet-based identity primitives",
        "This architecture is specified for developing-economy deployment contexts with wallet-based identity primitives",
    ),
    (
        "In Bangladesh, where roughly 40\\% of adults lack access to formal banking services~[54], a mobile-accessible",
        "In developing economies where large populations lack access to formal banking services~[14], a mobile-accessible",
    ),
    (
        "Designed for Bangladesh, Southeast Asia, Sub-Saharan Africa",
        "Designed for developing economies (Southeast Asia, Sub-Saharan Africa, and similar markets)",
    ),
    (
        "Developing-economy focus & \\tmarkNo{} & \\tmarkNo{} & \\tmarkNo{} & \\tmarkNo{} & \\tmarkDone{} & \\tmarkDone{} Bangladesh",
        "Developing-economy focus & \\tmarkNo{} & \\tmarkNo{} & \\tmarkNo{} & \\tmarkNo{} & \\tmarkDone{} & \\tmarkPlanned{} Designed",
    ),
    (
        "e.g., Bangladesh, Southeast Asia, Sub-Saharan Africa",
        "e.g., Southeast Asia, Sub-Saharan Africa, and other underserved markets",
    ),
    (
        "The group lending module is directly inspired by the solidarity group model developed by BRAC, the organization whose name this university bears. BRAC's group lending program, operating across Bangladesh and subsequently 11 other countries, demonstrates",
        "The group lending module is inspired by solidarity group models documented in microfinance literature (e.g., Grameen Bank and BRAC programs). These programs, operating across multiple developing countries, demonstrate",
    ),
    (
        "the mutual liability that BRAC enforces through field officer visits and weekly group meetings is enforced",
        "the mutual liability traditionally enforced through field visits and group meetings is specified to be enforced",
    ),
    (
        "A borrower in rural Bangladesh who takes a loan denominated in ETH",
        "A retail borrower in a developing economy who takes a loan denominated in ETH",
    ),
    (
        "doubles in taka terms",
        "doubles in local currency terms",
    ),
    (
        "With a working prototype, a defined market and partnership plan",
        "With a specified architecture and partial testnet scaffold, a defined market and partnership plan",
    ),
    (
        "the complete system design is fully specified in this report and will be implemented and validated in the final thesis phase.",
        "the complete system design is fully specified in this report; implementation and validation are planned for subsequent thesis phases.",
    ),
]


def main() -> None:
    text = TEX.read_text(encoding="utf-8")
    count = 0
    for old, new in REPLACEMENTS:
        if old in text:
            text = text.replace(old, new)
            count += 1
    TEX.write_text(text, encoding="utf-8")
    print(f"Applied {count}/{len(REPLACEMENTS)} replacements to {TEX.name}")


if __name__ == "__main__":
    main()
