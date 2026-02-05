# Decentralized Crypto Reserve & Lending Bank

## Detailed Project Guide Report

**Final Year Thesis Project**  
**Prepared for Professor Review**

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview & Objectives](#2-project-overview--objectives)
3. [System Architecture](#3-system-architecture)
4. [Roles & Features](#4-roles--features)
5. [Technology Stack](#5-technology-stack)
6. [Use Cases & Data Flow](#6-use-cases--data-flow)
7. [AI/ML Research Component](#7-aiml-research-component)
8. [Smart Contract Summary](#8-smart-contract-summary)
9. [Feasibility Analysis](#9-feasibility-analysis)
10. [Design Decisions & Alternatives](#10-design-decisions--alternatives)
11. [Current Status](#11-current-status)
12. [Future Work & Research Scope](#12-future-work--research-scope)
13. [How to Run the Demo](#13-how-to-run-the-demo)
14. [Research Support & References](#14-research-support--references)
15. [Appendix: File Structure](#15-appendix-file-structure)

---

## 1. Executive Summary

This project is a **decentralized lending platform** inspired by the transparency and accountability of global financial institutions. It demonstrates how blockchain can act as a transparent global reserve where users deposit funds, request loans, and the bank approves or rejects requests—all recorded on-chain.

The prototype integrates **AI/ML cybersecurity features** for fraud detection, anomaly monitoring, and explainable lending decisions. It is designed as a **research-oriented final year thesis** with clear scope: a working DApp plus at least one fully implemented ML feature (fraud detection), with other AI components as exploratory or future work.

**Key deliverables:** Smart contract (Solidity), responsive web frontend (React), wallet integration (MetaMask/WalletConnect), AI/ML UI (risk dashboard, XAI, RL recommendations), and a plan for the ML backend. The system runs on **free testnets** with no requirement to purchase cryptocurrency.

---

## 2. Project Overview & Objectives

### 2.1 Mission

To demonstrate how blockchain technology can replicate the transparency, accountability, and accessibility of global financial institutions through a decentralized reserve and lending system, enhanced by AI-driven security and explainability.

### 2.2 Core Objectives

| Objective | Description |
|-----------|-------------|
| **Blockchain transparency** | All deposits, loan requests, and approvals recorded on-chain and publicly verifiable |
| **Decentralized lending** | No centralized database; smart contract holds reserve and loan logic |
| **AI/ML security** | Machine learning detects fraud, anomalies, and attacks; explainable AI justifies decisions |
| **Cross-platform** | Web-based DApp works on desktop and mobile (responsive UI, WalletConnect) |

### 2.3 Target Users

- **Users** — Deposit to reserve, request loans, track loan status
- **Bank** — Manage reserve, approve/reject loans, view AI risk analysis
- **Admin** — Same as Bank; can pause/unpause contract in emergencies

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (React + TypeScript + Material Design 3)               │
│  Dashboard • Deposit • Loan • Bank • Risk AI • QR                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  BLOCKCHAIN (Ethereum / Polygon Testnet)                         │
│  Smart Contract: WorldBankReserve.sol                             │
│  • Reserve deposits • Loan requests • Approve/Reject • Events    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  AI/ML LAYER (Planned)                                           │
│  Fraud detection • Anomaly detection • XAI • RL policy          │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Component Responsibilities

| Layer | Responsibility |
|-------|----------------|
| **Frontend** | User interface, wallet connection, transaction signing, display of on-chain data and AI insights |
| **Smart Contract** | Reserve balance, loan storage, approval logic, event emission |
| **AI/ML Backend** | Risk scoring, fraud detection, explainability, RL recommendations (to be implemented) |

---

## 4. Roles & Features

### 4.1 User Role

| Feature | Description |
|---------|-------------|
| Connect Wallet | Link MetaMask or WalletConnect |
| Deposit to Reserve | Send ETH/MATIC to the contract |
| Request Loan | Submit amount and purpose |
| View My Loans | See status (Pending / Approved / Rejected) |
| Generate/Scan QR | Share wallet address, contract address, or loan info |

**Note:** Users do **not** see risk detection or security features; these are bank-only.

### 4.2 Bank Role

| Feature | Description |
|---------|-------------|
| View Reserve & Stats | Total reserve, reserve left, total disbursed |
| View Who Took How Much | Table of approved loans by user |
| View Pending Loans | List of loan requests awaiting approval |
| Approve Loan | Release funds to borrower |
| Reject Loan | Deny loan request |
| View Risk Dashboard | AI/ML alerts, scores, detections |
| View AI/ML Analysis | XAI explanations, RL recommendations per loan |

### 4.3 Admin Role

Same as Bank (contract owner). Additionally:
- Pause/unpause the contract in emergencies
- Emergency withdraw (admin-only)

---

## 5. Technology Stack

| Layer | Technology |
|-------|------------|
| **Smart Contract** | Solidity 0.8.20, OpenZeppelin (Ownable, ReentrancyGuard) |
| **Frontend** | React 18, TypeScript, Vite, Material-UI v5 |
| **Wallet** | Wagmi, RainbowKit, Viem |
| **Build/Test** | Hardhat |
| **Networks** | Polygon Mumbai, Sepolia (Ethereum testnets) |
| **AI/ML (planned)** | Python, FastAPI, scikit-learn, PyTorch, SHAP |

---

## 6. Use Cases & Data Flow

### 6.1 Use Case Summary

| Actor | Use Case | Description |
|-------|----------|-------------|
| User | Connect Wallet | Link MetaMask/WalletConnect |
| User | Deposit to Reserve | Send ETH/MATIC to contract |
| User | Request Loan | Submit amount + purpose |
| User | View My Loans | See loan status |
| User | Generate/Scan QR | Share wallet, contract, or loan info |
| Bank | View Reserve & Stats | Total reserve, disbursed, pending |
| Bank | View Pending Loans | List awaiting approval |
| Bank | Approve Loan | Release funds to borrower |
| Bank | Reject Loan | Deny loan request |
| Bank | View Risk Dashboard | AI/ML alerts and scores |
| Bank | View AI/ML Analysis | XAI, RL recommendations |

### 6.2 Main Data Flows

**Deposit:** User → Frontend → Wallet → Smart Contract → Blockchain → Events

**Loan Request:** User → Frontend → Wallet → Smart Contract → Create Loan (Pending) → Events

**Loan Approval:** Bank → Frontend → Wallet → Smart Contract → Transfer funds → Update status → Events

**AI/ML Risk Check (planned):** Frontend → AI/ML API → Model inference → SHAP → Frontend → Bank

See `Documentation/USE_CASE_AND_DATAFLOW_DIAGRAMS.md` for detailed diagrams.

---

## 7. AI/ML Research Component

### 7.1 Planned Features

| Feature | Purpose | Model (Planned) |
|---------|---------|-----------------|
| Fraud Detection | Flag suspicious loan requests | Random Forest |
| Anomaly Detection | Detect unusual wallet/transaction behavior | Isolation Forest |
| Attack Detection | Detect smart contract attacks | LSTM |
| Explainable AI (XAI) | Explain why loans are approved/rejected | SHAP, LIME |
| RL Lending Policy | Optimize approve/reject decisions | DQN / PPO |
| Federated Learning (optional) | Distributed learning across nodes | FedAvg |

### 7.2 Implementation Priority

1. **Primary:** Fraud detection (Random Forest + SHAP) — full end-to-end implementation
2. **Secondary:** Anomaly detection or RL — proof-of-concept
3. **Future work:** Attack detection, federated learning

### 7.3 Real-Time Feasibility

Real-time fraud detection is **feasible** for this project's scale. Random Forest inference on tabular features typically takes < 50 ms per request. With a FastAPI backend, end-to-end latency of 100–500 ms is achievable, which is sufficient for a lending UI.

---

## 8. Smart Contract Summary

**WorldBankReserve.sol** provides:

| Function | Description |
|----------|-------------|
| `depositToReserve()` | Users send ETH/MATIC to the reserve |
| `requestLoan(amount, purpose)` | Submit loan request |
| `approveLoan(loanId)` | Bank approves and releases funds |
| `rejectLoan(loanId)` | Bank rejects loan |
| `getStats()` | Total reserve, loans, pending, approved |
| `getPendingLoans()` | List of pending loans (bank only) |
| `getUserLoans(address)` | Loans for a user |
| `pause()` / `unpause()` | Admin emergency controls |

**Events:** ReserveDeposited, LoanRequested, LoanApproved, LoanRejected

**Security:** ReentrancyGuard, Ownable, pause/unpause

---

## 9. Feasibility Analysis

### 9.1 Technical Feasibility

- **Strengths:** Smart contract complete and tested; frontend complete with all flows; AI/ML UI in place; demo modes for testing without deployment
- **Gaps:** AI/ML backend not yet implemented; no blockchain event listener; no formal security audit
- **Conclusion:** Feasible as a **research prototype** for thesis scope

### 9.2 Economic Feasibility

- **Cost:** Near-zero. All work on free testnets (Sepolia, Mumbai); testnet ETH/MATIC is free
- **No requirement to buy real cryptocurrency**
- **Hosting:** Free tiers (Vercel, Render, etc.) or university servers
- **ML training:** Personal PC (16 GB RAM, 16 GB VRAM) or Google Colab free tier

### 9.3 Operational Feasibility

- **Pre-Thesis 1:** Finalize contract + frontend + documentation
- **Pre-Thesis 2:** Implement fraud detection pipeline, integrate with frontend
- **Final:** Add one more ML experiment, polish, evaluation, report

---

## 10. Design Decisions & Alternatives

For each major decision, alternatives were considered and justified. Summary:

| Decision | 1st Choice | 2nd Choice | Key Justification |
|----------|------------|------------|-------------------|
| Development methodology | Agile / Incremental | Waterfall | Evolving scope; demo-ready increments |
| Architecture | DApp + Off-chain AI | Hybrid with oracle | Flexible, cheap to iterate; no gas for ML |
| Frontend | React + TypeScript | Vue + TypeScript | Best Web3 libraries (Wagmi, RainbowKit) |
| Smart contract platform | Ethereum / EVM | Solana | Largest ecosystem, free testnets |
| UI design | Material Design 3 | Tailwind | Consistent, professional, minimal effort |
| Fraud model | Random Forest | XGBoost | Interpretable, SHAP-friendly, fast |
| XAI method | SHAP | LIME | Gold standard in finance research |

See `Documentation/DECISION_JUSTIFICATION_PLAN.md` for full details.

---

## 11. Current Status

| Component | Status |
|-----------|--------|
| Smart Contract | ✅ Complete, tested |
| Frontend UI | ✅ Complete (all pages, responsive) |
| Wallet Connect | ✅ MetaMask, WalletConnect |
| Demo Mode | ✅ Demo Bank / Demo User role switcher |
| AI/ML UI | ✅ Risk dashboard, XAI, RL cards (mock data) |
| AI/ML Backend | ⏳ Planned (Python/FastAPI) |
| Contract Deploy | ⏳ Requires deployment to testnet |

---

## 12. Future Work & Research Scope

### 12.1 Product Extensions

- Repayment schedules, partial repayments, late fees
- Multi-asset support (ERC-20 tokens, stablecoins)
- Credit history view for ML features
- Notifications (email, app, Telegram)

### 12.2 AI/ML Research

- Production-grade fraud model with full evaluation
- Wallet anomaly detection (Isolation Forest, Autoencoder)
- Smart contract attack lab (synthetic attacks, LSTM detection)
- RL experiments (rule-based vs RL under stress)
- Federated / privacy-preserving learning

### 12.3 Scalability

- Multi-chain deployment
- Off-chain analytics warehouse
- Microservice decomposition for AI/ML
- Caching and message queues

---

## 13. How to Run the Demo

### 13.1 Quick Start (No Deployment)

```bash
npm install
cd frontend && npm install
cd frontend && npm run dev
```

Then:
1. Open http://localhost:5173
2. Click **Demo Bank** or **Demo User** in the top bar
3. Explore the Bank panel (1M ETH reserve, loan approvals) or User flows (deposit, request loan)

### 13.2 Full Demo with Blockchain

1. Deploy contract: `npx hardhat run scripts/deploy.ts --network sepolia`
2. Copy contract address from `deployment-info.json`
3. Create `frontend/.env` with `VITE_CONTRACT_ADDRESS=<address>`
4. Restart frontend, connect wallet, use real deposits/loans

---

## 14. Research Support & References

The project is supported by academic literature on:

- DeFi lending (Compound, Aave)
- ML fraud detection in blockchain
- Explainable AI (SHAP/LIME) in lending
- Reinforcement learning for lending policy
- Smart contract attack detection

See `Documentation/RESEARCH_LINKS.txt` for full references.

---

## 15. Appendix: File Structure

```
Cryto World Bank/
├── contracts/
│   └── WorldBankReserve.sol          # Smart contract
├── scripts/
│   ├── deploy.ts                     # Deployment script
│   └── copy-abi.ts                   # ABI copy utility
├── test/
│   └── WorldBankReserve.test.ts      # Contract tests
├── frontend/
│   └── src/
│       ├── pages/                    # Dashboard, Deposit, Loan, Bank, RiskDashboard, QRPage
│       ├── components/               # Layout, ML, QR
│       ├── hooks/                    # useContract, useRole
│       ├── config/                   # contracts, wagmi
│       └── context/                  # DemoModeContext
├── Documentation/
│   ├── PROJECT_OVERVIEW_FOR_PROFESSOR.md
│   ├── DETAILED_PROJECT_GUIDE_REPORT.md  # This document
│   ├── USE_CASE_AND_DATAFLOW_DIAGRAMS.md
│   ├── DECISION_JUSTIFICATION_PLAN.md
│   ├── RESEARCH_LINKS.txt
│   └── FEASIBILITY_AND_RISK_NOTES.md (in All md_txt files here)
├── hardhat.config.ts
└── package.json
```

---

## Contact

[Your name]  
[Your email]  
[Your institution]  
[Your student ID]

---

*Document prepared for thesis supervision. Last updated: February 2025.*
