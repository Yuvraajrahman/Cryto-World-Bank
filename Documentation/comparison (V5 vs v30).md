# Pre-thesis Revision Report: Version 5 → Version 30

**Project:** Crypto World Bank — Pre-thesis 1  
**Authors:** Md. Bokhtiar Rahman Juboraz (20301138), Md. Mahir Ahnaf Ahmed (20301083)  
**Supervisor feedback date:** 6 May 2026  
**Current draft:** `Documentation/2nd Phase (Bokhtiar)/Improvements/v30 in development/Pre-thesis_v30_final.tex`  
**Baseline draft:** `Documentation/Pre-thesis v5 .tex`  
**Report date:** 9 June 2026  

---

## 1. Purpose of This Document

This report summarizes how the pre-thesis manuscript was revised from **Version 5** (May 2026 baseline, shared at the supervisory meeting) to **Version 30** (current consolidated draft). It maps each item from the **6 May 2026 meeting feedback** to concrete additions in the document, and lists further improvements made in the same revision cycle.

We are sharing this summary ahead of the next progress meeting so you can review what was addressed and what remains scoped to the final-thesis implementation phase.

---

## 2. Meeting Feedback (6 May 2026) — Response Summary

| # | Feedback received | Status in v30 | Where addressed |
|---|-------------------|---------------|-----------------|
| 1 | Integrate the **banking concept** more clearly and prominently throughout the report and architecture | **Addressed** | Six core banking functions (Ch. 1); full banking product suite (Ch. 3); deposit mobilization, liquidation, savings, FX, insurance (Ch. 3 & appendices); market/competitive framing as a *banking platform* not only a lending protocol (Ch. 5) |
| 2 | Add missing lists (**figures, tables, abbreviations**) | **Addressed** | Table of Contents, List of Tables, List of Figures; new **List of Formulas** and **List of Abbreviations** (60+ entries); expanded figure/table inventory |
| 3 | Fix **text visibility** issues in tables | **Addressed** | Migration from image-only table PNGs to **native LaTeX tables** with `booktabs`, column width control, `\footnotesize`, ragged-right `p{}` columns, and post-table context notes; appendix tables (e.g. D.1, Appendix C manifest) resized to page width |
| 4 | Add functionality to **lend and fund a group of entities** | **Addressed (design/specification)** | `GroupLendingPool` (retail solidarity / mutual liability); `SyndicatedLoan`, `TranchedPool`, `TreasurySwap`, `NettingEngine` (institutional co-lending/co-funding); multi-entity cross-tier operations (Ch. 3, Conclusion) |
| 5 | Use **standard ER notation** (Crow's Foot or Chen) consistently | **Addressed** | ERD/EER figures and captions explicitly state cardinality, participation, generalization/specialization, weak entities, and aggregation; entity-relationship figures updated (e.g. core ERD, extended ERD, EER model) with consistent relational notation in captions and Chapter 3 data-model prose |
| 6 | Include **descriptions alongside each table** for context | **Addressed** | Context paragraphs after major tables using `\noindent\textit{\small ...}` blocks (market sizing, competitive landscape, governance, ML features, regulatory mapping, etc.); table captions expanded beyond image placeholders |
| 7 | Demonstrate **deeper conceptual understanding** of blockchain, smart contracts, and DeFi | **Addressed** | New **Blockchain, Smart Contract, and DeFi Fundamentals** subsection (Ch. 2); expanded DeFi-vs-banking contrast; EVM execution model, oracle problem, gas/CEI patterns; Chainlink oracle stack; formal contribution statements with scope honesty |
| 8 | **Expand references** beyond IEEE — ACM, Springer, arXiv, DeFi whitepapers | **Addressed** | Bibliography grew from **~55** entries (v5) to **147** entries (v30), spanning ACM, IEEE, Springer, Elsevier, BIS, World Bank, IMF, arXiv, EIP/ERC standards, OWASP, EU MiCA/GENIUS Act, and protocol documentation (Aave, Compound, Chainlink, etc.) |

---

## 3. Document Scale and Structure (v5 vs v30)

| Metric | v5 (May 2026) | v30 (June 2026) |
|--------|---------------|-----------------|
| LaTeX source size | ~1,965 lines | ~5,228 lines |
| PDF length | ~100+ pages (image-heavy) | **219 pages** |
| Main chapters | 6 + Technology Stack + Smart Contract Capabilities | 6 + **3 appendices** + Technology Stack + Smart Contract Capabilities + **Appendices C–E** |
| Database entities | **15** (3NF) | **20** (3NF + agent/session entities) |
| Smart contract modules specified | **3** core contracts | **15** modular contracts (core + banking products + multi-entity) |
| Bibliography entries | **~55** | **147** |
| Native LaTeX tables | Few; most tables were PNG screenshots | **68** structured tables |
| Figures / diagrams | **35** (mostly static PNGs) | **53** (PNG pipeline + PDF/Mermaid/TikZ; resized for readability) |

### New front-matter and appendices in v30

- **List of Formulas** — reserve ratio, health factor, platform solvency ratio, kinked rate model, group-loan share, ML composite score, etc.
- **List of Abbreviations** — DeFi, CBDC, MiCA, SWC, zkKYC, zkAML, ERC-4337, PRISMA, and platform-specific terms.
- **Appendix A:** Database Schema Reference (indexing strategy, functional dependencies).
- **Appendix B:** Optional Agent Harness Reference (MCP tools, prompt tiers, session lineage).
- **Appendix C:** Planned Testnet Deployment Manifest (Polygon zkEVM Cardona).
- **Appendix D:** `WorldBankReserve` Solidity public interface (with design annotations).
- **Appendix E:** Internal industry research corpus (Binance/FTX analysis, actor taxonomy source).

---

## 4. Improvements by Feedback Theme (Detailed)

### 4.1 Banking concept integrated throughout

**v5:** The document primarily framed the system as a *hierarchical DeFi lending prototype* with a four-tier capital flow. Banking functions were implied but not treated as the organizing principle.

**v30:** The platform is explicitly specified as a **hierarchically governed crypto financial services platform** covering:

1. **Deposit mobilization** — `SavingsVault`, `FixedDeposit`, `CurrentAccount` (ERC-4626 / ERC-7540 patterns).  
2. **Credit allocation** — four-tier downward `allocateCapital` + `SyndicatedLoan` for large exposures.  
3. **Payment and settlement** — installment engine, P2P/remittance and merchant checkout (Future Work, Ch. 6).  
4. **Risk intermediation** — ML fraud/AML pipeline, liquidation engine, insurance fund, Credit Passport SBT.  
5. **Liquidity management** — `InterBankLendingPool`, `UpwardDepositFacility`, reserve-ratio gates at every tier.  
6. **Ancillary services** — FX module, group lending, ZKP identity/compliance stack.

Additional banking-aligned content:

- **Stablecoin-first retail lending** (USDC/USDT) as a design requirement, with MiCA / GENIUS Act justification.  
- **Kinked utilization rate model** (Compound/Aave pattern) for pool economics.  
- **Liquidation engine** with health-factor monitoring and third-party liquidator incentives.  
- **Revenue and feasibility** reframed around tier interest spreads, not token speculation (Ch. 5).  
- **CEX vs CWB** comparison clarifying the system is a *lending bank*, not an exchange (Ch. 5).

---

### 4.2 Lists of figures, tables, and abbreviations

**v5:** Table of Contents, List of Tables, and List of Figures only. No dedicated abbreviation or formula list.

**v30:**

- **List of Tables** — 90+ numbered entries (including appendix tables).  
- **List of Figures** — 50+ entries across architecture, ER diagrams, activity/sequence diagrams, ML pipeline, and market analysis.  
- **List of Abbreviations** — standalone chapter in TOC.  
- **List of Formulas** — standalone chapter with named banking/ML formulas cross-referenced to sections.

---

### 4.3 Table visibility and readability

**v5:** Many tables were embedded as **full-page PNG screenshots** (`\TableImageMaxFit{...}`) with minimal or no typeset caption text, which caused:

- Small or clipped text when scaled to fit the page.  
- Inconsistent fonts relative to body text.  
- No wrapping for long cell content.

**v30:**

- Priority tables rebuilt as **native LaTeX** with `booktabs`, header shading, and controlled column widths.  
- Post-table **interpretive notes** (e.g. “This table quantifies demand-side context…”).  
- Recent layout fixes for overflow tables (e.g. Appendix E Table D.1, Appendix C deployment manifest).  
- Diagram resize passes (e.g. Figures 3.10, 4.9) for legibility in the PDF.

---

### 4.4 Group lending and group funding (multi-entity)

**v5:** Multi-directional *interbank* flows were described narratively; **no** formal group co-borrowing or syndicated co-lending contracts.

**v30:** Full **multi-entity operations** specification (Contribution 2 + Ch. 3 §multi-entity):

| Mechanism | Purpose |
|-----------|---------|
| **`GroupLendingPool`** | 3–20 retail clients; pooled collateral; mutual liability; over-indebtedness controls |
| **`SyndicatedLoan`** | Multiple banks co-fund one exposure; subscription window; pro-rata interest/recovery |
| **`TranchedPool`** | Senior/junior tranching for risk-segmented capital |
| **`InterBankLendingPool`** | Same-tier short-term liquidity (National↔National, Local↔Local) |
| **`UpwardDepositFacility`** | Surplus reserve repatriation upward with yield spread |
| **`TreasurySwap` / `NettingEngine`** | Cross-tier asset exchange and multilateral obligation netting |

Use-case diagrams, sequence flows, and activity diagrams were added for group lending lifecycle, syndication, and nine-actor taxonomy.

---

### 4.5 ER diagram notation (Crow's Foot / Chen)

**v5:** ERD and EER figures existed as PNGs; captions mentioned cardinality but **entity tables and relationship notation were image-dependent**.

**v30:**

- Core ERD, extended ERD (banking products), and EER diagrams **replaced/updated** with figures that match the 20-entity schema.  
- Captions and prose reference **Crow's-foot cardinality**, weak entities, specialization/generalization, and aggregation explicitly.  
- **Functional dependency table** and **integrity constraints table** document keys and referential rules in text.  
- Entity summary split into readable multi-part tables (Ch. 3) instead of a single unreadable PNG.

---

### 4.6 Table descriptions and interpretive context

**v5:** Several tables ended immediately after a PNG (`\TableScreenshotEnd`) with no explanatory paragraph.

**v30:** Standard pattern after major tables:

```latex
\noindent\textit{\small This table [explains purpose, scope, and how to read the rows]...}
```

Applied across market sizing, customer segments, partner ecosystem, competitive landscape (3 parts), risk taxonomy, feasibility, revenue, governance matrices, ML feature mapping, MiCA compliance mapping, and database appendices.

---

### 4.7 Deeper blockchain, smart contract, and DeFi exposition

**v5:** Definitions appeared briefly in the literature review (hang-indent paragraphs). Limited treatment of EVM mechanics, oracle trust, or formal security patterns.

**v30 additions:**

- **§Blockchain Fundamentals** — append-only ledger, PoS finality assumptions, EVM opcode/gas model (Yellow Paper reference).  
- **Oracle problem** — Beniiche/Pasdar framing; Chainlink Functions DON; commit-reveal fallback; cost/latency analysis.  
- **Smart contract security** — CEI pattern, `nonReentrant`, SWC mapping, five-layer defense-in-depth, Foundry/Certora verification plan.  
- **DeFi vs banking** — explicit contrast with flat-pool protocols (Aave, Compound, Morpho, Maple, Goldfinch).  
- **Compliance stack** — zkKYC + zkAML + W3C DID/VC; ERC-4337 retail onboarding; EU AI Act alignment for ML explainability.  
- **PRISMA-style literature methodology** (Ch. 2) with inclusion criteria and top-10 evidence table.  
- **Scope honesty** — contributions labeled *specified* vs *implemented*; Minimum Viable Thesis (MVT) checklist separates Must / Stretch / Future Work.

---

### 4.8 Expanded reference base

**v5 (~55 sources):** Strong IEEE presence; limited institutional and standards coverage.

**v30 (147 sources)** — examples of new categories:

| Category | Examples added |
|----------|----------------|
| **ACM** | AFT proceedings (Bastankhah et al.), FMBC verification benchmarking |
| **Springer / Elsevier** | Financial inclusion, microfinance, retail payments, operational research |
| **arXiv** | DeFi fraud GNN, prompt-injection security, federated fraud, GraphSAGE |
| **Standards & EIPs** | ERC-4626, ERC-7540, ERC-3643, ERC-4337, EIP-7702, W3C DID/VC |
| **Policy / regulation** | EU MiCA, EU AI Act, US GENIUS Act, FATF guidance, Bangladesh Bank publications |
| **Institutional** | BIS (WP 905, mBridge, Agora), World Bank WDR/Findex, IMF CBDC, Sygnum institutional DeFi |
| **DeFi / protocol docs** | Aave v3 technical paper, Compound, Chainlink, DefiLlama, Morpho network data |
| **Datasets** | BCCC-DeFiFraudTrans-2025, Elliptic Bitcoin dataset |
| **Internal research** | Binance/FTX comparative analysis (Appendix E; bib [128]–[130]) |

Literature review reorganized into **themed synthesis tables** (Parts A–F) plus protocol comparison on 11 architectural dimensions.

---

---

## 9. Closing Note

All eight action items from the **6 May 2026** meeting have been addressed in the v30 manuscript at the **documentation and design** level. The revision substantially expands banking semantics, multi-entity lending/funding, academic rigor, and presentation quality relative to v5. We welcome your guidance on any sections that should be prioritized for further tightening before the final-thesis implementation phase.

---

*Prepared for supervisory review — Crypto World Bank Pre-thesis 1.*
