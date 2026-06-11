# Binance: Complete Technical Architecture, Blockchain & Database Research
> Research compiled from official BNB Chain documentation, Messari Q4 2025 reports, Medium technical analyses, and community-verified sources.

---

## Table of Contents
1. [Platform Overview](#1-platform-overview)
2. [Dual-Layer Architecture: CEX + Blockchain](#2-dual-layer-architecture-cex--blockchain)
3. [BNB Chain — On-Chain Infrastructure](#3-bnb-chain--on-chain-infrastructure)
4. [Centralized Exchange (CEX) — Off-Chain Infrastructure](#4-centralized-exchange-cex--off-chain-infrastructure)
5. [Wallet System: Hot, Cold, MPC](#5-wallet-system-hot-cold-mpc)
6. [Security Architecture & SAFU](#6-security-architecture--safu)
7. [Data Pipelines, Messaging & Caching](#7-data-pipelines-messaging--caching)
8. [Backup, Disaster Recovery & Auxiliary Services](#8-backup-disaster-recovery--auxiliary-services)
9. [Database Normalization: 1NF → 3NF](#9-database-normalization-1nf--3nf)
10. [Full Database Schema with Keys & Relations](#10-full-database-schema-with-keys--relations)
11. [References](#11-references)

---

## 1. Platform Overview

Binance is the world's largest centralized cryptocurrency exchange (CEX) by volume (~$588B/month spot volume as of March 2025) with 280M+ registered users. It operates as a **hybrid system**:

| Component | Type | Purpose |
|-----------|------|---------|
| Binance CEX | Centralized servers | Trading, custody, KYC/AML, fiat onramp |
| BNB Smart Chain (BSC) | Public blockchain | Smart contracts, DeFi, on-chain settlement |
| opBNB | Layer-2 (OP Stack) | High-throughput L2 scaling |
| BNB Greenfield | Decentralized storage | Data ownership layer |

The CEX operates **entirely off-chain** at the order-matching and balance level. The blockchain serves as a **public settlement and DeFi layer**, not as the trading engine.

---

## 2. Dual-Layer Architecture: CEX + Blockchain

```
┌─────────────────────────────────────────────────────────────┐
│                   CLIENT LAYER                              │
│  Web App (React) │ Mobile (iOS/Android) │ API (REST/WS)    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│                  API GATEWAY / CDN                          │
│       Rate Limiting │ DDoS Protection │ TLS Termination     │
└──────────────────────────┬──────────────────────────────────┘
                           │ gRPC / ZeroMQ
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────┐    ┌──────────────┐    ┌──────────────────┐
│  Auth     │    │  Order Mgmt  │    │  Wallet Service  │
│  Service  │    │  Service     │    │  (MPC Hot)       │
└───────────┘    └──────┬───────┘    └───────┬──────────┘
                        │                    │
                 ┌──────▼───────┐    ┌───────▼──────────┐
                 │  Matching    │    │  Cold Wallet     │
                 │  Engine      │    │  (Air-gapped)    │
                 └──────┬───────┘    └──────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
  ┌──────────┐  ┌─────────────┐  ┌───────────────┐
  │ PostgreSQL│  │   Redis     │  │  Apache Kafka │
  │ (Orders) │  │  (Cache/OB) │  │  (Event Bus)  │
  └──────────┘  └─────────────┘  └───────────────┘
                        │ (Blockchain withdrawals)
                 ┌──────▼───────┐
                 │  BNB Smart   │
                 │  Chain (BSC) │
                 │  On-chain    │
                 └──────────────┘
```

---

## 3. BNB Chain — On-Chain Infrastructure

### 3.1 Consensus Mechanism: Proof of Staked Authority (PoSA)

PoSA is a hybrid of **Delegated Proof of Stake (DPoS)** and **Proof of Authority (PoA)**, forked from Ethereum's Go client (Geth) and optimized for throughput.

**Validator Election (Daily, 00:00 UTC):**
- 45 validator nodes elected daily based on BNB staked.
- Top 21 by stake = **Cabinets** (primary block producers).
- Remaining 24 = **Candidates** (standby/rotation pool).
- Per epoch: 18 Cabinets + 3 Candidates randomly selected.
- Block time: ~3 seconds.
- (Source: BNB Chain Docs, Messari Q4 2025 Report)

**Key Properties:**
| Property | Value |
|----------|-------|
| Block time | ~3 seconds |
| Active validators | 45 (post-Feynman Upgrade, April 2024) |
| Daily TXN peak (Oct 2025 ATH) | 31 million |
| Target TPS (2026 roadmap) | 20,000+ |
| Consensus model | Clique (Ethereum-derived) |

**Double-sign slashing** enforces validator honesty. Validators caught signing conflicting blocks lose staked BNB.

### 3.2 Network Node Types

| Node Type | Role |
|-----------|------|
| Validator Node | Block production + consensus (PoSA) |
| Full Node | Full blockchain copy, transaction propagation, no block production |
| Archive Node | Complete history including all historical states |
| Light Node | Downloads only block headers for verification |

### 3.3 On-Chain Data Storage: Scalable DB

BSC's state grew from 2.45 TB (Jan 2024) → **3.43 TB (May 2025)** — 30× faster than Ethereum.

**Old Architecture Problem:** Single LevelDB instance — I/O bottleneck, compaction overhead.

**Scalable DB (Announced Oct 17, 2025):** Horizontally scalable multi-database storage model.

```
┌────────────────────────────────────────────────────────┐
│                  Scalable DB Layout                    │
├──────────────────┬─────────────────┬───────────────────┤
│   State DB       │   Block DB      │   Index DB        │
│ (World state,    │ (Recent blocks, │ (TXN index,       │
│  trie/Patricia)  │  reorg, meta)   │  277GB, growing)  │
│  State sharding  │ Archive layer   │  Receipt index    │
└──────────────────┴─────────────────┴───────────────────┘
```

**Benchmark results:**
- 75% faster write performance under multi-threading.
- 12% better read performance.

**Path-Based Storage System (PBSS):** Introduced in Lorentz/Maxwell hardforks. Optimizes how transaction data is stored and propagated, reducing block propagation time.

### 3.4 EVM Compatibility

BSC is a fork of Geth (Go-Ethereum). It supports:
- All EVM opcodes.
- BEP-20 (equivalent to ERC-20).
- BEP-721/BEP-1155 (NFT standards).
- **Super Instructions** (2025): combines multiple EVM operations into one optimized instruction, delivering ~10% EVM execution speedup.

### 3.5 BNB Greenfield (Decentralized Storage)

A separate chain for decentralized data storage. Objects are stored on Greenfield storage providers, with metadata and permissions managed on-chain. Enables data ownership and monetization without centralized cloud reliance.

---

## 4. Centralized Exchange (CEX) — Off-Chain Infrastructure

### 4.1 Core Architecture: Microservices

Binance uses a **microservices architecture** deployed via **Docker + Kubernetes**.

> "Binance employs containerization through Docker and Kubernetes, enabling microservices to be isolated, scalable, and resilient. Workloads can be automatically migrated to maintain uptime." — Sithara Wanigasooriya, Medium (Oct 2024)

Each microservice is independently scalable:

| Service | Function |
|---------|----------|
| Auth Service | Login, 2FA, session management |
| KYC/AML Service | Identity verification, risk scoring |
| Order Management System (OMS) | Order validation, lifecycle |
| Matching Engine | Price-time priority matching |
| Settlement Service | Balance updates post-match |
| Wallet Service | Deposit/withdrawal handling |
| Notification Service | Email, push, SMS |
| Market Data Service | WebSocket price feeds |
| Admin Service | Operational tooling |

### 4.2 Matching Engine

The most performance-critical component. Binance processes **1M+ orders/second** during peak market events.

**Design Principles:**
- In-memory order book (Redis / custom ring buffer).
- Lock-free data structures to minimize contention.
- Cache-friendly memory layouts to reduce GC pressure.
- Co-location with liquidity providers to cut network latency.
- Internal communication: **ZeroMQ** (ultra-fast) or **gRPC**.

**Order Types Processed:**
- Market, Limit, Stop-Limit, OCO (One Cancels Other), Iceberg.

**Trade Lifecycle:**
```
User submits order
      │
      ▼
API Gateway → OMS (validation)
      │
      ▼
Matching Engine (in-memory, microsecond-level)
      │
      ▼
Trade matched → Settlement Service
      │
      ├─ Update account balances (PostgreSQL)
      ├─ Emit event (Kafka)
      └─ If withdrawal → Wallet Service → Blockchain
```

### 4.3 Order Book Storage

The order book is stored **in-memory** (Redis or custom structure) for ultra-low-latency reads. Persistent snapshots are written to distributed databases (Cassandra or PostgreSQL) asynchronously.

> "The order_book table is implemented in Cassandra which allows NetworkTopologyStrategy to replicate across multiple data centers and nodes." — Abhijit Mondal, Medium

### 4.4 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Backend language | Java, Go, Python |
| Frontend | React, Vue, Next.js |
| API | REST + WebSocket |
| Message queue | Apache Kafka |
| Cache/Session | Redis |
| Relational DB | PostgreSQL, MySQL |
| Distributed DB | Cassandra (order book replication) |
| Time-series DB | TimescaleDB (price history) |
| Container orchestration | Docker + Kubernetes |
| Internal messaging | ZeroMQ, gRPC |
| On-chain analytics | VeloDB (5,000–50,000 records/sec ingestion on BSC) |

---

## 5. Wallet System: Hot, Cold, MPC

### 5.1 Tiered Treasury Architecture

```
User Deposit
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  Custodial Layer (Binance controls keys)            │
│                                                     │
│  HOT WALLET (~4% of funds)                         │
│  - Internet-connected                               │
│  - MPC key management (no single private key)      │
│  - Automated liquidity replenishment triggers       │
│  - For immediate withdrawals / operational flow     │
│                                                     │
│  COLD WALLET (~96% of funds)                       │
│  - Air-gapped, offline storage                     │
│  - Multi-signature authorization required          │
│  - Multiple exec approvals for large transfers     │
│  - Geographically distributed facilities           │
└─────────────────────────────────────────────────────┘
```

> "Binance reports storing 96% of customer funds offline, with hot wallets replenished through automated systems that trigger only when liquidity thresholds are met." — Bitget Academy (March 2026)

### 5.2 Multi-Party Computation (MPC) for Hot Wallets

MPC splits the private key into **multiple shards** distributed across separate nodes/devices. No single full private key ever exists in one environment.

**Binance Web3 Wallet MPC (3-share system):**
- Shard 1: User's device.
- Shard 2: Cloud encrypted backup.
- Shard 3: Binance's encrypted servers.

All shards must cooperate to sign a transaction. A compromised single shard is useless.

### 5.3 Internal Ledger vs. On-Chain

Binance maintains an **internal ledger** reflecting all user balances. Actual assets are aggregated in custodial wallets. Only net flows (withdrawals, deposits) hit the blockchain.

- Trade settlement: Off-chain ledger update (microseconds).
- Withdrawal: On-chain transaction (seconds to minutes).

---

## 6. Security Architecture & SAFU

### 6.1 Multi-Tier System Architecture

- **Separation of Concerns:** Trading engine, wallet systems, and UI are isolated across separate tiers.
- **Horizontal Scaling:** Kubernetes auto-scales services during peak load.
- **Zero-downtime deployments:** Rolling updates without service interruption.

### 6.2 SAFU — Secure Asset Fund for Users

- Emergency insurance fund.
- **Funded by:** 10% of all trading fees allocated continuously.
- **Purpose:** Compensates users in the event of platform-level security breaches.
- Stored in a dedicated cold wallet, independently audited.
- **Not covered:** User-side errors (lost passwords, personal phishing).

### 6.3 Security Controls

| Control | Implementation |
|---------|---------------|
| Authentication | 2FA (TOTP/SMS/passkeys), device fingerprinting |
| Encryption | TLS 1.3 (transit), AES-256 (at rest) |
| Withdrawal protection | Address whitelisting, withdrawal delay |
| DDoS protection | CDN-layer, rate limiting, IP filtering |
| Bug bounty | Up to $200,000 for critical vulnerabilities |
| Monitoring | SIEM (Security Information & Event Management) |
| Penetration testing | Regular third-party audits |
| API security | HMAC-SHA256 signed API keys |

### 6.4 Proof of Reserves

Binance publishes Merkle-tree-based Proof of Reserves, allowing users to cryptographically verify their balance is backed 1:1 by exchange-held assets. This is user-verifiable but not a full financial audit.

---

## 7. Data Pipelines, Messaging & Caching

### 7.1 Real-Time Data Flow

```
Blockchain (BSC)
      │ raw tx stream
      ▼
  Kafka Topics  ◄──── OMS Trade Events
      │
      ├─► Redis          (live order book cache, session data)
      ├─► PostgreSQL      (persistent orders, users, balances)
      ├─► TimescaleDB     (OHLCV price candles, time-series)
      ├─► Cassandra       (distributed order book replica)
      └─► VeloDB          (on-chain analytics, 50k rec/sec)
```

### 7.2 Apache Kafka

- **Event streaming backbone** for all microservice communication.
- Each trade, deposit, withdrawal is a Kafka event.
- **Kafka partitions** allow multiple OMS instances to process concurrently.
- Kafka's persistence allows **replay on failure** — no order lost.

### 7.3 Redis

- Stores live order book in memory.
- Session tokens and authentication state.
- Pub/Sub for real-time market data broadcasting to WebSocket clients.
- **Cluster mode** for distributed pub/sub.

### 7.4 VeloDB (On-Chain Analytics)

For BSC on-chain analytics (not trading engine):

| Metric | Value |
|--------|-------|
| Ingestion rate | 5,000–50,000 records/sec |
| Point query QPS | 200+ QPS |
| Batch analytics | 200 tokens in ~1 second |
| Dashboard refresh | 1–3 second latency |

---

## 8. Backup, Disaster Recovery & Auxiliary Services

### 8.1 Multi-Region Active/Passive Architecture

Binance operates across multiple data centers and cloud regions. Primary operations run in the active region; passive regions maintain synchronized replicas.

```
┌─────────────────────┐       ┌─────────────────────┐
│   PRIMARY REGION    │──────▶│   SECONDARY REGION  │
│   (Active, Live)    │ sync  │   (Passive, Standby)│
│                     │       │                     │
│  PostgreSQL Primary │       │  PostgreSQL Replica  │
│  Kafka Leader       │       │  Kafka Follower      │
│  Redis Primary      │       │  Redis Replica       │
│  Cold Wallet Vault  │       │  Cold Wallet Vault   │
└─────────────────────┘       └─────────────────────┘
         │                              │
         └──────────┬───────────────────┘
                    ▼
          TERTIARY / ARCHIVE
          (Glacier / Cold Storage)
          Historical TX data,
          Audit logs, Compliance records
```

### 8.2 Recovery Objectives

| Metric | Target |
|--------|--------|
| RTO (Recovery Time Objective) | Minutes (warm standby) |
| RPO (Recovery Point Objective) | Near-zero (real-time replication) |
| Database replication | Synchronous (critical) / Async (analytics) |
| Wallet key backup | Geographically distributed, multi-sig |

### 8.3 Backup Strategy

- **PostgreSQL:** Continuous WAL (Write-Ahead Log) shipping to replicas + daily snapshots to cold storage.
- **Kafka:** Log retention configured for replay (event sourcing pattern).
- **Blockchain state:** Full node snapshots distributed to validators.
- **Wallet keys:** Shamir Secret Sharing across geographically separate HSMs (Hardware Security Modules).

### 8.4 Auxiliary Services

| Service | Purpose |
|---------|---------|
| KYC Provider (Jumio, Sumsub) | Identity verification |
| AML Provider (Chainalysis, Elliptic) | Transaction risk scoring |
| CDN (Cloudflare/Akamai) | Global edge delivery, DDoS mitigation |
| SMS/Email (Twilio, SendGrid) | OTP and notification delivery |
| Blockchain Oracles | External price feeds to smart contracts |
| SIEM (Splunk/Elastic) | Security monitoring and alerting |
| BscScan / BSC Explorer | Public blockchain data indexing |

---

## 9. Database Normalization: 1NF → 3NF

This section applies relational normalization theory to a Binance-style exchange database.

### 9.1 Unnormalized Form (0NF) — Raw Example

A raw data dump before normalization:

| user_id | user_name | email | orders | wallet_addresses | kyc_status |
|---------|-----------|-------|--------|-----------------|------------|
| U001 | Alice | alice@x.com | O1:BTC:0.5:LIMIT, O2:ETH:2.0:MARKET | addr1, addr2 | VERIFIED |

**Problems:**
- `orders` column contains multiple values (repeating group).
- `wallet_addresses` contains a list.
- No atomicity.

---

### 9.2 First Normal Form (1NF)

**Rule:** Atomic values only. No repeating groups. Each cell = one value. A primary key exists.

Split orders into rows:

**users table (1NF):**

| user_id (PK) | user_name | email | kyc_status |
|-------------|-----------|-------|-----------|
| U001 | Alice | alice@x.com | VERIFIED |
| U002 | Bob | bob@x.com | PENDING |

**orders table (1NF):**

| order_id (PK) | user_id | asset_symbol | quantity | order_type | price | status |
|-------------|---------|-------------|----------|-----------|-------|--------|
| O001 | U001 | BTC | 0.5 | LIMIT | 65000 | FILLED |
| O002 | U001 | ETH | 2.0 | MARKET | NULL | FILLED |

**wallets table (1NF):**

| wallet_id (PK) | user_id | chain | address | type |
|--------------|---------|-------|---------|------|
| W001 | U001 | BTC | 1A2b3... | DEPOSIT |
| W002 | U001 | ETH | 0xabc... | DEPOSIT |

**1NF achieved:** Each column has atomic values. Primary keys defined. No repeating groups.

---

### 9.3 Second Normal Form (2NF)

**Rule:** Must be in 1NF. Every non-key attribute must be **fully functionally dependent** on the entire primary key (applies to composite keys).

**Problem in orders (composite key scenario):**

If we had a composite PK `(order_id, asset_symbol)`, and `asset_name` depends only on `asset_symbol` — that's a partial dependency.

**Fix:** Extract assets into its own table.

**assets table:**

| asset_id (PK) | symbol | name | type | network |
|-------------|--------|------|------|---------|
| A001 | BTC | Bitcoin | CRYPTO | Bitcoin |
| A002 | ETH | Ethereum | CRYPTO | Ethereum |
| A003 | BNB | BNB | CRYPTO | BSC |

**orders table (updated):**

| order_id (PK) | user_id (FK) | asset_id (FK) | quantity | order_type | price | status | created_at |
|-------------|-------------|-------------|----------|-----------|-------|--------|-----------|
| O001 | U001 | A001 | 0.5 | LIMIT | 65000 | FILLED | 2025-01-01 |
| O002 | U001 | A002 | 2.0 | MARKET | NULL | FILLED | 2025-01-02 |

**2NF achieved:** No partial dependencies. `asset_name` not stored redundantly in every order row.

---

### 9.4 Third Normal Form (3NF)

**Rule:** Must be in 2NF. No **transitive dependencies** (non-key attribute depending on another non-key attribute).

**Problem:** If `users` table had `country_code` and `country_name`, then `country_name` depends on `country_code`, not directly on `user_id`.

**Fix:** Extract countries.

**countries table:**

| country_code (PK) | country_name | region |
|-----------------|-------------|--------|
| US | United States | Americas |
| SG | Singapore | Asia |
| DE | Germany | Europe |

**users table (3NF):**

| user_id (PK) | username | email | phone_hash | country_code (FK) | kyc_status | created_at | last_login |
|-------------|---------|-------|-----------|-----------------|-----------|-----------|-----------|
| U001 | alice | alice@x.com | h(+1...) | US | VERIFIED | 2024-01-01 | 2025-05-30 |

**3NF achieved:** Every non-key attribute depends on the PK and only the PK. No transitive dependency remains.

---

## 10. Full Database Schema with Keys & Relations

This schema models the Binance CEX off-chain database at a normalized level (3NF). Referenced from real-world trading platform schemas and exchange system design literature.

### 10.1 Entity Relationship Overview

```
countries ◄─── users ─────► sessions
                │
                ├──► wallets ──► wallet_transactions
                │
                ├──► kyc_records
                │
                └──► orders ──► trades
                          │
                          └──► assets (referenced)

trades ──► fees
orders ──► order_history_log
users  ──► notifications
users  ──► audit_logs
```

---

### 10.2 Table Definitions (PostgreSQL-style DDL)

#### `countries`
```sql
CREATE TABLE countries (
  country_code  CHAR(2)      PRIMARY KEY,  -- ISO 3166-1 alpha-2
  country_name  VARCHAR(100) NOT NULL,
  region        VARCHAR(50)
);
```

#### `users`
```sql
CREATE TABLE users (
  user_id       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(50)  UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  phone_hash    VARCHAR(256),               -- hashed phone number
  password_hash VARCHAR(256) NOT NULL,
  country_code  CHAR(2)      REFERENCES countries(country_code),
  kyc_status    VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
                             -- PENDING | VERIFIED | REJECTED | SUSPENDED
  tier          SMALLINT     NOT NULL DEFAULT 1,
                             -- 1=Basic, 2=Intermediate, 3=Pro
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  last_login    TIMESTAMPTZ
);
```

**Keys:**
- PK: `user_id`
- FK: `country_code → countries.country_code`
- Unique: `username`, `email`

---

#### `sessions`
```sql
CREATE TABLE sessions (
  session_id    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  device_hash   VARCHAR(256),
  ip_address    INET         NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ  NOT NULL,
  revoked       BOOLEAN      NOT NULL DEFAULT FALSE
);
```

**Keys:**
- PK: `session_id`
- FK: `user_id → users.user_id`

---

#### `kyc_records`
```sql
CREATE TABLE kyc_records (
  kyc_id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  document_type VARCHAR(50)  NOT NULL,  -- PASSPORT | DRIVING_LICENSE | ID_CARD
  document_hash VARCHAR(256) NOT NULL,  -- hash of submitted document
  status        VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
  reviewed_by   VARCHAR(100),           -- admin or automated provider
  submitted_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  reviewed_at   TIMESTAMPTZ,
  rejection_reason TEXT
);
```

**Keys:**
- PK: `kyc_id`
- FK: `user_id → users.user_id`

---

#### `assets`
```sql
CREATE TABLE assets (
  asset_id      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol        VARCHAR(20)  UNIQUE NOT NULL,  -- BTC, ETH, BNB
  name          VARCHAR(100) NOT NULL,
  asset_type    VARCHAR(20)  NOT NULL,          -- CRYPTO | STABLECOIN | FIAT
  network       VARCHAR(50),                    -- Bitcoin, Ethereum, BSC
  decimals      SMALLINT     NOT NULL DEFAULT 8,
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE
);
```

**Keys:**
- PK: `asset_id`
- Unique: `symbol`

---

#### `trading_pairs`
```sql
CREATE TABLE trading_pairs (
  pair_id       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  base_asset_id UUID         NOT NULL REFERENCES assets(asset_id),
  quote_asset_id UUID        NOT NULL REFERENCES assets(asset_id),
  symbol        VARCHAR(20)  UNIQUE NOT NULL,   -- e.g., BTCUSDT
  min_quantity  NUMERIC(38,14) NOT NULL DEFAULT 0.00001,
  tick_size     NUMERIC(38,14) NOT NULL,
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  CONSTRAINT chk_different_assets CHECK (base_asset_id <> quote_asset_id)
);
```

**Keys:**
- PK: `pair_id`
- FK: `base_asset_id → assets.asset_id`
- FK: `quote_asset_id → assets.asset_id`
- Unique: `symbol`

---

#### `wallets`
```sql
CREATE TABLE wallets (
  wallet_id     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  asset_id      UUID         NOT NULL REFERENCES assets(asset_id),
  address       VARCHAR(256) NOT NULL,
  wallet_type   VARCHAR(20)  NOT NULL DEFAULT 'DEPOSIT',
                             -- DEPOSIT | HOT | COLD | SAFU
  balance       NUMERIC(38,14) NOT NULL DEFAULT 0,
  locked_balance NUMERIC(38,14) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_asset_type UNIQUE (user_id, asset_id, wallet_type),
  CONSTRAINT chk_non_negative CHECK (balance >= 0 AND locked_balance >= 0)
);
```

**Keys:**
- PK: `wallet_id`
- FK: `user_id → users.user_id`
- FK: `asset_id → assets.asset_id`
- Unique: `(user_id, asset_id, wallet_type)`

---

#### `orders`
```sql
CREATE TABLE orders (
  order_id      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID         NOT NULL REFERENCES users(user_id),
  pair_id       UUID         NOT NULL REFERENCES trading_pairs(pair_id),
  order_type    VARCHAR(20)  NOT NULL,   -- LIMIT | MARKET | STOP_LIMIT | OCO
  side          VARCHAR(4)   NOT NULL,   -- BUY | SELL
  quantity      NUMERIC(38,14) NOT NULL,
  price         NUMERIC(38,14),          -- NULL for MARKET orders
  stop_price    NUMERIC(38,14),          -- for STOP_LIMIT
  filled_qty    NUMERIC(38,14) NOT NULL DEFAULT 0,
  status        VARCHAR(20)  NOT NULL DEFAULT 'OPEN',
                             -- OPEN | PARTIAL | FILLED | CANCELLED | REJECTED
  time_in_force VARCHAR(10)  NOT NULL DEFAULT 'GTC',
                             -- GTC | IOC | FOK
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ,
  client_order_id VARCHAR(100),
  CONSTRAINT chk_quantity_positive CHECK (quantity > 0),
  CONSTRAINT chk_filled_lte_qty CHECK (filled_qty <= quantity)
);

-- Performance indexes
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_pair_status ON orders(pair_id, status, created_at);
```

**Keys:**
- PK: `order_id`
- FK: `user_id → users.user_id`
- FK: `pair_id → trading_pairs.pair_id`

---

#### `trades`
```sql
CREATE TABLE trades (
  trade_id      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  buy_order_id  UUID         NOT NULL REFERENCES orders(order_id),
  sell_order_id UUID         NOT NULL REFERENCES orders(order_id),
  pair_id       UUID         NOT NULL REFERENCES trading_pairs(pair_id),
  buyer_id      UUID         NOT NULL REFERENCES users(user_id),
  seller_id     UUID         NOT NULL REFERENCES users(user_id),
  quantity      NUMERIC(38,14) NOT NULL,
  price         NUMERIC(38,14) NOT NULL,
  buyer_fee     NUMERIC(38,14) NOT NULL DEFAULT 0,
  seller_fee    NUMERIC(38,14) NOT NULL DEFAULT 0,
  is_maker_buyer BOOLEAN     NOT NULL,  -- TRUE if buyer was the maker (limit order)
  executed_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_trades_pair_time ON trades(pair_id, executed_at DESC);
CREATE INDEX idx_trades_buyer ON trades(buyer_id, executed_at DESC);
CREATE INDEX idx_trades_seller ON trades(seller_id, executed_at DESC);
```

**Keys:**
- PK: `trade_id`
- FK: `buy_order_id → orders.order_id`
- FK: `sell_order_id → orders.order_id`
- FK: `pair_id → trading_pairs.pair_id`
- FK: `buyer_id → users.user_id`
- FK: `seller_id → users.user_id`

---

#### `wallet_transactions`
```sql
CREATE TABLE wallet_transactions (
  txn_id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id     UUID         NOT NULL REFERENCES wallets(wallet_id),
  user_id       UUID         NOT NULL REFERENCES users(user_id),
  asset_id      UUID         NOT NULL REFERENCES assets(asset_id),
  txn_type      VARCHAR(20)  NOT NULL,    -- DEPOSIT | WITHDRAWAL | FEE | TRADE_CREDIT
  amount        NUMERIC(38,14) NOT NULL,
  fee           NUMERIC(38,14) NOT NULL DEFAULT 0,
  status        VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
                             -- PENDING | PROCESSING | CONFIRMED | FAILED
  blockchain_txn_hash VARCHAR(128),       -- on-chain tx hash (null for internal)
  confirmations INTEGER      DEFAULT 0,
  network_fee   NUMERIC(38,14),           -- blockchain gas fee
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  confirmed_at  TIMESTAMPTZ
);
```

**Keys:**
- PK: `txn_id`
- FK: `wallet_id → wallets.wallet_id`
- FK: `user_id → users.user_id`
- FK: `asset_id → assets.asset_id`

---

#### `fees`
```sql
CREATE TABLE fees (
  fee_id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id      UUID         NOT NULL REFERENCES trades(trade_id),
  user_id       UUID         NOT NULL REFERENCES users(user_id),
  asset_id      UUID         NOT NULL REFERENCES assets(asset_id),
  fee_type      VARCHAR(20)  NOT NULL,   -- MAKER | TAKER | WITHDRAWAL
  rate          NUMERIC(10,8) NOT NULL,  -- e.g., 0.001 = 0.1%
  amount        NUMERIC(38,14) NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

**Keys:**
- PK: `fee_id`
- FK: `trade_id → trades.trade_id`
- FK: `user_id → users.user_id`
- FK: `asset_id → assets.asset_id`

---

#### `notifications`
```sql
CREATE TABLE notifications (
  notification_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  channel       VARCHAR(20)  NOT NULL,   -- EMAIL | SMS | PUSH | IN_APP
  subject       VARCHAR(200),
  message       TEXT         NOT NULL,
  sent_at       TIMESTAMPTZ,
  read_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

**Keys:**
- PK: `notification_id`
- FK: `user_id → users.user_id`

---

#### `audit_logs`
```sql
CREATE TABLE audit_logs (
  log_id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID         REFERENCES users(user_id),
  admin_id      UUID,                     -- if action taken by admin
  action        VARCHAR(100) NOT NULL,    -- LOGIN | WITHDRAW | KYC_APPROVED | etc
  entity_type   VARCHAR(50),              -- ORDER | USER | WALLET | etc
  entity_id     UUID,
  ip_address    INET,
  details       JSONB,                    -- flexible structured data
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Immutable: no UPDATE/DELETE allowed via DB policy or append-only table
```

**Keys:**
- PK: `log_id`
- FK: `user_id → users.user_id` (nullable for system events)

---

### 10.3 Complete FK Relationship Map

```
countries
  └─► users.country_code

users
  ├─► sessions.user_id
  ├─► kyc_records.user_id
  ├─► wallets.user_id
  ├─► orders.user_id
  ├─► trades.buyer_id
  ├─► trades.seller_id
  ├─► wallet_transactions.user_id
  ├─► fees.user_id
  ├─► notifications.user_id
  └─► audit_logs.user_id

assets
  ├─► trading_pairs.base_asset_id
  ├─► trading_pairs.quote_asset_id
  ├─► wallets.asset_id
  ├─► wallet_transactions.asset_id
  └─► fees.asset_id

trading_pairs
  ├─► orders.pair_id
  └─► trades.pair_id

orders
  ├─► trades.buy_order_id
  └─► trades.sell_order_id

trades
  └─► fees.trade_id

wallets
  └─► wallet_transactions.wallet_id
```

---

### 10.4 Normalization Verification

| Violation Type | Status |
|---------------|--------|
| Repeating groups (1NF) | ✅ Resolved — each row is atomic |
| Partial dependencies on composite PK (2NF) | ✅ Resolved — all single-column PKs (UUID); `assets` separated |
| Transitive dependencies (3NF) | ✅ Resolved — `countries` extracted; `trading_pairs` extracted from `orders`; `fees` extracted from `trades` |
| Data duplication | ✅ Minimized — asset details not repeated in orders |
| Referential integrity | ✅ Enforced via FK constraints |

---

## 11. References

| Source | URL / Citation |
|--------|---------------|
| BNB Chain — Scalable DB Architecture | https://www.bnbchain.org/en/blog/scalable-db-the-next-step-in-bnb-smart-chains-data-architecture |
| BNB Chain — Tech Roadmap 2026 | https://www.bnbchain.org/en/blog/tech-roadmap-2026 |
| BNB Chain — Infrastructure Upgrade (Lorentz/Maxwell) | https://www.bnbchain.org/en/blog/bnb-chains-infrastructure-just-levelled-up-heres-what-changed |
| BNB Chain — Validator Overview | https://docs.bnbchain.org/bnb-smart-chain/validator/overview/ |
| Messari — State of BNB Chain Q4 2025 | https://messari.io/report/state-of-bnb-chain-q4-2025 |
| Messari — State of BNB Chain Q1 2025 | https://messari.io/report/state-of-bnb-chain-q1-2025 |
| Binance Security Methodologies | https://medium.com/@sitharawanigasooriya_ |
| Coin Bureau — Binance Security Deep Dive 2026 | https://coinbureau.com/analysis/binance-exchange-security |
| Bitget Academy — Hot/Cold Wallet Guide 2026 | https://www.bitget.com/academy/hot-cold-wallet-guid |
| Bitget Academy — SAFU Funds Explained 2026 | https://www.bitget.com/academy/safu-exchange-securi |
| Bitget Academy — Crypto Exchange Security 2024 | https://www.bitget.com/academy/crypto-exchange-secu-0 |
| IdeaSoft — CEX Development | https://ideasoft.io/blog/centralized-crypto-exchange-development-pros-and-cons/ |
| DEV Community — Crypto Exchange Architecture | https://dev.to/riley_quinn_8e58a0a96d107/crypto-exchange-architecture-design-a-practical-guide-for-developers-183f |
| DEV Community — Order Matching Engine | https://dev.to/riley_quinn_8e58a0a96d107/order-matching-engine-what-every-crypto-exchange-developer-must-know-1ic3 |
| VeloDB — Real-Time On-Chain Analytics | https://www.velodb.io/blog/from-postgresql-to-velodb-real-time-on-chain-analytics-for-web3-and-crypto |
| Medium — System Design: Cryptocurrency Exchange | https://mecha-mind.medium.com/system-design-cryptocurrency-exchange-d09be2874c6b |
| Medium — BSC Node Architecture | https://medium.com/@lth9739/node-architecture-and-network-design-of-binance-smart-chain-08ee5c56cff3 |
| Binance Whitepaper V1.1 | https://www.exodus.com/assets/docs/binance-coin-whitepaper.pdf |
| Whales Market — CEX Explained | https://whales.market/blog/what-is-cex-centralized-exchange/ |
| The Defiant — Crypto Wallets 2025 | https://thedefiant.io/education/defi/crypto-wallet |
| HuggingFace — Trading Platform DB Schema | https://huggingface.co/datasets/devlancer/fl68 |

---

*Document compiled: May 2026 | Sources: BNB Chain official blogs, Messari Research, peer-reviewed architecture analyses, and technical Medium publications.*
