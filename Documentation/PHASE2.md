# Phase II — Gate G2 (core banking lifecycle)

Phase II extends Phase I with **Credit Passport** borrowing limits, **document-hash** loan requests, multi-entity contracts, and M2 database tables.

## Gate G2 checklist

| Item | Status |
|------|--------|
| DT-II.01–03 Loan request / approve / installments + `docHash` | `LoanController` + `requestLoanWithDoc` |
| DT-II.04 Credit Passport SBT limits | `CreditPassport.sol` |
| DT-II.07 Hierarchical registration | Phase I (unchanged) |
| `UpwardDepositFacility` | Deployed + Banks UI panel |
| `SavingsVault`, `GroupLendingPool`, `InterBankLendingPool` | Deployed + tests |
| M2 Prisma tables | `20250705230000_phase2_m2` migration |
| Document upload API | `POST /api/phase2/documents/upload` |
| Pending loans API | `GET /api/phase2/loans/pending` |

## Quick start

```bash
# Terminal 1
npm run node:chain

# Terminal 2
npm run phase2:local   # deploy + sync + verify (11 checks)

# Terminal 3
npm run dev
```

## New contracts

| Contract | Role |
|----------|------|
| `CreditPassport` | Soulbound credit tiers + on-chain borrow caps |
| `UpwardDepositFacility` | Voluntary upward funding |
| `SavingsVault` | mUSDC savings (simplified ERC-4626-style) |
| `GroupLendingPool` | Group consent + activation |
| `InterBankLendingPool` | Same-tier short-tenor liquidity |

## API

- `GET /api/phase2/status`
- `POST /api/phase2/documents/upload`
- `GET /api/phase2/documents/:requestId`
- `GET /api/phase2/loans/pending`
- `GET /api/phase2/credit/:wallet`

## Demo personas

Same Hardhat accounts #0–#5 as Phase I. Borrowers must be **registered** (`registerClient`) and within **Credit Passport** tier limits (Silver default: max **0.25 ETH**).
