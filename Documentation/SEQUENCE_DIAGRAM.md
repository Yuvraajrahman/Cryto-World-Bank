# Sequence Diagrams
## Crypto World Bank System

---

### Sequence Diagram 1: Loan Request, AI Risk Check, and Approval Decision

> **UML Fragments used:** This flow contains an **alt [Approve / Reject]** fragment at the approver decision point (step 36). The Approve path is shown below (steps 36–50). The Reject path is shown in **Diagram 1B**. A **loop** for installment payments follows in **Diagram 2**.

```
  Borrower                   Frontend                  MetaMask                LocalBank.sol              Polygon PoS               Backend API              AI/ML Service              Approver UI               Approver Wallet
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │  1. Open DApp            │                         │                        │                         │                         │                         │                         │                         │
     │─────────────────────────>│                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │  2. Click Connect        │                         │                        │                         │                         │                         │                         │                         │
     │     Wallet               │                         │                        │                         │                         │                         │                         │                         │
     │─────────────────────────>│  3. Request             │                        │                         │                         │                         │                         │                         │
     │                          │     accounts            │                        │                         │                         │                         │                         │                         │
     │                          │────────────────────────>│                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │  4. Return              │                        │                         │                         │                         │                         │                         │
     │                          │     wallet address      │                        │                         │                         │                         │                         │                         │
     │                          │<────────────────────────│                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │  5. Enter loan           │                         │                        │                         │                         │                         │                         │                         │
     │     amount: 50 ETH       │                         │                        │                         │                         │                         │                         │                         │
     │     purpose: "Business"  │                         │                        │                         │                         │                         │                         │                         │
     │─────────────────────────>│                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │  6. Check borrowing     │                        │                         │                         │                         │                         │                         │
     │                          │     limit via API       │                        │                         │                         │                         │                         │                         │
     │                          │────────────────────────────────────────────────────────────────────────────>│                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │  7. Return: limit OK    │                        │                         │                         │                         │                         │                         │
     │                          │     6m_remaining: 200   │                        │                         │                         │                         │                         │                         │
     │                          │<────────────────────────────────────────────────────────────────────────────│                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │  8. Prepare unsigned    │                        │                         │                         │                         │                         │                         │
     │                          │     requestLoan(        │                        │                         │                         │                         │                         │                         │
     │                          │       50 ETH,           │                        │                         │                         │                         │                         │                         │
     │                          │       "Business")       │                        │                         │                         │                         │                         │                         │
     │                          │────────────────────────>│                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │  9. MetaMask popup       │                         │                        │                         │                         │                         │                         │                         │
     │     "Confirm tx?"        │                         │                        │                         │                         │                         │                         │                         │
     │     Gas: 0.003 MATIC     │                         │                        │                         │                         │                         │                         │                         │
     │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │  10. User clicks         │                         │                        │                         │                         │                         │                         │                         │
     │      "Confirm"           │                         │                        │                         │                         │                         │                         │                         │
     │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─>│                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │  11. Sign tx with      │                         │                         │                         │                         │                         │
     │                          │                         │      private key       │                         │                         │                         │                         │                         │
     │                          │                         │  12. Broadcast         │                         │                         │                         │                         │                         │
     │                          │                         │      signed tx         │                         │                         │                         │                         │                         │
     │                          │                         │───────────────────────>│                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │  13. require(            │                         │                         │                         │                         │
     │                          │                         │                        │      amount > 0)        │                         │                         │                         │                         │
     │                          │                         │                        │  14. require(            │                         │                         │                         │                         │
     │                          │                         │                        │      purpose != "")      │                         │                         │                         │                         │
     │                          │                         │                        │  15. require(amount      │                         │                         │                         │                         │
     │                          │                         │                        │      <= totalReserve)    │                         │                         │                         │                         │
     │                          │                         │                        │  16. loanCounter++       │                         │                         │                         │                         │
     │                          │                         │                        │  17. Store Loan{         │                         │                         │                         │                         │
     │                          │                         │                        │      id, borrower,       │                         │                         │                         │                         │
     │                          │                         │                        │      amount, purpose,    │                         │                         │                         │                         │
     │                          │                         │                        │      Pending, now, 0}    │                         │                         │                         │                         │
     │                          │                         │                        │  18. userLoans[sender]   │                         │                         │                         │                         │
     │                          │                         │                        │      .push(loanId)       │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │  19. emit                │                         │                         │                         │                         │
     │                          │                         │                        │      LoanRequested(      │                         │                         │                         │                         │
     │                          │                         │                        │      loanId, borrower,   │                         │                         │                         │                         │
     │                          │                         │                        │      amount, purpose)    │                         │                         │                         │                         │
     │                          │                         │                        │────────────────────────>│                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │  20. Block               │                         │                         │                         │
     │                          │                         │                        │                         │      validated           │                         │                         │                         │
     │                          │                         │                        │                         │      (~2 sec)            │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │  21. Tx confirmed       │                        │                         │                         │                         │                         │                         │
     │                          │      hash: 0xabc...     │                        │                         │                         │                         │                         │                         │
     │                          │<────────────────────────────────────────────────────────────────────────────│                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │  22. "Loan Requested     │                         │                        │                         │                         │                         │                         │                         │
     │       Successfully!"     │                         │                        │                         │                         │                         │                         │                         │
     │<─────────────────────────│                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │  23. Event listener      │                         │                         │                         │
     │                          │                         │                        │                         │      detects event       │                         │                         │                         │
     │                          │                         │                        │                         │─────────────────────────>│                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │  24. INSERT INTO         │                         │                         │
     │                          │                         │                        │                         │                         │      LOAN_REQUEST        │                         │                         │
     │                          │                         │                        │                         │                         │      (off-chain DB)      │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │  25. Trigger AI/ML       │                         │                         │
     │                          │                         │                        │                         │                         │      risk assessment     │                         │                         │
     │                          │                         │                        │                         │                         │────────────────────────>│                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │  26. Extract features:   │                         │
     │                          │                         │                        │                         │                         │                         │      - loan amount       │                         │
     │                          │                         │                        │                         │                         │                         │      - borrower history  │                         │
     │                          │                         │                        │                         │                         │                         │      - wallet age        │                         │
     │                          │                         │                        │                         │                         │                         │      - tx frequency      │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │  27. Random Forest       │                         │
     │                          │                         │                        │                         │                         │                         │      predict(features)   │                         │
     │                          │                         │                        │                         │                         │                         │      → fraud_score: 0.12 │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │  28. SHAP explain(        │                         │
     │                          │                         │                        │                         │                         │                         │      prediction)         │                         │
     │                          │                         │                        │                         │                         │                         │      → top features      │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │  29. Isolation Forest    │                         │
     │                          │                         │                        │                         │                         │                         │      anomaly_score: -0.3 │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │  30. Return:             │                         │                         │
     │                          │                         │                        │                         │                         │      fraud_score: 0.12   │                         │                         │
     │                          │                         │                        │                         │                         │      anomaly: normal     │                         │                         │
     │                          │                         │                        │                         │                         │      shap_features: [...] │                         │                         │
     │                          │                         │                        │                         │                         │<────────────────────────│                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │  31. INSERT INTO         │                         │                         │
     │                          │                         │                        │                         │                         │      AI_ML_SECURITY_LOG  │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │  32. Approver            │                         │
     │                          │                         │                        │                         │                         │                         │      opens pending       │                         │
     │                          │                         │                        │                         │                         │                         │      loans page          │                         │
     │                          │                         │                        │                         │                         │                         │─────────────────────────>│                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │  33. GET /loans/pending  │                         │                         │
     │                          │                         │                        │                         │                         │      + risk scores       │                         │                         │
     │                          │                         │                        │                         │                         │<─────────────────────────────────────────────────────│                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │  34. Return loan list    │                         │                         │
     │                          │                         │                        │                         │                         │      with risk data      │                         │                         │
     │                          │                         │                        │                         │                         │─────────────────────────────────────────────────────>│                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │  35. Display:            │
     │                          │                         │                        │                         │                         │                         │                         │      Loan #5: 50 ETH     │
     │                          │                         │                        │                         │                         │                         │                         │      Risk: LOW (0.12)    │
     │                          │                         │                        │                         │                         │                         │                         │      SHAP: amount ↓      │
     │                          │                         │                        │                         │                         │                         │                         │            history ↑     │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │  36. Click "Approve"     │
     │                          │                         │                        │                         │                         │                         │                         │─────────────────────────>│
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │  37. Sign
     │                          │                         │                        │                         │                         │                         │                         │                         │      approveLoan(5)
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │  38. require(            │                         │                         │                         │                         │
     │                          │                         │                        │      onlyApprover)       │                         │                         │                         │                         │
     │                          │                         │                        │  39. require(            │                         │                         │                         │                         │
     │                          │                         │                        │      status==Pending)    │                         │                         │                         │                         │
     │                          │                         │                        │  40. require(            │                         │                         │                         │                         │
     │                          │                         │                        │      balance>=amount)    │                         │                         │                         │                         │
     │                          │                         │                        │  41. loan.status =       │                         │                         │                         │                         │
     │                          │                         │                        │      Approved            │                         │                         │                         │                         │
     │                          │                         │                        │  42. loan.approvedAt =   │                         │                         │                         │                         │
     │                          │                         │                        │      block.timestamp     │                         │                         │                         │                         │
     │                          │                         │                        │  43. totalReserve -=     │                         │                         │                         │                         │
     │                          │                         │                        │      loan.amount         │                         │                         │                         │                         │
     │                          │                         │                        │  44. Transfer 50 ETH     │                         │                         │                         │                         │
     │                          │                         │                        │      to borrower.call    │                         │                         │                         │                         │
     │                          │                         │                        │      {value: amount}     │                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │  45. 50 ETH received     │                         │                        │  46. emit                │                         │                         │                         │                         │
     │      in wallet           │                         │                        │      LoanApproved(       │                         │                         │                         │                         │
     │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│      5, borrower, 50)    │                         │                         │                         │                         │
     │                          │                         │                        │────────────────────────>│                         │                         │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
     │                          │                         │                        │                         │  47. Event listener      │                         │                         │                         │
     │                          │                         │                        │                         │─────────────────────────>│  48. UPDATE              │                         │                         │
     │                          │                         │                        │                         │                         │      LOAN_REQUEST        │                         │                         │
     │                          │                         │                        │                         │                         │      status='approved'   │                         │                         │
     │                          │                         │                        │                         │                         │  49. INSERT INTO         │                         │                         │
     │                          │                         │                        │                         │                         │      TRANSACTION         │                         │                         │
     │                          │                         │                        │                         │                         │  50. UPDATE              │                         │                         │
     │                          │                         │                        │                         │                         │      BORROWING_LIMIT     │                         │                         │
     │                          │                         │                        │                         │                         │                         │                         │                         │
```

> **UML Fragments:** Steps 36–50 above show the **[Approve]** path of an **alt [Approve / Reject]** fragment. The **[Reject]** alternative is shown in Diagram 1B below. A **loop** fragment for installment repayments follows in Diagram 2.

---

### Sequence Diagram 1B: Reject Path — alt [Reject]

> Continues from step 35 of Diagram 1 (approver reviews loan with AI risk data). This shows the alternative path where the approver **rejects** the loan request.

```
  ┌── alt ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ [Reject]                                                                                                                                                   │
  │                                                                                                                                                            │
  │  Approver UI               Approver Wallet           LocalBank.sol             Polygon PoS              Backend API              Frontend (→Borrower)      │
  │     │                         │                        │                         │                        │                         │                        │
  │     │  36b. Click "Reject"    │                        │                         │                        │                         │                        │
  │     │  Enter reason:          │                        │                         │                        │                         │                        │
  │     │  "High fraud risk"      │                        │                         │                        │                         │                        │
  │     │────────────────────────>│                        │                         │                        │                         │                        │
  │     │                         │                        │                         │                        │                         │                        │
  │     │                         │  37b. Sign             │                         │                        │                         │                        │
  │     │                         │  rejectLoan(5,         │                         │                        │                         │                        │
  │     │                         │  "High fraud risk")    │                         │                        │                         │                        │
  │     │                         │───────────────────────>│                         │                        │                         │                        │
  │     │                         │                        │                         │                        │                         │                        │
  │     │                         │                        │  38b. require(           │                        │                         │                        │
  │     │                         │                        │      onlyApprover)       │                        │                         │                        │
  │     │                         │                        │  39b. require(           │                        │                         │                        │
  │     │                         │                        │      status==Pending)    │                        │                         │                        │
  │     │                         │                        │  40b. loan.status =      │                        │                         │                        │
  │     │                         │                        │      Rejected            │                        │                         │                        │
  │     │                         │                        │  41b. loan.rejectedAt =  │                        │                         │                        │
  │     │                         │                        │      block.timestamp     │                        │                         │                        │
  │     │                         │                        │                         │                        │                         │                        │
  │     │                         │                        │  42b. emit               │                        │                         │                        │
  │     │                         │                        │      LoanRejected(       │                        │                         │                        │
  │     │                         │                        │      5, borrower, 50,    │                        │                         │                        │
  │     │                         │                        │      "High fraud risk")  │                        │                         │                        │
  │     │                         │                        │────────────────────────>│                        │                         │                        │
  │     │                         │                        │                         │                        │                         │                        │
  │     │                         │                        │                         │  43b. Event listener    │                         │                        │
  │     │                         │                        │                         │      detects event      │                         │                        │
  │     │                         │                        │                         │───────────────────────>│                         │                        │
  │     │                         │                        │                         │                        │                         │                        │
  │     │                         │                        │                         │                        │  44b. UPDATE             │                        │
  │     │                         │                        │                         │                        │      LOAN_REQUEST        │                        │
  │     │                         │                        │                         │                        │      status='rejected'   │                        │
  │     │                         │                        │                         │                        │      rejected_reason=    │                        │
  │     │                         │                        │                         │                        │      "High fraud risk"   │                        │
  │     │                         │                        │                         │                        │                         │                        │
  │     │                         │                        │                         │                        │  45b. Push notification  │                        │
  │     │                         │                        │                         │                        │─────────────────────────>│                        │
  │     │                         │                        │                         │                        │                         │                        │
  │     │                         │                        │                         │                        │                         │  46b. Display:           │
  │     │                         │                        │                         │                        │                         │      "Loan #5 Rejected"  │
  │     │                         │                        │                         │                        │                         │      Reason: High fraud  │
  │     │                         │                        │                         │                        │                         │      risk                │
  │     │                         │                        │                         │                        │                         │                        │
  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Sequence Diagram 2: Installment Payment Loop

> After a loan is approved (Diagram 1, steps 36–50), the borrower repays through installments. This diagram uses a **loop** fragment to show the repeating payment cycle and an **opt** fragment for the loan completion check.

```
  Borrower                   Frontend                  MetaMask                LocalBank.sol              Polygon PoS               Backend API
     │                          │                         │                        │                         │                         │
     │  1. Open "My Loans"      │                         │                        │                         │                         │
     │─────────────────────────>│                         │                        │                         │                         │
     │                          │  2. GET /loans/active    │                        │                         │                         │
     │                          │     + installments       │                        │                         │                         │
     │                          │────────────────────────────────────────────────────────────────────────────>│
     │                          │  3. Return loan list     │                        │                         │                         │
     │                          │     with schedule        │                        │                         │                         │
     │                          │<────────────────────────────────────────────────────────────────────────────│
     │                          │                         │                        │                         │                         │
     │  4. Display loan with    │                         │                        │                         │                         │
     │     installment progress │                         │                        │                         │                         │
     │     (X of Y paid)        │                         │                        │                         │                         │
     │<─────────────────────────│                         │                        │                         │                         │
     │                          │                         │                        │                         │                         │
  ┌── loop [For each installment until loan is fully repaid] ──────────────────────────────────────────────────────────────────────────┐
  │  │                          │                         │                        │                         │                         │  │
  │  │  5. Select next due      │                         │                        │                         │                         │  │
  │  │     installment          │                         │                        │                         │                         │  │
  │  │─────────────────────────>│                         │                        │                         │                         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  │  6. Click "Pay           │                         │                        │                         │                         │  │
  │  │     Installment"         │                         │                        │                         │                         │  │
  │  │─────────────────────────>│                         │                        │                         │                         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  │                          │  7. Prepare unsigned     │                        │                         │                         │  │
  │  │                          │     payInstallment(      │                        │                         │                         │  │
  │  │                          │       loanId,            │                        │                         │                         │  │
  │  │                          │       installmentNo)     │                        │                         │                         │  │
  │  │                          │────────────────────────>│                        │                         │                         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  │  8. MetaMask popup       │                         │                        │                         │                         │  │
  │  │     "Pay 10 ETH?"        │                         │                        │                         │                         │  │
  │  │     Gas: 0.002 MATIC     │                         │                        │                         │                         │  │
  │  │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│                        │                         │                         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  │  9. User clicks          │                         │                        │                         │                         │  │
  │  │     "Confirm"            │                         │                        │                         │                         │  │
  │  │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─>│                        │                         │                         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  │                          │                         │  10. Sign & broadcast   │                         │                         │  │
  │  │                          │                         │───────────────────────>│                         │                         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  │                          │                         │                        │  11. require(            │                         │  │
  │  │                          │                         │                        │      installment exists  │                         │  │
  │  │                          │                         │                        │      & status=pending)   │                         │  │
  │  │                          │                         │                        │  12. require(            │                         │  │
  │  │                          │                         │                        │      msg.value ==        │                         │  │
  │  │                          │                         │                        │      installmentAmount)  │                         │  │
  │  │                          │                         │                        │  13. Mark installment    │                         │  │
  │  │                          │                         │                        │      as paid             │                         │  │
  │  │                          │                         │                        │  14. totalRepaid +=      │                         │  │
  │  │                          │                         │                        │      amount              │                         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  │                          │                         │                        │  15. emit                │                         │  │
  │  │                          │                         │                        │      InstallmentPaid(    │                         │  │
  │  │                          │                         │                        │      loanId, number,     │                         │  │
  │  │                          │                         │                        │      amount)             │                         │  │
  │  │                          │                         │                        │────────────────────────>│                         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  │                          │                         │                        │                         │  16. Event listener      │  │
  │  │                          │                         │                        │                         │      detects event       │  │
  │  │                          │                         │                        │                         │─────────────────────────>│  │
  │  │                          │                         │                        │                         │                         │  │
  │  │                          │                         │                        │                         │  17. UPDATE INSTALLMENT  │  │
  │  │                          │                         │                        │                         │      status='paid'       │  │
  │  │                          │                         │                        │                         │  18. INSERT INTO         │  │
  │  │                          │                         │                        │                         │      TRANSACTION         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  │                          │  19. Tx confirmed        │                        │                         │                         │  │
  │  │                          │<────────────────────────────────────────────────────────────────────────────│                         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  │  20. "Installment Paid!" │                         │                        │                         │                         │  │
  │  │     Progress: X of Y     │                         │                        │                         │                         │  │
  │  │<─────────────────────────│                         │                        │                         │                         │  │
  │  │                          │                         │                        │                         │                         │  │
  │  ┌── opt [All installments paid] ─────────────────────────────────────────────────────────────────────────────────────────────────┐  │
  │  │  │                          │                         │                        │                         │                      │  │
  │  │  │                          │                         │                        │  21. loan.status =      │                      │  │
  │  │  │                          │                         │                        │      Repaid             │                      │  │
  │  │  │                          │                         │                        │  22. emit               │                      │  │
  │  │  │                          │                         │                        │      LoanFullyRepaid(   │                      │  │
  │  │  │                          │                         │                        │      loanId, borrower)  │                      │  │
  │  │  │                          │                         │                        │───────────────────────>│                      │  │
  │  │  │                          │                         │                        │                         │                      │  │
  │  │  │                          │                         │                        │                         │  23. UPDATE           │  │
  │  │  │                          │                         │                        │                         │      LOAN_REQUEST     │  │
  │  │  │                          │                         │                        │                         │      status='repaid'  │  │
  │  │  │                          │                         │                        │                         │  24. UPDATE           │  │
  │  │  │                          │                         │                        │                         │      BORROWING_LIMIT  │  │
  │  │  │                          │                         │                        │                         │      (increase)       │  │
  │  │  │                          │                         │                        │                         │                      │  │
  │  │  │  25. "Loan Fully         │                         │                        │                         │                      │  │
  │  │  │       Repaid!"           │                         │                        │                         │                      │  │
  │  │  │<─────────────────────────│                         │                        │                         │                      │  │
  │  │  │                          │                         │                        │                         │                      │  │
  │  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
  │  │                          │                         │                        │                         │                         │  │
  └── end loop ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
     │                          │                         │                        │                         │                         │
```
