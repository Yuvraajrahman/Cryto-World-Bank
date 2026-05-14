#!/usr/bin/env python3
"""
Build Documentation/Pre-thesis_v10.2.md from:
  - Pandoc LaTeX→Markdown (body)
  - Pre-thesis_v10.tex (figure metadata, TikZ text extraction)
  - Pre-thesis_v10.lof / .lot (page numbers for manifest)
"""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path
from typing import Optional
from urllib.parse import quote

DOC = Path(__file__).resolve().parents[1]
TEX = DOC / "Pre-thesis_v10.tex"
LOF = DOC / "Pre-thesis_v10.lof"
LOT = DOC / "Pre-thesis_v10.lot"
AUX = DOC / "Pre-thesis_v10.aux"
OUT = DOC / "Pre-thesis_v10.2.md"
REPO = DOC.parent

GRAPHIC_DIRS = [
    DOC,
    DOC / "Tables",
    DOC / "Diagrams",
    DOC / "Diagrams" / "CSE370",
    DOC / "Diagrams" / "CSE471",
    DOC / "Diagrams" / "CSE470",
]


def encode_md_path(rel: str) -> str:
    """Percent-encode path segments for Markdown image URLs (spaces in filenames)."""
    return "/".join(quote(seg, safe="-_.~") for seg in rel.split("/"))


def find_asset(name: str) -> Optional[Path]:
    for d in GRAPHIC_DIRS:
        p = d / name
        if p.is_file():
            try:
                return Path(p.relative_to(REPO).as_posix())
            except ValueError:
                return Path(str(p))
    return None


def extract_brace_argument(s: str, prefix: str) -> Optional[tuple[str, int]]:
    """Find `prefix{` and return (inner, index_after_closing_brace) with brace balancing."""
    i = s.find(prefix)
    if i < 0:
        return None
    j = i + len(prefix)
    if j >= len(s) or s[j] != "{":
        return None
    depth = 0
    start = j
    k = j
    while k < len(s):
        ch = s[k]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                inner = s[start + 1 : k]
                return inner, k + 1
        k += 1
    return None


def strip_latex_simple(s: str) -> str:
    s = re.sub(r"\\textbf\{((?:[^{}]|\{[^{}]*\})*)\}", r"**\1**", s)
    s = re.sub(r"\\textit\{((?:[^{}]|\{[^{}]*\})*)\}", r"*\1*", s)
    s = re.sub(r"\\texttt\{((?:[^{}]|\{[^{}]*\})*)\}", r"`\1`", s)
    s = re.sub(r"\\tmarkDone\{\}", "✓ (implemented)", s)
    s = re.sub(r"\\tmarkPartial\{\}", "◐ (partial)", s)
    s = re.sub(r"\\tmarkPlanned\{\}", "○ (planned)", s)
    s = re.sub(r"\\tmarkNo\{\}", "✗ (absent)", s)
    s = re.sub(r"\\faCheck\s*\{\}", "✓", s)
    s = re.sub(r"\\faHourglassHalf\s*\{\}", "◐", s)
    s = re.sub(r"\\faCircle\s*\{\}", "○", s)
    s = re.sub(r"\\faTimes\s*\{\}", "✗", s)
    s = re.sub(r"\\fa[A-Za-z]+\s*\{\}", "", s)
    s = re.sub(r"\\normalfont\s*", "", s)
    s = re.sub(
        r"\\textcolor\s*\{[^}]+\}\{((?:[^{}]|\{[^{}]*\})*)\}",
        r"\1",
        s,
    )
    s = s.replace(r"\_", "_")
    s = s.replace(r"\%", "%")
    s = s.replace(r"\ldots", "...")
    s = s.replace(r"vs.\ ", "vs. ")
    s = s.replace(r"$\to $", r"$\rightarrow$")
    s = s.replace("~", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s


def strip_latex_iterate(s: str, rounds: int = 12) -> str:
    """Apply strip_latex_simple until stable (handles nested \\textcolor / \\fa chains)."""
    prev = None
    cur = s
    for _ in range(rounds):
        prev, cur = cur, strip_latex_simple(cur)
        if prev == cur:
            break
    return cur


def parse_contentsline_figure_table(line: str) -> Optional[tuple[str, str, str]]:
    """
    Parse \\contentsline {figure|table}{\\numberline {X.Y}...}{page}{...
    Supports:
      {\\numberline {2.9}{\\ignorespaces ...}}{32}{
      {\\numberline {2.8}Plain caption without inner brace}{31}{
    """
    m = re.search(r"contentsline \{(figure|table)\}\{\\numberline \{([^}]+)\}", line)
    if not m:
        return None
    num = m.group(2)
    pos = m.end()  # index after closing brace of {num}
    if pos >= len(line):
        return None
    if line[pos] == "{":
        rest = line[pos:]
        depth = 1
        cap_chars: list[str] = []
        k = 1
        while k < len(rest):
            ch = rest[k]
            if ch == "{":
                depth += 1
                if depth > 1:
                    cap_chars.append(ch)
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    caption_raw = "".join(cap_chars)
                    if caption_raw.startswith("\\ignorespaces "):
                        caption_raw = caption_raw[len("\\ignorespaces ") :]
                    tail = rest[k + 1 :]
                    pm = re.search(r"\{(\d+)\}", tail)
                    page = pm.group(1) if pm else "?"
                    return num, caption_raw, page
                cap_chars.append(ch)
            else:
                cap_chars.append(ch)
            k += 1
        return None
    # Unbraced caption: text until }{page}{
    m2 = re.search(r"\}\{(\d+)\}\{", line[pos:])
    if not m2:
        return None
    caption_raw = line[pos : pos + m2.start()]
    page = m2.group(1)
    return num, caption_raw, page


def extract_figure_envs(tex: str) -> list[dict]:
    envs = []
    for m in re.finditer(
        r"\\begin\{figure\}(.*?)\\end\{figure\}",
        tex,
        flags=re.DOTALL,
    ):
        block = m.group(1)
        lab = None
        lm = re.search(r"\\label\{([^}]+)\}", block)
        if lm:
            lab = lm.group(1)
        caption = ""
        ce = extract_brace_argument(block, "\\caption")
        if ce:
            caption = strip_latex_simple(ce[0])
        png = None
        pm = re.search(
            r"\\(?:FigureImageMaxFit|OnePageDiagram)(?:\[[^\]]*\])?\{([^}]+)\}",
            block,
        )
        if pm:
            png = pm.group(1).strip()
        has_tikz = "\\begin{tikzpicture}" in block
        envs.append(
            {
                "label": lab,
                "caption": caption,
                "png": png,
                "tikz": has_tikz,
                "raw": block[:12000],
            }
        )
    return envs


def tikz_to_prose(raw: str) -> str:
    lines_out: list[str] = []
    for m in re.finditer(
        r"\\node(?:\[[^\]]*\])?\s*\([^)]*\)\s*at\s*\([^)]*\)\s*\{((?:[^{}]|\{[^{}]*\})*)\}",
        raw,
        re.DOTALL,
    ):
        body = strip_latex_simple(m.group(1)).replace("\n", " ").strip()
        if body:
            lines_out.append(f"- **Node:** {body}")
    for m in re.finditer(
        r"node\[([^\]]*)\]\s*\{((?:[^{}]|\{[^{}]*\})*)\}",
        raw,
    ):
        lab = strip_latex_simple(m.group(2))
        if lab and "pos=" not in m.group(0):
            lines_out.append(f"- **Edge/node label:** {lab}")
    return "\n".join(lines_out) if lines_out else "(TikZ present; see `Pre-thesis_v10.tex` for full source.)"


def tikz_bar_coordinates_table(raw: str) -> Optional[str]:
    """If TikZ figure contains \\addplot ... coordinates { (x,y) ... }, emit a GFM pipe table."""
    m = re.search(
        r"\\addplot[^\n]*?coordinates\s*\{([^}]+)\}",
        raw,
        re.DOTALL,
    )
    if not m:
        return None
    body = m.group(1)
    rows = re.findall(r"\(([^,]+),([\d.]+)\)", body)
    if not rows:
        return None
    lines = ["| Category | Value |", "| :--- | ---: |"]
    for cat, val in rows:
        cat_disp = strip_latex_iterate(cat.strip())
        cat_disp = cat_disp.replace(r"$\to$", "→").replace("$", "")
        lines.append(f"| {cat_disp} | {val} |")
    return "\n".join(lines)


def tex_figure_block_containing(tex: str, needle: str) -> str:
    for m in re.finditer(r"\\begin\{figure\}(.*?)\\end\{figure\}", tex, flags=re.DOTALL):
        if needle in m.group(0):
            return m.group(0)
    return ""


def build_figure_replacements(tex: str) -> dict[str, str]:
    """Map full \\label value (e.g. fig:component-diagram) -> markdown."""
    envs = extract_figure_envs(tex)
    reps: dict[str, str] = {}
    for e in envs:
        lab = e["label"]
        if not lab:
            continue
        cap = e["caption"]
        parts = [f"### Figure (`{lab}`)", "", f"**Caption (from manuscript):** {cap}", ""]
        if e["png"]:
            rel = find_asset(e["png"])
            if rel:
                rel_posix = rel.as_posix() if isinstance(rel, Path) else str(rel)
                parts.append(f"**Source file (repository):** `{rel_posix}`")
                img_url = encode_md_path(rel_posix)
                parts.append("")
                parts.append(f"![{cap}]({img_url})")
            else:
                parts.append(
                    f"**Source file:** `{e['png']}` — **MISSING_ASSET** (not under `Documentation/` graphic paths; use PDF)."
                )
            parts.append("")
            parts.append(
                "**Textual description:** see section *Figure descriptions (PNG and TikZ)* "
                f"for **`{lab}`**."
            )
        elif e["tikz"]:
            parts.append("**Source:** TikZ in `Pre-thesis_v10.tex`.")
            bar_tbl = tikz_bar_coordinates_table(e["raw"])
            if bar_tbl:
                parts.append("")
                parts.append("**Chart data (pipe table from TikZ coordinates):**")
                parts.append("")
                parts.append(bar_tbl)
            parts.append("")
            parts.append("**Diagram structure (extracted node/edge labels):**")
            parts.append("")
            parts.append(tikz_to_prose(e["raw"]))
        parts.append("")
        reps[lab] = "\n".join(parts)
    return reps


def build_manifest() -> str:
    lines = [
        "## QC manifest: figures and tables",
        "",
        "Entries parsed from `Pre-thesis_v10.lof` and `Pre-thesis_v10.lot` (auxiliary files produced by LaTeX).",
        "",
        "### Figures",
        "",
    ]
    if LOF.exists():
        for line in LOF.read_text(encoding="utf-8", errors="replace").splitlines():
            p = parse_contentsline_figure_table(line)
            if not p:
                continue
            num, cap_raw, pg = p
            cap = strip_latex_iterate(cap_raw)
            lines.append(f"- **Figure {num}** — PDF p.{pg} — {cap}")
    lines.extend(["", "### Tables", ""])
    if LOT.exists():
        for line in LOT.read_text(encoding="utf-8", errors="replace").splitlines():
            p = parse_contentsline_figure_table(line)
            if not p:
                continue
            num, cap_raw, pg = p
            cap = strip_latex_iterate(cap_raw)
            tpath = DOC / "Tables" / f"{num}.png"
            qc = (
                f"`Documentation/Tables/{num}.png`"
                if tpath.is_file()
                else f"_no `Documentation/Tables/{num}.png` in repo_"
            )
            lines.append(f"- **Table {num}** — PDF p.{pg} — {cap} — QC: {qc}")
    lines.append("")
    return "\n".join(lines)


def strip_html_figures(md: str, figure_reps: dict[str, str], tex: str) -> str:
    """Replace pandoc <figure> blocks; unlabeled bar-chart figures get pipe tables from TikZ source."""

    def repl(m: re.Match) -> str:
        inner = m.group(0)
        idm = re.search(r'id="([^"]+)"', inner)
        fid = idm.group(1) if idm else ""
        if fid in figure_reps:
            return "\n\n" + figure_reps[fid] + "\n\n"
        capm = re.search(r"<figcaption>(.*?)</figcaption>", inner, re.DOTALL)
        cap_html = capm.group(1) if capm else ""
        cap_clean = re.sub(r"<[^>]+>", "", cap_html).replace("\n", " ")
        cap_clean = re.sub(r"\s+", " ", cap_clean).strip()
        tbl = ""
        if "Annual revenue projection by tier" in cap_html:
            blk = tex_figure_block_containing(tex, "Annual revenue projection by tier")
            t = tikz_bar_coordinates_table(blk)
            if t:
                tbl = "\n\n**Bar chart data (from LaTeX coordinates):**\n\n" + t + "\n"
        elif "Hierarchical interest rate spread" in cap_html:
            blk = tex_figure_block_containing(tex, "Hierarchical interest rate spread")
            t = tikz_bar_coordinates_table(blk)
            if t:
                tbl = "\n\n**Bar chart data (from LaTeX coordinates):**\n\n" + t + "\n"
        return (
            f"\n\n### Figure\n\n**Caption:** {cap_clean}\n{tbl}\n"
            f"_The PDF shows the full rendered bar chart; the table above matches the plotted values in `Pre-thesis_v10.tex`._\n\n"
        )

    return re.sub(r"<figure[^>]*>.*?</figure>", repl, md, flags=re.DOTALL)


def load_aux_ref_numbers(aux_path: Path) -> dict[str, str]:
    """
    Map LaTeX \\label{key} to printed reference number (e.g. 3.1, 5.8) from .aux \\newlabel lines.
    """
    if not aux_path.is_file():
        return {}
    out: dict[str, str] = {}
    for line in aux_path.read_text(encoding="utf-8", errors="replace").splitlines():
        m = re.search(r"\\newlabel\{([^}]+)\}\{\{([^}]+)\}", line)
        if m:
            out[m.group(1)] = m.group(2)
    return out


def fix_pandoc_crossrefs(md: str, labels: dict[str, str]) -> str:
    """Replace pandoc HTML <a href=\"#…\">…</a> with GFM [number](#…) using .aux ref numbers."""

    def repl(m: re.Match[str]) -> str:
        lab = m.group(1)
        inner = m.group(2).strip()
        num = labels.get(lab)
        if num is None and inner.startswith("[") and inner.endswith("]"):
            num = labels.get(inner[1:-1])
        display = num if num is not None else inner
        return f"[{display}](#{lab})"

    return re.sub(
        r'<a\s+href="#([^"]+)"[^>]*>\s*([^<]*?)\s*</a>',
        repl,
        md,
        flags=re.DOTALL,
    )


def polish_gfm(md: str) -> str:
    """Turn pandoc GFM HTML wrappers into clean pipe tables and readable status symbols."""

    def unwrap_tab_div(m: re.Match) -> str:
        tid, inner = m.group(1), m.group(2)
        lines = inner.splitlines()
        tbl_lines: list[str] = []
        rest_lines: list[str] = []
        phase = 0  # 0 = pipe-table rows, 1 = caption / legend after table
        for raw in lines:
            st = raw.strip()
            if phase == 0:
                if st.startswith("|"):
                    tbl_lines.append(st)
                elif st == "":
                    continue
                else:
                    phase = 1
                    if st:
                        rest_lines.append(st)
            elif st:
                rest_lines.append(st)
        cap = "\n\n".join(rest_lines) if rest_lines else ""
        table_block = "\n".join(tbl_lines)
        return f'<a id="{tid}"></a>\n\n{table_block}\n\n{cap}\n'

    md = re.sub(
        r'<div id="(tab:[^"]+)">\s*\n(.*?)<\/div>',
        unwrap_tab_div,
        md,
        flags=re.DOTALL,
    )
    # FontAwesome-style spans from LaTeX → plain symbols for table cells
    md = re.sub(
        r'<span style="color: green!55!black">\s*✓\s*</span>\s*',
        "✓ ",
        md,
    )
    md = re.sub(r'<span style="color: green!55!black">([^<]*)</span>', r"\1", md)
    md = re.sub(r'<span style="color: orange!85!black"></span>\s*', "◐ ", md)
    md = re.sub(r'<span style="color: blue!75!black"></span>\s*', "○ ", md)
    md = re.sub(r'<span style="color: red!75!black">\s*✗\s*</span>\s*', "✗ ", md)
    md = re.sub(r'<span style="color: red!75!black"></span>\s*', "✗ ", md)
    md = re.sub(r'<span label=""></span>\s*', "", md)
    # Pandoc artifact inside math-like caption text
    md = re.sub(r"<span>,</span>", ",", md)
    # Empty span used only as anchor (GFM)
    md = re.sub(r'<span id="([^"]+)"[^>]*></span>', r'<a id="\1"></a>', md)
    # Pandoc: $\\to$ mangled as $`\\to`$ in prose and table cells
    md = md.replace("$`\\to`$", "→")
    # Broken \\texttt{COMPLETED $|$ DEFAULTED} from LaTeX (pipe split across backticks)
    md = re.sub(
        r"`COMPLETED\s+`\s*\$\s*`\s*\|\s*`\s*\$\s*` DEFAULTED`",
        "`COMPLETED | DEFAULTED`",
        md,
    )
    return md


def pandoc_clean(md: str) -> str:
    md = re.sub(r"`<!-- -->`\{=html\}", "", md)
    md = re.sub(r"\{=html\}", "", md)
    md = re.sub(r"<br\s*/>", "  \n", md)
    return md


def fix_description_banking_functions(md: str) -> str:
    """Restore `description` item headings (pandoc loses them for GFM and classic Markdown)."""
    replacement = """::: description

- **Deposit Mobilization.** The process by which a bank accepts funds from savers and transforms them into productive capital. On the platform, depositors at any tier can place funds into savings products---standard savings accounts with variable yield, fixed-term deposits with locked periods and agreed APY, and institutional yield accounts for large participants. Deposits and accrual are recorded on-chain, and interest accrues automatically via deterministic rules rather than discretionary accounting.

- **Credit Allocation.** Loans flow downward through the four-tier hierarchy---from the World Bank reserve to national banks, from national banks to local banks, and from local banks to end borrowers. Each tier applies its own interest rate spread, collateral requirement, and borrowing limit, enforced by smart contract rules and supported by data-informed monitoring.

- **Payment and Settlement.** Transfers between registered accounts settle atomically in a smart contract transaction, avoiding the intermediate ``funds-in-transit'' state that commonly produces disputes in traditional systems.

- **Risk Intermediation.** Implemented through reserve-ratio enforcement constraints, role-based approval workflows, and an AI/ML monitoring layer (Random Forest for fraud detection, Isolation Forest for anomaly detection, SHAP for explainability) designed for transparent, auditable decision support.

- **Liquidity Management.** Enforced via minimum reserve ratios at each tier, with same-tier interbank lending pools for short-term liquidity balancing and planned asset-liability monitoring to detect unsafe duration gaps.

- **Ancillary Financial Services.** Includes foreign exchange, group lending, trade finance facilitation, and digital identity management. FX is designed around decentralized price oracles; group lending enables pooled collateral and mutual liability; trade finance instruments can be added as planned extensions.

:::"""
    pat_gfm = re.compile(
        r"(### Banking Functions of the Platform\n\n"
        r"A functionally complete bank performs six core activities:.*?\n\n)"
        r'<div class="description">\s*\n(.*?)<\/div>',
        re.DOTALL,
    )
    md, n_gfm = pat_gfm.subn(r"\1" + replacement.strip() + "\n", md, count=1)
    if n_gfm:
        return md
    pat_md = re.compile(
        r"(### Banking Functions of the Platform\n\n"
        r"A functionally complete bank performs six core activities:.*?\n\n)"
        r"::: description\n.*?\n:::",
        re.DOTALL,
    )
    return pat_md.sub(r"\1" + replacement.strip() + "\n", md, count=1)


def figure_descriptions_appendix(tex: str) -> str:
    """Plain-language walkthroughs aligned with figure order in `Pre-thesis_v10.tex`."""
    envs = extract_figure_envs(tex)
    lof_order: list[tuple[str, str]] = []
    if LOF.exists():
        for line in LOF.read_text(encoding="utf-8", errors="replace").splitlines():
            p = parse_contentsline_figure_table(line)
            if p:
                lof_order.append((p[0], p[2]))  # number, page

    extra = FIGURE_APPENDIX_PROSE

    chunks: list[str] = []
    for i, e in enumerate(envs):
        fig_no, pdf_page = (lof_order[i] if i < len(lof_order) else ("?", "?"))
        lab = e.get("label")
        cap = e["caption"]
        title = f"## Figure {fig_no}"
        if lab:
            title += f" — `{lab}`"
        chunks.append(title)
        chunks.append("")
        chunks.append(f"**List of Figures (aux) PDF page:** p.{pdf_page}")
        chunks.append("")
        chunks.append(f"**Caption:** {cap}")
        chunks.append("")
        if lab and lab in extra:
            chunks.append(extra[lab])
            chunks.append("")
        if e["png"]:
            rel = find_asset(e["png"])
            if rel:
                rel_posix = rel.as_posix() if isinstance(rel, Path) else str(rel)
                img_url = encode_md_path(rel_posix)
                chunks.append(f"![Figure {fig_no}: {cap}]({img_url})")
                chunks.append("")
                chunks.append(
                    f"**Repository file:** `{rel_posix}`. Open the image above or the thesis PDF at full zoom "
                    "to read every label on the diagram."
                )
                if not (lab and lab in extra):
                    chunks.append("")
                    chunks.append(
                        "**How to read this diagram in text form:** Work top-to-bottom (sequence diagrams: "
                        "left-to-right lifelines first, then each message in vertical time order). "
                        "Follow control-flow arrows on activity diagrams from the solid initial node through "
                        "decision diamonds to merge bars and flow-final nodes. On dataflow diagrams, trace each "
                        "labeled arrow between external entities, processes (numbered bubbles), and data stores."
                    )
            else:
                chunks.append(
                    f"**MISSING_ASSET:** `{e['png']}` is not in this repository. "
                    f"Use **Figure {fig_no}** in `Documentation/Pre-thesis_v10.pdf` (LOF PDF p.{pdf_page}) for pixel-accurate labels."
                )
        elif e["tikz"]:
            chunks.append("**TikZ — text extracted from source:**")
            chunks.append("")
            chunks.append(tikz_to_prose(e["raw"]))
        chunks.append("")
    return "\n".join(chunks)


# Verbatim-style prose for repository PNGs / key diagrams (plain language, no Mermaid).
FIGURE_APPENDIX_PROSE: dict[str, str] = {
    "fig:component-diagram": """**Layers (top to bottom in the diagram).**

**Smart Contract Layer (orange):** `OpenZeppelin Ownable` at the top; `WorldBankReserve` / `IReserve`; `NationalBank` / `INationalBank`; `LocalBank` / `ILocalBank`. Solid arrows show **lends** from World Bank reserve toward National Bank and toward Local Bank.

**Presentation Layer (blue):** `Wallet Provider (Wagmi + …)` connects to `LocalBank` with **connRPC**; connects to **MetaMask Wallet** (external); connects to **React DApp** with **tx/read**. The React DApp groups **Dashboard, Loan, Admin, Risk,** and **Chat**. Bidirectional link to backend: **ws://** and **REST**.

**External Services (red):** **MetaMask Wallet**; **Alchemy RPC** receives **RPC** from `LocalBank`, sends **events** to backend **Realtime + Sync**, and **broadcast** to **Polygon PoS**.

**Backend Services Layer (green):** **Realtime + Sync (WebSocket)**; **FastAPI (REST)** with **LoanAPI** and **UserAPI**; **Storage** containing **PostgreSQL (15 tables)**, **Redis**, **FileStore**; **AI/ML Service** with **predictFraud**, **detectAnomaly**, and **SHAP**.

**End-to-end flow (narrative order):** User uses **React DApp**; **Wallet Provider** connects **MetaMask** and talks to **LocalBank** on-chain (**connRPC** / **tx/read**). Contracts use **Alchemy RPC** to reach **Polygon PoS**; Alchemy **events** feed **Realtime + Sync**, which with **FastAPI** persists to **PostgreSQL/Redis** and runs **AI/ML** scoring.""",
    "fig:usecase": """**Actors (left):** **National Bank**, **World Bank Admin**, **Bank Approver (Local Bank)**, **Borrower**.

**National Bank (teal):** Register local bank; Set bank approver; Add bank user; View local bank portfolio; Lend to local bank (includes **Borrow from World bank**); Borrow from World bank.

**AI/ML Security (pink):** View risk dashboard; View anomaly alerts — used by National Bank and World Bank Admin.

**World Bank Admin (light blue):** Register national bank; Lend to national bank; View all statistics; Pause / unpause system; Emergency withdraw; Review security logs.

**Loan lifecycle — approver (orange):** Reject loan; Approve loan; Review loan requests; Review income proof; View AI/ML fraud scores; View XAI explanations. **Reject** and **Approve** include **Review loan requests**; **Approve** also includes **Review income proof**. **Review loan requests** includes **View AI/ML fraud scores** and **View XAI explanations**.

**Borrower-facing blocks:** **Communication** — Chat with borrower (Bank Approver, includes **Connect Wallet**); Use AI chatbot (Borrower, includes **Query loan data** and **Connect Wallet**); Chat with bank (Borrower, includes **Connect Wallet**). **Finance & data** — Deposit to reserve; View borrowing limit; View market data; Generate QR code (Borrower and National Bank; each includes **Connect Wallet**). **Loan lifecycle — borrower** — Pay installment (includes **Check borrowing limit**, **Connect Wallet**); Request Loan (includes **Upload income proof**, **Connect Wallet**); View my loans (includes **Connect Wallet**); Check borrowing limit; Upload income proof. **Wallet & onboarding** — **Connect Wallet**; **Accept Terms & Conditions** (all four actors); **Manage Profile** (all four actors).

**Relationship types:** Solid lines are actor–use-case associations; dotted **`<<include>>`** arrows mean a sub-use case is always part of the base use case.""",
    "fig:act-loan": """**Flow order (ovals, rectangles, diamonds).**

Start → **Borrower Opens dApp** → **Connect Wallet: MetaMask or WalletConnect** → diamond **Wallet Connected?** — if no → **Show Connect Wallet Error** → End; if yes → **Read Wallet Address and Network ID** → **Navigate to Loan Page: Enter Amount and Purpose** → diamond **Is First-Time Borrower?** — if yes → **Upload Income Proof Document** → diamond **Income Proof Approved?** — if no → **Reject: Insufficient Verified** → End; if yes (or not first-time) → **Query Borrowing Limit: Available and 1st-year listing limit** → diamond **Amount Within Borrowing Limit?** — if no → **Reject: Limit Exceeded** → End; if yes → **Prepare Transaction: requestLoan(amount, purpose)** → **MetaMask Prompts User: Display Gas Estimate** → diamond **User Confirms Transaction?** — if no → **Transaction Cancelled** → End; if yes → **Sign and Broadcast Transaction to Polygon Network** → **Smart Contract Validation and Execution** (checks amount positive, available self velocity, collective balance; creates Loan object; **emit LoanRequested**) → diamond **Transaction Successful?** — if no → **Show Error: Tx Failed** → End; if yes → **Display Success: Loan Requested, Show Tx Hash** → **Event Listener Detects LoanRequested Event** (store in DB; trigger **ASML Risk Assessment**). Framed **risk analysis** region: **View Pending Loans with All Risk Scores and Risk Explanations** → diamond **Approve or Reject?** — Reject path → **Sign rejection: Record Reason, Notify Borrower** → End; Approve path → **Sign approval: join via Approve-Helper** → **Smart Contract** (verify approver role, loan pending, balance; transfer ETH to borrower; **emit LoanApproved**) → diamond **Loan Amount at least 200 ETH?** — if yes → **Generate Installment Plan: N installments with due dates**; if no → **Single Payment Due by Deadline** → **Borrower Receives Funds in Wallet** (update borrowing limit; update transaction log) → diamond **Installment Due?** — pay path → **Pay Installment: via payInstallment(), Sign Tx** (loops until done) → **Loan Completed: Update status=inactive, emit LoanClosed** → End.

**Named calls / events:** `requestLoan(amount, purpose)`, `LoanRequested`, Approve-Helper path, `payInstallment()`, `LoanApproved`, `LoanClosed`; concepts **ASML Risk Assessment**, self velocity, collective balance, gas estimate, Tx hash, ETH, Polygon Network.""",
    "fig:dfd-level1a": """**Zones:** Supporting services (top left), core loan processing (middle left), extended services (bottom right), data stores (bottom row), external entities (Borrower, Bank Approver, Coinbase API; also World Bank Admin and National Bank).

**External flows:** **Coinbase API** → **Price data** → process **7.0 Fetch & Cache Market Data** → **Cached Price data** → store **D10: MARKET_DATA**. **Borrower** sends **Amount, Purpose, Wallet Address** to **1.0 Process Loan Request**; **Income proof documents** to **11.0 Process Income Verification**; **send message** to **13.0 Manage Chat Communication**; receives **chatbot questions** and **AI responses** from **14.0 AI chatbot service**; **profile updates** / **profile data, Preferences** from **12.0 Manage User Profiles**; **verification status** from **11.0**; **receive message, Read status** from **13.0**. **Bank Approver** receives **Pending Loans + Risk scores** from **2.0 Manage Loan Lifecycle**; **Review Income Proofs** from **11.0**; **Profile Updates** from **12.0**; sends **Approval/Rejection** to **4.0 Execute Blockchain Transaction**; **Pending Proofs** to **11.0**; **Profile Data** to **12.0**.

**Core chain:** **1.0** outputs **Loan data** to **2.0**; **2.0** sends **Risk Query** to **3.0 AI ML risk assessment**; **3.0** returns **RISK SCORE + SHAP Features** to **2.0**; **2.0** sends **Signed Transaction** to **4.0**; **4.0** outputs **Transaction Events** to **5.0 Synchronize Event Data**; **5.0** writes **Loan Record** to **D11: INSTALLMENT**, **Transaction Log** to **D2: TRANSACTION**, **Security Log** to **D3: AI_ML_SECURITY_LOG**. **2.0** also returns **Validation Result** to **1.0** and **Pending Loans + Risk scores** to the approver.

**Other processes:** **8.0 Manage Bank Hierarchy & System Controls**; **9.0 Calculate Borrowing Limits** reads **History data** from **D11: INSTALLMENT**, writes **Limit data** to **D8: BORROWING_LIMIT**. **11.0** writes **Hashed document** to **D7: INCOME_PROOF**, **Borrower Proof Link** to **D5: BORROWER**, etc. **12.0** touches **D7**, **D9: PROFILE_SETTINGS**, **D5**. **13.0** reads **D9**, writes **D6: CHAT_MESSAGE**, queries **D1: LOAN_REQUEST**. **14.0** reads/writes **D6**, **D4: AI_CHATBOT_LOG**, reads **D8**, **D1**.

**Data stores on the diagram:** D10, D11, D2, D3, D8, D7, D5, D9, D1, D6, D4 (each label as printed on the cylinder).""",
    "fig:seq-reject": """**Context:** Fragment **alt [Reject]** continuing from Sequence Diagram 1 after step 35.

**Lifelines (left to right):** Approver UI; Approver Wallet; **LocalBank.sol**; Polygon PoS; Backend API; Frontend / Borrower.

**Message order:** **36b** Approver UI: user clicks **Reject**, reason example **High fraud risk**. **37b** Approver Wallet: sign **`rejectLoan(5, High fraud risk)`** toward **LocalBank.sol**. **38b** contract: **`require(onlyApprover)`**. **39b** contract: **`require(status == Pending)`**. **40b** **`loan.status = Rejected`**. **41b** **`loan.rejectedAt = block.timestamp`**. **42b** **`emit LoanRejected(5, borrower, 50, High fraud risk)`** to Polygon PoS. **43b** event listener on Backend API detects event. **44b** **`UPDATE LOAN_REQUEST`** setting **`status = rejected`**, **`rejected_reason = High fraud risk`**. **45b** push notification to borrower frontend. **46b** UI displays final loan state to borrower.""",
    "fig:seq-hierarchy": """**Lifelines (left to right):** WorldBankAdmin; Frontend; **WBReserve.sol**; Blockchain; NationalBank; **NationalBank.sol**; LocalBank; **LocalBank.sol**; Borrower.

**Disbursement phase (numbered arrows on diagram):** 1 WorldBankAdmin → Frontend: deposit funds to reserve. 2 Frontend → WBReserve: **`deposit()`** with value. 3 WBReserve → Blockchain: record transaction. 4 Blockchain dashed return confirm to WBReserve. 5 NationalBank → Frontend: request loan from World Bank. 6 Frontend → WBReserve: **`requestLoan(amount)`**. 7 WBReserve internal: check available reserve. 8 WorldBankAdmin → Frontend: approve NB loan. 9 Frontend → WBReserve: **`approveLoan(nb_address, amount)`**. 10 WBReserve → Blockchain: transfer funds to NB contract. 11 Blockchain → NationalBank.sol: receive funds. 12 LocalBank → Frontend: request loan from National Bank. 13 Frontend → NationalBank.sol: **`requestLoan(amount)`**. 14 NationalBank → Frontend: approve LB loan. 15 Frontend → NationalBank.sol: **`approveLoan(lb_address, amount)`**. 16 NationalBank internal: transfer toward LB. 17 NationalBank.sol → LocalBank.sol: on-chain transfer. 18 LocalBank.sol → Borrower: borrower receives funds.

**Repayment phase (annotation on diagram: “Repayment cascades back up”):** 19 Borrower → LocalBank.sol: **`payInstallment()`**. 20 LocalBank.sol → LocalBank: forward share. 21 LocalBank → NationalBank.sol: forward share to NB. 22 NationalBank.sol → WBReserve.sol: forward share to World Bank reserve.""",
    "fig:seq-installment": """**Lifelines:** Borrower; Frontend; MetaMask; **LocalBank.sol**; Polygon PoS; Backend API.

**Setup:** 1 Borrower opens My Loans. 2 Frontend calls Backend **`GET /loans/active` + installments**. 3 Backend returns loan list with schedule. 4 Frontend shows progress **X of Y paid**.

**Loop `[For each installment until loan is fully repaid]`:** 5 Select next due installment. 6 Click Pay Installment. 7 Frontend prepares unsigned **`payInstallment(loanId, installmentNo)`** for MetaMask. 8 MetaMask popup (example amount/gas text on diagram). 9 User confirms. 10 Sign and broadcast to **LocalBank.sol**. Internal steps **11–14:** `require` installment exists and status pending; `require(msg.value == installmentAmount)`; mark installment paid; **`totalRepaid += amount`**. 15 **`emit InstallmentPaid(loanId, number, amount)`** on Polygon. 16 Event listener on Backend. **17–18:** `UPDATE INSTALLMENT` status paid; `INSERT INTO TRANSACTION`. 19 Tx confirmed to Frontend. 20 Borrower sees installment paid and updated **X of Y**.

**Optional `[All installments paid]`:** **21** `loan.status = Repaid` in contract. **22** **`emit LoanFullyRepaid(loanId, borrower)`**. **23** Event detected. **24–25** Backend `UPDATE LOAN_REQUEST` repaid; **`UPDATE BORROWING_LIMIT (increase)`**. **25** notify borrower loan fully repaid.""",
    "fig:seq-income": """**Lifelines (left to right):** Borrower; Frontend; FastAPI; PostgreSQL; FileStorage; BankApprover.

**Phase 1 — upload:** 1 Open Income Verification page. 2 Frontend **`GET /income-proof/status (borrower_id)`** to FastAPI. 3 FastAPI queries **`INCOME_PROOF`**. 4–5 Return verification status to borrower UI. 6 Show upload form when no verified proof. 7 Select file and upload. 8 Client-side validation (type, size ≤ 5MB). 9 **`POST /income-proof/upload (file, borrower_id)`**. 10 Server-side validation and **SHA-256** hash. 11 Store **encrypted** file in FileStorage. 12 Return **`file_path`**. 13 **`INSERT INTO INCOME_PROOF`** with **status = pending**. 14–16 Confirm and show **Pending Review** to borrower.

**Phase 2 — bank review (yellow divider on diagram):** 17 BankApprover views pending proofs. 18 **`GET /income-proofs/pending`**. 19–21 Query PostgreSQL and return list. 22 Display for review. 23 Approve/Reject with notes. 24 **`PATCH /income-proof/id (status, notes)`**. 25 **`UPDATE INCOME_PROOF`** set status, **`reviewed_by`**, **`reviewed_at`**. 26–28 Confirm update and show confirmation to approver.""",
}



def main() -> int:
    tex = TEX.read_text(encoding="utf-8", errors="replace")
    tmp_md = DOC / ".prethesis_pandoc_work.md"
    subprocess.run(
        ["pandoc", str(TEX), "-f", "latex", "-t", "gfm", "-o", str(tmp_md)],
        check=True,
    )
    md = tmp_md.read_text(encoding="utf-8", errors="replace")
    md = polish_gfm(md)
    md = pandoc_clean(md)
    md = fix_description_banking_functions(md)

    figure_reps = build_figure_replacements(tex)
    md = strip_html_figures(md, figure_reps, tex)

    aux_labels = load_aux_ref_numbers(AUX)
    md = fix_pandoc_crossrefs(md, aux_labels)

    manifest = build_manifest()

    header = (
        "# Pre-thesis v10.2 (Markdown export)\n\n"
        "Generated from [`Pre-thesis_v10.tex`](Pre-thesis_v10.tex) via **pandoc** (`-t gfm`) plus local post-processing. "
        "Tables render as **GitHub-Flavored Markdown pipe tables**; HTML table wrappers from LaTeX are stripped to anchors + tables; "
        "diagram figures that exist in the repo include an **embedded image** (`![…](…)`). "
        "TikZ **bar charts** without raster files include a **pipe table of the plotted coordinates** taken from the `.tex` source. "
        "The rendered PDF is [`Pre-thesis_v10.pdf`](Pre-thesis_v10.pdf).\n\n"
        "**Math:** formulas use `$...$` / `$$...$$` as emitted by pandoc.\n\n"
        "---\n\n"
    )

    appendix = (
        "\n\n---\n\n# Figure descriptions (PNG and TikZ)\n\n"
        + figure_descriptions_appendix(tex)
    )

    pdf_txt = DOC / "Pre-thesis_v10_pdftext_layout.txt"
    subprocess.run(
        ["pdftotext", "-layout", str(DOC / "Pre-thesis_v10.pdf"), str(pdf_txt)],
        check=False,
    )

    pdf_qc = (
        "\n\n---\n\n## PDF layout extraction (QC)\n\n"
        "Companion plain-text (layout-preserving) extraction: "
        f"[`Pre-thesis_v10_pdftext_layout.txt`](Pre-thesis_v10_pdftext_layout.txt) "
        "(generated alongside this Markdown via `pdftotext -layout` on `Pre-thesis_v10.pdf`). "
        "Use it to spot-check hyphenation and line breaks against pandoc’s reflow in the sections above.\n"
    )

    final = header + manifest + "\n---\n\n# Main body\n\n" + md + appendix + pdf_qc

    OUT.write_text(final, encoding="utf-8")
    tmp_md.unlink(missing_ok=True)
    print(f"Wrote {OUT} ({len(final)} chars)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
