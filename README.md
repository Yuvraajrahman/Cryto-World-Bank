# Crypto World Bank

> **A four-tier decentralized lending platform.**
> Global Reserve → National Banks → Local Banks → Borrowers — modeled faithfully on EVM smart contracts, with a premium black-and-gold interface and an extensible off-chain analytics service.

This repo is the second-generation build of the BRAC University thesis project
[Decentralized Crypto World Bank — A Blockchain-Based Lending Platform with AI-Enhanced Security](Documentation/Pre-thesis%20v4%20.tex).
It re-implements the platform from scratch against the updated architecture
described in Chapters 3–5 of the thesis.

---

## Repository layout

```
.
├── contracts/          Solidity sources (WorldBankReserve, NationalBank, LocalBank)
├── scripts/            Hardhat deployment scripts
├── test/               Hardhat tests
├── frontend/           Vite + React + TypeScript + Tailwind + wagmi/RainbowKit
├── backend/            Express + TypeScript + Prisma (PostgreSQL) REST API
├── ml-service/         FastAPI placeholder for Random Forest / Isolation Forest / SHAP
├── Documentation/      Thesis source (LaTeX)
└── Prototype demonstration/
```

## Architecture at a glance

```
┌─────────────────────┐    deposits / allocations     ┌─────────────────────┐
│  Frontend (React)   │ ──────────────────────────▶   │   Smart Contracts   │
│  wagmi · RainbowKit │ ◀── reads via Viem/wagmi ──── │   (EVM · 0.8.24)    │
└──────────┬──────────┘                               └──────────┬──────────┘
           │ REST                                                │ events
           ▼                                                     ▼
┌─────────────────────┐     risk / explanations      ┌─────────────────────┐
│   Backend (Express) │ ─────────────────────────▶   │  ML Service (FastAPI)│
│   Prisma · Postgres │                              │  RF · IF · SHAP      │
└─────────────────────┘                              └─────────────────────┘
```

## Getting started

### 1. Install toolchain dependencies

```bash
# From the repo root
npm install

# Frontend
cd frontend && npm install && cd ..

# Backend
cd backend && npm install && cd ..

# ML service (optional for the stub)
cd ml-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 2. Configure environment

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Fill in:
- `PRIVATE_KEY` for a test wallet (contracts use testnet ETH only)
- `VITE_WALLETCONNECT_PROJECT_ID` from [WalletConnect Cloud](https://cloud.walletconnect.com/)
- `VITE_WORLD_BANK_ADDRESS` / `VITE_NATIONAL_BANK_ADDRESS` / `VITE_LOCAL_BANK_ADDRESS` after deploying

### 3. Compile & deploy the smart contracts

```bash
npm run compile
npm run test:contracts            # sanity suite
npm run node:chain                # local hardhat node (separate terminal)
npm run deploy:local              # or deploy:sepolia / deploy:amoy
```

Addresses are written to `deployment-info.json`.

### 4. Run the backend + ML service

```bash
# Backend (port 4000)
npm run backend:dev

# ML stub (port 8000)
npm run ml:dev
```

### 5. Run the frontend

```bash
npm run frontend:dev    # http://localhost:5173
```

Or start the frontend + backend together:

```bash
npm run dev
```

## What's in the box (v2.0.0)

- **Smart contracts (complete)** — four-tier hierarchy with pause, ReentrancyGuard, AccessControl, installment scheduling, and event emissions covering the lifecycle.
- **Frontend (complete base)** — premium black-and-gold theme, wallet-native auth, landing page, dashboard, reserve management, bank network explorer, loan request + list + installments, markets, chat, profile, admin governance, and a risk console stub.
- **Backend (scaffolded)** — Express + Prisma schema mirroring the 15-entity model, SIWE auth flow, routes for banks/loans/profile/chat/market/risk.
- **ML service (placeholder)** — FastAPI service exposing `/score`, `/anomaly`, `/health` with deterministic stubs. Swap in real RF/IF/SHAP later without changing the HTTP contract.

## What's next

These extension points are wired and marked with TODOs in the code:

- **wagmi writeContract wiring** — the UI currently stubs deposit/loan-request transactions. Replace the stubs with `useWriteContract({ abi, address })` in each page for live signing.
- **Event indexer** — Prisma `OnChainEvent` model is already present; a listener service under `backend/src/indexer/` can watch contract events and keep the DB in sync.
- **Real ML models** — Train Random Forest + Isolation Forest on synthetic / publicly available DeFi datasets and replace the stub `score` logic in `ml-service/app/main.py`.
- **InterBankLendingPool** — same-tier and upward flows (Section 1.7.1 of the thesis) are architecturally designed but intentionally out of scope for this milestone.

## License

Academic prototype © 2026 BRAC University.
Testnet only — no real financial transactions are processed.
