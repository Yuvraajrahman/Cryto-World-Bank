<p align="center">
  <img src="Documentation/bracu_logo_12-0-2022.png" alt="BRAC University" width="120" />
</p>

<h1 align="center">Decentralized Crypto World Bank</h1>
<p align="center">
  <strong>A Blockchain-Based Hierarchical Lending Platform with AI-Enhanced Security</strong>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-demo">Demo</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-documentation">Documentation</a>
</p>

---

## 📋 Overview

**Crypto World Bank** is a prototype decentralized application (DApp) that implements a **four-tier hierarchical lending architecture** on an Ethereum Virtual Machine (EVM)–compatible blockchain. The system models capital flows across institutional tiers—mirroring traditional development finance—while enabling shared ledger visibility, programmable enforcement, and AI-augmented risk assessment.

### 🎯 Project Goals

| Goal | Description |
|------|-------------|
| **Hierarchical Lending** | Design and implement a four-tier architecture (World Bank → National Bank → Local Bank → Borrower) on EVM-compatible blockchains |
| **Transparency** | Enable auditable, tamper-evident capital flows with role-based access control enforced by smart contracts |
| **AI/ML Security** | Integrate fraud detection (Random Forest), anomaly identification (Isolation Forest), and explainable risk assessment (SHAP) |
| **Financial Inclusion** | Target underserved populations in developing economies with transparent, programmable lending |

### 🏛️ Four-Tier Hierarchy

```mermaid
flowchart LR
    WB[World Bank - Global Reserve]
    NB[National Banks - Regional]
    LB[Local Banks - Retail]
    BR[Borrowers - End Users]

    WB -->|Lends at 3% APR| NB
    NB -->|Lends at 5% APR| LB
    LB -->|Lends at 8% APR| BR
    BR -.->|Repays with interest| LB
```

- **Tier 1 — World Bank:** Maintains global crypto reserve; allocates capital to National Banks
- **Tier 2 — National Banks:** Borrow from World Bank; lend to Local Banks within jurisdiction
- **Tier 3 — Local Banks:** Process loan requests; employ approvers for loan lifecycle
- **Tier 4 — Borrowers:** Submit loan requests; repay via configurable installments; build on-chain credit history

---

## 🏗️ Architecture

The system employs a **three-layer decentralized application architecture**:

![Component Diagram](Documentation/Diagrams/CSE471/Component%20Diagram.png)

| Layer | Technologies | Key Components |
|-------|--------------|-----------------|
| **Presentation** | React 18, TypeScript, Material-UI, Wagmi, RainbowKit | Dashboard, Loan Module, Admin Panel, Risk AI, Chat, Profile |
| **Smart Contract** | Solidity 0.8.20, OpenZeppelin, EVM (Polygon/Ethereum) | WorldBankReserve, NationalBank, LocalBank |
| **Off-Chain Services** | Node.js/Express, MongoDB | REST API, Event Listener, AI/ML Analytics (planned) |

### Key Flows

| Flow | Diagram |
|------|---------|
| Loan Request → AI Risk Check → Approval | [Sequence Diagram 1](Documentation/Diagrams/CSE471/Sequence%20Diagram%201%20Loan%20Request%2C%20AI%20Risk%20Check%2C%20and%20Approval%20Decision.png) |
| Hierarchical Banking (WB → NB → LB → Borrower) | [Sequence Diagram 6](Documentation/Diagrams/CSE471/Sequence%20Diagram%206%20Hierarchical%20Banking%20(World%20Bank%20→%20National%20Bank%20→%20Local%20Bank%20→%20Borrower).png) |
| Installment Payment Loop | [Sequence Diagram 2](Documentation/Diagrams/CSE471/Sequence%20Diagram%202%20%20Installment%20Payment%20Loop.png) |
| Data Flow (Context) | [Dataflow Diagram Level 0](Documentation/Diagrams/CSE471/Dataflow%20Diagram%20(Context%20Diagram%20Level%20-%200).png) |

---

## 🎬 Demo

### Implemented Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Wallet Connection** | ✅ | MetaMask / WalletConnect via RainbowKit |
| **Dashboard** | ✅ | Account overview, reserve stats |
| **Deposit to Reserve** | ✅ | On-chain reserve contributions |
| **Hierarchical Bank Registration** | ✅ | World Bank → National → Local |
| **Loan Request & Approval** | ✅ | Request, approve, reject workflow |
| **Installment Payments** | ✅ | Configurable repayment schedules |
| **Borrowing Limits** | ✅ | Rolling 6-month / 1-year windows |
| **Chat System** | ✅ | Borrower–bank communication |
| **Income Verification** | ✅ | Document upload and verification |
| **AI/ML Fraud Detection** | 🔄 | Random Forest + SHAP (in progress) |
| **Risk Dashboard** | 🔄 | AI risk scores (in progress) |

### Use Case Overview

![Use Case Diagram](Documentation/Diagrams/CSE471/Usecase%20diagram.png)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **MetaMask** browser extension
- **Hardhat** (for smart contract development)
- **MongoDB** (local or Atlas)

### 1. Clone & Install

```bash
git clone https://github.com/Yuvraajrahman/Cryto-World-Bank.git
cd Cryto-World-Bank

# Install root dependencies (Hardhat, OpenZeppelin)
npm install

# Install frontend
cd frontend && npm install && cd ..

# Install backend
cd backend && npm install && cd ..
```

### 2. Environment Setup

```bash
# Root .env (for Hardhat)
cp .env.example .env
# Add: PRIVATE_KEY, MUMBAI_RPC_URL or SEPOLIA_RPC_URL

# Backend .env
cd backend
cp .env.example .env
# Add: MONGODB_URI, PORT

# Frontend .env
cd ../frontend
echo "VITE_API_URL=http://localhost:3001/api" > .env
echo "VITE_CONTRACT_ADDRESS=0xYourDeployedAddress" >> .env
echo "VITE_WALLETCONNECT_PROJECT_ID=your-project-id" >> .env
```

### 3. Smart Contracts

```bash
# Compile
npm run compile

# Run tests
npm test

# Deploy to testnet
npm run deploy:mumbai   # or deploy:sepolia

# Update frontend/src/config/contracts.ts with deployed addresses
```

### 4. Run Application

```bash
# Start backend (port 3001)
cd backend && npm run dev

# Start frontend (port 5173) — in another terminal
cd frontend && npm run dev

# Or run both concurrently
npm run dev
```

### 5. MetaMask Configuration

| Network | RPC URL | Chain ID |
|---------|---------|----------|
| **Polygon Mumbai** | `https://rpc-mumbai.maticvigil.com/` | 80001 |
| **Ethereum Sepolia** | `https://sepolia.infura.io/v3/YOUR_KEY` | 11155111 |

**Faucets:** [Polygon Faucet](https://faucet.polygon.technology/) | [Sepolia Faucet](https://sepoliafaucet.com/)

---

## 📁 Project Structure

```mermaid
flowchart TB
    subgraph root["Cryto-World-Bank/"]
        subgraph contracts["contracts/"]
            direction TB
            WB[WorldBankReserve.sol]
            NB[NationalBank.sol]
            LB[LocalBank.sol]
        end

        subgraph frontend["frontend/"]
            direction TB
            subgraph fsrc["src/"]
                comp[components/]
                pages[pages/]
                hooks[hooks/]
                svc[services/]
            end
            pkg[package.json]
        end

        subgraph backend["backend/"]
            direction TB
            subgraph bsrc["src/"]
                server[server.js]
                db[database/]
                routes[routes/]
            end
            bpkg[package.json]
        end

        subgraph docs["Documentation/"]
            direction TB
            wp[WHITEPAPER_BCOLBD2025.tex]
            subgraph diag["Diagrams/"]
                c470[CSE470/]
                c471[CSE471/]
            end
            lr[LiteratureReviews/]
        end

        scripts[scripts/]
    end
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [**Whitepaper**](Documentation/WHITEPAPER_BCOLBD2025.tex) | Full technical whitepaper (LaTeX) for BCOLBD 2025 & thesis |
| [**Literature Reviews**](Documentation/LiteratureReviews/) | 16 peer-reviewed paper summaries |

### Course Reports (Pre-Thesis 1)

| Report | Description | Authors |
|--------|-------------|---------|
| [**CSE370 Database Management**](Documentation/CSE370_DATABASE_MANAGEMENT%20REPORT.md) | ERD, EER, schema, 3NF, indexing, SQL examples | Md. Bokhtiar Rahman Juboraz (20301138) • Md. Mahir Ahnaf Ahmed (20301083) |
| [**CSE470 Software Engineering**](Documentation/CSE470_SOFTWARE_ENGINEERING%20REPORT.md) | Agile methodology, sprints, user stories, SDLC, design decisions | Md. Bokhtiar Rahman Juboraz (20301138) • Md. Mahir Ahnaf Ahmed (20301083) |
| [**CSE471 System Analysis & Design**](Documentation/CSE471_SYSTEM_ANALYSIS_AND_DESIGN%20REPORT.md) | Use cases, sequence diagrams, activity diagrams, data flow, component diagrams | Md. Bokhtiar Rahman Juboraz (20301138) • Md. Mahir Ahnaf Ahmed (20301083) |

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Smart Contracts** | Solidity 0.8.20, OpenZeppelin (Ownable, ReentrancyGuard) |
| **Frontend** | React 18, TypeScript, Vite, Material-UI, Wagmi, RainbowKit, Viem |
| **Backend** | Node.js, Express, MongoDB |
| **Blockchain** | Polygon Mumbai, Ethereum Sepolia (testnets) |
| **AI/ML (planned)** | Python, FastAPI, scikit-learn, SHAP |

---

## 🎓 Academic Context

- **Institution:** BRAC University, Department of Computer Science and Engineering  
- **Project:** B.Sc. Final Year Thesis (Pre-Thesis 1)  
- **Competition:** Blockchain Olympiad Bangladesh (BCOLBD) 2025 — AI Category  
- **Supervisor:** Mr. Annajiat Alim Rasel  

**Authors:** Md. Bokhtiar Rahman Juboraz (20301138) • Md. Mahir Ahnaf Ahmed (20301083)

---

## 📄 License

MIT License
