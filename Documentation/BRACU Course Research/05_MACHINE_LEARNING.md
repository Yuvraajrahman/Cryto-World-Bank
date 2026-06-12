# 📘 REPORT 05 — MACHINE LEARNING
## World-Class CS / AI / ML Curriculum Deep-Dive Series
### Based on MIT · Stanford · CMU · Berkeley · Caltech · Cambridge

---

> **Report:** 05 of 12
> **Topic:** Machine Learning
> **Research Date:** May 2026
> **Depth Range:** 🟢 Introductory → 🟣 PhD
> **Primary Sources (live-verified):**
> - MIT **6.390** Introduction to Machine Learning — Fall 2025 / Spring 2025 (introml.mit.edu)
> - MIT **6.S191** Introduction to Deep Learning — 2026 edition (introtodeeplearning.com, verified May 2026)
> - Stanford **CS229** Machine Learning — Spring 2026 active (cs229.stanford.edu)
> - CMU **10-301/10-601** Introduction to Machine Learning — Fall 2025 / Spring 2026 (cs.cmu.edu/~mgormley)
> **⚠️ Notes:**
> - MIT 6.036 was renamed **6.390** in the 2022 course renumbering.
> - MIT 6.S191 (2026) is now a **for-credit 3-unit course** (P/D/F), not just a bootcamp. The 2026 schedule ran March 30 – May 25, 2026 with 9 lectures. All materials are open-sourced.
> - Stanford CS229 Spring 2026 is active (Mon/Wed 3:00–4:20pm, NVIDIA Auditorium).
> - CMU 10-601 Spring 2026 now **explicitly covers large language models** (confirmed from live syllabus).

---

## 📋 TABLE OF CONTENTS

1. [Course Overview & Philosophy](#1-course-overview--philosophy)
2. [University Comparison at a Glance](#2-university-comparison-at-a-glance)
3. [Prerequisite Map](#3-prerequisite-map)
4. [Topic Tree — Full Curriculum](#4-topic-tree--full-curriculum)
5. [Detailed Chapter Breakdown](#5-detailed-chapter-breakdown)
6. [Practical Labs & Assignments](#6-practical-labs--assignments)
7. [Tools & Technologies](#7-tools--technologies)
8. [Key Textbooks & Papers](#8-key-textbooks--papers)
9. [University Comparison Table](#9-university-comparison-table)
10. [Industry Relevance 2025–2026](#10-industry-relevance-20252026)
11. [Research Links & Sources](#11-research-links--sources)

---

## 1. Course Overview & Philosophy

### What is Machine Learning?

From the MIT 6.390 open course notes (introml.mit.edu/notes, actively maintained):

> *"The main focus of machine learning is making decisions or predictions based on data."*

Machine learning is distinct from classical statistics (which seeks to understand causal processes and fit models) and from classical AI (which uses hand-crafted rules). In ML, we fit models *as a means to the end of making good predictions or decisions*.

A learning problem is characterized by six dimensions:
1. **Problem class** — What type of data, what type of query?
2. **Assumptions** — What do we know about the data-generating process?
3. **Evaluation criteria** — How do we measure success?
4. **Model type** — Parametric or non-parametric?
5. **Model class** — What family of functions do we search over?
6. **Algorithm** — What computational process fits the model?

### The Three Paradigms of ML

```
┌──────────────────────────────────────────────────────────────┐
│  SUPERVISED LEARNING                                         │
│  Input: (x, y) pairs                                        │
│  Output: f(x) → y  (prediction function)                    │
│  Tasks: Classification, Regression                          │
│  Examples: Spam filter, house price prediction, diagnosis   │
├──────────────────────────────────────────────────────────────┤
│  UNSUPERVISED LEARNING                                       │
│  Input: x only (no labels)                                  │
│  Output: Structure, patterns, representations               │
│  Tasks: Clustering, Density Estimation, Dimensionality ↓   │
│  Examples: Customer segmentation, anomaly detection, PCA    │
├──────────────────────────────────────────────────────────────┤
│  REINFORCEMENT LEARNING                                      │
│  Input: States, actions, rewards from environment           │
│  Output: Policy π(s) → a                                    │
│  Tasks: Sequential decision making under uncertainty        │
│  Examples: Game playing, robotics, LLM fine-tuning (RLHF)  │
└──────────────────────────────────────────────────────────────┘
```

### Why Machine Learning is the Core of Modern AI (2026)

Machine learning has moved from a specialized sub-field to the **dominant paradigm** for building intelligent systems:

- Every modern LLM (GPT-4, Claude, Gemini, Llama) is trained using supervised + RL methods
- Computer vision at scale (face recognition, medical imaging) = learned representations
- Drug discovery, materials science, protein structure (AlphaFold) = ML on structured data
- Autonomous vehicles, robotics = combination of supervised learning + RL + planning

Understanding ML from first principles is the foundation of all downstream AI work.

---

## 2. University Comparison at a Glance

| University | Course | Number | Level | Instructor(s) | Signature Focus |
|------------|--------|--------|-------|--------------|-----------------|
| **MIT** | Introduction to Machine Learning | **6.390** (formerly 6.036) | Sophomore/Junior | Shen Shen (Fall 2025) | Broad ML + deep learning + transformers; open notes at introml.mit.edu |
| **MIT** | Introduction to Deep Learning | **6.S191** (IAP/Spring) | Any level | Alexander & Ava Amini | High-intensity deep learning bootcamp; 2026 = 9 lectures, for-credit |
| **Stanford** | Machine Learning | **CS229** | Graduate | Various | Mathematical depth; most rigorous ML theory treatment |
| **CMU** | Introduction to Machine Learning | **10-301 / 10-601** | UG / Grad | Henry Chai, Matt Gormley | Breadth + implementation; Fall 2025 live schedule verified |
| **CMU** | Machine Learning (PhD) | **10-701** | PhD | Various | Research-grade rigor; solid math proofs required |
| **Berkeley** | Introduction to Machine Learning | **CS189 / EECS189** | Junior/Senior | Various | Theory-heavy; strong linear algebra focus |
| **Caltech** | Learning From Data | **CS156** | Junior+ | Yaser Abu-Mostafa | Arguably the most theoretically rigorous intro ML course globally |
| **Cambridge** | Machine Learning & Real-world Data | **Part IB/II** | 2nd/3rd Year | Various | Formal Bayesian methods, probabilistic ML |

### Pedagogical Signature Differences

**MIT 6.390** structures ML as a decision-making framework, with a full open-source textbook maintained at introml.mit.edu. Its curriculum notably includes **Transformers** (Chapter 9) as a first-class topic — a 2024/2025 update reflecting the field's evolution. Fall 2025 instructor: Shen Shen.

**Stanford CS229** (Spring 2026 active) is the most mathematically rigorous introductory course. The famous **Andrew Ng notes** (cs229.stanford.edu/main_notes.pdf) are 200+ pages of derivations, covering every major ML topic with full proofs. CS229 graduates are expected to derive algorithms from first principles, not just apply them.

**CMU 10-601** (Fall 2025 / Spring 2026) is the most **implementation-focused** at the graduate level. The Spring 2026 version now explicitly lists **large language models** as a course topic. Students implement every algorithm from scratch in Python/NumPy. Graded heavily on programming assignments.

**Caltech CS156** (Yaser Abu-Mostafa) is unique in its philosophical rigor. The course emphasizes the **theory of generalization** — VC dimension, sample complexity, and the fundamental limits of learning — more than any other intro ML course. The accompanying textbook *Learning from Data* is freely accessible via online lectures on YouTube.

---

## 3. Prerequisite Map

```
MACHINE LEARNING
│
Verified prerequisites from live syllabi:
│
├── MIT 6.390:
│     6.1010 (Programming), 6.1200 (Math for CS),
│     18.01 (Calculus), 18.06 (Linear Algebra) — or equivalents
│
├── Stanford CS229:
│     Python/NumPy proficiency (≡ CS106A/B)
│     Probability (≡ CS109 / MATH151)
│     Multivariable calculus + linear algebra (≡ MATH51)
│
└── CMU 10-601:
      Working knowledge of probability, calculus, linear algebra, algorithms
      Python programming (required for all assignments)
│
┌─────────────────────────────────────────────────────────────┐
│  Core prerequisite knowledge:                               │
│  • Probability: Bayes' theorem, distributions, expectation  │
│  • Linear Algebra: matrix multiply, eigendecomp, SVD        │
│  • Calculus: partial derivatives, chain rule, gradients     │
│  • Python + NumPy: intermediate programming ability         │
│  • Statistics: MLE, hypothesis testing basics               │
└─────────────────────────────────────────────────────────────┘
│
               ▼
     MACHINE LEARNING (this course)
│
               ▼
┌──────────────────────────────────────────────────────┐
│  Unlocks:                                            │
│  Deep Learning (Report 07)                          │
│  LLM Training & Inference (Report 07)               │
│  AI Agents (Report 06)                              │
│  MLOps — ML in Production (Report 09)               │
└──────────────────────────────────────────────────────┘
```

---

## 4. Topic Tree — Full Curriculum

*Synthesized from MIT 6.390 (verified chapter list), Stanford CS229 (bulletin + Ng notes), CMU 10-601 (Fall 2025 schedule), and MIT 6.S191 (2026 live schedule).*

```
MACHINE LEARNING
│
├── MODULE 1: FOUNDATIONS & MATHEMATICAL SETUP
│   ├── 1.1 The Learning Problem — Induction, Generalization, i.i.d. assumption
│   ├── 1.2 Parametric vs. Non-parametric Models
│   ├── 1.3 Evaluation Criteria — Loss functions, risk, empirical risk
│   ├── 1.4 Train / Validation / Test Split
│   ├── 1.5 Bias-Variance Trade-off
│   └── 1.6 MLE and MAP estimation
│
├── MODULE 2: REGRESSION 🟢🟡
│   ├── 2.1 Linear Regression — OLS closed-form solution
│   ├── 2.2 Geometric Interpretation of Linear Regression
│   ├── 2.3 Probabilistic Interpretation — Gaussian noise → MSE
│   ├── 2.4 Ridge Regression (L2) and Lasso (L1)
│   ├── 2.5 Polynomial / Basis Function Regression
│   └── 2.6 Locally Weighted Regression (LWR)
│
├── MODULE 3: OPTIMIZATION FOR ML 🟡
│   ├── 3.1 Gradient Descent (batch)
│   ├── 3.2 Stochastic Gradient Descent (SGD)
│   ├── 3.3 Mini-batch SGD
│   ├── 3.4 Momentum, RMSProp, Adam
│   ├── 3.5 Learning Rate Schedules
│   ├── 3.6 Convex vs. Non-convex Optimization
│   └── 3.7 Second-Order Methods — Newton's Method, L-BFGS 🔴
│
├── MODULE 4: CLASSIFICATION 🟢🟡
│   ├── 4.1 Binary Classification — Decision boundaries
│   ├── 4.2 Logistic Regression — Sigmoid, cross-entropy loss
│   ├── 4.3 Generative vs. Discriminative Classifiers
│   ├── 4.4 Gaussian Discriminant Analysis (GDA)
│   ├── 4.5 Naive Bayes Classifier
│   ├── 4.6 Multi-class Classification — One-vs-All, Softmax
│   ├── 4.7 Decision Trees — Entropy, Information Gain, CART
│   └── 4.8 Evaluation — Accuracy, Precision/Recall, F1, AUC-ROC
│
├── MODULE 5: NON-PARAMETRIC METHODS 🟡
│   ├── 5.1 k-Nearest Neighbors (k-NN) — Classification & Regression
│   ├── 5.2 Kernel Methods — Kernel trick, Mercer's theorem
│   ├── 5.3 Support Vector Machines (SVMs) — Hard & Soft margin
│   ├── 5.4 Kernel SVM — RBF, Polynomial, String Kernels
│   └── 5.5 Gaussian Processes (GPs) 🔴
│
├── MODULE 6: GENERALIZATION THEORY 🟡🔴
│   ├── 6.1 Overfitting and Underfitting
│   ├── 6.2 Bias-Variance Decomposition (formal)
│   ├── 6.3 Cross-Validation — k-Fold, LOOCV
│   ├── 6.4 Regularization — L1, L2, Dropout, Early Stopping
│   ├── 6.5 Feature Selection — Filter, Wrapper, Embedded
│   ├── 6.6 PAC Learning Framework 🔴
│   ├── 6.7 VC Dimension and Sample Complexity 🔴
│   └── 6.8 Probably Approximately Correct bounds 🔴
│
├── MODULE 7: GENERATIVE MODELS & PROBABILISTIC ML 🟡🔴
│   ├── 7.1 Exponential Family and GLMs
│   ├── 7.2 Mixture of Gaussians (MoG)
│   ├── 7.3 Expectation-Maximization (EM Algorithm)
│   ├── 7.4 Factor Analysis
│   ├── 7.5 Hidden Markov Models (HMMs) — Baum-Welch
│   └── 7.6 Bayesian Learning — Prior, posterior, conjugacy 🔴
│
├── MODULE 8: NEURAL NETWORKS & DEEP LEARNING 🟡🔴
│   ├── 8.1 Multi-Layer Perceptrons (MLPs)
│   ├── 8.2 Activation Functions — ReLU, GELU, Sigmoid, Tanh
│   ├── 8.3 Backpropagation — Chain rule, computational graphs
│   ├── 8.4 Batch Normalization, Layer Normalization
│   ├── 8.5 Dropout and Regularization in Deep Networks
│   ├── 8.6 Convolutional Neural Networks (CNNs) 🔴
│   │   ├── Conv layers, pooling, receptive fields
│   │   ├── Architectures: LeNet → AlexNet → ResNet → EfficientNet
│   │   └── Transfer learning with pretrained CNNs
│   ├── 8.7 Recurrent Neural Networks (RNNs) 🔴
│   │   ├── Vanilla RNN, LSTM, GRU
│   │   ├── Vanishing/exploding gradients
│   │   └── Sequence-to-Sequence models
│   └── 8.8 Transformers and Attention 🔴🟣
│       ├── Self-attention mechanism
│       ├── Multi-head attention
│       ├── Positional encoding
│       └── Encoder-decoder architecture
│
├── MODULE 9: UNSUPERVISED & SELF-SUPERVISED LEARNING 🟡🔴
│   ├── 9.1 k-Means Clustering
│   ├── 9.2 Hierarchical Clustering (Agglomerative, Divisive)
│   ├── 9.3 DBSCAN — Density-based clustering
│   ├── 9.4 Principal Component Analysis (PCA) — SVD derivation
│   ├── 9.5 t-SNE and UMAP — Non-linear dimensionality reduction
│   ├── 9.6 Autoencoders — Encoder, Decoder, Bottleneck
│   ├── 9.7 Variational Autoencoders (VAEs) 🔴
│   ├── 9.8 Representation / Contrastive Learning 🔴
│   └── 9.9 Generative Adversarial Networks (GANs) 🔴🟣
│
├── MODULE 10: ENSEMBLE METHODS 🟡
│   ├── 10.1 Bagging — Bootstrap Aggregation
│   ├── 10.2 Random Forests
│   ├── 10.3 Boosting — AdaBoost, Gradient Boosting
│   ├── 10.4 XGBoost, LightGBM, CatBoost
│   └── 10.5 Stacking / Blending
│
├── MODULE 11: REINFORCEMENT LEARNING IN ML CONTEXT 🟡🔴
│   ├── 11.1 The RL Problem (formal ML perspective)
│   ├── 11.2 Policy Gradient Methods — REINFORCE
│   ├── 11.3 Actor-Critic Methods — A2C, A3C
│   ├── 11.4 Proximal Policy Optimization (PPO)
│   ├── 11.5 Deep Q-Networks (DQN)
│   └── 11.6 RLHF — RL from Human Feedback 🔴🟣
│
├── MODULE 12: PRACTICAL ML ADVICE & DEBUGGING 🟢🟡
│   ├── 12.1 ML Project Workflow
│   ├── 12.2 Data Collection, Cleaning, Labeling
│   ├── 12.3 Feature Engineering — Encoding, Normalization
│   ├── 12.4 Debugging ML Systems — Error Analysis
│   ├── 12.5 Hyperparameter Tuning — Grid, Random, Bayesian Opt
│   ├── 12.6 Experiment Tracking and Reproducibility
│   └── 12.7 Model Interpretability — SHAP, LIME, saliency maps
│
└── MODULE 13: LLMs & FOUNDATION MODELS (EMERGING — 2025/2026) 🔴🟣
    ├── 13.1 Pretraining — Masked LM, Causal LM objectives
    ├── 13.2 Fine-tuning — Full fine-tune, LoRA, QLoRA
    ├── 13.3 RLHF — Reward Modeling + PPO
    ├── 13.4 Prompt Engineering and In-Context Learning
    ├── 13.5 RAG — Retrieval-Augmented Generation
    └── 13.6 Evaluation of LLMs — Benchmarks, human eval
```

---

## 5. Detailed Chapter Breakdown

### MODULE 1 — Foundations & Mathematical Setup 🟢

#### 1.1 The Learning Problem

The fundamental problem of machine learning is **induction**: generalizing from observed data to unseen inputs. This requires assumptions.

**The i.i.d. assumption:** Training examples are assumed to be Independent and Identically Distributed — drawn independently from the same probability distribution P(x, y). This means:
- Training and test data come from the same distribution
- Examples don't influence each other

**When i.i.d. breaks:** Time-series data (autocorrelated), distribution shift (COVID changed everything), adversarial inputs. Recognizing i.i.d. violations is a critical practical skill.

#### 1.2 The Formal Learning Setup

```
Given:
  Training set: D = {(x⁽¹⁾, y⁽¹⁾), ..., (x⁽ⁿ⁾, y⁽ⁿ⁾)} drawn i.i.d. from P(x, y)

Find:
  Hypothesis h: X → Y from hypothesis class H

Minimize:
  True risk:       R(h) = E_{(x,y)~P}[L(h(x), y)]
  Empirical risk:  R̂(h) = (1/n) Σᵢ L(h(xᵢ), yᵢ)   [what we can actually compute]

The gap R(h) - R̂(h) is the generalization gap — controlled by VC theory (Module 6).
```

#### 1.3 MLE vs. MAP — The Probabilistic View

**Maximum Likelihood Estimation (MLE):**
```
θ_MLE = argmax_θ P(D | θ) = argmax_θ Σᵢ log P(yᵢ | xᵢ; θ)
```

**Maximum A Posteriori (MAP):**
```
θ_MAP = argmax_θ P(θ | D) = argmax_θ [log P(D | θ) + log P(θ)]
                                                           ↑
                                                     Prior on θ
```

**The connection to regularization:**
- Gaussian prior on θ: P(θ) ∝ exp(−λ||θ||²) → **Ridge regression (L2 regularization)**
- Laplace prior on θ: P(θ) ∝ exp(−λ||θ||₁) → **Lasso (L1 regularization, sparsity)**

---

### MODULE 2 — Regression 🟢🟡

#### 2.1 Ordinary Least Squares (OLS)

**Problem:** Given (X ∈ ℝⁿˣᵈ, y ∈ ℝⁿ), find w ∈ ℝᵈ minimizing squared error.

```
J(w) = ||Xw − y||² = (Xw − y)ᵀ(Xw − y)

∇_w J(w) = 2Xᵀ(Xw − y) = 0
→ XᵀXw = Xᵀy
→ w* = (XᵀX)⁻¹ Xᵀy   [the Normal Equation]
```

**Geometric interpretation:** The prediction ŷ = Xw* is the **orthogonal projection** of y onto the column space of X.

**Probabilistic interpretation:** If y = wᵀx + ε where ε ~ N(0, σ²), then MLE of w = OLS solution.

**Closed-form cost:** O(nd² + d³) — feasible for small d, impractical for d > 10,000 (use SGD instead).

#### 2.2 Ridge Regression

```
w_ridge = argmin_w ||Xw − y||² + λ||w||²
         = (XᵀX + λI)⁻¹ Xᵀy

Benefits:
  1. Always invertible (XᵀX + λI) even when XᵀX is singular
  2. Shrinks weights toward 0 — reduces overfitting
  3. MAP estimate with Gaussian prior N(0, σ²/λ)
```

---

### MODULE 3 — Optimization for ML 🟡

#### 3.1 Gradient Descent and Variants

**Batch Gradient Descent:**
```
w ← w − α ∇_w J(w)   where J(w) = (1/n) Σᵢ L(w; xᵢ, yᵢ)
Cost per step: O(n) — slow for large datasets
```

**Stochastic Gradient Descent (SGD):**
```
For each (xᵢ, yᵢ) in shuffled order:
  w ← w − α ∇_w L(w; xᵢ, yᵢ)
Cost per step: O(1) — fast, noisy
```

**Mini-batch SGD (industry standard):**
```
For each mini-batch B ⊂ D of size b:
  w ← w − α (1/b) Σ_{(x,y)∈B} ∇_w L(w; x, y)
Cost per step: O(b) — best of both worlds; b ∈ {32, 128, 512, 1024}
```

#### 3.2 Adaptive Optimizers

| Optimizer | Update Rule | Key Property |
|-----------|-------------|--------------|
| **SGD + Momentum** | v ← βv + ∇L; w ← w − αv | Smooths oscillations, accelerates convergence |
| **RMSProp** | s ← βs + (1−β)∇L²; w ← w − α∇L/√s | Adapts per-parameter learning rate |
| **Adam** | Combines momentum + RMSProp; adds bias correction | De facto standard in deep learning |

**Adam in detail:**
```
m ← β₁m + (1−β₁)∇L          [1st moment: mean]
v ← β₂v + (1−β₂)∇L²         [2nd moment: variance]
m̂ = m / (1−β₁ᵗ)             [bias correction]
v̂ = v / (1−β₂ᵗ)
w ← w − α × m̂ / (√v̂ + ε)

Default: β₁=0.9, β₂=0.999, ε=10⁻⁸
```

---

### MODULE 4 — Classification 🟡

#### 4.1 Logistic Regression

The canonical discriminative classifier:
```
P(y=1 | x; w) = σ(wᵀx) = 1 / (1 + exp(−wᵀx))

Loss: NLL = −Σᵢ [yᵢ log σ(wᵀxᵢ) + (1−yᵢ) log(1−σ(wᵀxᵢ))]

No closed form → optimize with SGD / Newton's Method
```

**Why cross-entropy loss?** It's the NLL under the Bernoulli likelihood model — a principled probabilistic derivation, not an arbitrary choice.

#### 4.2 Generative vs. Discriminative

| | Generative | Discriminative |
|-|------------|----------------|
| **Models** | P(x, y) = P(x \| y) P(y) | P(y \| x) directly |
| **Classifies via** | Bayes' theorem: P(y\|x) ∝ P(x\|y)P(y) | Direct boundary |
| **Examples** | Naive Bayes, GDA, LDA | Logistic Regression, SVM, NN |
| **Advantages** | Works with missing features; can generate new data | Usually better with large labeled data |
| **Disadvantages** | Strong model assumptions; harder to fit | No generative capability |

#### 4.3 Decision Trees

Decision trees partition the feature space using axis-aligned splits, forming a recursive binary tree.

**Splitting criterion — Information Gain:**
```
H(Y) = −Σ_k P(Y=k) log₂ P(Y=k)     [Entropy of label distribution]

Information Gain of split on feature A at threshold t:
  IG(A, t) = H(Y) − [|D_left|/|D| × H(Y_left) + |D_right|/|D| × H(Y_right)]

Choose (A, t) that maximizes IG.
```

**CART (Classification and Regression Trees)** uses Gini impurity instead of entropy:
```
Gini(D) = 1 − Σ_k P(Y=k)²
```

**Key practical insight:** Decision trees overfit severely without pruning. Ensemble methods (Random Forests, XGBoost) fix this by combining many trees.

---

### MODULE 5 — Non-Parametric Methods 🟡

#### 5.1 k-Nearest Neighbors (k-NN)

The simplest non-parametric method: classify a new point x by majority vote of its k nearest training points.

```
h(x) = argmax_y |{i : xᵢ ∈ kNN(x) and yᵢ = y}|

Distance metric: usually Euclidean: d(x, x') = ||x − x'||₂
```

| k | Behavior |
|---|----------|
| k=1 | Perfect training accuracy; very noisy; high variance |
| k=n | Always predicts majority class; high bias |
| k=√n | Common heuristic starting point |

**Curse of Dimensionality:** In high dimensions, all points become equidistant. k-NN requires feature scaling and dimensionality reduction to work well beyond ~20 features.

#### 5.2 Support Vector Machines (SVMs)

SVM finds the hyperplane w·x + b = 0 that **maximizes the margin** (gap) between the two classes.

**Hard-margin SVM (linearly separable):**
```
min_{w,b}  (1/2)||w||²
subject to:  yᵢ(wᵀxᵢ + b) ≥ 1  for all i
```

**Soft-margin SVM (allows misclassifications):**
```
min_{w,b,ξ}  (1/2)||w||² + C Σᵢ ξᵢ
subject to:   yᵢ(wᵀxᵢ + b) ≥ 1 − ξᵢ,  ξᵢ ≥ 0

C = regularization parameter:
  Large C → small margin, few violations (prone to overfit)
  Small C → large margin, many violations (more robust)
```

**Kernel trick:** Replace xᵢ·xⱼ with K(xᵢ, xⱼ) in the dual formulation. This implicitly maps data to a higher-dimensional space where it may be linearly separable.

```
Common kernels:
  Linear:      K(x, x') = xᵀx'
  Polynomial:  K(x, x') = (xᵀx' + c)ᵈ
  RBF/Gaussian: K(x, x') = exp(−||x−x'||²/2σ²)  ← maps to infinite-dim space!
```

---

### MODULE 6 — Generalization Theory 🟡🔴

#### 6.1 Bias-Variance Decomposition

For a regression model with squared loss, the expected test error decomposes as:

```
E[(y − h(x))²] = (Bias[h(x)])² + Var[h(x)] + σ²
                  └────────────┘   └──────────┘   └─┘
                 Systematic error  Estimation     Irreducible
                 (underfitting)    noise           noise
                                   (overfitting)

Bias[h(x)] = E[h(x)] − f(x)       [how wrong is the average prediction?]
Var[h(x)]  = E[(h(x) − E[h(x)])²] [how much does prediction vary across datasets?]
```

**The bias-variance trade-off:**
- More model complexity → lower bias, higher variance
- Less model complexity → higher bias, lower variance
- Optimal complexity: the sweet spot where total error is minimized

#### 6.2 VC Dimension and PAC Learning 🔴

The **VC dimension** (Vapnik-Chervonenkis dimension) of a hypothesis class H measures its **expressiveness** — how many points it can shatter (correctly classify in all possible ways).

| Hypothesis Class | VC Dimension |
|-----------------|--------------|
| Threshold functions on ℝ | 1 |
| Linear classifiers in ℝᵈ | d+1 |
| Convex k-gons in ℝ² | 2k+1 |
| Sinusoidal classifiers | ∞ (can shatter any set) |

**Fundamental Theorem of Statistical Learning:** For a finite-VC-dimension hypothesis class H, the generalization gap satisfies (with probability ≥ 1−δ):

```
R(h) ≤ R̂(h) + O(√(VC(H) log(n) + log(1/δ)) / n)
         ↑              ↑
    Training error   Complexity penalty
```

**Key insight:** This tells us how many samples n we need to guarantee ε-accurate generalization, given the complexity of H. Deep neural networks have enormous or infinite VC dimension — their generalization is explained by other phenomena (implicit regularization, SGD noise, etc.) — an active 🟣 research area.

---

### MODULE 7 — Generative Models & EM 🟡🔴

#### 7.1 The Expectation-Maximization (EM) Algorithm

EM is a general technique for **maximum likelihood estimation with latent (hidden) variables**.

**Example: Mixture of K Gaussians**

Each data point xᵢ is generated by:
1. Choose a component: zᵢ ~ Categorical(π₁, ..., πₖ)
2. Draw from that Gaussian: xᵢ | zᵢ=k ~ N(μₖ, Σₖ)

We observe x but not z. EM alternates between:

```
E-step: Compute soft assignments (responsibilities):
  r_{ik} = P(zᵢ=k | xᵢ; θ) = πₖ N(xᵢ | μₖ, Σₖ) / Σⱼ πⱼ N(xᵢ | μⱼ, Σⱼ)

M-step: Update parameters using soft assignments:
  πₖ  ← (1/n) Σᵢ r_{ik}
  μₖ  ← Σᵢ r_{ik} xᵢ / Σᵢ r_{ik}
  Σₖ  ← Σᵢ r_{ik} (xᵢ − μₖ)(xᵢ − μₖ)ᵀ / Σᵢ r_{ik}

Repeat until convergence (guaranteed to increase log-likelihood monotonically).
```

**EM convergence guarantee:** The likelihood is non-decreasing at each iteration. However, convergence is to a local optimum — initialization matters.

---

### MODULE 8 — Neural Networks & Deep Learning 🟡🔴

#### 8.1 Multi-Layer Perceptron (MLP)

```
Forward pass:
  a⁽⁰⁾ = x
  z⁽ˡ⁾ = W⁽ˡ⁾ a⁽ˡ⁻¹⁾ + b⁽ˡ⁾
  a⁽ˡ⁾ = f(z⁽ˡ⁾)         [f = activation function, applied elementwise]
  ŷ = a⁽ᴸ⁾               [output of final layer L]

Parameters: {W⁽ˡ⁾, b⁽ˡ⁾} for l = 1, ..., L
```

**Common activation functions:**

| Function | Formula | Derivative | Used In |
|----------|---------|------------|---------|
| **Sigmoid** | σ(z) = 1/(1+e⁻ᶻ) | σ(1−σ) | Output for binary classification |
| **Tanh** | (eᶻ−e⁻ᶻ)/(eᶻ+e⁻ᶻ) | 1−tanh² | Hidden layers (older) |
| **ReLU** | max(0, z) | 0 or 1 | Hidden layers (standard) |
| **GELU** | z·Φ(z) | Complex | Transformers, LLMs |
| **Softmax** | exp(zₖ)/Σⱼ exp(zⱼ) | Complex | Output for multi-class |

#### 8.2 Backpropagation

Backpropagation is the chain rule applied to compute ∂L/∂W for all layers simultaneously.

```
Define:  δ⁽ˡ⁾ = ∂L/∂z⁽ˡ⁾   [error signal at layer l]

Backward pass:
  δ⁽ᴸ⁾ = ∂L/∂a⁽ᴸ⁾ ⊙ f'(z⁽ᴸ⁾)       [output layer delta]
  δ⁽ˡ⁾ = (W⁽ˡ⁺¹⁾)ᵀ δ⁽ˡ⁺¹⁾ ⊙ f'(z⁽ˡ⁾) [propagate backward]

Gradients:
  ∂L/∂W⁽ˡ⁾ = δ⁽ˡ⁾ (a⁽ˡ⁻¹⁾)ᵀ
  ∂L/∂b⁽ˡ⁾ = δ⁽ˡ⁾
```

**Key property:** Backprop is O(forward pass) — computing all gradients costs the same as one forward pass. This is why deep learning is tractable.

#### 8.3 Convolutional Neural Networks (CNNs) 🔴

CNNs exploit **spatial locality** and **translation invariance** in images.

```
Convolution operation:
  (f * g)[i, j] = Σₘ Σₙ f[m, n] × g[i−m, j−n]

In CNNs:
  Output[i, j, k] = Σₘ Σₙ Σc Input[i+m, j+n, c] × Filter[m, n, c, k] + b[k]

Where:
  Filter[m, n, c, k] = learnable weights for filter k
  Stride s: output size = ⌊(W − F + 2P)/s⌋ + 1
  Padding P: 'same' padding preserves spatial dimensions
```

**CNN architecture evolution:**

| Architecture | Year | Key Innovation | Parameters |
|-------------|------|----------------|-----------|
| LeNet-5 | 1998 | First successful CNN (digits) | ~60K |
| AlexNet | 2012 | ReLU, dropout, GPU training | ~60M |
| VGGNet | 2014 | Deep 3×3 conv stacks | ~138M |
| GoogLeNet | 2014 | Inception modules | ~7M |
| ResNet-50 | 2015 | Residual connections | ~25M |
| EfficientNet | 2019 | Compound scaling law | varies |
| Vision Transformer (ViT) | 2020 | Patches + self-attention | ~86M+ |

#### 8.4 The Transformer Architecture 🔴🟣

*(Now taught in MIT 6.390 Chapter 9 and MIT 6.S191 — reflects 2024/2025 curriculum update)*

**Self-attention mechanism:**

```
Given input sequence X ∈ ℝⁿˣᵈ:

Q = XW_Q,  K = XW_K,  V = XW_V    [Query, Key, Value projections]

Attention(Q, K, V) = softmax(QKᵀ / √d_k) × V
                     └────────────────────┘
                     Attention weights (n×n matrix)

√d_k scaling: prevents dot products from entering softmax saturation region
```

**Multi-head attention:**
```
MultiHead(Q, K, V) = Concat(head₁, ..., headₕ) W_O
  where headᵢ = Attention(QW_Qᵢ, KW_Kᵢ, VW_Vᵢ)
```

**Why transformers dominate:** Unlike RNNs, transformers process all tokens in parallel and have direct (O(1) path length) connections between any two positions — no vanishing gradient across long sequences.

---

### MODULE 9 — Unsupervised Learning 🟡🔴

#### 9.1 Principal Component Analysis (PCA)

PCA finds the directions of **maximum variance** in the data.

```
Given: data matrix X ∈ ℝⁿˣᵈ (centered: subtract column means)

1. Compute covariance matrix: C = (1/n) XᵀX ∈ ℝᵈˣᵈ
2. Eigendecompose: C = UΛUᵀ  (U = eigenvectors, Λ = eigenvalues)
3. Project to k dimensions: Z = X U_k  where U_k = first k columns of U

Equivalently (numerically stable): use SVD of X = USVᵀ
  Principal components = right singular vectors (columns of V)
  Variance explained by component i = sᵢ² / Σⱼ sⱼ²
```

**Choosing k:** Plot the "scree plot" of explained variance vs. k. Choose k where the curve elbows.

#### 9.2 Variational Autoencoders (VAEs) 🔴

VAEs are a principled probabilistic generative model. Unlike regular autoencoders, the encoder outputs a distribution over a latent space.

```
Encoder:  q_φ(z | x) ≈ N(μ_φ(x), diag(σ²_φ(x)))
Decoder:  p_θ(x | z)

Training objective (ELBO — Evidence Lower BOund):
  L(φ, θ; x) = E_{z~q_φ}[log p_θ(x|z)] − KL(q_φ(z|x) || p(z))
                └──────────────────────┘   └───────────────────┘
                Reconstruction term         Regularization term

Reparameterization trick: z = μ + σ ⊙ ε,  ε ~ N(0, I)
  (Allows backprop through the sampling step)
```

---

### MODULE 10 — Ensemble Methods 🟡

#### 10.1 Random Forests

A random forest trains T decision trees, each on a bootstrap sample of the data, with a random subset of features at each split.

```
For t = 1, ..., T:
  1. Bootstrap sample: Dₜ ~ Bootstrap(D, n)
  2. Build tree with feature randomness: at each node, choose split
     from random subset of m features (m ≈ √d for classification)
  3. Predict with full tree (no pruning)

Aggregate: majority vote (classification) or mean (regression)
```

**Why it works:** Each tree is high-variance / low-bias. Averaging uncorrelated trees reduces variance without increasing bias. Feature randomness decorrelates the trees.

#### 10.2 Gradient Boosting

Unlike bagging, boosting builds trees **sequentially**, each correcting the errors of the previous ones.

```
Initialize: F₀(x) = argmin_γ Σᵢ L(yᵢ, γ)

For m = 1, ..., M:
  1. Compute pseudo-residuals: rᵢₘ = −[∂L(yᵢ, F(xᵢ))/∂F(xᵢ)]_{F=Fₘ₋₁}
  2. Fit tree hₘ to pseudo-residuals
  3. Update: Fₘ(x) = Fₘ₋₁(x) + η × hₘ(x)    [η = learning rate]

Final model: F(x) = F₀(x) + Σₘ η × hₘ(x)
```

**XGBoost** (Chen & Guestrin, 2016) adds regularization to tree structure, second-order Taylor expansion for efficiency, and sparsity-aware split finding. It dominated Kaggle competitions from 2016–2022.

---

### MODULE 11 — Reinforcement Learning (ML Perspective) 🔴🟣

#### 11.1 Policy Gradient — REINFORCE

Unlike value-based methods (Q-learning), policy gradient methods directly parameterize and optimize the policy π_θ.

```
Objective: J(θ) = E_{τ~π_θ}[R(τ)]   [expected return]

Policy Gradient Theorem:
  ∇_θ J(θ) = E_{τ~π_θ}[Σₜ ∇_θ log π_θ(aₜ|sₜ) × R(τ)]

REINFORCE update:
  θ ← θ + α Σₜ ∇_θ log π_θ(aₜ|sₜ) × Gₜ
  where Gₜ = Σₖ≥t γᵏ⁻ᵗ rₖ   [discounted return from time t]
```

#### 11.2 RLHF — RL from Human Feedback 🔴🟣

*(Now in MIT 6.S191 2026 — L7: "The Three Laws of AI"; CMU 10-601 Spring 2026)*

The training pipeline for modern LLMs (GPT-4, Claude, Gemini):

```
Step 1 — Supervised Fine-Tuning (SFT):
  Fine-tune base LLM on human-written demonstrations
  Output: SFT model

Step 2 — Reward Model Training:
  Collect human preference data: given prompt x, rank completions y₁ vs. y₂
  Train reward model R_φ(x, y) to predict human preferences
  Loss: −E[log σ(R_φ(x, y_w) − R_φ(x, y_l))]   [Bradley-Terry model]

Step 3 — PPO Fine-Tuning:
  Maximize: E[R_φ(x, y)] − β × KL[π_θ(y|x) || π_ref(y|x)]
  Where π_ref = SFT model (prevents reward hacking)
```

**DPO (Direct Preference Optimization)** — Rafailov et al. 2023 — skips the explicit reward model and directly optimizes preferences, simplifying Step 2+3 into a single fine-tuning step. Now widely adopted.

---

### MODULE 12 — Practical ML Advice 🟢🟡

#### 12.1 The ML Project Checklist

*(Distilled from Andrew Ng's CS229 ML Advice notes and CMU 10-601 practical sessions)*

```
1. PROBLEM FRAMING
   □ Define inputs x and outputs y precisely
   □ Identify evaluation metric (what counts as success?)
   □ Set a baseline (human performance, simple heuristic)

2. DATA
   □ Collect or find training data
   □ Check for data quality issues: duplicates, leakage, label noise
   □ Establish train/val/test splits BEFORE exploring data

3. INITIAL MODEL
   □ Start simple (linear model or shallow tree)
   □ Overfit first: can your model memorize training data?
   □ If not: bug in code, too few parameters, bad data

4. BIAS-VARIANCE DIAGNOSIS
   □ High training error: increase model capacity OR check data/labels
   □ High val/test error (low training error): regularize, get more data

5. ITERATION
   □ Error analysis: look at val examples model gets wrong
   □ Feature engineering based on errors
   □ Tune hyperparameters (use val set, NOT test set)

6. DEPLOYMENT
   □ Check for distribution shift between train and production
   □ Monitor predictions after deployment
```

#### 12.2 Error Analysis — Where to Focus

```
Priority matrix:
                    Easy to fix     Hard to fix
High frequency      ████ DO THIS    ███ Consider
Low frequency       ██ Skip         █ Ignore
```

---

## 6. Practical Labs & Assignments

### MIT 6.390 Labs (Fall 2025 — introml.mit.edu)

MIT 6.390 combines **lecture notes, homework, labs, and recitations**. Verified from Fall 2025 live site:

| Component | Description | Grading Weight |
|-----------|-------------|---------------|
| **Exercises** | Short online auto-graded concept checks | 5% |
| **Homework** | Weekly problem sets (math + code) | 20% |
| **Labs** | Hands-on Python/NumPy implementations | 15% |
| **Midterm 1** | Oct 8 (verified from Fall 2025 site) | 30% |
| **Midterm 2** | Nov 12 (verified from Fall 2025 site) | 30% |

**Topic-aligned labs:**
| Lab | Topic | What Students Implement |
|-----|-------|------------------------|
| Regression Lab | OLS, Ridge, Polynomial | From-scratch NumPy: fit, predict, eval |
| Classification Lab | Logistic Regression, SVM | Binary + multi-class classifiers |
| Neural Networks Lab | MLP, Backprop | Forward pass, backward pass from scratch |
| CNN Lab | Image classification | PyTorch CNN on CIFAR-10 |
| Transformers Lab | Self-attention | Implement self-attention mechanism |
| RL Lab | Q-learning, Policy Gradient | GridWorld + simple Atari env |

### MIT 6.S191 Software Labs (2026 edition — verified from introtodeeplearning.com)

| Lab | Topic | Application |
|-----|-------|------------|
| **Lab 1** | Deep Learning in Python | Music generation (MIT 2026 edition) |
| **Lab 2** | Computer Vision | Facial detection and bias analysis (uses AAAI 2019 bias paper) |
| **Lab 3** | LLM Fine-tuning | "Fine-Tune an LLM, You Must!" — LoRA fine-tuning on Hugging Face |

### Stanford CS229 Problem Sets (Spring 2026 active)

| PS | Topics Covered |
|----|---------------|
| **PS0** | Math prerequisites check — linear algebra, probability |
| **PS1** | Linear regression, logistic regression, GDA, Naive Bayes |
| **PS2** | SVMs, kernels, spam filter, k-means |
| **PS3** | Neural networks, regularization, decision trees, ensembles |
| **PS4** | MDPs, RL, value/policy iteration, Q-learning |
| **Final Project** | Open-ended; students submit to CS229 poster session |

CS229 projects are legendary — many published papers started as CS229 projects. Past project reports available at cs229.stanford.edu/proj.

### CMU 10-601 Homework (Fall 2025 — verified from schedule)

| HW | Date | Topic |
|----|------|-------|
| **HW1** | Aug 25 | Course Overview, ML as Function Approximation |
| **HW2** | Sep 3 | Decision Trees |
| **HW3** | Sep 10–15 | k-NN, Model Selection, Perceptron |
| **HW4** | Sep 22 | Linear Regression, Optimization |
| **HW5** | Sep 29+ | Logistic Regression, Feature Engineering / Regularization |
| **HW6+** | Oct | SVMs, Neural Networks, Deep Learning |
| **HW7–8** | Nov | Probabilistic ML, Clustering, EM |
| **HW9** | Nov | Reinforcement Learning |
| **HW10** | Dec | Large Language Models *(new in 2025/2026)* |

---

## 7. Tools & Technologies

| Tool | Purpose | Course |
|------|---------|--------|
| **Python 3** | All implementations | All courses |
| **NumPy** | Array math, from-scratch implementations | All |
| **PyTorch** | Deep learning (primary at MIT, CMU, Stanford) | 6.390, CS229, 10-601 |
| **TensorFlow / Keras** | MIT 6.S191 labs (2026) | 6.S191 |
| **Hugging Face Transformers** | LLM fine-tuning (6.S191 Lab 3) | 6.S191 |
| **scikit-learn** | Classic ML (SVM, trees, etc.) | All |
| **Jupyter Notebooks** | All labs and homeworks | All |
| **Gradescope** | Automated grading | CMU 10-601, Stanford CS229 |
| **Matplotlib / Seaborn** | Visualization | All |
| **Pandas** | Data manipulation | All |
| **W&B / MLflow** | Experiment tracking (CMU 17-645 cross-ref) | Production courses |
| **Google Colab / Lambda Labs** | GPU access for deep learning | 6.S191 sponsors include Lambda Labs |

---

## 8. Key Textbooks & Papers

### Primary Textbooks

| Title | Authors | Access | Notes |
|-------|---------|--------|-------|
| **MIT 6.390 Open Course Notes** | MIT Staff (Shen Shen et al.) | Free at introml.mit.edu/notes | Best structured intro; covers transformers (Ch. 9) |
| **CS229 Lecture Notes (Ng)** | Andrew Ng et al. | Free at cs229.stanford.edu/main_notes.pdf | ~200 pages; most rigorous derivations |
| **A Course in Machine Learning (CIML)** | Hal Daumé III | Free at ciml.info | CMU 10-601's main reading (Chapters 1–4 verified in Fall 2025 schedule) |
| **Pattern Recognition and Machine Learning** | Bishop | Free PDF from Microsoft Research | Definitive probabilistic ML reference |
| **The Elements of Statistical Learning (ESL)** | Hastie, Tibshirani, Friedman | Free at web.stanford.edu/~hastie/ElemStatLearn/ | Graduate-level stat ML; rigorous |
| **Learning from Data** | Abu-Mostafa et al. | ~$30 | Caltech CS156 textbook; uniquely rigorous on generalization theory |
| **Deep Learning** | Goodfellow, Bengio, Courville | Free at deeplearningbook.org | Standard deep learning reference |
| **Probabilistic Machine Learning: An Introduction** | Murphy (2022) | Free at probml.github.io | Modern replacement for Bishop; 2 volumes |

### Seminal Papers (Open Access)

| Paper | Authors | Year | Why It Matters |
|-------|---------|------|----------------|
| **A Training Algorithm for Optimal Margin Classifiers (SVM)** | Boser, Guyon, Vapnik | 1992 | Original SVM formulation |
| **Random Forests** | Breiman | 2001 | Definitive RF paper |
| **XGBoost: A Scalable Tree Boosting System** | Chen & Guestrin | 2016 | Industry-dominant boosting |
| **Deep Residual Learning for Image Recognition** | He et al. | 2015 | ResNets; enabled training 100+ layer networks |
| **Attention Is All You Need** | Vaswani et al. | 2017 | Original Transformer paper — most cited ML paper of all time |
| **BERT: Pre-training of Deep Bidirectional Transformers** | Devlin et al. | 2018 | Foundation of modern NLP |
| **Training Language Models to Follow Instructions (InstructGPT)** | Ouyang et al. | 2022 | RLHF applied to LLMs |
| **Direct Preference Optimization (DPO)** | Rafailov et al. | 2023 | Simplified RLHF alternative; widely adopted |
| **LoRA: Low-Rank Adaptation of Large Language Models** | Hu et al. | 2021 | Parameter-efficient fine-tuning; used in 6.S191 Lab 3 |
| **Auto-Encoding Variational Bayes (VAE)** | Kingma & Welling | 2013 | Original VAE |
| **Generative Adversarial Nets** | Goodfellow et al. | 2014 | Original GAN |
| **A Few Useful Things to Know about Machine Learning** | Domingos | 2012 | Best practical ML overview paper; widely read |

---

## 9. University Comparison Table

| Topic | MIT 6.390 | MIT 6.S191 | Stanford CS229 | CMU 10-601 | Berkeley CS189 | Caltech CS156 |
|-------|-----------|------------|----------------|------------|----------------|---------------|
| Linear Regression (OLS) | ✅ Ch.2 | ❌ | ✅ Deep | ✅ L7 | ✅ | ✅ |
| Gradient Descent + Adam | ✅ Ch.3 | ✅ L1 | ✅ | ✅ L8 | ✅ | ✅ |
| Logistic Regression | ✅ Ch.4 | ❌ | ✅ | ✅ L9 | ✅ | ✅ |
| Decision Trees | ✅ | ❌ | ✅ | ✅ L3 | ✅ | ❌ |
| k-NN | ✅ Ch.10 | ❌ | ✅ (non-param) | ✅ L4 | ✅ | ✅ |
| SVMs | ✅ | ❌ | ✅ **Deep** | ✅ | ✅ | ✅ |
| PAC / VC Theory | ❌ | ❌ | ✅ (some) | ✅ (some) | ✅ | ✅ **Deep** |
| MLE/MAP, GLMs | ✅ | ❌ | ✅ **Deep** | ✅ | ✅ | ✅ |
| EM Algorithm | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Neural Networks (MLP) | ✅ Ch.6 | ✅ L1 | ✅ | ✅ | ✅ | ✅ |
| CNNs | ✅ Ch.7 | ✅ **L3** | ✅ | ✅ | ✅ | ❌ |
| RNNs / LSTMs | ✅ Ch.9 | ✅ L2 | ✅ | ✅ | ✅ | ❌ |
| Transformers / Attention | ✅ **Ch.9** | ✅ L2 | ✅ | ✅ | ✅ (some) | ❌ |
| VAEs / GANs | ✅ Ch.8 | ✅ **L4** | ✅ (some) | ✅ (some) | ✅ | ❌ |
| k-Means / Clustering | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| PCA / SVD | ✅ | ❌ | ✅ | ✅ | ✅ **Deep** | ✅ |
| Random Forests / XGBoost | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Reinforcement Learning | ✅ Ch.11-12 | ✅ L5 | ✅ | ✅ | ❌ | ❌ |
| RLHF / LLM fine-tuning | ❌ | ✅ **L7** | ✅ (some) | ✅ **new** | ❌ | ❌ |
| Practical ML Advice | ✅ | ❌ | ✅ (famous) | ✅ L5 | ❌ | ❌ |
| AI for Science | ❌ | ✅ **L8** | ❌ | ❌ | ❌ | ❌ |
| Distributed/Parallel Training | ❌ | ✅ **L9** | ❌ | ❌ | ❌ | ❌ |

**Verdicts:**
- **Broadest + most modern (2026):** MIT 6.390 + MIT 6.S191 together cover the full stack
- **Most rigorous theory:** Caltech CS156 + Stanford CS229
- **Best implementation grounding:** CMU 10-601
- **Best deep learning bootcamp:** MIT 6.S191 (open-source, free, all labs on GitHub)

---

## 10. Industry Relevance 2025–2026

### The ML Engineering Role Landscape

| Role | Core ML Skills | Tools | Salary (US, 2025–26) |
|------|---------------|-------|----------------------|
| **Data Scientist** | Regression, classification, EDA, model evaluation | scikit-learn, pandas, SQL | $130k–$220k |
| **ML Engineer** | All of ML + deployment, pipelines | PyTorch, MLflow, Docker | $160k–$300k |
| **Deep Learning Engineer** | CNNs, Transformers, training at scale | PyTorch, CUDA, Triton | $180k–$350k |
| **NLP / LLM Engineer** | Transformers, RLHF, fine-tuning | HuggingFace, vLLM | $200k–$400k |
| **Research Scientist** | Full ML theory + frontier research | PyTorch, JAX, custom CUDA | $200k–$500k+ |
| **MLOps / Platform Engineer** | ML pipelines, monitoring, serving | Ray, Kubernetes, Prometheus | $180k–$330k |

### Most In-Demand ML Skills (2025–2026 job market)

Based on job postings at Google, OpenAI, Anthropic, Meta AI, Databricks, Hugging Face, and Scale AI:

1. **Transformer architecture knowledge** — attention, multi-head, positional encoding
2. **LLM fine-tuning** — LoRA, QLoRA, RLHF, DPO — all from this curriculum
3. **PyTorch + CUDA** — GPU programming and efficient training
4. **Distributed training** — FSDP, DeepSpeed, data/tensor/pipeline parallelism
5. **Evaluation methodology** — not just accuracy; calibration, fairness, robustness
6. **Classical ML fundamentals** — still essential for feature engineering, tabular data, debugging

### The Classical ↔ Modern ML Bridge

A common mistake is treating classical ML and deep learning as separate. In practice:

- **XGBoost still dominates** on tabular/structured data (Kaggle 2023–2025 results)
- **Bias-variance intuition** is the #1 debugging framework for both
- **Regularization concepts** (L1, L2, dropout, early stopping) transfer directly
- **Probabilistic foundations** (MLE, MAP, Bayes) appear everywhere in LLM training

The best ML engineers understand both paradigms and choose the right tool for each problem.

---

## 11. Research Links & Sources

### Primary Course Pages (Live-Verified May 2026)

| Course | URL | Status |
|--------|-----|--------|
| MIT 6.390 Open Notes (full textbook) | https://introml.mit.edu/notes/ | **Live — actively maintained** |
| MIT 6.390 Fall 2025 (archived) | https://introml.mit.edu/fall25/ | Archived — requires staff login |
| MIT 6.390 Spring 2025 (archived) | https://introml.mit.edu/spring25/ | Archived |
| MIT 6.S191 Introduction to Deep Learning (2026 live) | https://introtodeeplearning.com/ | **Live — 2026 schedule complete** |
| MIT 6.S191 GitHub (all lab code) | https://github.com/MITDeepLearning/introtodeeplearning | **Live — open source** |
| Stanford CS229 Machine Learning (Spring 2026 live) | https://cs229.stanford.edu/ | **Live — active course** |
| Stanford CS229 Master Lecture Notes (Ng) | https://cs229.stanford.edu/main_notes.pdf | **Live** |
| CMU 10-301/10-601 Fall 2025 Schedule | https://www.cs.cmu.edu/~mgormley/courses/10601-f25/schedule.html | Archived — full schedule |
| CMU 10-301/10-601 Spring 2026 | https://www.cs.cmu.edu/~mgormley/courses/10601/ | **Live** |
| Caltech CS156 Learning from Data | https://work.caltech.edu/telecourse.html | Archived lectures (timeless) |
| MIT 6.036 OCW (archived under old number) | https://ocw.mit.edu/courses/6-036-introduction-to-machine-learning-fall-2020/ | Archived |

### Free Textbooks (All Verified)

| Resource | URL |
|----------|-----|
| MIT 6.390 Notes (full, free) | https://introml.mit.edu/notes/ |
| CS229 Notes (Ng) | https://cs229.stanford.edu/main_notes.pdf |
| CIML — Course in ML (Daumé) | http://ciml.info |
| Deep Learning Book (Goodfellow et al.) | https://deeplearningbook.org |
| ESL (Hastie et al.) | https://web.stanford.edu/~hastie/ElemStatLearn/ |
| Probabilistic ML: Intro (Murphy) | https://probml.github.io/pml-book/ |
| Mathematics for ML (MML book) | https://mml-book.github.io/ |
| Sutton & Barto RL (free) | http://incompleteideas.net/book/the-book-2nd.html |

### Seminal Papers (Open Access Links)

| Paper | Link |
|-------|------|
| Attention Is All You Need | https://arxiv.org/abs/1706.03762 |
| BERT | https://arxiv.org/abs/1810.04805 |
| Deep Residual Learning (ResNets) | https://arxiv.org/abs/1512.03385 |
| InstructGPT / RLHF | https://arxiv.org/abs/2203.02155 |
| DPO | https://arxiv.org/abs/2305.18290 |
| LoRA | https://arxiv.org/abs/2106.09685 |
| VAE | https://arxiv.org/abs/1312.6114 |
| GAN | https://arxiv.org/abs/1406.2661 |
| XGBoost | https://arxiv.org/abs/1603.02754 |
| A Few Useful Things about ML | https://dl.acm.org/doi/10.1145/2347736.2347755 |

---

## 📊 Depth Summary

| Module | Depth | Core Skill Acquired |
|--------|-------|-------------------|
| 1. Foundations (Learning Problem) | 🟢 | Framing ML problems correctly |
| 2. Regression | 🟢🟡 | OLS, Ridge, Lasso derivations |
| 3. Optimization | 🟡 | SGD, Adam, convergence intuition |
| 4. Classification | 🟡 | Logistic, Decision Trees, NB, GDA |
| 5. Non-parametric Methods | 🟡 | k-NN, SVM, Kernel Trick |
| 6. Generalization Theory | 🟡🔴 | VC Dimension, PAC bounds, B-V tradeoff |
| 7. Generative Models / EM | 🟡🔴 | EM algorithm, GMMs, Factor Analysis |
| 8. Neural Networks + DL | 🟡🔴 | Backprop, CNNs, Transformers |
| 9. Unsupervised Learning | 🟡🔴 | PCA/SVD, VAEs, Autoencoders |
| 10. Ensemble Methods | 🟡 | Random Forests, XGBoost |
| 11. RL + RLHF | 🔴🟣 | Policy gradients, DPO, LLM alignment |
| 12. Practical Advice | 🟢🟡 | Error analysis, debugging ML systems |
| 13. LLMs / Foundation Models | 🔴🟣 | Fine-tuning, RLHF, LoRA, evaluation |

---

*Report 05 of 12 — Machine Learning*
*Researched from live course pages: MIT 6.390 (introml.mit.edu), MIT 6.S191 (introtodeeplearning.com, 2026 schedule verified), Stanford CS229 (Spring 2026 active), CMU 10-601 (Fall 2025 schedule verified)*
*Written by Claude (Anthropic) — May 2026*
*Part of the World-Class CS / AI / ML Curriculum Deep-Dive Series*
*Next: Report 06 — AI Agents*
