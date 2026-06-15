🎙️ Speaking Script (~5 minutes)
Controls: Arrow keys, Spacebar, or click anywhere to advance. Left arrow to go back.

Slide 1 — Title
"Hi everyone — I'm [your name], and together with [partner], we're presenting our Pre-Thesis 1 project: the Decentralized Crypto World Bank. It's a blockchain-based institutional finance platform, and today we're covering Chapters 1 and 2 — our introduction and literature review."

Slide 2 — What Are We Building?
"So what exactly is this? It's a four-tier hierarchical lending system on blockchain. Think of it like a World Bank — but programmable and fully transparent. At the top is a World Bank Reserve, then National Banks, then Local Banks, and at the bottom are retail clients. Capital flows down through this hierarchy, and everything — reserve checks, loan approvals, repayments — is enforced automatically by smart contracts. We also have an AI layer that detects fraud and explains credit decisions. No existing DeFi protocol does all of this together."

Slide 3 — Background
"Now why does this need to exist? Cross-border payments today cost an average of 42 dollars and take 2 to 5 business days. Global remittance fees eat up 48 to 56 billion dollars a year. There are 1.4 billion unbanked adults. And there's a 4.5 trillion dollar annual financing gap for small businesses. Meanwhile, DeFi has proven that lending can be automated transparently — but existing DeFi is completely flat. Aave, Compound, MakerDAO — none of them have any institutional hierarchy. That's the gap."

Slide 4 — Rationale
"The rationale for our study comes from three forces. First — traditional development finance has long-standing inefficiencies: slow settlements, opaque reserves. Second — existing DeFi has no multi-tier structure, no deposit mobilization, no solidarity group lending. And third — combining blockchain's auditability with lightweight AI could give us genuinely better operational governance. This combination hasn't been explored before in any published work."

Slide 5 — Problem Statement
"When we map out the specific problems, there are six. Lack of real-time transparency in reserves. Slow and costly cross-border settlements with capital sitting idle. Inconsistent risk evaluation — borrowers re-evaluated from scratch at every tier. Barriers to institutional trust, especially in developing countries. No programmable savings products with visible yields. And no on-chain group credit mechanism for borrowers who lack individual collateral."

Slide 6 — Objectives
"To address those problems, we have five objectives. Design and specify the four-tier lending architecture on blockchain. Specify a banking product suite — deposits, savings, group lending. Investigate the AI/ML analytics layer with Random Forest, Isolation Forest, and SHAP. Specify transparent lending processes via smart contracts. And plan testnet deployment to validate all of it."

Slide 7 — Methodology
"For methodology, we're using a lightweight Agile approach, mapped to a standard SDLC. This pre-thesis covers planning, requirements, and design. The actual implementation runs across four phases in the final thesis. Phase 1 builds the contract hierarchy and database. Phase 2 implements the full loan lifecycle. Phase 3 wires the AI/ML oracle pipeline. And Phase 4 is formal verification and deployment on testnet."

Slide 8 — Scope & Challenges
"In terms of scope — we're formally specifying everything in this pre-thesis, with implementation planned for the final thesis. We're using public testnets only, no real money at any stage. The key challenges are: limited labeled DeFi fraud data for training, regulatory uncertainty across jurisdictions, managing gas costs in a complex multi-tier system, and ensuring the platform earns enough interest revenue to remain sustainable."

Slide 9 — Literature Review
"For our literature review, we used a PRISMA-style systematic approach. Starting from 892 records across 6 databases, we screened down to 114 full-text sources, added 17 grey literature documents, and ended up with 131 total references. We covered eight major areas — from DeFi mechanics and ML fraud detection, all the way to smart contract security, microfinance group lending, and recent regulations like MiCA and the GENIUS Act."

Slide 10 — Key Findings
"What did the literature tell us? Five big things. Werner et al confirmed that all DeFi is flat and pool-based — no hierarchy exists, which is exactly our contribution. Palaiokrassas et al showed behavioral ML features push F1 scores from 0.08 to 0.85 for DeFi fraud detection. Adom et al showed SHAP gives more consistent and trustworthy explanations than LIME for lending decisions — that's why we use it. IMF research confirmed two-tier hierarchical distribution is the preferred institutional design. And the Sygnum 2026 report confirmed that structured governance — not just technology — is what institutional DeFi is actually missing."

Slide 11 — Thank You
"So to wrap up — the Crypto World Bank addresses a real coordination and trust problem in development finance, using blockchain as the right tool for the job. Our literature review confirms there's genuine architectural novelty in our approach. In our next video, we'll cover Chapters 3 and 4 — the full system architecture, smart contract design, and our implementation plan. Thank you."