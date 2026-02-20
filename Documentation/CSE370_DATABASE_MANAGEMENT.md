# CSE370 - Database Management
## Crypto World Bank: Relational Database Design

**Course:** CSE370 - Database Management  
**Project:** Decentralized Crypto Reserve & Lending Bank  
**Date:** 2024

---

## 1. Database Overview

This document outlines the relational database design for the Crypto World Bank system. The database supports a hierarchical banking structure (World Bank → National Banks → Local Banks → Users) with comprehensive loan management, transaction tracking, chat systems, and AI/ML security monitoring.

### 1.1 Database Purpose

The database stores:
- User and bank hierarchy information
- Loan requests, approvals, and installment payments
- Transaction history for borrowing limit calculations
- Chat messages between borrowers and banks
- AI/ML security monitoring data
- Income verification documents
- Market data for cryptocurrency visualization

---

## 2. Entity-Relationship Diagram (ERD)

### 2.1 Core Entities

```
┌─────────────────────────────────────────────────────────────────┐
│                    CRYPTO WORLD BANK SYSTEM                       │
│                      Entity Relationship Model                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  WORLD_BANK  │────────<│ NATIONAL_BANK│────────<│  LOCAL_BANK  │
│              │   1:N   │              │   1:N   │              │
└──────────────┘         └──────┬───────┘         └──────┬───────┘
                                │                        │
                                │                        │
                         ┌──────▼───────┐        ┌──────▼───────┐
                         │ BANK_USER    │        │ BANK_USER    │
                         │ (National)   │        │ (Local)      │
                         └──────┬───────┘        └──────┬───────┘
                                │                        │
                                └────────┬───────────────┘
                                         │
                                  ┌──────▼───────┐
                                  │   BORROWER   │
                                  │   (User)     │
                                  └──────┬───────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
            ┌───────▼──────┐    ┌────────▼────────┐  ┌───────▼──────┐
            │  LOAN_REQUEST│    │  TRANSACTION    │  │ INCOME_PROOF  │
            └───────┬──────┘    └─────────────────┘  └───────────────┘
                    │
            ┌───────▼──────┐
            │  INSTALLMENT │
            └──────────────┘
                    │
            ┌───────▼──────┐
            │  CHAT_MESSAGE│
            └──────────────┘
                    │
            ┌───────▼──────┐
            │  AI_ML_LOG   │
            └──────────────┘
```

---

## 3. Relational Schema

### 3.1 WORLD_BANK Table

Stores the top-level Crypto World Bank entity.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `world_bank_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE | "Crypto World Bank" |
| `total_reserve` | DECIMAL(20,8) | NOT NULL, DEFAULT 0 | Total ETH reserve |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Last update |

**Indexes:**
- PRIMARY KEY (`world_bank_id`)
- UNIQUE INDEX (`name`)

---

### 3.2 NATIONAL_BANK Table

Stores national bank entities that borrow from World Bank.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `national_bank_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `world_bank_id` | INT | FOREIGN KEY, NOT NULL | Reference to WORLD_BANK |
| `name` | VARCHAR(100) | NOT NULL | Bank name |
| `country` | VARCHAR(50) | NOT NULL | Country code |
| `address` | VARCHAR(255) | | Physical address |
| `total_borrowed` | DECIMAL(20,8) | DEFAULT 0 | Total borrowed from World Bank |
| `total_lent` | DECIMAL(20,8) | DEFAULT 0 | Total lent to Local Banks |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Last update |

**Indexes:**
- PRIMARY KEY (`national_bank_id`)
- FOREIGN KEY (`world_bank_id`) REFERENCES `WORLD_BANK`(`world_bank_id`)
- INDEX (`country`)

---

### 3.3 LOCAL_BANK Table

Stores local bank entities that borrow from National Banks.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `local_bank_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `national_bank_id` | INT | FOREIGN KEY, NOT NULL | Reference to NATIONAL_BANK |
| `name` | VARCHAR(100) | NOT NULL | Bank name |
| `city` | VARCHAR(50) | NOT NULL | City |
| `address` | VARCHAR(255) | | Physical address |
| `total_borrowed` | DECIMAL(20,8) | DEFAULT 0 | Total borrowed from National Bank |
| `total_lent` | DECIMAL(20,8) | DEFAULT 0 | Total lent to Users |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Last update |

**Indexes:**
- PRIMARY KEY (`local_bank_id`)
- FOREIGN KEY (`national_bank_id`) REFERENCES `NATIONAL_BANK`(`national_bank_id`)
- INDEX (`city`)

---

### 3.4 BANK_USER Table

Stores authorized users who can approve/reject loans for banks.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `bank_user_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `wallet_address` | VARCHAR(42) | NOT NULL, UNIQUE | Ethereum wallet address |
| `bank_type` | ENUM('national', 'local') | NOT NULL | Type of bank |
| `national_bank_id` | INT | FOREIGN KEY, NULL | If bank_type = 'national' |
| `local_bank_id` | INT | FOREIGN KEY, NULL | If bank_type = 'local' |
| `name` | VARCHAR(100) | NOT NULL | User full name |
| `email` | VARCHAR(100) | UNIQUE | Email address |
| `role` | ENUM('approver', 'viewer') | NOT NULL, DEFAULT 'approver' | User role |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Active status |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Indexes:**
- PRIMARY KEY (`bank_user_id`)
- UNIQUE INDEX (`wallet_address`)
- FOREIGN KEY (`national_bank_id`) REFERENCES `NATIONAL_BANK`(`national_bank_id`)
- FOREIGN KEY (`local_bank_id`) REFERENCES `LOCAL_BANK`(`local_bank_id`)
- CHECK CONSTRAINT: Only one of `national_bank_id` or `local_bank_id` can be set

**Business Rule:** Only one user per bank can have `role = 'approver'`

---

### 3.5 BORROWER Table

Stores end-user borrowers who request loans from Local Banks.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `borrower_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `wallet_address` | VARCHAR(42) | NOT NULL, UNIQUE | Ethereum wallet address |
| `name` | VARCHAR(100) | NOT NULL | Full name |
| `email` | VARCHAR(100) | UNIQUE | Email address |
| `phone` | VARCHAR(20) | | Phone number |
| `country` | VARCHAR(50) | NOT NULL | Country code |
| `city` | VARCHAR(50) | | City |
| `is_first_time` | BOOLEAN | NOT NULL, DEFAULT TRUE | First-time borrower flag |
| `total_borrowed_lifetime` | DECIMAL(20,8) | DEFAULT 0 | Lifetime borrowing |
| `consecutive_paid_loans` | INT | DEFAULT 0 | Count of sequential fully paid loans |
| `can_multiple_loans` | BOOLEAN | DEFAULT FALSE | Can have 2 active loans if >= 3 consecutive paid |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Last update |

**Indexes:**
- PRIMARY KEY (`borrower_id`)
- UNIQUE INDEX (`wallet_address`)
- INDEX (`country`, `city`)

---

### 3.6 INCOME_PROOF Table

Stores income verification documents for first-time borrowers.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `proof_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `borrower_id` | INT | FOREIGN KEY, NOT NULL | Reference to BORROWER |
| `file_path` | VARCHAR(500) | NOT NULL | Path to uploaded file |
| `file_hash` | VARCHAR(64) | NOT NULL | SHA-256 hash for verification |
| `file_type` | VARCHAR(50) | NOT NULL | MIME type (e.g., 'application/pdf') |
| `file_size` | BIGINT | NOT NULL | File size in bytes |
| `status` | ENUM('pending', 'approved', 'rejected') | NOT NULL, DEFAULT 'pending' | Approval status |
| `reviewed_by` | INT | FOREIGN KEY, NULL | BANK_USER who reviewed |
| `reviewed_at` | TIMESTAMP | NULL | Review timestamp |
| `notes` | TEXT | | Review notes |
| `uploaded_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Upload timestamp |

**Indexes:**
- PRIMARY KEY (`proof_id`)
- FOREIGN KEY (`borrower_id`) REFERENCES `BORROWER`(`borrower_id`)
- FOREIGN KEY (`reviewed_by`) REFERENCES `BANK_USER`(`bank_user_id`)
- INDEX (`status`, `borrower_id`)

---

### 3.7 LOAN_REQUEST Table

Stores loan requests from borrowers to banks.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `loan_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `borrower_id` | INT | FOREIGN KEY, NOT NULL | Reference to BORROWER |
| `local_bank_id` | INT | FOREIGN KEY, NOT NULL | Reference to LOCAL_BANK |
| `amount` | DECIMAL(20,8) | NOT NULL | Loan amount in ETH |
| `purpose` | VARCHAR(500) | NOT NULL | Loan purpose |
| `cryptocurrency_type` | VARCHAR(10) | NOT NULL, DEFAULT 'ETH' | Type of crypto |
| `status` | ENUM('pending', 'approved', 'rejected', 'active', 'completed', 'defaulted') | NOT NULL, DEFAULT 'pending' | Loan status |
| `requested_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Request timestamp |
| `approved_by` | INT | FOREIGN KEY, NULL | BANK_USER who approved |
| `approved_at` | TIMESTAMP | NULL | Approval timestamp |
| `rejected_by` | INT | FOREIGN KEY, NULL | BANK_USER who rejected |
| `rejected_at` | TIMESTAMP | NULL | Rejection timestamp |
| `rejection_reason` | TEXT | | Reason for rejection |
| `gas_cost` | DECIMAL(20,8) | DEFAULT 0 | GAS cost deducted from borrower |
| `is_installment` | BOOLEAN | NOT NULL, DEFAULT FALSE | Installment payment enabled (if >= 100 ETH) |
| `total_installments` | INT | DEFAULT 1 | Total number of installments |
| `deadline` | TIMESTAMP | NULL | Payment deadline |
| `blockchain_tx_hash` | VARCHAR(66) | UNIQUE | Transaction hash on blockchain |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Last update |

**Indexes:**
- PRIMARY KEY (`loan_id`)
- FOREIGN KEY (`borrower_id`) REFERENCES `BORROWER`(`borrower_id`)
- FOREIGN KEY (`local_bank_id`) REFERENCES `LOCAL_BANK`(`local_bank_id`)
- FOREIGN KEY (`approved_by`) REFERENCES `BANK_USER`(`bank_user_id`)
- FOREIGN KEY (`rejected_by`) REFERENCES `BANK_USER`(`bank_user_id`)
- UNIQUE INDEX (`blockchain_tx_hash`)
- INDEX (`status`, `borrower_id`)
- INDEX (`status`, `local_bank_id`)
- INDEX (`deadline`)

**Business Rules:**
1. Borrower can only send one loan request per bank
2. Once approved, request is no longer visible in pending list
3. If amount >= 100 ETH, `is_installment` = TRUE
4. `deadline` is set when loan is approved

---

### 3.8 INSTALLMENT Table

Stores installment payment records for loans.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `installment_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `loan_id` | INT | FOREIGN KEY, NOT NULL | Reference to LOAN_REQUEST |
| `installment_number` | INT | NOT NULL | Installment sequence (1, 2, 3...) |
| `amount_due` | DECIMAL(20,8) | NOT NULL | Amount due for this installment |
| `amount_paid` | DECIMAL(20,8) | DEFAULT 0 | Amount paid |
| `due_date` | TIMESTAMP | NOT NULL | Due date for installment |
| `paid_at` | TIMESTAMP | NULL | Payment timestamp |
| `status` | ENUM('pending', 'paid', 'overdue', 'partial') | NOT NULL, DEFAULT 'pending' | Payment status |
| `blockchain_tx_hash` | VARCHAR(66) | UNIQUE | Transaction hash |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Last update |

**Indexes:**
- PRIMARY KEY (`installment_id`)
- FOREIGN KEY (`loan_id`) REFERENCES `LOAN_REQUEST`(`loan_id`)
- UNIQUE INDEX (`loan_id`, `installment_number`)
- INDEX (`status`, `due_date`)
- INDEX (`blockchain_tx_hash`)

---

### 3.9 TRANSACTION Table

Stores all financial transactions for borrowing limit calculations.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `transaction_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `borrower_id` | INT | FOREIGN KEY, NULL | Reference to BORROWER (if user transaction) |
| `local_bank_id` | INT | FOREIGN KEY, NULL | Reference to LOCAL_BANK (if bank transaction) |
| `national_bank_id` | INT | FOREIGN KEY, NULL | Reference to NATIONAL_BANK (if bank transaction) |
| `transaction_type` | ENUM('loan_approved', 'installment_paid', 'loan_completed', 'loan_defaulted') | NOT NULL | Transaction type |
| `amount` | DECIMAL(20,8) | NOT NULL | Transaction amount |
| `cryptocurrency_type` | VARCHAR(10) | NOT NULL, DEFAULT 'ETH' | Type of crypto |
| `transaction_date` | TIMESTAMP | NOT NULL | Transaction timestamp |
| `blockchain_tx_hash` | VARCHAR(66) | UNIQUE | Transaction hash |
| `related_loan_id` | INT | FOREIGN KEY, NULL | Reference to LOAN_REQUEST |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Indexes:**
- PRIMARY KEY (`transaction_id`)
- FOREIGN KEY (`borrower_id`) REFERENCES `BORROWER`(`borrower_id`)
- FOREIGN KEY (`local_bank_id`) REFERENCES `LOCAL_BANK`(`local_bank_id`)
- FOREIGN KEY (`national_bank_id`) REFERENCES `NATIONAL_BANK`(`national_bank_id`)
- FOREIGN KEY (`related_loan_id`) REFERENCES `LOAN_REQUEST`(`loan_id`)
- UNIQUE INDEX (`blockchain_tx_hash`)
- INDEX (`transaction_type`, `transaction_date`)
- INDEX (`borrower_id`, `transaction_date`)
- INDEX (`transaction_date`)

**Purpose:** Used to calculate borrowing limits based on 6-month and 1-year windows.

---

### 3.10 BORROWING_LIMIT Table

Stores calculated borrowing limits for borrowers.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `limit_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `borrower_id` | INT | FOREIGN KEY, NOT NULL, UNIQUE | Reference to BORROWER |
| `six_month_limit` | DECIMAL(20,8) | NOT NULL, DEFAULT 0 | Maximum can borrow in 6 months |
| `six_month_borrowed` | DECIMAL(20,8) | NOT NULL, DEFAULT 0 | Already borrowed in last 6 months |
| `six_month_remaining` | DECIMAL(20,8) | NOT NULL, DEFAULT 0 | Remaining limit (calculated) |
| `one_year_limit` | DECIMAL(20,8) | NOT NULL, DEFAULT 0 | Maximum can borrow in 1 year |
| `one_year_borrowed` | DECIMAL(20,8) | NOT NULL, DEFAULT 0 | Already borrowed in last 1 year |
| `one_year_remaining` | DECIMAL(20,8) | NOT NULL, DEFAULT 0 | Remaining limit (calculated) |
| `last_calculated_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last calculation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Last update |

**Indexes:**
- PRIMARY KEY (`limit_id`)
- FOREIGN KEY (`borrower_id`) REFERENCES `BORROWER`(`borrower_id`)
- UNIQUE INDEX (`borrower_id`)

**Business Rule:** 
- If borrower borrowed X in last year, cannot borrow X/2 until all installments paid
- Exception: If `consecutive_paid_loans >= 3`, can have up to 2 active loans

---

### 3.11 CHAT_MESSAGE Table

Stores chat messages between borrowers and banks.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `message_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `loan_id` | INT | FOREIGN KEY, NOT NULL | Reference to LOAN_REQUEST |
| `sender_type` | ENUM('borrower', 'bank') | NOT NULL | Sender type |
| `sender_id` | INT | NOT NULL | Borrower ID or BANK_USER ID |
| `receiver_type` | ENUM('borrower', 'bank') | NOT NULL | Receiver type |
| `receiver_id` | INT | NOT NULL | Borrower ID or BANK_USER ID |
| `message_text` | TEXT | NOT NULL | Message content |
| `is_read` | BOOLEAN | NOT NULL, DEFAULT FALSE | Read status |
| `sent_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Sent timestamp |
| `read_at` | TIMESTAMP | NULL | Read timestamp |

**Indexes:**
- PRIMARY KEY (`message_id`)
- FOREIGN KEY (`loan_id`) REFERENCES `LOAN_REQUEST`(`loan_id`)
- INDEX (`loan_id`, `sent_at`)
- INDEX (`sender_id`, `sender_type`, `sent_at`)
- INDEX (`receiver_id`, `receiver_type`, `is_read`)

---

### 3.12 AI_CHATBOT_LOG Table

Stores AI chatbot interaction logs.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `log_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `user_wallet` | VARCHAR(42) | NOT NULL | User wallet address |
| `user_type` | ENUM('borrower', 'bank_user', 'national_bank', 'local_bank') | NOT NULL | User type |
| `question` | TEXT | NOT NULL | User question |
| `response` | TEXT | NOT NULL | AI response |
| `intent` | VARCHAR(50) | | Detected intent (e.g., 'loan_limit', 'payment_due') |
| `confidence` | DECIMAL(5,2) | | Confidence score (0-100) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Interaction timestamp |

**Indexes:**
- PRIMARY KEY (`log_id`)
- INDEX (`user_wallet`, `created_at`)
- INDEX (`intent`, `created_at`)

---

### 3.13 AI_ML_SECURITY_LOG Table

Stores AI/ML security monitoring data for future security layer implementation.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `security_log_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `loan_id` | INT | FOREIGN KEY, NULL | Reference to LOAN_REQUEST |
| `transaction_id` | INT | FOREIGN KEY, NULL | Reference to TRANSACTION |
| `user_wallet` | VARCHAR(42) | NOT NULL | Wallet address being monitored |
| `risk_type` | ENUM('fraud', 'anomaly', 'attack', 'suspicious_pattern') | NOT NULL | Type of risk detected |
| `risk_score` | DECIMAL(5,2) | NOT NULL | Risk score (0-100) |
| `ml_model` | VARCHAR(50) | | ML model used (e.g., 'random_forest', 'lstm') |
| `features` | JSON | | Feature vector used for detection |
| `explanation` | TEXT | | XAI explanation |
| `action_taken` | ENUM('none', 'flagged', 'blocked', 'reviewed') | NOT NULL, DEFAULT 'flagged' | Action taken |
| `detected_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Detection timestamp |
| `reviewed_by` | INT | FOREIGN KEY, NULL | BANK_USER who reviewed |
| `reviewed_at` | TIMESTAMP | NULL | Review timestamp |

**Indexes:**
- PRIMARY KEY (`security_log_id`)
- FOREIGN KEY (`loan_id`) REFERENCES `LOAN_REQUEST`(`loan_id`)
- FOREIGN KEY (`transaction_id`) REFERENCES `TRANSACTION`(`transaction_id`)
- FOREIGN KEY (`reviewed_by`) REFERENCES `BANK_USER`(`bank_user_id`)
- INDEX (`risk_type`, `detected_at`)
- INDEX (`user_wallet`, `detected_at`)
- INDEX (`risk_score`, `detected_at`)

**Purpose:** Stores all data needed for AI/ML security layer training and monitoring.

---

### 3.14 MARKET_DATA Table

Stores cryptocurrency market data for live visualization.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `market_data_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `cryptocurrency_type` | VARCHAR(10) | NOT NULL | Type (ETH, BTC, etc.) |
| `price_usd` | DECIMAL(20,2) | NOT NULL | Price in USD |
| `price_eth` | DECIMAL(20,8) | NOT NULL | Price in ETH (if not ETH) |
| `volume_24h` | DECIMAL(20,2) | | 24h trading volume |
| `market_cap` | DECIMAL(20,2) | | Market capitalization |
| `change_24h` | DECIMAL(5,2) | | 24h price change % |
| `timestamp` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Data timestamp |

**Indexes:**
- PRIMARY KEY (`market_data_id`)
- INDEX (`cryptocurrency_type`, `timestamp`)
- INDEX (`timestamp`)

---

### 3.15 PROFILE_SETTINGS Table

Stores profile settings and terms acceptance for all user types.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `profile_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `user_type` | ENUM('borrower', 'bank_user', 'national_bank', 'local_bank', 'world_bank') | NOT NULL | User type |
| `user_id` | INT | NOT NULL | Reference to respective user table |
| `terms_accepted` | BOOLEAN | NOT NULL, DEFAULT FALSE | Terms and conditions accepted |
| `terms_version` | VARCHAR(20) | | Version of terms accepted |
| `terms_accepted_at` | TIMESTAMP | NULL | Acceptance timestamp |
| `preferences` | JSON | | User preferences (theme, notifications, etc.) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Last update |

**Indexes:**
- PRIMARY KEY (`profile_id`)
- UNIQUE INDEX (`user_type`, `user_id`)
- INDEX (`terms_accepted`)

---

## 4. Relational Database Diagram (Visual)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RELATIONAL DATABASE DIAGRAM                           │
│                    Crypto World Bank Lending System                          │
└─────────────────────────────────────────────────────────────────────────────┘

WORLD_BANK (1) ──────< (N) NATIONAL_BANK (1) ──────< (N) LOCAL_BANK
                                                              │
                                                              │
                                                              │
                                                              │
                                                              ▼
                                                      (N) BANK_USER
                                                              │
                                                              │
                                                              │
                                                              ▼
                                                      (1) ──────< (N) BORROWER
                                                              │
                                                              │
                    ┌─────────────────────────────────────────┼──────────────┐
                    │                                         │              │
                    ▼                                         ▼              ▼
            (N) LOAN_REQUEST                          (N) INCOME_PROOF  (1) BORROWING_LIMIT
                    │
                    │
                    ├───────< (N) INSTALLMENT
                    │
                    ├───────< (N) CHAT_MESSAGE
                    │
                    └───────< (N) AI_ML_SECURITY_LOG
                    │
                    │
                    ▼
            (N) TRANSACTION ──────< (N) AI_ML_SECURITY_LOG

MARKET_DATA (Independent table for cryptocurrency prices)

AI_CHATBOT_LOG (Independent table for chatbot interactions)

PROFILE_SETTINGS (Independent table for user profiles)
```

### 4.1 Mermaid ER Diagram

To view this diagram, open in Markdown preview (`Ctrl+Shift+V`) or paste the Mermaid block at [mermaid.live](https://mermaid.live).

```mermaid
erDiagram
    WORLD_BANK {
        int world_bank_id PK
        varchar name UK "NOT NULL, UNIQUE"
        decimal total_reserve "NOT NULL, DEFAULT 0"
        timestamp created_at "NOT NULL"
        timestamp updated_at "NOT NULL"
    }

    NATIONAL_BANK {
        int national_bank_id PK
        int world_bank_id FK "NOT NULL"
        varchar name "NOT NULL"
        varchar country "NOT NULL"
        varchar address
        decimal total_borrowed "DEFAULT 0"
        decimal total_lent "DEFAULT 0"
        timestamp created_at "NOT NULL"
        timestamp updated_at "NOT NULL"
    }

    LOCAL_BANK {
        int local_bank_id PK
        int national_bank_id FK "NOT NULL"
        varchar name "NOT NULL"
        varchar city "NOT NULL"
        varchar address
        decimal total_borrowed "DEFAULT 0"
        decimal total_lent "DEFAULT 0"
        timestamp created_at "NOT NULL"
        timestamp updated_at "NOT NULL"
    }

    BANK_USER {
        int bank_user_id PK
        varchar wallet_address UK "NOT NULL, UNIQUE"
        enum bank_type "national or local"
        int national_bank_id FK "NULL"
        int local_bank_id FK "NULL"
        varchar name "NOT NULL"
        varchar email UK
        enum role "approver or viewer"
        boolean is_active "DEFAULT TRUE"
        timestamp created_at "NOT NULL"
    }

    BORROWER {
        int borrower_id PK
        varchar wallet_address UK "NOT NULL, UNIQUE"
        varchar name "NOT NULL"
        varchar email UK
        varchar phone
        varchar country "NOT NULL"
        varchar city
        boolean is_first_time "DEFAULT TRUE"
        decimal total_borrowed_lifetime "DEFAULT 0"
        int consecutive_paid_loans "DEFAULT 0"
        boolean can_multiple_loans "DEFAULT FALSE"
        timestamp created_at "NOT NULL"
        timestamp updated_at "NOT NULL"
    }

    INCOME_PROOF {
        int proof_id PK
        int borrower_id FK "NOT NULL"
        varchar file_path "NOT NULL"
        varchar file_hash "NOT NULL, SHA-256"
        varchar file_type "NOT NULL"
        bigint file_size "NOT NULL"
        enum status "pending, approved, rejected"
        int reviewed_by FK "NULL"
        timestamp reviewed_at "NULL"
        text notes
        timestamp uploaded_at "NOT NULL"
    }

    LOAN_REQUEST {
        int loan_id PK
        int borrower_id FK "NOT NULL"
        int local_bank_id FK "NOT NULL"
        decimal amount "NOT NULL"
        varchar purpose "NOT NULL"
        varchar cryptocurrency_type "DEFAULT ETH"
        enum status "pending, approved, rejected, active, completed, defaulted"
        timestamp requested_at "NOT NULL"
        int approved_by FK "NULL"
        timestamp approved_at "NULL"
        int rejected_by FK "NULL"
        timestamp rejected_at "NULL"
        text rejection_reason
        decimal gas_cost "DEFAULT 0"
        boolean is_installment "DEFAULT FALSE"
        int total_installments "DEFAULT 1"
        timestamp deadline "NULL"
        varchar blockchain_tx_hash UK
        timestamp created_at "NOT NULL"
        timestamp updated_at "NOT NULL"
    }

    INSTALLMENT {
        int installment_id PK
        int loan_id FK "NOT NULL"
        int installment_number "NOT NULL"
        decimal amount_due "NOT NULL"
        decimal amount_paid "DEFAULT 0"
        timestamp due_date "NOT NULL"
        timestamp paid_at "NULL"
        enum status "pending, paid, overdue, partial"
        varchar blockchain_tx_hash UK
        timestamp created_at "NOT NULL"
        timestamp updated_at "NOT NULL"
    }

    TRANSACTION {
        int transaction_id PK
        int borrower_id FK "NULL"
        int local_bank_id FK "NULL"
        int national_bank_id FK "NULL"
        enum transaction_type "loan_approved, installment_paid, loan_completed, loan_defaulted"
        decimal amount "NOT NULL"
        varchar cryptocurrency_type "DEFAULT ETH"
        timestamp transaction_date "NOT NULL"
        varchar blockchain_tx_hash UK
        int related_loan_id FK "NULL"
        timestamp created_at "NOT NULL"
    }

    BORROWING_LIMIT {
        int limit_id PK
        int borrower_id FK_UK "NOT NULL, UNIQUE"
        decimal six_month_limit "DEFAULT 0"
        decimal six_month_borrowed "DEFAULT 0"
        decimal six_month_remaining "DEFAULT 0"
        decimal one_year_limit "DEFAULT 0"
        decimal one_year_borrowed "DEFAULT 0"
        decimal one_year_remaining "DEFAULT 0"
        timestamp last_calculated_at "NOT NULL"
        timestamp updated_at "NOT NULL"
    }

    CHAT_MESSAGE {
        int message_id PK
        int loan_id FK "NOT NULL"
        enum sender_type "borrower or bank"
        int sender_id "NOT NULL"
        enum receiver_type "borrower or bank"
        int receiver_id "NOT NULL"
        text message_text "NOT NULL"
        boolean is_read "DEFAULT FALSE"
        timestamp sent_at "NOT NULL"
        timestamp read_at "NULL"
    }

    AI_CHATBOT_LOG {
        int log_id PK
        varchar user_wallet "NOT NULL"
        enum user_type "borrower, bank_user, national_bank, local_bank"
        text question "NOT NULL"
        text response "NOT NULL"
        varchar intent
        decimal confidence
        timestamp created_at "NOT NULL"
    }

    AI_ML_SECURITY_LOG {
        int security_log_id PK
        int loan_id FK "NULL"
        int transaction_id FK "NULL"
        varchar user_wallet "NOT NULL"
        enum risk_type "fraud, anomaly, attack, suspicious_pattern"
        decimal risk_score "NOT NULL"
        varchar ml_model
        json features
        text explanation
        enum action_taken "none, flagged, blocked, reviewed"
        timestamp detected_at "NOT NULL"
        int reviewed_by FK "NULL"
        timestamp reviewed_at "NULL"
    }

    MARKET_DATA {
        int market_data_id PK
        varchar cryptocurrency_type "NOT NULL"
        decimal price_usd "NOT NULL"
        decimal price_eth "NOT NULL"
        decimal volume_24h
        decimal market_cap
        decimal change_24h
        timestamp timestamp "NOT NULL"
    }

    PROFILE_SETTINGS {
        int profile_id PK
        enum user_type "borrower, bank_user, national_bank, local_bank, world_bank"
        int user_id "NOT NULL"
        boolean terms_accepted "DEFAULT FALSE"
        varchar terms_version
        timestamp terms_accepted_at "NULL"
        json preferences
        timestamp created_at "NOT NULL"
        timestamp updated_at "NOT NULL"
    }

    %% === HIERARCHICAL BANKING RELATIONSHIPS ===
    WORLD_BANK ||--o{ NATIONAL_BANK : "registers"
    NATIONAL_BANK ||--o{ LOCAL_BANK : "registers"
    NATIONAL_BANK ||--o{ BANK_USER : "employs"
    LOCAL_BANK ||--o{ BANK_USER : "employs"

    %% === LENDING FLOW RELATIONSHIPS ===
    BORROWER ||--o{ LOAN_REQUEST : "requests"
    LOCAL_BANK ||--o{ LOAN_REQUEST : "receives"
    BANK_USER ||--o{ LOAN_REQUEST : "approves"
    LOAN_REQUEST ||--o{ INSTALLMENT : "has"
    LOAN_REQUEST ||--o{ TRANSACTION : "generates"
    BORROWER ||--o{ TRANSACTION : "has"
    LOCAL_BANK ||--o{ TRANSACTION : "processes"
    NATIONAL_BANK ||--o{ TRANSACTION : "processes"
    BORROWER ||--|| BORROWING_LIMIT : "has"

    %% === INCOME VERIFICATION ===
    BORROWER ||--o{ INCOME_PROOF : "submits"
    BANK_USER ||--o{ INCOME_PROOF : "reviews"

    %% === COMMUNICATION ===
    LOAN_REQUEST ||--o{ CHAT_MESSAGE : "has"

    %% === AI/ML SECURITY ===
    LOAN_REQUEST ||--o{ AI_ML_SECURITY_LOG : "monitored_by"
    TRANSACTION ||--o{ AI_ML_SECURITY_LOG : "monitored_by"
    BANK_USER ||--o{ AI_ML_SECURITY_LOG : "reviews"
```

---

## 5. Key Relationships

### 5.1 Hierarchical Banking Structure

- **WORLD_BANK (1) → (N) NATIONAL_BANK**: One World Bank has many National Banks
- **NATIONAL_BANK (1) → (N) LOCAL_BANK**: One National Bank has many Local Banks
- **LOCAL_BANK (1) → (N) BANK_USER**: One Local Bank has many authorized users
- **NATIONAL_BANK (1) → (N) BANK_USER**: One National Bank has many authorized users

### 5.2 Lending Flow

- **BORROWER (N) → (1) LOCAL_BANK**: Many borrowers request loans from one Local Bank
- **BORROWER (1) → (N) LOAN_REQUEST**: One borrower can have many loan requests
- **LOCAL_BANK (1) → (N) LOAN_REQUEST**: One Local Bank receives many loan requests
- **BANK_USER (1) → (N) LOAN_REQUEST** (approved_by): One Bank User approves many loans

### 5.3 Transaction Tracking

- **LOAN_REQUEST (1) → (N) INSTALLMENT**: One loan can have many installments
- **LOAN_REQUEST (1) → (N) TRANSACTION**: One loan generates many transactions
- **BORROWER (1) → (N) TRANSACTION**: One borrower has many transactions
- **BORROWER (1) → (1) BORROWING_LIMIT**: One borrower has one limit record

### 5.4 Communication

- **LOAN_REQUEST (1) → (N) CHAT_MESSAGE**: One loan request has many chat messages
- **BORROWER (1) → (N) CHAT_MESSAGE**: One borrower sends many messages
- **BANK_USER (1) → (N) CHAT_MESSAGE**: One Bank User sends many messages

### 5.5 Security & AI/ML

- **LOAN_REQUEST (1) → (N) AI_ML_SECURITY_LOG**: One loan can have many security logs
- **TRANSACTION (1) → (N) AI_ML_SECURITY_LOG**: One transaction can have many security logs
- **BANK_USER (1) → (N) AI_ML_SECURITY_LOG** (reviewed_by): One Bank User reviews many logs

---

## 6. Data Integrity Constraints

### 6.1 Referential Integrity

All foreign keys have `ON DELETE CASCADE` or `ON DELETE SET NULL` as appropriate:
- Deleting a BORROWER cascades to LOAN_REQUEST, TRANSACTION, etc.
- Deleting a BANK_USER sets `approved_by` to NULL in LOAN_REQUEST
- Deleting a LOAN_REQUEST cascades to INSTALLMENT, CHAT_MESSAGE

### 6.2 Check Constraints

1. **BANK_USER**: Only one user per bank can have `role = 'approver'`
2. **LOAN_REQUEST**: `amount >= 0`, `deadline > approved_at` (if installment)
3. **INSTALLMENT**: `installment_number > 0`, `amount_due > 0`
4. **BORROWING_LIMIT**: `six_month_remaining >= 0`, `one_year_remaining >= 0`
5. **TRANSACTION**: `amount > 0`

### 6.3 Unique Constraints

1. **BORROWER**: One loan request per bank per borrower (enforced at application level)
2. **BANK_USER**: Only one approver per bank (enforced at application level)
3. **BLOCKCHAIN_TX_HASH**: All transaction hashes must be unique

---

## 7. Indexing Strategy

### 7.1 Primary Indexes
- All tables have auto-incrementing primary keys

### 7.2 Foreign Key Indexes
- All foreign keys are indexed for join performance

### 7.3 Query Optimization Indexes
- `LOAN_REQUEST(status, borrower_id)` - Fast pending loan queries
- `TRANSACTION(borrower_id, transaction_date)` - Fast limit calculations
- `INSTALLMENT(status, due_date)` - Fast overdue installment queries
- `CHAT_MESSAGE(loan_id, sent_at)` - Fast chat history retrieval
- `AI_ML_SECURITY_LOG(risk_type, detected_at)` - Fast security monitoring

---

## 8. Data Flow for AI/ML Security Layer

### 8.1 Data Collection Points

1. **Loan Request**: Store in `LOAN_REQUEST` → Feed to `AI_ML_SECURITY_LOG`
2. **Transaction**: Store in `TRANSACTION` → Feed to `AI_ML_SECURITY_LOG`
3. **User Behavior**: Track wallet patterns → Store in `AI_ML_SECURITY_LOG`

### 8.2 Feature Extraction

From `LOAN_REQUEST`:
- Amount, purpose, borrower history
- Time patterns, frequency

From `TRANSACTION`:
- Payment patterns, delays
- Amount variations

From `BORROWER`:
- Consecutive paid loans
- Lifetime borrowing

### 8.3 Monitoring Queries

```sql
-- Get all transactions for a borrower in last 6 months
SELECT * FROM TRANSACTION 
WHERE borrower_id = ? 
AND transaction_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH);

-- Get all security logs for a loan
SELECT * FROM AI_ML_SECURITY_LOG 
WHERE loan_id = ? 
ORDER BY detected_at DESC;

-- Get risk patterns by type
SELECT risk_type, AVG(risk_score), COUNT(*) 
FROM AI_ML_SECURITY_LOG 
WHERE detected_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY risk_type;
```

---

## 9. Database Normalization

### 9.1 Normalization Level

All tables are in **3NF (Third Normal Form)**:
- No transitive dependencies
- All non-key attributes depend only on the primary key
- No redundant data

### 9.2 Denormalization Considerations

For performance, some calculated fields are stored:
- `BORROWING_LIMIT.six_month_remaining` - Calculated but cached
- `BORROWER.consecutive_paid_loans` - Updated on transaction completion

These are updated via triggers or application logic to maintain consistency.

---

## 10. Backup and Recovery Strategy

### 10.1 Backup Schedule
- **Full Backup**: Daily at 2 AM
- **Incremental Backup**: Every 6 hours
- **Transaction Log Backup**: Every 15 minutes

### 10.2 Retention Policy
- Full backups: 30 days
- Incremental backups: 7 days
- Transaction logs: 3 days

### 10.3 Recovery Objectives
- **RTO (Recovery Time Objective)**: 4 hours
- **RPO (Recovery Point Objective)**: 15 minutes

---

## 11. Security Considerations

### 11.1 Data Encryption
- **At Rest**: AES-256 encryption for sensitive fields (wallet addresses, file paths)
- **In Transit**: TLS 1.3 for all database connections

### 11.2 Access Control
- Role-based access control (RBAC)
- Database users with minimal privileges
- Audit logging for all DDL and DML operations

### 11.3 PII Protection
- Wallet addresses are hashed in logs
- Income proof files stored in encrypted storage
- GDPR compliance for user data deletion

---

## 12. Scalability Considerations

### 12.1 Partitioning Strategy
- **TRANSACTION**: Partitioned by `transaction_date` (monthly partitions)
- **AI_ML_SECURITY_LOG**: Partitioned by `detected_at` (monthly partitions)
- **MARKET_DATA**: Partitioned by `timestamp` (daily partitions)

### 12.2 Read Replicas
- 3 read replicas for query load distribution
- Primary database for writes only

### 12.3 Caching Strategy
- Redis cache for frequently accessed data:
  - Borrowing limits
  - Market data (5-minute TTL)
  - Active loan statuses

---

## 13. Sample Queries

### 13.1 Get Borrower's Active Loans with Deadlines

```sql
SELECT 
    lr.loan_id,
    lr.amount,
    lr.deadline,
    lr.status,
    lb.name AS bank_name,
    COUNT(i.installment_id) AS total_installments,
    SUM(CASE WHEN i.status = 'paid' THEN 1 ELSE 0 END) AS paid_installments
FROM LOAN_REQUEST lr
JOIN LOCAL_BANK lb ON lr.local_bank_id = lb.local_bank_id
LEFT JOIN INSTALLMENT i ON lr.loan_id = i.loan_id
WHERE lr.borrower_id = ?
AND lr.status IN ('approved', 'active')
GROUP BY lr.loan_id;
```

### 13.2 Calculate Borrowing Limit for 6 Months

```sql
SELECT 
    b.borrower_id,
    COALESCE(SUM(CASE 
        WHEN t.transaction_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        THEN t.amount ELSE 0 
    END), 0) AS six_month_borrowed,
    CASE 
        WHEN b.consecutive_paid_loans >= 3 THEN 
            COALESCE(SUM(t.amount), 0) * 2  -- Can borrow 2x if good history
        ELSE 
            COALESCE(SUM(t.amount), 0)      -- Normal limit
    END AS six_month_limit
FROM BORROWER b
LEFT JOIN TRANSACTION t ON b.borrower_id = t.borrower_id
WHERE b.borrower_id = ?
GROUP BY b.borrower_id;
```

### 13.3 Get Pending Loan Requests for a Bank

```sql
SELECT 
    lr.loan_id,
    lr.amount,
    lr.purpose,
    lr.requested_at,
    b.name AS borrower_name,
    b.wallet_address,
    ip.status AS income_proof_status
FROM LOAN_REQUEST lr
JOIN BORROWER b ON lr.borrower_id = b.borrower_id
LEFT JOIN INCOME_PROOF ip ON b.borrower_id = ip.borrower_id 
    AND ip.status = 'pending'
WHERE lr.local_bank_id = ?
AND lr.status = 'pending'
ORDER BY lr.requested_at ASC;
```

---

## 14. Conclusion

This relational database design supports:
- ✅ Hierarchical banking structure (World → National → Local → Users)
- ✅ Complete loan lifecycle management
- ✅ Installment payment tracking
- ✅ Borrowing limit calculations
- ✅ Chat system between borrowers and banks
- ✅ AI/ML security monitoring data structure
- ✅ Income verification for first-time borrowers
- ✅ Market data for cryptocurrency visualization
- ✅ Profile management for all user types
- ✅ Terms and conditions tracking

The database is designed to be scalable, secure, and optimized for the complex requirements of a decentralized lending platform with AI/ML security layers.

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** Database Design Team  
**Course:** CSE370 - Database Management

