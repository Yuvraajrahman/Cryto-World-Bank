# CSE370 - Database Management Report
## Crypto World Bank: Relational Database Design

**Course:** CSE370 - Database Management  
**Project:** Decentralized Crypto Reserve & Lending Bank  
**Date:** 2024

---

## Contents

| § | Section |
|---|---------|
| 1 | Project Overview |
| 2 | Entity-Relationship Diagram (ERD) |
| 3 | Generalization of the Graph |
| 4 | Database Management Summary |
| 5 | Indexing |
| 6 | Functional Dependencies and Normalization |
| 7 | ER to Relational Schema Mapping |
| 8 | Relational Integrity Constraints |
| 9 | SQL Examples |
| 10 | EER and User Interface |

---

## 1. Project Overview

The Crypto World Bank is a decentralized lending platform with a hierarchical banking structure: **World Bank → National Banks → Local Banks → Users**. The database supports loan management, transaction tracking, chat systems, AI/ML security monitoring, income verification, and market data for cryptocurrency visualization.

---

## 2. Entity-Relationship Diagram (ERD)

**All diagrams:** [Documentation/Diagrams/CSE370](https://github.com/Yuvraajrahman/Cryto-World-Bank/tree/main/Documentation/Diagrams/CSE370)

### 2.1 Core System Graph

![Core System Graph](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE370/Core%20System%20Graph.png)

*Figure 1: Crypto World Bank System – Entity Relationship Model*

### 2.2 Entity-Relationship Diagram (ERD)

**Full ERD with relational symbols and entity attributes:**

![ERD Diagram - Database Management](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE370/ERD%20diagram%20database%20management.png)

*Figure 2: Entity-Relationship Diagram for Crypto World Bank database*

### 2.3 Enhanced Entity-Relationship (EER) Diagram

The EER model extends the ER model with **generalization/specialization**, **aggregation**, **weak entities**, **participation constraints**, and **cardinality** to represent complex organizational data requirements. The diagram below applies schema design principles and normalization techniques.

#### 2.3.1 EER Diagram – Relational Symbols & Notation

| Symbol | Meaning |
|--------|---------|
| `||--o{` | One-to-many (1:N), total participation on one side |
| `||--||` | One-to-one (1:1), total participation |
| `}o--o{` | Many-to-many (M:N), partial participation |
| `}o--||` | Many-to-one, partial on many side |
| **Double rectangle** | Weak entity (existence-dependent) |
| **Double diamond** | Identifying relationship |
| **Circle (d)** | Disjoint specialization |
| **Circle (o)** | Overlapping specialization |

#### 2.3.2 EER Diagram – Full Model

![EER Diagram - Full Model](https://raw.githubusercontent.com/Yuvraajrahman/Cryto-World-Bank/main/Documentation/Diagrams/CSE370/EER%20Diagram%20%E2%80%93%20Full%20Model.png)

*Figure 3: Enhanced Entity-Relationship Diagram – Full Model*

#### 2.3.3 EER Constructs Applied

| EER Construct | Application in Crypto World Bank |
|---------------|----------------------------------|
| **Generalization (disjoint)** | BANK_USER → NATIONAL_BANK_USER, LOCAL_BANK_USER (discriminator: `bank_type`; mutually exclusive FKs) |
| **Weak entity** | INSTALLMENT (existence-dependent on LOAN_REQUEST; partial key `installment_number`; identifying relationship) |
| **Aggregation** | LOAN_REQUEST aggregates BORROWER + LOCAL_BANK; TRANSACTION, CHAT_MESSAGE, AI_ML_SECURITY_LOG are components |
| **Multi-valued attribute** | INCOME_PROOF (BORROWER can have multiple proofs) → separate entity |
| **Derived attribute** | `six_month_remaining`, `one_year_remaining` in BORROWING_LIMIT (computed from TRANSACTION) |
| **Composite key** | INSTALLMENT: (`loan_id`, `installment_number`) |
| **Participation** | BORROWER total in LOAN_REQUEST (must request to exist); INSTALLMENT total in LOAN_REQUEST (loan must have installments if `is_installment=TRUE`) |
| **Cardinality** | 1:1 (BORROWER–BORROWING_LIMIT), 1:N (hierarchy, loan–installment), N:1 (loan–borrower, loan–bank) |

#### 2.3.4 Normalization in EER Context

- **1NF:** All attributes atomic; no repeating groups (e.g., INCOME_PROOF as separate table).
- **2NF:** No partial dependencies; INSTALLMENT PK is full (`loan_id`, `installment_number`).
- **3NF:** No transitive dependencies; `total_borrowed` in banks is denormalized for performance but could be derived.
- **BCNF:** All determinants are candidate keys; CHECK constraint on BANK_USER enforces disjoint specialization.

---

## 3. Generalization of the Graph

### 3.1 Structural Overview

The database follows a **hierarchical and relational** design:

| Layer | Structure | Description |
|-------|-----------|-------------|
| **Banking Hierarchy** | 1:N cascading | World Bank → National Bank → Local Bank |
| **User Layer** | Bank Users + Borrowers | Bank staff (approvers/viewers) and end-user borrowers |
| **Lending Core** | Loan-centric | Loan requests, installments, transactions |
| **Supporting Entities** | Independent/auxiliary | Income proof, chat, AI logs, market data, profiles |

### 3.2 Relationship Categories

| Category | Relationships |
|----------|---------------|
| **Hierarchical Banking** | WORLD_BANK (1) → NATIONAL_BANK (N) → LOCAL_BANK (N) |
| **User Assignment** | NATIONAL_BANK / LOCAL_BANK (1) → BANK_USER (N) |
| **Lending Flow** | BORROWER (N) → LOAN_REQUEST (N) ← LOCAL_BANK (1) |
| **Transaction Tracking** | LOAN_REQUEST (1) → INSTALLMENT (N), TRANSACTION (N) |
| **Communication** | LOAN_REQUEST (1) → CHAT_MESSAGE (N) |
| **Security & AI** | LOAN_REQUEST, TRANSACTION → AI_ML_SECURITY_LOG (N) |

### 3.3 Entity Summary

| Entity | Role |
|--------|------|
| WORLD_BANK | Top-level reserve holder |
| NATIONAL_BANK | Country-level banks |
| LOCAL_BANK | City-level banks |
| BANK_USER | Bank staff (approve/reject loans) |
| BORROWER | End-users requesting loans |
| LOAN_REQUEST | Loan applications and lifecycle |
| INSTALLMENT | Installment payment records |
| TRANSACTION | Financial transactions |
| BORROWING_LIMIT | Limits per borrower |
| INCOME_PROOF | Income verification documents |
| CHAT_MESSAGE | Borrower–bank chat |
| AI_CHATBOT_LOG | AI chatbot interactions |
| AI_ML_SECURITY_LOG | Security/ML monitoring |
| MARKET_DATA | Cryptocurrency prices |
| PROFILE_SETTINGS | User profiles and terms |

---

## 4. Database Management Summary

- **Normalization:** 3NF (Third Normal Form)
- **Purpose:** Supports hierarchical banking, loan lifecycle, installments, borrowing limits, chat, AI/ML security, income verification, and market data
- **Key Design:** Referential integrity via foreign keys; indexes for query optimization; partitioning for scalability (transactions, logs, market data)

---

## 5. Indexing

### 5.1 Indexing

The schema uses **B-tree indexes** (default in MySQL/PostgreSQL) for efficient retrieval:

| Table | Index | Purpose |
|-------|-------|---------|
| LOAN_REQUEST | `idx_status_borrower`, `idx_status_bank`, `idx_deadline` | Filter pending loans, lookup by borrower/bank |
| TRANSACTION | `idx_type_date`, `idx_borrower_date`, `idx_date` | Borrowing limit queries (6mo/1yr windows) |
| BORROWER | `idx_wallet`, `idx_location` | Wallet lookup, location-based queries |
| CHAT_MESSAGE | `idx_loan_sent`, `idx_sender`, `idx_receiver` | Chat history, unread counts |

**B-tree** is chosen for range queries (e.g., transactions in last 6 months); hash indexes would suit only exact-match lookups.

---

## 6. Functional Dependencies and Normalization

### 6.1 Functional Dependencies (Sample)

| Relation | FD | Notes |
|----------|-----|-------|
| LOAN_REQUEST | `loan_id` → all attributes | PK determines row |
| LOAN_REQUEST | `borrower_id`, `local_bank_id` → `status`, `amount`, ... | One request per borrower per bank |
| BORROWING_LIMIT | `borrower_id` → `six_month_limit`, `one_year_limit`, ... | 1:1 with BORROWER |

### 6.2 Normalization Steps

- **1NF:** All attributes atomic; no repeating groups.
- **2NF:** No partial dependencies; non-key attributes depend on full PK (e.g., INSTALLMENT depends on `loan_id` + `installment_number`).
- **3NF:** No transitive dependencies; e.g., `total_borrowed` in LOCAL_BANK is derived, not stored redundantly from TRANSACTION.

---

## 7. ER to Relational Schema Mapping

| ER Construct | Mapping |
|--------------|---------|
| Entity | Table (e.g., BORROWER → BORROWER table) |
| 1:N relationship | FK in "many" side (e.g., LOAN_REQUEST has `borrower_id`, `local_bank_id`) |
| 1:1 relationship | FK in either table (e.g., BORROWING_LIMIT has `borrower_id` UNIQUE) |
| Weak entity (INSTALLMENT) | PK includes parent FK (`loan_id` + `installment_number`) |
| Multi-valued attribute | Separate table (e.g., INCOME_PROOF for multiple proofs per borrower) |

---

## 8. Relational Integrity Constraints

| Constraint | Examples |
|------------|----------|
| **Primary Key** | `world_bank_id`, `loan_id`, `borrower_id`, etc. |
| **Foreign Key** | `local_bank_id` in LOAN_REQUEST references LOCAL_BANK |
| **UNIQUE** | `wallet_address` in BORROWER, `blockchain_tx_hash` in LOAN_REQUEST |
| **CHECK** | BANK_USER: `(bank_type='national' AND national_bank_id IS NOT NULL) OR (bank_type='local' AND local_bank_id IS NOT NULL)` |
| **NOT NULL** | Core attributes (name, wallet_address, status) |

---

## 9. SQL Examples

Representative queries used by the application:

**DDL (create table):** See `backend/src/database/schema.sql`.

**DML – Insert loan request:**
```sql
INSERT INTO LOAN_REQUEST (borrower_id, local_bank_id, amount, purpose, status)
VALUES (?, ?, ?, ?, 'pending');
```

**Query – Pending loans for a bank:**
```sql
SELECT lr.*, b.name, b.wallet_address
FROM LOAN_REQUEST lr
JOIN BORROWER b ON lr.borrower_id = b.borrower_id
WHERE lr.local_bank_id = ? AND lr.status = 'pending';
```

**Query – Borrowing limit (6-month window):**
```sql
SELECT COALESCE(SUM(amount), 0) AS borrowed_6mo
FROM TRANSACTION
WHERE borrower_id = ? AND transaction_type = 'loan_approved'
  AND transaction_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH);
```

---

## 10. EER and User Interface

### 10.1 EER Generalization

**BANK_USER** generalizes National Bank users and Local Bank users via `bank_type` + conditional FKs (`national_bank_id` or `local_bank_id`). This is modeled as a single table with a discriminator (table-per-type would split into NATIONAL_BANK_USER and LOCAL_BANK_USER).

### 10.2 Database User Interface

The React frontend serves as the **user interface** for the database: dashboard, loan forms, chat, profile pages, and admin views all read/write via the backend API, which executes SQL against PostgreSQL. See CSE471 for UI design and CSE470 for architecture.

---

**Document Version:** 1.3  
**Course:** CSE370 - Database Management  
**Changelog (v1.3):** Replaced all Mermaid diagrams with embedded PNG images from [Documentation/Diagrams/CSE370](https://github.com/Yuvraajrahman/Cryto-World-Bank/tree/main/Documentation/Diagrams/CSE370).
