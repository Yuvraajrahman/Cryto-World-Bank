#!/usr/bin/env python3
"""Generate Pre-thesis_v12_acm.tex from v11: strict acmart acmsmall, chapter->section."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "Pre-thesis_v11.tex"
DST = ROOT / "Pre-thesis_v12_acm.tex"

ACM_PREAMBLE = r"""%%
%% Crypto World Bank — ACM acmsmall (generated from Pre-thesis_v11.tex)
%% Regenerate: python3 tools/migrate_to_acmart.py
%%
\documentclass[acmsmall,screen,review]{acmart}

\usepackage{listings}
\lstdefinelanguage{Solidity}{
  keywords={pragma,solidity,contract,function,returns,external,internal,public,private,
             view,pure,payable,mapping,address,uint256,uint,bool,bytes32,string,
             event,emit,modifier,require,revert,import,is,memory,storage,indexed,
             bytes,keccak256,struct,enum,constructor,fallback,receive},
  sensitive=true,
  comment=[l]{//},
  morecomment=[s]{/*}{*/},
  morestring=[b]",
}
\lstset{
  basicstyle=\ttfamily\scriptsize,
  breaklines=true,
  frame=single,
  numbers=left,
  numberstyle=\tiny,
}

\usepackage[table]{xcolor}
\usepackage{colortbl}
\usepackage{booktabs}
\usepackage{array}
\usepackage{tabularx}
\usepackage{ragged2e}
\usepackage{multirow}
\usepackage{amsmath,amssymb}
\usepackage{tikz}
\usetikzlibrary{arrows.meta,positioning,fit,shapes.geometric}
\usepackage{pgfplots}
\pgfplotsset{compat=1.18, minor tick num=0}
\usepackage{float}
\usepackage{caption}
\usepackage[skins]{tcolorbox}
\usepackage{enumitem}

\definecolor{PrimaryBlue}{HTML}{1A3C6E}
\definecolor{AccentBlue}{HTML}{2563EB}
\definecolor{LightBlue}{HTML}{EFF6FF}
\definecolor{MidBlue}{HTML}{DBEAFE}
\definecolor{GrayText}{HTML}{64748B}
\definecolor{RowShade}{HTML}{F8FAFC}
\definecolor{GreenAccent}{HTML}{059669}
\definecolor{RedAccent}{HTML}{DC2626}
\definecolor{VioletAccent}{HTML}{7C3AED}

\newcommand{\tmarkDone}{\checkmark}
\newcommand{\tmarkNo}{$\times$}
\newcommand{\tmarkPartial}{$\triangleright$}
\newcommand{\tmarkPlanned}{$\circ$}
\newcommand{\tableheadcolor}{\rowcolor{PrimaryBlue!12}}
\newcommand{\tablerowshade}{\rowcolor{RowShade}}

\newtcolorbox{highlightbox}[1][]{
  colback=LightBlue, colframe=AccentBlue!60, boxrule=0.6pt, arc=2pt,
  left=8pt,right=8pt,top=6pt,bottom=6pt, #1
}

\newcommand{\manualpie}[6]{%
  \fill[#6] (#1,#2) -- ++({#4}:{#3}) arc ({#4}:{#5}:{#3}) -- cycle;
}
\newcommand{\ddcat}[3]{\node[draw=gray!50,fill=gray!8,rounded corners=2pt,
  minimum width=2.2cm,minimum height=0.65cm,align=center,font=\scriptsize] (#1) at (#2) {#3};}
\newcommand{\ddone}[3]{\node[draw=PrimaryBlue!70,fill=PrimaryBlue!20,
  minimum width=2.2cm,minimum height=0.65cm,align=center,
  font=\scriptsize\bfseries,rounded corners=2pt] (#1) at #2 {#3};}
\newcommand{\ddtwo}[3]{\node[draw=gray!50,fill=white,
  minimum width=2.2cm,minimum height=0.65cm,align=center,
  font=\scriptsize,rounded corners=2pt] (#1) at #2 {#3};}

\graphicspath{{Diagrams/mermaid-pdf/}{./}{Tables/}{Diagrams/}}

\makeatletter
\newcommand{\ThesisIncludeGraphics}[2][]{%
  \IfFileExists{#2}{\includegraphics[#1]{#2}}{%
    \IfFileExists{Diagrams/mermaid-pdf/#2}{\includegraphics[#1]{Diagrams/mermaid-pdf/#2}}{%
      \fbox{\parbox{0.9\linewidth}{\centering\small Missing: #2}}}}%
}
\makeatother
\newcommand{\FigureImageMaxFit}[1]{\ThesisIncludeGraphics[width=\linewidth,keepaspectratio]{#1}}
\newcommand{\OnePageDiagram}[2][]{\ThesisIncludeGraphics[#1,width=\linewidth,keepaspectratio]{#2}}

\newcolumntype{Y}{>{\raggedright\arraybackslash}X}
\newcolumntype{L}[1]{>{\raggedright\arraybackslash}p{#1}}
\newcolumntype{C}[1]{>{\centering\arraybackslash}p{#1}}

\title{Crypto World Bank: A Hierarchical Decentralized Banking Architecture}
\subtitle{Pre-thesis 1 Report --- Design and Specification}

\author{Md. Bokhtiar Rahman Juboraz}
\email{20301138@bracu.ac.bd}
\affiliation{%
  \institution{BRAC University}%
  \department{Department of Computer Science and Engineering}%
  \city{Dhaka}%
  \country{Bangladesh}%
}

\author{Md. Mahir Ahnaf Ahmed}
\email{20301083@bracu.ac.bd}
\affiliation{%
  \institution{BRAC University}%
  \department{Department of Computer Science and Engineering}%
  \city{Dhaka}%
  \country{Bangladesh}%
}

\thanks{Supervisor: Mr. Annajiat Alim Rasel, Senior Lecturer, Department of CSE, BRAC University. Pre-thesis 1 report, February 2026.}

\renewcommand{\shortauthors}{Juboraz and Ahmed}

\begin{document}
\begin{abstract}
PLACEHOLDER_ABSTRACT
\end{abstract}

\begin{CCSXML}
<ccs2012>
<concept><concept_id>10003033.10003039</concept_id><concept_desc>Security and privacy~Financial cryptography</concept_desc></concept>
</ccs2012>
\end{CCSXML}

\ccsdesc[500]{Security and privacy~Financial cryptography}

\keywords{Blockchain, DeFi, Institutional Architecture, Smart Contracts, Fine-tuned LLM}

\maketitle

"""

SKIP_MARKERS = (
    r"\documentclass",
    r"\begin{document}",
    r"\end{document}",
    r"\chapter*{Title Page}",
    r"\chapter*{Declaration}",
    r"\chapter*{Approval",
    r"\chapter*{Ethics Statement}",
    r"\chapter*{Abstract}",
    r"\chapter*{Dedication}",
    r"\chapter*{Acknowledgment}",
    r"\tableofcontents",
    r"\listoftables",
    r"\listoffigures",
    r"\chapter*{List of Formulas",
    r"\chapter*{List of Abbreviations",
    r"\pagenumbering{roman}",
    r"\pagenumbering{arabic}",
    r"\chapter*{Document Status",
)


def should_skip_line(line: str) -> bool:
    s = line.strip()
    if not s:
        return False
    for m in SKIP_MARKERS:
        if m in line:
            return True
    if s.startswith("%") and "TITLE PAGE" in s.upper():
        return True
    if s.startswith("%") and "TABLE OF CONTENTS" in s.upper():
        return True
    return False


def transform_body(text: str) -> str:
    out = []
    skip_until_chapter1 = False
    in_preamble = True
    for line in text.splitlines():
        if r"\documentclass" in line:
            in_preamble = True
            continue
        if r"\begin{document}" in line:
            in_preamble = False
            skip_until_chapter1 = True
            continue
        if in_preamble:
            continue
        if skip_until_chapter1:
            if line.startswith(r"\chapter{") and "Introduction" in line:
                skip_until_chapter1 = False
            else:
                if should_skip_line(line):
                    continue
                if r"\chapter*{Document Status" in line:
                    skip_until_chapter1 = False
                    out.append(r"\section*{Document Status (Pre-thesis 1)}")
                    continue
                continue
        if should_skip_line(line):
            continue
        line = line.replace(r"\chapter{", r"\section{")
        line = line.replace(r"\chapter*{", r"\section*{")
        out.append(line)
    return "\n".join(out)


def extract_abstract(text: str) -> str:
    start = text.find(r"\chapter*{Abstract}")
    if start < 0:
        return "Abstract placeholder."
    chunk = text[start : start + 4000]
    lines = []
    capture = False
    for line in chunk.splitlines():
        if r"\chapter*{Abstract}" in line:
            capture = True
            continue
        if capture:
            if line.strip().startswith(r"\chapter") or line.strip().startswith(r"\newpage"):
                break
            if r"\noindent\textbf{Keywords" in line:
                break
            if line.strip() and not line.strip().startswith("%"):
                t = line.strip()
                if r"\addcontentsline" in t or r"\phantomsection" in t:
                    continue
                if r"\textbf{Keywords" in t:
                    break
                lines.append(t)
    return " ".join(lines)[:2000] if lines else "See Pre-thesis_v11.tex abstract."


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    abstract = extract_abstract(text)
    body = transform_body(text)
    preamble = ACM_PREAMBLE.replace("PLACEHOLDER_ABSTRACT", abstract)
    if not body.rstrip().endswith(r"\end{document}"):
        body = body.rstrip() + "\n\n\\bibliographystyle{ACM-Reference-Format}\n\\end{document}\n"
    dst_text = preamble + "\n% --- Body migrated from v11 ---\n\n" + body
    if r"\end{document}" in dst_text:
        # remove duplicate end document from body middle
        parts = dst_text.rsplit(r"\end{document}", 1)
        dst_text = parts[0] + r"\end{document}" + "\n"
    DST.write_text(dst_text, encoding="utf-8")
    print(f"Wrote {DST} ({DST.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
