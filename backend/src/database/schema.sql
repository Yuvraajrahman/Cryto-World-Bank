-- Crypto World Bank Database Schema
-- Sprint 1: Foundation & Core Banking

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS crypto_world_bank;
USE crypto_world_bank;

-- 1. WORLD_BANK Table
CREATE TABLE IF NOT EXISTS WORLD_BANK (
    world_bank_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    total_reserve DECIMAL(20,8) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- 2. NATIONAL_BANK Table
CREATE TABLE IF NOT EXISTS NATIONAL_BANK (
    national_bank_id INT PRIMARY KEY AUTO_INCREMENT,
    world_bank_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(50) NOT NULL,
    address VARCHAR(255),
    total_borrowed DECIMAL(20,8) DEFAULT 0,
    total_lent DECIMAL(20,8) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (world_bank_id) REFERENCES WORLD_BANK(world_bank_id),
    INDEX idx_country (country)
);

-- 3. LOCAL_BANK Table
CREATE TABLE IF NOT EXISTS LOCAL_BANK (
    local_bank_id INT PRIMARY KEY AUTO_INCREMENT,
    national_bank_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    address VARCHAR(255),
    total_borrowed DECIMAL(20,8) DEFAULT 0,
    total_lent DECIMAL(20,8) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (national_bank_id) REFERENCES NATIONAL_BANK(national_bank_id),
    INDEX idx_city (city)
);

-- 4. BANK_USER Table
CREATE TABLE IF NOT EXISTS BANK_USER (
    bank_user_id INT PRIMARY KEY AUTO_INCREMENT,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    bank_type ENUM('national', 'local') NOT NULL,
    national_bank_id INT NULL,
    local_bank_id INT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role ENUM('approver', 'viewer') NOT NULL DEFAULT 'approver',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (national_bank_id) REFERENCES NATIONAL_BANK(national_bank_id),
    FOREIGN KEY (local_bank_id) REFERENCES LOCAL_BANK(local_bank_id),
    CHECK ((bank_type = 'national' AND national_bank_id IS NOT NULL AND local_bank_id IS NULL) OR
           (bank_type = 'local' AND local_bank_id IS NOT NULL AND national_bank_id IS NULL))
);

-- 5. BORROWER Table
CREATE TABLE IF NOT EXISTS BORROWER (
    borrower_id INT PRIMARY KEY AUTO_INCREMENT,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    country VARCHAR(50) NOT NULL,
    city VARCHAR(50),
    is_first_time BOOLEAN NOT NULL DEFAULT TRUE,
    total_borrowed_lifetime DECIMAL(20,8) DEFAULT 0,
    consecutive_paid_loans INT DEFAULT 0,
    can_multiple_loans BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_wallet (wallet_address),
    INDEX idx_location (country, city)
);

-- 6. INCOME_PROOF Table
CREATE TABLE IF NOT EXISTS INCOME_PROOF (
    proof_id INT PRIMARY KEY AUTO_INCREMENT,
    borrower_id INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    notes TEXT,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (borrower_id) REFERENCES BORROWER(borrower_id),
    FOREIGN KEY (reviewed_by) REFERENCES BANK_USER(bank_user_id),
    INDEX idx_status_borrower (status, borrower_id)
);

-- 7. LOAN_REQUEST Table
CREATE TABLE IF NOT EXISTS LOAN_REQUEST (
    loan_id INT PRIMARY KEY AUTO_INCREMENT,
    borrower_id INT NOT NULL,
    local_bank_id INT NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    purpose VARCHAR(500) NOT NULL,
    cryptocurrency_type VARCHAR(10) NOT NULL DEFAULT 'ETH',
    status ENUM('pending', 'approved', 'rejected', 'active', 'completed', 'defaulted') NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    rejected_by INT NULL,
    rejected_at TIMESTAMP NULL,
    rejection_reason TEXT,
    gas_cost DECIMAL(20,8) DEFAULT 0,
    is_installment BOOLEAN NOT NULL DEFAULT FALSE,
    total_installments INT DEFAULT 1,
    deadline TIMESTAMP NULL,
    blockchain_tx_hash VARCHAR(66) UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (borrower_id) REFERENCES BORROWER(borrower_id),
    FOREIGN KEY (local_bank_id) REFERENCES LOCAL_BANK(local_bank_id),
    FOREIGN KEY (approved_by) REFERENCES BANK_USER(bank_user_id),
    FOREIGN KEY (rejected_by) REFERENCES BANK_USER(bank_user_id),
    INDEX idx_status_borrower (status, borrower_id),
    INDEX idx_status_bank (status, local_bank_id),
    INDEX idx_deadline (deadline)
);

-- 8. INSTALLMENT Table
CREATE TABLE IF NOT EXISTS INSTALLMENT (
    installment_id INT PRIMARY KEY AUTO_INCREMENT,
    loan_id INT NOT NULL,
    installment_number INT NOT NULL,
    amount_due DECIMAL(20,8) NOT NULL,
    amount_paid DECIMAL(20,8) DEFAULT 0,
    due_date TIMESTAMP NOT NULL,
    paid_at TIMESTAMP NULL,
    status ENUM('pending', 'paid', 'overdue', 'partial') NOT NULL DEFAULT 'pending',
    blockchain_tx_hash VARCHAR(66) UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES LOAN_REQUEST(loan_id),
    UNIQUE KEY unique_loan_installment (loan_id, installment_number),
    INDEX idx_status_due (status, due_date)
);

-- 9. TRANSACTION Table
CREATE TABLE IF NOT EXISTS TRANSACTION (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    borrower_id INT NULL,
    local_bank_id INT NULL,
    national_bank_id INT NULL,
    transaction_type ENUM('loan_approved', 'installment_paid', 'loan_completed', 'loan_defaulted') NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    cryptocurrency_type VARCHAR(10) NOT NULL DEFAULT 'ETH',
    transaction_date TIMESTAMP NOT NULL,
    blockchain_tx_hash VARCHAR(66) UNIQUE,
    related_loan_id INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (borrower_id) REFERENCES BORROWER(borrower_id),
    FOREIGN KEY (local_bank_id) REFERENCES LOCAL_BANK(local_bank_id),
    FOREIGN KEY (national_bank_id) REFERENCES NATIONAL_BANK(national_bank_id),
    FOREIGN KEY (related_loan_id) REFERENCES LOAN_REQUEST(loan_id),
    INDEX idx_type_date (transaction_type, transaction_date),
    INDEX idx_borrower_date (borrower_id, transaction_date),
    INDEX idx_date (transaction_date)
);

-- 10. BORROWING_LIMIT Table
CREATE TABLE IF NOT EXISTS BORROWING_LIMIT (
    limit_id INT PRIMARY KEY AUTO_INCREMENT,
    borrower_id INT NOT NULL UNIQUE,
    six_month_limit DECIMAL(20,8) NOT NULL DEFAULT 0,
    six_month_borrowed DECIMAL(20,8) NOT NULL DEFAULT 0,
    six_month_remaining DECIMAL(20,8) NOT NULL DEFAULT 0,
    one_year_limit DECIMAL(20,8) NOT NULL DEFAULT 0,
    one_year_borrowed DECIMAL(20,8) NOT NULL DEFAULT 0,
    one_year_remaining DECIMAL(20,8) NOT NULL DEFAULT 0,
    last_calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (borrower_id) REFERENCES BORROWER(borrower_id)
);

-- 11. CHAT_MESSAGE Table
CREATE TABLE IF NOT EXISTS CHAT_MESSAGE (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    loan_id INT NOT NULL,
    sender_type ENUM('borrower', 'bank') NOT NULL,
    sender_id INT NOT NULL,
    receiver_type ENUM('borrower', 'bank') NOT NULL,
    receiver_id INT NOT NULL,
    message_text TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (loan_id) REFERENCES LOAN_REQUEST(loan_id),
    INDEX idx_loan_sent (loan_id, sent_at),
    INDEX idx_sender (sender_id, sender_type, sent_at),
    INDEX idx_receiver (receiver_id, receiver_type, is_read)
);

-- 12. AI_CHATBOT_LOG Table
CREATE TABLE IF NOT EXISTS AI_CHATBOT_LOG (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_wallet VARCHAR(42) NOT NULL,
    user_type ENUM('borrower', 'bank_user', 'national_bank', 'local_bank') NOT NULL,
    question TEXT NOT NULL,
    response TEXT NOT NULL,
    intent VARCHAR(50),
    confidence DECIMAL(5,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_wallet_date (user_wallet, created_at),
    INDEX idx_intent_date (intent, created_at)
);

-- 13. AI_ML_SECURITY_LOG Table
CREATE TABLE IF NOT EXISTS AI_ML_SECURITY_LOG (
    security_log_id INT PRIMARY KEY AUTO_INCREMENT,
    loan_id INT NULL,
    transaction_id INT NULL,
    user_wallet VARCHAR(42) NOT NULL,
    risk_type ENUM('fraud', 'anomaly', 'attack', 'suspicious_pattern') NOT NULL,
    risk_score DECIMAL(5,2) NOT NULL,
    ml_model VARCHAR(50),
    features JSON,
    explanation TEXT,
    action_taken ENUM('none', 'flagged', 'blocked', 'reviewed') NOT NULL DEFAULT 'flagged',
    detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (loan_id) REFERENCES LOAN_REQUEST(loan_id),
    FOREIGN KEY (transaction_id) REFERENCES TRANSACTION(transaction_id),
    FOREIGN KEY (reviewed_by) REFERENCES BANK_USER(bank_user_id),
    INDEX idx_risk_date (risk_type, detected_at),
    INDEX idx_wallet_date (user_wallet, detected_at),
    INDEX idx_score_date (risk_score, detected_at)
);

-- 14. MARKET_DATA Table
CREATE TABLE IF NOT EXISTS MARKET_DATA (
    market_data_id INT PRIMARY KEY AUTO_INCREMENT,
    cryptocurrency_type VARCHAR(10) NOT NULL,
    price_usd DECIMAL(20,2) NOT NULL,
    price_eth DECIMAL(20,8) NOT NULL,
    volume_24h DECIMAL(20,2),
    market_cap DECIMAL(20,2),
    change_24h DECIMAL(5,2),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_crypto_timestamp (cryptocurrency_type, timestamp),
    INDEX idx_timestamp (timestamp)
);

-- 15. PROFILE_SETTINGS Table
CREATE TABLE IF NOT EXISTS PROFILE_SETTINGS (
    profile_id INT PRIMARY KEY AUTO_INCREMENT,
    user_type ENUM('borrower', 'bank_user', 'national_bank', 'local_bank', 'world_bank') NOT NULL,
    user_id INT NOT NULL,
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    terms_version VARCHAR(20),
    terms_accepted_at TIMESTAMP NULL,
    preferences JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_profile (user_type, user_id),
    INDEX idx_terms (terms_accepted)
);

-- Insert initial World Bank record
INSERT INTO WORLD_BANK (name, total_reserve) VALUES ('Crypto World Bank', 0) ON DUPLICATE KEY UPDATE name=name;

