# Crypto World Bank — Database Figure Specification

Single reference for generating **six thesis figures**: **0NF**, **1NF**, **2NF**, **3NF**, **EER**, and **ERD**.

Project: *Crypto World Bank* — four-tier hierarchical blockchain banking platform (World Bank → National Bank → Local Bank → Client). PostgreSQL schema in Third Normal Form (3NF).

---

## 1. Global visual style

### Color theme (strict monochrome)

| Role | Color | Use |
|------|-------|-----|
| Background | White `#FFFFFF` | Page and empty space |
| Primary lines & text | Black `#000000` | Borders, connectors, attribute text, titles |
| Entity fill | Light grey `#F0F0F0` | Strong entity rectangles |
| Panel / section fill | Lighter grey `#E8E8E8` | Rule boxes, section headers, reference tables |
| Secondary borders | Grey `#CCCCCC` | Dashed boxes, notes, violation examples |
| Annotation text | Dark grey `#666666` | Italic notes, violations, footnotes |

No color accents. No gradients, shadows, 3D effects, icons, logos, or decorative clipart.

**Line weight:** 1–1.5 pt black strokes on entities and connectors; 1 pt for attribute dividers inside boxes.

**Safe margin:** Keep all content at least 8 mm inside the canvas edge so nothing clips when printed.

### Typography

- Sans-serif academic font (Helvetica, Arial, or Inter).
- **Entity name:** bold, uppercase, top of box — 10–11 pt equivalent.
- **Attributes:** regular, left-aligned, one per line — 8–9 pt.
- **Relationship labels:** italic — 8 pt.
- **Section / figure titles:** bold — 12 pt.
- All text must remain **readable when printed** at the sizes below.

### Layout principles

- Orthogonal (right-angle) connector routing.
- Generous whitespace; no overlapping labels.
- Consistent box widths within each diagram.
- **Internal figure title** at top of each diagram is encouraged; LaTeX caption below the figure is added separately in the thesis.
- Flat, print-ready, textbook / ACM conference quality — not infographic or cartoon.

### What to avoid (even with creative layout)

- Cryptocurrency coin art, wallet icons, chain logos, or branded colors.
- Colour-coded tiers (no red/green/blue tier bands).
- Photorealistic or 3D rendering.
- Illegible micro-text to fit more entities — prefer fewer visible attributes over clutter.

---

## 2. Page sizes (A4 thesis)

Thesis text block width: **155 mm** (matches pre-thesis geometry).

| Figure | Page allocation | Canvas size (mm) | Orientation |
|--------|-----------------|------------------|-------------|
| 0NF | Half page | 155 × 110 | Landscape |
| 1NF | Half page | 155 × 110 | Landscape |
| 2NF | Half page | 155 × 110 | Landscape |
| 3NF | Half page | 155 × 110 | Landscape |
| EER | Half page (tall) | 155 × 130 | Portrait |
| ERD | **Full page** | 155 × 220 | Portrait |

**ACM-style note:** Single-column ACM figure ≈ 85 mm wide; these figures use the wider thesis column (155 mm) for readability.

---

## 3. Standard academic ER notation (use throughout)

Use the **combined Chen + Crow's Foot** convention common in database textbooks (Elmasri & Navathe, Connolly & Begg) and CSE370 courses.

### 3.1 Structural symbols

| Symbol | Meaning | Apply to |
|--------|---------|----------|
| **Rectangle** | Strong entity type | WORLD_BANK, BORROWER, LOAN, etc. |
| **Double rectangle** | Weak entity type | INSTALLMENT (existence-dependent on LOAN) |
| **Double line** | Identifying relationship | LOAN to INSTALLMENT (weak entity bond) |
| **Single line** | Non-identifying relationship | Standard associations |
| **Diamond** (optional) | Relationship type | Use when relationship has a name (e.g. *approves*, *funds*) |
| **Ellipse** (optional) | Attribute | Only in Chen-style attribute diagrams; prefer attributes **inside** entity box for ERD |
| **Underline** | Primary key attribute | All PK attributes |
| **Dashed underline** | Discriminator attribute | `bank_type` in BANK_USER specialization |
| **Dashed rectangle** | Derived or on-chain-only entity | CREDIT_PASSPORT (SBT); violation / “before” tables in 0NF |
| **ISA triangle** | Specialization / generalization | BANK_USER → subtypes |
| **Letter *d*** on ISA | Disjoint specialization | Subtypes are mutually exclusive |
| **Letter *o*** on ISA | Overlapping specialization | Not used in this project |
| **Double line to superclass** | Total specialization | Every BANK_USER is exactly one subtype (ISA hierarchy only) |
| **Double line between entities** | Total participation | LOAN_REQUEST to LOAN (mandatory 1:1) — not the same as specialization |
| **Single dashed line** | Partial participation | BORROWER to CREDIT_PASSPORT (0..1) |
| **Brace { }** | Multi-valued attribute | {INCOME_PROOF} on BORROWER in EER |
| **Aggregation diamond** | Whole-part cluster | Loan-centric monitoring cluster |

### 3.2 Cardinality (Crow's Foot)

| Notation | Meaning |
|----------|---------|
| Single line \| | Exactly one (1) |
| Crow's foot \< | Many (N) |
| Circle ○ | Optional (zero) |
| Crossbar \| | One and only one (mandatory one) |

**Standard relationship labels:**

| Between | Cardinality | Label |
|---------|-------------|-------|
| WORLD_BANK — NATIONAL_BANK | 1 : N | *registers* |
| NATIONAL_BANK — LOCAL_BANK | 1 : N | *registers* |
| LOCAL_BANK — BANK_USER | 1 : N | *employs* |
| LOCAL_BANK — BORROWER | 1 : N | *onboards* |
| BORROWER — LOAN_REQUEST | 1 : N | *submits* |
| BANK_USER — LOAN_REQUEST | 1 : N | *approves* |
| LOAN_REQUEST — LOAN | 1 : 1 | *produces* |
| LOAN — INSTALLMENT | 1 : N | *schedules* (identifying) |
| BORROWER — BORROWING_LIMIT | 1 : 1 | *has* |
| BORROWER — INCOME_PROOF | 1 : N | *provides* |
| BORROWER — TRANSACTION | 1 : N | *makes* |
| LOAN — TRANSACTION | 1 : N | *generates* |
| INSTALLMENT — TRANSACTION | 0 : 1 | *settled by* |
| LOAN_REQUEST — CHAT_MESSAGE | 1 : N | *threads* |
| LOAN — AI_ML_SECURITY_LOG | 1 : N | *scored by* |
| TRANSACTION — AI_ML_SECURITY_LOG | 0 : N | *monitored by* |
| BORROWER — SESSIONS | 1 : N | *has* |
| SESSIONS — AGENT_ACTION_LOG | 1 : N | *audits* |
| WORLD_BANK — INTEREST_RATE_TIER | N : 1 | *uses* |
| LOAN — ASSETS | N : 1 | *collateral asset* / *loan asset* |
| BORROWER — PROFILE_SETTING | 1 : 1 | *preferences* |
| BORROWER — CREDIT_PASSPORT | 0 : 1 | *holds (SBT)* — on-chain overlay, not one of the 20 PostgreSQL tables |
| BORROWER — SAVINGS_ACCOUNT | 1 : N | *owns* |
| BORROWER — FIXED_DEPOSIT | 1 : N | *owns* |
| BORROWER — CURRENT_ACCOUNT | 1 : N | *owns* |
| LOCAL_BANK — LOAN_GROUP | 1 : N | *hosts* |
| LOAN_GROUP — GROUP_MEMBER | 1 : N | *includes* |
| BORROWER — GROUP_MEMBER | 1 : N | *participates* |
| LOCAL_BANK — INSURANCE_FUND | 1 : 0..1 | *maintains* |
| Banks — INTERBANK_LOAN | N : N | *same-tier liquidity* (via lender/borrower bank FK + tier) |
| LOCAL_BANK — UPWARD_DEPOSIT — NATIONAL_BANK — WORLD_BANK | 1 : N chain | *surplus repatriation* |
| NATIONAL_BANK — SYNDICATE | 1 : N | *lead-arranges* |
| SYNDICATE — SYNDICATE_MEMBER | 1 : N | *has* |
| SYNDICATE — LOAN | 1 : 0..1 | *funds* |
| TRANCHED_POOL — LOAN | 1 : 0..1 | *funds* |
| Bank — TREASURY_SWAP — ASSETS | N : N | *executes* |
| NETTING_BATCH — NETTING_ENTRY | 1 : N | *contains* |

### 3.3 Key notation inside entity boxes

| Mark | Meaning |
|------|---------|
| **(PK)** or underline | Primary key |
| **(FK)** | Foreign key |
| **(UK)** | Unique key |
| **(PK, FK)** | Composite key where part is also foreign key |
| * | Derived attribute (computed, not stored) |

---

## 4. Figure 1 — 0NF (Unnormalized)

**Title:** Unnormalized Relations (0NF) — Crypto World Bank  
**Page:** Half page (155 × 110 mm, landscape)

**Purpose:** Show schema problems **before** normalization. No relationship lines — three standalone wide relation tables.

### Relation 1 — BORROWER (unnormalized)

Repeating group violation: multiple income proof columns in one row.

| borrower_id | wallet | name | income_proof_1_hash | income_proof_2_hash | income_proof_1_status | income_proof_2_status | … |

*Note:* Multi-valued income documents stored as repeating columns.

### Relation 2 — LOAN (unnormalized)

Repeating group violation: installment schedule embedded as columns.

| loan_id | principal | inst_1_due | inst_1_amount | inst_2_due | inst_2_amount | inst_3_due | … |

*Note:* Variable-length installment schedules cannot be atomic.

### Relation 3 — LOCAL_BANK (unnormalized)

Transitive dependency violation: rate policy stored inside bank row.

| local_bank_id | name | city | base_rate | kink_utilisation | rate_above_kink |

*Note:* Rate parameters depend on tier policy, not directly on `local_bank_id`. (This is a **3NF** issue, shown here as motivation; resolved in Figure 4.)

**Pedagogical scope:** 0NF in this project means *before normalization* — repeating groups (Relations 1–2) are the primary 0NF violations; Relation 3 foreshadows 3NF.

**Footer:** 0NF — contains repeating groups and non-atomic attributes; decomposed in 1NF–3NF.

---

## 5. Figure 2 — 1NF (First Normal Form)

**Title:** First Normal Form (1NF) — Atomic Values, No Repeating Groups  
**Page:** Half page (155 × 110 mm, landscape)

**Rule:** Every attribute holds a single atomic value. No repeating groups within a row.

### Entities and keys

**BORROWER**
- borrower_id **(PK)**
- wallet **(UK)**
- name
- kyc_level
- local_bank_id **(FK)**

**INCOME_PROOF**
- proof_id **(PK)**
- borrower_id **(FK)**
- file_hash
- status
- uploaded_at

**LOAN**
- loan_id **(PK)**
- borrower_id **(FK)** — simplified for 1NF teaching; full schema uses LOAN_REQUEST as intermediary
- principal
- status

**INSTALLMENT**
- loan_id **(FK, part of PK)**
- installment_number **(PK)**
- amount_due
- due_date
- status

### Relationships

- BORROWER **1 : N** INCOME_PROOF — *provides*
- LOAN **1 : N** INSTALLMENT — *schedules*

### Functional dependencies (annotation)

- borrower_id → wallet, name, kyc_level, local_bank_id
- proof_id → borrower_id, file_hash, status, uploaded_at
- (loan_id, installment_number) → amount_due, due_date, status

---

## 6. Figure 3 — 2NF (Second Normal Form)

**Title:** Second Normal Form (2NF) — No Partial Dependencies  
**Page:** Half page (155 × 110 mm, landscape)

**Rule:** In 1NF, and every non-key attribute depends on the **entire** primary key (no partial dependency on a composite key).

### Correct design (left side)

**LOAN** — loan_id **(PK)**, borrower_id **(FK)**, local_bank_id **(FK)**, principal, apr_bps, term_months

**INSTALLMENT** (weak entity, double rectangle)  
Composite **PK:** (loan_id, installment_number)  
Attributes: amount_due, due_date, status — all depend on the **full** composite key.

Relationship: LOAN **1 : N** INSTALLMENT — identifying / *schedules*

### Violation example (right side, dashed box)

INSTALLMENT with partial dependents (show as incorrect, to be removed):
- borrower_wallet — depends only on loan_id ✗
- local_bank_city — depends only on loan_id ✗

**Fix annotation:** Move borrower_wallet → BORROWER; local_bank_city → LOCAL_BANK.

---

## 7. Figure 4 — 3NF (Third Normal Form)

**Title:** Third Normal Form (3NF) — No Transitive Dependencies  
**Page:** Half page (155 × 110 mm, landscape)

**Rule:** In 2NF, and no non-key attribute depends on another non-key attribute.

### Before (top panel — not 3NF, dashed border)

**LOCAL_BANK (unnormalized):** local_bank_id **(PK)**, name, city, base_rate, kink_utilisation, rate_above_kink

Transitive chain: local_bank_id → tier_id → base_rate, kink_utilisation, rate_above_kink

### After (bottom panel — 3NF)

**INTEREST_RATE_TIER** (central reference entity)  
- tier_id **(PK)**
- base_rate
- kink_utilisation
- rate_above_kink
- max_rate

**WORLD_BANK** — world_bank_id **(PK)**, interest_rate_tier_id **(FK)**  
**NATIONAL_BANK** — national_bank_id **(PK)**, interest_rate_tier_id **(FK)**  
**LOCAL_BANK** — local_bank_id **(PK)**, interest_rate_tier_id **(FK)**, name, city

Each bank entity references INTEREST_RATE_TIER by foreign key.

**Footnote:** Derived attributes such as `six_month_remaining` in BORROWING_LIMIT are computed from TRANSACTION at query time, not stored redundantly.

**Optional footnote (BCNF):** BANK_USER enforces disjoint specialization via CHECK on `bank_type` — every determinant is a candidate key; see EER Figure 5.

---

## 8. Figure 5 — EER (Enhanced Entity-Relationship Model)

**Title:** Enhanced ER Model (EER) — Crypto World Bank  
**Page:** Half page tall (155 × 130 mm, portrait)

**Purpose:** Show EER constructs applied to this schema — not a full entity list.

### Notation key (include small legend)

| Symbol | Meaning |
|--------|---------|
| Rectangle | Strong entity |
| Double rectangle | Weak entity |
| ISA triangle + *d* | Disjoint specialization |
| { braces } | Multi-valued attribute |
| Double line | Total participation |
| Single dashed line | Partial participation |
| Diamond | Aggregation |

### Section A — Specialization (disjoint, total)

**Superclass: BANK_USER**  
- bank_user_id **(PK)**
- wallet **(UK)**
- bank_type **(discriminator, dashed underline)**

ISA triangle labelled **d** (disjoint) to three subclasses:
- **NationalBankAdmin**
- **LocalBankAdmin**
- **Approver**

Every bank staff member belongs to exactly one subtype.

### Section B — Weak entity and multi-valued attribute

**LOAN** (strong) — identifying relationship (double line) — **INSTALLMENT** (weak, double rectangle)  
Composite key: (loan_id, installment_number)

**BORROWER** — multi-valued **{INCOME_PROOF}** shown with brace notation; note: *separate table for 1NF*.

### Section C — Association entity and aggregation

**BORROWER** and **LOCAL_BANK** associate through **LOAN_REQUEST** (association / junction entity resolving M : N).

**Aggregation diamond** labelled *loan-centric cluster* connects to:
- TRANSACTION
- CHAT_MESSAGE
- AI_ML_SECURITY_LOG

### Section D — Participation constraints

- LOAN_REQUEST **══** LOAN — total 1 : 1 (*every approved request produces exactly one loan*)
- BORROWER **---** CREDIT_PASSPORT — partial 0 : 1 (*SBT issued after KYC*)

**Note:** AGENT_ACTION_LOG is append-only (INSERT-only audit policy).

---

## 9. Figure 6 — ERD (Full Entity-Relationship Diagram)

**Title:** Entity-Relationship Diagram — Crypto World Bank (PostgreSQL 3NF)  
**Page:** Full page (155 × 220 mm, portrait)

Two panels: **Core schema (20 PostgreSQL entities)** and **Extended schema (14 entities)**. Dashed FK bridges link extended entities to core.

**Four-tier labels (optional band headers):** Tier 1 WORLD_BANK · Tier 2 NATIONAL_BANK · Tier 3 LOCAL_BANK + BANK_USER · Tier 4 BORROWER (CLIENT).

**Density rule:** If 34 entities cannot be rendered legibly on one full page, prioritize in this order: (1) hierarchy + lending chain, (2) extended multi-entity flows, (3) trim attribute lists to PK + 2–3 key fields per entity. Creative layout is encouraged; legibility is mandatory.

**Naming note:** Thesis uses BORROWER; final migration may rename to CLIENT — use BORROWER on diagrams for consistency with entity tables.

---

### Panel A — Core schema (20 PostgreSQL entities)

*CREDIT_PASSPORT is drawn as a dashed on-chain SBT overlay — it is **not** counted among the 20 PostgreSQL tables.*

#### Band 1 — Institutional hierarchy

| Entity | Primary key | Key attributes | Foreign keys |
|--------|-------------|----------------|--------------|
| **WORLD_BANK** | world_bank_id | name (UK), reserve_ratio, total_reserve | interest_rate_tier_id → INTEREST_RATE_TIER |
| **NATIONAL_BANK** | national_bank_id | name, country, allocated_capital, wallet_address | world_bank_id → WORLD_BANK |
| **LOCAL_BANK** | local_bank_id | name, city, pool_balance, wallet_address | national_bank_id → NATIONAL_BANK |

Relationships: WORLD_BANK **1:N** NATIONAL_BANK **1:N** LOCAL_BANK

#### Band 2 — People and lending lifecycle

| Entity | Primary key | Key attributes | Foreign keys |
|--------|-------------|----------------|--------------|
| **BANK_USER** | bank_user_id | wallet (UK), bank_type, role | national_bank_id OR local_bank_id (CHECK) |
| **BORROWER** | borrower_id | wallet (UK), kyc_level, tier, consecutive_paid_loans | local_bank_id → LOCAL_BANK |
| **LOAN_REQUEST** | request_id | amount, purpose, status | borrower_id, local_bank_id, approved_by → BANK_USER |
| **LOAN** | loan_id | principal, apr_bps, term_months, on_chain_id (UK), risk_score | loan_request_id (UK), collateral_asset_id, loan_asset_id → ASSETS |
| **INSTALLMENT** | (loan_id, installment_number) | amount_due, due_date, status | loan_id → LOAN — **weak entity** |
| **BORROWING_LIMIT** | limit_id | six_month_limit, one_year_limit | borrower_id (UK) → BORROWER |
| **INCOME_PROOF** | proof_id | file_hash, status | borrower_id → BORROWER |
| **CREDIT_PASSPORT** | — (on-chain SBT) | credit_score, risk_tier, open_loans | borrower_id — dashed box, partial 0:1 |

Core lending chain:  
BORROWER **1:N** LOAN_REQUEST **1:1** LOAN **1:N** INSTALLMENT

#### Band 3 — Transactions, communication, analytics, agent

| Entity | Primary key | Key attributes | Foreign keys |
|--------|-------------|----------------|--------------|
| **TRANSACTION** | transaction_id | amount, transaction_type, transaction_date, blockchain_tx_hash (UK) | borrower_id, related_loan_id → LOAN |
| **CHAT_MESSAGE** | message_id | sender_type, sender_id, body | loan_request_id → LOAN_REQUEST |
| **AI_ML_SECURITY_LOG** | security_log_id | risk_score, risk_type, explanation (SHAP JSON) | loan_id, transaction_id |
| **AI_CHATBOT_LOG** | log_id | user_wallet, question, response, intent | *(standalone)* |
| **MARKET_DATA** | market_data_id | symbol, price_usd, source, recorded_at | *(standalone — Chainlink cache)* |
| **PROFILE_SETTING** | profile_id | display_currency, preferences | client_id (UK) → BORROWER |
| **SESSIONS** | session_id (UUID) | session_key_scope, parent_session_id | borrower_id → BORROWER |
| **AGENT_ACTION_LOG** | action_id | tool_name, tx_hash, status | session_id → SESSIONS |
| **INTEREST_RATE_TIER** | tier_id | base_rate, kink_utilisation, rate_above_kink, max_rate | — |
| **ASSETS** | asset_id | symbol (UK), decimals, oracle_feed_address | — |

Additional relationships:  
LOAN **1:N** TRANSACTION · LOAN_REQUEST **1:N** CHAT_MESSAGE · LOAN **1:N** AI_ML_SECURITY_LOG · BORROWER **1:N** SESSIONS **1:N** AGENT_ACTION_LOG · LOAN **N:1** ASSETS (twice: collateral and loan asset)

---

### Panel B — Extended schema (14 entities, Phase II–III)

#### Retail banking products

| Entity | Maps to contract | Primary key | Foreign keys |
|--------|------------------|-------------|--------------|
| **SAVINGS_ACCOUNT** | SavingsVault (ERC-4626) | account_id | borrower_id → BORROWER |
| **FIXED_DEPOSIT** | FixedDeposit (ERC-7540) | deposit_id | borrower_id → BORROWER |
| **CURRENT_ACCOUNT** | CurrentAccount | account_id | borrower_id → BORROWER |
| **LOAN_GROUP** | GroupLendingPool | group_id | local_bank_id → LOCAL_BANK |
| **GROUP_MEMBER** | — | (group_id, borrower_id) | group_id → LOAN_GROUP, borrower_id → BORROWER |
| **INSURANCE_FUND** | InsuranceFund | fund_id | local_bank_id (UK) → LOCAL_BANK |

Relationships:  
BORROWER **1:N** SAVINGS_ACCOUNT, FIXED_DEPOSIT, CURRENT_ACCOUNT  
LOCAL_BANK **1:N** LOAN_GROUP **1:N** GROUP_MEMBER **N:1** BORROWER  
LOCAL_BANK **1:1** INSURANCE_FUND

#### Multi-entity and cross-tier operations

| Entity | Maps to contract | Primary key | Foreign keys |
|--------|------------------|-------------|--------------|
| **INTERBANK_LOAN** | InterBankLendingPool | loan_id | lender_bank_id, borrower_bank_id — draw with `bank_tier` discriminator (national or local); not a single monolithic BANK supertype unless you prefer that notation |
| **UPWARD_DEPOSIT** | UpwardDepositFacility | deposit_id | depositing_bank_id, parent_bank_id |
| **SYNDICATE** | SyndicatedLoan | syndicate_id | lead_arranger_id, borrower_id, loan_id → LOAN |
| **SYNDICATE_MEMBER** | — | (syndicate_id, lender_bank_id) | syndicate_id → SYNDICATE |
| **TRANCHED_POOL** | TranchedPool | pool_id | local_bank_id, borrower_id, loan_id → LOAN |
| **TREASURY_SWAP** | TreasurySwap | swap_id | bank_id, asset_from_id, asset_to_id → ASSETS |
| **NETTING_BATCH** | NettingEngine | batch_id | coordinator_id → WORLD_BANK admin |
| **NETTING_ENTRY** | — | (batch_id, src_bank_id, dst_bank_id) | batch_id → NETTING_BATCH |

Relationships:  
NATIONAL_BANK / LOCAL_BANK **N:N** via INTERBANK_LOAN (same-tier liquidity)  
**UPWARD_DEPOSIT** flow: LOCAL_BANK → NATIONAL_BANK → WORLD_BANK (*surplus repatriation*)  
SYNDICATE **1:N** SYNDICATE_MEMBER · SYNDICATE **funds** LOAN · TRANCHED_POOL **funds** LOAN  
NETTING_BATCH **1:N** NETTING_ENTRY

**Dashed bridges** from Panel B entities to Panel A: BORROWER, LOCAL_BANK, NATIONAL_BANK, WORLD_BANK, LOAN, ASSETS.

---

### ERD legend (bottom corner)

| Mark | Meaning |
|------|---------|
| Underline | Primary key |
| (FK) | Foreign key |
| (UK) | Unique |
| Double rectangle | Weak entity |
| Dashed rectangle | On-chain SBT |
| Crow's foot | Many side of relationship |
| 1 : N, 1 : 1, 0 : 1 | Cardinality labels |

**Entity count:** 20 core + 14 extended = **34** relational entities in the full-system design. CREDIT_PASSPORT is primarily on-chain; optional off-chain mirror.

---

## 10. Figure summary

| # | Figure | Page | Focus |
|---|--------|------|-------|
| 1 | 0NF | Half | Repeating groups and transitive data (before) |
| 2 | 1NF | Half | Atomic values; INCOME_PROOF and INSTALLMENT extracted |
| 3 | 2NF | Half | Composite PK on INSTALLMENT; no partial dependencies |
| 4 | 3NF | Half | INTEREST_RATE_TIER extraction; no transitive dependencies |
| 5 | EER | Half (tall) | Specialization, weak entity, multi-valued, aggregation, participation |
| 6 | ERD | **Full** | Complete core + extended schema with all keys and relationships |

---

## 11. Suggested export file names

| Figure | SVG filename |
|--------|----------------|
| 0NF | `fig-norm-0nf.svg` |
| 1NF | `fig-norm-1nf.svg` |
| 2NF | `fig-norm-2nf.svg` |
| 3NF | `fig-norm-3nf.svg` |
| EER | `fig-eer-improved.svg` |
| ERD | `fig-erd-improved.svg` |

---

*Crypto World Bank — CSE370 / pre-thesis database design figures. Specification version aligned with thesis v31 improved ERD.*
