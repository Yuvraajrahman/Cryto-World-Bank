# Sepolia deployment (Phase I + II)

Deploy all Phase I and II contracts to Ethereum Sepolia, sync addresses into `frontend/.env` and `backend/.env`, and run on-chain verification (Gates G1 + G2).

## Prerequisites

1. **Node.js 20+** and `npm install` at repo root
2. **Sepolia ETH** on demo persona wallets (see funding below)
3. **Optional:** [Etherscan API key](https://etherscan.io/myapikey) for contract verification

## 1. Configure credentials

```bash
cp .env.example .env
```

### Option A — Multi-persona demo (recommended)

Use the public Hardhat test mnemonic and import accounts 0–5 into MetaMask:

```
test test test test test test test test test test test junk
```

In `.env`:

```env
SEPOLIA_MNEMONIC=test test test test test test test test test test test junk
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
ETHERSCAN_API_KEY=your_key_optional
SEED_RESERVE_ETH=0.5
```

Persona addresses (same as local Hardhat — see `shared/hardhat-accounts.ts`):

| Index | Role | Address |
|------:|------|---------|
| 0 | World Bank Governor | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` |
| 1 | National Bank Admin | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` |
| 2 | Local Bank Governor | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` |
| 3 | Loan Approver | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` |
| 4 | Borrower (Md. Bokhtiar) | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` |
| 5 | Borrower (Aisha) | `0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc` |

### Option B — Single wallet

Set only `PRIVATE_KEY` in `.env`. Deploy and verify work, but all personas share one address (limited UI demo).

## 2. Fund wallets

Minimum suggested balances after deploy + verify:

| Account | Suggested Sepolia ETH |
|---------|----------------------|
| 0 (World Gov) | **0.8–1.0** (deploy gas + reserve seed + verify flows) |
| 1 (National) | 0.05 |
| 2 (Local) | 0.05 |
| 3 (Approver) | 0.03 |
| 4–5 (Borrowers) | 0.05 each |

Faucets: [Google Cloud Sepolia faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia), [Alchemy](https://www.alchemy.com/faucets/ethereum-sepolia), [Infura](https://www.infura.io/faucet/sepolia).

## 3. Deploy

One command (compile → deploy → sync env → verify G1 + G2):

```bash
npm run phase-sepolia
```

Or step by step:

```bash
npm run compile
npm run deploy:sepolia
npm run sync:env sepolia
npm run verify:phase1:sepolia
npm run verify:phase2:sepolia
```

Output manifest: `deployments/testnet/sepolia.json`

## 4. Run the app on Sepolia

```bash
# Postgres (if using indexer)
docker start cwb-pg   # or create per Documentation/PHASE1.md

cd backend && npx prisma migrate deploy && npm run dev
# new terminal
npm run frontend:dev
```

In MetaMask: network **Sepolia (11155111)**, import persona private keys from the Hardhat mnemonic (Account Details → Import).

The frontend dev persona picker maps to the same roles as localhost.

## 5. Backend indexer

After deploy, restart the backend so the indexer picks up new contract addresses from `backend/.env`. Set `CHAIN_OPERATOR_PRIVATE_KEY` only if you want the overdue cron to call `markLoanDefaulted` on-chain.

## Troubleshooting

| Error | Fix |
|-------|-----|
| `insufficient funds` | Fund account 0 (and borrowers for repay txs) from a faucet |
| `Sepolia deploy requires SEPOLIA_MNEMONIC` | Add mnemonic or `PRIVATE_KEY` to root `.env` |
| `Missing deployments/testnet/sepolia.json` | Run `npm run deploy:sepolia` first |
| RPC timeouts | Use Alchemy/Infura URL in `SEPOLIA_RPC_URL` |
| Verify fails on loan #1 | Re-deploy to a fresh manifest or reset loan counter expectations |

## Contracts deployed

- WorldBankReserve, NationalBank, LocalBank, LoanController
- MockUSDC, CreditPassport, UpwardDepositFacility
- SavingsVault, GroupLendingPool, InterBankLendingPool
- GovernorMultisig2of3 (2-of-3 world governor multisig)
