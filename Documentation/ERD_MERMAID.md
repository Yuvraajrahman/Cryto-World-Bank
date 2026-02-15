# Crypto World Bank - Database ERD (Mermaid)

Entity-Relationship Diagram for the Crypto World Bank database management system.

## How to View

- **In Cursor/VS Code:** Open this file and use `Ctrl+Shift+V` (or `Cmd+Shift+V` on Mac) for Markdown preview
- **Online:** Copy the Mermaid block below and paste at [mermaid.live](https://mermaid.live)

---

```mermaid
erDiagram
    WORLD_BANK {
        int world_bank_id PK
        string name UK
        decimal total_reserve
        timestamp created_at
        timestamp updated_at
    }
    
    NATIONAL_BANK {
        int national_bank_id PK
        int world_bank_id FK
        string name
        string country
        string address
        decimal total_borrowed
        decimal total_lent
        timestamp created_at
        timestamp updated_at
    }
    
    LOCAL_BANK {
        int local_bank_id PK
        int national_bank_id FK
        string name
        string city
        string address
        decimal total_borrowed
        decimal total_lent
        timestamp created_at
        timestamp updated_at
    }
    
    BANK_USER {
        int bank_user_id PK
        string wallet_address UK
        string bank_type
        int national_bank_id FK
        int local_bank_id FK
        string name
        string email UK
        string role
        boolean is_active
        timestamp created_at
    }
    
    BORROWER {
        int borrower_id PK
        string wallet_address UK
        string name
        string email UK
        string phone
        string country
        string city
        boolean is_first_time
        decimal total_borrowed_lifetime
        int consecutive_paid_loans
        boolean can_multiple_loans
        timestamp created_at
        timestamp updated_at
    }
    
    LOAN_REQUEST {
        int loan_id PK
        int borrower_id FK
        int local_bank_id FK
        decimal amount
        string purpose
        string cryptocurrency_type
        string status
        int approved_by FK
        int rejected_by FK
        boolean is_installment
        int total_installments
        string blockchain_tx_hash UK
        timestamp deadline
        timestamp created_at
        timestamp updated_at
    }
    
    INSTALLMENT {
        int installment_id PK
        int loan_id FK
        int installment_number
        decimal amount_due
        decimal amount_paid
        string status
        timestamp due_date
        string blockchain_tx_hash UK
        timestamp created_at
        timestamp updated_at
    }
    
    TRANSACTION {
        int transaction_id PK
        int borrower_id FK
        int local_bank_id FK
        int national_bank_id FK
        int related_loan_id FK
        string transaction_type
        decimal amount
        string blockchain_tx_hash UK
        timestamp transaction_date
        timestamp created_at
    }
    
    BORROWING_LIMIT {
        int limit_id PK
        int borrower_id FK UK
        decimal six_month_limit
        decimal six_month_remaining
        decimal one_year_limit
        decimal one_year_remaining
        timestamp last_calculated_at
        timestamp updated_at
    }
    
    INCOME_PROOF {
        int proof_id PK
        int borrower_id FK
        int reviewed_by FK
        string file_path
        string status
        timestamp uploaded_at
    }
    
    CHAT_MESSAGE {
        int message_id PK
        int loan_id FK
        string sender_type
        int sender_id
        string receiver_type
        int receiver_id
        text message_text
        boolean is_read
        timestamp sent_at
    }
    
    AI_CHATBOT_LOG {
        int log_id PK
        string user_wallet
        string user_type
        text question
        text response
        string intent
        timestamp created_at
    }
    
    AI_ML_SECURITY_LOG {
        int security_log_id PK
        int loan_id FK
        int transaction_id FK
        int reviewed_by FK
        string user_wallet
        string risk_type
        decimal risk_score
        string action_taken
        timestamp detected_at
    }
    
    MARKET_DATA {
        int market_data_id PK
        string cryptocurrency_type
        decimal price_usd
        decimal volume_24h
        decimal market_cap
        timestamp timestamp
    }
    
    PROFILE_SETTINGS {
        int profile_id PK
        string user_type
        int user_id
        boolean terms_accepted
        json preferences
        timestamp created_at
        timestamp updated_at
    }
    
    WORLD_BANK ||--o{ NATIONAL_BANK : "has"
    NATIONAL_BANK ||--o{ LOCAL_BANK : "has"
    NATIONAL_BANK ||--o{ BANK_USER : "employs"
    LOCAL_BANK ||--o{ BANK_USER : "employs"
    LOCAL_BANK ||--o{ LOAN_REQUEST : "receives"
    BORROWER ||--o{ LOAN_REQUEST : "requests"
    BANK_USER ||--o{ LOAN_REQUEST : "approves"
    BANK_USER ||--o{ LOAN_REQUEST : "rejects"
    LOAN_REQUEST ||--o{ INSTALLMENT : "has"
    LOAN_REQUEST ||--o{ TRANSACTION : "generates"
    BORROWER ||--o{ TRANSACTION : "has"
    LOCAL_BANK ||--o{ TRANSACTION : "processes"
    NATIONAL_BANK ||--o{ TRANSACTION : "processes"
    LOAN_REQUEST ||--o| TRANSACTION : "related_to"
    BORROWER ||--|| BORROWING_LIMIT : "has"
    BORROWER ||--o{ INCOME_PROOF : "submits"
    BANK_USER ||--o{ INCOME_PROOF : "reviews"
    LOAN_REQUEST ||--o{ CHAT_MESSAGE : "has"
    LOAN_REQUEST ||--o{ AI_ML_SECURITY_LOG : "monitored"
    TRANSACTION ||--o{ AI_ML_SECURITY_LOG : "monitored"
    BANK_USER ||--o{ AI_ML_SECURITY_LOG : "reviews"
```

---

## Entity Summary

| Entity | Description |
|--------|-------------|
| **WORLD_BANK** | Top-level reserve holder |
| **NATIONAL_BANK** | Country-level banks (borrow from World Bank) |
| **LOCAL_BANK** | City-level banks (borrow from National Banks) |
| **BANK_USER** | Bank staff who approve/reject loans |
| **BORROWER** | End-users requesting loans |
| **LOAN_REQUEST** | Loan applications and lifecycle |
| **INSTALLMENT** | Installment payment records |
| **TRANSACTION** | All financial transactions |
| **BORROWING_LIMIT** | Calculated limits per borrower |
| **INCOME_PROOF** | Income verification documents |
| **CHAT_MESSAGE** | Borrower–bank chat messages |
| **AI_CHATBOT_LOG** | AI chatbot interaction logs |
| **AI_ML_SECURITY_LOG** | Security/ML monitoring data |
| **MARKET_DATA** | Cryptocurrency market data |
| **PROFILE_SETTINGS** | User profiles and terms |

## Relationship Legend

- `||--o{` : One to zero-or-more
- `||--||` : One to one
