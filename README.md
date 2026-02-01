# Decentralized Crypto Reserve & Lending Bank

A World Bank–inspired blockchain prototype: transparent reserve and lending on-chain, cross-platform UI with Material Design 3, and QR sharing.

## Stack

- **Smart contract**: Solidity 0.8.20, Hardhat, OpenZeppelin (Ownable, ReentrancyGuard)
- **Frontend**: React 18, TypeScript, Vite, MUI (Material Design 3), RainbowKit + Wagmi, viem
- **Networks**: Polygon Mumbai, Sepolia (testnets)
- **QR**: Generate and share wallet/contract/loan QR codes; paste scanned content in-app

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

## License

MIT
