#!/usr/bin/env python3
"""Add ACM-style access dates and apply verified reference fixes."""
import re
from pathlib import Path

TEX = Path(__file__).resolve().parent / "Pre-thesis_v30_final.tex"
ACCESS = "June~9, 2026"

# Verified fixes: ref_number -> replacement \\item body (without \\item prefix)
FIXES: dict[int, str] = {
    2: (
        r"M.~Bastankhah, V.~Nadkarni, C.~Jin, S.~Kulkarni, and P.~Viswanath, "
        r"``Thinking Fast and Slow: Data-Driven Adaptive DeFi Borrow-Lending Protocol,'' "
        r"in \textit{Proc. 6th Conf. Advances in Financial Technologies (AFT)}, "
        r"LIPIcs, vol.~316, pp.~27:1--27:23, 2024. DOI: \url{https://doi.org/10.4230/LIPIcs.AFT.2024.27}"
    ),
    3: (
        r"G.~Palaiokrassas, S.~Scherrers, I.~Ofeidis, and L.~Tassiulas, "
        r"``Leveraging Machine Learning for Multichain DeFi Fraud Detection,'' "
        r"in \textit{Proc. IEEE Int. Conf. Blockchain and Cryptocurrency (ICBC)}, 2024. "
        r"DOI: \url{https://doi.org/10.1109/ICBC59979.2024.10634350}"
    ),
    5: (
        r"B.~W. Tan, ``Central Bank Digital Currency and Financial Inclusion,'' "
        r"\textit{IMF Working Paper WP/23/69}, 2023. [Online]. Available: "
        r"\url{https://www.imf.org/en/Publications/WP/Issues/2023/03/27/Central-Bank-Digital-Currency-and-Financial-Inclusion-531273}. "
        r"Accessed: " + ACCESS + r"."
    ),
    9: (
        r"P.~Bracke, A.~Datta, C.~Jung, and S.~Sen, ``Machine Learning Explainability in Finance: "
        r"An Application to Default Risk Analysis,'' \textit{Bank of England Staff Working Paper No.~816}, 2019. "
        r"[Online]. Available: "
        r"\url{https://www.bankofengland.co.uk/working-paper/2019/machine-learning-explainability-in-finance-an-application-to-default-risk-analysis}. "
        r"Accessed: " + ACCESS + r"."
    ),
    13: (
        r"DefiLlama, ``Lending Protocols --- DeFi TVL and Protocol Rankings,'' 2024--2026. "
        r"[Online]. Available: \url{https://defillama.com/protocols/Lending}. "
        r"Accessed: " + ACCESS + r"."
    ),
    17: (
        r"BCOLBD 2025, ``Blockchain Olympiad Bangladesh: Guideline and Evaluation Scheme,'' 2025. "
        r"[Online]. Available: \url{https://bcolbd.org/rules}. Accessed: " + ACCESS + r"."
    ),
    20: (
        r"International Finance Corporation (IFC), ``MSME Finance Gap: Assessment of the Shortfalls and "
        r"Opportunities in Financing Micro, Small, and Medium Enterprises in Emerging Markets,'' World Bank, 2017. "
        r"[Online]. Available: "
        r"\url{https://openknowledge.worldbank.org/entities/publication/ff4c9839-21ac-5676-a23a-7cf6f745df0c}. "
        r"Accessed: " + ACCESS + r"."
    ),
    25: (
        r"Ripple Labs, ``RLUSD Stablecoin Product Overview,'' Ripple Documentation, 2025. "
        r"[Online]. Available: \url{https://ripple.com/solutions/stablecoin/}. "
        r"Accessed: " + ACCESS + r"."
    ),
    37: (
        r"GlobeNewswire, ``R3's Corda Leads Tokenized RWA Market with Over \$10 Billion in On-chain Assets,'' "
        r"February 2025. [Online]. Available: "
        r"\url{https://www.globenewswire.com/news-release/2025/02/13/3025637/0/en/R3-s-Corda-leads-tokenized-RWA-market-with-over-10-billion-in-on-chain-assets-and-unrivalled-industry-adoption.html}. "
        r"Accessed: " + ACCESS + r"."
    ),
    41: (
        r"World Economic Forum, ``Why Decentralized Finance Is a Leapfrog Technology for the "
        r"1.1 Billion People Who Are Unbanked,'' September 2022. [Online]. Available: "
        r"\url{https://www.weforum.org/stories/2022/09/decentralized-finance-a-leapfrog-technology-for-the-unbanked/}. "
        r"Accessed: " + ACCESS + r"."
    ),
    46: (
        r"Y.~Chen, S.~Bin, and H.~He, ``Design and Implementation of a Multi-Chain Lending Model in Blockchain,'' "
        r"in \textit{Proc. 3rd Int. Conf. Artificial Intelligence and Computer Information Technology (AICIT)}, 2024, pp.~97--102."
    ),
    47: (
        r"S.~Yang and W.~Cui, ``An Evaluation System for DeFi Lending Protocols,'' "
        r"\textit{arXiv preprint arXiv:2303.01022}, 2023. [Online]. Available: "
        r"\url{https://arxiv.org/abs/2303.01022}"
    ),
    48: (
        r"J.~Hartmann and O.~Hasan, ``A Social-Capital Based Approach to Blockchain-Enabled Peer-to-Peer Lending,'' "
        r"in \textit{Proc. IEEE Int. Conf. Blockchain Computing and Applications (BCCA)}, pp.~105--110, 2021. "
        r"[Online]. Available: \url{https://hal.science/hal-03371872}. Accessed: " + ACCESS + r"."
    ),
    49: (
        r"P.~T.~Hasan, H.~K.~T.~Akhter, M.~R.~Tahsinur, A.~B.~Haque, A.~K.~M.~N.~Islam, and R.~M.~Rahman, "
        r"``Blockchain and Machine Learning for Fraud Detection: A Privacy-Preserving and Adaptive Incentive Based Approach,'' "
        r"\textit{IEEE Access}, vol.~10, pp.~87115--87131, 2022. "
        r"[Online]. Available: \url{https://ieeexplore.ieee.org/document/9857827}. Accessed: " + ACCESS + r"."
    ),
    53: (
        r"Bank for International Settlements et al., ``Central Bank Digital Currencies: Foundational Principles "
        r"and Core Features,'' BIS and Central Banks Joint Report, 2020. [Online]. Available: "
        r"\url{https://www.bis.org/publ/othp33.htm}. Accessed: " + ACCESS + r"."
    ),
    54: (
        r"M.~Asaduzzaman, F.~Hasib, and Z.~B.~Hafiz, ``Towards Using Blockchain Technology for Microcredit Industry "
        r"in Bangladesh,'' in \textit{Proc. 23rd Int. Conf. Computer and Information Technology (ICCIT)}, pp.~1--6, 2020. "
        r"DOI: \url{https://doi.org/10.1109/ICCIT51783.2020.9392730}"
    ),
    55: (
        r"H.~Kim and D.~Kim, ``Optimal Gas Fee Minimization in DeFi: Enhancing Efficiency and Security on the "
        r"Ethereum Blockchain,'' \textit{IEEE Access}, vol.~12, pp.~173810--173823, 2024. "
        r"[Online]. Available: \url{https://ieeexplore.ieee.org/document/10750187}. Accessed: " + ACCESS + r"."
    ),
    56: (
        r"X.~Yuan, ``SHAP-based Interpretable Models for Credit Default Assessment Using Machine Learning,'' "
        r"in \textit{Proc. 14th Int. Conf. Software Technology and Engineering (ICSTE)}, pp.~213--217, 2024. "
        r"DOI: \url{https://doi.org/10.1109/ICSTE63875.2024.00044}"
    ),
    64: (
        r"L.~Gudgeon, S.~M.~Werner, D.~Perez, and W.~J.~Knottenbelt, ``DeFi Protocols for Loanable Funds: Interest Rates, "
        r"Liquidity and Market Efficiency,'' in \textit{Proc. 2nd ACM Conf. Advances in Financial Technologies (AFT)}, "
        r"pp.~92--112, 2020. DOI: \url{https://doi.org/10.1145/3419614.3423254}"
    ),
    73: (
        r"Grameen Bank, ``Grameen Bank at a Glance,'' Grameen Communications, 2024. [Online]. Available: "
        r"\url{https://www.grameen-info.org/}. Accessed: " + ACCESS + r"."
    ),
    78: (
        r"F.~A.~Aponte-Novoa, A.~L.~S.~Orozco, R.~Villanueva-Polanco, and P.~Wightman, "
        r"``The 51\% Attack on Blockchains: A Mining Behavior Study,'' \textit{IEEE Access}, vol.~9, pp.~140549--140564, 2021. "
        r"DOI: \url{https://doi.org/10.1109/ACCESS.2021.3119291}"
    ),
    79: (
        r"DL News Research, ``State of DeFi 2025,'' DL News, March 2026. [Online]. Available: "
        r"\url{https://www.dlnews.com/research/internal/state-of-defi-2025/}. Accessed: " + ACCESS + r"."
    ),
    84: (
        r"P.~Treleaven, R.~Gendal Brown, and D.~Yang, ``Blockchain Technology in Finance,'' \textit{Computer}, "
        r"vol.~50, no.~9, pp.~14--17, 2017. DOI: \url{https://doi.org/10.1109/MC.2017.3571047}"
    ),
    85: (
        r"D.~Cheng, X.~Wang, Y.~Zhang, and L.~Zhang, ``Graph Neural Network for Fraud Detection via "
        r"Spatial-Temporal Attention,'' \textit{IEEE Trans. Knowledge and Data Engineering}, vol.~34, no.~8, "
        r"pp.~3800--3813, 2022. [Online]. Available: \url{https://ieeexplore.ieee.org/document/9356317}. "
        r"Accessed: " + ACCESS + r"."
    ),
    86: (
        r"D.~Wang, B.~Wu, X.~Yuan, L.~Wu, Y.~Zhou, and H.~Cui, "
        r"``DeFiGuard: A Price Manipulation Detection Service in DeFi Using Graph Neural Networks,'' "
        r"\textit{arXiv preprint arXiv:2406.11157}, 2024. [Online]. Available: "
        r"\url{https://arxiv.org/abs/2406.11157}"
    ),
    87: (
        r"G.~Palaiokrassas, S.~Scherrers, E.~Makri, and L.~Tassiulas, ``Machine Learning in DeFi: Credit Risk Assessment "
        r"and Liquidation Prediction,'' in \textit{Proc. IEEE Int. Conf. Blockchain and Cryptocurrency (ICBC)}, 2024."
    ),
    88: (
        r"B.~McMahan, E.~Moore, D.~Ramage, S.~Hampson, and B.~A.~y Arcas, "
        r"``Communication-Efficient Learning of Deep Networks from Decentralized Data,'' "
        r"in \textit{Proc. Int. Conf. Artificial Intelligence and Statistics (AISTATS)}, 2017."
    ),
    89: (
        r"Z.~Chen, J.~Chen, M.~Sra, et~al., ``Standard Benchmarks Fail --- Auditing LLM Agents in Finance Must Prioritize Risk,'' "
        r"\textit{arXiv preprint arXiv:2502.15865}, 2025. [Online]. Available: "
        r"\url{https://arxiv.org/abs/2502.15865}"
    ),
    90: (
        r"Grameen Bank, ``Grameen Bank at a Glance,'' Grameen Communications, 2024. [Online]. "
        r"Available: \url{https://www.grameen-info.org/}. Accessed: " + ACCESS + r"."
    ),
    92: (
        r"MicroSave Consulting, ``Shaping a Sustainable Microfinance Sector in Bangladesh,'' MSC Signature Project, "
        r"September 2025. [Online]. Available: "
        r"\url{https://www.microsave.net/signature_projects/shaping-a-sustainable-microfinance-sector-in-bangladesh-through-mscs-transformation-feasibility-study/}. "
        r"Accessed: " + ACCESS + r"."
    ),
    94: (
        r"Morgan Stanley, ``Key Milestone in Innovation Journey with OpenAI,'' Press Release, March 2023. "
        r"[Online]. Available: "
        r"\url{https://www.morganstanley.com/press-releases/key-milestone-in-innovation-journey-with-openai}. "
        r"Accessed: " + ACCESS + r"."
    ),
    96: (
        r"G.~Cheng et al., ``Uncovering the Vulnerability of Large Language Models in the Financial Domain via Risk Concealment,'' "
        r"\textit{arXiv preprint arXiv:2509.10546}, 2025. [Online]. Available: "
        r"\url{https://arxiv.org/abs/2509.10546}"
    ),
    98: (
        r"European Banking Authority, ``Guidelines on the Minimum Content of the Governance Arrangements for Issuers of "
        r"Asset-Referenced Tokens under MiCAR,'' EBA/GL/2024/06, June 2024. [Online]. Available: "
        r"\url{https://www.eba.europa.eu/activities/single-rulebook/regulatory-activities/asset-referenced-and-e-money-tokens-micar/guidelines-internal-governance-arrangements-issuers-arts-under-micar}. "
        r"Accessed: " + ACCESS + r"."
    ),
    102: (
        r"DL News Research, ``State of DeFi 2025,'' DL News, March 2026. [Online]. Available: "
        r"\url{https://www.dlnews.com/research/internal/state-of-defi-2025/}. Accessed: " + ACCESS + r"."
    ),
    104: (
        r"H.~Qu, K.~M.~Gogol, F.~Gr\"{o}tschla, and C.~J.~Tessone, ``From Rules to Rewards: "
        r"Reinforcement Learning for Interest Rate Adjustment in DeFi Lending,'' "
        r"\textit{arXiv preprint arXiv:2506.00505}, 2025. [Online]. Available: "
        r"\url{https://arxiv.org/abs/2506.00505}"
    ),
    107: (
        r"Ethereum Improvement Proposals, ``EIP-4626: Tokenized Vault Standard,'' Ethereum Foundation, April 2022. "
        r"[Online]. Available: \url{https://eips.ethereum.org/EIPS/eip-4626}. Accessed: " + ACCESS + r".; "
        r"``EIP-7540: Asynchronous ERC-4626 Tokenized Vaults,'' Ethereum Foundation, 2023. [Online]. Available: "
        r"\url{https://eips.ethereum.org/EIPS/eip-7540}. Accessed: " + ACCESS + r".; "
        r"``EIP-3643: T-REX -- Token for Regulated EXchanges,'' Ethereum Foundation, 2021. [Online]. Available: "
        r"\url{https://eips.ethereum.org/EIPS/eip-3643}. Accessed: " + ACCESS + r". "
        r"See also: Spectral Finance, ``On-Chain Credit Scoring for DeFi Lending,'' 2023. [Online]. Available: "
        r"\url{https://docs.spectral.finance/}. Accessed: " + ACCESS + r".; "
        r"RociFi Labs, ``Undercollateralized DeFi Lending via On-Chain Credit Score,'' 2023. [Online]. Available: "
        r"\url{https://docs.rocifi.com/}. Accessed: " + ACCESS + r".; "
        r"Qwen Team (Alibaba Cloud), ``Qwen3 Technical Report,'' \textit{arXiv preprint arXiv:2505.09388}, 2025. "
        r"[Online]. Available: \url{https://arxiv.org/abs/2505.09388}"
    ),
    112: (
        r"M.~Larabel, ``AMD ROCm 7.0.2 Released,'' Phoronix, October 2025. [Online]. Available: "
        r"\url{https://www.phoronix.com/news/AMD-ROCm-7.0.2-Released}. Accessed: " + ACCESS + r"."
    ),
    113: (
        r"C.~He, X.~Zhou, D.~Wang, H.~Xu, W.~Liu, and C.~Miao, ``Harness Engineering for Language Agents: The Harness Layer "
        r"as Control, Agency, and Runtime,'' \textit{Preprints.org}, 2026. [Online]. Available: "
        r"\url{https://www.preprints.org/manuscript/202603.1756}. Accessed: " + ACCESS + r". "
        r"DOI: \url{https://doi.org/10.20944/preprints202603.1756.v2}"
    ),
    117: (
        r"M.~Larabel, ``AMD ROCm 7.0.2 Released,'' Phoronix, October 2025. [Online]. Available: "
        r"\url{https://www.phoronix.com/news/AMD-ROCm-7.0.2-Released}. Accessed: " + ACCESS + r"."
    ),
    122: (
        r"B.~Luo, Z.~Zhang, Q.~Wang, A.~Ke, S.~Lu, and B.~He, ``AI-powered Fraud Detection in Decentralized Finance: "
        r"A Project Life Cycle Perspective,'' \textit{ACM Comput. Surv.}, vol.~57, no.~4, art.~96, 2024. "
        r"DOI: \url{https://doi.org/10.1145/3705296}"
    ),
    123: (
        r"G.~Caldarelli, ``Can Artificial Intelligence Solve the Blockchain Oracle Problem? Unpacking the Challenges "
        r"and Possibilities,'' \textit{Frontiers in Blockchain}, vol.~8, art.~1682623, 2025. "
        r"DOI: \url{https://doi.org/10.3389/fbloc.2025.1682623}"
    ),
    127: (
        r"M.~Bartoletti, F.~Fioravanti, G.~Matricardi, R.~Pettinau, and F.~Sainas, "
        r"``Towards Benchmarking of Solidity Verification Tools,'' in \textit{Proc. FMBC (OASIcs)}, vol.~118, pp.~6:1--6:15, 2024. "
        r"DOI: \url{https://doi.org/10.4230/OASIcs.FMBC.2024.6}"
    ),
    146: (
        r"G.~Cimaszewski, F.~Da Dalt, T.~Moser, and A.~Perrig, ``SCION and Cross-Border Payments: Enhancing Security "
        r"and Compliance in Distributed Ledger Networks,'' \textit{SNB Working Papers}, 15/2025, Swiss National Bank. "
        r"[Online]. Available: "
        r"\url{https://www.snb.ch/en/publications/research/working-papers/2025/working_paper_2025_15}. "
        r"Accessed: " + ACCESS + r"."
    ),
}


def add_access_dates(item: str) -> str:
    if re.search(r"Accessed:|Retrieved", item):
        return item
    if "[Online]" not in item:
        return item
    # arXiv ePrints: ACM does not require access dates for stable preprint URLs
    if re.search(r"arXiv preprint", item, re.I) and "doi.org" not in item:
        return item

    return re.sub(
        r"\\url\{([^}]+)\}(?!\s*\. Accessed:)",
        lambda m: f"\\url{{{m.group(1)}}}. Accessed: {ACCESS}.",
        item,
    )


def process(tex: str) -> tuple[str, int, int]:
    start = tex.index("{\\small\n\\begin{enumerate}[label={[\\arabic*]}]")
    end = tex.index("\\end{enumerate}", start)
    head, body, tail = tex[:start], tex[start:end], tex[end:]

    parts = re.split(r"(\\item\s+)", body)
    out = [parts[0]]
    n_access = 0
    n_fix = 0
    ref_num = 0
    i = 1
    while i < len(parts):
        if parts[i] != "\\item ":
            out.append(parts[i])
            i += 1
            continue
        ref_num += 1
        content = parts[i + 1] if i + 1 < len(parts) else ""
        if ref_num in FIXES:
            content = FIXES[ref_num] + "\n"
            n_fix += 1
        else:
            new_content = add_access_dates(content)
            if new_content != content:
                n_access += 1
            content = new_content
        out.append("\\item ")
        out.append(content)
        i += 2

    return head + "".join(out) + tail, n_access, n_fix


def main() -> None:
    tex = TEX.read_text()
    updated, n_access, n_fix = process(tex)
    TEX.write_text(updated)
    print(f"Applied {n_fix} verified fixes; added access dates to {n_access} entries.")


if __name__ == "__main__":
    main()
