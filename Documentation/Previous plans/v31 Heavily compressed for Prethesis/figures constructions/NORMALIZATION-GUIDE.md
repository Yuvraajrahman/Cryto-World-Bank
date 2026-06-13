# Normalization guide — 1NF, 2NF, 3NF (and BCNF)

Use with `normalization-1nf-2nf-3nf.drawio` (4 tabs). Each tab is a **separate figure** you can export for the thesis.

---

## 0NF — Unnormalized problems (before normalization)

Show this as the **motivation** slide before 1NF.

### Violation A — Repeating group in `BORROWER`

| borrower_id | wallet | name | income_proof_1_hash | income_proof_2_hash | income_proof_1_status | … |
|-------------|--------|------|---------------------|---------------------|----------------------|---|

**Problem:** A client may upload many income documents. Fixed columns (`proof_1`, `proof_2`, …) are not atomic and create sparse NULLs.

### Violation B — Repeating group in `LOAN`

| loan_id | principal | inst_1_due | inst_1_amt | inst_2_due | inst_2_amt | … |
|---------|-----------|------------|------------|------------|------------|---|

**Problem:** Installment schedules vary in length (3, 12, 24 months). Embedding columns violates atomicity.

### Violation C — Transitive dependency in bank tables

| local_bank_id | name | city | base_rate | kink_utilisation | rate_above_kink |
|---------------|------|------|-----------|------------------|-----------------|

**Problem:** `local_bank_id → city` but rate parameters are really determined by **tier policy**, not by the bank’s surrogate key directly:

```
local_bank_id → tier_id → base_rate, kink_utilisation, rate_above_kink
```

This is a **transitive dependency** (fixed in 3NF).

---

## 1NF — First Normal Form

### Rule

Every attribute contains **only atomic (indivisible) values**. **No repeating groups** within a row.

### Decompositions applied

| Before | After |
|--------|-------|
| Multiple `income_proof_*` columns on `BORROWER` | `INCOME_PROOF(proof_id PK, borrower_id FK, file_hash, status, …)` — **one row per document** |
| Multiple `inst_N_*` columns on `LOAN` | `INSTALLMENT(loan_id FK, installment_number, amount_due, due_date, …)` — **one row per installment** |

### Resulting relations (minimum for 1NF figure)

```
BORROWER(borrower_id PK, wallet UK, name, kyc_level, local_bank_id FK)
INCOME_PROOF(proof_id PK, borrower_id FK, file_hash, status, uploaded_at)
LOAN(loan_id PK, borrower_id FK, principal, status)
INSTALLMENT(loan_id FK, installment_number, amount_due, due_date, status)
```

### Functional dependencies (annotate on diagram)

- `borrower_id → wallet, name, kyc_level, local_bank_id`
- `proof_id → borrower_id, file_hash, status, uploaded_at`
- `(loan_id, installment_number) → amount_due, due_date, status`

### Thesis sentence

> The schema satisfies 1NF: multi-valued income verification and installment schedules are modelled as separate relations rather than repeating attribute groups.

---

## 2NF — Second Normal Form

### Rule

Relation is in **1NF** and every non-key attribute depends on the **entire** primary key (no **partial dependencies** on a composite key).

### Primary example — `INSTALLMENT`

**Composite PK:** `(loan_id, installment_number)`

| Attribute | Depends on | 2NF? |
|-----------|------------|------|
| `amount_due` | full key `(loan_id, installment_number)` | ✓ |
| `due_date` | full key | ✓ |
| `status` | full key | ✓ |
| `borrower_wallet` | only `loan_id` (partial) | ✗ remove |
| `local_bank_city` | only `loan_id` (partial) | ✗ remove |

### Fix

Move partial dependents to parent relations:

- `borrower_wallet` → `LOAN.borrower_id` → `BORROWER.wallet`
- `local_bank_city` → `LOAN.local_bank_id` → `LOCAL_BANK.city`

### Second example — `SYNDICATE_MEMBER` (extended ERD)

**Composite PK:** `(syndicate_id, lender_bank_id)`

- `share_bps` must depend on **both** keys, not on `syndicate_id` alone.

### Thesis sentence

> INSTALLMENT is a weak entity with composite key `(loan_id, installment_number)`; all non-key attributes depend on the full composite key, satisfying 2NF.

---

## 3NF — Third Normal Form

### Rule

Relation is in **2NF** and no non-key attribute depends on another non-key attribute (**no transitive dependencies**).

### Primary example — interest rate parameters

**Before (violates 3NF):**

```
LOCAL_BANK(local_bank_id PK, name, city, base_rate, kink_utilisation, rate_above_kink)
```

FD chain: `local_bank_id → tier_id → base_rate, kink_utilisation, …`

**After (3NF):**

```
INTEREST_RATE_TIER(tier_id PK, base_rate, kink_utilisation, rate_above_kink, max_rate)
WORLD_BANK(world_bank_id PK, interest_rate_tier_id FK, …)
NATIONAL_BANK(national_bank_id PK, interest_rate_tier_id FK, …)
LOCAL_BANK(local_bank_id PK, interest_rate_tier_id FK, …)
```

### Secondary example — derived borrowing limits

`BORROWING_LIMIT.six_month_remaining` and `one_year_remaining` are **derived** from `TRANSACTION` rolling windows.

**3NF practice in CWB:** Store limits and borrowed totals; compute `*_remaining` at query time (or materialize in a view), avoiding redundant storage that can drift.

### Thesis sentence

> Rate governance parameters were extracted to INTEREST_RATE_TIER to eliminate transitive dependencies between bank identifiers and kinked-rate policy attributes.

---

## BCNF — Boyce-Codd Normal Form (footnote)

### Rule

Every determinant is a **candidate key**.

### CWB example

`BANK_USER` specialization enforced by CHECK:

```sql
(bank_type = 'national' AND national_bank_id IS NOT NULL AND local_bank_id IS NULL)
OR
(bank_type = 'local' AND local_bank_id IS NOT NULL AND national_bank_id IS NULL)
```

This prevents overlapping specializations that would violate the disjoint hierarchy in the EER diagram.

---

## Figure checklist for thesis

| Figure label (suggested) | draw.io tab | Export name |
|--------------------------|-------------|-------------|
| Unnormalized schema problems | `0NF Problems` | `fig-norm-0nf.pdf` |
| First normal form decomposition | `1NF` | `fig-norm-1nf.pdf` |
| Second normal form — INSTALLMENT | `2NF` | `fig-norm-2nf.pdf` |
| Third normal form — INTEREST_RATE_TIER | `3NF` | `fig-norm-3nf.pdf` |

Optional: single composite figure using `normalization-pipeline.mmd` as a one-page overview.
