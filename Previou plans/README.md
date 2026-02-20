# Decentralized Crypto Reserve & Lending Bank
## With AI/ML Cybersecurity Research Integration

A World Bank–inspired blockchain prototype with intelligent security: transparent reserve and lending on-chain, AI-powered fraud detection, explainable automated decisions, reinforcement learning policy optimization, cross-platform UI with Material Design 3, and QR sharing.

**NEW**: Integrated AI/ML research components for fraud detection, anomaly detection, explainable AI (XAI), RL-based lending policy, and smart contract attack detection.

## Stack

### Blockchain Layer
- **Smart contract**: Solidity 0.8.20, Hardhat, OpenZeppelin (Ownable, ReentrancyGuard)
- **Networks**: Polygon Mumbai, Sepolia (testnets)

### Frontend
- **Framework**: React 18, TypeScript, Vite
- **UI**: MUI (Material Design 3), RainbowKit + Wagmi, viem
- **Features**: Dashboard, Deposit, Loan, Admin, QR, Risk Analytics

### AI/ML Backend (NEW)
- **Framework**: Python 3.10+, FastAPI
- **ML**: scikit-learn, PyTorch, Stable-Baselines3, SHAP, LIME
- **Data**: PostgreSQL, Redis
- **Features**: 
  - Anomaly Detection (Isolation Forest + Autoencoder)
  - Fraud Detection (Random Forest)
  - Explainable AI (SHAP explanations)
  - RL Policy (DQN for lending optimization)
  - Attack Detection (LSTM for patterns)
  - Real-time Monitoring

## Quick start

### 1. Install and compile contract

```bash
npm install
cp .env.example .env
# Edit .env: set PRIVATE_KEY and optional RPC/explorer keys
npx hardhat compile
npx hardhat test
```

### 2. Deploy (optional)

```bash
npx hardhat run scripts/deploy.ts --network mumbai
# Copy the contract address from deployment-info.json
```

### 3. Frontend

```bash
cd frontend
npm install
# Optional: create frontend/.env with VITE_CONTRACT_ADDRESS=0x... and VITE_WALLETCONNECT_PROJECT_ID=...
npm run dev
```

Open http://localhost:5173. Connect a wallet (MetaMask or WalletConnect). Use **Mumbai** or **Sepolia** in your wallet.

### 4. Contract address

After deployment, set the contract address for the frontend:

- **Option A**: `frontend/.env` → `VITE_CONTRACT_ADDRESS=0xYourDeployedAddress`
- **Option B**: Edit `frontend/src/config/contracts.ts` and set `CONTRACT_ADDRESS` (or keep using env).

Redeploy or change network: update this value and restart the dev server.

## Project layout

- `contracts/WorldBankReserve.sol` – reserve + loans + admin
- `scripts/deploy.ts` – deploy script
- `test/WorldBankReserve.test.ts` – contract tests
- `frontend/src/` – React app (Dashboard, Deposit, Loan, Admin, QR)
- `PROJECT_PLAN.txt` – product and design spec
- `IMPLEMENTATION_GUIDE.txt` – day-by-day build guide

## Features

- **Public**: Connect wallet, view reserve stats, deposit, request loan, track my loans, QR generate/scan (paste)
- **Admin**: View pending loans, approve/reject, release funds (owner only)
- **UI**: Material Design 3, responsive, bottom nav + app bar

## Demo flow

1. **Laptop (admin)**: Connect → Deposit MATIC → Dashboard shows reserve.
2. **Mobile**: Same URL → WalletConnect → Request loan (amount + purpose).
3. **Laptop**: Admin → Pending loans → Approve → funds sent to borrower.
4. **QR**: Generate wallet/contract QR; paste scanned content in Scan tab.

## Env vars

**Root (Hardhat)**

- `PRIVATE_KEY` – deployer/admin key
- `MUMBAI_RPC_URL` / `SEPOLIA_RPC_URL` – RPC URLs
- `POLYGONSCAN_API_KEY` / `ETHERSCAN_API_KEY` – for verify

**Frontend**

- `VITE_CONTRACT_ADDRESS` – deployed WorldBankReserve address
- `VITE_WALLETCONNECT_PROJECT_ID` – from https://cloud.walletconnect.com

## AI/ML Research Component

This project now includes a comprehensive AI/ML research integration for cybersecurity:

### Features
1. **Wallet Anomaly Detection**: Detect unusual wallet behavior patterns
2. **Fraud Detection**: Flag fraudulent loan requests with explainable reasoning
3. **Explainable AI (XAI)**: SHAP-based explanations for all AI decisions
4. **RL Lending Policy**: Optimize loan approvals using reinforcement learning
5. **Attack Detection**: Identify smart contract attack patterns (reentrancy, front-running)
6. **Real-time Monitoring**: Continuous security monitoring with alerts

### Documentation
- 📘 **AI_ML_RESEARCH_PLAN.txt**: Comprehensive research plan (theory, algorithms, evaluation)
- 📗 **IMPLEMENTATION_GUIDE.txt**: Days 1-14 step-by-step (blockchain + ML basics)
- 📙 **AI_ML_IMPLEMENTATION_STEPS.txt**: Days 15-25 (advanced ML features)
- 📕 **AI_ML_INTEGRATION_SUMMARY.md**: Quick overview and getting started
- 📄 **PROJECT_PLAN.txt**: Updated overall plan with AI/ML integration

### Quick Start (AI/ML)
```bash
# Set up ML backend
cd ml-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Generate data & train models
python scripts/generate_data.py
python scripts/train_anomaly_detector.py
python scripts/train_fraud_detector.py

# Run ML backend
uvicorn app.main:app --reload --port 8000
```

See **AI_ML_INTEGRATION_SUMMARY.md** for complete setup guide.

## Research Contributions

- Novel integrated AI/ML security framework for DeFi lending
- Explainable AI for transparent blockchain decision-making
- RL-based adaptive lending policy
- Multi-layered cybersecurity (wallet, contract, loan)
- Quantifiable performance improvements over baseline

## License

MIT
