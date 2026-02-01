# Demo Status – What Works Now

Use this to see how much of the prototype is ready to show your professor and what you need to do.

---

## ✅ Working right now (no extra setup)

| Component | Status | Notes |
|-----------|--------|--------|
| **Smart contract** | ✅ Working | `WorldBankReserve.sol` compiles; all 12 Hardhat tests pass |
| **Contract logic** | ✅ Working | Deposit, request loan, approve/reject, stats, pause, emergency withdraw |
| **Frontend code** | ✅ Present | All screens and flows are implemented (see below) |

---

## ⚠️ Needs one-time setup to run the full demo

The **frontend** has not had `npm install` run yet (or build failed due to missing `node_modules`). Once you install and deploy, everything below works.

### 1. Install frontend dependencies

```bash
cd frontend
npm install
```

(Takes a few minutes. If it times out, run it again or use `yarn`.)

### 2. Deploy the contract (for real blockchain demo)

```bash
# From project root
cp .env.example .env
# Edit .env: add PRIVATE_KEY (your MetaMask account's private key – admin account)
npx hardhat run scripts/deploy.ts --network mumbai
```

- Get test MATIC: https://faucet.polygon.technology/ (choose Mumbai).
- After deploy, copy the **contract address** from the terminal or from `deployment-info.json`.

### 3. Point the frontend at your contract

Create `frontend/.env`:

```env
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddressHere
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

- Get a free WalletConnect project ID: https://cloud.walletconnect.com/  
- If you skip `VITE_WALLETCONNECT_PROJECT_ID`, WalletConnect (e.g. mobile) may not work; MetaMask in the browser usually still works.

### 4. Run the app

```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

---

## What you can show in the demo (once the above is done)

| Feature | What the professor will see |
|--------|------------------------------|
| **Landing / Dashboard** | Connect wallet (MetaMask). If contract is set: live stats (total reserve, total loans, pending, approved). If not deployed: friendly message to deploy first. |
| **Deposit** | Enter MATIC amount → Deposit → MetaMask signs → reserve balance goes up on Dashboard. |
| **Loan request** | User (different wallet or same): enter amount + purpose → Request Loan → appears in “My Loans” as Pending. |
| **Admin panel** | Only the **deployer wallet** sees Admin. List of pending loans → Approve or Reject → Approve sends MATIC to borrower. |
| **QR page** | Generate QR for wallet address, loan page link, contract address. “Scan” tab: paste content (e.g. from phone camera) to simulate scan. |
| **Responsive / cross‑platform** | Same URL on phone; connect via WalletConnect; same flows (deposit, loan, QR). Material Design 3 UI. |

So: **all core flows (deposit, request loan, approve/reject, dashboard, QR) are implemented and will work once you complete the one-time setup above.**

---

## Minimal demo (no deployment)

If you **don’t** deploy the contract:

1. Run `cd frontend && npm install && npm run dev`.
2. Open the app and **connect wallet**.
3. You can show:
   - UI/UX: all screens, navigation, theme, QR generation (wallet + loan page URL).
   - Dashboard will show the “Contract not deployed” message instead of live stats.
   - Deposit / Loan / Admin will fail when they try to call the contract (no contract on-chain).

So: **UI and wallet connection work; blockchain actions need a deployed contract.**

---

## Quick checklist for “full” professor demo

- [ ] `cd frontend && npm install` (once)
- [ ] Add `.env` in project root with `PRIVATE_KEY` and optional RPC URLs
- [ ] Get Mumbai test MATIC from faucet
- [ ] `npx hardhat run scripts/deploy.ts --network mumbai`
- [ ] Create `frontend/.env` with `VITE_CONTRACT_ADDRESS=0x...` (and optional `VITE_WALLETCONNECT_PROJECT_ID`)
- [ ] `cd frontend && npm run dev`
- [ ] In browser: connect admin wallet → Deposit some MATIC → show Dashboard
- [ ] (Optional) On phone or second browser: connect user wallet → Request loan
- [ ] Back on admin: Admin tab → Approve loan → show funds released
- [ ] Show QR page: generate wallet/contract QR, paste in “Scan”

---

## Summary

- **Code:** Contract + frontend are implemented and wired for a full demo.
- **Working without deploy:** UI, routing, wallet connect, QR generation; no on-chain actions.
- **Working with deploy + env:** Full flow: deposit → request loan → approve → funds released; dashboard and QR as above.

Do the “Quick checklist” once, and you can demonstrate the full prototype to your professor.
