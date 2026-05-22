# Format Improvement Suggestions — Pre-thesis 1
**Crypto World Bank | BRAC University CSE**
*Based on: ACM `acmsmall` sample templates provided, ACM TAPS LaTeX Best Practices (acm.org), institutional checklist, and rubric requirements*

---

## 1. Document Class — Highest Priority

**Current:** `\documentclass[12pt,a4paper]{report}`

**Required:** Switch to the ACM unified template exactly as shown in the provided sample files:
```latex
\documentclass[acmsmall]{acmart}          % final / camera-ready
\documentclass[manuscript,screen,review]{acmart}  % review/submission phase
```
Per ACM's official guidance: *"Use of different templates or formats may result in a desk rejection."* All layout, fonts, spacing, and margins are governed by `acmart.cls` — no overrides are permitted.

---

## 2. Remove All Layout Overrides

The following packages and commands **must be removed** — they conflict with `acmart` and are explicitly prohibited by ACM TAPS:

| Remove | Reason |
|---|---|
| `\usepackage[a4paper,width=155mm,...]{geometry}` | `acmart` sets its own margins; any override is rejected |
| `\usepackage{setspace}` + `\onehalfspacing` | `acmart` controls line spacing |
| `\usepackage{fancyhdr}` + all `\fancyhead`/`\fancyfoot` commands | `acmart` generates its own running headers |
| All `\titleformat` / `\titlespacing` commands | `acmart` defines section heading styles |
| `\usepackage{lmodern}` | `acmart` uses Linux Libertine / Inconsolata automatically |

---

## 3. Font & Size

**Current:** 12pt Latin Modern
**Required:** `acmart` sets **9pt** body text for conference proceedings automatically. Do not specify font size manually. The font switches to Linux Libertine (body) and Inconsolata (monospace) — both are free and included in TeX Live 2015+.

---

## 4. Title Page

**Current:** Manually built with colored text, logo, and `\vspace` commands.
**Required:** Use the structured ACM author-block commands from the provided sample:
```latex
\title{Decentralized Crypto World Bank}
\author{Md. Bokhtiar Rahman Juboraz}
\orcid{XXXX-XXXX-XXXX-XXXX}
\affiliation{
  \institution{BRAC University}
  \city{Dhaka}
  \country{Bangladesh}
}
\email{student@bracu.ac.bd}
```
- Add **ORCID** for every author — register free at [orcid.org](https://orcid.org). Required by the institutional checklist and ACM author metadata standards.
- The university logo is not part of ACM format; keep it on a separate institutional cover page if the department requires it.

---

## 5. Abstract

**Current:** `\chapter*{Abstract}` — thesis style, placed as a chapter.
**Required:** Use the `abstract` environment placed *before* `\maketitle`, as in both provided sample files:
```latex
\begin{abstract}
  ...
\end{abstract}
\maketitle
```
No chapter heading. Per ACM formatting guidelines, abstract must contain plain text — avoid `\textbf`, `\textit`, or LaTeX commands inside the abstract body.

---

## 6. CCS Classification & Keywords

**Current:** Free-form bold keywords appended to the abstract.
**Required:** Two mandatory additions for all full papers (as shown in the ACM sample):

1. **CCS block** — generate at [dl.acm.org/ccs](http://dl.acm.org/ccs), then paste:
```latex
\begin{CCSXML}...\end{CCSXML}
\ccsdesc[500]{Security and privacy~Distributed systems security}
\ccsdesc[300]{Applied computing~Economics}
```
2. **Keywords command:**
```latex
\keywords{Blockchain, Decentralized Finance, Smart Contracts, ...}
```
Both are required for all papers above 2 pages. Omitting them is flagged by ACM's TAPS system.

---

## 7. Running Headers

**Current:** `fancyhdr` with "Crypto World Bank" left and "BRAC University" right in `\color{GrayText}`.
**Required:** Remove all `fancyhdr` code. Use `acmart`'s built-in mechanism:
```latex
\renewcommand{\shortauthors}{Juboraz and Ahmed}
```
`acmart` then generates properly formatted running headers automatically.

---

## 8. Colors — Decorative Use

**Current:** 8 custom colors used in headings, rules, table rows, and captions (`PrimaryBlue`, `AccentBlue`, `GrayText`, etc.).
**Required:** Remove all color from headings, horizontal rules, and captions. ACM papers use black text throughout. `xcolor` and `colortbl` *are* on the ACM TAPS approved packages list, so they may remain for functional use only (e.g., in code listings), but decorative coloring of document structure must go.

---

## 9. Figures

**Current:** Custom `\CWBIncludeDiagram` macro; `[H]` float placement throughout; no alt text.

Three required changes:

- **Float placement:** Replace `[H]` with `[!t]` (top-of-page) — standard for ACM/IEEE.
- **Alt text:** Add `\Description{...}` inside **every** figure environment. This is mandatory per ACM accessibility policy and WCAG compliance:
  ```latex
  \begin{figure}[!t]
    \includegraphics{...}
    \Description{A four-tier hierarchy diagram showing capital flow from World Bank Reserve down to individual borrowers.}
    \caption{...}
  \end{figure}
  ```
  Omitting `\Description` generates a compiler warning and is flagged at camera-ready stage.
- **File format:** All figures must be **vector format — PDF, EPS, or SVG**. No PNG or JPEG screenshots. (Institutional checklist requirement.)

---

## 10. Tables

**Current:** Heavy `colortbl` row shading with alternating blue/gray fills.
**Required:** Use clean `booktabs` style — `\toprule`, `\midrule`, `\bottomrule` — with no background color fills. Additionally:
- Right-align all numeric columns.
- Use thousand separators for large numbers (e.g., `\$26{,}300` not `\$26300`). (Checklist requirement.)
- Every table must be referenced by number in the text before it appears.

---

## 11. Code Listings

**Current:** `lstlisting` with frame, colors, and line numbers — visually heavy.
**Suggested:** Acceptable to keep, but reduce visual weight for ACM format: change `frame=single` to `frame=tb` (top/bottom only), and remove the `rulecolor=\color{AccentBlue!40}` override. `listings` is on the ACM TAPS approved packages list.

---

## 12. Bibliography & References

**Current:** Numeric `[N]` citations; no `\bibliographystyle` visible.
**Required:**
```latex
\bibliographystyle{ACM-Reference-Format}
\bibliography{references}
```
- `ACM-Reference-Format` is the only accepted style.
- All entries should include **DOI** where available.
- URLs for gray literature (GitHub, protocol docs) must include an `accessed` date field.
- The inline GitHub `\href` in the Introduction must be moved to a proper `\bibitem` entry.

---

## 13. Abbreviations

**Current:** Standalone "List of Abbreviations" chapter.
**Required for ACM paper:** Remove the chapter. Define each abbreviation **at first use inline**: e.g., `Decentralized Finance (DeFi)`. (Institutional checklist requirement.) The chapter may stay in the pre-thesis document for the university submission, but should not appear in any future paper submission.

---

## 14. TAPS-Incompatible Packages

The following packages used in the current file are **not on the ACM TAPS approved list** and must be replaced before any submission:

| Package | Status | Action |
|---|---|---|
| `tcolorbox` | ❌ Not approved | Replace with `framed` (approved) or remove |
| `tikz` / `pgf` | ❌ Not approved | Convert diagrams to pre-rendered PDF/EPS |
| Custom `.sty` files | ❌ Not approved | Inline or remove |

Packages that **are** approved and safe to keep: `amsmath`, `amssymb`, `graphicx`, `hyperref`, `xcolor`, `colortbl`, `listings`, `microtype`, `geometry`, `setspace`, `fancyhdr`, `enumitem`, `booktabs`, `multirow`, `url`.

---

## 15. Plagiarism & AI Score

- Similarity score must be **below 4%** before any submission. (Institutional checklist requirement.)
- Run through Turnitin + grammar check per the checklist link before finalizing.

---

## Priority Order

| Priority | Item |
|---|---|
| 🔴 Critical | 1, 2, 3 — Template switch cascades and fixes most other issues |
| 🔴 Critical | 14 — TAPS incompatible packages cause production failure |
| 🟡 Required | 4, 5, 6, 7 — Author block, abstract, CCS, headers |
| 🟡 Required | 9 — Alt text on figures (mandatory ACM accessibility policy) |
| 🟢 Important | 8, 10, 11, 12 — Colors, tables, listings, bibliography |
| 🟢 Good practice | 13, 15 — Abbreviations inline, plagiarism check |

---

*Sources: [ACM TAPS LaTeX Best Practices](https://www.acm.org/publications/taps/latex-best-practices) · [ACM TAPS Approved Packages](https://authors.acm.org/proceedings/production-information/accepted-latex-packages) · [ACM Describing Figures](https://authors.acm.org/proceedings/production-information/describing-figures) · [SIGCHI Accessibility Guide](https://sigchi.org/resources/guides-for-authors/accessibility/) · Provided samples: `sample-acmsmall-conf.tex`, `sample-acmsmall-submission.tex`*
