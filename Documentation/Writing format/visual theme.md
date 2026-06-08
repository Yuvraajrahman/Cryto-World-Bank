# LaTeX Visual Templates — Academic AI Papers
Copy any block directly into your paper.

---

## Required Packages (paste into preamble)

```latex
\usepackage{pgfplots}
\pgfplotsset{compat=1.18}
\usepackage{pgf-pie}          % pie & donut charts
\usepackage{booktabs}         % \toprule \midrule \bottomrule
\usepackage{xcolor}
\usepackage{colortbl}         % \rowcolor \cellcolor
\usepackage{tabularx}         % auto-width columns
\usepackage{multirow}
\usepackage{tikz}
\usetikzlibrary{calc}

% ── Shared colour palette ────────────────────────────────
\definecolor{HeaderBg}{RGB}{44,62,80}        % dark navy
\definecolor{HeaderBg2}{RGB}{86,101,115}     % medium slate
\definecolor{RowAlt}{RGB}{234,240,245}       % light blue-grey
\definecolor{BestRow}{RGB}{26,37,47}         % near-black
\definecolor{AccentRed}{RGB}{192,57,43}      % ACM red
\definecolor{AccentBlue}{RGB}{46,134,171}    % teal-blue
\definecolor{ChartA}{RGB}{44,62,80}
\definecolor{ChartB}{RGB}{128,139,150}
\definecolor{ChartC}{RGB}{243,156,18}
\definecolor{MutedText}{RGB}{100,100,100}
```

---

## 1 — Grouped Bar Chart

```latex
\begin{figure}[t]
\centering
\begin{tikzpicture}
\begin{axis}[
    ybar,
    bar width      = 6pt,
    width          = \columnwidth,
    height         = 5.2cm,
    ylabel         = {Score (\%)},
    symbolic x coords = {BERT, GPT-2, RoBERTa, XLNet, Ours},
    xtick          = data,
    x tick label style = {font=\small, rotate=15, anchor=east},
    ymin=78, ymax=100,
    ymajorgrids    = true,
    grid style     = {dashed, gray!40},
    axis background/.style = {fill=gray!4},
    legend style   = {at={(0.98,0.05)}, anchor=south east,
                      font=\footnotesize, draw=gray!40},
    nodes near coords,
    nodes near coords style = {font=\tiny, color=black!70},
    every axis plot/.append style = {draw=none},
]
% Accuracy bars
\addplot[fill=ChartA]
  coordinates {(BERT,84.2)(GPT-2,87.5)(RoBERTa,90.1)(XLNet,88.9)(Ours,94.7)};
% F1-Score bars
\addplot[fill=ChartB]
  coordinates {(BERT,83.0)(GPT-2,86.2)(RoBERTa,89.4)(XLNet,87.5)(Ours,93.8)};
% Precision bars
\addplot[fill=ChartC]
  coordinates {(BERT,82.5)(GPT-2,85.8)(RoBERTa,88.9)(XLNet,86.9)(Ours,93.1)};

\legend{Accuracy, F1-Score, Precision}
\end{axis}
\end{tikzpicture}
\caption{Comparative model performance. \textbf{Ours} outperforms all baselines.}
\label{fig:bar}
\end{figure}
```

---

## 2 — Line Chart (Training Curves)

```latex
\begin{figure}[t]
\centering
\begin{tikzpicture}
\begin{axis}[
    width          = \columnwidth,
    height         = 4.8cm,
    xlabel         = {Epoch},
    ylabel         = {Loss},
    xmin=1, xmax=20,
    ymin=0.05, ymax=1.5,
    ymajorgrids    = true,
    grid style     = {dotted, gray!50},
    axis background/.style = {fill=gray!4},
    legend pos     = north east,
    legend style   = {font=\footnotesize},
    mark size      = 1.8pt,
    thick,
]
\addplot[color=ChartA, mark=*]
  coordinates {(1,1.42)(3,0.92)(5,0.65)(8,0.43)(12,0.28)(16,0.19)(20,0.14)};
\addplot[color=ChartB, mark=square*, dashed]
  coordinates {(1,1.55)(3,1.01)(5,0.74)(8,0.51)(12,0.35)(16,0.26)(20,0.22)};

\legend{Train Loss, Val.\ Loss}

% Annotation arrow — mark best epoch
\node[font=\tiny, text=AccentRed, align=center]
  at (axis cs:14,0.55) {Best\\epoch 16};
\draw[->, AccentRed, thin]
  (axis cs:15.2,0.48) -- (axis cs:16,0.26);
\end{axis}
\end{tikzpicture}
\caption{Training and validation loss convergence over 20 epochs.}
\label{fig:loss}
\end{figure}
```

---

## 3 — Pie Chart

```latex
\begin{figure}[t]
\centering
\begin{tikzpicture}
\pie[
    radius        = 2.3,
    color         = {ChartA, ChartB, ChartC,
                     AccentBlue, gray!35},
    text          = legend,
    before number = {},
    after number  = {\%},
    style         = {font=\small, thick},
    every only number node/.style = {font=\footnotesize\bfseries},
]{
  32/Transformer Layers,
  24/Attention Heads,
  21/Feed-Forward,
  14/Embeddings,
   9/Output Head
}
\end{tikzpicture}
\caption{Parameter distribution across model components.}
\label{fig:pie}
\end{figure}
```

---

## 4 — Donut Chart

```latex
\begin{figure}[t]
\centering
\begin{tikzpicture}
\pie[
    radius        = 2.3,
    color         = {ChartA, ChartB, ChartC, gray!25},
    text          = legend,
    before number = {},
    after number  = {\%},
    style         = {thick},
    every only number node/.style = {font=\footnotesize\bfseries},
]{
  41.2/Hits@1,
  12.8/Hits@3,
   8.1/Hits@10,
  37.9/Miss
}
% Punch out the centre to make a donut
\fill[white] (0,0) circle (1.35);
\node[font=\small\bfseries, align=center] at (0,0)
  {Train\\Split};
\end{tikzpicture}
\caption{Ranking breakdown for the proposed model.}
\label{fig:donut}
\end{figure}
```

---

## 5 — Results Table (Dark Header + Highlighted Best Row)

```latex
\begin{table}[t]
\centering
\caption{Main results on benchmark datasets (filtered MRR, Hits@k).}
\label{tab:main}
\setlength{\tabcolsep}{7pt}
\renewcommand{\arraystretch}{1.18}
\begin{tabular}{lcccc}
\toprule
% ── Dark header row ─────────────────────────────────────
\rowcolor{HeaderBg}
\textcolor{white}{\textbf{Model}} &
\textcolor{white}{\textbf{MRR}}   &
\textcolor{white}{\textbf{H@1}}   &
\textcolor{white}{\textbf{H@3}}   &
\textcolor{white}{\textbf{H@10}}  \\
\midrule
TransE              & 0.310 & 0.217 & 0.341 & 0.495 \\
\rowcolor{RowAlt}
RotatE              & 0.476 & 0.344 & 0.528 & 0.736 \\
CompGCN             & 0.492 & 0.368 & 0.541 & 0.723 \\
\rowcolor{RowAlt}
KGCN                & 0.513 & 0.387 & 0.558 & 0.740 \\
% ── Best-result row ─────────────────────────────────────
\specialrule{1.2pt}{0pt}{0pt}
\rowcolor{BestRow}
\textcolor{white}{\textbf{Ours}} &
\textcolor{white}{\textbf{0.541}} &
\textcolor{white}{\textbf{0.412}} &
\textcolor{white}{\textbf{0.581}} &
\textcolor{white}{\textbf{0.774}} \\
\bottomrule
\end{tabular}
\end{table}
```

---

## 6 — Ablation Table (Striped + Bold Best)

```latex
\begin{table}[t]
\centering
\caption{Ablation study. Each row removes one proposed component.}
\label{tab:ablation}
\setlength{\tabcolsep}{7pt}
\renewcommand{\arraystretch}{1.18}
\begin{tabular}{lccc}
\toprule
\rowcolor{HeaderBg2}
\textcolor{white}{\textbf{Configuration}} &
\textcolor{white}{\textbf{Acc.\ (\%)}}    &
\textcolor{white}{\textbf{F1 (\%)}}       &
\textcolor{white}{\textbf{Params (M)}}    \\
\midrule
Baseline (BERT-base)  & 84.2          & 83.0          & 110 \\
\rowcolor{RowAlt}
+ Component A only    & 88.9          & 87.5          &  97 \\
+ Component B only    & 87.4          & 86.1          & 111 \\
\rowcolor{RowAlt}
\textbf{+ Both (Full model)} &
\textbf{94.7} & \textbf{93.8} & \textbf{95} \\
\bottomrule
\end{tabular}
\end{table}
```

---

## 7 — Abstract Box (styled callout block)

```latex
% In preamble:
\usepackage{mdframed}
\mdfdefinestyle{abstractbox}{
  linecolor     = AccentBlue,
  linewidth     = 1.5pt,
  backgroundcolor = blue!4,
  innerleftmargin = 10pt,
  innerrightmargin = 10pt,
  innertopmargin = 8pt,
  innerbottommargin = 8pt,
  skipabove     = 8pt,
  skipbelow     = 8pt,
}

% In document:
\begin{mdframed}[style=abstractbox]
\textbf{Abstract.} Your abstract text goes here \ldots
\end{mdframed}
```

---

## Quick Reference — Common Style Rules

| What               | LaTeX                                              |
|--------------------|----------------------------------------------------|
| Bold best number   | `\textbf{0.541}`                                   |
| White text in cell | `\textcolor{white}{\textbf{Model}}`                |
| Whole row coloured | `\rowcolor{RowAlt}` before the row                 |
| Thick rule         | `\specialrule{1.2pt}{0pt}{0pt}`                    |
| Row spacing        | `\renewcommand{\arraystretch}{1.18}`               |
| Col spacing        | `\setlength{\tabcolsep}{7pt}`                      |
| Chart background   | `axis background/.style={fill=gray!4}`             |
| Chart grid         | `ymajorgrids=true, grid style={dashed, gray!40}`   |
| No border on bars  | `every axis plot/.append style={draw=none}`        |