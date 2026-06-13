# Full ERD / EER specification — Crypto World Bank v31 (improved)

Authoritative reference for `erd-core-improved.drawio`, `erd-extended-improved.drawio`, and `eer-improved.drawio`.

**Counts:** 20 core PostgreSQL entities + 14 extended entities = **34** total in full-system design.  
`CREDIT_PASSPORT` is primarily **on-chain SBT** (shown as overlay; optional off-chain mirror).

---

## Diagram A — Core ERD (20 entities)

### Institutional hierarchy

| Entity | PK | Key FKs | Cardinality |
|--------|-----|---------|-------------|
| WORLD_BANK | world_bank_id | interest_rate_tier_id → INTEREST_RATE_TIER | 1:N → NATIONAL_BANK |
| NATIONAL_BANK | national_bank_id | world_bank_id | 1:N → LOCAL_BANK |
| LOCAL_BANK | local_bank_id | national_bank_id | employs BANK_USER; onboards BORROWER |

**WORLD_BANK attributes:** name UK, reserve_ratio, total_reserve, created_at  
**NATIONAL_BANK:** name, country, allocated_capital, wallet_address  
**LOCAL_BANK:** name, city, pool_balance, wallet_address  

### People

| Entity | PK | Notes |
|--------|-----|-------|
| BANK_USER | bank_user_id | wallet UK; bank_type discriminator; CHECK for national vs local FK |
| BORROWER | borrower_id | wallet UK; kyc_level; tier; consecutive_paid_loans |

**BANK_USER → LOAN_REQUEST:** approves/rejects (approved_by, rejected_by FK)

### Lending lifecycle

| Entity | PK | Notes |
|--------|-----|-------|
| LOAN_REQUEST | request_id | Application workflow; status; amount; purpose |
| LOAN | loan_id | 1:1 with approved LOAN_REQUEST; disbursement state |
| INSTALLMENT | (loan_id, installment_number) | **Weak entity**; dashed border in draw.io |
| TRANSACTION | transaction_id | Rolling 6mo/1yr windows for BORROWING_LIMIT |

**LOAN attributes:** principal, apr_bps, term_months, collateral_asset_id FK, loan_asset_id FK, on_chain_id UK, risk_score, shap_explanation JSON

### Limits & proofs

| Entity | PK | Notes |
|--------|-----|-------|
| BORROWING_LIMIT | limit_id | borrower_id UK (1:1); six_month_* / one_year_* |
| INCOME_PROOF | proof_id | **Multi-valued** per borrower (1NF) |

### Communication & analytics

| Entity | PK | Notes |
|--------|-----|-------|
| CHAT_MESSAGE | message_id | FK loan_request_id; sender_type + sender_id |
| AI_CHATBOT_LOG | log_id | Standalone conversational log |
| AI_ML_SECURITY_LOG | security_log_id | loan_id FK; transaction_id FK; SHAP JSON |
| MARKET_DATA | market_data_id | Chainlink price cache; no FK to lending |

### Profile & agent

| Entity | PK | Notes |
|--------|-----|-------|
| PROFILE_SETTING | profile_id | client_id FK UK → BORROWER |
| SESSIONS | session_id UUID | parent_session_id self-FK; session_key_scope JSON |
| AGENT_ACTION_LOG | action_id | session_id FK; INSERT-only RLS; tx_hash |

### Reference data

| Entity | PK | Notes |
|--------|-----|-------|
| INTEREST_RATE_TIER | tier_id | base_rate, kink_utilisation, rate_above_kink (3NF extract) |
| ASSETS | asset_id | symbol UK; oracle_feed_address |

### On-chain overlay (optional mirror)

| Entity | Notes |
|--------|-------|
| CREDIT_PASSPORT | SBT: credit_score, risk_tier, open_loans, completed_cycles, last_default |

---

## Diagram B — Extended ERD (14 entities)

### Retail products (Phase II)

| Entity | Contract | FK to core |
|--------|----------|------------|
| SAVINGS_ACCOUNT | SavingsVault (ERC-4626) | borrower_id → BORROWER |
| FIXED_DEPOSIT | FixedDeposit (ERC-7540) | borrower_id → BORROWER |
| CURRENT_ACCOUNT | CurrentAccount | borrower_id → BORROWER |
| LOAN_GROUP | GroupLendingPool | local_bank_id → LOCAL_BANK |
| GROUP_MEMBER | — | (group_id, borrower_id) composite PK |
| INSURANCE_FUND | InsuranceFund | local_bank_id UK |

### Multi-entity operations (Phase II–III)

| Entity | Contract | FK to core |
|--------|----------|------------|
| INTERBANK_LOAN | InterBankLendingPool | lender_bank_id, borrower_bank_id (national/local + tier enum) |
| UPWARD_DEPOSIT | UpwardDepositFacility | LOCAL→NATIONAL and NATIONAL→WORLD paths |
| SYNDICATE | SyndicatedLoan | borrower_id, loan_id, lead_arranger_id |
| SYNDICATE_MEMBER | — | (syndicate_id, lender_bank_id) composite PK |
| TRANCHED_POOL | TranchedPool | local_bank_id, borrower_id, loan_id |
| TREASURY_SWAP | TreasurySwap | bank_id; asset_from/to → ASSETS |
| NETTING_BATCH | NettingEngine | coordinator_id → WORLD_BANK admin |
| NETTING_ENTRY | — | (batch_id, src_bank_id, dst_bank_id) |

**Improvement over old Fig 3.6:** Draw explicit FK arrows to `LOAN`, `BORROWER`, `LOCAL_BANK`, `NATIONAL_BANK`, `WORLD_BANK`, `ASSETS`.

---

## Diagram C — EER constructs

| Construct | Applied to | Diagram notation |
|-----------|------------|------------------|
| Specialization (disjoint, total) | BANK_USER → NationalBankAdmin, LocalBankAdmin, Approver | ISA triangle + `bank_type` |
| Weak entity | INSTALLMENT ⊂ LOAN | Double rectangle; identifying relationship |
| Multi-valued attribute | {INCOME_PROOF} per BORROWER | Separate entity / brace notation |
| Association entity | LOAN_REQUEST links BORROWER + LOCAL_BANK | M:N resolver |
| Aggregation | LOAN-centric cluster: TRANSACTION, CHAT_MESSAGE, AI_ML_SECURITY_LOG | Diamond “monitors” |
| Participation total | LOAN_REQUEST → LOAN (on approval) | 1:1 double line |
| Participation partial | BORROWER → CREDIT_PASSPORT | 0:1 until KYC |
| Append-only policy | AGENT_ACTION_LOG | Note: INSERT-only RLS |

---

## Relationship summary (draw these lines)

### Core
```
WORLD_BANK ──1:N── NATIONAL_BANK ──1:N── LOCAL_BANK
LOCAL_BANK ──1:N── BANK_USER | BORROWER | LOAN_REQUEST
BORROWER ──1:N── LOAN_REQUEST ──1:1── LOAN ──1:N── INSTALLMENT
BORROWER ──1:1── BORROWING_LIMIT
BORROWER ──1:N── INCOME_PROOF | TRANSACTION | SESSIONS
LOAN ──1:N── TRANSACTION | AI_ML_SECURITY_LOG
LOAN_REQUEST ──1:N── CHAT_MESSAGE
SESSIONS ──1:N── AGENT_ACTION_LOG
WORLD_BANK ──N:1── INTEREST_RATE_TIER
LOAN ──N:1── ASSETS (×2)
```

### Extended bridges
```
BORROWER ──1:N── SAVINGS_ACCOUNT | FIXED_DEPOSIT | CURRENT_ACCOUNT | GROUP_MEMBER
LOCAL_BANK ──1:N── LOAN_GROUP | INSURANCE_FUND | TRANCHED_POOL
SYNDICATE | TRANCHED_POOL ──funds── LOAN
UPWARD_DEPOSIT: LOCAL_BANK → NATIONAL_BANK → WORLD_BANK
```

---

## Implementation status (label on your diagram)

| Status | Entities |
|--------|----------|
| **Prototype (Prisma)** | User, Bank, Loan, Installment, IncomeVerification, ChatMessage, OnChainEvent |
| **Specified Phase I–II** | Core 20 entities (partial) |
| **Specified Phase II–III** | All 14 extended entities |

---

## Export to thesis

1. Arrange in draw.io → Export PDF 300 DPI  
2. Save as `../Diagrams/fig-erd-core.pdf`, `fig-erd-extended.pdf`, `fig-eer-model.pdf`  
3. Add normalization PDFs as new figures if required by examiner
