#!/usr/bin/env python3
"""Wire v29 mermaid-pdf diagrams into Pre-thesis_v29_test.tex"""
from pathlib import Path

TEX = Path(__file__).parent / "Pre-thesis_v29_test.tex"

FIG = lambda pdf, cap, label: f"""
\\begin{{figure}}[H]
\\centering
\\OnePageDiagram{{{pdf}}}
\\caption{{{cap}}}
\\label{{{label}}}
\\end{{figure}}
"""

def main():
    c = TEX.read_text(encoding="utf-8")

    # --- graphicspath ---
    c = c.replace(
        r"""\graphicspath{%
  {./}%
  {Tables/}%
  {Diagrams/mermaid-pdf/improved diagrams/}%  v15 redesigned diagrams (preferred)
  {Diagrams/mermaid-pdf/}%                    v13/v14 rendered fallbacks
  {Diagrams/}%
  {Diagrams/CSE370/}{Diagrams/CSE471/}{Diagrams/CSE470/}%
}""",
        r"""\graphicspath{%
  {mermaid-pdf/}%                                    % v29 diagrams (compile from this folder)
  {v29/mermaid-pdf/}%                               % v29 diagrams (compile from Improvements/)
  {../Diagrams/mermaid-pdf/improved diagrams/}%     % legacy fallback
  {./}%
  {Tables/}%
  {../Tables/}%
  {../Diagrams/mermaid-pdf/}%
  {../Diagrams/}%
  {Diagrams/mermaid-pdf/improved diagrams/}%
  {Diagrams/mermaid-pdf/}%
  {Diagrams/}%
  {Diagrams/CSE370/}{Diagrams/CSE471/}{Diagrams/CSE470/}%
}""",
    )

    c = c.replace(
        r"  \IfFileExists{Tables/#2}{%",
        r"  \IfFileExists{mermaid-pdf/#2}{%"
        r"    \@thesis@doinclude{#1}{mermaid-pdf/#2}}{%"
        r"  \IfFileExists{v29/mermaid-pdf/#2}{%"
        r"    \@thesis@doinclude{#1}{v29/mermaid-pdf/#2}}{%"
        r"  \IfFileExists{Tables/#2}{%",
    )

    # --- prose fixes ---
    c = c.replace(
        "Figure~\\ref{fig:component-diagram} shows the component interactions across these three layers. The diagram reflects the current three-contract prototype view; the nine-contract target architecture is specified in Appendix~B and will be reflected in an updated diagram in the final thesis phase.",
        "Figure~\\ref{fig:component-diagram} shows component interactions across the four-layer stack: three core contracts are implemented (World Bank Reserve, National Bank, Local Bank); the fifteen-contract target architecture (three live, twelve planned) is visualised with solid versus dashed boundaries.",
    )
    c = c.replace(
        "L1 settlement (Polygon~PoS for retail, Ethereum~Sepolia for institutional",
        "L1 settlement (Polygon~zkEVM~Cardona for retail, Ethereum~Sepolia for institutional",
    )
    c = c.replace(
        "The conclusion is that Polygon PoS provides a practical balance",
        "The conclusion is that Polygon~zkEVM~Cardona provides a practical balance",
    )
    c = c.replace(
        "PostgreSQL schema (all 19 entities)",
        "PostgreSQL schema (all 20 entities)",
    )
    c = c.replace(
        """The diagram placeholder for this architecture (Figure pending): \\texttt{oracle\\_architecture.png}---Chainlink Functions DON $\\to$ score commitment $\\to$ on-chain LoanController.


\\section{Data Model""",
        """Figure~\\ref{fig:oracle-architecture} summarises the oracle architecture: Chainlink Functions DON as the primary path for ML risk-score commitment; commit-reveal FastAPI relay as prototype fallback; Chainlink Automation, Price Feeds, and Proof of Reserve as auxiliary services.
""" + FIG(
            "fig-oracle-architecture.pdf",
            "Oracle architecture: Chainlink Functions DON as the primary path for ML risk-score commitment to \\texttt{LoanController}; commit-reveal FastAPI relay as prototype fallback; Chainlink Automation, Price Feeds, and Proof of Reserve as auxiliary oracle services.",
            "fig:oracle-architecture",
        )
        + """

\\section{Data Model""",
    )
    c = c.replace(
        r"\OnePageDiagram{fig-erd-core.pdf}" + "\n\\caption{Core system graph",
        r"\OnePageDiagram{fig-core-system-graph.pdf}" + "\n\\caption{Core system graph",
        1,
    )
    c = c.replace(
        "Smart-contract security controls applied in v15:",
        "Smart-contract security controls in the v29 architecture:",
    )
    c = c.replace(
        "(b) AI chatbot pipeline (ChromaDB top-$k$ retrieval, QLoRA-tuned LLM, hallucination guard, citation-anchored answer).",
        "(b) autonomous banking agent pipeline (SSE, three-tier prompt assembly, MCP tool server, HTTP~403 confirmation gate, EIP-7702 session-key signing, \\texttt{AGENT\\_ACTION\\_LOG} audit).",
    )
    inserts = [
        (
            "\\item \\textbf{Tier 4 --- Clients (Retail):}",
            FIG(
                "fig-proposed-solution-overview.pdf",
                "Proposed solution overview: four institutional tiers (T1--T4), six core banking functions, and multi-entity extensions (syndicated lending, group pools, interbank and upward facilities).",
                "fig:proposed-solution",
            ),
            1,
        ),
        (
            "These four mechanisms together provide a complete answer:",
            FIG(
                "fig-capital-flow-directions.pdf",
                "Capital flow directions: downward tier allocation, same-tier \\texttt{InterBankLendingPool} liquidity, and upward \\texttt{UpwardDepositFacility} repatriation with asymmetric rates ($r_{\\text{up}} < r_{\\text{down}}-\\delta$).",
                "fig:capital-flow-directions",
            ),
            1,
        ),
        (
            "\\section{Methodology in Brief}\n",
            FIG(
                "fig-methodology-phase-roadmap.pdf",
                "Methodology phase roadmap: pre-thesis~1 requirements and architecture complete; Phase~I--IV deliverables (contracts, MCP agent, Chainlink Functions, Certora/Foundry simulation).",
                "fig:methodology-roadmap",
            ),
            1,
        ),
        (
            "\\label{sec:stablecoin-first}\n\nDenomination matters",
            "\\label{sec:stablecoin-first}\n"
            + FIG(
                "fig-stablecoin-mica-positioning.pdf",
                "Stablecoin-first positioning: USDC numeraire, MiCA/GENIUS regulatory anchors, mBridge/Agora settlement rails, and CWB as a composable lending layer.",
                "fig:stablecoin-mica",
            )
            + "\n\nDenomination matters",
            1,
        ),
        (
            "\\section{Review of Existing Research}\n",
            FIG(
                "fig-prisma-review-flow.pdf",
                "PRISMA-style literature review flow: identification, screening, included studies, and synthesis themes (hierarchy, ML, inclusion, security).",
                "fig:prisma-flow",
            ),
            1,
        ),
        (
            "\\bottomrule\n\\end{tabular}\n\\end{table}\n\nThis comparison directly answers RQ1:",
            "\\bottomrule\n\\end{tabular}\n\\end{table}\n"
            + FIG(
                "fig-protocol-comparison-matrix.pdf",
                "Visual comparison matrix aligned with Table~\\ref{tab:protocol-comparison}: institutional hierarchy, cross-tier flows, ML, and inclusion dimensions.",
                "fig:protocol-matrix",
            )
            + "\n\nThis comparison directly answers RQ1:",
            1,
        ),
        (
            "DeFi naturally provides on-chain transparency",
            FIG(
                "fig-ftx-vs-onchain-reserves.pdf",
                "Conceptual comparison: opaque centralized reserve reporting versus on-chain Proof of Reserve and tier reserve invariants on CWB.",
                "fig:ftx-vs-por",
            ),
            1,
        ),
        (
            "This piecewise model prevents liquidity crises",
            FIG(
                "fig-kinked-rate-curve.pdf",
                "Kinked utilization-based borrow rate curve: retail kink at 80\\%, interbank pool kink at 90\\%, with parameters $r_0$, $r_1$, $r_2$, and optimal utilization $U^*$.",
                "fig:kinked-rate",
            ),
            1,
        ),
        (
            "matching how Tier~2 institutions actually manage credit risk.\n\n\\section{SavingsVault",
            "matching how Tier~2 institutions actually manage credit risk.\n"
            + FIG(
                "fig-liquidation-engine.pdf",
                "Liquidation engine: four health-factor variants (retail over-collateralized, group pool, credit-based no-collateral, institutional reserve), \\texttt{liquidate()} incentive, and hierarchical queue.",
                "fig:liquidation",
            )
            + "\n\n\\section{SavingsVault",
            1,
        ),
        (
            "Section~\\ref{sec:lit-prisma} cites.\n\n\\section{On-Chain Credit Passport",
            "Section~\\ref{sec:lit-prisma} cites.\n"
            + FIG(
                "fig-savings-vault-loop.pdf",
                "SavingsVault and FixedDeposit closed loop: deposits, lending deployment, interest accrual, and NetInterest split (depositor, insurance fund, protocol); ERC-4626 and ERC-7540 alignment.",
                "fig:savings-vault-loop",
            )
            + "\n\n\\section{On-Chain Credit Passport",
            1,
        ),
        (
            "barrier to sustainable microfinance graduation.\n\n\\section{Cross-Chain Bridge",
            FIG(
                "fig-credit-passport-sbt.pdf",
                "On-chain Credit Passport SBT: schema fields, \\texttt{ICreditPassport.getScore()}, tier schedule link, and non-revocable default record (GDPR note in prose).",
                "fig:credit-passport",
            )
            + "\n\n\\section{Cross-Chain Bridge",
            1,
        ),
        (
            "avoids the consensus problem of cross-chain debt.\n\n\\section{Multi-Entity",
            "avoids the consensus problem of cross-chain debt.\n"
            + FIG(
                "fig-cross-chain-bridge-ccip.pdf",
                "Cross-chain bridge (Chainlink CCIP): permitted messages are reserve-ratio updates and credit-passport SBT mirrors; loan state remains single-chain per client.",
                "fig:bridge-ccip",
            )
            + "\n\n\\section{Multi-Entity",
            1,
        ),
        (
            "until the freeze is lifted by the tier above.\n\\end{enumerate}\n\n\\subsection{Data Flow",
            "until the freeze is lifted by the tier above.\n\\end{enumerate}\n"
            + FIG(
                "fig-activity-sar-aml.pdf",
                "SAR activity flow: Isolation Forest flag $\\to$ \\texttt{AI\\_ML\\_LOG} $\\to$ Kafka \\texttt{aml-alert} $\\to$ compliance officer review $\\to$ optional \\texttt{freezeAccount}.",
                "fig:sar-aml",
            )
            + "\n\n\\subsection{Data Flow",
            1,
        ),
        (
            r"\label{fig:seq-aichatbot}" + "\n\\end{figure}\n\n\\subsection{Four-Tier",
            r"\label{fig:seq-aichatbot}" + "\n\\end{figure}\n"
            + FIG(
                "fig-seq-agent-confirm-gate.pdf",
                "Confirmation audit middleware: write-tool POST intercepted; HTTP~403 if no confirmation turn in session history (independent of model output).",
                "fig:seq-confirm-gate",
            )
            + "\n\n\\subsection{Four-Tier",
            1,
        ),
        (
            "\\section{Governance Framework}\n\n\\subsection{Network Membership",
            FIG(
                "fig-governance-dual-path.pdf",
                "Governance dual path: standard TimeLock (24--48\\,h) versus Security Council emergency path (4-of-7 multisig).",
                "fig:governance-dual-path",
            ),
            1,
        ),
        (
            "\\end{enumerate}\n\n\\paragraph{MCP tool server",
            "\\end{enumerate}\n"
            + FIG(
                "fig-agent-six-step-pipeline.pdf",
                "Autonomous AI agent six-step pipeline: user message $\\to$ SSE $\\to$ context injection $\\to$ Q\\&A versus action branch $\\to$ human confirmation $\\to$ MCP write $\\to$ transaction monitor.",
                "fig:agent-pipeline",
            )
            + "\n\n\\paragraph{MCP tool server",
            1,
        ),
        (
            "\\end{table}\n\n\\paragraph{Authority Brief UI",
            "\\end{table}\n"
            + FIG(
                "fig-mcp-tool-server.pdf",
                "MCP tool server: nine read and eight write tools grouped by toolsets \\texttt{read\\_only}, \\texttt{loan\\_actions}, and \\texttt{account\\_management}.",
                "fig:mcp-tools",
            )
            + "\n\n\\paragraph{Authority Brief UI",
            1,
        ),
        (
            "Phase~II as a\nprerequisite.}\n\n\\paragraph{Session lineage",
            "Phase~II as a\nprerequisite.}\n"
            + FIG(
                "fig-three-tier-prompt.pdf",
                "Three-tier system prompt assembly: Stable (persona, tool schema, compliance), Context (rates, KYC matrix, skills), and Volatile (on-chain JSON, session history) with prefix-cache note.",
                "fig:three-tier-prompt",
            )
            + "\n\n\\paragraph{Session lineage",
            1,
        ),
        (
            "\\paragraph{Lifecycle hook middleware",
            FIG(
                "fig-lifecycle-hook-middleware.pdf",
                "Lifecycle hook middleware chain: prompt injection scan $\\to$ confirmation audit (Phase~II) $\\to$ EIP-7702 session scope (Phase~III) $\\to$ AML pre-check (Phase~IV).",
                "fig:lifecycle-middleware",
            ),
            1,
        ),
        (
            "feeds directly into the RQ5 evaluation.\n\n\\paragraph{Simulation script design.}",
            "feeds directly into the RQ5 evaluation.\n"
            + FIG(
                "fig-abm-simulation-manifest.pdf",
                "On-chain economic feasibility simulation: 300 clients, six banks, deterministic SEED=42, manifest JSON output for RQ4/RQ5 evaluation.",
                "fig:abm-sim",
            )
            + "\n\n\\paragraph{Simulation script design.}",
            1,
        ),
        (
            "\\label{sec:funnel}\n\nThe platform's retail",
            "\\label{sec:funnel}\n"
            + FIG(
                "fig-five-stage-retail-funnel.pdf",
                "Five-stage retail conversion funnel: browse $\\to$ ERC-4337 account $\\to$ KYC $\\to$ first USDC loan $\\to$ optional power user (crypto complexity revealed last).",
                "fig:five-stage-funnel",
            )
            + "\n\nThe platform's retail",
            1,
        ),
        (
            "Future Work section of the Conclusion.\n\n\\section{Bangladesh Regulatory",
            "Future Work section of the Conclusion.\n"
            + FIG(
                "fig-mica-genius-compliance-map.pdf",
                "MiCA and GENIUS Act compliance mapping: EMT requirements to CWB stablecoin pools, Chainlink Proof of Reserve, and \\texttt{audit\\_logs}.",
                "fig:mica-genius",
            )
            + "\n\n\\section{Bangladesh Regulatory",
            1,
        ),
        (
            "prototype operates on public testnets only (Section~\\ref{sec:bangladesh-reg}).\n\n\\begin{description}",
            "prototype operates on public testnets only (Section~\\ref{sec:bangladesh-reg}).\n"
            + FIG(
                "fig-sylhet-accessibility-journey.pdf",
                "Accessibility journey (rural Sylhet use case): mobile access $\\to$ Bengali-capable agent $\\to$ USDC-denominated loan $\\to$ human confirmation gate.",
                "fig:accessibility-journey",
            )
            + "\n\n\\begin{description}",
            1,
        ),
        (
            "\\paragraph{Architecture diagram.}\nFigure~\\ref{fig:local-llm-mermaid} shows the compact end-to-end request path; Figure~\\ref{fig:local-llm-tikz} expands",
            FIG(
                "fig-agent-safety-four-layers.pdf",
                "Autonomous agent safety architecture: (1)~tool-schema boundary, (2)~human confirmation gate, (3)~EIP-7702 session key scope, (4)~prompt injection scanning and lifecycle middleware.",
                "fig:agent-safety-layers",
            )
            + "\n\\paragraph{Architecture diagram.}\nFigure~\\ref{fig:agent-safety-layers} summarises the four-level safety posture. Figure~\\ref{fig:local-llm-mermaid} shows the compact end-to-end request path; Figure~\\ref{fig:local-llm-expanded} expands",
            1,
        ),
        (
            r"\label{fig:local-llm-tikz}" + "\n\\end{figure}\n\n\\paragraph{Implementation analysis (brief).}",
            r"\label{fig:local-llm-expanded}" + "\n\\end{figure}\n"
            + FIG(
                "fig-eip7702-session-scope.pdf",
                "EIP-7702 session key scope: approved tool list, 500~USDC per-transaction cap, 24-hour TTL, and revocation.",
                "fig:eip7702-scope",
            )
            + "\n\n\\paragraph{Implementation analysis (brief).}",
            1,
        ),
        (
            "throughout the following sections.\n\n\\section{High-Level Architecture}",
            "throughout the following sections.\n"
            + FIG(
                "fig-prototype-scope-matrix.pdf",
                "Prototype scope matrix: implementation status (\\tmarkDone{}, \\tmarkPartial{}, \\tmarkPlanned{}) for major platform features.",
                "fig:prototype-scope",
            )
            + "\n\n\\section{High-Level Architecture}",
            1,
        ),
    ]

    for anchor, block, count in inserts:
        if anchor not in c:
            raise SystemExit(f"MISSING ANCHOR: {anchor[:80]!r}...")
        c = c.replace(anchor, anchor + block, count)

    TEX.write_text(c, encoding="utf-8")
    print(f"Updated {TEX}")

if __name__ == "__main__":
    main()
