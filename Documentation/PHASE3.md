# Phase III — Gate G3 (ML oracle + agent)

Phase III adds the **RF + IF + SHAP** pipeline, **commit–reveal risk oracle** on `LoanController`, and the **agent tool server** with confirmation gates.

## Gate G3 checklist

| Item | Status |
|------|--------|
| FastAPI `/v1/score` + `/v1/brief` | `npm run ml:dev` |
| Commit–reveal before `approveLoan` | `LoanController.sol` + `POST /api/oracle/commit-reveal` |
| Authority Brief (ML-backed) | `GET /api/brief/:loanId` |
| Agent tools (3 read + 1 write) | `GET /api/agent/tools`, `POST /api/agent/message` |
| Prompt injection scan | `POST /api/ai/chat/stream`, `/api/agent/message` |
| Three-tier prompt constructor | `backend/src/prompt/threeTier.ts` |

## Quick start

```bash
# Terminal 1 — chain
npm run node:chain

# Terminal 2 — deploy + verify G3
npm run phase3:local

# Terminal 3 — ML service
npm run ml:dev

# Terminal 4 — app
npm run dev
```

## Oracle flow (approver)

1. Borrower requests loan on-chain.
2. Approver opens **Approvals** → **Score & commit oracle** (calls ML + on-chain reveal).
3. **Approve on-chain** is enabled only after `SCORE_REVEALED`.

## Agent demo (borrower)

1. Open **AI Assistant** or use chatbot: “apply for a 0.05 ETH loan”.
2. Confirm the write action in the modal.
3. Loan appears in the approver queue.

## Environment

```bash
ORACLE_PRIVATE_KEY=   # Hardhat account #3 for localhost (set by sync:env)
LLM_BASE_URL=http://127.0.0.1:11434
LLM_MODEL=qwen3:8b
ML_SERVICE_URL=http://localhost:8000
```

Optional: run `python ml-service/scripts/train_mini.py --csv data/bccc.csv` for BCCC-trained artifacts in `ml-service/artifacts/`.
