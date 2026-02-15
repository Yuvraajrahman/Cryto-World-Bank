# Governance Framework Document
## Crypto World Bank — BCOLBD 2025

**Document Type:** Governance and Trust Design Specification  
**Evaluation Alignment:** BCOLBD 2025 Prototype Evaluation — Criterion iv: Governance (20 points)  
**Version:** 1.0  
**Date:** February 2025

---

## I. Overview

This document defines the governance framework of the Crypto World Bank decentralized lending platform. It addresses how the system manages trust, membership, operations, and technology decisions in a decentralized multi-stakeholder environment.

The framework is organized according to the BCOLBD 2025 governance checklist:

1. **Network Membership Governance** — Member on/off-boarding, regulatory oversight, permission structure, network operations
2. **Business Network Governance** — Business charter, common services, SLA, regulatory compliance
3. **Technology Infrastructure Governance** — Distributed IT structure, technology assessment, on-chain/off-chain data services, risk mitigation

---

## II. Network Membership Governance

### A. Member On-Boarding

The Crypto World Bank operates a **hierarchical, invitation-based membership model** where each tier is responsible for on-boarding the tier below it:

| Member Type | On-Boarded By | Smart Contract Function | Process |
|-------------|---------------|------------------------|---------|
| **World Bank** | Genesis deployment | Contract constructor | Single instance created at deployment; deployer wallet becomes Owner |
| **National Bank** | World Bank Owner | `registerNationalBank(address, name, country)` | Owner verifies institution credentials off-chain; registers on-chain with unique address |
| **Local Bank** | National Bank | `registerLocalBank(address, name, city)` | National Bank verifies local institution; registers on-chain |
| **Bank Approver** | Local Bank Owner | `setApprover(address)` | Local Bank designates exactly one approver per bank |
| **Bank User** | Local Bank Owner | `addBankUser(address)` | Local Bank adds staff with viewer permissions |
| **Borrower** | Self-registration | Wallet connection (no registration tx) | Any wallet can interact as borrower; optional off-chain profile creation |

#### On-Boarding Verification Protocol

```
Off-Chain Verification              On-Chain Registration
─────────────────────               ──────────────────────
1. Applicant submits               4. Registering authority
   institutional credentials          calls registerX() function
         │                                    │
         ▼                                    ▼
2. Registering authority           5. Smart contract validates:
   reviews documentation              - Address not zero
   (legal entity proof,               - Not already registered
    banking license, etc.)             - Caller has authority
         │                                    │
         ▼                                    ▼
3. Decision: Approve / Reject      6. If approved:
                                      - Struct created in mapping
                                      - isActive = true
                                      - Event emitted
                                      - Address added to registry
```

### B. Member Off-Boarding

| Scenario | Mechanism | On-Chain Effect | Off-Chain Effect |
|----------|-----------|-----------------|------------------|
| **Voluntary exit** | Member requests deactivation | `isActive` set to `false`; lending functions disabled | Profile marked inactive; data retained for audit |
| **Forced removal** | Registering authority deactivates | `isActive` set to `false` via authority function | Access revoked; audit log entry created |
| **Outstanding obligations** | Member has active loans | Off-boarding blocked until obligations settled | Notification to settle outstanding balances |
| **Cascading deactivation** | National Bank deactivated | All associated Local Banks flagged for review | Hierarchical notification chain |

### C. Regulatory Oversight Provisioning

| Mechanism | Implementation | Status |
|-----------|----------------|--------|
| **On-chain audit trail** | All financial operations emit indexed events (`ReserveDeposited`, `LoanRequested`, `LoanApproved`, `LoanRejected`) | Implemented |
| **Read-only regulator access** | Dedicated API endpoint providing filtered view of on-chain and off-chain activity | Planned |
| **Compliance reporting** | Automated generation of transaction reports per regulatory requirements | Planned |
| **Regulatory dashboard** | Web interface for regulators to query loan portfolios, reserve status, risk metrics | Planned |

### D. Permission Structure

The system enforces a **strict hierarchical permission model** where authority flows downward and each tier can only manage the tier directly below it:

```
                ┌──────────────────┐
                │   WORLD BANK     │  Level 0 — Genesis Authority
                │   (Owner)        │  Can: Register National Banks
                │                  │       Lend to National Banks
                │                  │       Pause/Unpause system
                │                  │       Emergency withdraw
                └────────┬─────────┘
                         │ registers
                         ▼
                ┌──────────────────┐
                │ NATIONAL BANK    │  Level 1 — National Authority
                │                  │  Can: Register Local Banks
                │                  │       Borrow from World Bank
                │                  │       Lend to Local Banks
                └────────┬─────────┘
                         │ registers
                         ▼
                ┌──────────────────┐
                │  LOCAL BANK      │  Level 2 — Local Authority
                │                  │  Can: Add Bank Users
                │                  │       Set Approver
                │                  │       Manage loan portfolio
                └────────┬─────────┘
                         │ designates
                         ▼
                ┌──────────────────┐
                │  APPROVER        │  Level 3 — Operational Authority
                │                  │  Can: Approve/Reject loans
                │                  │       Review income proofs
                │                  │       View risk dashboard
                └──────────────────┘
                         │
                         ▼ (serves)
                ┌──────────────────┐
                │  BORROWER        │  Level 4 — End User
                │                  │  Can: Request loans
                │                  │       Deposit to reserve
                │                  │       View own loan status
                └──────────────────┘
```

### E. Network Operations

| Operation | Responsible Party | Mechanism |
|-----------|-------------------|-----------|
| **System health monitoring** | World Bank Owner | Dashboard displaying reserve status, active loans, pending requests |
| **Emergency pause** | World Bank Owner | `pause()` function halts all financial operations; `unpause()` to resume |
| **Emergency fund recovery** | World Bank Owner | `emergencyWithdraw()` transfers all contract funds to owner; last-resort mechanism |
| **Dispute resolution** | Bank Approver + Owner | Off-chain dispute process; on-chain loan status can be updated by authorized parties |
| **Network parameter updates** | World Bank Owner | Contract upgrade (redeployment) or parameter update functions (future) |

---

## III. Business Network Governance

### A. Business Charter

The Crypto World Bank operates under the following business charter:

**Mission:** To provide a transparent, blockchain-based hierarchical lending platform that enables efficient capital flow from global reserves to local borrowers, augmented by AI-driven risk management.

**Operating Principles:**

1. **Transparency** — All financial state transitions are recorded on a public blockchain and are verifiable by any network participant.
2. **Hierarchical accountability** — Each tier is accountable to the tier above it. Capital flow follows the established hierarchy without exceptions.
3. **Rule-based enforcement** — Lending rules (borrowing limits, installment schedules, approval requirements) are codified in smart contracts and enforced deterministically.
4. **Inclusive access** — Any wallet holder can participate as a borrower; institutional membership is governed by the on-boarding protocol.
5. **Data-driven decisions** — AI/ML analytics augment human judgment but do not replace it; all automated recommendations are explainable.

### B. Operations Structure

| Operational Domain | Responsibility | Governance Level |
|-------------------|----------------|------------------|
| **Reserve management** | Maintaining adequate reserves; lending to National Banks | World Bank (Level 0) |
| **National portfolio** | Allocating capital to Local Banks; monitoring national exposure | National Bank (Level 1) |
| **Local lending** | Processing borrower applications; managing approvals | Local Bank (Level 2) |
| **Loan approval** | Evaluating applications; using AI risk scores; approve/reject | Approver (Level 3) |
| **Borrower services** | Loan status tracking; installment management; chat support | Borrower (Level 4) |

### C. Common Services Management

The following services are provided as shared infrastructure across all network participants:

| Service | Description | Provider |
|---------|-------------|----------|
| **Smart contract platform** | Loan lifecycle management, reserve operations | EVM blockchain (decentralized) |
| **Event notification** | Real-time notification of state changes (approvals, rejections, deposits) | Event listener service (centralized, planned) |
| **AI/ML risk assessment** | Fraud detection, anomaly identification, explainable risk scores | Off-chain ML service (centralized, planned) |
| **Market data feed** | Live cryptocurrency pricing for loan denomination | External API integration (CoinGecko) |
| **Communication platform** | Borrower-bank chat per loan request | Off-chain messaging service |
| **Identity resolution** | Wallet-to-role mapping; profile management | Smart contract + off-chain database |

### D. Service Level Agreements (SLA)

| Phase | Availability Target | Recovery Time Objective | Recovery Point Objective |
|-------|--------------------|-----------------------|-------------------------|
| **Testnet prototype** | Best-effort | N/A | N/A |
| **Pilot deployment** | 99.0% uptime | 8 hours | 1 hour |
| **Production** | 99.5% uptime | 4 hours | 15 minutes |

**Blockchain layer SLA:** Dependent on underlying network (Polygon, Ethereum) availability. Historical Polygon PoS uptime exceeds 99.9%.

### E. Regulatory Compliance

| Compliance Area | Current Status | Production Requirement |
|-----------------|----------------|----------------------|
| **AML screening** | Income verification for first-time borrowers | Integration with AML screening provider |
| **KYC identity verification** | Wallet-based pseudonymous identity | Third-party KYC provider integration |
| **Transaction reporting** | On-chain event logs; off-chain audit database | Automated regulatory report generation |
| **Data protection** | PII off-chain only; data minimization | GDPR/local equivalent compliance certification |
| **Licensing** | Not required (testnet prototype) | Regulatory sandbox or lending license |

---

## IV. Technology Infrastructure Governance

### A. Distributed IT Structure

```
┌──────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                            │
│  ┌─────────┐  ┌──────────────┐  ┌────────────────┐       │
│  │ Browser │  │ Mobile       │  │ Hardware       │       │
│  │ (React) │  │ (WalletConn.)│  │ Wallet (Ledger)│       │
│  └────┬────┘  └──────┬───────┘  └───────┬────────┘       │
└───────┼──────────────┼──────────────────┼────────────────┘
        │              │                  │
        └──────────────┼──────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────┐
│                 BLOCKCHAIN LAYER (Decentralized)           │
│  ┌────────────────────────────────────────┐               │
│  │ Polygon PoS Network                    │               │
│  │ 100+ Validators · ~2s blocks           │               │
│  │ Smart Contracts deployed here          │               │
│  └────────────────────────────────────────┘               │
│  ┌────────────────────────────────────────┐               │
│  │ Ethereum L1 (Checkpoints)              │               │
│  │ Finality anchor for Polygon            │               │
│  └────────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────┐
│              BACKEND SERVICES LAYER (Centralized)          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ FastAPI  │  │PostgreSQL│  │  Redis   │  │ AI/ML    │ │
│  │ (REST)   │  │ (DB)     │  │ (Cache)  │  │ Service  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
└──────────────────────────────────────────────────────────┘
```

**Decentralization spectrum:**
- **Fully decentralized:** Blockchain layer (no single point of failure)
- **Client-decentralized:** Frontend delivered as static assets; runs in user's browser
- **Centralized (planned):** Backend API and database; horizontally scalable but single-operator

### B. Technology Assessment and Adoption

| Technology Decision | Selected | Alternatives Evaluated | Justification |
|--------------------|----------|----------------------|---------------|
| **Blockchain platform** | EVM (Polygon) | Solana, Hyperledger Fabric | Largest ecosystem; most wallet support; free testnets; OpenZeppelin security libraries |
| **Smart contract language** | Solidity 0.8.20 | Vyper, Rust (Solana) | Industry standard; mature tooling; overflow protection built-in |
| **Frontend framework** | React + TypeScript | Vue, Angular | Best Web3 library ecosystem (Wagmi, RainbowKit); strong type safety |
| **Database** | PostgreSQL | MongoDB, SQLite | Relational model fits banking data; ACID compliance; robust query optimizer |
| **AI/ML framework** | scikit-learn + SHAP | PyTorch, TensorFlow | Optimal for tabular fraud detection; SHAP is gold standard for explainability |
| **API framework** | FastAPI | Express.js, Django | Async Python; automatic OpenAPI docs; native Pydantic validation |

**Adoption criteria:** Each technology is evaluated against cost (zero for prototype), ecosystem maturity, team familiarity, security track record, and alignment with project requirements.

### C. On-Chain and Off-Chain Data Services

| Service | Implementation | Governance |
|---------|----------------|------------|
| **On-chain state reads** | Wagmi React hooks; direct RPC calls via Viem | Public; no access control required |
| **On-chain state writes** | User-signed transactions via wallet | Enforced by smart contract modifiers |
| **Off-chain reads** | REST API with role-based authentication | API gateway with wallet signature verification |
| **Off-chain writes** | API endpoints with input validation | Role-checked; audit-logged |
| **Event synchronization** | Blockchain event listener → PostgreSQL | Automated; idempotent; monitored for lag |
| **Cache management** | Redis with TTL-based expiration | Automatic invalidation; no stale data risk for financial operations |

### D. Risk Mitigation

| Risk | Technical Mitigation | Governance Mitigation |
|------|---------------------|----------------------|
| **Smart contract exploit** | ReentrancyGuard; Ownable; Check-Effects-Interactions; Solidity 0.8 overflow protection | Pause mechanism; emergency withdraw; planned formal audit |
| **Database compromise** | Encryption at rest; network isolation; parameterized queries | Access logging; regular backups; role-based database users |
| **Key compromise (admin)** | Hardware wallet recommended; multi-sig (future) | Key rotation procedure; cascading access review |
| **Network outage** | Multi-RPC fallback (Alchemy + Infura); frontend caches last-known state | Incident response runbook; status page |
| **AI/ML model failure** | Fallback to rule-based decision; model performance monitoring | Human-in-the-loop review; model update governance |
| **Data loss** | PostgreSQL WAL replication; daily backups; 30-day retention | Backup verification; disaster recovery testing |

---

## V. Trust Model

### A. Trust Assumptions

| Layer | Trust Model | Justification |
|-------|-------------|---------------|
| **Blockchain** | Trustless (consensus-enforced) | No single party can alter ledger state; code is law |
| **Smart contracts** | Trust in code correctness | Auditable source code; OpenZeppelin primitives; planned formal audit |
| **Frontend** | Trust in delivery | Open-source; users can verify or host their own instance |
| **Backend API** | Trust in operator | Centralized; mitigated by audit logging and on-chain verification |
| **AI/ML models** | Trust in methodology | Explainable outputs (SHAP); human-in-the-loop review |

### B. Trust Minimization Strategy

The architecture progressively minimizes trust requirements:

1. **Phase 1 (Current):** Single operator deploys and manages contracts. Trust is in the operator, mitigated by open-source code and on-chain transparency.
2. **Phase 2 (Planned):** Multi-signature administration. Critical operations require M-of-N signatures, distributing trust among multiple parties.
3. **Phase 3 (Future):** DAO governance. Network participants vote on parameter changes, upgrades, and membership decisions via governance tokens.

---

## VI. Summary

The Crypto World Bank governance framework implements a comprehensive, multi-layered approach to managing a decentralized lending network:

- **Network membership** is governed by a hierarchical on-boarding protocol with explicit on-chain registration, role-based permissions, and defined off-boarding procedures.
- **Business operations** are guided by a transparent charter with codified lending rules, shared infrastructure services, and defined service level commitments.
- **Technology infrastructure** is managed through systematic technology evaluation, clearly partitioned data services, and defense-in-depth risk mitigation.
- **Trust** is progressively minimized from single-operator to multi-signature to DAO governance across deployment phases.

This governance framework directly addresses all evaluation considerations specified in the BCOLBD 2025 Governance criterion.
