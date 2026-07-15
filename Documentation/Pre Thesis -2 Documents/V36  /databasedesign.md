# Crypto World Bank — Database Design

Design reference for the off-chain PostgreSQL schema only.
Extracted and cross-checked against `Pre-thesis_v35.tex` (§ Data Model / Appendix Database Schema Reference) and `backend/prisma/schema.prisma`.

Related file: [Entity full description.md](./Entity%20full%20description.md) (full 51-entity catalogue).

---

## 1. Scope and technology

| Item | Choice |
|------|--------|
| Engine | PostgreSQL (3NF logical model) |
| Access | Prisma ORM (`backend/prisma/schema.prisma`) |
| Role in stack | Off-chain projections, UX/query store, ML/agent audit; **not** authoritative for reserves, loan principal, or approvals |
| Authoritative state | Solidity contracts; synced via event listener → `BLOCKCHAIN_EVENT_LOG` |

**Designed totals (thesis):** 51 logical entities = 31 core + 6 extension + 14 stubs  
(+ 2 Phase IV platform tables outside the 51: `CHAIN_REGISTRY`, `SESSION_KEY_PERMISSION`)

**Phase I implementation target:** 13 M1 tables (DT-I.12)

> Note: the thesis prose sometimes says “16 core” entities while the M1 table list is 13 and the status table says 31 core. Treat **13 M1** as the Phase I build target and **51** as the full designed model.

---

## 2. Thesis source map

| Design topic | `Pre-thesis_v35.tex` lines (approx.) | Label |
|--------------|--------------------------------------|-------|
| Data model overview | 1816–1820 | `sec:data-model` |
| Core entity graph figure | 1821–1826 | `fig:core-system-graph` |
| Core entities table | 1830–1875 | `tab:db-entities` |
| Deferred / stub entities | 1877–1905 | `tab:db-entities-ext2` |
| Audit taxonomy | 1907–1946 | `tab:db-audit-taxonomy` |
| EER constructs | 1948–1969 | `tab:eer-constructs` |
| Integrity constraints | 1971–1998 | `tab:integrity-constraints` |
| On/off-chain partitioning | 2000–2022 | `tab:data-partitioning` |
| Multi-entity FK anchors | 2254–2284 | `tab:ext-entity-fks` |
| Appendix: full ERD + indexes + FDs + SQL | 3167–3421 | `app:db-schema-reference` |

ERD figures: `Diagrams/ERD_diagram_relational_p1.svg`, `…_p2.svg`.

---

## 3. Migration tiers

| Tier | Intent | Examples |
|------|--------|----------|
| **M1** (Phase I Must) | Hierarchy, actors, loan cycle, sync/audit | `INSTITUTION`, `BORROWER`, `LOAN_REQUEST`, `LOAN`, `INSTALLMENT`, `BLOCKCHAIN_EVENT_LOG`, `ASSETS`, `AUDIT_LOGS` |
| **M2** (Phase II) | Limits, passport, products, multi-entity PoC | `TRANSACTION`, `BORROWING_LIMIT`, `CREDIT_PASSPORT`, `INCOME_PROOF`, `LOAN_GROUP`, `INTERBANK_LOAN`, `SAVINGS_ACCOUNT` |
| **M3** (Phase III) | ML lineage, agent, security | `MODEL_REGISTRY`, `LOAN_RISK_ASSESSMENT`, `SESSIONS`, `AGENT_ACTION_LOG`, `SECURITY_EVENT_LOG` |
| **Stub** | Spec’d tables, light/no runtime yet | `FIXED_DEPOSIT`, `SYNDICATE`, `TRANCHED_POOL`, `NETTING_*`, … |
| **Future** | Deferred products / oracle caches | `MARKET_DATA`, `CHAINLINK_PRICE_ROUND`, `COLLATERAL_POSITION`, chat UX tables |

---

## 4. Core conceptual model

### 4.1 Institution hierarchy (table-per-type)

```
COUNTRY 1───* INSTITUTION
                │
     ┌──────────┼──────────┐
     ▼          ▼          ▼
 WORLD_BANK  NATIONAL_BANK  LOCAL_BANK
 (subtype)    (subtype)     (subtype)
```

- `INSTITUTION` is the shared FK target for cross-tier operations.
- Subtype PK = FK → `INSTITUTION.institution_id`.
- Thesis: one `NATIONAL_BANK` per `country_code` (`UNIQUE`).
- Thesis singleton for World Bank: `CHECK (institution_id = 1)` — **incompatible with cuid/UUID PKs** used in Prisma; prefer a seeded fixed id or a partial unique on `institution_type = 'WORLD'`.

### 4.2 Lending lifecycle

```
BORROWER ──* LOAN_REQUEST 1──0..1 LOAN 1──* INSTALLMENT
    │              │
    │              └── local_bank_id → INSTITUTION (LOCAL)
    └── registered_local_bank_id → home LOCAL bank (mandatory at onboarding)
```

- `LOAN_REQUEST` is the association entity (borrower × local bank applications).
- `INSTALLMENT` is a weak entity: PK `(loan_id, installment_number)`.
- Designed event-audit FKs (not all in Prisma yet):
  - `LOAN_REQUEST.submission_event_log_id`, `approval_event_log_id`
  - `LOAN.disbursement_event_log_id`
  - `INSTALLMENT.payment_event_log_id`
  - all → `BLOCKCHAIN_EVENT_LOG`

### 4.3 M1 entity summary (Phase I Must)

| Entity | PK | Role |
|--------|----|------|
| `INSTITUTION` | `institution_id` | World / National / Local identity |
| `COUNTRY` | `country_code` | ISO reference |
| `WORLD_BANK` | `institution_id` | Tier-1 subtype |
| `NATIONAL_BANK` | `institution_id` | Tier-2 subtype |
| `LOCAL_BANK` | `institution_id` | Tier-3 subtype |
| `BANK_USER` | `bank_user_id` | Bank staff (one parent institution) |
| `BORROWER` | `borrower_id` | Retail client; UK `wallet_address` |
| `LOAN_REQUEST` | `request_id` | Application workflow |
| `LOAN` | `loan_id` | Disbursed loan |
| `INSTALLMENT` | `(loan_id, installment_number)` | Schedule |
| `BLOCKCHAIN_EVENT_LOG` | `event_id` | Canonical on-chain event cache |
| `ASSETS` | `asset_id` | Collateral / loan asset registry; UK `symbol` |
| `AUDIT_LOGS` | `audit_id` | Append-only governance / compliance log |

### 4.4 Selected Phase II–III entities (design-critical)

| Entity | PK | Role |
|--------|----|------|
| `TRANSACTION` | `transaction_id` | Off-chain financial ledger (retail + institutional) |
| `BORROWING_LIMIT` | `limit_id` | Projection of rolling limits; UK `borrower_id` |
| `CREDIT_PASSPORT` | `passport_id` | SBT read-model projection |
| `LOAN_RISK_ASSESSMENT` | `assessment_id` | Per-inference ML audit row |
| `MODEL_REGISTRY` | `model_id` | Model lineage for explainability |
| `SESSIONS` | `session_id` | Retail agent wallet session |
| `AGENT_ACTION_LOG` | `action_id` | Append-only agent write-tool audit |
| `INCOME_PROOF` | `proof_id` | Multi-valued Level-2+ docs per borrower |
| `INTEREST_RATE_TIER` | `tier_id` | Normalised rate parameters |
| `LOAN_GROUP` / `GROUP_MEMBER` / `GROUP_CONSENT` | … | Group lending |
| `INTERBANK_LOAN` / `UPWARD_DEPOSIT` / `SAVINGS_ACCOUNT` | … | Multi-entity / deposit PoC |

Full stub/future lists: see [Entity full description.md](./Entity%20full%20description.md) and thesis `tab:db-entities-ext2`.

---

## 5. On-chain vs off-chain partition

| Category | Storage | Rationale |
|----------|---------|-----------|
| Reserves, loan requests, approval/rejection, repayments | On-chain | Immutability, public audit |
| Profiles, income hashes, chat, ML scores, security events | PostgreSQL | Privacy, query cost, flexibility |
| Borrowing limits | Off-chain compute + on-chain enforce | Window aggregates; commit via `LocalBank.updateBorrowingLimit` |
| Market / Chainlink caches | Off-chain tables | High-frequency; on-chain aggregator remains authoritative |
| Agent transcripts + action log | PostgreSQL (append-only actions) | Size + gas; link via confirmed `tx_hash` |
| Session keys (EIP-7702) | Off-chain session row; scope enforced on-chain | Gas + searchable lineage |

---

## 6. Integrity constraints (designed)

| Type | Examples |
|------|----------|
| **PK** | One surrogate or composite key per entity |
| **FK** | Subtypes → `INSTITUTION`; borrower home bank; risk assessment → request + model; multi-entity stubs → `INSTITUTION` |
| **UNIQUE** | `BORROWER.wallet_address`; one national bank per country; `ASSETS.symbol`; `BORROWING_LIMIT.borrower_id`; `LOAN_REQUEST.blockchain_tx_hash` (when set) |
| **CHECK** | World Bank singleton; `BANK_USER` exactly one parent; `TRANSACTION` at least one of borrower / origin / counterparty non-null |
| **NOT NULL** | Institution name/type; borrower wallet + home bank + KYC level; request `status`; `oracle_state` default `NONE` |
| **APPEND-ONLY (RLS)** | `AGENT_ACTION_LOG`, `CREDIT_PASSPORT_HISTORY`, `SECURITY_EVENT_LOG`, `AUDIT_LOGS` — INSERT-only role |
| **PROJECTION (RLS)** | `CREDIT_PASSPORT`, `BORROWING_LIMIT`, `COLLATERAL_POSITION` — event-listener writes; Express SELECT-only |

### Dedup rule for events (corrected)

Thesis text often marks `BLOCKCHAIN_EVENT_LOG.tx_hash` as UNIQUE. That is incorrect for multi-log transactions.

**Correct uniqueness:** `(tx_hash, log_index)` — already how Prisma models it (`@@unique([txHash, logIndex])`).  
Use `tx_hash` only as a non-unique lookup index.

---

## 7. Audit and logging taxonomy

| Table | Writer | Scope |
|-------|--------|-------|
| `BLOCKCHAIN_EVENT_LOG` | Event listener | On-chain receipts; FK target for lending rows |
| `LOAN_RISK_ASSESSMENT` | FastAPI ML service | Per-loan inference (score, SHAP, model id) |
| `AUDIT_LOGS` | Express API | Governance / Travel Rule / manual approver actions |
| `SECURITY_EVENT_LOG` | ML / monitoring | System-wide AML / injection / anomaly |
| `AGENT_ACTION_LOG` | Express agent hooks | Write-tool calls + confirmation + on-chain tx |

Do not conflate per-loan ML rows with system-wide security events.

---

## 8. Multi-entity FK anchors

| Entity | Core FKs |
|--------|----------|
| `SAVINGS_ACCOUNT`, `FIXED_DEPOSIT`, `CURRENT_ACCOUNT` | `borrower_id` → `BORROWER`; `local_bank_id` → `LOCAL_BANK` |
| `LOAN_GROUP` | `local_bank_id` → `LOCAL_BANK` |
| `GROUP_MEMBER` | `group_id` → `LOAN_GROUP`; `borrower_id` → `BORROWER` |
| `INTERBANK_LOAN` | `lender_institution_id`, `borrower_institution_id` → `INSTITUTION` (+ same-tier CHECK) |
| `UPWARD_DEPOSIT` | `depositor_institution_id`, `parent_institution_id` → `INSTITUTION` (+ adjacent-tier CHECK) |
| `SYNDICATE` / members / tranches / swaps / netting | → `INSTITUTION` / `BANK_USER` / `ASSETS` as appropriate |
| `LOAN_RISK_ASSESSMENT` | `loan_request_id` → `LOAN_REQUEST`; `model_id` → `MODEL_REGISTRY` |
| `GROUP_CONSENT` | `loan_request_id` → `LOAN_REQUEST`; `member_id` → `GROUP_MEMBER` |
| `COLLATERAL_POSITION` | `borrower_id`, `loan_id`, `asset_id` |

---

## 9. Indexing strategy (designed)

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_loan_borrower` | `LOAN_REQUEST(borrower_id)` | Borrower history |
| `idx_loan_status` | `LOAN_REQUEST(status, oracle_state)` | Lifecycle + oracle pipeline |
| `idx_installment_due` | `INSTALLMENT(due_date, status) WHERE PENDING` | Overdue detection |
| `idx_txn_created` / `idx_txn_borrower` | `TRANSACTION(...)` | Rolling borrowing limits |
| `idx_loan_bank_status` | `LOAN(local_bank_id, status, created_at DESC)` | Bank dashboards |
| `idx_loan_borrower_active` | `LOAN(borrower_id, status) WHERE ACTIVE` | Open-loan count |
| `idx_agent_session_date` | `AGENT_ACTION_LOG(session_id, created_at DESC)` | Session history |
| `idx_risk_score` | `LOAN_RISK_ASSESSMENT(anomaly_score) WHERE > 0.5` | AML queue |
| `idx_ib_loan_status` | `INTERBANK_LOAN(status, lender_institution_id)` | IBLP monitoring |
| `idx_event_log_txhash` | `BLOCKCHAIN_EVENT_LOG(tx_hash)` | Lookup (non-unique) |
| `idx_event_log_block` | `BLOCKCHAIN_EVENT_LOG(block_number, chain_id)` | Catch-up replay |

---

## 10. Materialized view (Phase III design)

`mv_client_dashboard` joins borrower + passport + limits + active loans + pending installments + savings + collateral for the MCP `get_account_state` tool.

Refresh: `REFRESH MATERIALIZED VIEW CONCURRENTLY` after event-listener writes that touch component tables.

Representative SQL lives in the thesis appendix (Q1–Q5): active loans by bank, overdue installments, six-month limit exceedance via `TRANSACTION`, high-risk assessments awaiting review, dashboard view select.

---

## 11. Implementation status vs Prisma

Path: `backend/prisma/schema.prisma`

### Present (aligned with M1 / early M2)

`Country`, `Institution`, `WorldBank`, `NationalBank`, `LocalBank`, `BankUser`, `Borrower`, `LoanRequest`, `Loan`, `Installment`, `BlockchainEventLog`, `Asset`, `AuditLog`, plus early M2/agent: `CreditPassportRecord`, `BorrowingLimit`, `IncomeProof`, `InterestRateTier`, `LoanGroup`, `GroupMember`, `UpwardDepositRecord`, `InterbankLoanRecord`, `SavingsAccount`, `AgentSession`, `AgentActionLog`.

### Missing relative to designed schema (priority)

| Gap | Why it matters |
|-----|----------------|
| **`TRANSACTION`** | Thesis limit queries and 3NF narrative depend on it |
| **`LOAN_RISK_ASSESSMENT` + `MODEL_REGISTRY`** | FR-05 ML audit trail |
| Event-log FKs on request / loan / installment | End-to-end receipt linkage |
| `LOAN` → `ASSETS` (`loan_asset_id` / `collateral_asset_id`) | Asset-backed product path |
| `oracle_state` on `LoanRequest` | Oracle pipeline indexes / FDs |
| Real `@relation` FKs for parent banks, group members, interbank/upward/savings | DB-enforced hierarchy integrity |
| RLS append-only / projection policies | Spec’d in thesis; not expressed in Prisma |

### Extra / divergences in Prisma

| Item | Notes |
|------|-------|
| Legacy `User`, `IncomeVerification`, `ChatThread`, `ChatMessage` | Parallel identity/chat model; thesis marks chat as Future — migrate or gate carefully |
| Naming | `SESSIONS` ↔ `AgentSession`; `CREDIT_PASSPORT` ↔ `CreditPassportRecord`; `ASSETS` ↔ `Asset` |
| `InterestRateTier` | Prisma = score→APR bands; thesis FDs = utilization kink curve — pick one |
| `Installment` | Prisma uses `paid` boolean; thesis indexes use `status` |
| Amounts | Prisma stores wei as `String` (practical for EVM integers) |

---

## 12. Known schema issues to fix (design + build)

1. **Entity-count wording** — align “16 core” / “31 core” / “13 M1” in the thesis.
2. **`BLOCKCHAIN_EVENT_LOG` UNIQUE on `tx_hash` alone** — wrong; use `(tx_hash, log_index)`.
3. **`WORLD_BANK` `institution_id = 1` CHECK** — incompatible with string cuids.
4. **FK naming** — `LOCAL_BANK.national_bank_id` vs `parent_national_bank_id`.
5. **`INTEREST_RATE_TIER` semantics** — kink curve vs credit-tier APR table.
6. **Missing `TRANSACTION` in repo** — largest design/build gap for limit aggregation.
7. **Dual user models** — `User` vs `Borrower`/`BankUser` can diverge on wallet/role.

---

## 13. Design rules of thumb for builders

1. Treat the chain as source of truth for money movement; Postgres is a queryable projection + private/audit store.
2. Never write projection tables (`CREDIT_PASSPORT`, `BORROWING_LIMIT`, collateral) from the Express request path when the listener owns them.
3. Keep PII off-chain and hash-only where possible (`kyc_document_hash`, income doc hashes).
4. Append-only for audit/agent/security rows — no UPDATE/DELETE in application roles.
5. Prefer FKs to `INSTITUTION` for any cross-tier product; use subtype tables for tier-specific columns only.
6. When adding a product table, document its FK anchors in the style of §8 before coding routes.

---

## 14. Quick entity checklist for Phase I–II build

**Must land before retail loan demo is complete**

- [x] Hierarchy + borrower + request + loan + installment (Prisma M1)
- [x] `BLOCKCHAIN_EVENT_LOG` + basic `AUDIT_LOGS`
- [ ] Event-log FK columns on request/loan/installment
- [ ] `TRANSACTION` ledger writes from disbursement/repay paths
- [ ] Enforce parent-bank FKs in Prisma
- [ ] Align `Installment.status` (or update indexes to `paid`)

**Before ML / agent MVT claims**

- [ ] `MODEL_REGISTRY` + `LOAN_RISK_ASSESSMENT`
- [ ] Session/action naming aligned with thesis (`SESSIONS` / confirmation turn link)
- [ ] Append-only RLS (or equivalent DB grants) on audit tables
