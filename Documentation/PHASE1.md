# Phase I — Gate G1 (complete local testnet)

Phase I delivers on-chain capital flow, **LoanController** (owned by LocalBank), **GovernorMultisig2of3** (local), and the loan lifecycle on **Hardhat localhost (chain 31337)** with **six wallet personas** mapped to contract roles.

## Gate G1 checklist

| Item | Status |
|------|--------|
| `WorldBankReserve`, `NationalBank`, `LocalBank`, `LoanController`, `MockUSDC` | `npm run phase1:local` |
| `GovernorMultisig2of3` (localhost) | Deployed with World Bank; EOA governor retained for demo |
| RBAC tests | `npm run test:contracts` |
| 13 M1 PostgreSQL tables | `cd backend && npm run prisma:migrate && npx prisma db seed` |
| React + MetaMask on localhost | All tier actions wired; Dashboard reads `/api/chain/hierarchy` |
| Demo: deposit → allocate → loan → approve → repay | `npm run verify:phase1` |

## Quick start

```bash
# Terminal 1
npm run node:chain

# Terminal 2
npm run phase1:local

# Terminal 3
npm run dev
```

`phase1:local` runs deploy → sync env → **verify:phase1** (11 checks).

## Contract layout (Phase I)

| Contract | Role |
|----------|------|
| `WorldBankReserve` | Tier 1 reserve; `allocate` / `allocateCapital` |
| `NationalBank` | Tier 2; allocates to LocalBank |
| `LocalBank` | Tier 3 shell; forwards ETH to `LoanController` |
| `LoanController` | Loan state machine (request / approve / repay) |
| `MockUSDC` | Testnet stablecoin artifact |
| `GovernorMultisig2of3` | 2-of-3 multisig (localhost); granted `GOVERNOR_ROLE` on World Bank |

## API endpoints

- `GET /api/phase1/status` — G1 config + on-chain reserve
- `GET /api/phase1/reserve/summary` — world / national / local stats + assets
- `GET /api/phase1/institutions` — Prisma institutions + events
- `GET /api/chain/hierarchy` — live on-chain balances
- `GET /api/chain/loans/pending` — pending loan IDs
- `GET /api/chain/loans/borrower/:address` — active loans for wallet

## PostgreSQL (optional)

```bash
docker run -d --name cwb-pg -e POSTGRES_USER=cwb -e POSTGRES_PASSWORD=cwb \
  -e POSTGRES_DB=crypto_world_bank -p 5432:5432 postgres:16

cd backend
npm run prisma:migrate
npx prisma db seed
```

Set `DATABASE_URL` in `backend/.env` before migrate/seed.

## Sepolia (thesis target)

```bash
# Set PRIVATE_KEY + SEPOLIA_RPC_URL in .env
npm run deploy:sepolia
npm run sync:env sepolia
```

Multisig is deployed on localhost only; extend `scripts/deploy.ts` for Sepolia multisig when ready.
