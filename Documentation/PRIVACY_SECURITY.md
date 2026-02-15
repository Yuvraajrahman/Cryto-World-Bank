# Privacy and Security Design Document
## Crypto World Bank — BCOLBD 2025

**Document Type:** Privacy and Security Risk Assessment  
**Evaluation Alignment:** BCOLBD 2025 Prototype Evaluation — Criterion ii: Privacy & Security Risks (20 points)  
**Version:** 1.0  
**Date:** February 2025

---

## I. Overview

This document addresses the privacy and security design of the Crypto World Bank decentralized lending platform. It is structured to directly satisfy the BCOLBD 2025 prototype evaluation rubric for Privacy & Security Risks, which assesses:

1. Data privacy and identity privacy
2. Prevention of unintentional data leakage to unauthorized parties
3. Cryptographic key management
4. Access control mechanisms

---

## II. Data Privacy

### A. Classification of Data Assets

All data within the Crypto World Bank system is classified into three sensitivity tiers:

| Tier | Classification | Examples | Storage Location |
|------|---------------|----------|------------------|
| **Tier 1 — Public** | Non-sensitive, intentionally transparent | Reserve balances, loan request events, approval/rejection events, repayment transactions | On-chain (immutable, publicly auditable) |
| **Tier 2 — Internal** | Operationally sensitive, restricted access | User profiles, borrowing limits, bank registration details, chat messages | Off-chain (PostgreSQL, access-controlled API) |
| **Tier 3 — Confidential** | Personally Identifiable Information (PII) and sensitive documents | Income verification documents, email addresses, phone numbers, AI/ML security logs | Off-chain (encrypted at rest, access-controlled) |

### B. Data Privacy by Design

The architecture implements **privacy by design** through deliberate data partitioning:

- **On-chain data** is limited to financial state transitions (deposits, loan amounts, approval status) that are intentionally public for transparency and auditability. No PII is stored on-chain.
- **Off-chain data** containing user profiles, documents, and communication is stored in an access-controlled relational database with role-based query restrictions.
- **Wallet addresses** serve as pseudonymous identifiers. While publicly visible on-chain, they are not inherently linked to real-world identities without additional off-chain correlation.

### C. Data Minimization

The system collects only the minimum data necessary for each operation:

| Operation | Data Collected | Justification |
|-----------|---------------|---------------|
| Wallet connection | Public wallet address | Authentication; no credentials stored |
| Loan request | Amount, purpose | Required for approval decision |
| Income verification | Uploaded document (first-time only) | Regulatory compliance; stored off-chain |
| Chat | Message text, sender/receiver IDs | Borrower-bank communication |
| AI/ML logging | Risk scores, model metadata | Security monitoring; no raw user data |

---

## III. Identity Privacy

### A. Pseudonymous Identity Model

The Crypto World Bank employs a **pseudonymous identity model** based on Ethereum wallet addresses:

- **No account registration** is required in the traditional sense. Users authenticate by signing a cryptographic challenge with their private key via MetaMask or WalletConnect.
- **Wallet addresses** (42-character hexadecimal strings) serve as the sole on-chain identifier. These are pseudonymous by default—publicly visible but not linked to real-world identities.
- **Role mapping** (borrower, bank user, approver) is maintained in the smart contract state and the off-chain database, accessible only to authorized parties.

### B. Identity Segregation

| Identity Context | Visible To | Mechanism |
|------------------|-----------|-----------|
| Wallet address (on-chain) | Public | Blockchain transparency |
| User profile (name, email) | Bank approvers, system admins | Off-chain DB with RBAC |
| Income documents | Assigned bank approver only | Off-chain, encrypted, access-logged |
| AI risk scores | Bank approvers only | Off-chain, role-restricted API |

### C. Prevention of Unintentional Data Leakage

| Attack Vector | Mitigation |
|---------------|------------|
| **On-chain PII exposure** | Architecture enforces zero PII on-chain; only financial state and wallet addresses are recorded |
| **API over-exposure** | REST API endpoints enforce role-based authorization; borrowers cannot access other borrowers' data |
| **Log leakage** | Server-side logs sanitize wallet addresses in production; no PII in application logs |
| **Frontend exposure** | Client-side code does not cache sensitive data; session state cleared on disconnect |
| **Third-party analytics** | No third-party tracking or analytics SDKs are integrated into the frontend |

---

## IV. Cryptographic Key Management

### A. Key Architecture

The system relies on the **Ethereum asymmetric key pair model**:

| Key Type | Purpose | Storage | Responsibility |
|----------|---------|---------|----------------|
| **Private key** | Transaction signing, identity proof | User's wallet application (MetaMask, hardware wallet) | User — never transmitted to or stored by the application |
| **Public key / Address** | On-chain identifier, signature verification | Derived from private key; publicly visible on blockchain | System — used for role mapping and access control |
| **Contract owner key** | Administrative operations (pause, register banks) | Deployer's wallet | System administrator |

### B. Key Management Principles

1. **No custodial key storage.** The application never stores, transmits, or has access to users' private keys. All transaction signing occurs within the user's wallet application (MetaMask, WalletConnect).

2. **Separation of signing and submission.** The frontend prepares unsigned transactions; the wallet application signs them locally; the signed transaction is broadcast to the blockchain network. At no point does the application backend handle private key material.

3. **Hardware wallet compatibility.** The wallet integration layer (Wagmi + RainbowKit) supports hardware wallets (Ledger, Trezor) for users requiring enhanced key protection.

4. **Admin key security.** The contract owner private key (used for bank registration, pause/unpause, emergency withdrawal) must be stored in a hardware wallet or multi-signature arrangement in production deployments.

### C. Key Lifecycle

| Phase | Action | Security Measure |
|-------|--------|------------------|
| **Generation** | User creates wallet via MetaMask or hardware wallet | Wallet software generates cryptographic key pair using secure random number generation |
| **Authentication** | User signs a challenge message to prove wallet ownership | EIP-191 / EIP-712 typed data signing; replay protection via nonce |
| **Transaction signing** | User signs loan request, deposit, or approval transaction | MetaMask prompts user for explicit confirmation; gas estimation displayed |
| **Key rotation** | User may switch to a new wallet address | Application supports address change; off-chain profile migration required |
| **Key compromise** | If private key is compromised | User must transfer assets to a new wallet; on-chain loan obligations are address-bound |

---

## V. Access Control

### A. On-Chain Access Control (Smart Contract Layer)

The smart contracts implement a **hierarchical role-based access control (RBAC)** system:

| Role | Contract Modifier | Permissions |
|------|-------------------|-------------|
| **Owner (World Bank Admin)** | `onlyOwner` (OpenZeppelin) | Register National Banks; lend to National Banks; pause/unpause; emergency withdraw |
| **National Bank** | `isActive` check in mapping | Register Local Banks; borrow from World Bank; lend to Local Banks |
| **Local Bank Approver** | `onlyApprover` | Approve/reject loan requests; manage bank users |
| **Local Bank User** | `onlyBankUser` | View loan requests; limited administrative functions |
| **Borrower** | No modifier (public functions) | Deposit to reserve; request loans; view own loans |

### B. Smart Contract Security Primitives

| Primitive | Implementation | Purpose |
|-----------|----------------|---------|
| **Reentrancy protection** | OpenZeppelin `ReentrancyGuard` on all state-changing functions | Prevent reentrancy attacks during ETH transfers |
| **Ownership enforcement** | OpenZeppelin `Ownable` | Restrict administrative functions to contract deployer |
| **Pause mechanism** | Custom `whenNotPaused` modifier | Emergency circuit breaker for all financial operations |
| **Input validation** | `require()` statements on all inputs | Prevent zero-amount transactions, invalid loan IDs, duplicate registrations |
| **Check-Effects-Interactions** | Pattern followed in all transfer functions | Prevent state manipulation during external calls |

### C. Off-Chain Access Control (API Layer)

| Endpoint Category | Access Level | Authentication Method |
|-------------------|--------------|-----------------------|
| Public data (reserve stats) | Open | None required |
| Own profile, own loans | Authenticated user | Wallet signature verification |
| Other users' loans, approvals | Bank approver | Wallet signature + role verification |
| Bank registration, system config | System admin | Wallet signature + owner role |
| AI/ML risk dashboards | Bank approver / admin | Wallet signature + role verification |

### D. Access Control Matrix

| Resource | Borrower | Bank User | Approver | National Bank | Owner |
|----------|----------|-----------|----------|---------------|-------|
| View own loans | ✅ | — | — | — | ✅ |
| Request loan | ✅ | — | — | — | — |
| View pending loans | — | ✅ | ✅ | — | ✅ |
| Approve/reject loans | — | — | ✅ | — | ✅ |
| View risk dashboard | — | — | ✅ | ✅ | ✅ |
| Register banks | — | — | — | ✅ | ✅ |
| Pause/unpause system | — | — | — | — | ✅ |
| Emergency withdraw | — | — | — | — | ✅ |

---

## VI. Threat Model

### A. Identified Threats and Countermeasures

| Threat | Category | Likelihood | Impact | Countermeasure |
|--------|----------|------------|--------|----------------|
| **Reentrancy attack** | Smart contract | Medium | Critical | `ReentrancyGuard`; Check-Effects-Interactions pattern |
| **Integer overflow/underflow** | Smart contract | Low | High | Solidity 0.8.x built-in overflow protection |
| **Unauthorized loan approval** | Access control | Medium | High | `onlyApprover` modifier; one-approver-per-bank rule |
| **Private key theft** | Key management | Medium | Critical | Non-custodial design; hardware wallet support |
| **Front-running** | Transaction ordering | Low | Medium | EIP-1559 fee mechanism reduces MEV; not critical for lending latency |
| **Phishing attack** | Social engineering | Medium | High | EIP-712 typed data signing; domain-bound signatures |
| **Data exfiltration** | Off-chain database | Low | High | Encrypted at rest; network-level access control; RBAC on API |
| **Denial of service** | Network | Low | Medium | Pause mechanism; rate limiting on API; blockchain inherent DoS resistance |

### B. Security Audit Status

| Audit Type | Status | Notes |
|------------|--------|-------|
| Automated static analysis (Slither) | Planned | Pre-deployment |
| Manual code review | Partial | Internal team review completed |
| Formal verification | Future | Resource-intensive; planned for production |
| Penetration testing | Planned | Pre-production deployment |

---

## VII. Compliance Considerations

| Requirement | Approach |
|-------------|----------|
| **GDPR / Data protection** | PII stored off-chain only; data minimization; right to erasure supported for off-chain records |
| **AML / KYC** | Income verification for first-time borrowers; extensible to external KYC providers |
| **Financial regulation** | Testnet prototype has no real monetary exposure; production deployment requires regulatory sandbox approval |
| **Audit trail** | All on-chain events are immutable and timestamped; off-chain operations are logged with user attribution |

---

## VIII. Summary

The Crypto World Bank implements a defense-in-depth security architecture:

1. **Data privacy** is ensured through deliberate on-chain/off-chain partitioning, with zero PII stored on the blockchain.
2. **Identity privacy** is maintained via pseudonymous wallet-based authentication with role-based access to sensitive off-chain data.
3. **Key management** follows a non-custodial model where private keys never leave the user's wallet application.
4. **Access control** is enforced at both the smart contract layer (Solidity modifiers) and the API layer (wallet signature verification with RBAC).
5. **Threat modeling** identifies key attack vectors with corresponding countermeasures implemented or planned.

This design directly addresses all four evaluation considerations specified in the BCOLBD 2025 Privacy & Security Risks criterion.
