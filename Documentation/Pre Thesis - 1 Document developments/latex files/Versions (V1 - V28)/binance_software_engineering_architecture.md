# Binance — Full Software Engineering Architecture & System Analysis
> Actors · Use Cases · Activity Flows · Data Flow Diagrams · Sequence Diagrams · Complete Textual Tree

---

## TABLE OF CONTENTS

```
BINANCE SYSTEM ANALYSIS
│
├── 1. Software Architecture Layers
├── 2. Actor Taxonomy (Users · Clients · Authorities)
├── 3. Use Case Diagram
├── 4. Activity Diagrams
│   ├── 4.1 User Registration & KYC
│   ├── 4.2 Authentication (Login + 2FA)
│   ├── 4.3 Crypto Deposit
│   ├── 4.4 Fiat Deposit
│   ├── 4.5 Spot Trade (Buy/Sell)
│   ├── 4.6 Crypto Withdrawal
│   └── 4.7 AML / Compliance Check
├── 5. Data Flow Diagrams
│   ├── 5.1 Level-0 Context Diagram
│   ├── 5.2 Level-1 Process Decomposition
│   └── 5.3 Level-2 Trading Engine Detail
├── 6. Sequence Diagrams
│   ├── 6.1 User Registration
│   ├── 6.2 Login + 2FA
│   ├── 6.3 Place & Match Order
│   ├── 6.4 Crypto Withdrawal
│   └── 6.5 Regulator Audit Request
└── 7. Component Dependency Tree
```

---

## 1. Software Architecture Layers

### 1.1 Top-to-Bottom Layered Architecture

```
BINANCE PLATFORM — FULL ARCHITECTURE STACK
│
├── PRESENTATION LAYER  (Client-Facing)
│   │
│   ├── Web Application
│   │   ├── React.js SPA
│   │   ├── WebSocket client (real-time prices)
│   │   └── Chart UI (TradingView / Highcharts)
│   │
│   ├── Mobile Applications
│   │   ├── iOS (Swift / React Native)
│   │   └── Android (Kotlin / React Native)
│   │
│   ├── Desktop App
│   │   └── Electron wrapper
│   │
│   └── API Clients (Institutional / Bots)
│       ├── REST API (HTTPS)
│       └── WebSocket Streams (market data, user data)
│
├── EDGE / GATEWAY LAYER
│   │
│   ├── CDN (Cloudflare / Akamai)
│   │   ├── Static asset caching
│   │   ├── DDoS mitigation
│   │   └── Global edge routing
│   │
│   └── API Gateway (Nginx / Kong)
│       ├── TLS 1.3 termination
│       ├── Rate limiting (IP + user-level)
│       ├── Request routing
│       ├── HMAC-SHA256 API key verification
│       └── IP whitelisting enforcement
│
├── APPLICATION / MICROSERVICES LAYER
│   │
│   ├── Auth Service
│   │   ├── JWT / session token issuance
│   │   ├── 2FA (TOTP, SMS, passkey)
│   │   ├── Device fingerprinting
│   │   └── Session revocation
│   │
│   ├── User Service
│   │   ├── Profile management
│   │   ├── Tier / fee level management
│   │   └── Preferences + settings
│   │
│   ├── KYC / AML Service
│   │   ├── Document collection
│   │   ├── Provider integration (Jumio / Sumsub)
│   │   ├── Risk scoring engine
│   │   ├── Sanctions screening (OFAC, UN)
│   │   ├── Chainalysis / Elliptic integration
│   │   └── Suspicious activity reporting (SAR)
│   │
│   ├── Order Management System (OMS)
│   │   ├── Order validation
│   │   ├── Balance lock (pre-trade)
│   │   ├── Order routing
│   │   └── Order state machine
│   │
│   ├── Matching Engine
│   │   ├── In-memory order book
│   │   ├── Price-time priority (FIFO)
│   │   ├── Order types: LIMIT / MARKET / STOP / OCO
│   │   └── Trade event emission → Kafka
│   │
│   ├── Settlement Service
│   │   ├── Atomic balance update
│   │   ├── Fee deduction
│   │   └── SAFU fee contribution (10%)
│   │
│   ├── Wallet Service
│   │   ├── Deposit address generation
│   │   ├── Blockchain monitoring (confirmations)
│   │   ├── Hot wallet management (MPC)
│   │   ├── Cold wallet sweep scheduling
│   │   └── Withdrawal signing + broadcast
│   │
│   ├── Fiat Gateway Service
│   │   ├── Bank API integrations
│   │   ├── Payment processor (Paysafe, Clear Junction)
│   │   └── Fiat-to-balance reconciliation
│   │
│   ├── Notification Service
│   │   ├── Email (SendGrid)
│   │   ├── SMS (Twilio)
│   │   └── Push (FCM / APNs)
│   │
│   ├── Market Data Service
│   │   ├── OHLCV aggregation
│   │   ├── WebSocket broadcasting
│   │   └── Ticker / depth / trade streams
│   │
│   └── Admin / Operations Service
│       ├── Role-based access control (RBAC)
│       ├── Account freeze / unfreeze
│       ├── Compliance dashboard
│       └── Audit trail
│
├── MESSAGING / EVENT LAYER
│   │
│   ├── Apache Kafka
│   │   ├── Topic: trade-executed
│   │   ├── Topic: order-events
│   │   ├── Topic: deposit-confirmed
│   │   ├── Topic: withdrawal-requested
│   │   ├── Topic: kyc-status-changed
│   │   └── Topic: aml-alert
│   │
│   └── Redis Pub/Sub
│       ├── Live order book deltas
│       └── WebSocket price feed
│
├── DATA STORAGE LAYER
│   │
│   ├── PostgreSQL  (primary relational DB)
│   │   ├── users, sessions, kyc_records
│   │   ├── orders, trades, fees
│   │   ├── wallets, wallet_transactions
│   │   └── audit_logs, notifications
│   │
│   ├── Redis  (in-memory cache)
│   │   ├── Session tokens
│   │   ├── Live order book snapshots
│   │   └── Rate limit counters
│   │
│   ├── Apache Cassandra  (distributed order book)
│   │   ├── Multi-datacenter replication
│   │   └── Eventual consistency (per DC)
│   │
│   ├── TimescaleDB  (time-series)
│   │   ├── OHLCV price candles
│   │   └── Volume aggregations
│   │
│   └── VeloDB  (on-chain analytics)
│       ├── BSC transaction ingestion (50k rec/s)
│       └── DeFi / holder analytics
│
├── BLOCKCHAIN LAYER (BNB Chain)
│   │
│   ├── BNB Smart Chain (BSC)
│   │   ├── PoSA Consensus (45 validators)
│   │   ├── EVM-compatible smart contracts
│   │   ├── On-chain settlement (withdrawals)
│   │   └── Scalable DB (multi-database storage)
│   │
│   ├── opBNB  (Layer-2)
│   │   └── High-throughput offload
│   │
│   └── BNB Greenfield  (Decentralized Storage)
│       └── Data ownership / archival
│
└── SECURITY / COMPLIANCE LAYER  (Cross-Cutting)
    │
    ├── HSM (Hardware Security Module) — cold key signing
    ├── MPC — hot wallet key sharding
    ├── SIEM (Splunk / Elastic) — threat monitoring
    ├── WAF (Web Application Firewall)
    ├── Penetration testing (continuous)
    ├── SAFU fund (cold wallet, 10% fees)
    └── Proof of Reserves (Merkle-tree audit)
```

---

## 2. Actor Taxonomy

### 2.1 All System Actors — Top-to-Bottom Tree

```
BINANCE SYSTEM — ALL ACTORS
│
├── PRIMARY ACTORS  (initiate actions)
│   │
│   ├── A1 · RETAIL USER
│   │   ├── Sub-type: Basic (unverified, limits apply)
│   │   ├── Sub-type: Intermediate (KYC Tier 1)
│   │   └── Sub-type: Pro (KYC Tier 2+, higher limits)
│   │
│   ├── A2 · INSTITUTIONAL CLIENT
│   │   ├── Sub-type: API Trader (algo / bot)
│   │   ├── Sub-type: Market Maker (liquidity provider)
│   │   └── Sub-type: OTC Desk client
│   │
│   ├── A3 · PLATFORM ADMINISTRATOR
│   │   ├── Sub-type: Super Admin (full access)
│   │   ├── Sub-type: Compliance Officer
│   │   ├── Sub-type: Support Agent (read-only + limited actions)
│   │   └── Sub-type: System Operator (infra, no user data)
│   │
│   └── A4 · BLOCKCHAIN VALIDATOR NODE
│       ├── Cabinet Validator (top-21 by stake)
│       └── Candidate Validator (backup)
│
└── SECONDARY ACTORS  (external systems / authorities)
    │
    ├── A5 · REGULATORY AUTHORITY
    │   ├── Financial regulator (SEC, FCA, MAS, BaFin...)
    │   ├── Law enforcement (FBI, Interpol, FinCEN)
    │   └── FATF compliance bodies
    │
    ├── A6 · KYC PROVIDER
    │   ├── Jumio (document verification)
    │   └── Sumsub (automated identity checks)
    │
    ├── A7 · AML ANALYTICS PROVIDER
    │   ├── Chainalysis
    │   └── Elliptic
    │
    ├── A8 · PAYMENT PROCESSOR / BANK
    │   ├── Paysafe
    │   ├── Clear Junction
    │   └── Regional banking partners
    │
    ├── A9 · BLOCKCHAIN NETWORK
    │   ├── BNB Smart Chain
    │   ├── Bitcoin network
    │   ├── Ethereum network
    │   └── Other supported chains
    │
    └── A10 · EXTERNAL AUDITOR
        ├── Proof-of-Reserves auditor (Mazars-style)
        └── Cybersecurity auditor
```

### 2.2 Actor Permission Matrix

```
ACTION                      │ Retail │ Institutional │ Admin │ Compliance │ Regulator
────────────────────────────┼────────┼───────────────┼───────┼────────────┼──────────
Register account            │  YES   │     YES       │  NO   │    NO      │   NO
Submit KYC                  │  YES   │     YES       │  NO   │    NO      │   NO
Place spot order            │  YES   │     YES       │  NO   │    NO      │   NO
Place futures order         │  YES*  │     YES       │  NO   │    NO      │   NO
Deposit crypto              │  YES   │     YES       │  NO   │    NO      │   NO
Withdraw crypto             │  YES   │     YES       │  NO   │    NO      │   NO
View own trade history      │  YES   │     YES       │  NO   │    NO      │   NO
Access API (REST/WS)        │  YES   │     YES       │ YES** │    NO      │   NO
Approve KYC                 │  NO    │     NO        │  NO   │    YES     │   NO
Freeze account              │  NO    │     NO        │  YES  │    YES     │   NO
View all user data          │  NO    │     NO        │  YES  │    YES     │   NO
Generate SAR report         │  NO    │     NO        │  NO   │    YES     │   NO
Request audit data          │  NO    │     NO        │  NO   │    YES     │   YES
View platform audit logs    │  NO    │     NO        │  YES  │    YES     │   YES***
Modify system configuration │  NO    │     NO        │  YES  │    NO      │   NO
Access SAFU fund            │  NO    │     NO        │  YES  │    YES     │   NO
────────────────────────────┴────────┴───────────────┴───────┴────────────┴──────────
* requires futures activation   ** admin portal only   *** via legal request
```

---

## 3. Use Case Diagram

### 3.1 Full Use Case Tree (All Actors)

```
BINANCE — USE CASE DIAGRAM (Textual)
│
├── ACTOR: RETAIL / INSTITUTIONAL USER
│   │
│   ├── UC-01  Register Account
│   │   ├── include: UC-02 (Submit KYC)
│   │   └── extend:  UC-03 (Email Verification)
│   │
│   ├── UC-02  Submit KYC Documents
│   │   ├── include: UC-04 (Identity Document Upload)
│   │   ├── include: UC-05 (Liveness Check)
│   │   └── extend:  UC-06 (Enhanced Due Diligence) [if high-risk]
│   │
│   ├── UC-07  Login
│   │   ├── include: UC-08 (Password Authentication)
│   │   └── include: UC-09 (Two-Factor Authentication)
│   │
│   ├── UC-10  Manage API Keys
│   │   ├── Create API key
│   │   ├── Set permissions (READ / TRADE / WITHDRAW)
│   │   └── Bind IP whitelist
│   │
│   ├── UC-11  Deposit Funds
│   │   ├── UC-11a  Deposit Crypto
│   │   │   ├── Select coin + network
│   │   │   ├── Get deposit address
│   │   │   └── Monitor confirmations
│   │   └── UC-11b  Deposit Fiat
│   │       ├── Bank transfer
│   │       └── Card / P2P
│   │
│   ├── UC-12  View Portfolio & Balances
│   │
│   ├── UC-13  Place Spot Order
│   │   ├── UC-13a  Place Limit Order
│   │   ├── UC-13b  Place Market Order
│   │   ├── UC-13c  Place Stop-Limit Order
│   │   └── UC-13d  Place OCO Order
│   │
│   ├── UC-14  Cancel / Modify Order
│   │
│   ├── UC-15  View Order History
│   │
│   ├── UC-16  View Trade History & Fees
│   │
│   ├── UC-17  Withdraw Funds
│   │   ├── UC-17a  Withdraw Crypto
│   │   │   ├── include: UC-18 (Address Whitelist Check)
│   │   │   ├── include: UC-19 (AML Screening)
│   │   │   └── include: UC-20 (2FA Confirmation)
│   │   └── UC-17b  Withdraw Fiat
│   │       └── include: UC-21 (Bank Account Verification)
│   │
│   ├── UC-22  Earn / Staking
│   │   ├── Flexible savings
│   │   └── Locked staking
│   │
│   ├── UC-23  Convert / Swap
│   │
│   ├── UC-24  Access Futures / Margin
│   │   └── extend: UC-25 (Risk Agreement + Activation)
│   │
│   └── UC-26  Access Support / Raise Ticket
│
├── ACTOR: ADMIN / COMPLIANCE OFFICER
│   │
│   ├── UC-27  Review KYC Applications
│   │   ├── Approve
│   │   ├── Reject (with reason)
│   │   └── Request additional documents
│   │
│   ├── UC-28  Manage User Accounts
│   │   ├── Freeze / Suspend account
│   │   ├── Unfreeze account (with audit log)
│   │   ├── Reset 2FA (after verification)
│   │   └── View full user profile + history
│   │
│   ├── UC-29  Monitor Transactions (AML)
│   │   ├── View flagged transactions
│   │   ├── Investigate risk-scored alerts
│   │   └── File Suspicious Activity Report (SAR)
│   │
│   ├── UC-30  Generate Compliance Reports
│   │   ├── Transaction volume reports
│   │   ├── Sanctions screening reports
│   │   └── SAR filing log
│   │
│   ├── UC-31  Manage Asset Listings
│   │   ├── List new trading pair
│   │   ├── Delist / suspend pair
│   │   └── Set trading limits / lot size
│   │
│   └── UC-32  Respond to Regulator Requests
│       ├── Export user transaction data
│       └── Provide audit trail
│
├── ACTOR: REGULATOR / LAW ENFORCEMENT
│   │
│   ├── UC-33  Submit Audit / Data Request
│   ├── UC-34  Receive SAR Reports
│   └── UC-35  Issue Account Freeze Directive
│
├── ACTOR: KYC PROVIDER (Jumio / Sumsub)
│   │
│   ├── UC-36  Receive Document Submission
│   ├── UC-37  Run OCR + Liveness Check
│   └── UC-38  Return Verification Result (PASS/FAIL/REVIEW)
│
├── ACTOR: AML PROVIDER (Chainalysis / Elliptic)
│   │
│   ├── UC-39  Screen Wallet Address
│   ├── UC-40  Score Transaction Risk
│   └── UC-41  Flag Sanctioned Entity Match
│
└── ACTOR: BLOCKCHAIN VALIDATOR
    │
    ├── UC-42  Receive Broadcast Transaction
    ├── UC-43  Include in Block
    └── UC-44  Return Confirmation Hash
```

---

## 4. Activity Diagrams

### 4.1 User Registration + KYC Activity

```
[START]
   │
   ▼
◆ User visits registration page
   │
   ├─ Provides: email + password + country
   │
   ▼
◆ System validates inputs
   │
   ├── FAIL ──► [Show validation errors] ──► loop back
   │
   └── PASS
        │
        ▼
   ◆ Send verification email (token, 24h TTL)
        │
        ▼
   ◆ User clicks email link
        │
        ├── EXPIRED ──► [Resend email] ──► loop
        │
        └── VALID
             │
             ▼
        ◆ Account created (status: UNVERIFIED)
             │
             ▼
        ◆ User initiates KYC (required for trading/withdrawal)
             │
             ▼
        ◆ Select KYC Tier
             │
             ├── Tier 1: name + DOB + gov ID photo
             └── Tier 2: + proof of address + source of funds
             │
             ▼
        ◆ User uploads documents
             │
             ▼
        ◆ System sends to KYC Provider (Jumio/Sumsub)
             │
             ▼
        ◆ Provider runs:
             ├── OCR — document authenticity
             ├── Liveness check — selfie vs. ID photo
             ├── Watchlist / PEP (Politically Exposed Person) check
             └── Sanctions screening (OFAC, EU, UN)
             │
             ▼
        ◆ Result received
             │
             ├── PASS ──► KYC status = VERIFIED
             │            User tier upgraded
             │            Access unlocked
             │            Notification sent ──► [END: VERIFIED]
             │
             ├── REVIEW ──► Manual review queue (compliance officer)
             │              │
             │              ├── Approved ──► VERIFIED ──► [END]
             │              └── Rejected ──► REJECTED ──► [END]
             │
             └── FAIL ──► KYC status = REJECTED
                          Rejection reason sent to user
                          User may resubmit ──► [END: REJECTED]
```

---

### 4.2 Authentication (Login + 2FA) Activity

```
[START: User opens login page]
   │
   ▼
◆ Enter email + password
   │
   ▼
◆ System checks:
   ├── Account exists?  NO ──► "Invalid credentials" ──► [END]
   ├── Account active?  NO ──► "Account suspended" ──► [END]
   └── Password hash match?
         │
         ├── NO (wrong password)
         │    │
         │    ├── Increment failed attempt counter
         │    │
         │    ├── Count < 5  ──► "Invalid credentials" ──► retry
         │    │
         │    └── Count ≥ 5  ──► LOCK account (30 min)
         │                       Send lockout notification
         │                       ──► [END: LOCKED]
         │
         └── YES
              │
              ▼
         ◆ Check 2FA method enabled
              │
              ├── TOTP (Google Authenticator)
              │    └── User enters 6-digit code
              │         ├── INVALID ──► "Invalid code" ──► retry (max 3)
              │         └── VALID ──► proceed
              │
              ├── SMS OTP
              │    └── System sends SMS ──► User enters OTP
              │         ├── EXPIRED / INVALID ──► resend ──► retry
              │         └── VALID ──► proceed
              │
              └── Passkey (FIDO2 / biometric)
                   └── Browser/device confirms ──► proceed
              │
              ▼
         ◆ Issue JWT session token
              │
              ▼
         ◆ Log login event (IP, device, timestamp) → audit_logs
              │
              ▼
         ◆ Notify user (new device? → send alert email)
              │
              ▼
         [END: SESSION ACTIVE]
```

---

### 4.3 Crypto Deposit Activity

```
[START: User selects Deposit → Crypto]
   │
   ▼
◆ User selects coin + network (e.g. USDT on BSC)
   │
   ▼
◆ System checks: deposit address exists for (user, asset, network)?
   │
   ├── YES ──► Return existing address
   └── NO  ──► Generate new HD wallet address (from master key)
                Save to wallets table
   │
   ▼
◆ Display deposit address + QR code + minimum deposit + confirmations required
   │
   ▼
◆ User sends crypto from external wallet
   │
   ▼
◆ Blockchain Monitor (Wallet Service) detects incoming tx
   │
   ▼
◆ Check: is tx to our managed address?
   └── NO ──► Ignore
   └── YES
        │
        ▼
   ◆ Record: wallet_transactions (status = PENDING, confirmations = 0)
        │
        ▼
   ◆ Monitor block confirmations (polling every ~3s for BSC)
        │
        ├── Confirmations < required threshold ──► keep polling
        │
        └── Confirmations ≥ threshold
             │
             ▼
        ◆ Run AML check (Chainalysis)
             │
             ├── HIGH RISK / SANCTIONED ──► Flag transaction
             │                              Freeze funds
             │                              Alert compliance team
             │                              ──► [END: FLAGGED]
             │
             └── CLEAN
                  │
                  ▼
             ◆ Credit user balance (PostgreSQL — atomic update)
                  │
                  ▼
             ◆ Emit Kafka event: deposit-confirmed
                  │
                  ▼
             ◆ Send notification to user
                  │
                  ▼
             [END: BALANCE CREDITED]
```

---

### 4.4 Fiat Deposit Activity

```
[START: User selects Deposit → Fiat]
   │
   ▼
◆ Select fiat currency (USD / EUR / GBP...)
   │
   ▼
◆ Select deposit method
   │
   ├── Bank Transfer (SWIFT / SEPA)
   │    └── System shows bank details + reference code
   │         └── User transfers from personal bank ──► bank → exchange account
   │              └── Payment processor (Paysafe / Clear Junction) receives funds
   │                   └── Matches reference code ──► notify Fiat Gateway Service
   │
   └── Card / P2P
        └── Payment provider processes
             └── Instant credit on success
   │
   ▼
◆ Fiat Gateway Service receives confirmation
   │
   ▼
◆ Reconciliation check (amount matches, currency correct)
   │
   ├── MISMATCH ──► Hold, flag for manual review
   │
   └── MATCH
        │
        ▼
   ◆ Credit user fiat balance in internal ledger
        │
        ▼
   ◆ Record wallet_transaction (DEPOSIT, fiat asset)
        │
        ▼
   ◆ Notify user
        │
        ▼
   [END: FIAT CREDITED]
```

---

### 4.5 Spot Trade (Buy Order) Activity

```
[START: User submits BUY order]
   │
   ▼
◆ OMS receives order
   │
   ▼
◆ Validate order fields
   ├── Valid trading pair?   NO ──► reject
   ├── Valid quantity/price? NO ──► reject
   └── Account active?       NO ──► reject
   │
   ▼
◆ Balance check (quote asset available?)
   │
   ├── INSUFFICIENT ──► reject ("Insufficient balance") ──► [END]
   │
   └── SUFFICIENT
        │
        ▼
   ◆ Lock required balance (wallet.locked_balance += amount)
        │
        ▼
   ◆ Insert order record (status = OPEN)
        │
        ▼
   ◆ Send to Matching Engine (in-memory)
        │
        ▼
   ◆ Matching Engine searches order book (price-time priority)
        │
        ├── NO matching sell order
        │    └── Order rests in book (OPEN / PARTIAL)
        │         └── Wait for matching seller ──► loop back to match step
        │
        └── MATCH FOUND
             │
             ▼
        ◆ Create trade record
             ├── quantity matched
             ├── execution price
             ├── buyer_id + seller_id
             └── is_maker_buyer flag
             │
             ▼
        ◆ Settlement Service (atomic, transactional)
             ├── Deduct quote asset from buyer  (locked_balance)
             ├── Credit base asset to buyer
             ├── Deduct base asset from seller
             ├── Credit quote asset to seller
             ├── Deduct fees from both (maker < taker)
             └── Transfer 10% of fees ──► SAFU cold wallet
             │
             ▼
        ◆ Emit Kafka events:
             ├── trade-executed
             ├── order-events (status update)
             └── market-data (price update)
             │
             ▼
        ◆ Update order status
             ├── PARTIAL ──► order remains open for remainder
             └── FILLED  ──► order closed
             │
             ▼
        ◆ Send trade notification to buyer + seller
             │
             ▼
        ◆ Update OHLCV (TimescaleDB) + Redis order book
             │
             ▼
        [END: TRADE EXECUTED]
```

---

### 4.6 Crypto Withdrawal Activity

```
[START: User requests withdrawal]
   │
   ▼
◆ User enters: destination address + amount + coin + network
   │
   ▼
◆ System validations:
   ├── Address format valid?        NO ──► error
   ├── Address on whitelist?        NO ──► reject (whitelist enforced)
   ├── Amount ≥ minimum withdrawal? NO ──► error
   └── User balance sufficient?     NO ──► reject
   │
   ▼
◆ 2FA confirmation required
   └── (TOTP / SMS / email OTP)
        ├── INVALID ──► reject
        └── VALID ──► proceed
   │
   ▼
◆ AML / Sanctions screening (Chainalysis / Elliptic)
   │
   ├── ADDRESS FLAGGED / HIGH RISK
   │    └── Block withdrawal
   │         Alert compliance team
   │         Freeze funds pending review
   │         ──► [END: BLOCKED]
   │
   └── CLEAN
        │
        ▼
   ◆ Deduct balance (locked_balance += amount)
        │
        ▼
   ◆ Insert wallet_transaction (status = PENDING)
        │
        ▼
   ◆ Withdrawal batch queue (collected every ~10 min for BSC)
        │
        ▼
   ◆ Wallet Service evaluates: hot wallet or cold wallet?
        │
        ├── Amount ≤ hot wallet threshold
        │    └── Sign via MPC (multi-party hot wallet)
        │         ──► broadcast to blockchain
        │
        └── Amount > threshold (large withdrawal)
             └── Escalate: multi-sig approval (requires N-of-M execs)
                  └── Approved ──► sign from cold wallet
                               ──► broadcast to blockchain
        │
        ▼
   ◆ Broadcast signed transaction to network
        │
        ▼
   ◆ Monitor for blockchain confirmation
        │
        ▼
   ◆ Update wallet_transaction (status = CONFIRMED)
        Emit Kafka: withdrawal-confirmed
        Notify user with tx hash
        │
        ▼
   [END: WITHDRAWN]
```

---

### 4.7 AML Compliance Check Activity

```
[TRIGGER: Transaction detected OR threshold crossed]
   │
   ▼
◆ Compliance engine receives transaction event
   │
   ▼
◆ Rule-based screening:
   ├── Amount > reporting threshold?
   ├── >10 transactions in 24h?
   ├── Rapid fund movement (in then out)?
   └── Geographic anomaly?
   │
   ├── NO RULES TRIGGERED ──► log + pass ──► [END: CLEAN]
   │
   └── RULE TRIGGERED
        │
        ▼
   ◆ Send address/tx to Chainalysis / Elliptic
        │
        ▼
   ◆ Receive risk score (0–100)
        │
        ├── Score < 30  ──► LOW RISK ──► pass with flag in DB ──► [END]
        │
        ├── Score 30–70 ──► MEDIUM RISK
        │    ├── Auto-flag for human review
        │    └── Continue processing (monitor)
        │
        └── Score > 70  ──► HIGH RISK
             │
             ├── Freeze user account
             ├── Block pending withdrawal
             ├── Generate alert ──► compliance dashboard
             ├── Compliance officer reviews
             │    ├── FALSE POSITIVE ──► unfreeze + document ──► [END]
             │    └── CONFIRMED ──► file SAR with regulator
             │                       Escalate to law enforcement if required
             │                       ──► [END: REPORTED]
             └── Travel Rule check (FATF R.16)
                  └── Collect originator/beneficiary info ──► transmit
```

---

## 5. Data Flow Diagrams

### 5.1 Level-0 — Context Diagram

```
                    ┌─────────────────────────────────────┐
  KYC Documents     │                                     │   Trade Confirmations
  ────────────────► │                                     │ ──────────────────────►  RETAIL USER
                    │                                     │
  Verification      │                                     │   Balance Updates
  Result            │                                     │ ◄──────────────────────  RETAIL USER
  ◄──────────────── │                                     │
                    │                                     │
  KYC PROVIDER      │       B I N A N C E                 │   Orders / API Calls
                    │       SYSTEM (Process 0)            │ ◄──────────────────────  INSTITUTIONAL
  Tx Risk Score     │                                     │
  ◄──────────────── │                                     │   Market Data / Results
  Address Screening │                                     │ ──────────────────────►  INSTITUTIONAL
  ────────────────► │                                     │
                    │                                     │
  AML PROVIDER      │                                     │   Audit / Data Request
                    │                                     │ ◄──────────────────────  REGULATOR
  Bank Tx Confirm   │                                     │
  ────────────────► │                                     │   SAR / Reports
  Fiat Credit       │                                     │ ──────────────────────►  REGULATOR
  ◄──────────────── │                                     │
                    │                                     │
  PAYMENT PROCESSOR │                                     │   Withdraw Tx
                    │                                     │ ──────────────────────►  BLOCKCHAIN
  Block / Tx Data   │                                     │
  ────────────────► │                                     │   Deposit Confirmation
                    │                                     │ ◄──────────────────────  BLOCKCHAIN
  BLOCKCHAIN NET    └─────────────────────────────────────┘
```

---

### 5.2 Level-1 — Main Process Decomposition

```
EXTERNAL INPUTS                    INTERNAL PROCESSES               OUTPUTS / DATA STORES
═══════════════                    ══════════════════               ═════════════════════

[User: email, pwd, docs]
         │
         ▼
  ┌─────────────┐                                              ┌───────────┐
  │  P1         │──── user record ──────────────────────────► │  DS1      │
  │  Identity & │◄─── KYC result ── [KYC Provider] ───────── │  users    │
  │  KYC Mgmt  │                                              │  kyc_rec  │
  └─────────────┘                                             └───────────┘

[User: credentials + 2FA]
         │
         ▼
  ┌─────────────┐                                              ┌───────────┐
  │  P2         │──── session token ────────────────────────► │  DS2      │
  │  Auth &     │──── login event ──────────────────────────► │  sessions │
  │  Session    │                                              │  audit_log│
  └─────────────┘                                             └───────────┘

[User: order details]
         │
         ▼
  ┌─────────────┐    order ──────────────────────────────────► ┌──────────┐
  │  P3         │◄── match result                              │  DS3     │
  │  Order &    │──── trade record ──────────────────────────► │  orders  │
  │  Matching   │──── balance update ────────────────────────► │  trades  │
  └─────────────┘──── kafka event → P6 ───────────────────►   │  fees    │
                                                               └──────────┘

[User: deposit address request]
[Blockchain: inbound tx]
         │
         ▼
  ┌─────────────┐    wallet_tx ──────────────────────────────► ┌──────────┐
  │  P4         │◄── AML result ── [AML Provider]             │  DS4     │
  │  Wallet &   │──── balance update ────────────────────────► │  wallets │
  │  Deposits   │──── outbound tx ──────────────────────────► │  wallet_ │
  └─────────────┘                    [Blockchain]              │  txn     │
                                                               └──────────┘

[AML Alert]
[Regulator request]
         │
         ▼
  ┌─────────────┐    SAR ───────────────────────────────────► [Regulator]
  │  P5         │──── compliance report
  │  Compliance │──── account action ────────────────────────► DS1 (users)
  │  & AML      │◄─── transaction data ── DS3, DS4
  └─────────────┘

[Kafka trade-executed]
[Kafka deposit-confirmed]
         │
         ▼
  ┌─────────────┐    OHLCV candle ──────────────────────────► ┌──────────┐
  │  P6         │──── WebSocket push ───────────────────────► │  DS5     │
  │  Market     │──── notification ─────────────────────────► │  TimescaleDB│
  │  Data Svc   │                                              │  Redis   │
  └─────────────┘                                             └──────────┘
```

---

### 5.3 Level-2 — Trading Engine Detail

```
INPUT: User Order
       │
       ▼
  ┌────────────────────────────────────────────────────────────────────┐
  │  P3.1  ORDER VALIDATION                                            │
  │  ├── Pair active?                                                  │
  │  ├── Quantity within [min, max]?                                   │
  │  ├── Price tick size valid?                                        │
  │  └── Account not suspended?                                        │
  └──────────────────────────┬─────────────────────────────────────────┘
  FAIL → reject (error msg)  │ PASS
                             ▼
  ┌────────────────────────────────────────────────────────────────────┐
  │  P3.2  BALANCE RESERVATION                                         │
  │  ├── BUY order:  lock quote_asset × price × qty                   │
  │  └── SELL order: lock base_asset × qty                            │
  │  Write: wallets.locked_balance +=                                  │
  └──────────────────────────┬─────────────────────────────────────────┘
                             ▼
  ┌────────────────────────────────────────────────────────────────────┐
  │  P3.3  MATCHING ENGINE (in-memory)                                 │
  │  ├── Order book lookup (Redis / ring buffer)                       │
  │  ├── Best price at opposite side?                                  │
  │  │   ├── BUY: find lowest ASK ≤ bid price                         │
  │  │   └── SELL: find highest BID ≥ ask price                       │
  │  ├── Partial match? → split fill                                   │
  │  └── Full match? → full fill                                       │
  └──────────────────────────┬─────────────────────────────────────────┘
                             ▼
  ┌────────────────────────────────────────────────────────────────────┐
  │  P3.4  SETTLEMENT (atomic DB transaction)                          │
  │  ├── INSERT trades record                                          │
  │  ├── UPDATE buyer wallet  (-quote +base)                           │
  │  ├── UPDATE seller wallet (-base +quote)                           │
  │  ├── INSERT fees records (maker rate / taker rate)                 │
  │  └── Transfer 10% fee → SAFU wallet                               │
  └──────────────────────────┬─────────────────────────────────────────┘
                             ▼
  ┌────────────────────────────────────────────────────────────────────┐
  │  P3.5  EVENT EMISSION                                              │
  │  ├── Kafka: trade-executed   → Market Data Service                 │
  │  ├── Kafka: order-events     → OMS (status update)                 │
  │  └── Redis pub/sub           → WebSocket clients                   │
  └──────────────────────────┬─────────────────────────────────────────┘
                             ▼
  ┌────────────────────────────────────────────────────────────────────┐
  │  P3.6  POST-TRADE NOTIFICATIONS                                    │
  │  ├── Push: "Your order was filled at $X"                           │
  │  ├── Email (if configured)                                         │
  │  └── Update OHLCV in TimescaleDB                                   │
  └────────────────────────────────────────────────────────────────────┘
  OUTPUT: trade record + updated balances + market data update
```

---

## 6. Sequence Diagrams

### 6.1 User Registration Sequence

```
User          Web App       API GW        Auth Svc      User Svc      KYC Svc       Email Svc     DB
 │               │              │              │             │              │              │         │
 │─ POST /reg ──►│              │              │             │              │              │         │
 │               │─ forward ───►│              │             │              │              │         │
 │               │              │─ validate ──►│             │              │              │         │
 │               │              │              │─ check email unique ──────────────────────────────►│
 │               │              │              │             │◄─────────────────────────────── OK ──│
 │               │              │              │─ hash pwd ──│             │              │         │
 │               │              │              │             │─ create user record ─────────────────►│
 │               │              │              │             │◄─────────────────────────────── OK ──│
 │               │              │              │─────────────────────────────────────── send email ►│
 │               │              │              │             │              │◄────────────────── OK ─│
 │               │              │◄─ 201 OK ───│             │              │              │         │
 │◄─ "Check email"─────────────│              │             │              │              │         │
 │               │              │              │             │              │              │         │
 │─ Click link ─►│              │              │             │              │              │         │
 │               │─ GET /verify/token ────────►│             │              │              │         │
 │               │              │─ validate ──►│             │              │              │         │
 │               │              │              │─ mark email_verified = TRUE ─────────────────────► │
 │               │              │              │             │◄─────────────────────────────── OK ──│
 │               │              │◄─ 200 OK ───│             │              │              │         │
 │◄─ "Account ready" ──────────│              │             │              │              │         │
 │               │              │              │             │              │              │         │
```

---

### 6.2 Login + 2FA Sequence

```
User          Web App       API GW        Auth Svc      Session DB    Notif Svc     Audit Log
 │               │              │              │              │              │             │
 │─ POST /login ►│              │              │              │              │             │
 │               │─ forward ───►│              │              │              │             │
 │               │              │─ route ─────►│              │              │             │
 │               │              │              │─ fetch user record ─────────────────────►│
 │               │              │              │◄──────────────────── {hash, 2fa_type} ───│
 │               │              │              │─ verify bcrypt(pwd)  │              │     │
 │               │              │              │  [match]             │              │     │
 │               │              │              │─ generate OTP ──────────────────────────►│
 │               │              │              │             SMS/TOTP                │     │
 │               │              │◄─ 200 "2FA needed" ─────────────────────────────────────│
 │◄─ "Enter code" ────────────│              │              │              │             │
 │               │              │              │              │              │             │
 │─ POST /2fa ──►│              │              │              │              │             │
 │               │─ forward ───►│              │              │              │             │
 │               │              │─ route ─────►│              │              │             │
 │               │              │              │─ verify OTP  │              │             │
 │               │              │              │  [valid]     │              │             │
 │               │              │              │─ create session ──────────►│             │
 │               │              │              │◄── session_id ─────────────│             │
 │               │              │              │─────────────────────────── log LOGIN ───►│
 │               │              │              │─ new device? ────────────────────────────│
 │               │              │              │  YES: notify ──────────────────────────► │
 │               │              │◄─ JWT token ─│              │              │             │
 │◄─ Dashboard ─────────────── │              │              │              │             │
```

---

### 6.3 Place & Match Order Sequence

```
User     Web App    API GW    OMS         Matching Eng   Settlement    DB        Kafka      WebSocket
 │          │          │        │               │              │          │          │           │
 │─ POST ──►│          │        │               │              │          │          │           │
 │  /order  │          │        │               │              │          │          │           │
 │          │─ fwd ───►│        │               │              │          │          │           │
 │          │          │─ auth ─│               │              │          │          │           │
 │          │          │─ fwd ─►│               │              │          │          │           │
 │          │          │        │─ validate ────│               │          │          │           │
 │          │          │        │─ lock balance ─────────────────────────►│          │           │
 │          │          │        │◄──────────────────────────────────── OK │          │           │
 │          │          │        │─ INSERT order ──────────────────────────│(status=OPEN)         │
 │          │          │        │─ send to ME ──►│              │          │          │           │
 │          │          │        │               │─ search book  │          │          │           │
 │          │          │        │               │  [MATCH]      │          │          │           │
 │          │          │        │               │─ send to Settlement ────►│          │           │
 │          │          │        │               │              │─ BEGIN TX─│          │           │
 │          │          │        │               │              │─ UPDATE buyer wallet ─►          │
 │          │          │        │               │              │─ UPDATE seller wallet ►          │
 │          │          │        │               │              │─ INSERT trade ─────►│            │
 │          │          │        │               │              │─ INSERT fee ───────►│            │
 │          │          │        │               │              │─ COMMIT TX ──────── │            │
 │          │          │        │               │              │◄── OK ──────────────│            │
 │          │          │        │               │◄─ trade confirmed ──────│           │           │
 │          │          │        │               │─ publish ──────────────────────────►│           │
 │          │          │        │               │  trade-executed          │           │─ push ───►│
 │          │          │◄──────│               │              │           │           │           │
 │◄─ filled ─│          │        │               │              │           │           │           │
```

---

### 6.4 Crypto Withdrawal Sequence

```
User    Web App   API GW   OMS    Wallet Svc   AML Svc   DB     Blockchain  Notif Svc
 │         │         │       │         │           │        │         │           │
 │─ POST ─►│         │       │         │           │        │         │           │
 │ /withdraw         │       │         │           │        │         │           │
 │         │─ fwd ──►│       │         │           │        │         │           │
 │         │         │─ 2FA ─│         │           │        │         │           │
 │         │         │─ fwd ►│         │           │        │         │           │
 │         │         │       │─ validate (whitelist, min amt) ────────────────────│
 │         │         │       │─ lock balance ─────────────────────────►│          │
 │         │         │       │─ route to wallet ──►│         │         │           │
 │         │         │       │                  │─ screen address ────►│           │
 │         │         │       │                  │◄─ risk score ────────│           │
 │         │         │       │                  │  [CLEAN]   │         │           │
 │         │         │       │                  │─ INSERT wallet_tx ──►│(PENDING)  │
 │         │         │       │                  │─ [batch timer/10min] │           │
 │         │         │       │                  │─ sign tx (MPC hot)   │           │
 │         │         │       │                  │─ broadcast tx ──────────────────►│
 │         │         │       │                  │◄── tx_hash ──────────────────────│
 │         │         │       │                  │─ UPDATE wallet_tx ──►│(status=SENT)
 │         │         │       │                  │─ monitor confirmations │         │
 │         │         │       │                  │◄── confirmed ─────────────────── │
 │         │         │       │                  │─ UPDATE wallet_tx ──►│(CONFIRMED)│
 │         │         │       │                  │─ notify ──────────────────────────────────────►│
 │◄─ tx hash notification ──────────────────────────────────────────────────────────────────────│
```

---

### 6.5 Regulator Audit Request Sequence

```
Regulator   Compliance Portal   Compliance Officer   DB (audit_logs)   DB (trades/users)
    │               │                   │                    │                  │
    │─ Submit legal request ────────────►│                    │                  │
    │               │                   │─ verify mandate     │                  │
    │               │                   │─ log request ──────►│                  │
    │               │                   │─ extract user data ──────────────────►│
    │               │                   │◄─────────────────── user + tx history ─│
    │               │                   │─ extract audit logs ──────────────────►│
    │               │                   │◄─────────────────── audit trail ────── │
    │               │                   │─ generate report                       │
    │               │                   │─ encrypt report (regulator public key) │
    │               │                   │─ log response sent ─────────────────►  │
    │◄─ Encrypted data package ─────────│                    │                  │
    │─ Acknowledge receipt ────────────►│                    │                  │
```

---

## 7. Component Dependency Tree

### 7.1 Full Top-to-Bottom Dependency Map

```
BINANCE SYSTEM — COMPONENT DEPENDENCY TREE
(read: upper component DEPENDS ON lower component)

FRONTEND CLIENTS
│
├── Web SPA (React)
│   ├── depends: REST API Gateway
│   ├── depends: WebSocket (market data stream)
│   └── depends: Auth Service (JWT)
│
├── Mobile App (iOS / Android)
│   ├── depends: REST API Gateway
│   └── depends: Push Notification Service (FCM/APNs)
│
└── Bot / API Client
    ├── depends: REST API Gateway (HMAC auth)
    └── depends: WebSocket Streams

API GATEWAY (Nginx / Kong)
│
├── depends: Auth Service  (token validation)
├── depends: Rate Limiter  (Redis counters)
└── routes to: All Microservices below

AUTH SERVICE
│
├── depends: PostgreSQL  (users, sessions)
├── depends: Redis  (session cache, OTP store)
└── depends: Notification Service  (OTP delivery)

USER SERVICE
│
└── depends: PostgreSQL  (users, countries)

KYC / COMPLIANCE SERVICE
│
├── depends: PostgreSQL  (kyc_records, users)
├── depends: Jumio / Sumsub API  (external)
├── depends: Chainalysis / Elliptic API  (external)
└── depends: Kafka  (publishes: kyc-status-changed, aml-alert)

ORDER MANAGEMENT SYSTEM (OMS)
│
├── depends: Auth Service  (session validation)
├── depends: PostgreSQL  (orders table)
├── depends: Redis  (balance cache)
└── depends: Matching Engine  (submits orders)

MATCHING ENGINE
│
├── depends: Redis  (live order book read/write)
├── depends: Settlement Service  (submits fills)
└── depends: Kafka  (publishes: trade-executed, order-events)

SETTLEMENT SERVICE
│
├── depends: PostgreSQL  (atomic: wallets, trades, fees, orders)
├── depends: Kafka  (consumes: trade-executed)
└── CRITICAL: must be ACID-compliant (no eventual consistency)

WALLET SERVICE
│
├── depends: PostgreSQL  (wallets, wallet_transactions)
├── depends: Blockchain Nodes  (deposit monitoring, tx broadcast)
├── depends: AML / Chainalysis  (withdrawal screening)
├── depends: HSM / MPC cluster  (key management)
├── depends: Kafka  (publishes: deposit-confirmed, withdrawal-confirmed)
└── depends: Cold Storage System  (large withdrawal approval)

MARKET DATA SERVICE
│
├── depends: Kafka  (consumes: trade-executed)
├── depends: Redis Pub/Sub  (publishes: order book deltas)
├── depends: TimescaleDB  (stores OHLCV)
└── depends: WebSocket Server  (pushes to clients)

FIAT GATEWAY SERVICE
│
├── depends: PostgreSQL  (wallet_transactions fiat)
├── depends: Payment Processor API  (Paysafe / Clear Junction)
└── depends: Kafka  (publishes: fiat-deposit-confirmed)

NOTIFICATION SERVICE
│
├── depends: Kafka  (consumes all event topics)
├── depends: SendGrid  (email)
├── depends: Twilio  (SMS)
└── depends: FCM / APNs  (push)

ADMIN SERVICE
│
├── depends: PostgreSQL  (all tables, read/write)
├── depends: audit_logs  (immutable append)
└── depends: KYC Service  (approve / reject KYC)

DATA STORES
│
├── PostgreSQL  (primary source of truth)
│   ├── depends: WAL replication → PostgreSQL Replica
│   └── depends: Snapshot backup → Cold Storage (S3 Glacier)
│
├── Redis  (ephemeral cache)
│   └── depends: Redis Cluster (HA mode)
│
├── Apache Cassandra  (distributed order book replica)
│   └── depends: NetworkTopologyStrategy (multi-DC replication)
│
├── Apache Kafka  (event bus)
│   └── depends: Kafka Cluster (partitioned, replicated)
│
└── TimescaleDB  (time-series price data)
    └── depends: PostgreSQL extension layer

BLOCKCHAIN LAYER
│
├── BSC Full Nodes (Geth-based + Reth alpha)
│   ├── depends: Scalable DB (multi-database: state/block/index)
│   └── depends: PoSA Validator set (45 nodes)
│
├── Validator Nodes
│   ├── depends: BNB staking (election criteria)
│   └── depends: Path-Based Storage System (PBSS)
│
└── opBNB (L2)
    └── depends: BSC (L1 settlement)

SECURITY LAYER (cross-cutting all services)
│
├── HSM  (cold wallet signing)
├── MPC cluster  (hot wallet key sharding — 3 shards)
├── SIEM  (consumes all logs → real-time threat detection)
├── WAF  (layer above API Gateway)
├── SAFU Cold Wallet  (10% fee collection, independent custody)
└── Proof of Reserves  (Merkle-tree audit, external verifier)
```

---

### 7.2 Request Lifecycle: End-to-End Path (Single Order)

```
USER CLICK "BUY BTC"
      │
      ▼  (HTTPS)
CDN / WAF
      │
      ▼  (TLS)
API Gateway  ──► [rate limit check → Redis]
      │
      ▼  (JWT verify → Auth Service → Redis session)
OMS
      │  ├─ validate fields
      │  ├─ check balance → PostgreSQL
      │  └─ lock balance → PostgreSQL
      ▼
Matching Engine  ──► [in-memory order book → Redis]
      │
      └─ MATCH FOUND
            │
            ▼
      Settlement Service
            │  ├─ BEGIN TRANSACTION
            │  ├─ UPDATE wallets → PostgreSQL
            │  ├─ INSERT trade   → PostgreSQL
            │  ├─ INSERT fees    → PostgreSQL
            │  └─ COMMIT
            │
            ▼
      Kafka: trade-executed
            │
            ├─► Market Data Service → TimescaleDB + Redis pub/sub → WebSocket → User browser
            ├─► Notification Service → SendGrid/FCM → User email/push
            └─► OMS → UPDATE orders status → PostgreSQL

TOTAL LATENCY TARGET: < 10ms (order entry to match)
SETTLEMENT LATENCY: < 50ms (match to balance update)
```

---

## References

| Source | URL |
|--------|-----|
| BNB Chain Validator Overview | https://docs.bnbchain.org/bnb-smart-chain/validator/overview/ |
| BNB Chain Tech Roadmap 2026 | https://www.bnbchain.org/en/blog/tech-roadmap-2026 |
| Binance Compliance 2024 Strategy | https://www.binance.com/en/blog/leadership/responsible-growth-squad |
| Binance Compliance Metrics 2026 | https://www.zawya.com/en/press-release/africa-press-releases/binance-reinfor… |
| Messari — BNB Chain Q4 2025 | https://messari.io/report/state-of-bnb-chain-q4-2025 |
| Binance Security Methodologies | https://medium.com/@sitharawanigasooriya_ |
| Crypto Exchange System Design | https://mecha-mind.medium.com/system-design-cryptocurrency-exchange-d09be2874c6b |
| Order Matching Engine Design | https://dev.to/riley_quinn_8e58a0a96d107/order-matching-engine |
| KYC/AML Crypto Exchange Guide | https://www.chainup.com/academy/kyc-aml-crypto-exchanges-compliance-guide/ |
| CEX Architecture 2026 | https://www.dappfort.com/blog/cryptocurrency-exchange-architecture/ |
| Crypto Exchange System (Upbit Model) | https://mindmapai.app/mind-mapping/crypto-exchange-system-upbit-model |
| IdeaSoft — CEX Dev Guide | https://ideasoft.io/blog/centralized-crypto-exchange-development-pros-and-cons/ |

---
*Document: Binance Software Engineering Architecture & System Analysis | May 2026*
