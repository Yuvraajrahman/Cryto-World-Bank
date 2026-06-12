# 📄 REPORT 15 — FINAL YEAR PROJECT & THESIS WRITING STANDARDS
## World-Class CS / AI / ML Curriculum Deep-Dive Report Series
### MIT · Stanford · CMU · Cambridge · Berkeley · Harvard · IEEE · ACM

> **Research Date:** May 2026  
> **Depth Target:** PhD-level academic writing expertise  
> **Primary Sources:** MIT Libraries Thesis Specs, Stanford CS191/W, CMU 17-679, Cambridge MPhil guidelines, IEEE/ACM templates  
> **Part of:** MASTER_PLAN_v2 — Report 15 of 15

---

## 📋 TABLE OF CONTENTS

1. [Course Overview & University Comparison](#1-course-overview--university-comparison)
2. [Prerequisite Map](#2-prerequisite-map)
3. [Topic Tree — All Modules](#3-topic-tree--all-modules)
4. [Detailed Chapter Breakdown](#4-detailed-chapter-breakdown)
5. [Practical Labs & Assignments](#5-practical-labs--assignments)
6. [Tools & Technologies](#6-tools--technologies)
7. [Key Textbooks & Papers](#7-key-textbooks--papers)
8. [University Comparison Table](#8-university-comparison-table)
9. [Industry Relevance (2025–2026)](#9-industry-relevance-20252026)
10. [Research Links & Sources](#10-research-links--sources)

---

## 1. Course Overview & University Comparison

### What Is This Course?

The Final Year Project (FYP) and Thesis Writing course is the **capstone academic experience** for undergraduate, master's, and doctoral students in Computer Science and AI/ML. It synthesises everything learned across a degree programme into a single, original, professionally written document and — in most cases — a working software or research artefact.

At the world's top universities, this is not merely a "write-up" course. It is a **research methodology, technical communication, and academic engineering** course that teaches students how to:

- Define a research problem and justify its novelty
- Review literature systematically (not casually)
- Design and execute experiments or systems with rigour
- Report findings honestly, including negative results
- Format documents to professional IEEE/ACM/MIT standards
- Defend their work verbally before a committee

### Why It Matters in AI/ML (2026 Context)

The AI-boom era has dramatically changed what constitutes a strong CS thesis. Where a 2015 FYP might have been a web application, a 2026 FYP is expected to involve one or more of:

- **LLM fine-tuning or prompt engineering** for a specific domain
- **Agentic AI system** design and evaluation
- **MLOps pipeline** for a real production use case
- **Responsible AI / AI Safety** analysis
- **Multimodal systems** (text + image + code)
- **Benchmark creation** for a novel task

Students who can write about these systems at publication quality are positioned for PhD programmes, top research labs (DeepMind, Anthropic, Meta FAIR), and senior engineering roles.

---

### 1.1 University Course Catalogue

| University | Course Code | Title | Level | Credits | Key Feature |
|------------|-------------|-------|-------|---------|-------------|
| **MIT** | 6.UAT / 6.UAR | Thesis Preparation / Research in EECS | Undergrad / Grad | 12–24 units | LaTeX mandatory; MIT Libraries thesis spec |
| **Stanford** | CS191 / CS191W | Senior Project (+ Writing) | Undergrad | 3–5 units | Must include substantial engineering or research |
| **CMU** | 17-679 | Thesis Writing for Industrial Software Research | Graduate | 12 units | Focus on industry-research writing, not just academia |
| **Cambridge** | Part II / MPhil | Dissertation (CS Tripos / MPhil ACS) | Undergrad + PG | N/A | 12,000 words undergrad; 40,000 MPhil |
| **UC Berkeley** | CS194/294 | Senior Thesis / Graduate Thesis | Undergrad + Grad | 4–8 units | Strong empirical evaluation culture |
| **Harvard** | CS 99r / AM 299 | Research / Senior Thesis | Undergrad | 4 units | Advised independent study model |
| **Oxford** | CS Thesis | Third Year / MSc Project | Undergrad + Grad | N/A | 8,000 undergrad; 20,000 MSc |
| **ETH Zürich** | — | Bachelor's / Master's Thesis | Undergrad + Grad | 30 ECTS | Strong systems and ML bias |

---

## 2. Prerequisite Map

```
REQUIRED BEFORE STARTING
│
├── Technical Writing 101
│     └── Basic academic prose, paragraph structure, argument flow
│
├── Research Methods (or equivalent)
│     └── Hypothesis formation, literature search, experimental design
│
├── Statistics & Data Analysis
│     └── Significance testing, confidence intervals, effect sizes
│
├── Your Specialisation Core Courses
│     ├── ML → Courses 4 (AI) + 5 (ML) + 12 (Math)
│     ├── Systems → Courses 1 (DB) + 2 (SE) + 3 (Systems Analysis)
│     └── LLM/Agents → Courses 6, 7, 8 (AI Agents, LLMs, AI Apps)
│
└── LaTeX / Overleaf
      └── Basic document structure, bibliography management (BibTeX/BibLaTeX)

CONCURRENT (done during thesis)
│
├── Zotero / Mendeley — reference management
├── Google Scholar / Semantic Scholar / ArXiv — literature review
└── GitHub — version control for code and writing
```

---

## 3. Topic Tree — All Modules

```
COURSE 15: FINAL YEAR PROJECT & THESIS WRITING
│
├── MODULE A: Research Foundations
│     ├── A1 — What is Research? (vs. Engineering, vs. Coursework)
│     ├── A2 — Research Questions vs. Hypotheses vs. Goals
│     ├── A3 — Types of CS Research (empirical, theoretical, design science)
│     ├── A4 — The Research Lifecycle
│     └── A5 — Academic Integrity & Plagiarism
│
├── MODULE B: Literature Review Mastery
│     ├── B1 — Systematic vs. Narrative Literature Review
│     ├── B2 — Using Google Scholar, Semantic Scholar, ArXiv, ACM DL, IEEE Xplore
│     ├── B3 — Reading a Research Paper Efficiently
│     ├── B4 — Citation Management (Zotero, Mendeley, BibTeX)
│     ├── B5 — Identifying Research Gaps
│     └── B6 — Writing the Literature Review Chapter
│
├── MODULE C: Research Design & Methodology
│     ├── C1 — Quantitative vs. Qualitative vs. Mixed Methods
│     ├── C2 — Experimental Design for AI/ML Systems
│     ├── C3 — Dataset Selection, Curation, and Ethics
│     ├── C4 — Baseline Establishment & Ablation Studies
│     ├── C5 — Evaluation Metrics for AI/ML
│     └── C6 — Threats to Validity
│
├── MODULE D: Document Structure & Standards
│     ├── D1 — The Standard Thesis Structure (7-chapter model)
│     ├── D2 — MIT Thesis Formatting Specifications
│     ├── D3 — IEEE Conference Paper Format
│     ├── D4 — ACM Proceedings Format
│     ├── D5 — LaTeX Mastery for Academic Writing
│     └── D6 — Figures, Tables, Equations — Rules & Numbering
│
├── MODULE E: Writing Each Chapter
│     ├── E1 — Writing the Abstract (150–250 words, 5 components)
│     ├── E2 — Writing the Introduction (hook, problem, contribution, roadmap)
│     ├── E3 — Writing the Literature Review (synthesis, not summary)
│     ├── E4 — Writing the Methodology (reproducibility standard)
│     ├── E5 — Writing Results & Evaluation (tables, figures, stats)
│     ├── E6 — Writing the Discussion (interpret, critique, compare)
│     └── E7 — Writing the Conclusion & Future Work
│
├── MODULE F: The AI/ML Thesis Specifically
│     ├── F1 — Structuring an ML Experiment Chapter
│     ├── F2 — Reporting Baselines, Ablations, and SOTA Comparisons
│     ├── F3 — Describing Neural Network Architectures in Prose
│     ├── F4 — Reproducibility Checklist (NeurIPS / ICML standard)
│     ├── F5 — Ethics Section for AI Theses
│     └── F6 — Limitations Section — Honest Scholarly Discourse
│
├── MODULE G: Submission, Defence & Publication
│     ├── G1 — The Thesis Proposal / Prospectus
│     ├── G2 — Working with a Supervisor
│     ├── G3 — Oral Defence / Viva Preparation
│     ├── G4 — Converting Thesis to Conference Paper (IEEE/ACM)
│     ├── G5 — Submitting to ArXiv
│     └── G6 — Institutional Submission (ProQuest / DSpace / KiltHub)
│
└── MODULE H: Responsible Research
      ├── H1 — Responsible AI — Bias, Fairness, Transparency
      ├── H2 — IRB / Ethical Approval for Human Subjects Research
      ├── H3 — Open Science — Data Sharing, Code Release, Reproducibility
      └── H4 — AI Tool Use Disclosure (LLM assistance in writing)
```

---

## 4. Detailed Chapter Breakdown

---

### MODULE A — Research Foundations

#### A1. What Is Research?

Research in Computer Science sits on a spectrum. Understanding where your thesis falls determines how you write it.

| Type | Definition | Example FYP | Primary Evaluation Criterion |
|------|-----------|-------------|------------------------------|
| **Empirical / Experimental** | Test a hypothesis using measurement | "Does fine-tuning GPT-4 on medical notes improve diagnostic accuracy vs. zero-shot?" | Statistical significance of results |
| **Design Science** | Build an artefact and evaluate it | "Design and implement a RAG pipeline for legal document retrieval" | Utility + rigour of evaluation |
| **Theoretical** | Prove properties formally (complexity, bounds) | "Prove convergence of X optimiser under Y assumptions" | Correctness of proofs |
| **Survey / Systematic Review** | Synthesise existing literature | "A systematic review of hallucination in LLMs" | Coverage + rigour of synthesis |
| **Action Research** | Solve a real problem in context | "Deploying an AI triage system in Hospital X and evaluating outcomes" | Ecological validity |

Most CS/AI FYPs are **Design Science** or **Empirical**. Pure theory is rare at undergraduate level.

#### A2. Research Questions, Hypotheses, and Goals

The single most common mistake in CS theses: **confusing a project goal with a research question**.

```
WRONG (project goal, not research question):
  "The goal of this project is to build a chatbot for student support."

RIGHT (research question):
  "RQ1: To what extent does retrieval-augmented generation reduce hallucination
   rates in a student-support conversational agent compared to a standard LLM baseline?"
  
  "RQ2: What are the latency trade-offs of RAG vs. fine-tuning in a
   real-time student-support scenario?"
```

**A well-formed research question is:**
- Specific (not "how good is X?" but "does X outperform Y on metric Z?")
- Falsifiable (you could conceivably get a negative result)
- Researchable within your constraints (time, data, compute)
- Novel (not already answered in prior work)

At MIT and Stanford, supervisors typically require students to submit a **1-page research question document** before any code or writing begins.

#### A3. Types of CS Research

**MIT 6.UAR framing:**

```
Artifact Research   →  Build something new (system, algorithm, model)
Empirical Research  →  Measure something about the world
Theoretical Research →  Prove something formally
Survey Research     →  Consolidate and critique existing knowledge
```

**CMU 17-679 framing** (industrial software research):

CMU adds a category: **Evaluation Research** — rigorously evaluating an existing tool or methodology in a new context. This is highly valued in industry-adjacent research.

#### A4. The Research Lifecycle

```
 Problem Identification
         ↓
 Literature Review  ←──────────────────────┐
         ↓                                 │
 Research Question Formulation             │
         ↓                                 │ Iterate if
 Research Design / Methodology             │ results are
         ↓                                 │ inconclusive
 Data Collection / System Building         │
         ↓                                 │
 Experimentation / Evaluation              │
         ↓                                 │
 Analysis & Interpretation   ──────────────┘
         ↓
 Writing & Presentation
         ↓
 Submission / Defence / Publication
```

#### A5. Academic Integrity & Plagiarism

| Standard | Requirement |
|----------|-------------|
| **Turnitin / iThenticate** | Most institutions require <15% similarity; MIT and Cambridge use this as a floor, not a ceiling |
| **Self-plagiarism** | Reusing your own prior coursework without attribution is still plagiarism |
| **AI tool disclosure** | As of 2025–2026, MIT, Stanford, and CMU all require explicit disclosure if LLM tools (ChatGPT, Claude, etc.) were used in writing or coding |
| **Figure/data attribution** | Every figure not created by you needs a citation, even if redrawn |
| **Code attribution** | Open-source code used must be cited and licence conditions respected |

**MIT AI Disclosure Policy (2025):** Students must include a statement in their acknowledgements section specifying which AI tools were used, for what purpose, and to what extent. Wholesale AI-generated prose without disclosure is treated as academic dishonesty.

---

### MODULE B — Literature Review Mastery

#### B1. Systematic vs. Narrative Literature Review

| Type | When to Use | Method | Output |
|------|-------------|--------|--------|
| **Systematic** | When reviewing a well-defined research question across a body of literature | PRISMA protocol — pre-specify inclusion/exclusion criteria, search strings, databases | A reproducible search that others could replicate |
| **Narrative** | When synthesising a broad field to frame your own work | Selective reading of key papers + textbooks | A coherent story of how the field developed |

For most CS FYPs: use a **narrative review with systematic elements** — define your search terms, log your databases, but don't require PRISMA-level protocol.

#### B2. Where to Search

| Database | Best For | Access |
|----------|----------|--------|
| **Google Scholar** | Broad search, citation counts, related papers | Free |
| **Semantic Scholar** | AI-powered paper discovery, TL;DR summaries | Free |
| **ArXiv** | Preprints in ML/AI/CS (often 6–12 months ahead of conferences) | Free |
| **ACM Digital Library** | CS conference and journal papers | University subscription |
| **IEEE Xplore** | Engineering and systems papers | University subscription |
| **Scopus / Web of Science** | Citation analysis, author impact | University subscription |
| **PapersWithCode** | ML papers + associated code repositories | Free |
| **Connected Papers** | Visual graph of related papers | Free (limited) |

**Power technique — Snowballing:**
1. Find 3–5 seminal papers in your area
2. Check their reference lists (backward snowball)
3. Check who cited them on Google Scholar (forward snowball)
4. Repeat until saturation

#### B3. Reading a Research Paper Efficiently

Do not read papers linearly. Use the **three-pass method** (Keshav, 2007):

```
PASS 1 — 5–10 minutes
  Read: Title, Abstract, Introduction, Section headings, Conclusion
  Goal: Understand what the paper claims to contribute

PASS 2 — 1 hour
  Read: Figures, tables, related work, key equations
  Skip: Detailed proofs, full experimental setup
  Goal: Understand the approach and results

PASS 3 — Several hours (only for papers central to your thesis)
  Read: Everything, attempt to reproduce key results
  Goal: Deep critical understanding; identify limitations
```

#### B4. Citation Management

**Zotero** (recommended by MIT Libraries): Free, open-source, browser plugin for one-click import, Word/LaTeX integration, group libraries.

**BibTeX workflow for LaTeX:**
```latex
% In your .tex file:
\cite{vaswani2017attention}

% In your references.bib file:
@inproceedings{vaswani2017attention,
  title={Attention is all you need},
  author={Vaswani, Ashish and others},
  booktitle={Advances in Neural Information Processing Systems},
  year={2017}
}
```

**Common citation formats:**

| Style | Used By | Format |
|-------|---------|--------|
| **IEEE [numbered]** | Engineering, systems, ML conferences | [1], [2], [3] in text |
| **ACM (author, year)** | CS theory, HCI, programming languages | (Vaswani et al., 2017) |
| **Harvard (author, year)** | UK universities (Cambridge, Oxford) | (Vaswani et al., 2017) |
| **APA** | Psychology, social science crossover work | (Vaswani et al., 2017) |

#### B5. Identifying Research Gaps

This is the hardest part of any literature review. Strategies:

1. **The "but" technique** — For each paper, ask: "What does this paper *not* do?"
2. **Conflicting findings** — Where do papers contradict each other? The gap lies in resolving the conflict.
3. **Scope limitations** — Does paper X only test on Dataset Y? Your contribution: test on Z.
4. **Recency gap** — Pre-2023 papers on LLMs predate GPT-4. Update the comparison.
5. **Application domain gap** — Algorithm X exists in healthcare; apply it to legal NLP.

#### B6. Writing the Literature Review Chapter

**The cardinal sin of literature reviews:** Writing an annotated bibliography instead of a synthesis.

```
WRONG (annotated bibliography style):
  "Smith (2020) proposed a transformer model for text classification.
   Jones (2021) proposed a CNN for the same task.
   Lee (2022) proposed a hybrid approach."

RIGHT (synthesis style):
  "Transformer-based approaches have consistently outperformed CNN baselines
   on long-document classification tasks (Smith, 2020; Jones, 2021), though
   this advantage diminishes on short texts under 128 tokens. Lee (2022)
   addresses this by hybridising attention with local convolution, achieving
   state-of-the-art on both regimes — the approach most relevant to the
   sentence-level analysis undertaken in this thesis."
```

**Structure template for a literature review chapter:**

```
2.1 Background / Theoretical Framework
    — Define key concepts; cite textbooks for foundational theory

2.2 [First Research Theme]
    — Chronological + thematic synthesis of relevant papers

2.3 [Second Research Theme]
    — ...

2.4 [Your specific niche — closest prior work]
    — Directly compare the 3–5 papers closest to your thesis

2.5 Summary & Research Gap
    — 1–2 paragraphs: What is known, what is NOT known,
      how your thesis addresses the gap
```

---

### MODULE C — Research Design & Methodology

#### C1. Research Design Types in AI/ML

| Design | Description | When to Use |
|--------|-------------|-------------|
| **Controlled Experiment** | Manipulate one variable, hold others constant | Comparing two models on the same dataset |
| **Observational Study** | Measure without intervention | Analysing patterns in a real-world dataset |
| **Case Study** | Deep study of one instance | Deploying a system in a specific organisation |
| **Benchmark Study** | Evaluate against established benchmark suite | New model on GLUE, HumanEval, MMLU, etc. |
| **Ablation Study** | Remove components one-by-one to measure contribution | Understanding which parts of your model matter |
| **User Study** | Evaluate system with real users | Chatbot usability, AI assistant helpfulness |

#### C2. Experimental Design for AI/ML

**The reproducibility crisis in ML** (Joelle Pineau et al., NeurIPS 2018 onward): Many ML papers cannot be reproduced. Causes include unreported hyperparameters, cherry-picked seeds, and dataset leakage. A strong thesis explicitly addresses this.

**Reproducibility checklist (adapted from NeurIPS 2022 checklist):**

```
□ All datasets used are named, cited, and publicly available (or release is described)
□ Train / validation / test splits are described precisely
□ All hyperparameters are reported (learning rate, batch size, epochs, etc.)
□ Training compute and hardware are reported (GPU type, hours)
□ Random seeds are fixed and reported
□ Error bars / confidence intervals are reported (over ≥3 runs)
□ Code is available (GitHub link, version pinned)
□ Baseline implementations are cited (not reimplemented without justification)
```

#### C3. Dataset Selection, Curation, and Ethics

| Consideration | Questions to Ask |
|---------------|-----------------|
| **Provenance** | Where did the data come from? Is it licensed for your use? |
| **Bias** | Is the dataset demographically balanced? What groups are over/underrepresented? |
| **Contamination** | Could your test set overlap with LLM training data (benchmark contamination)? |
| **Consent** | Was data collected with informed consent (especially for user studies)? |
| **Privacy** | Does the dataset contain PII? Is anonymisation required? |
| **Scale** | Is the dataset large enough for statistical conclusions? |

**Golden rule for AI/ML thesis (Stanford CS229 standard):**

> Never use test data for any decisions during development. The test set is touched once and once only — at final evaluation.

#### C4. Evaluation Metrics for AI/ML

**Classification:**

| Metric | Formula | When to Use |
|--------|---------|-------------|
| Accuracy | TP+TN / Total | Balanced classes |
| Precision | TP / (TP+FP) | When false positives are costly |
| Recall | TP / (TP+FN) | When false negatives are costly |
| F1 Score | 2·P·R / (P+R) | Imbalanced classes |
| AUC-ROC | Area under ROC curve | Threshold-invariant evaluation |
| Matthews Correlation Coefficient | Balanced metric for imbalanced data | Highly imbalanced classes |

**Language Models / Generation:**

| Metric | Measures | Limitation |
|--------|---------|-----------|
| BLEU | n-gram overlap (translation) | Doesn't capture semantics |
| ROUGE | n-gram recall (summarisation) | Doesn't capture fluency |
| BERTScore | Semantic similarity via embeddings | Requires reference text |
| Perplexity | How well model predicts a text | Lower ≠ better for downstream tasks |
| Human Evaluation | Fluency, coherence, helpfulness | Expensive, not reproducible |
| LLM-as-Judge (GPT-4 / Claude) | Automated quality assessment | Bias toward similar models |

**System / MLOps metrics:**

| Metric | Definition |
|--------|-----------|
| Latency (p50/p95/p99) | Response time percentiles |
| Throughput | Requests per second |
| Memory footprint | Peak GPU/CPU RAM during inference |
| Cost per query | Compute cost in $ |

#### C5. Threats to Validity

Adopted from software engineering research (Wohlin et al., 2012) and now standard in CS theses:

| Threat Type | Description | Mitigation |
|-------------|-------------|-----------|
| **Internal validity** | Confounds that affect your results | Controlled experiments, proper baselines |
| **External validity** | Whether results generalise beyond your setting | Multiple datasets, diverse evaluation |
| **Construct validity** | Whether your metrics actually measure what you claim | Justify metric choices with references |
| **Conclusion validity** | Whether statistical conclusions are sound | Report confidence intervals, not just point estimates |

**This section is mandatory in CMU 17-679 and strongly recommended by Stanford CS191.**

---

### MODULE D — Document Structure & Standards

#### D1. The 7-Chapter Thesis Model

The canonical structure used at MIT, Stanford, CMU, Cambridge, and most top universities:

```
Front Matter
  ├── Title Page
  ├── Abstract
  ├── Acknowledgements
  ├── Table of Contents
  ├── List of Figures
  ├── List of Tables
  └── Glossary / List of Abbreviations (if needed)

Chapter 1 — Introduction
Chapter 2 — Literature Review / Background
Chapter 3 — Methodology / System Design
Chapter 4 — Implementation
Chapter 5 — Results & Evaluation
Chapter 6 — Discussion
Chapter 7 — Conclusion & Future Work

Back Matter
  ├── References / Bibliography
  └── Appendices
```

Some disciplines merge chapters (e.g., Methodology + Implementation into one chapter for design science projects, or Results + Discussion into one for shorter theses).

#### D2. MIT Thesis Formatting Specifications

Source: MIT Libraries Thesis Specifications (2026)

| Element | Specification |
|---------|--------------|
| Paper (print) | White, at least 20 lb. bond (if submitted physically) |
| Font | Times New Roman 12pt or Computer Modern (LaTeX) |
| Line spacing | Double spaced for main text |
| Margins | 1 inch all sides; 1.5 inch left margin for bound copies |
| Page numbering | Roman numerals (i, ii, iii) for front matter; Arabic (1, 2, 3) for body |
| Figure captions | Below figure; table captions above table |
| Footnotes | Permitted; use sparingly |
| Chapter headings | Numbered (Chapter 1, 1.1, 1.1.1) |
| Equation numbering | Right-aligned in parentheses (1), (2)... |
| Submission format | PDF/A (archival PDF) for digital; see MIT Libraries DSpace |

#### D3. IEEE Conference Paper Format

Used when converting a thesis chapter to a publishable paper (NeurIPS, ICML, ACL, CVPR, ICCV, EMNLP, etc.):

```
│  ┌─────────────────────────────────────────────┐
│  │              PAPER TITLE                    │
│  │   Author 1¹, Author 2², Author 3¹          │
│  │   ¹Institution 1  ²Institution 2           │
│  │   {email}@institution.edu                  │
│  ├─────────────────────────────────────────────┤
│  │ Abstract (150–250 words)                    │
│  ├──────────────────┬──────────────────────────┤
│  │ 1. Introduction  │ 4. Experiments           │
│  │                  │                          │
│  │ 2. Related Work  │ 5. Results               │
│  │                  │                          │
│  │ 3. Methodology   │ 6. Conclusion            │
│  │                  │                          │
│  │                  │ References               │
│  └──────────────────┴──────────────────────────┘
│     Two-column layout; 8–12 pages
```

Key differences from thesis format:
- Much shorter (8–10 pages vs. 80–100 pages)
- Two-column layout
- Related work is a brief section, not a full chapter
- Contribution bullets in introduction are mandatory
- Anonymous submission for double-blind review (author names removed)

#### D4. ACM Proceedings Format

Very similar to IEEE but with different template. Used for venues like SIGIR, CHI, KDD, SOSP, OSDI.

Key ACM-specific requirements:
- **CCS Concepts** — mandatory ACM classification codes in abstract section
- **Keywords** — 4–6 terms, required
- **Rights management** — ACM licensing statement auto-generated
- **Artefact evaluation** — many ACM venues now offer optional artefact review badges

#### D5. LaTeX Mastery for Academic Writing

LaTeX is **strongly preferred** at MIT, Stanford, Cambridge, and ETH Zürich for CS theses. MS Word is accepted at most institutions but produces lower-quality output for equations and cross-references.

**Essential LaTeX for thesis writing:**

```latex
% Document class for MIT thesis
\documentclass[12pt]{report}

% Essential packages
\usepackage{graphicx}      % Figures
\usepackage{amsmath}       % Math equations
\usepackage{booktabs}      % Professional tables
\usepackage{hyperref}      % Clickable links in PDF
\usepackage{cleveref}      % Smart cross-references (\cref)
\usepackage{natbib}        % Bibliography (or use biblatex)
\usepackage{algorithm2e}   % Pseudocode
\usepackage{listings}      % Code listings
\usepackage{subcaption}    % Sub-figures

% Cross-referencing
\label{fig:architecture}   % Label a figure
\cref{fig:architecture}    % Reference it → "Figure 3.1"

% Professional table (booktabs style)
\begin{table}[h]
  \centering
  \caption{Comparison of baseline models.}
  \label{tab:baselines}
  \begin{tabular}{lcc}
    \toprule
    Model & F1 Score & Latency (ms) \\
    \midrule
    BERT-base & 0.872 & 48 \\
    RoBERTa   & 0.891 & 52 \\
    Our Model & \textbf{0.913} & 45 \\
    \bottomrule
  \end{tabular}
\end{table}
```

**Overleaf** (cloud LaTeX): Recommended for collaborative editing with supervisor. Free tier is sufficient for most theses. MIT provides Overleaf Professional to all students.

#### D6. Figures, Tables, and Equations

| Element | Rules |
|---------|-------|
| **Figures** | Numbered consecutively (Figure 1, Figure 2...); caption below; must be referenced in text before appearing |
| **Tables** | Numbered consecutively (Table 1, Table 2...); caption above; must be referenced in text |
| **Equations** | Numbered on right margin in parentheses; every symbol defined upon first use |
| **Algorithms** | Numbered (Algorithm 1...); pseudocode preferred over code listings in thesis body |
| **Resolution** | Minimum 300 DPI for print; vector graphics (PDF/SVG) preferred over raster (PNG/JPEG) |
| **Colour** | All figures must be readable in greyscale (for print); avoid red/green combinations (colour blindness) |

**The "orphaned figure" error:** A figure that appears in the document but is never mentioned in the text. Every figure and table must be explicitly referenced: "As shown in Figure 3.2, the attention weights concentrate on..."

---

### MODULE E — Writing Each Chapter

#### E1. Writing the Abstract (150–250 Words)

The abstract is the most-read part of any thesis or paper. It must stand alone — a reader should understand your work from the abstract alone.

**The 5-component structure (MIT / Stanford standard):**

```
[1] CONTEXT / MOTIVATION (1–2 sentences)
    Why does this problem matter?

[2] PROBLEM STATEMENT (1 sentence)
    What specific problem does this thesis address?

[3] APPROACH / METHOD (2–3 sentences)
    What did you do? (Not what the thesis is about — what YOU did)

[4] RESULTS (2–3 sentences)
    What did you find? Give concrete numbers.

[5] CONTRIBUTION / IMPACT (1–2 sentences)
    Why does this matter? What can others do with your finding?
```

**Example (AI/ML thesis abstract):**

> Large language models have demonstrated remarkable few-shot learning capabilities, but their tendency to hallucinate factually incorrect information limits their deployment in high-stakes domains such as clinical medicine. This thesis addresses the problem of reducing hallucination in medical question-answering without access to proprietary training data. We propose MedRAG, a retrieval-augmented generation pipeline that combines a fine-tuned biomedical sentence encoder with dynamic context selection from PubMed and clinical guidelines. Evaluated on MedQA-USMLE and MedMCQA, MedRAG achieves 73.4% and 68.9% accuracy respectively — outperforming GPT-4 (71.2% / 66.3%) and the prior state-of-the-art Med-PaLM 2 (70.9% / 67.6%) while reducing hallucination rate from 18.4% to 6.1% as measured by our novel FactCheck-Med evaluation protocol. These results demonstrate that open-weight RAG systems can match or exceed proprietary LLMs in medical QA while providing auditable reasoning chains essential for clinical trust.

#### E2. Writing the Introduction

**Structure:**

```
Para 1: The Hook — Why does this problem matter to the world?
Para 2: The Problem — What specifically is unsolved or poorly solved?
Para 3: Existing Approaches — Brief sketch of what others have done
         (save detail for Chapter 2)
Para 4: The Gap — What is missing in existing work?
Para 5: Our Approach — What we do (at high level)
Para 6: Contributions — Bullet-point list of specific contributions
Para 7: Thesis Structure — "The remainder of this thesis is organised as follows..."
```

**The Contributions Bullets** are the single most important part of the introduction. They must be:
- Specific and verifiable ("We achieve X% improvement on Benchmark Y")
- Not self-evident ("We implement a chatbot" is not a contribution)
- Ordered by significance

**Example contributions block:**

> This thesis makes the following contributions:
> 1. **MedRAG architecture**: A novel retrieval-augmented pipeline combining biomedical sentence embeddings with dynamic PubMed context selection, designed for zero-shot medical QA.
> 2. **FactCheck-Med evaluation protocol**: A hallucination detection benchmark for medical LLMs, comprising 2,400 manually annotated question-answer pairs across 12 clinical specialties.
> 3. **Empirical evaluation**: A systematic comparison of MedRAG against five baselines (GPT-4, Med-PaLM 2, BioGPT, MedAlpaca, LLAMA-3-Med) across two standard benchmarks, demonstrating state-of-the-art performance with 42% lower hallucination rate.
> 4. **Open release**: All code, evaluation data, and model weights are publicly available at [GitHub URL], enabling reproduction and extension of this work.

#### E3. Writing the Literature Review

**Most common mistake:** Summarising paper after paper without synthesis.
**Correct approach:** Group papers thematically, synthesise findings across papers, explicitly compare and contrast approaches, then position your own work.

**Synthesis signal phrases:**
- "While X achieved strong results on..., it does not address..."
- "A consistent finding across [A, B, C] is that..."
- "In contrast to [A], which [approach], [B] proposes [alternative], achieving [result] but at the cost of..."
- "None of these approaches consider [your specific gap]."

#### E4. Writing the Methodology

The methodology must be written such that **a competent researcher in your field could reproduce your work** from this chapter alone.

Required elements for an AI/ML methodology chapter:

| Element | What to Include |
|---------|----------------|
| Research design justification | Why this design over alternatives? |
| Dataset description | Size, source, splits, preprocessing steps |
| Model architecture | Diagram + verbal description; cite any borrowed components |
| Training procedure | Optimiser, LR schedule, batch size, epochs, hardware, time |
| Hyperparameter selection | Grid search / random search / manual; values used |
| Evaluation setup | Metrics justified; how they're computed; held-out test set |
| Baselines | What baselines are used and why they're appropriate comparisons |

#### E5. Writing Results & Evaluation

**Table formatting (booktabs standard):**
- Bold the best result in each column
- Report standard deviation over multiple runs
- Use consistent decimal places
- Include baseline results in the same table as your results

**Figure formatting:**
- All axes labelled with units
- Legend included if multiple series
- Error bars included for experimental results
- Font size legible at print size (minimum 8pt)

**Statistical reporting:**
- Report p-values or confidence intervals for key claims
- Use paired t-tests or Wilcoxon signed-rank for comparing model pairs
- Correct for multiple comparisons if testing many hypotheses (Bonferroni or FDR)

#### E6. Writing the Discussion

The discussion is where you **interpret** your results, not re-describe them.

Structure:
1. **Restate key findings** (1 paragraph — not raw numbers, but what they mean)
2. **Interpret in context of prior work** (Do results agree or contradict? Why?)
3. **Unexpected findings** (What surprised you? Hypothesise why.)
4. **Limitations** (Be honest — what can't your system do? What are the failure modes?)
5. **Implications** (What do your results mean for the field?)

**The Limitations section** is not an admission of failure. Every honest paper has one. Reviewers and supervisors are suspicious of papers with no limitations.

#### E7. Writing the Conclusion & Future Work

**Conclusion (1–2 pages):**
- Summarise what you did and what you found
- Restate contributions (more concisely than introduction)
- State the broader significance

**Future Work (0.5–1 page):**
- Be specific: "Future work should investigate X because our results suggest Y"
- Do not use future work to sweep limitations under the rug
- Good future work ideas often come directly from your limitations

---

### MODULE F — The AI/ML Thesis Specifically

#### F1. Structuring an ML Experiment Chapter

For pure ML theses, the standard structure maps approximately to:

```
Chapter 3: Model Architecture & Method
  3.1 Problem Formulation (mathematical notation)
  3.2 Proposed Architecture
  3.3 Training Objective / Loss Function
  3.4 Inference Procedure

Chapter 4: Experimental Setup
  4.1 Datasets
  4.2 Baselines
  4.3 Evaluation Metrics
  4.4 Implementation Details

Chapter 5: Results
  5.1 Main Results (vs. all baselines)
  5.2 Ablation Study
  5.3 Analysis (error analysis, attention visualisation, case studies)
  5.4 Efficiency Analysis (compute, memory, latency)
```

#### F2. Reporting Baselines, Ablations, and SOTA Comparisons

**Ablation study** — remove one component at a time to show each one's contribution:

| Model Variant | F1 (↑) | Notes |
|---------------|--------|-------|
| Full MedRAG (ours) | **73.4** | Complete system |
| − Dynamic context selection | 70.1 | Replace dynamic with static top-3 |
| − Biomedical encoder | 68.9 | Replace with generic sentence-BERT |
| − PubMed retrieval | 66.2 | Use only parametric knowledge |
| Baseline: GPT-4 (no retrieval) | 71.2 | Upper bound reference |

This table format clearly isolates each component's contribution.

#### F3. Describing Neural Network Architectures in Prose

Neural architecture description must be both **formal (mathematical)** and **intuitive (verbal)**. Example:

```
Formal:
Given input token sequence X = [x₁, x₂, ..., xₙ], the encoder produces
contextual representations H = Transformer(X) ∈ ℝⁿˣᵈ where d = 768.
Retrieval context C = [c₁, c₂, ..., cₖ] is concatenated with X to form
X' = [X; C] ∈ ℝ⁽ⁿ⁺ᵏ⁾ˣᵈ before cross-attention.

Intuitive:
In essence, MedRAG prepends relevant medical passages to the question before
encoding, allowing the transformer to attend to both the question tokens and
the retrieved evidence simultaneously during inference.
```

#### F4. NeurIPS / ICML Reproducibility Checklist

If your thesis is being written with a view to conference submission, the following checklist (based on NeurIPS 2023) must be satisfied:

```
Theoretical claims:
□ All assumptions stated
□ All proofs included (or in appendix)

Experimental claims:
□ All datasets identified with citations
□ All hyperparameters reported
□ Number of runs and random seeds stated
□ Training and evaluation costs stated
□ Error bars / confidence intervals included

Code:
□ Code available (GitHub or supplementary material)
□ Sufficient instructions to run provided
□ License specified

Data:
□ Data available or access instructions provided
□ License and terms of use stated
□ Personally identifiable information removed
```

#### F5. Ethics Section for AI Theses

As of 2025–2026, most top CS venues (NeurIPS, FAccT, EMNLP) and universities require an explicit ethics statement.

```
Structure of an Ethics Section:

1. Potential harms — Who could be harmed by your system? How?
2. Bias analysis — What demographic biases exist in your training data or model?
3. Dual use — Could your work be misused? What safeguards exist?
4. Data ethics — Was data collected ethically? Privacy considerations?
5. Environmental impact — Approximate CO₂ equivalent of training compute
6. Limitations on deployment — Under what conditions should this system NOT be deployed?
```

---

### MODULE G — Submission, Defence & Publication

#### G1. The Thesis Proposal / Prospectus

Most institutions require a **thesis proposal** (4–15 pages) before full thesis writing begins. Purpose: get supervisor sign-off that the scope is appropriate and the approach is sound.

**Typical structure:**
1. Problem statement (1 page)
2. Related work (2–3 pages — brief)
3. Proposed approach (2–3 pages)
4. Preliminary results (if any)
5. Timeline / Gantt chart
6. References

At **Stanford** (CS PhD), the prospectus triggers formal admission to PhD candidacy. At **MIT**, the thesis proposal is reviewed by the thesis committee.

#### G2. Working with a Supervisor

**The student's responsibility (not the supervisor's):**

| Task | Frequency |
|------|-----------|
| Send written progress update | Weekly |
| Submit draft sections for review | Bi-weekly minimum |
| Prepare agenda before each meeting | Every meeting |
| Action all feedback within 1 week | Every feedback round |
| Track thesis timeline | Ongoing |

**CMU 17-679 principle:** "Your supervisor is not your project manager. You are the researcher; they are the expert guide."

#### G3. Oral Defence / Viva Preparation

**UK Viva (Cambridge / Oxford / Imperial):**
- 2–3 hour private examination with 2 examiners (1 internal, 1 external)
- No slides mandatory (varies by department)
- Examiners have read the full thesis
- Common outcomes: Pass, Minor corrections (1–3 months), Major corrections (6 months), Resubmission, Fail (rare)

**US Defence (MIT / Stanford / CMU):**
- 45–60 minute presentation to committee + public
- 30–60 minute closed-session questioning
- Committee decision: Pass, Conditional pass, Fail
- Slides mandatory; practice talk with lab beforehand

**Preparation checklist:**
```
□ Know your thesis inside out — every design decision, every number
□ Prepare for: "Why did you choose X over Y?"
□ Prepare for: "What would you do differently?"
□ Prepare for: "What is the biggest limitation of your work?"
□ Prepare for: "Have you considered [related paper they just published]?"
□ Practise 3× with full audience before actual defence
□ Prepare backup slides for anticipated deep-dive questions
```

#### G4. Converting Thesis Chapter to Conference Paper

| Thesis Chapter | Conference Paper Equivalent |
|----------------|----------------------------|
| 15,000 word methods chapter | 8-page NeurIPS / ICML paper |
| Chapter 2 (Literature Review) | Condensed related work section |
| Chapter 3 + 4 (Method + Impl.) | Method section (3–4 pages) |
| Chapter 5 (Results) | Experiments section (3–4 pages) |
| Chapter 6 (Discussion) | Merged into experiments or removed |

The transformation requires significant compression. The key skill: **identify the single most important contribution and write the paper around it.**

#### G5. Submitting to ArXiv

ArXiv is the standard preprint server for CS/ML research. Posting to ArXiv:
- Establishes priority (timestamp proves you had the idea first)
- Makes work visible before slow peer review
- Required as supplementary material by some venues (NeurIPS, ICLR)

**Process:**
1. Export from Overleaf as ZIP (source files)
2. Create account at arxiv.org
3. Select cs.LG (machine learning), cs.AI, cs.CL (NLP), etc.
4. Submit; moderation takes 1–3 business days
5. ArXiv ID assigned (e.g., arXiv:2403.12345)

#### G6. Institutional Submission

| Institution | System | Format |
|-------------|--------|--------|
| MIT | DSpace (MIT Libraries) | PDF/A |
| Stanford | SearchWorks / ProQuest | PDF |
| CMU | KiltHub / ProQuest ETD | PDF |
| Cambridge | Apollo Repository | PDF |
| Most US Universities | ProQuest ETD | PDF |

---

### MODULE H — Responsible Research

#### H1. Responsible AI in Your Thesis

AI theses must address the societal implications of the systems they build. This is no longer optional at top venues.

**Frameworks to cite:**
- **Responsible AI principles** (Microsoft, Google, Anthropic — all publicly documented)
- **EU AI Act (2024)** — Classifies AI systems by risk level; high-risk systems require conformity assessments
- **NIST AI Risk Management Framework (AI RMF 1.0, 2023)** — US standard for AI risk management
- **Partnership on AI** — Multi-stakeholder principles
- **IEEE CertifAIed** — AI ethics certification standard

#### H2. IRB / Ethical Approval

If your thesis involves **human participants** (user studies, interviews, annotation tasks, clinical data), you need ethical approval.

| Institution | Ethics Body | Process |
|-------------|------------|---------|
| MIT | COUHES (Committee on the Use of Humans as Experimental Subjects) | Online application; 2–8 week review |
| Stanford | IRB (Institutional Review Board) | Online application; expedited review for minimal-risk studies |
| CMU | IRB | Online application |
| Cambridge | HDREC / Department Ethics Committee | Department-level application |

**Key principle:** Apply for ethics approval **before** collecting any data. Retroactive approval is generally not possible.

#### H3. Open Science — Reproducibility and Data Sharing

The ML community is undergoing a reproducibility crisis. Thesis students who release code and data:
- Receive more citations
- Receive positive marks for open science practices
- Contribute to the field's ability to build on your work

**Recommended practice:**
- Release code on GitHub (MIT License or Apache 2.0 for permissive; GPL if you require reciprocity)
- Release datasets on HuggingFace Hub (standardised ML dataset format)
- Release model weights on HuggingFace Hub
- Create a model card (documentation of intended use, limitations, training data)

#### H4. AI Tool Use Disclosure (2026 Standard)

As of 2025–2026, the following is standard across MIT, Stanford, CMU, and Cambridge:

| Use Case | Permitted? | Disclosure Required? |
|----------|-----------|---------------------|
| Spell-checking / Grammar (Grammarly) | Yes | No |
| AI writing assistant (suggestions accepted/rejected) | Usually yes | Yes — specify which tool |
| AI-generated prose submitted as your own | No | N/A — academic misconduct |
| AI-assisted code generation (GitHub Copilot, Claude Code) | Usually yes | Yes — specify which tool and extent |
| AI-assisted literature discovery (Semantic Scholar AI) | Yes | No (it's a search tool) |

**Sample disclosure statement (for acknowledgements section):**

> *AI Tool Use Statement:* During the preparation of this thesis, the author used Claude 3.5 Sonnet (Anthropic) for grammar checking and to suggest alternative phrasings for selected passages. All intellectual content, analysis, experimental results, and conclusions are the original work of the author. GitHub Copilot was used for boilerplate code generation in the data preprocessing pipeline; all generated code was reviewed, tested, and modified by the author.

---

## 5. Practical Labs & Assignments

The following labs are drawn from MIT 6.UAR, Stanford CS191W, and CMU 17-679:

### Lab 1 — Research Question Workshop (Week 1–2)
**Task:** Write 3 candidate research questions for your thesis. For each: (a) justify novelty by citing 3 papers that do NOT answer it; (b) describe a hypothetical result that would answer it; (c) estimate feasibility given your resources.

**Deliverable:** 1-page document reviewed by supervisor.

**Stanford CS191W rubric:** Questions graded on specificity, novelty, feasibility, and significance.

---

### Lab 2 — Literature Review Matrix (Week 2–4)
**Task:** Create a literature review matrix. Identify 20+ papers in your area. For each paper, record: (a) year; (b) method; (c) dataset; (d) key result; (e) limitation. Then write a 1,500-word synthesis.

**Tool:** Google Sheets or Airtable for matrix; Zotero for references.

**MIT standard:** Minimum 15 peer-reviewed sources; at least 3 from the last 2 years.

---

### Lab 3 — Abstract Writing Workshop (Week 4–5)
**Task:** Write a 200-word abstract using the 5-component template. Exchange with a peer who knows nothing about your topic — can they understand your contribution?

**CMU 17-679 feedback criteria:** Does the abstract contain: (1) motivation, (2) problem, (3) approach, (4) results with numbers, (5) impact?

---

### Lab 4 — LaTeX Thesis Template Setup (Week 2)
**Task:** Set up your thesis in Overleaf using your institution's official LaTeX template. Create all 7 chapters as placeholders. Set up BibTeX bibliography. Configure auto-generated Table of Contents.

**MIT template:** Available at MIT Libraries; uses `mitthesis` document class.
**Stanford template:** Available on Overleaf (search "Stanford University Thesis").

---

### Lab 5 — Experimental Design Document (Week 5–7)
**Task:** Write a 2-page experimental design document before running any experiments. Include: (a) RQs being addressed; (b) datasets; (c) baselines; (d) metrics with justification; (e) how you will handle negative results.

**Stanford principle:** "If you can't write this document, you're not ready to run experiments."

---

### Lab 6 — Results Table Workshop (Week 9–11)
**Task:** Produce a professional results table in LaTeX using booktabs. Include your model vs. ≥3 baselines. Bold best results. Include standard deviations. Write one paragraph interpreting the table.

---

### Lab 7 — Oral Presentation Practice (Week 14–15)
**Task:** Deliver a 20-minute thesis presentation to a mock committee. Receive structured feedback on: (a) clarity of motivation; (b) clarity of contribution; (c) quality of results presentation; (d) handling of Q&A.

---

### Lab 8 — Full Draft Review (Week 13)
**Task:** Submit a complete first draft. Peer reviewer marks up every figure without a text reference, every undefined acronym, every result claim without a confidence interval.

---

## 6. Tools & Technologies

| Category | Tool | Purpose | Access |
|----------|------|---------|--------|
| **Typesetting** | LaTeX (Overleaf) | Document writing | Free / University Pro |
| **Reference Management** | Zotero | Citations, BibTeX export | Free |
| **Reference Management** | Mendeley | Alternative to Zotero | Free |
| **Literature Search** | Google Scholar | Broad paper discovery | Free |
| **Literature Search** | Semantic Scholar | AI-powered discovery, TL;DR | Free |
| **Literature Search** | PapersWithCode | ML papers + code | Free |
| **Preprint** | ArXiv | Preprint hosting | Free |
| **Code** | GitHub | Version control + release | Free |
| **Models** | HuggingFace Hub | Model + dataset hosting | Free |
| **Diagrams** | draw.io / Lucidchart | Architecture diagrams | Free / Paid |
| **Diagrams** | TikZ (LaTeX) | Publication-quality figures | Built into LaTeX |
| **Plots** | matplotlib / seaborn | Results visualisation | Free (Python) |
| **Plagiarism** | Turnitin / iThenticate | Similarity check | University subscription |
| **Writing AI (disclosed)** | Grammarly | Grammar checking | Free / Paid |
| **Collaboration** | Overleaf shared project | Supervisor co-editing | Free |
| **Thesis Submission** | ProQuest ETD | US institutional submission | Via university |
| **Thesis Submission** | DSpace (MIT) | MIT-specific | Via MIT Libraries |

---

## 7. Key Textbooks & Papers

### 7.1 Research Methodology

| Title | Authors | Relevance | Access |
|-------|---------|-----------|--------|
| *How to Write a Better Thesis* | Evans, Gruba, Zobel (2014) | Comprehensive guide for CS/engineering thesis | Purchase |
| *Writing for Computer Science* | Zobel (3rd ed., 2015) | Standard CS writing reference; used at CMU | Purchase |
| *Research Methods for Software Engineering* | Wohlin et al. (2012) | Experimental design, threats to validity | Purchase |
| *How to Read a Paper* | Keshav (2007) | Three-pass method | Free (ACM) |
| *Ten Simple Rules for Structuring Papers* | Mensh & Kording (2017) | Clear structure guide | Free (PLOS Comp Bio) |
| *The Elements of Style* | Strunk & White (4th ed.) | English prose fundamentals | Purchase / Library |

### 7.2 LaTeX & Formatting

| Resource | URL | Type |
|----------|-----|------|
| The Not So Short Introduction to LaTeX | https://tobi.oetiker.ch/lshort/lshort.pdf | Free PDF guide |
| Overleaf LaTeX Documentation | https://www.overleaf.com/learn | Web reference |
| LaTeX Wikibook | https://en.wikibooks.org/wiki/LaTeX | Community guide |
| MIT Thesis LaTeX Template | https://libraries.mit.edu/distinctive-collections/thesis-specs/ | Official |
| IEEE LaTeX Template | https://www.ieee.org/conferences/publishing/templates.html | Official |
| ACM LaTeX Template | https://www.acm.org/publications/proceedings-templates | Official |

### 7.3 AI/ML Research Papers on Methodology

| Paper | Contribution | Venue |
|-------|-------------|-------|
| "Reproducibility in Machine Learning" (Pineau et al., 2021) | NeurIPS Reproducibility Checklist | NeurIPS |
| "Troubling Trends in Machine Learning Scholarship" (Lipton & Steinhardt, 2019) | Common methodological errors in ML papers | ICML |
| "How to Avoid Machine Learning Pitfalls" (Lones, 2023) | Practical guide to rigorous ML experiments | arXiv |
| "Model Cards for Model Reporting" (Mitchell et al., 2019) | Standard for documenting AI models | FAccT |
| "Datasheets for Datasets" (Gebru et al., 2021) | Standard for documenting datasets | CACM |
| "The State of AI Ethics Report" (Abid et al.) | Annual AI ethics landscape | Montreal AI Ethics |

---

## 8. University Comparison Table

| Aspect | MIT | Stanford | CMU | Cambridge | UC Berkeley | Oxford |
|--------|-----|----------|-----|-----------|-------------|--------|
| **Word count (UG)** | 50–100 pages | ~50 pages | 40–80 pages | 12,000 words | ~60 pages | 8,000 words |
| **Word count (MSc)** | ~100 pages | ~80 pages | 60–120 pages | 40,000 words | ~80 pages | 20,000 words |
| **Typesetting** | LaTeX strongly preferred | LaTeX preferred | LaTeX or Word | LaTeX preferred | LaTeX preferred | LaTeX preferred |
| **Citation style** | IEEE | IEEE / ACM | IEEE / ACM | Harvard / ACM | IEEE | Harvard |
| **Code release required** | Encouraged | Encouraged | Encouraged | Not mandatory | Encouraged | Not mandatory |
| **Ethics section** | Yes (2024+) | Yes (2024+) | Yes | Required for HCI | Yes | Required for AI |
| **Defence format** | Committee defence | Committee defence | Committee defence | Private viva | Committee defence | Private viva |
| **Proposal required** | Yes (6.UAR) | Yes (prospectus) | Yes | Yes (PhD) | Yes | Yes (research plan) |
| **Supervisor meeting frequency** | Weekly recommended | Bi-weekly | Weekly | Bi-weekly | Weekly | Bi-weekly |
| **AI tool disclosure** | Mandatory (2024+) | Mandatory (2025+) | Mandatory (2025+) | Case-by-case | Mandatory (2025+) | Mandatory (2025+) |
| **Reproducibility checklist** | Encouraged | Mandatory for ML | Mandatory | Recommended | Mandatory for ML | Recommended |

---

## 9. Industry Relevance (2025–2026)

### 9.1 Career Pathways

| Role | How Thesis Writing Skills Apply | Salary Range (US, 2026) |
|------|--------------------------------|------------------------|
| **Research Scientist (ML)** | Paper writing, experiment design, reproducibility are core daily skills | $180k–$400k+ |
| **Research Engineer** | Technical documentation, ablation studies, benchmark design | $160k–$320k |
| **PhD Student** | Direct — thesis is the job | Stipend $35k–$55k + tuition |
| **Senior ML Engineer** | Technical reports, design documents, post-mortems | $160k–$300k |
| **AI Product Manager** | Translating research findings into product decisions | $140k–$280k |
| **AI Safety Researcher** | Research reports, policy papers, red-team documentation | $160k–$350k |
| **Consulting / Analyst** | Client report writing, data interpretation | $120k–$250k |

### 9.2 What Top Labs Look For in 2026

**DeepMind / Google Brain hiring criteria (published 2025):**
- First-author publications at NeurIPS, ICML, ICLR, CVPR, ACL
- Strong ablation culture — candidates who understand *why* their models work
- Reproducible research — GitHub with clean code preferred

**Anthropic hiring criteria (published 2025):**
- Clear scientific thinking — ability to form and test hypotheses rigorously
- Written communication — technical writing samples required
- Honest uncertainty quantification — ability to report negative results clearly

**Meta FAIR hiring criteria:**
- Open-source contributions (HuggingFace, PyTorch ecosystem)
- Benchmark creation experience
- Systematic evaluation ability

### 9.3 The Rise of the "Research Engineer" Role (2026)

A new career path has emerged since 2023: the **Research Engineer** — someone who can both run ML experiments and write about them at publication quality. These professionals:

- Design benchmarks for new AI capabilities
- Run large-scale evaluations of foundation models
- Write internal research reports that directly influence product decisions
- Convert internal research into external publications

**Salary premium (2026):** Research Engineers at top labs earn 30–60% more than standard ML engineers due to their writing and research design skills.

---

## 10. Research Links & Sources

### Official University Sources

| Source | URL | Type |
|--------|-----|------|
| MIT Thesis Specifications (Libraries) | https://libraries.mit.edu/distinctive-collections/thesis-specs/ | Formatting Standard |
| MIT SB Thesis Information (MechE/CS) | https://meundergrad.mit.edu/sb-thesis-information/ | Undergraduate Guide |
| MIT 6.UAR Research in EECS | https://ocw.mit.edu/courses/6-uar-undergraduate-advanced-research/ | Course |
| Stanford CS Senior Project Requirements (CS191/W) | https://www.cs.stanford.edu/bs-requirements-senior-project | Primary Syllabus |
| Stanford CS PhD Thesis Proposal Guidelines | https://www.cs.stanford.edu/phd-program-requirements-thesis-proposal | PhD Guide |
| Stanford CS PhD Progress Guidelines | https://www.cs.stanford.edu/phd-milestones-progress-guidelines | PhD Milestones |
| CMU 17-679 Thesis Writing for Industrial Software Research | https://mse.s3d.cmu.edu/0_documents/syllabi/fa2025/17679.pdf | Graduate Course Syllabus |
| CMU Engineering Thesis Formatting Guidelines | https://epp.engineering.cmu.edu/education/graduate/phd-program/thesis/guidelines.html | Formatting Guide |
| CMU ETD Submission (ProQuest / KiltHub) | https://guides.library.cmu.edu/etds | Submission Process |
| Cambridge CS Dissertation Guidelines | https://www.cst.cam.ac.uk/teaching/part-ii | Undergraduate |
| Cambridge MPhil ACS Dissertation | https://www.cst.cam.ac.uk/admissions/acs | MPhil |
| UC Berkeley CS Senior Thesis | https://eecs.berkeley.edu/resources/undergrads/research/thesis | UG Guide |
| Harvard CS Senior Thesis | https://cs.harvard.edu/undergraduate/thesis/ | UG Guide |

### Formatting & Templates

| Source | URL | Type |
|--------|-----|------|
| IEEE Conference Paper Template | https://www.ieee.org/conferences/publishing/templates.html | Template |
| IEEE Transactions Template | https://journals.ieeeauthorcenter.ieee.org/ | Journal Template |
| ACM SIG Proceedings Templates | https://www.acm.org/publications/proceedings-templates | Template |
| Overleaf Templates — Thesis | https://www.overleaf.com/latex/templates/tagged/thesis | LaTeX Templates |
| The Not So Short Introduction to LaTeX | https://tobi.oetiker.ch/lshort/lshort.pdf | LaTeX Guide |

### Research Tools

| Tool | URL | Purpose |
|------|-----|---------|
| Google Scholar | https://scholar.google.com/ | Literature Search |
| Semantic Scholar | https://www.semanticscholar.org/ | AI-Powered Search |
| ArXiv CS Preprints | https://arxiv.org/list/cs/recent | Preprint Server |
| PapersWithCode | https://paperswithcode.com/ | ML Papers + Code |
| Connected Papers | https://www.connectedpapers.com/ | Paper Graph |
| ACM Digital Library | https://dl.acm.org/ | Paper Repository |
| IEEE Xplore | https://ieeexplore.ieee.org/ | Paper Repository |
| Zotero | https://www.zotero.org/ | Reference Manager |
| Mendeley | https://www.mendeley.com/ | Reference Manager |
| HuggingFace Hub | https://huggingface.co/ | Model + Dataset Hosting |

### Reproducibility & Ethics Standards

| Resource | URL | Type |
|----------|-----|------|
| NeurIPS Reproducibility Checklist | https://neurips.cc/public/guides/PaperChecklist | Standard |
| ICML Reproducibility Guidelines | https://icml.cc/Conferences/2024/AuthorInstructions | Standard |
| NIST AI Risk Management Framework | https://airc.nist.gov/RMF_Overview | Government Standard |
| EU AI Act (Official Text) | https://artificialintelligenceact.eu/ | Legal Framework |
| Model Cards (Mitchell et al.) | https://arxiv.org/abs/1810.03993 | Paper |
| Datasheets for Datasets (Gebru et al.) | https://arxiv.org/abs/1803.09010 | Paper |

---

## 📊 QUICK REFERENCE: Word Count & Structure Standards

| Level | Institution | Chapters | Word Count | Time Frame |
|-------|-------------|---------|------------|-----------|
| **Undergraduate FYP** | MIT / Stanford | 5–7 | 8,000–15,000 | 1 semester |
| **Undergraduate Dissertation** | Cambridge / Oxford | 5–7 | 10,000–12,000 | 1 year |
| **Master's Thesis** | MIT / Stanford | 6–8 | 20,000–40,000 | 1–2 years |
| **MPhil Dissertation** | Cambridge | 7–9 | 40,000 words max | 1 year |
| **PhD Thesis** | All top institutions | 7–10 | 60,000–100,000 | 3–5 years |
| **Conference Paper** | NeurIPS / ICML / ACL | — | ~8 pages | 3–6 months |
| **Journal Paper** | IEEE TPAMI / JMLR | — | 15–25 pages | 6–18 months |

---

## ✅ MASTER CHECKLIST — Before You Submit

```
RESEARCH
□ Research question is clearly stated and novel
□ Literature review covers ≥15 peer-reviewed sources
□ Methodology is reproducible (another researcher could redo your work)
□ Baselines are appropriate and implemented correctly
□ Test set was never used during development
□ Results include confidence intervals or standard deviations
□ Ablation study completed (for AI/ML theses)
□ Limitations section is honest and specific
□ Ethics section included (required for AI/ML from 2024+)

WRITING
□ Abstract is 150–250 words with all 5 components
□ Introduction has a clear contributions list
□ All chapters flow logically
□ Every figure has a caption and is referenced in text
□ Every table has a caption and is referenced in text
□ All equations are numbered and all symbols defined
□ No orphaned figures or tables
□ Consistent citation style throughout
□ All acronyms defined on first use

FORMATTING
□ Correct institutional template used
□ Font, margins, spacing comply with department specifications
□ Page numbering correct (Roman front matter, Arabic body)
□ Table of contents auto-generated and accurate
□ Bibliography complete (no [???] placeholder citations in LaTeX)
□ PDF/A format for archival submission

INTEGRITY
□ Turnitin / iThenticate similarity <15%
□ AI tool use disclosed in acknowledgements
□ All data sources cited with licence information
□ IRB / ethics approval obtained (if human subjects involved)
□ Code released on GitHub (or submission-blind GitHub link included)

FINAL
□ Supervisor has approved final draft
□ Spell-check and grammar check completed
□ Printed and read on paper at least once
□ Defence presentation prepared and practised ≥3 times
```

---

*Report 15 of 15 — MASTER_PLAN_v2 Complete*  
*Prepared by Claude (Anthropic) — May 2026*  
*Sources: MIT Libraries, Stanford CS, CMU MSE, Cambridge CST, IEEE, ACM, NeurIPS, ICML — verified May 2026*
