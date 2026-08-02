# WorldBankReserve — Frontend Development Plan

**Purpose of this document:** This is a content-and-functionality spec for all 47 frontend pages of the platform. It intentionally contains **no visual design direction** (no layout, color, or component styling decisions) — only what data must be shown, what a user can do, and what content blocks the page needs, in reading order. Use this as the source-of-truth brief for each page before generating code or prototypes.

**How to use this with Cursor:** Feed it one page section at a time (or a whole group at a time). Each page spec is self-contained: role/access, purpose, data, actions, content blocks, states, data source, and related pages. Route paths are suggestions — adjust to match your actual router setup.

---

## Table of Contents

**A. Public (Unauthenticated) — 4 pages**
1. Landing / Home
2. How It Works / About
3. Reserve Transparency Dashboard (Public)
4. Connect Wallet / Login

**B. Onboarding — 5 pages**
5. Registration
6. KYC Level 1
7. KYC Level 2
8. Consent & Risk Disclosure
9. Onboarding Complete

**C. Retail Client — Core — 3 pages**
10. Client Home Dashboard
11. Profile & Account Settings
12. Notifications Center

**D. Retail Client — Lending — 6 pages**
13. New Loan Application (Collateral-Based)
14. New Loan Application (Credit-Based)
15. Loan Detail / Status
16. Loan History & Transactions
17. Installment Payment
18. Borrowing Limits Overview

**E. Retail Client — Group Lending — 4 pages**
19. Create / Join Group
20. Group Loan Application
21. Group Consent / Multisig Approval
22. Group Dashboard

**F. Retail Client — Deposits — 3 pages**
23. Savings Vault
24. Fixed Deposit
25. Current / Checking Account

**G. Identity — 1 page**
26. Credit Passport (SBT)

**H. Agent & Support — 2 pages**
27. AI Banking Agent Chat
28. Client–Bank Live Chat

**I. Local Bank Operator — 6 pages**
29. Local Bank Dashboard
30. Loan Approval Queue
31. Loan Decision Detail (Authority Brief)
32. Income Verification Document Review
33. Bank User & Approver Management
34. Local AML Alert Review

**J. National Bank Admin — 4 pages**
35. National Bank Dashboard
36. Local Bank Registration & Management
37. Capital Allocation Controls
38. Rate / Reserve Ratio Settings & SAR Review

**K. World Bank Admin / Governance — 4 pages**
39. World Bank Admin Dashboard
40. National Bank Registration & Management
41. Global Reserve & Safe Multisig Console
42. Governance Parameters & Timelock Voting

**L. Regulator — 1 page**
43. Regulatory Read-Only Audit Portal

**M. Stretch / Advanced Modules — 4 pages**
44. Retail FX / Currency Exchange
45. Treasury FX Swap
46. Syndicated Loan / Tranche Management
47. Liquidation Monitor

---

## Shared / Global Elements (apply to every authenticated page unless noted)

These are not separate pages, but every page below assumes these persistent elements exist, so they aren't re-listed 47 times:

- **Top nav bar:** logo/home link, wallet connection status (address, chain, balance), network switch warning if wrong chain, notification bell (unread count), profile/avatar menu (settings, credit tier badge, logout).
- **Role-based nav menu:** links change based on the logged-in actor (Retail Client vs Local/National/World Bank vs Regulator vs Agent). A user should never see nav items for roles they don't hold.
- **Session/auth guard:** every authenticated route checks wallet connection + JWT session validity; expired session redirects to Connect Wallet / Login with a "session expired" message and a return-to path.
- **Global toast/alert system:** used for transaction submitted / confirmed / failed, form validation errors, and permission-denied events.
- **Transaction status machine:** any page that submits an on-chain transaction must support five states — *idle → signing (wallet prompt) → pending (mempool/confirming) → success → error* — with the current state visible to the user and a link to the block explorer once a tx hash exists.
- **Empty/loading/error states:** every data-driven page needs a skeleton/loading state, an explicit empty state (with a call-to-action, not just blank space), and an error state (with retry) — these are called out per page only when there's something non-obvious about them.
- **Access-denied page:** a single shared page/component shown when a wallet without the required role tries to reach a gated route (e.g., retail client hitting `/bank/local/dashboard`).

---

## A. Public (Unauthenticated)

### 1. Landing / Home
- **Route:** `/`
- **Access:** Anonymous Visitor
- **Purpose:** First entry point; explains the platform and funnels visitors to onboarding or wallet connect.
- **Data displayed:**
  - Headline value proposition (what the platform does — tiered banking + lending)
  - High-level, non-sensitive stats pulled from the public Reserve Summary (e.g., total capital under management, number of active loans, number of participating banks) — read-only, aggregate only
  - Trust/credibility markers: which testnet it's deployed on, links to contract addresses / block explorer, audit status (Slither/Mythril badges)
- **User actions:**
  - "Connect Wallet" / "Get Started" -> routes to Connect Wallet / Login
  - "Learn how it works" -> routes to About page
  - "View reserve transparency" -> routes to public Reserve Dashboard
- **Content sections (top to bottom):**
  1. Hero with value prop and primary CTA
  2. How the four-tier hierarchy works (World -> National -> Local -> Client), summarized in plain language
  3. Key product highlights (retail loans, group lending, savings, credit passport, AI agent)
  4. Aggregate trust stats (reserve summary, live loan count)
  5. Footer with links to docs, contracts, audit reports
- **States to handle:** stats block should degrade gracefully (show cached/last-known values or a "live data unavailable" note) if the event-listener/API is down; the rest of the page must still render.
- **Data source:** Off-chain API (aggregated reserve summary), no wallet required.
- **Links to:** About, Reserve Dashboard, Connect Wallet / Login.

### 2. How It Works / About
- **Route:** `/about`
- **Access:** Anonymous Visitor
- **Purpose:** Explains the four-tier hierarchy, loan lifecycle, and roles so a new user understands the system before connecting a wallet.
- **Data displayed:**
  - Explanation of the four tiers (World Bank, National Bank, Local Bank, Client) and what each does
  - Explanation of the loan lifecycle: request -> ML risk score (commit-reveal) -> approver decision -> disbursement -> installment schedule -> repayment
  - Explanation of KYC tiers (Level 1 vs Level 2) and what each unlocks
  - Explanation of the Credit Passport / SBT tier system (Bronze to Diamond) with the tier table (score range, max loan, interest modifier)
  - FAQ block (fees, security model, what happens on default, what data is stored on-chain vs off-chain)
- **User actions:** none beyond navigation; CTA to Connect Wallet at the bottom.
- **Content sections:** Tier hierarchy diagram+text, loan lifecycle steps, KYC explainer, credit tier table, FAQ accordion.
- **States to handle:** static content, no loading state needed.
- **Data source:** static/CMS content; credit tier table can be hardcoded or pulled from a config endpoint.
- **Links to:** Landing, Connect Wallet / Login.

### 3. Reserve Transparency Dashboard (Public)
- **Route:** `/reserve`
- **Access:** Anonymous Visitor + all authenticated roles (same page, public data)
- **Purpose:** Publicly verifiable view of system solvency, the "proof of reserve" surface referenced in the spec (Chainlink Proof of Reserve, `getReserveSummary()`).
- **Data displayed:**
  - Per-tier reserve summary: total capital held, reserve ratio (current vs. minimum required), Insurance Fund balance
  - World Bank global reserve total; breakdown by National Bank
  - National Bank breakdown by Local Bank
  - Total loans outstanding, total repaid, default rate (aggregate, non-identifying)
  - Chainlink Proof-of-Reserve attestation timestamp/status if available
  - Historical reserve trend (time series, reserve ratio over time)
- **User actions:**
  - Drill down from World -> National -> Local (tier navigation/breadcrumb)
  - Filter time range for historical trend
  - Export/download reserve snapshot (optional)
- **Content sections:** Top-level summary cards (total reserve, reserve ratio, insurance fund), tier drill-down table, historical trend chart, proof-of-reserve status badge.
- **States to handle:** explicitly show "last synced at [timestamp]" since this is projected from on-chain events into Postgres, data can lag; show a stale-data warning if the event listener hasn't synced recently.
- **Data source:** Off-chain API reading from the Postgres event-listener projection (FR-07); optionally a live on-chain read for the top-level reserve summary.
- **Links to:** drill-down links per tier; no auth required to view.

### 4. Connect Wallet / Login
- **Route:** `/login`
- **Access:** Anonymous Visitor
- **Purpose:** Authenticate via wallet signature (EIP-712 typed data) and establish a JWT session; branch new vs. returning users into onboarding vs. dashboard.
- **Data displayed:**
  - List of supported wallet connectors (MetaMask, WalletConnect, and Safe for institutional roles)
  - Network requirement notice (e.g., "Please connect to Sepolia")
  - Explanation of what signing the message does (no gas cost, it's just a login signature)
- **User actions:**
  - Select wallet provider -> trigger connection
  - Sign EIP-712 typed-data login message
  - Auto network-switch prompt if wallet is on the wrong chain
- **Content sections:** Wallet provider list/buttons, network-mismatch warning block, signature-request explainer, error block for rejected signatures.
- **States to handle:**
  - Wallet not installed (show install link)
  - Wallet connected but wrong network (show switch-network button)
  - Signature rejected by user (allow retry)
  - New wallet address (no user record) -> route to Registration
  - Existing wallet address, onboarding incomplete -> route to the correct onboarding step
  - Existing wallet address, onboarding complete -> route to role-appropriate dashboard
- **Data source:** On-chain wallet interaction (signature) + off-chain API to check whether the address has an existing account/role and its onboarding status.
- **Links to:** Registration, or role-specific dashboard, depending on account state.

---

## B. Onboarding (5-stage KYC funnel)

### 5. Registration
- **Route:** `/onboarding/register`
- **Access:** Wallet-connected, no account yet
- **Purpose:** Capture basic profile info and create the off-chain user record linked to the wallet address.
- **Data displayed:**
  - Wallet address (read-only, auto-filled from session)
  - Progress indicator ("Step 1 of 5")
- **User actions:**
  - Enter full name, email, phone, country of residence, date of birth
  - Select account type if applicable (Individual Retail vs. Group Client intent)
  - Submit -> creates user record, advances to KYC Level 1
- **Content sections:** Progress stepper, form fields, terms-of-service checkbox (link out to full terms), submit button.
- **States to handle:** field-level validation errors, duplicate-account detection (wallet or email already registered), submit-in-progress spinner.
- **Data source:** Off-chain API (write); no on-chain transaction at this step.
- **Links to:** KYC Level 1 (on success), Terms of Service (static page).

### 6. KYC Level 1
- **Route:** `/onboarding/kyc-1`
- **Access:** Registered, pre-KYC
- **Purpose:** Collect government ID + selfie for identity verification; unlocks Bronze/Silver tier small loans.
- **Data displayed:**
  - Progress indicator ("Step 2 of 5")
  - Explanation of what KYC Level 1 unlocks (loan cap, which features become available)
  - Accepted ID document types
- **User actions:**
  - Upload government ID (front/back image or PDF)
  - Capture/upload a selfie (for liveness/face-match)
  - Submit for review
- **Content sections:** Progress stepper, unlock-explainer callout, document upload widget (file type/size constraints shown), selfie capture widget, submit button, current verification status badge (Not Started / Pending / Approved / Rejected).
- **States to handle:**
  - Upload failure (file too large/wrong format)
  - Pending review (show estimated review time; allow browsing but gate loan actions)
  - Rejected (show rejection reason if available, allow re-submission)
- **Data source:** Off-chain API; documents stored off-chain, only a hash written on-chain per the platform's data-minimization design.
- **Links to:** Consent & Risk Disclosure (decide and document on the page whether this gate requires approval first, or lets the user proceed while pending).

### 7. KYC Level 2
- **Route:** `/onboarding/kyc-2`
- **Access:** KYC Level 1 approved, optional/upgrade path
- **Purpose:** Enhanced verification required for Gold/Platinum/Diamond tiers, higher loan limits, and group lending eligibility.
- **Data displayed:**
  - Progress indicator ("Step 3 of 5" or shown as an optional upgrade from the dashboard later)
  - Explanation of what Level 2 unlocks vs. Level 1 (limits comparison)
  - Current KYC status
- **User actions:**
  - Upload additional documents (proof of address, proof of income/source of funds)
  - Optionally: video verification or additional identity questions
  - Submit for review
- **Content sections:** Progress stepper, tier-comparison table (Level 1 vs Level 2 unlocks), document upload widgets, submit button, status badge.
- **States to handle:** same as KYC-1 (pending/approved/rejected), plus a clear "skip for now" option since Level 2 is not mandatory for basic-tier use.
- **Data source:** Off-chain API, hash-linked on-chain.
- **Links to:** Consent & Risk Disclosure, or "skip to dashboard" if optional.

### 8. Consent & Risk Disclosure
- **Route:** `/onboarding/consent`
- **Access:** Registered user completing onboarding
- **Purpose:** Present required disclosures (lending risk, liquidation risk, data usage) and capture explicit consent before account activation.
- **Data displayed:**
  - Progress indicator ("Step 4 of 5")
  - Risk disclosure text: collateral liquidation risk, health-factor mechanics, what happens on default, SBT tier downgrade consequences
  - Data usage/privacy disclosure: what's stored on-chain (hash-only) vs off-chain, and who can access it (Local Bank Approver, National/World Bank admins, Regulator read-only)
  - AI agent disclosure: write actions always require explicit human confirmation
- **User actions:**
  - Check individual consent boxes (risk acknowledgment, data usage, agent terms)
  - Submit / Accept & Continue
- **Content sections:** Progress stepper, disclosure text blocks (scrollable; may require scroll-to-bottom before enabling checkbox), checkboxes, continue button.
- **States to handle:** disable "Continue" until all required boxes are checked; log consent timestamp for audit purposes.
- **Data source:** Off-chain API (write consent record + timestamp).
- **Links to:** Onboarding Complete.

### 9. Onboarding Complete
- **Route:** `/onboarding/complete`
- **Access:** Registered user, all required steps done
- **Purpose:** Confirmation screen that welcomes the user and orients them to their new dashboard.
- **Data displayed:**
  - Summary of what's been completed (registration done, KYC-1 done/pending, consent done)
  - Starting credit tier (likely Bronze, default score) and starting loan limit
  - Quick-start suggestions (apply for a loan, explore savings, try the AI agent)
- **User actions:**
  - "Go to Dashboard" primary CTA
  - Optional "Upgrade to KYC Level 2 now" secondary CTA if not yet done
- **Content sections:** Success confirmation banner, onboarding-summary checklist, starting-tier callout, quick-start action cards.
- **States to handle:** if KYC-1 is still pending, clearly state that some features are locked until approval, rather than implying full access.
- **Data source:** Off-chain API (read user + KYC status).
- **Links to:** Client Home Dashboard.

---

## C. Retail Client - Core

### 10. Client Home Dashboard
- **Route:** `/dashboard`
- **Access:** Retail Client, Group Client
- **Purpose:** The client's home base, a snapshot of everything relevant to their account in one place.
- **Data displayed:**
  - Wallet balance (native token + stablecoin balances)
  - Credit Passport summary: score, tier (Bronze-Diamond), tier badge
  - Active loans summary (count, total outstanding, next payment due date/amount)
  - Savings/deposit summary (Savings Vault balance, Fixed Deposit balance if any)
  - Borrowing limit usage (used vs. available, six-month and one-year rolling caps)
  - Recent activity feed (last N transactions: loan disbursement, repayment, deposit, withdrawal)
  - Unread notifications count/preview
  - Group membership status if applicable
- **User actions:**
  - Quick-action buttons: Apply for Loan, Make a Payment, Deposit to Savings, Open AI Agent Chat
  - Click into any summary card to go to its detail page
- **Content sections (top to bottom):**
  1. Header greeting + wallet/KYC status badge
  2. Quick-action buttons row
  3. Financial summary cards (balance, active loans, savings, borrowing limit usage)
  4. Credit Passport summary card
  5. Recent activity feed
  6. Group membership card (only if applicable)
- **States to handle:** brand-new user with no activity yet, show onboarding/quick-start prompts instead of empty cards; KYC-pending banner if verification is still in progress and some actions are locked.
- **Data source:** Both, on-chain reads for balances/loan state (or via Postgres projection for speed) and off-chain API for KYC/profile status.
- **Links to:** every other retail client page.

### 11. Profile & Account Settings
- **Route:** `/settings`
- **Access:** Retail Client (reusable pattern for bank-role users, with role-specific fields added)
- **Purpose:** Manage personal info, security, notification preferences, and connected wallet.
- **Data displayed:**
  - Profile info (name, email, phone, country), editable
  - KYC status per level, with re-verify/upgrade option
  - Connected wallet address, network, disconnect/switch-wallet option
  - Notification preferences (email/push/in-app toggles per event type: loan approved, payment due, SBT tier change, agent action confirmations)
  - Security section: session/device list, log out of all sessions
- **User actions:**
  - Edit and save profile fields
  - Request KYC Level 2 upgrade (links to that flow)
  - Toggle notification preferences
  - Disconnect wallet / log out
- **Content sections:** Profile form, KYC status block, wallet/session management block, notification preferences form.
- **States to handle:** unsaved-changes warning, validation errors per field, success confirmation toast on save.
- **Data source:** Off-chain API (read/write); wallet address is read from session, not editable directly.
- **Links to:** KYC Level 2, Notifications Center.

### 12. Notifications Center
- **Route:** `/notifications`
- **Access:** All authenticated roles (content differs by role)
- **Purpose:** Central, searchable log of all account-relevant events, not just a dropdown preview.
- **Data displayed:**
  - List of notifications with type icon, message, timestamp, read/unread state
  - Retail client categories: loan status changes, payment due/overdue reminders, SBT tier changes, KYC status updates, agent action confirmations required, chat messages from bank
  - Bank-role categories: new loan requiring approval, AML alert raised, capital allocation request, governance proposal pending vote
- **User actions:**
  - Mark as read/unread, mark all as read
  - Filter by category/date
  - Click a notification -> deep-link to the relevant page
- **Content sections:** Filter/search bar, notification list (grouped by date), empty state ("You're all caught up").
- **States to handle:** real-time updates via WebSocket/Socket.IO should push new items to the top without requiring a refresh.
- **Data source:** Off-chain API + real-time channel (Socket.IO).
- **Links to:** deep-links into whichever page each notification references.

---

## D. Retail Client - Lending

### 13. New Loan Application (Collateral-Based)
- **Route:** `/loans/apply/collateral`
- **Access:** Retail Client (KYC Level 1 minimum)
- **Purpose:** Let a client apply for a loan backed by collateral (LTV-based), the lower-friction path for new users below SBT-gated credit thresholds.
- **Data displayed:**
  - Current wallet balance available as collateral
  - Loan-to-Value (LTV) ratio and how it affects max borrowable amount, live as the user adjusts inputs
  - Current interest rate (from the kinked utilization model); show current pool utilization and where it sits relative to the 80% kink point
  - Estimated installment schedule preview (amount per period, number of periods, total repayment) before submission
  - Remaining borrowing limit (six-month/one-year caps) to confirm the requested amount doesn't exceed it
- **User actions:**
  - Select/enter collateral amount and asset
  - Enter requested loan amount (live max-borrowable validation against LTV and borrowing limits)
  - Select repayment term/schedule
  - Review terms -> Submit (triggers on-chain transaction + off-chain risk-scoring pipeline)
- **Content sections:** Collateral input, loan amount input with live LTV feedback, interest rate display with utilization context, repayment schedule preview table, terms summary/review step, submit button with tx-status machine.
- **States to handle:** insufficient collateral, exceeds borrowing limit, wallet rejects transaction, pending ML risk score (commit-reveal, explain there's a brief wait before an approver reviews it), submission success (route to Loan Detail for the new loan).
- **Data source:** On-chain (collateral lock, loan request tx) + off-chain (interest rate model, limit checks, risk-score pipeline trigger).
- **Links to:** Loan Detail (on success), Borrowing Limits Overview.

### 14. New Loan Application (Credit-Based)
- **Route:** `/loans/apply/credit`
- **Access:** Retail Client with sufficient SBT tier (no collateral required, SBT-gated)
- **Purpose:** Uncollateralized loan path available only to clients whose Credit Passport tier qualifies.
- **Data displayed:**
  - Current SBT tier and score, and the max uncollateralized loan amount that tier permits (Bronze $50 up to Diamond $25,000)
  - Interest rate modifier applied for their tier (e.g., Diamond = base minus 2.0%)
  - Remaining borrowing limit (six-month/one-year caps)
  - Repayment schedule preview
- **User actions:**
  - Enter requested loan amount (capped by tier max)
  - Select repayment term
  - Review terms -> Submit
  - If tier is too low to qualify, page should clearly redirect to the Collateral-Based application with an explanation
- **Content sections:** SBT tier/eligibility banner, loan amount input with tier-cap validation, interest rate display, repayment schedule preview, review step, submit button with tx-status machine.
- **States to handle:** tier too low (block with explanation + link to collateral path), exceeds borrowing limit, same commit-reveal pending-score wait state as the collateral flow.
- **Data source:** On-chain (loan request tx, SBT read) + off-chain (limit checks, risk-score pipeline).
- **Links to:** Loan Detail (on success), Credit Passport.

### 15. Loan Detail / Status
- **Route:** `/loans/:loanId`
- **Access:** Retail Client (own loans only); Local Bank Approver (any loan in their branch, via a role-aware version of this page)
- **Purpose:** Single source of truth for one loan's full lifecycle state.
- **Data displayed:**
  - Loan state machine position, shown plainly (Pending Score -> Under Review -> Approved/Rejected -> Disbursed -> Active -> Completed/Defaulted), not just a raw enum
  - Loan terms: principal, interest rate, term length, collateral (if any) and its current LTV/health factor
  - Installment schedule: full table of due dates, amounts, paid/unpaid status
  - Risk assessment summary (if visible to this role): composite risk score, and for approvers, the SHAP top-k feature breakdown ("Authority Brief")
  - Transaction history for this loan (disbursement tx, each repayment tx) with links to block explorer
  - Health factor gauge if collateralized (with liquidation threshold clearly marked)
- **User actions:**
  - Make a payment (if client, and an installment is due) -> routes to Installment Payment
  - Download/export loan agreement or statement
  - (Approver view only) Approve / Reject / Request more info -> routes to Loan Decision Detail
- **Content sections:** Status header with current state, terms summary card, installment schedule table, health factor gauge (if applicable), transaction history list, risk assessment card (role-dependent visibility).
- **States to handle:** pending-score wait state (explain the commit-reveal delay), rejected state (show rejection reason if provided), defaulted state (explain consequences: SBT downgrade, collateral outcome).
- **Data source:** On-chain (authoritative state) reconciled with off-chain Postgres projection for fast reads; handle brief on-chain/off-chain disagreement gracefully (show "syncing" rather than conflicting numbers).
- **Links to:** Installment Payment, Loan History, Credit Passport, Loan Decision Detail (approver only).

### 16. Loan History & Transactions
- **Route:** `/loans/history`
- **Access:** Retail Client
- **Purpose:** Full historical list of all loans (active, completed, rejected, defaulted) and all related transactions, for record-keeping.
- **Data displayed:**
  - Table/list of all loans with: date, amount, type (collateral/credit/group), status, outcome
  - Table of all related transactions (disbursements, repayments, fees) with amounts, dates, tx hashes
  - Summary stats: total borrowed to date, total repaid, on-time payment rate
- **User actions:**
  - Filter by status/date range/loan type
  - Search by loan ID
  - Export to CSV/PDF statement
  - Click into any row -> Loan Detail
- **Content sections:** Filter/search bar, summary stat cards, loans table, transactions table (may be tabbed: Loans / Transactions).
- **States to handle:** empty state for users with no loan history yet (with a CTA to apply).
- **Data source:** Off-chain API reading the Postgres projection (for performant filtering/pagination) with links back to on-chain tx hashes for verification.
- **Links to:** Loan Detail (per row).

### 17. Installment Payment
- **Route:** `/loans/:loanId/pay`
- **Access:** Retail Client (loan owner)
- **Purpose:** Focused flow to pay a due (or upcoming) installment.
- **Data displayed:**
  - Installment amount due, due date, late-fee amount if overdue
  - Remaining loan balance after this payment
  - Wallet balance vs. amount due (sufficiency check)
  - Payment method (stablecoin balance in connected wallet, the only method per the spec)
- **User actions:**
  - Confirm payment amount (exact due amount; state clearly whether partial/extra payments are allowed)
  - Submit -> on-chain transaction
- **Content sections:** Amount-due summary card, wallet-balance check, confirm button with tx-status machine, post-payment confirmation with updated schedule.
- **States to handle:** insufficient balance (block with clear message and a link to add funds), overdue payment (show late fee and any SBT-impact warning), transaction failure/retry.
- **Data source:** On-chain transaction; off-chain schedule read for due-amount display.
- **Links to:** back to Loan Detail on success/failure.

### 18. Borrowing Limits Overview
- **Route:** `/loans/limits`
- **Access:** Retail Client
- **Purpose:** Transparency page showing exactly how much the client can still borrow and why, since limits are enforced on-chain and can otherwise feel opaque.
- **Data displayed:**
  - Six-month rolling limit: cap, used, remaining, and the rolling window's reset behavior explained
  - One-year rolling limit: same breakdown
  - How SBT tier affects the cap (link to Credit Passport tier table)
  - List of loans counted toward each rolling window, with dates, so the user can see why their remaining limit is what it is
- **User actions:** none beyond navigation; informational page with a CTA to apply for a loan if room remains, or an explanation of when the limit will free up if maxed out.
- **Content sections:** Two limit-progress bars (6-month, 1-year), explainer text, contributing-loans table.
- **States to handle:** limit fully used (explain next available date, don't just show a dead-end).
- **Data source:** On-chain authoritative check surfaced via off-chain projection for the table breakdown.
- **Links to:** New Loan Application, Credit Passport.

---

## E. Retail Client - Group Lending

### 19. Create / Join Group
- **Route:** `/groups/create` and `/groups/join`
- **Access:** Retail Client (KYC Level 2 recommended/required per spec)
- **Purpose:** Form a new solidarity lending group (3-20 members) or join an existing one via invite.
- **Data displayed:**
  - Group size rules (min 3, max 20 members)
  - Over-indebtedness rules explained up front: max two simultaneous group loans, 30-day cooling-off period, DTI cap of 0.40
  - For "join" flow: the group being joined, name, current member count, group's collateral/credit terms
- **User actions:**
  - Create: name the group, set initial terms, invite members (by wallet address or invite link/code)
  - Join: enter invite code, review group terms, request to join (may require existing members' consent)
- **Content sections:** Create-group form (name, invite members, initial terms), or join-group form (invite code entry, group preview, join request button).
- **States to handle:** invite-pending state while waiting for existing members to accept a new joiner; group not found / invite expired.
- **Data source:** Off-chain API for group metadata/invites; on-chain group contract registration once finalized.
- **Links to:** Group Dashboard once formed/joined.

### 20. Group Loan Application
- **Route:** `/groups/:groupId/apply`
- **Access:** Group Client (any member, or a designated group representative, clarify this rule on the page)
- **Purpose:** Apply for a loan on behalf of the whole group, to be split per-member.
- **Data displayed:**
  - Group members list and each member's individual KYC/credit standing (as far as relevant to eligibility)
  - Requested total loan amount and the automatic per-member share (Loan Total divided by N members)
  - DTI check result per member (reject path if DTI exceeds 0.40 for any member)
  - Cooling-off / max-two-loans check result for the group
  - Shared collateral requirement (if applicable) and mutual liability explanation
- **User actions:**
  - Enter requested total amount -> see live per-member share calculation
  - Submit application (likely triggers the Group Consent step next, rather than immediate submission)
- **Content sections:** Member roster with eligibility indicators, amount input with live per-member split, risk-control checklist (DTI, cooling-off, loan-count) shown as pass/fail per rule, mutual-liability disclosure, submit button.
- **States to handle:** blocked submission if any risk control fails, with a clear explanation of which rule failed and for which member.
- **Data source:** On-chain group contract state + off-chain DTI/cooling-off calculation.
- **Links to:** Group Consent / Multisig Approval (next step).

### 21. Group Consent / Multisig Approval
- **Route:** `/groups/:groupId/consent`
- **Access:** Group Client (each member individually, for their own signature)
- **Purpose:** Collect the required multi-signature consent from group members before a group loan proceeds, the "mutual liability" agreement point.
- **Data displayed:**
  - Loan terms being consented to (amount, per-member share, mutual liability terms)
  - Current signature status: which members have signed, which are pending
  - This user's own consent action (only shown/enabled if not yet signed)
- **User actions:**
  - Review terms and sign (wallet signature) to consent
  - (If already signed) view-only status of others
- **Content sections:** Terms summary, member signature checklist (signed/pending per member), sign button (only for the current user's pending signature), progress indicator (e.g., "3 of 5 signed").
- **States to handle:** all-signed state auto-advances the loan to disbursement processing; define and show a fallback if a member declines/times out (loan cancelled, or reduced membership, whichever your contract logic implements).
- **Data source:** On-chain multisig/group contract state.
- **Links to:** Group Dashboard.

### 22. Group Dashboard
- **Route:** `/groups/:groupId`
- **Access:** Group Client (member of that group)
- **Purpose:** Ongoing home base for an existing group, shared collateral, loan status, and each member's contribution/liability.
- **Data displayed:**
  - Member roster with each member's share of the loan, repayment status, and liability exposure
  - Group's shared collateral balance and status
  - Active group loan(s) status (links to Loan Detail per loan)
  - Group credit history (shown on the group's SBT-equivalent record)
  - Aggregate group repayment rate / standing
- **User actions:**
  - View a member's individual contribution/status
  - Apply for a new group loan (if eligible per the risk controls)
  - Leave group (if permitted by contract rules, explain consequences if mid-loan)
- **Content sections:** Member roster table, shared collateral summary, active loans list, group credit history card, actions row (new loan, leave group).
- **States to handle:** mutual-liability warning banner if any member is delinquent, since it affects everyone in the group.
- **Data source:** On-chain group contract + off-chain projection for history.
- **Links to:** Group Loan Application, Loan Detail (per active loan).

---

## F. Retail Client - Deposits

### 23. Savings Vault
- **Route:** `/savings`
- **Access:** Retail Client
- **Purpose:** Deposit/withdraw stablecoins into the variable-yield ERC-4626 savings vault.
- **Data displayed:**
  - Current vault balance (principal + accrued yield)
  - Current variable APY and how it's derived (link to interest-split explanation: depositor yield / InsuranceFund / protocol revenue)
  - Deposit history (list of deposits/withdrawals with dates and amounts)
  - Withdrawal availability (gated by system reserve ratio, explain if a withdrawal is currently restricted and why)
- **User actions:**
  - Deposit (enter amount, confirm, on-chain tx)
  - Withdraw (enter amount, confirm, on-chain tx), subject to reserve-ratio gating
- **Content sections:** Balance/yield summary card, APY explainer, deposit form, withdraw form, transaction history table.
- **States to handle:** withdrawal blocked by reserve ratio (explain clearly, don't just disable the button silently), insufficient balance for withdrawal amount entered.
- **Data source:** On-chain (ERC-4626 vault contract) reconciled with off-chain projection for history.
- **Links to:** Fixed Deposit, Current/Checking Account.

### 24. Fixed Deposit
- **Route:** `/deposits/fixed`
- **Access:** Retail Client
- **Purpose:** Lock funds for a fixed term (30/90/180/365 days) at a fixed rate.
- **Data displayed:**
  - Available term options with their respective interest rates
  - Existing fixed deposits: principal, term, maturity date, projected payout, current status (active/matured/withdrawn)
  - Early-withdrawal policy if applicable (penalty, if any)
- **User actions:**
  - Open a new fixed deposit (choose term, enter amount, confirm, on-chain tx)
  - Withdraw a matured deposit
  - Request early withdrawal (if permitted), with penalty disclosure shown before confirming
- **Content sections:** Term-selection cards (rate per term), new-deposit form, existing-deposits table with maturity countdown, withdraw actions.
- **States to handle:** deposit not yet matured (withdraw button disabled/replaced with "request early withdrawal" and penalty warning).
- **Data source:** On-chain (FixedDeposit contract) + off-chain projection for history/maturity tracking.
- **Links to:** Savings Vault, Current/Checking Account.

### 25. Current / Checking Account
- **Route:** `/account/checking`
- **Access:** Retail Client
- **Purpose:** Everyday transactional account view, atomic transfers, no lock-up, no yield (or minimal).
- **Data displayed:**
  - Current balance
  - Transaction history (transfers in/out, with counterparties where relevant)
- **User actions:**
  - Send funds (enter recipient address, amount, confirm, on-chain tx)
  - Request/receive (show own address + QR code for receiving)
- **Content sections:** Balance card, send form, receive block (address + QR), transaction history table.
- **States to handle:** insufficient balance, invalid recipient address format, transaction confirmation with tx-status machine.
- **Data source:** On-chain (atomic transfer tx) + off-chain projection for transaction history.
- **Links to:** Savings Vault, Fixed Deposit.

---

## G. Identity

### 26. Credit Passport (SBT)
- **Route:** `/credit-passport`
- **Access:** Retail Client, Group Client (own passport); viewable in read-only form by Local Bank Approver during loan review
- **Purpose:** Show the client's soulbound credit identity, score, tier, and history, the thing that gates credit-based lending and interest rates.
- **Data displayed:**
  - Current score (0-1000 scale) and tier (Bronze/Silver/Gold/Platinum/Diamond) with the full tier table for context (score range, max loan, interest modifier)
  - Score history over time (chart) with events annotated (e.g., "+15 for on-time repayment", "-40 for missed installment")
  - Repayment history summary (on-time count, late count, defaults)
  - Group credit history if the user is/was part of a group
  - What actions raise or lower the score (explainer)
- **User actions:**
  - View score history detail
  - Link out to loan application pages (credit-based) if tier qualifies
- **Content sections:** Score/tier hero card with visual tier badge, tier-table reference, score history chart, repayment history table, "how scoring works" explainer.
- **States to handle:** new user with no history yet (default Bronze, explain how to start building score).
- **Data source:** On-chain (SBT read) + off-chain projection for the annotated history/chart.
- **Links to:** New Loan Application (Credit-Based), Loan History.

---

## H. Agent & Support

### 27. AI Banking Agent Chat
- **Route:** `/agent`
- **Access:** Retail Client (Phase III deliverable, A5 actor is the agent itself acting on the user's behalf)
- **Purpose:** Conversational interface where the client can ask questions and, with confirmation, perform write actions (loan application, installment payment) via the same API/contracts as the manual UI.
- **Data displayed:**
  - Chat message history for the session (user + agent turns)
  - Live on-chain context the agent is using is not shown raw, but any data it cites (e.g., "your next payment is due in 3 days") should be visibly sourced/consistent with the Dashboard numbers
  - Tool-call transparency: when the agent proposes a write action, show exactly what it intends to do (tool name in plain language, parameters, e.g., "Apply for a $500 collateral loan, 6-month term") before execution
  - Confirmation gate UI: explicit Approve / Cancel buttons for any write action, this is a hard requirement, never auto-execute
  - Agent audit trail link (so a user can see a log of everything the agent has done on their behalf)
- **User actions:**
  - Send a message / ask a question (read-only queries: account state, loan status, requirements, policy Q&A via RAG)
  - Approve or cancel a proposed write action (loan application, installment payment)
  - View/replay session history
  - Start a new session
- **Content sections:** Chat message stream, message input box, tool-call confirmation card (appears inline when the agent proposes a write action), session history sidebar/list, link to agent action log.
- **States to handle:** agent "thinking"/streaming state, tool-call pending-confirmation state (must block further unrelated actions until resolved or cancelled), prompt-injection/blocked-response state (show a safe fallback message if a request is flagged), connection/session error state.
- **Data source:** Real-time (SSE per the spec's Server-Sent Events channel) to the Express.js backend, which relays to the Qwen3-8B agent; write actions go through the same API/contracts as manual flows.
- **Links to:** Loan Detail / relevant page after a confirmed write action completes; Agent Action Log (could be a section of Notifications or a dedicated log view).

### 28. Client-Bank Live Chat
- **Route:** `/support/chat`
- **Access:** Retail Client <-> Local Bank Operator/Approver
- **Purpose:** Direct human-to-human real-time messaging between a client and their Local Bank, separate from the AI agent, for support/escalation.
- **Data displayed:**
  - Message thread history with timestamps and read receipts
  - Which Local Bank/operator the client is connected to
  - Online/offline status of the counterparty
- **User actions:**
  - Send/receive text messages
  - Attach a file (e.g., a document related to a support request)
  - Start a new thread if none exists yet
- **Content sections:** Thread list (if multiple threads, e.g., one per loan/issue), active thread message view, message input with attachment support.
- **States to handle:** no active thread yet (show a "start a conversation" prompt), message delivery failure/retry, typing indicator (nice-to-have, not required).
- **Data source:** Real-time (WebSocket/Socket.IO) with off-chain persistence for history.
- **Links to:** Notifications Center (new-message alerts).

---

## I. Local Bank Operator

### 29. Local Bank Dashboard
- **Route:** `/bank/local/dashboard`
- **Access:** Local Bank Operator, Local Bank Approver
- **Purpose:** Operational home base for a Local Bank branch, its capital position, loan book, and pending work queue.
- **Data displayed:**
  - Branch capital position: allocated capital from National Bank, current reserve ratio, available lending capacity
  - Loan book summary: total active loans, total value, delinquency rate, upcoming maturities
  - Pending work queue counts: loans awaiting approval, KYC documents awaiting review, AML alerts open
  - Client roster summary (count of active clients, new registrations this period)
- **User actions:**
  - Quick links into each queue (Loan Approval Queue, Income Verification Review, AML Alert Review)
  - View branch-level reserve detail (link to Reserve Transparency, scoped to this branch)
- **Content sections:** Capital position summary cards, work-queue cards with counts and direct links, loan book summary chart/table, client roster summary.
- **States to handle:** empty queues (show "all caught up" rather than blank cards); reserve-ratio warning banner if the branch is near its minimum.
- **Data source:** On-chain (capital, reserve) + off-chain projection (queues, client roster).
- **Links to:** Loan Approval Queue, Income Verification Document Review, Local AML Alert Review, Bank User & Approver Management.

### 30. Loan Approval Queue
- **Route:** `/bank/local/approvals`
- **Access:** Local Bank Approver
- **Purpose:** Prioritized list of loan applications awaiting a human decision, gated behind a completed ML risk score (commit-reveal).
- **Data displayed:**
  - List of applications with: applicant (masked/identified per compliance policy), requested amount, loan type (collateral/credit/group), composite risk score, submission date, time-in-queue
  - Sort/priority indicators (e.g., oldest first, or highest-risk first, configurable)
- **User actions:**
  - Sort/filter the queue (by risk score, amount, date, loan type)
  - Click into an application -> Loan Decision Detail
  - Bulk actions if appropriate (e.g., approve a batch of low-risk, small-amount loans, only if this matches your actual risk policy, otherwise omit)
- **Content sections:** Filter/sort bar, queue table (or card list), risk-score badge per row (color-coded by risk band), empty state.
- **States to handle:** an application still waiting on the ML pipeline (not yet scored) should be visibly distinct from one ready for decision, don't mix "not yet scoreable" with "ready to review" in the same visual bucket.
- **Data source:** Off-chain API (queue is driven by the Postgres projection + FastAPI ML inference results); on-chain for authoritative loan state.
- **Links to:** Loan Decision Detail (per row).

### 31. Loan Decision Detail (Authority Brief)
- **Route:** `/bank/local/approvals/:loanId`
- **Access:** Local Bank Approver
- **Purpose:** This is the "Authority Brief" — everything an approver needs to make an informed, explainable decision on one loan, then act on it.
- **Data displayed:**
  - Full applicant/loan context (same terms info as the client-facing Loan Detail page, plus anything approver-only)
  - Composite risk score, with a plain-language interpretation (not just a number)
  - SHAP explainability breakdown: top-k contributing features and their direction/magnitude (why the model scored it this way) — this must be a clear, readable breakdown, not a raw JSON dump
  - Random Forest fraud probability and Isolation Forest anomaly flag shown as separate signals, alongside the stacked composite
  - Applicant's KYC status, Credit Passport tier/history, existing loan/repayment history
  - Borrowing limit check result (does this request fit within their rolling caps)
- **User actions:**
  - Approve (triggers on-chain approval + disbursement flow)
  - Reject (requires a reason, shown to the applicant)
  - Request more info (routes back to applicant, pauses the queue item)
- **Content sections:** Applicant/loan summary card, risk score + interpretation card, SHAP feature breakdown (ranked list with magnitude/direction), applicant history panel (KYC, credit passport, past loans), decision action bar (Approve / Reject / Request Info) with confirmation step before an on-chain write.
- **States to handle:** decision-in-progress (disable double-submission), on-chain tx status machine for the approval write, audit-row confirmation (`LOAN_RISK_ASSESSMENT` row was written for this inference, show a reference/ID for traceability).
- **Data source:** On-chain (approval tx) + off-chain (FastAPI ML service for score/SHAP, Postgres for history).
- **Links to:** back to Loan Approval Queue on decision; Client's Credit Passport (read-only) and Loan History (read-only) for deeper context.

### 32. Income Verification Document Review
- **Route:** `/bank/local/kyc-review`
- **Access:** Local Bank Operator, Local Bank Approver
- **Purpose:** Queue and detail view for reviewing uploaded income/identity documents (KYC-1, KYC-2, income verification for loan applications).
- **Data displayed:**
  - Queue list: applicant, document type, submission date, status (pending/approved/rejected)
  - Document viewer for the selected item (image/PDF preview)
  - Applicant's existing KYC level and history of prior submissions
- **User actions:**
  - Open a document for review
  - Approve or reject (reject requires a reason, sent back to the applicant)
  - Flag for escalation (e.g., suspected fraud, routes to AML alert review)
- **Content sections:** Queue table/list, document preview pane, applicant context sidebar, decision action bar.
- **States to handle:** unreadable/corrupt document upload (flag and request re-upload rather than silently failing), document already reviewed by another operator (avoid double-processing, show who/when it was handled).
- **Data source:** Off-chain API (document metadata + storage reference; actual files off-chain, hash on-chain).
- **Links to:** Local AML Alert Review (escalation path).

### 33. Bank User & Approver Management
- **Route:** `/bank/local/users`
- **Access:** Local Bank Operator (admin-level within the branch)
- **Purpose:** Manage which wallets/staff have Operator or Approver roles at this Local Bank.
- **Data displayed:**
  - List of current bank staff with role (Operator/Approver), wallet address, date added, status (active/suspended)
  - Pending role-assignment requests if your flow requires multi-party sign-off to add an approver
- **User actions:**
  - Add a new staff member (wallet address + role assignment) — this is a role-gated on-chain transaction (RBAC)
  - Change a staff member's role
  - Suspend/revoke a staff member's access
- **Content sections:** Staff table, add-staff form, role-change/revoke confirmation dialogs (on-chain tx status machine, since RBAC changes are on-chain).
- **States to handle:** attempting to remove the last remaining approver (block with a warning, the branch needs at least one), tx pending/failed for role changes.
- **Data source:** On-chain (RBAC contract) + off-chain projection for display.
- **Links to:** none beyond this page's own actions.

### 34. Local AML Alert Review
- **Route:** `/bank/local/aml-alerts`
- **Access:** Local Bank Approver
- **Purpose:** Review anomaly-detection flags (Isolation Forest) raised on client accounts/transactions and decide on freeze/escalation.
- **Data displayed:**
  - List of open alerts: client, transaction(s) involved, anomaly score, flag reason, date raised
  - Alert detail: full transaction context, client's account history, anomaly-model output
- **User actions:**
  - Open an alert for review
  - Freeze account (on-chain action, `freezeAccount`)
  - Dismiss alert (false positive, with a reason logged)
  - Escalate to National Bank compliance (generate SAR)
- **Content sections:** Alert queue table, alert detail panel (transaction context, client history, model output), decision action bar (Freeze / Dismiss / Escalate/Generate SAR).
- **States to handle:** freeze action must show a clear on-chain tx confirmation step given its severity (account holder loses access); every decision must be logged for audit (show a confirmation that the action was recorded).
- **Data source:** Off-chain (Isolation Forest output, Postgres) + on-chain (freeze transaction).
- **Links to:** Client's account/profile (read-only), National Bank SAR Review (escalation target).

---

## J. National Bank Admin

### 35. National Bank Dashboard
- **Route:** `/bank/national/dashboard`
- **Access:** National Bank Admin
- **Purpose:** Jurisdiction-level operational home base, capital position relative to World Bank, and oversight of all Local Banks under this National Bank.
- **Data displayed:**
  - Capital allocated from World Bank, current reserve ratio, capital re-allocated downward to Local Banks
  - Roster of Local Banks under this jurisdiction with their individual reserve ratios and loan book sizes
  - Pending work: capital allocation requests from Local Banks, SAR escalations, governance items needing input
  - Aggregate jurisdiction-level lending stats (total loans, default rate, total value)
- **User actions:**
  - Drill into a specific Local Bank
  - Quick links to Capital Allocation Controls, SAR Review
- **Content sections:** Capital position summary, Local Bank roster table (sortable by reserve ratio/size), pending-work queue cards, jurisdiction stats.
- **States to handle:** reserve-ratio warning banner if the National Bank itself, or any Local Bank under it, is near minimum.
- **Data source:** On-chain (capital/reserve) + off-chain projection (aggregates, queues).
- **Links to:** Local Bank Registration & Management, Capital Allocation Controls, Rate/Reserve Settings & SAR Review.

### 36. Local Bank Registration & Management
- **Route:** `/bank/national/local-banks`
- **Access:** National Bank Admin
- **Purpose:** Register new Local Banks under this National Bank and manage existing ones (per FR-01/feature #7, hierarchical bank registration).
- **Data displayed:**
  - List of registered Local Banks: name, wallet/contract address, registration date, status (active/paused), reserve ratio, current allocated capital
- **User actions:**
  - Register a new Local Bank (name, admin wallet address, initial parameters) — on-chain transaction
  - Pause/unpause a Local Bank (emergency control)
  - Edit Local Bank parameters (e.g., its minimum reserve ratio, if governance allows per-bank overrides)
- **Content sections:** Local Bank table, "Register New Local Bank" form/modal, pause/unpause confirmation dialogs, edit-parameters modal.
- **States to handle:** on-chain tx status machine for registration/pause actions; duplicate registration attempt (address already registered).
- **Data source:** On-chain (bank registry contract) + off-chain projection for display.
- **Links to:** National Bank Dashboard.

### 37. Capital Allocation Controls
- **Route:** `/bank/national/capital-allocation`
- **Access:** National Bank Admin
- **Purpose:** Allocate capital downward to Local Banks (`allocateCapital`), respecting reserve-ratio enforcement.
- **Data displayed:**
  - Available capital to allocate (after maintaining the National Bank's own minimum reserve ratio)
  - Per-Local-Bank current allocation and utilization (how much of their existing allocation is deployed in loans)
  - Requests from Local Banks for additional capital, if that's part of your workflow (vs. National Bank pushing allocations proactively)
- **User actions:**
  - Select a Local Bank and enter an allocation amount, with live validation against available capital and reserve-ratio constraints
  - Submit -> on-chain transaction
  - Approve/deny a Local Bank's capital request (if applicable)
- **Content sections:** Available-capital summary, allocation form (Local Bank selector + amount + live validation), per-branch utilization table, pending-requests list (if applicable).
- **States to handle:** allocation would breach reserve ratio (block with a clear on-chain-revert explanation, this is enforced by the contract per FR-03), tx status machine.
- **Data source:** On-chain (allocation transaction, reserve checks) + off-chain projection for utilization display.
- **Links to:** National Bank Dashboard, Local Bank Registration & Management.

### 38. Rate / Reserve Ratio Settings & SAR Review
- **Route:** `/bank/national/settings` (rate/reserve settings) and `/bank/national/sar-review` (SAR queue) — can be one page with two tabs, or two routes; document whichever you choose
- **Access:** National Bank Admin
- **Purpose:** (1) Set jurisdiction-level parameters like borrowing rate baselines and minimum reserve ratio, and (2) review Suspicious Activity Reports escalated from Local Banks.
- **Data displayed (Settings tab):**
  - Current borrowing rate parameters (baseline, kink point, kink-rate multiplier) and current minimum reserve ratio, with change history
- **Data displayed (SAR Review tab):**
  - Queue of SARs escalated from Local Banks: client, reason, evidence summary, escalation date, status
- **User actions (Settings):**
  - Edit rate/ratio parameters -> submit as an on-chain governance transaction (may require multisig/timelock depending on your governance design, clarify this on the page)
- **User actions (SAR Review):**
  - Open a SAR for detail, confirm/escalate further to World Bank, or resolve/close with a reasoned note
- **Content sections:** Tab or section switcher, settings form with current-vs-proposed value comparison, SAR queue table, SAR detail panel with decision actions.
- **States to handle:** parameter change requiring multisig confirmation (show pending-signature status if so); SAR queue empty state.
- **Data source:** On-chain (parameter contract state) + off-chain (SAR records, Postgres).
- **Links to:** Local AML Alert Review (source of SARs), Governance Parameters & Timelock Voting (if changes route through governance).

---

## K. World Bank Admin / Governance

### 39. World Bank Admin Dashboard
- **Route:** `/bank/world/dashboard`
- **Access:** World Bank Admin (Governance)
- **Purpose:** Top-of-hierarchy operational view — global reserve custody, all National Banks, and system-wide health.
- **Data displayed:**
  - Global reserve total and reserve ratio
  - Roster of all National Banks with their reserve ratios, allocated capital, and aggregate Local Bank counts
  - System-wide stats: total loans outstanding across all tiers, total value locked, default rate
  - Pending governance items (proposals awaiting vote, multisig transactions awaiting co-signature)
- **User actions:**
  - Drill into a specific National Bank
  - Quick links to National Bank Registration, Global Reserve/Multisig Console, Governance
- **Content sections:** Global reserve summary, National Bank roster table, system-wide stats, pending-governance queue.
- **States to handle:** reserve-ratio warning banner cascaded from any tier below minimum.
- **Data source:** On-chain (reserve/global state) + off-chain projection for aggregates.
- **Links to:** National Bank Registration & Management, Global Reserve & Safe Multisig Console, Governance Parameters & Timelock Voting.

### 40. National Bank Registration & Management
- **Route:** `/bank/world/national-banks`
- **Access:** World Bank Admin
- **Purpose:** Register and manage National Banks (mirrors Local Bank Registration but one tier up).
- **Data displayed:**
  - List of registered National Banks: name, wallet/contract address, jurisdiction, registration date, status, reserve ratio, allocated capital
- **User actions:**
  - Register a new National Bank (on-chain transaction, likely requiring multisig given the tier)
  - Pause/unpause a National Bank
  - Edit National Bank parameters
- **Content sections:** National Bank table, "Register New National Bank" form/modal (with multisig co-sign flow if required), pause/unpause confirmation, edit-parameters modal.
- **States to handle:** multisig co-signature pending state (show who has/hasn't signed, same pattern as Group Consent page); tx status machine.
- **Data source:** On-chain (registry + Safe multisig) + off-chain projection.
- **Links to:** World Bank Admin Dashboard, Global Reserve & Safe Multisig Console.

### 41. Global Reserve & Safe Multisig Console
- **Route:** `/bank/world/multisig`
- **Access:** World Bank Admin
- **Purpose:** Manage the global reserve and the Safe multisig that governs World Bank admin actions.
- **Data displayed:**
  - Global reserve breakdown (by asset, by National Bank allocation)
  - Multisig configuration and current signer set — note: the spec has two different figures for this (2-of-3 per the MVT implementation task, 3-of-5 per the user-taxonomy governance description); confirm which is the actual target before building this and display the real threshold, not a placeholder
  - Pending multisig transactions awaiting co-signature: what the transaction does, who has signed, who's still needed
  - Transaction history (executed multisig actions) with links to the Safe interface/block explorer
- **User actions:**
  - Co-sign a pending transaction (if the current wallet is one of the signers)
  - Propose a new transaction (e.g., allocate global capital, change a system parameter)
  - View/export transaction history
- **Content sections:** Reserve breakdown cards/chart, signer roster, pending-transactions list with signature progress per item, transaction history table.
- **States to handle:** transaction fully signed and ready to execute vs. still collecting signatures (visually distinct states); non-signer viewing (read-only, no sign button shown).
- **Data source:** On-chain (Safe multisig contract + World Bank reserve contract).
- **Links to:** World Bank Admin Dashboard, Governance Parameters & Timelock Voting.

### 42. Governance Parameters & Timelock Voting
- **Route:** `/bank/world/governance`
- **Access:** World Bank Admin (and potentially other tiers with voting rights, depending on final governance design, this is marked "Specified" in the spec, not fully implemented yet)
- **Purpose:** Propose, vote on, and execute (after timelock) system-wide parameter changes.
- **Data displayed:**
  - Active proposals: what's being changed, current parameter vs. proposed, vote tally, time remaining in voting window, timelock countdown if passed
  - Proposal history (executed, rejected, expired)
- **User actions:**
  - Create a new proposal (parameter + new value + justification)
  - Vote on an active proposal (for/against)
  - Execute a passed proposal once its timelock has elapsed
- **Content sections:** Active proposals list/cards with vote tally and countdown, create-proposal form, proposal detail view, proposal history table.
- **States to handle:** voting window closed but timelock not yet elapsed (show execute button as disabled with a countdown); proposal defeated (show final tally and no execute option).
- **Data source:** On-chain (governance/timelock contract).
- **Links to:** World Bank Admin Dashboard.

---

## L. Regulator

### 43. Regulatory Read-Only Audit Portal
- **Route:** `/audit`
- **Access:** Regulatory Authority (A6), read-only
- **Purpose:** Give an external regulator a read-only, audit-oriented view of system activity without any ability to act.
- **Data displayed:**
  - System-wide reserve and solvency data (same as public Reserve Dashboard, but potentially with more granular/non-public detail depending on your access-control design)
  - Audit logs: `LOAN_RISK_ASSESSMENT` rows, `AGENT_ACTION_LOG` entries, RBAC/role changes, SAR records — filterable and exportable
  - Compliance status summary: KYC completion rates, AML alert counts and resolutions, SAR counts by tier
- **User actions:**
  - Filter/search audit logs by date range, entity, event type
  - Export an audit package (encrypted data package per the spec's "read-only audit access via encrypted data package")
  - No write actions of any kind, this must be enforced both in the UI (no buttons) and at the API/RBAC layer
- **Content sections:** Solvency/compliance summary cards, filterable audit log table (tabbed by log type), export action.
- **States to handle:** clearly label this as read-only throughout (e.g., a persistent banner) so there's no ambiguity about capability; large export jobs should show progress rather than blocking the UI.
- **Data source:** Off-chain API (Postgres audit tables) with strict read-only RBAC enforcement.
- **Links to:** none (terminal page for this role).

---

## M. Stretch / Advanced Modules

*(Build these after the core 43 pages above are functional. They correspond to Should/Stretch-priority features in the spec.)*

### 44. Retail FX / Currency Exchange
- **Route:** `/fx`
- **Access:** Retail Client
- **Purpose:** Oracle-priced retail foreign exchange between supported currencies/stablecoins.
- **Data displayed:**
  - Supported currency pairs and current oracle-fed exchange rate
  - Rate refresh/staleness indicator (oracle price feed timestamp)
  - Conversion preview (amount in -> amount out, including any spread/fee)
  - Recent FX transaction history
- **User actions:**
  - Select currency pair, enter amount, review live conversion preview
  - Confirm -> on-chain transaction
- **Content sections:** Currency pair selector, rate display with staleness indicator, conversion calculator, confirm button with tx-status machine, history table.
- **States to handle:** stale/unavailable oracle price (block the transaction with a clear message rather than using an outdated rate).
- **Data source:** On-chain (FXModule contract + Chainlink price feed).
- **Links to:** Current/Checking Account.

### 45. Treasury FX Swap
- **Route:** `/bank/treasury/fx-swap`
- **Access:** National Bank Admin, World Bank Admin
- **Purpose:** Cross-tier treasury-level FX swaps (larger scale than retail FX, institutional counterparties).
- **Data displayed:**
  - Treasury balances by currency/asset per tier
  - Available counterparties (other tiers) and their treasury positions
  - Swap terms preview (rate, amount, settlement)
- **User actions:**
  - Propose a treasury swap (counterparty, amounts, currencies)
  - Approve/counter-sign a proposed swap (if it requires the counterparty's confirmation)
- **Content sections:** Treasury balance summary, swap proposal form, pending-swaps list with confirmation status, swap history table.
- **States to handle:** counterparty hasn't confirmed yet (pending state); tx status machine for settlement.
- **Data source:** On-chain (TreasurySwap contract).
- **Links to:** National/World Bank Dashboard.

### 46. Syndicated Loan / Tranche Management
- **Route:** `/bank/syndicated-loans`
- **Access:** National Bank Admin, World Bank Admin
- **Purpose:** Manage multi-bank co-funded loans (SyndicatedLoan) with senior/junior tranche structures (TranchedPool).
- **Data displayed:**
  - List of syndicated loans: participating banks, total amount, each bank's contribution/tranche (senior/junior), current status
  - Tranche detail: seniority order, risk/return profile per tranche, waterfall payout logic explained
- **User actions:**
  - Propose a new syndicated loan (invite participating banks, define tranches)
  - Commit capital to a specific tranche
  - View payout waterfall on repayment events
- **Content sections:** Syndicated loans table, tranche structure visualization (as data, e.g., a table of tranches with seniority/amount/rate, not a design mockup), propose-new-loan form, commit-capital action.
- **States to handle:** tranche under-subscribed (not all committed capital raised yet, show progress); waterfall payout in progress (show which tranche is currently being paid).
- **Data source:** On-chain (SyndicatedLoan + TranchedPool contracts).
- **Links to:** National/World Bank Dashboard.

### 47. Liquidation Monitor
- **Route:** `/bank/liquidations`
- **Access:** Local Bank Approver, National Bank Admin (monitoring); effectively also relevant to any liquidator actor if you expose a public liquidation interface
- **Purpose:** Monitor collateralized loans by health factor and manage the liquidation process for positions that fall below the threshold.
- **Data displayed:**
  - List of at-risk positions sorted by health factor (ascending, most at-risk first), each showing: borrower (masked per policy), collateral value, loan value, current HF, liquidator bonus (5-8%) if triggered
  - For group loans: pool-level shared credit exposure instead of individual liquidation
  - For individual retail clients: note that at HF < 1.0, the response is an SBT downgrade and reduced lending score rather than direct collateral seizure, per the spec's actual liquidation design, reflect that behavior accurately rather than depicting a generic seizure flow
- **User actions:**
  - Filter/sort by health factor, loan type, amount
  - Trigger/execute a liquidation event where the contract logic calls for it
  - View the outcome (SBT downgrade confirmation, or collateral-based liquidation result depending on loan type)
- **Content sections:** At-risk positions table with HF gauge per row, position detail panel, liquidation action button with confirmation + tx-status machine, outcome confirmation.
- **States to handle:** HF hovering near 1.0 (visually flag as "watch" vs. already below threshold as "actionable"); liquidation already executed by someone else (avoid double-processing, refresh state before allowing action).
- **Data source:** On-chain (LiquidationEngine contract) + off-chain projection for the sortable/filterable list.
- **Links to:** Loan Detail (per position).

---

## Build-Order Recommendation

Since you're feeding this to Cursor page-by-page, building in this order will keep every page you build immediately testable against something that already exists, matching your own Phase I-IV plan:

1. **Foundation first (Group A + login):** pages 1-4, plus a bare-bones Client Dashboard (10) so you have somewhere to land after login.
2. **Onboarding (Group B):** pages 5-9, since nothing else works without an account.
3. **Core lending loop (Groups C-D):** pages 10-18, this is the heart of the MVT.
4. **Identity (Group G) and Deposits (Group F):** pages 26, 23-25, these are self-contained and don't block lending.
5. **Bank-side operations (Group I):** pages 29-34, needed to actually approve the loans clients submit in step 3.
6. **Group lending (Group E):** pages 19-22, layer on once solo lending works end-to-end.
7. **Agent & support (Group H):** pages 27-28, per your own plan this is Phase III.
8. **National/World admin, regulator (Groups J-L):** pages 35-43, these round out the hierarchy but aren't needed for a single-branch demo.
9. **Stretch modules (Group M):** pages 44-47, last, and only if time allows.

---

**Next step (per your instruction):** once you're ready, tell me which page(s) you want prototyped first and I'll generate the visual design for those, one at a time.
