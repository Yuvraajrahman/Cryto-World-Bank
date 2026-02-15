# System Architecture Document
## Crypto World Bank — BCOLBD 2025

**Document Type:** Prototype Architecture Specification  
**Evaluation Alignment:** BCOLBD 2025 Prototype Evaluation — Criterion iii: Architecture (20 points)  
**Version:** 1.0  
**Date:** February 2025

---

## I. Overview

This document specifies the system architecture of the Crypto World Bank decentralized lending platform. It is structured to address the BCOLBD 2025 prototype evaluation rubric for Architecture, which assesses:

1. Transaction verification and consensus setup
2. On-chain and off-chain data storage strategy
3. Regulatory compliance in the banking domain
4. Data model design
5. Integration with legacy systems
6. Digital identity system
7. Data storage mechanisms

---

## II. Transaction Verification and Consensus

### A. Consensus Mechanism

| Parameter | Specification |
|-----------|---------------|
| **Blockchain platform** | Ethereum Virtual Machine (EVM) |
| **Primary network** | Polygon PoS (Mumbai testnet for development) |
| **Secondary network** | Ethereum (Sepolia testnet for cross-chain validation) |
| **Consensus algorithm** | Proof-of-Stake (PoS) |
| **Validator set** | Polygon: 100+ decentralized validators; Sepolia: Ethereum Foundation validators |
| **Block time** | Polygon: ~2 seconds; Sepolia: ~12 seconds |
| **Finality model** | Polygon: probabilistic finality (~2 sec), periodic checkpoints to Ethereum L1 for deterministic finality |

### B. Transaction Lifecycle

```
User Action (e.g., Request Loan)
        │
        ▼
┌─────────────────────┐
│ Frontend constructs  │
│ unsigned transaction │
│ (Wagmi / Viem)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Wallet signs tx     │
│ (MetaMask / HW)     │
│ EIP-1559 gas model  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Signed tx broadcast │
│ to Polygon mempool  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ PoS validators      │
│ include tx in block │
│ (~2 sec block time) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Block finalized     │
│ Event emitted       │
│ State updated       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Frontend reads      │
│ updated state       │
│ (via Wagmi hooks)   │
└─────────────────────┘
```

### C. Transaction Types and Verification

| Transaction | Smart Contract | Function | Verification |
|-------------|---------------|----------|--------------|
| Deposit to reserve | WorldBankReserve | `depositToReserve()` | Sender signature; msg.value > 0; contract not paused |
| Register National Bank | WorldBankReserve | `registerNationalBank()` | Owner signature; address validity; uniqueness check |
| Lend to National Bank | WorldBankReserve | `lendToNationalBank()` | Owner signature; sufficient reserve; bank is active |
| Register Local Bank | NationalBank | `registerLocalBank()` | National Bank owner signature; address validity |
| Request loan | LocalBank | `requestLoan()` | Sender signature; amount > 0; purpose non-empty |
| Approve loan | LocalBank | `approveLoan()` | Approver signature; loan status == Pending; sufficient balance |
| Reject loan | LocalBank | `rejectLoan()` | Approver signature; loan status == Pending |
| Pause/Unpause | WorldBankReserve | `pause()` / `unpause()` | Owner signature only |

---

## III. On-Chain and Off-Chain Data Strategy

### A. Design Principles

The data architecture follows a **hybrid on-chain/off-chain model** guided by three principles:

1. **Transparency principle:** Financial state transitions that require public auditability are stored on-chain.
2. **Privacy principle:** Data containing PII or requiring rich query capabilities is stored off-chain.
3. **Cost principle:** High-frequency or large-payload data is stored off-chain to minimize gas expenditure.

### B. Data Distribution Matrix

| Data Category | On-Chain | Off-Chain | Rationale |
|---------------|----------|-----------|-----------|
| Reserve balances | ✅ | Cached | Transparency; single source of truth |
| Loan request records | ✅ (core fields) | ✅ (extended fields) | On-chain: amount, status, borrower address. Off-chain: purpose text, rejection notes |
| Approval/rejection events | ✅ (events) | ✅ (detailed logs) | On-chain events for auditability; off-chain for query flexibility |
| Repayment transactions | ✅ | ✅ | On-chain for immutability; off-chain for aggregate analytics |
| User profiles (name, email) | — | ✅ | PII; not suitable for public blockchain |
| Income verification docs | — | ✅ (encrypted) | Confidential; large binary payloads |
| Chat messages | — | ✅ | Privacy; high volume; no audit requirement |
| AI/ML security logs | — | ✅ | Inference metadata; no public audit need |
| Cryptocurrency market data | — | ✅ (cached) | External API; high update frequency |
| Borrowing limit calculations | — | ✅ | Complex temporal aggregation; results fed to on-chain checks |

### C. Data Synchronization

```
BLOCKCHAIN                          OFF-CHAIN DATABASE
    │                                       │
    │ ← Smart Contract Events →             │
    │   (ReserveDeposited,                  │
    │    LoanRequested,                     │
    │    LoanApproved,                      │
    │    LoanRejected)                      │
    │                                       │
    │         Event Listener Service        │
    │         (Planned: Node.js / Python)   │
    │              │                        │
    │              ▼                        │
    │         Parse event data             │
    │         Insert into PostgreSQL        │
    │         Update derived tables         │
    │                                       │
    └───────────────────────────────────────┘
```

---

## IV. Regulatory Compliance Architecture

### A. Banking Domain Considerations

As a lending platform operating in the financial services domain, the architecture addresses the following regulatory dimensions:

| Regulatory Area | Architecture Support |
|-----------------|---------------------|
| **Anti-Money Laundering (AML)** | Income verification for first-time borrowers; transaction history logging; AI/ML anomaly detection for suspicious patterns |
| **Know Your Customer (KYC)** | Wallet-based pseudonymous identity with optional off-chain identity verification; extensible to third-party KYC providers |
| **Audit trail** | Immutable on-chain event log for all financial operations; timestamped, publicly verifiable |
| **Reserve transparency** | Real-time on-chain reserve balance visible to all stakeholders; no hidden liabilities |
| **Data protection (GDPR-aligned)** | PII stored off-chain only; data minimization; right-to-erasure for off-chain records; no PII on immutable ledger |

### B. Testnet Prototype Compliance

The current prototype operates exclusively on **public testnets** (Polygon Mumbai, Ethereum Sepolia) with the following implications:

- **No real monetary value** is at risk.
- **No regulatory license** is required for testnet operation.
- The architecture is designed to be **production-ready** pending formal regulatory engagement (e.g., regulatory sandbox application).

### C. Production Compliance Pathway

For production deployment, the following steps are planned:

1. Engage regulatory sandbox programs in target jurisdictions (e.g., Bangladesh Bank sandbox, MAS Singapore).
2. Integrate third-party KYC/AML providers (e.g., Chainalysis, Jumio).
3. Deploy on permissioned or consortium blockchain if required by regulators.
4. Conduct formal security audit and penetration testing.

---

## V. Data Model

### A. Entity-Relationship Overview

The relational database comprises **15 entities** organized in Third Normal Form (3NF):

```
┌────────────────────────────────────────────────────────────────┐
│                     ENTITY HIERARCHY                            │
└────────────────────────────────────────────────────────────────┘

WORLD_BANK (1) ──< (N) NATIONAL_BANK (1) ──< (N) LOCAL_BANK
                                                       │
                                              (1) ──< (N) BANK_USER
                                                       │
                                              (N) ──< (N) BORROWER
                                                       │
                    ┌──────────────┬───────────────────┼──────────┐
                    ▼              ▼                   ▼          ▼
              LOAN_REQUEST    TRANSACTION       INCOME_PROOF  BORROWING_LIMIT
                    │
          ┌────────┼──────────┐
          ▼        ▼          ▼
    INSTALLMENT  CHAT_MSG  AI_ML_SECURITY_LOG

Independent: MARKET_DATA, AI_CHATBOT_LOG, PROFILE_SETTINGS
```

### B. Smart Contract Data Model (On-Chain)

| Contract | State Variables | Data Structures |
|----------|-----------------|-----------------|
| WorldBankReserve | `totalReserve`, `loanCounter`, `paused` | `Loan` struct (id, borrower, amount, purpose, status, timestamps); `NationalBankInfo` struct; mappings for loans, user deposits, national banks |
| NationalBank | `totalBorrowedFromWorldBank`, `totalLentToLocalBanks` | `LocalBankInfo` struct; mapping for local banks |
| LocalBank | `totalBorrowedFromNationalBank`, `totalLentToUsers`, `loanCounter` | `Loan` struct; `bankUsers` mapping; `approver` address |

### C. Relational Database Schema (Off-Chain)

The off-chain database implements 15 tables covering five domains:

| Domain | Tables |
|--------|--------|
| **Banking hierarchy** | `WORLD_BANK`, `NATIONAL_BANK`, `LOCAL_BANK`, `BANK_USER` |
| **User management** | `BORROWER`, `PROFILE_SETTINGS`, `INCOME_PROOF` |
| **Lending lifecycle** | `LOAN_REQUEST`, `INSTALLMENT`, `TRANSACTION`, `BORROWING_LIMIT` |
| **Communication** | `CHAT_MESSAGE` |
| **AI/ML and analytics** | `AI_CHATBOT_LOG`, `AI_ML_SECURITY_LOG`, `MARKET_DATA` |

All tables are normalized to 3NF. Foreign keys enforce referential integrity. Composite indexes optimize query patterns for loan management and borrowing limit calculations.

---

## VI. Legacy System Integration

### A. Current Integrations

| Integration Point | Technology | Protocol |
|--------------------|------------|----------|
| **Browser wallet** | MetaMask | EIP-1193 (Ethereum Provider API) |
| **Mobile wallet** | WalletConnect | WalletConnect v2 relay protocol |
| **Blockchain RPC** | Alchemy / Infura | JSON-RPC over HTTPS |
| **Market data** | CoinGecko API (planned) | REST API over HTTPS |

### B. Planned Legacy Integrations

| Integration Point | Purpose | Protocol |
|--------------------|---------|----------|
| **Fiat on-ramp** | Convert fiat currency to crypto for deposits | Partner API (e.g., MoonPay, Transak) |
| **KYC/AML provider** | Identity verification for regulatory compliance | REST API (e.g., Jumio, Chainalysis) |
| **Email/SMS notifications** | Alert users on loan status changes | SMTP / Twilio API |
| **Banking core systems** | Integration with existing bank infrastructure | REST / SOAP API adapters |

### C. Integration Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  MetaMask    │    │ WalletConnect│    │  Hardware    │
│  (Browser)   │    │  (Mobile)    │    │  Wallet      │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       └───────────┬───────┘───────────────────┘
                   │
            ┌──────▼───────┐
            │   Frontend   │
            │  (React App) │
            └──────┬───────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
  ┌──────────┐ ┌────────┐ ┌──────────┐
  │Blockchain│ │Off-Chain│ │ External │
  │  RPC     │ │  API   │ │  APIs    │
  │(Alchemy) │ │(FastAPI)│ │(Market,  │
  └──────────┘ └────────┘ │ KYC, etc)│
                           └──────────┘
```

---

## VII. Digital Identity System

### A. Identity Architecture

The Crypto World Bank implements a **wallet-based decentralized identity system**:

| Component | Mechanism |
|-----------|-----------|
| **Identity anchor** | Ethereum wallet address (derived from secp256k1 key pair) |
| **Authentication** | Cryptographic signature of a server-issued challenge (EIP-191 / EIP-712) |
| **Authorization** | On-chain role mappings in smart contract state |
| **Session management** | Client-side session; no server-side session store |

### B. Role Assignment Flow

```
1. User connects wallet (MetaMask / WalletConnect)
          │
          ▼
2. Frontend reads wallet address
          │
          ▼
3. Smart contract queried for role:
   - Is this address the contract owner? → Owner/Admin role
   - Is this address a registered National Bank? → National Bank role
   - Is this address a bank user/approver? → Bank User / Approver role
   - Otherwise → Borrower role (default)
          │
          ▼
4. Frontend renders role-appropriate UI
   (Dashboard, Admin panel, Risk dashboard, etc.)
```

### C. Identity Properties

| Property | Implementation |
|----------|----------------|
| **Self-sovereign** | User controls their private key; no custodial identity provider |
| **Pseudonymous** | Wallet addresses are not inherently linked to real-world identity |
| **Verifiable** | Role assignments are on-chain; anyone can verify a user's role |
| **Portable** | Same wallet address works across any EVM-compatible chain |
| **Revocable** | Bank/admin roles can be revoked by the registering authority |

---

## VIII. Data Storage Architecture

### A. Storage Layers

| Layer | Technology | Purpose | Characteristics |
|-------|------------|---------|-----------------|
| **Layer 1: Blockchain** | Polygon PoS / Ethereum | Financial state, events | Immutable, decentralized, publicly auditable |
| **Layer 2: Relational DB** | PostgreSQL | Application data, profiles, logs | ACID-compliant, rich queries, access-controlled |
| **Layer 3: File storage** | Local / S3 (planned) | Income documents, uploaded files | Encrypted at rest, access-logged |
| **Layer 4: Cache** | Redis (planned) | Market data, borrowing limits, session | Low-latency reads, TTL-based expiration |

### B. Storage Lifecycle

| Data | Write Path | Read Path | Retention |
|------|-----------|-----------|-----------|
| Loan transactions | Frontend → Wallet → Blockchain | Frontend ← Wagmi hooks ← Blockchain RPC | Permanent (on-chain) |
| User profiles | Frontend → API → PostgreSQL | Frontend ← API ← PostgreSQL | Until account deletion |
| Market data | External API → Backend → Redis | Frontend ← API ← Redis | 5-minute TTL |
| AI/ML logs | ML service → PostgreSQL | Dashboard ← API ← PostgreSQL | 1 year rolling |
| Income documents | Frontend → API → Encrypted storage | Approver ← API ← Encrypted storage | Per regulatory requirement |

---

## IX. Scalability Considerations

| Dimension | Current (Prototype) | Production Plan |
|-----------|--------------------|-----------------| 
| **Transaction throughput** | Polygon testnet: ~65 TPS | L2 rollups; batch processing for non-critical operations |
| **Database scalability** | Single PostgreSQL instance | Read replicas; partitioning by date for TRANSACTION and AI_ML_SECURITY_LOG tables |
| **Frontend scalability** | Static hosting (Vercel) | CDN delivery; code splitting; lazy loading |
| **AI/ML inference** | Synchronous API call | Asynchronous inference via message queue; model caching |

---

## X. Summary

The Crypto World Bank architecture implements a **three-layer decentralized application** on the Ethereum Virtual Machine with Polygon PoS consensus, providing sub-2-second block finality for lending operations. The hybrid on-chain/off-chain data strategy balances transparency with privacy and cost efficiency. The system addresses regulatory compliance through audit trail generation, data partitioning, and extensible KYC/AML integration points. A 15-entity relational data model supports the full lending lifecycle, and a wallet-based digital identity system provides self-sovereign, pseudonymous authentication with on-chain role verification.

This architecture directly satisfies all seven evaluation considerations specified in the BCOLBD 2025 Architecture criterion.
