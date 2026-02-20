```mermaid
erDiagram
    WORLD_BANK {
        int world_bank_id PK
        varchar_100 name UK
        decimal_20_8 total_reserve
        decimal_20_8 total_lent
        decimal_20_8 total_received
        boolean is_paused
        timestamp created_at
        timestamp updated_at
    }

    NATIONAL_BANK {
        int national_bank_id PK
        int world_bank_id FK
        varchar_100 name
        varchar_50 country
        varchar_255 address
        varchar_42 wallet_address UK
        decimal_20_8 total_borrowed
        decimal_20_8 total_lent
        decimal_20_8 total_received
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    LOCAL_BANK {
        int local_bank_id PK
        int national_bank_id FK
        varchar_100 name
        varchar_50 city
        varchar_255 address
        varchar_42 wallet_address UK
        decimal_20_8 total_borrowed
        decimal_20_8 total_lent
        decimal_20_8 total_received
        decimal_20_8 available_capacity
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    BANK_USER {
        int bank_user_id PK
        varchar_42 wallet_address UK
        enum bank_type
        int national_bank_id FK
        int local_bank_id FK
        varchar_100 name
        varchar_100 email UK
        varchar_20 phone
        enum role
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    BORROWER {
        int borrower_id PK
        varchar_42 wallet_address UK
        varchar_100 name
        varchar_100 email UK
        varchar_20 phone
        varchar_50 country
        varchar_50 city
        boolean is_first_time
        decimal_20_8 total_borrowed_lifetime
        int consecutive_paid_loans
        boolean can_multiple_loans
        int max_active_loans
        timestamp created_at
        timestamp updated_at
    }

    INCOME_PROOF {
        int proof_id PK
        int borrower_id FK
        varchar_500 file_path
        varchar_64 file_hash
        varchar_50 file_type
        bigint file_size
        enum status
        int reviewed_by FK
        timestamp reviewed_at
        text notes
        timestamp uploaded_at
    }

    LOAN_REQUEST {
        int loan_id PK
        int borrower_id FK
        int local_bank_id FK
        decimal_20_8 amount
        varchar_500 purpose
        varchar_10 cryptocurrency_type
        enum status
        timestamp requested_at
        int approved_by FK
        timestamp approved_at
        int rejected_by FK
        timestamp rejected_at
        text rejection_reason
        decimal_20_8 gas_cost
        boolean is_installment
        int total_installments
        timestamp deadline
        timestamp completed_at
        varchar_66 blockchain_tx_hash UK
        decimal_5_2 interest_rate
        decimal_20_8 total_interest
        timestamp created_at
        timestamp updated_at
    }

    INSTALLMENT {
        int installment_id PK
        int loan_id FK
        int installment_number
        decimal_20_8 amount_due
        decimal_20_8 amount_paid
        decimal_20_8 late_fee
        timestamp due_date
        timestamp paid_at
        enum status
        varchar_66 blockchain_tx_hash UK
        timestamp created_at
        timestamp updated_at
    }

    TRANSACTION {
        int transaction_id PK
        int borrower_id FK
        int local_bank_id FK
        int national_bank_id FK
        enum transaction_type
        decimal_20_8 amount
        varchar_10 cryptocurrency_type
        timestamp transaction_date
        varchar_66 blockchain_tx_hash UK
        int related_loan_id FK
        varchar_255 description
        timestamp created_at
    }

    BORROWING_LIMIT {
        int limit_id PK
        int borrower_id FK_UK
        decimal_20_8 six_month_limit
        decimal_20_8 six_month_borrowed
        decimal_20_8 six_month_remaining
        decimal_20_8 one_year_limit
        decimal_20_8 one_year_borrowed
        decimal_20_8 one_year_remaining
        int active_loan_count
        boolean limit_exceeded
        timestamp last_calculated_at
        timestamp updated_at
    }

    CHAT_MESSAGE {
        int message_id PK
        int loan_id FK
        enum sender_type
        int sender_id
        enum receiver_type
        int receiver_id
        text message_text
        boolean is_read
        timestamp sent_at
        timestamp read_at
    }

    AI_CHATBOT_LOG {
        int log_id PK
        varchar_42 user_wallet
        enum user_type
        text question
        text response
        varchar_50 intent
        decimal_5_2 confidence
        varchar_50 data_source
        int response_time_ms
        timestamp created_at
    }

    AI_ML_SECURITY_LOG {
        int security_log_id PK
        int loan_id FK
        int transaction_id FK
        varchar_42 user_wallet
        enum risk_type
        decimal_5_2 risk_score
        varchar_50 ml_model
        json features
        text explanation
        enum action_taken
        timestamp detected_at
        int reviewed_by FK
        timestamp reviewed_at
        text review_notes
    }

    MARKET_DATA {
        int market_data_id PK
        varchar_10 cryptocurrency_type
        decimal_20_2 price_usd
        decimal_20_8 price_eth
        decimal_20_2 volume_24h
        decimal_20_2 market_cap
        decimal_5_2 change_24h
        decimal_5_2 change_7d
        varchar_50 data_source
        timestamp fetched_at
    }

    PROFILE_SETTINGS {
        int profile_id PK
        enum user_type
        int user_id
        boolean terms_accepted
        varchar_20 terms_version
        timestamp terms_accepted_at
        json preferences
        varchar_100 display_name
        varchar_500 avatar_url
        boolean notifications_enabled
        boolean email_alerts
        timestamp created_at
        timestamp updated_at
    }

    WORLD_BANK ||--o{ NATIONAL_BANK : "registers and lends to"
    NATIONAL_BANK ||--o{ LOCAL_BANK : "registers and lends to"
    NATIONAL_BANK ||--o{ BANK_USER : "employs (bank_type = national)"
    LOCAL_BANK ||--o{ BANK_USER : "employs (bank_type = local)"
    BORROWER ||--o{ LOAN_REQUEST : "requests loans"
    LOCAL_BANK ||--o{ LOAN_REQUEST : "receives loan requests"
    BANK_USER ||--o{ LOAN_REQUEST : "approves (approved_by FK)"
    BANK_USER ||--o{ LOAN_REQUEST : "rejects (rejected_by FK)"
    LOAN_REQUEST ||--o{ INSTALLMENT : "split into installments"
    LOAN_REQUEST ||--o{ TRANSACTION : "generates transactions"
    BORROWER ||--o{ TRANSACTION : "participates in"
    LOCAL_BANK ||--o{ TRANSACTION : "processes (local level)"
    NATIONAL_BANK ||--o{ TRANSACTION : "processes (national level)"
    BORROWER ||--|| BORROWING_LIMIT : "has one limit record"
    BORROWER ||--o{ INCOME_PROOF : "submits proof documents"
    BANK_USER ||--o{ INCOME_PROOF : "reviews (reviewed_by FK)"
    LOAN_REQUEST ||--o{ CHAT_MESSAGE : "has chat thread"
    LOAN_REQUEST ||--o{ AI_ML_SECURITY_LOG : "monitored for fraud/anomaly"
    TRANSACTION ||--o{ AI_ML_SECURITY_LOG : "monitored for fraud/anomaly"
    BANK_USER ||--o{ AI_ML_SECURITY_LOG : "reviews security alerts"
```
