# 📘 REPORT 04 — ARTIFICIAL INTELLIGENCE
## World-Class CS / AI / ML Curriculum Deep-Dive Series
### Based on MIT · Stanford · Berkeley · CMU · Harvard · Cambridge

---

> **Report:** 04 of 12
> **Topic:** Artificial Intelligence (Foundations)
> **Research Date:** May 2026
> **Depth Range:** 🟢 Introductory → 🟣 PhD
> **Primary Sources:** Stanford CS221 (Spring 2025 live), Berkeley CS188 (Fall 2025 live), MIT 6.4110 (Spring 2026 live), MIT 6.4100 OCW
> **Cross-referenced Universities:** Stanford, Berkeley, MIT, CMU, Harvard, Cambridge
> **⚠️ MIT Course Renaming Note:** MIT 6.034 (Artificial Intelligence) was renamed **6.4100** in 2022 and is now offered infrequently. The active MIT AI track course is **6.4110 — Representation, Inference, and Reasoning in AI** (L. Kaelbling). MIT also launched a new undergraduate major: **Course 6-4: Artificial Intelligence and Decision Making** (2022).

---

## 📋 TABLE OF CONTENTS

1. [Course Overview & Philosophy](#1-course-overview--philosophy)
2. [University Comparison at a Glance](#2-university-comparison-at-a-glance)
3. [Prerequisite Map](#3-prerequisite-map)
4. [Topic Tree — Full Curriculum](#4-topic-tree--full-curriculum)
5. [Detailed Chapter Breakdown](#5-detailed-chapter-breakdown)
6. [Practical Labs & Projects](#6-practical-labs--projects)
7. [Tools & Technologies](#7-tools--technologies)
8. [Key Textbooks & Papers](#8-key-textbooks--papers)
9. [University Comparison Table (Topic Coverage)](#9-university-comparison-table-topic-coverage)
10. [Industry Relevance 2025–2026](#10-industry-relevance-20252026)
11. [Research Links & Sources](#11-research-links--sources)

---

## 1. Course Overview & Philosophy

### What is Classical AI?

Artificial Intelligence, as taught in foundational university courses, is the study of **how to make computers reason, plan, and act intelligently in the face of complexity and uncertainty.** It predates modern deep learning by decades and provides the rigorous mathematical framework on which all modern AI — including LLMs, multi-agent systems, and autonomous vehicles — is built.

The standard framing, drawn from Russell & Norvig's *Artificial Intelligence: A Modern Approach*, is that AI is the study of **agents**: entities that perceive their environment and take actions to maximize some notion of goal achievement. Everything in classical AI — search, planning, games, probability, logic — is a different formulation of this agent-action-environment loop.

**Stanford CS221's definition (Spring 2025 live syllabus):**
> *"AI is the mathematics of making good decisions given incomplete information (hence the need for probability) and limited computation (hence the need for algorithms)."*

**Berkeley CS188's framing (Fall 2025 live syllabus):**
> Topics include search, game playing, knowledge representation, inference, planning, reasoning under uncertainty, machine learning, robotics, perception, and language understanding.

### Why Classical AI Still Matters in the LLM Era (2025–2026)

A common misconception is that deep learning has replaced classical AI. In practice, the most capable modern systems combine both:

- **Search algorithms** underpin AlphaGo/AlphaZero, AlphaCode, and MCTS-based LLM reasoning (o1, o3, Gemini)
- **MDPs and RL** are the mathematical foundation of RLHF — how ChatGPT, Claude, and Gemini are fine-tuned
- **Constraint satisfaction** is used in scheduling, chip design (Google), and formal verification
- **Bayesian networks** appear in medical AI diagnostics, spam filtering, and causal inference
- **Logic and knowledge representation** underlie knowledge graphs (Google KG, Wikidata) and neuro-symbolic AI 🟣

---

## 2. University Comparison at a Glance

| University | Course | Number | Level | Instructor(s) | Signature Focus |
|------------|--------|--------|-------|--------------|-----------------|
| **Stanford** | AI: Principles & Techniques | **CS221** (Spring 2025) | Junior/Senior | Moses Charikar, Zachary Robertson | Unified mathematical framework across all AI paradigms |
| **Berkeley** | Intro to Artificial Intelligence | **CS188** (Fall 2025) | Sophomore/Junior | Emma Pierson, Peyrin Kao | Pac-Man-based projects; AIMA textbook; practical depth |
| **MIT** | Representation, Inference, and Reasoning in AI | **6.4110** (Spring 2026) | Sophomore/Junior | Leslie Kaelbling | Formal probability + MDPs + POMDPs; research-oriented |
| **MIT** | Artificial Intelligence | **6.4100** (formerly 6.034) | Undergrad | Patrick Winston (archived) | Classic rule-based + symbolic AI; best OCW archive |
| **CMU** | Artificial Intelligence | **15-281** | Junior/Senior | Various | Close to Berkeley structure; heavy on logic |
| **Harvard** | AI | **CS182** | Junior/Senior | Various | Closer to deep learning integration |
| **Cambridge** | Artificial Intelligence (Part IB/II) | — | Second/Third Year | Various | Formal methods, theorem proving, planning |

### Pedagogical Philosophy Differences

**Stanford CS221** treats AI as a unified **paradigm framework**. Each topic (MDPs, CSPs, Bayes Nets, Logic) is presented as a variation on the same theme: *define the model → define the query → design the inference algorithm → optionally learn from data.* This framework makes cross-topic connections explicit and is the most theoretically cohesive approach.

**Berkeley CS188** is the most **project-driven** course. Students implement AI agents inside the Pac-Man environment across 5 projects spanning all major topics. The open-source [CS188 textbook](https://inst.eecs.berkeley.edu/~cs188/textbook/) is actively maintained (confirmed updated Summer 2025). Fall 2025 instructors: Emma Pierson and Peyrin Kao.

**MIT 6.4110** (Leslie Kaelbling, Spring 2026) is the most **formally rigorous** and research-oriented. It goes deepest on POMDPs and probabilistic graphical model inference — topics that directly underlie modern robotics and agent systems. Kaelbling is a world authority on planning under uncertainty.

---

## 3. Prerequisite Map

```
ARTIFICIAL INTELLIGENCE (FOUNDATIONAL COURSE)
│
Prerequisites confirmed from live syllabi:
│
├── Stanford CS221 requires:
│     CS 103 (Discrete Math), CS 106B (Programming),
│     CS 109 (Probability), CS 161 (Algorithms)
│
├── Berkeley CS188 requires:
│     CS 61A or 61B (Programming), CS 70 (Discrete Math + Prob)
│
└── MIT 6.4110 requires:
      6.1010 (Fundamentals of Programming),
      6.1210 (Intro to Algorithms),
      6.3700 / 6.3800 / 18.05 / 18.600 (Probability)
│
┌───────────────────────────────────────────────────────────┐
│  Core prerequisite knowledge:                             │
│  • Python programming (intermediate level)                │
│  • Probability & basic statistics (Bayes' theorem, etc.)  │
│  • Linear algebra (vectors, matrices — not eigenvectors)  │
│  • Discrete math (logic, sets, graphs)                    │
│  • Basic algorithm analysis (Big-O, recursion, BFS/DFS)   │
└───────────────────────────────────────────────────────────┘
│
                     ▼
        ARTIFICIAL INTELLIGENCE (this course)
│
                     ▼
┌──────────────────────────────────────────────────────┐
│  Unlocks:                                             │
│  Machine Learning (Report 05)                         │
│  AI Agents (Report 06)                               │
│  LLM Training & Inference (Report 07)                │
│  Robotics (motion planning, SLAM)                    │
└──────────────────────────────────────────────────────┘
```

---

## 4. Topic Tree — Full Curriculum

*Synthesized from Stanford CS221 Spring 2025, Berkeley CS188 Fall 2025, MIT 6.4110 Spring 2026, and MIT 6.4100 OCW.*

```
ARTIFICIAL INTELLIGENCE
│
├── MODULE 1: AGENTS & PROBLEM FORMULATION
│   ├── 1.1 What is an AI Agent? The PEAS Framework
│   ├── 1.2 Environment Types (fully/partially observable, deterministic/stochastic)
│   ├── 1.3 Problem Formulation as State-Space Search
│   └── 1.4 The Rationality Principle and Bounded Rationality
│
├── MODULE 2: SEARCH ALGORITHMS 🟢🟡
│   ├── 2.1 Uninformed Search
│   │   ├── Breadth-First Search (BFS)
│   │   ├── Depth-First Search (DFS)
│   │   ├── Uniform-Cost Search (UCS / Dijkstra)
│   │   └── Iterative Deepening (IDDFS)
│   ├── 2.2 Informed (Heuristic) Search
│   │   ├── Greedy Best-First Search
│   │   ├── A* Search — f(n) = g(n) + h(n)
│   │   ├── Admissibility and Consistency of Heuristics
│   │   ├── Weighted A*, IDA*
│   │   └── Pattern Databases and Relaxed Problem Heuristics
│   └── 2.3 Local Search
│       ├── Hill Climbing
│       ├── Simulated Annealing
│       ├── Genetic Algorithms
│       └── Beam Search
│
├── MODULE 3: CONSTRAINT SATISFACTION PROBLEMS (CSPs) 🟡
│   ├── 3.1 Problem Formulation — Variables, Domains, Constraints
│   ├── 3.2 Backtracking Search
│   ├── 3.3 Arc Consistency (AC-3 algorithm)
│   ├── 3.4 Variable Ordering — MRV and Degree Heuristics
│   ├── 3.5 Value Ordering — LCV Heuristic
│   ├── 3.6 Constraint Propagation
│   └── 3.7 Factor Graphs (Stanford CS221 formulation)
│
├── MODULE 4: ADVERSARIAL SEARCH & GAME PLAYING 🟡🔴
│   ├── 4.1 Game Formulation — Zero-Sum Two-Player Games
│   ├── 4.2 Minimax Algorithm
│   ├── 4.3 Alpha-Beta Pruning
│   ├── 4.4 Expectimax (Stochastic Opponents)
│   ├── 4.5 Evaluation Functions and Depth-Limited Search
│   └── 4.6 Monte Carlo Tree Search (MCTS) 🔴
│
├── MODULE 5: MARKOV DECISION PROCESSES (MDPs) 🟡🔴
│   ├── 5.1 MDP Formulation — States, Actions, Transitions, Rewards
│   ├── 5.2 Policies and the Bellman Equations
│   ├── 5.3 Value Iteration
│   ├── 5.4 Policy Iteration
│   ├── 5.5 Discounting and Infinite-Horizon MDPs
│   └── 5.6 Partially Observable MDPs (POMDPs) 🔴🟣
│
├── MODULE 6: REINFORCEMENT LEARNING 🟡🔴
│   ├── 6.1 The Reinforcement Learning Problem
│   ├── 6.2 Model-Based RL (Learn the MDP, then plan)
│   ├── 6.3 Temporal Difference (TD) Learning
│   ├── 6.4 Q-Learning (Model-Free)
│   ├── 6.5 Exploration vs. Exploitation — ε-greedy, UCB
│   └── 6.6 Approximate Q-Learning with Feature Functions
│
├── MODULE 7: PROBABILISTIC REASONING 🟡🔴
│   ├── 7.1 Probability Review — Joint, Conditional, Marginal
│   ├── 7.2 Bayesian Networks — Representation
│   ├── 7.3 Conditional Independence and D-Separation
│   ├── 7.4 Variable Elimination (Exact Inference)
│   ├── 7.5 Sampling Methods — Prior, Likelihood Weighting, Gibbs Sampling
│   ├── 7.6 Hidden Markov Models (HMMs) and the Viterbi Algorithm
│   └── 7.7 Particle Filters (Sequential Monte Carlo)
│
├── MODULE 8: MACHINE LEARNING WITHIN AI 🟡
│   ├── 8.1 Supervised Learning — Classification and Regression
│   ├── 8.2 Loss Functions — 0/1 Loss, Hinge, Cross-Entropy
│   ├── 8.3 Linear Models — Perceptron, Logistic Regression, SVMs
│   ├── 8.4 Neural Networks — Multi-layer, Backpropagation (intro)
│   ├── 8.5 Stochastic Gradient Descent
│   ├── 8.6 Generalization, Overfitting, and Regularization
│   └── 8.7 Unsupervised Learning — k-Means, EM Algorithm
│
├── MODULE 9: LOGIC & KNOWLEDGE REPRESENTATION 🟡🔴
│   ├── 9.1 Propositional Logic — Syntax, Semantics, Resolution
│   ├── 9.2 First-Order Logic (FOL) — Predicates, Quantifiers, Unification
│   ├── 9.3 Inference in FOL — Forward and Backward Chaining
│   ├── 9.4 Situation Calculus and Planning 🔴
│   ├── 9.5 Knowledge Graphs and Ontologies
│   └── 9.6 Probabilistic Logic and Markov Logic Networks 🟣
│
├── MODULE 10: PLANNING 🔴
│   ├── 10.1 Classical Planning — STRIPS, PDDL
│   ├── 10.2 Planning as Search
│   ├── 10.3 Partial-Order Planning
│   ├── 10.4 Planning Under Uncertainty — Contingent Planning
│   └── 10.5 Hierarchical Task Networks (HTN) 🟣
│
└── MODULE 11: AI SAFETY, ETHICS & SOCIETAL IMPACT 🟢🟡
    ├── 11.1 AI Bias — Sources, Types, Mitigation
    ├── 11.2 Fairness Criteria (Demographic Parity, Equalized Odds)
    ├── 11.3 Interpretability and Explainability
    ├── 11.4 AI Alignment Basics (instrumental convergence, specification gaming)
    ├── 11.5 Embedded Ethics (Stanford CS221 + Berkeley CS188 both include this)
    └── 11.6 Regulation and Policy Landscape (EU AI Act, Executive Orders)
```

---

## 5. Detailed Chapter Breakdown

### MODULE 1 — Agents & Problem Formulation 🟢

#### 1.1 The PEAS Framework

Every AI problem can be specified using PEAS:

| Component | Definition | Example (Self-Driving Car) |
|-----------|------------|---------------------------|
| **P**erformance measure | What counts as success | Safety, speed, fuel efficiency, legality |
| **E**nvironment | The world the agent operates in | Roads, other vehicles, pedestrians, weather |
| **A**ctuators | How the agent acts on the world | Steering wheel, accelerator, brakes |
| **S**ensors | How the agent perceives the world | Cameras, LiDAR, GPS, odometer |

#### 1.2 Environment Properties

| Property | Options | Effect on Agent Design |
|----------|---------|----------------------|
| Observability | Fully / Partially observable | Partial → must maintain belief state |
| Determinism | Deterministic / Stochastic | Stochastic → must plan for uncertainty |
| Episodicity | Episodic / Sequential | Sequential → must consider long-term consequences |
| Dynamism | Static / Dynamic | Dynamic → agent must act in real time |
| Agents | Single / Multi-agent | Multi → must model other agents |

---

### MODULE 2 — Search Algorithms 🟢🟡

#### 2.1 The Search Problem Formulation

A search problem is defined by:
- **State space** S: All possible configurations
- **Initial state** s₀ ∈ S
- **Goal test**: Is s ∈ Goal?
- **Actions**: A(s) — the set of valid actions from state s
- **Transition model**: Result(s, a) → s'
- **Action cost**: c(s, a, s') → ℝ

**Solution:** A sequence of actions from s₀ to a goal state. An **optimal solution** has minimum total cost.

#### 2.2 BFS vs. DFS vs. UCS — Complexity Comparison

| Algorithm | Complete? | Optimal? | Time | Space | Notes |
|-----------|-----------|----------|------|-------|-------|
| BFS | ✅ (finite) | ✅ (uniform cost) | O(bᵈ) | O(bᵈ) | b = branching factor, d = depth |
| DFS | ✅ (no cycles) | ❌ | O(bᵐ) | O(bm) | m = max depth; space-efficient |
| UCS | ✅ | ✅ | O(b^(1+⌊C*/ε⌋)) | O(b^(1+⌊C*/ε⌋)) | C* = optimal cost; ε = min action cost |
| A* | ✅ | ✅ (admissible h) | O(bᵈ) typical | O(bᵈ) | Best in practice with good heuristic |

#### 2.3 A* Search — The Core Algorithm

A* expands nodes in order of f(n) = g(n) + h(n):
- **g(n):** Actual cost to reach node n from start
- **h(n):** Estimated (heuristic) cost from n to goal
- **f(n):** Estimated total cost of cheapest solution through n

```
A* Algorithm:
  frontier = priority queue, sorted by f(n)
  frontier.push(start, f=h(start))
  explored = {}

  while frontier not empty:
    node = frontier.pop_min()
    if goal_test(node): return solution
    if node in explored: continue
    explored.add(node)
    for each child of node:
      if child not in explored:
        frontier.push(child, f = g(child) + h(child))

  return failure
```

**Admissibility:** h(n) ≤ true cost to goal from n. Ensures A* finds optimal solution.
**Consistency (Monotonicity):** h(n) ≤ c(n, a, n') + h(n') for all successors n'. Stronger condition; ensures f values never decrease along a path.

**Heuristic design examples:**

| Problem | Heuristic h(n) | Admissible? |
|---------|----------------|-------------|
| 8-puzzle | Number of misplaced tiles | ✅ (never overestimates) |
| 8-puzzle | Manhattan distance sum | ✅ (stronger — better) |
| Travelling Salesman | Minimum spanning tree cost | ✅ |
| Route finding | Straight-line distance | ✅ |

---

### MODULE 3 — Constraint Satisfaction Problems (CSPs) 🟡

#### 3.1 Problem Formulation

A CSP is defined by:
- **Variables:** X = {X₁, X₂, ..., Xₙ}
- **Domains:** D = {D₁, D₂, ..., Dₙ} — possible values for each variable
- **Constraints:** C — restrictions on combinations of variable values

**Classic CSP example — Map Coloring (Australia):**
```
Variables:  {WA, NT, Q, NSW, V, SA, T}
Domain:     {red, green, blue}
Constraints: Adjacent regions must have different colors
             WA ≠ NT, WA ≠ SA, NT ≠ SA, NT ≠ Q, ...
```

#### 3.2 Backtracking Search + Inference

Naive backtracking: assign variables one at a time, backtrack on violation.

**Speed-ups through inference:**

**Forward Checking:** After assigning Xi = v, remove values from neighboring variable domains that violate constraints. If any domain becomes empty → backtrack immediately (don't wait to discover failure later).

**AC-3 (Arc Consistency):** Repeatedly enforce constraint arcs until no domain changes. Preprocessing that prunes the search space significantly.

```
AC-3:
  queue = all arcs (Xi, Xj) in CSP
  while queue not empty:
    (Xi, Xj) = dequeue()
    if REVISE(Xi, Xj):
      if Di is empty: return FAILURE
      for each Xk neighbor of Xi (except Xj):
        queue.add((Xk, Xi))

REVISE(Xi, Xj):
  removed = False
  for each value v in Di:
    if no value w in Dj satisfies constraint(Xi=v, Xj=w):
      remove v from Di
      removed = True
  return removed
```

**Variable ordering heuristics:**
- **MRV (Minimum Remaining Values):** Choose the variable with the fewest legal values remaining — "fail first"
- **Degree Heuristic:** Tie-break by choosing variable with most constraints on remaining unassigned variables

---

### MODULE 4 — Adversarial Search & Game Playing 🟡🔴

#### 4.1 Minimax

Two-player, zero-sum, perfect information game. One player maximizes, the other minimizes.

```
MINIMAX(state, player):
  if terminal(state): return utility(state)
  if player == MAX:
    return max(MINIMAX(result(state, a), MIN) for a in actions(state))
  else:
    return min(MINIMAX(result(state, a), MAX) for a in actions(state))
```

Complexity: O(bᵐ) time, O(bm) space. Chess: b ≈ 35, m ≈ 80 → completely intractable without pruning.

#### 4.2 Alpha-Beta Pruning

Eliminates branches that cannot affect the final decision.

```
α = best MAX can guarantee along current path (−∞ initially)
β = best MIN can guarantee along current path (+∞ initially)

Prune when: α ≥ β
```

**Efficiency:** Best case O(b^(m/2)) — doubles the effective search depth. Used in all competitive game engines.

#### 4.3 Expectimax for Stochastic Games

When the opponent doesn't play optimally (or is random), replace MIN nodes with **CHANCE nodes** that take the expected value:

```
EXPECTIMAX(state, player):
  if terminal(state): return utility(state)
  if player == MAX:
    return max(EXPECTIMAX(result(state, a), CHANCE) for a in actions(state))
  if player == CHANCE:
    return Σ P(a) × EXPECTIMAX(result(state, a), MAX)
```

#### 4.4 Monte Carlo Tree Search (MCTS) 🔴

MCTS does not require a hand-crafted evaluation function. It builds a search tree incrementally using simulations (rollouts).

**4 phases per iteration:**
1. **Selection:** Traverse tree using UCB1 to select a promising leaf: UCB1(n) = Q(n)/N(n) + C√(ln N(parent)/N(n))
2. **Expansion:** Add a new child node
3. **Simulation (Rollout):** Play randomly until a terminal state
4. **Backpropagation:** Update win counts up the tree

**Key property:** MCTS does not need a domain-specific evaluation function — pure rollouts can work. With neural network policy/value functions (as in AlphaGo), it becomes extraordinarily powerful.

---

### MODULE 5 — Markov Decision Processes (MDPs) 🟡🔴

#### 5.1 MDP Formulation

An MDP is defined by the tuple (S, A, T, R, γ):

| Symbol | Name | Description |
|--------|------|-------------|
| S | States | Set of all states |
| A | Actions | Set of all actions |
| T(s, a, s') | Transition function | P(s' \| s, a) — probability of reaching s' from s via a |
| R(s, a, s') | Reward function | Immediate reward |
| γ ∈ [0,1) | Discount factor | How much future rewards are worth |

**Key property — Markov Assumption:** The future is conditionally independent of the past given the present state: P(s_{t+1} | s_t, a_t, s_{t-1}, ...) = P(s_{t+1} | s_t, a_t)

#### 5.2 The Bellman Equations

The **value function** V*(s) gives the expected discounted future reward from state s under the optimal policy:

```
V*(s) = max_a [ Σ_{s'} T(s, a, s') × (R(s, a, s') + γ V*(s')) ]
                ↑_____________________________________________↑
                Q*(s, a) — the optimal Q-value (action-value function)
```

This is the **Bellman optimality equation**. It says: the value of a state is the maximum over all actions of the expected immediate reward plus discounted value of the next state.

#### 5.3 Value Iteration

```
Initialize V(s) = 0 for all s

Repeat until convergence:
  for each s in S:
    V(s) ← max_a [ Σ_{s'} T(s, a, s') × (R(s, a, s') + γ V(s')) ]

Convergence: ||V_new - V_old||_∞ < ε
```

**Complexity per iteration:** O(|S|² × |A|) — becomes infeasible for large state spaces.

#### 5.4 POMDPs — Partially Observable MDPs 🔴🟣

*(MIT 6.4110 — L. Kaelbling's specialty)*

In a POMDP, the agent **cannot directly observe the true state**. It maintains a **belief state**: a probability distribution over states.

```
Belief update:
  b'(s') = α × O(s', a, o) × Σ_s T(s, a, s') × b(s)

Where:
  b(s)     = current belief (probability of being in state s)
  a        = action taken
  o        = observation received
  O(s',a,o)= probability of observing o in state s' after taking a
  α        = normalization constant
```

POMDPs are the formal foundation of:
- Robot navigation (SLAM — Simultaneous Localization and Mapping)
- Spoken dialogue systems
- Medical decision-making under diagnostic uncertainty
- Modern AI agent architectures with partial world models

---

### MODULE 6 — Reinforcement Learning 🟡🔴

#### 6.1 The RL Problem

Unlike MDPs where T and R are known, in **Reinforcement Learning the agent must learn T and R through interaction.**

```
Agent ─── action a_t ───► Environment
       ◄── state s_t, reward r_t ───
```

**Model-Based RL:** Learn T̂ and R̂ from experience, then use value/policy iteration.
**Model-Free RL:** Learn the value function directly without modeling T or R.

#### 6.2 Q-Learning (Model-Free) — The Core Algorithm

Q-learning learns Q*(s, a) directly from experience:

```
Q-Learning Update Rule:
  Q(s, a) ← Q(s, a) + α × [r + γ × max_{a'} Q(s', a') − Q(s, a)]
                           └────────────────────────────────────┘
                                       TD error δ

Where:
  α ∈ (0,1)  = learning rate
  γ ∈ [0,1)  = discount factor
  r          = reward received
  s'         = next state observed
```

**Convergence guarantee:** Q-learning converges to Q* with probability 1, given all (s,a) pairs visited infinitely often and α decays appropriately.

#### 6.3 Exploration vs. Exploitation

| Strategy | Formula | Behavior |
|----------|---------|----------|
| **ε-greedy** | Take random action w/ prob ε, else greedy | Simple, effective |
| **ε-greedy decay** | ε = ε₀ / (1 + episode) | Explores less over time |
| **UCB1** | a* = argmax Q(s,a) + C√(ln t / N(s,a)) | Optimism in face of uncertainty |
| **Boltzmann / Softmax** | P(a) ∝ exp(Q(s,a)/τ) | τ controls exploration temperature |

---

### MODULE 7 — Probabilistic Reasoning 🟡🔴

#### 7.1 Bayesian Networks

A Bayesian Network is a **directed acyclic graph (DAG)** where:
- Each node represents a random variable
- Each edge X → Y represents a direct probabilistic dependency
- Each node has a Conditional Probability Table (CPT): P(X | Parents(X))

**The joint distribution factorizes as:**
```
P(X₁, X₂, ..., Xₙ) = ∏ᵢ P(Xᵢ | Parents(Xᵢ))
```

This is exponentially more compact than storing the full joint. Example with 10 binary variables:
- Full joint: 2¹⁰ = 1,024 entries
- Bayesian network (sparse): Could be ~30 entries

**Classic Alarm network:**
```
    Burglary    Earthquake
        ↘         ↙
           Alarm
        ↙         ↘
  JohnCalls    MaryCalls
```

Query: P(Burglary | JohnCalls=true, MaryCalls=true) → computed via Variable Elimination or sampling.

#### 7.2 Variable Elimination

Exact inference by systematically eliminating hidden variables:

```
P(Q | E=e) = α × Σ_{hidden} ∏ factors

Steps:
1. Start with all CPTs as factors
2. Observe evidence: set observed variables to their values
3. For each hidden variable (in some ordering):
   a. Collect all factors containing that variable
   b. Multiply them into a new factor
   c. Sum out the variable from the new factor
4. Multiply remaining factors; normalize
```

Complexity: Exponential in the **treewidth** of the graph. For tree-structured Bayes nets: O(n × d²) where d = domain size.

#### 7.3 Hidden Markov Models (HMMs)

An HMM models a sequence of observations generated by a hidden state sequence:

```
Hidden states:    X₁ → X₂ → X₃ → ... → Xₙ
Observations:     Z₁    Z₂    Z₃          Zₙ

Parameters:
  Initial distribution: P(X₁)
  Transition model: P(Xₜ | Xₜ₋₁)  [same at each step: stationary]
  Observation model: P(Zₜ | Xₜ)
```

**Three main problems:**
1. **Filtering (forward algorithm):** P(Xₜ | Z₁:t) — belief about current state
2. **Smoothing:** P(Xₜ | Z₁:T) — hindsight belief
3. **Most likely sequence (Viterbi algorithm):** argmax P(X₁:T | Z₁:T) — used in speech recognition, POS tagging

---

### MODULE 8 — Machine Learning within AI 🟡

*(Bridges to Report 05 — Machine Learning)*

#### 8.1 The Learning Framework

Machine learning is presented in CS221/CS188 as a sub-module of AI, formulated as:
- Given: training data D = {(xᵢ, yᵢ)}
- Learn: a hypothesis h: X → Y that generalizes to unseen data

The **loss function** L(y, ŷ) measures prediction error. Training minimizes empirical risk:

```
min_w  (1/n) Σᵢ L(yᵢ, h_w(xᵢ)) + λ||w||²
       └─────────────────────────┘   └─────┘
         Empirical risk (fit)         Regularization
```

#### 8.2 Linear Classifiers

**Logistic Regression:**
```
P(y=1 | x; w) = σ(w · x) = 1 / (1 + exp(−w · x))

Loss: Cross-entropy: L = −[y log σ(w·x) + (1−y) log(1−σ(w·x))]
Update: w ← w − α ∇_w L
```

**Support Vector Machine (SVM) — Maximum Margin Classifier:**
```
Find w, b to maximize margin 2/||w||
Subject to: yᵢ(w · xᵢ + b) ≥ 1 for all i

Dual formulation: max Σ αᵢ − (1/2) Σᵢⱼ αᵢαⱼyᵢyⱼ xᵢ·xⱼ
Kernel trick: Replace xᵢ·xⱼ with K(xᵢ, xⱼ) → non-linear classification
```

---

### MODULE 9 — Logic & Knowledge Representation 🟡🔴

#### 9.1 Propositional Logic

**Syntax:** Atomic propositions (P, Q, ...) connected by ¬, ∧, ∨, →, ↔

**Inference by Resolution:**
```
Modus Ponens: P → Q, P ⊢ Q
Resolution:   (A ∨ B), (¬B ∨ C) ⊢ (A ∨ C)
```

**Key property:** Resolution is **sound** (only derives true things) and **complete** (can derive any entailed sentence) for propositional logic.

#### 9.2 First-Order Logic (FOL)

FOL extends propositional logic with:
- **Constants:** specific objects (John, MIT, Monday)
- **Predicates:** properties and relations (Human(John), Teaches(John, CS221))
- **Functions:** f(x) (MotherOf(John))
- **Quantifiers:** ∀x (ForAll), ∃x (ThereExists)

```
"Every student who studies hard passes the exam":
∀x. Student(x) ∧ StudiesHard(x) → PassesExam(x)

"There exists a student who aced the midterm":
∃x. Student(x) ∧ AcedMidterm(x)
```

**Unification:** The process of finding variable substitutions that make two literals identical — the key to FOL inference.

**Limitations (Gödel's Incompleteness, Halting Problem):** FOL is undecidable — we cannot always determine if a sentence is entailed in finite time. This is a fundamental limit, not a solvable engineering problem.

---

### MODULE 10 — Planning 🔴

#### 10.1 Classical Planning with PDDL

**STRIPS** (Stanford Research Institute Problem Solver, 1971) was the first formal planning language. Its modern successor is **PDDL (Planning Domain Definition Language)**, used in robotics and game AI.

```pddl
;; Domain definition
(:action move
  :parameters (?from ?to)
  :precondition (and (at ?from) (connected ?from ?to))
  :effect (and (at ?to) (not (at ?from))))

;; Problem definition
(:init (at A) (connected A B) (connected B C))
(:goal (at C))
```

**Planning as Search:** The plan is found by searching the state space, treating PDDL actions as search operators. A* with relaxed-plan heuristics (FF, FastDownward) solves benchmark problems efficiently.

---

### MODULE 11 — AI Safety, Ethics & Societal Impact 🟢🟡

#### 11.1 AI Fairness — A Non-Trivial Mathematical Challenge

Three common fairness definitions are **mutually incompatible** (Chouldechova, 2017; Kleinberg et al., 2016 — proven mathematically):

| Fairness Criterion | Definition |
|-------------------|------------|
| **Demographic Parity** | P(Ŷ=1 \| A=0) = P(Ŷ=1 \| A=1) — same positive rate across groups |
| **Equalized Odds** | P(Ŷ=1 \| Y=1, A=a) same across groups; P(Ŷ=1 \| Y=0, A=a) same across groups |
| **Calibration** | P(Y=1 \| Ŷ=p, A=a) = p across groups — predicted probabilities are accurate |

**The Impossibility Theorem:** Demographic parity + equalized odds + calibration cannot all be satisfied simultaneously unless base rates are equal across groups. This is a mathematical fact, not a limitation of current technology.

**Berkeley CS188 now includes an Embedded Ethics module** — confirmed from Fall 2025 live syllabus — requiring students to consider these trade-offs in their projects.

#### 11.2 AI Alignment Basics 🔴

The **alignment problem**: ensuring an AI system does what its designers intend, not just what they specified.

**Goodhart's Law:** *"When a measure becomes a target, it ceases to be a good measure."*
Applied to AI: when we optimize a proxy objective, the system may achieve the proxy while violating the true intent.

**Instrumental convergence** (Omohundro, Bostrom): Many goal-directed systems, regardless of their final goal, will converge on instrumental sub-goals such as self-preservation, resource acquisition, and goal-content integrity.

**Specification gaming examples:**
- Boat racing game: agent learned to spin in circles collecting power-ups instead of finishing races
- Simulated robot: evolved to fall forward quickly instead of walking — achieves high speed metric
- Content recommendation: maximizes engagement → promotes outrage content

---

## 6. Practical Labs & Projects

### Stanford CS221 Homeworks (Spring 2025)

Homework is the primary learning vehicle. Each HW centers on an application:

| HW | Topic | Application | Key Implementation |
|----|-------|-------------|-------------------|
| **HW0** | Prerequisites | Math/probability review | None — diagnostic |
| **HW1** | Search | Pacman path planning | BFS, DFS, UCS, A* from scratch |
| **HW2** | MDPs | Blackjack | Value iteration, policy iteration |
| **HW3** | Game Trees | Pac-Man vs. Ghosts | Minimax, Alpha-Beta, Expectimax |
| **HW4** | CSPs | Scheduling / Sudoku | Backtracking + AC-3 + heuristics |
| **HW5** | Bayesian Networks | Medical diagnosis | Variable elimination, sampling |
| **HW6** | Machine Learning | Sentiment analysis | Perceptron, logistic regression |
| **Project** | Open-ended | Student's choice | Any CS221 technique |

### Berkeley CS188 Projects (Fall 2025) — The Pac-Man Framework

All 5 projects use the **Berkeley Pac-Man environment** — a consistent, visual, and fun platform for testing all AI algorithms. Each project has slides, videos, and auto-grading.

| Project | Title | Topics Implemented |
|---------|-------|-------------------|
| **Project 0** | Python/Setup | Python tutorial, autograder introduction |
| **Project 1** | Search in Pacman | DFS, BFS, UCS, A* with custom heuristics |
| **Project 2** | Multi-Agent Search | Minimax, Alpha-Beta, Expectimax; evaluation functions |
| **Project 3** | MDPs and RL | Value iteration; Q-learning; Approximate Q-learning |
| **Project 4** | Ghostbusters (HMMs) | Belief propagation, exact inference, particle filtering |
| **Project 5** | Machine Learning | Neural networks; classification on MNIST-style data |

All project materials, slides, and recordings publicly available at: https://inst.eecs.berkeley.edu/~cs188/fa25/

### MIT 6.4110 Problem Sets (Spring 2026)

Problem sets emphasize **formal mathematical proofs and derivations**, not just implementation:

| PS | Topics Covered |
|----|---------------|
| **PS1** | Constraint propagation, arc consistency, formal proofs |
| **PS2** | Exact inference in Bayes nets, d-separation proofs |
| **PS3** | MDP formulation, Bellman equations, value iteration convergence |
| **PS4** | POMDP belief updates, policy computation |
| **PS5** | Planning — PDDL specification, relaxed heuristics |

### MIT 6.4100 / 6.034 Labs (OCW — archived, still highly relevant)

| Lab | Title | Topic |
|-----|-------|-------|
| **Lab 1** | Rule-Based System | Forward chaining expert system in Python |
| **Lab 2** | Search | Implement BFS, DFS, hill climbing, beam search |
| **Lab 3** | Games | Alpha-Beta pruning for Connect-4 |
| **Lab 4** | Neural Networks | Backpropagation from scratch |
| **Lab 5** | Support Vector Machines | Kernel SVM for classification |
| **Lab 6** | Boosting | AdaBoost implementation |
| **Lab 7** | Computer Vision | Edge detection, basic feature extraction |

---

## 7. Tools & Technologies

| Tool | Purpose | Taught At |
|------|---------|-----------|
| **Python 3** | Primary implementation language | All courses |
| **NumPy** | Array computation, probability calculations | All courses |
| **Pac-Man AI Framework** | Game environment for testing all algorithms | Berkeley CS188 |
| **PDDL tools** (Fast Downward, FF Planner) | Classical planning | MIT 6.4110, CMU |
| **pgmpy** | Python library for Bayesian networks | CS221 / independent |
| **OpenAI Gym / Gymnasium** | Standard RL environment | Reinforcement learning modules |
| **NetworkX** | Graph operations (for Bayes nets, CSPs) | Multiple courses |
| **Gradescope + autograders** | Assignment submission and automated testing | Stanford CS221, Berkeley CS188 |
| **LaTeX** | Typed homework writeups (CS221 encourages it) | Stanford |

---

## 8. Key Textbooks & Papers

### Primary Textbook (Universal)

| Title | Authors | Status | Notes |
|-------|---------|--------|-------|
| **Artificial Intelligence: A Modern Approach (AIMA), 4th Ed.** | Russell & Norvig | Published 2020 (Pearson) | Universal standard — used at all 6 universities. Covers entire curriculum. |
| **Berkeley CS188 Custom Textbook** | Nikhil Sharma, Josh Hug et al. | Free online; updated Summer 2025 | Course-specific, openly maintained; best companion to CS188 projects |
| **Probabilistic Graphical Models** | Koller & Friedman (MIT Press) | ~$80 | Deep reference for Bayes nets module (Stanford CS228 textbook) |
| **Reinforcement Learning: An Introduction, 2nd Ed.** | Sutton & Barto | Free online | Essential RL reference; used in CS188 Module 6 |
| **Foundations of Constraint Satisfaction** | Tsang | Free online | Deep CSP reference |
| **Artificial Intelligence: Foundations of Computational Agents** | Poole & Mackworth | Free online | Good formal complement to AIMA |

### Seminal Papers Referenced in Courses

| Paper | Authors | Year | Why Important |
|-------|---------|------|--------------|
| **Computing Machinery and Intelligence** | Turing | 1950 | The Turing Test; defines AI as a discipline |
| **A Logical Calculus Immanent in Nervous Activity** | McCulloch & Pitts | 1943 | First neural network model |
| **A* Search Algorithm** | Hart, Nilsson, Raphael | 1968 | Foundational optimal search |
| **Constraint Satisfaction Problems** | Mackworth | 1977 | Formalization of CSPs |
| **Mastering Chess and Shogi by Self-Play (AlphaZero)** | Silver et al. (DeepMind) | 2017 | MCTS + RL surpasses human chess/Go/Shogi |
| **Mastering the Game of Go with Deep Neural Networks (AlphaGo)** | Silver et al. | 2016 | MCTS + deep learning beat world champion |
| **Playing Atari with Deep Reinforcement Learning (DQN)** | Mnih et al. (DeepMind) | 2013 | Deep Q-Networks; first deep RL breakthrough |
| **Human-level Control through Deep RL** | Mnih et al. | 2015 | DQN in Nature; surpasses human on 49 Atari games |
| **Probabilistic Graphical Models: Principles and Techniques** | Koller & Friedman | 2009 | Definitive PGM textbook/reference |
| **Fairness and Abstraction in Sociotechnical Systems** | Selbst et al. | 2019 | Traps in fair ML — Berkeley's CS188 Ethics module |
| **Man is to Computer Programmer as Woman is to Homemaker? (Word2Vec bias)** | Bolukbasi et al. | 2016 | Foundational AI bias paper |

---

## 9. University Comparison Table (Topic Coverage)

| Topic | Stanford CS221 | Berkeley CS188 | MIT 6.4110 | MIT 6.4100 (archived) | CMU 15-281 |
|-------|---------------|----------------|------------|----------------------|------------|
| Search (BFS/DFS/UCS/A*) | ✅ | ✅ Deep | ✅ | ✅ | ✅ |
| CSPs | ✅ Deep | ✅ | ✅ | ✅ | ✅ |
| Game Trees (Minimax/AB) | ✅ | ✅ Deep | ❌ | ✅ | ✅ |
| MDPs | ✅ Deep | ✅ | ✅ Deep | ✅ | ✅ |
| POMDPs | ✅ Intro | ❌ | ✅ **Deep** | ❌ | ✅ Intro |
| Reinforcement Learning | ✅ | ✅ | ✅ | ✅ Intro | ✅ |
| Bayesian Networks | ✅ Deep | ✅ Deep | ✅ | ✅ | ✅ |
| HMMs | ✅ | ✅ (Ghostbusters) | ✅ | ✅ | ✅ |
| Machine Learning (intro) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Propositional / FOL | ✅ | ✅ Intro | ✅ | ✅ Deep | ✅ |
| Classical Planning (PDDL) | ❌ | ❌ | ✅ | ✅ | ✅ |
| MCTS | ✅ | ✅ | ❌ | ❌ | ✅ |
| AI Safety / Ethics | ✅ (Embedded Ethics module) | ✅ (Embedded Ethics) | ❌ | ❌ | ✅ Intro |
| Deep Learning (intro) | ✅ Intro | ✅ (Project 5) | ❌ | ✅ | ✅ Intro |

**Verdict:**
- For the **broadest and most unified theoretical framework:** Stanford CS221
- For the **best project-based learning with clear feedback:** Berkeley CS188
- For the **most rigorous formal treatment (POMDPs, planning):** MIT 6.4110
- For the **best archived materials + classic AI:** MIT 6.4100 OCW

---

## 10. Industry Relevance 2025–2026

### Where Classical AI Techniques Live in Production

| Classical AI Technique | Where It's Used in 2025–2026 |
|------------------------|------------------------------|
| **A* / Graph Search** | Google Maps, GPS navigation, video game pathfinding, robot motion planning |
| **MCTS** | AlphaGo/AlphaZero, AlphaCode, OpenAI o1/o3 "chain-of-thought" search, game AI |
| **MDPs / RL** | RLHF (all modern LLMs), autonomous driving, robotics, recommendation systems |
| **Bayesian Networks** | Medical diagnosis (IBM Watson Health), fraud detection, spam filtering |
| **HMMs** | Still used in some speech recognition pipelines; time-series anomaly detection |
| **CSPs** | Chip design verification (Intel, NVIDIA), scheduling, configuration systems (Salesforce CPQ) |
| **Logic / KR** | Knowledge graphs (Google, Meta), neuro-symbolic AI, formal verification |
| **PDDL Planning** | NASA Mars Rover scheduling, warehouse automation (Amazon Robotics) |

### AI Engineering Roles That Directly Use This Knowledge

| Role | AI Topics Needed | Salary Range (US, 2025–2026) |
|------|-----------------|-------------------------------|
| **AI/ML Engineer** | Search, MDPs, RL — foundational for understanding training | $160k–$280k |
| **Autonomous Systems Engineer** | MDPs, POMDPs, SLAM, planning — robotics/AV | $180k–$350k |
| **Game AI Developer** | Minimax, MCTS, RL, behavior trees | $120k–$220k |
| **NLP / LLM Engineer** | Bayesian models, language models, search for reasoning | $190k–$380k |
| **Knowledge Graph Engineer** | Logic, ontologies, graph reasoning | $160k–$280k |
| **AI Safety Researcher** | Alignment theory, formal methods, RL theory | $200k–$500k+ |

### The LLM + Classical AI Convergence (2025–2026)

The most important emerging trend is the integration of classical AI planning and search with LLMs:

- **OpenAI o1 / o3** uses a form of MCTS-like search over "reasoning tokens" — classical search + LLM
- **Google AlphaCode 2** uses tree search over code generation candidates
- **LATS (Language Agent Tree Search)** — LLM + MCTS for agent planning (arXiv 2023)
- **Neuro-symbolic AI** — combining FOL/knowledge graphs with neural networks for grounded reasoning
- **RAG (Retrieval-Augmented Generation)** — knowledge retrieval = graph search over a vector index

**The key insight:** Classical AI provides the *structure* (search trees, belief states, logical constraints); LLMs provide the *knowledge and language understanding*. The combination is more powerful than either alone.

---

## 11. Research Links & Sources

### Primary Live Course Pages (Verified May 2026)

| Course | URL | Status |
|--------|-----|--------|
| Stanford CS221 Spring 2025 | https://stanford-cs221.github.io/spring2025/ | **Archived — last live offering verified** |
| Stanford CS221 Spring 2026 | https://cs221.stanford.edu/ | **Current offering** |
| Berkeley CS188 Fall 2025 | https://inst.eecs.berkeley.edu/~cs188/fa25/ | **Archived — full materials available** |
| Berkeley CS188 Spring 2026 | https://inst.eecs.berkeley.edu/~cs188/sp26 | **Current offering** |
| Berkeley CS188 Custom Textbook | https://inst.eecs.berkeley.edu/~cs188/textbook/ | **Active — updated Summer 2025** |
| MIT 6.4100 OCW (formerly 6.034) | https://ocw.mit.edu/courses/6-034-artificial-intelligence-fall-2010/ | Archived (2010) |
| MIT 6.4110 Course Description | https://student.mit.edu/catalog/m6d.html | Current catalog |
| MIT 6-4 AI & Decision Making major | https://www.eecs.mit.edu/academics/undergraduate-programs/curriculum/6-4-artificial-intelligence-and-decision-making/ | Current |

### Essential Free Resources

| Resource | URL |
|----------|-----|
| AIMA Book site (Russell & Norvig) | https://aima.cs.berkeley.edu/ |
| Sutton & Barto RL Book (free) | http://incompleteideas.net/book/the-book-2nd.html |
| Berkeley Pac-Man Projects | https://inst.eecs.berkeley.edu/~cs188/fa25/projects/ |
| CS221 Lecture Notes and Slides | https://stanford-cs221.github.io/spring2025/modules/ |
| Stanford AI Index Report 2025 | https://aiindex.stanford.edu/report/ |

### Seminal Papers (Open Access)

| Paper | Link |
|-------|------|
| AlphaGo (Silver et al., Nature 2016) | https://www.nature.com/articles/nature16961 |
| AlphaZero (Silver et al. 2017) | https://arxiv.org/abs/1712.01815 |
| DQN — Playing Atari (Mnih et al. 2013) | https://arxiv.org/abs/1312.5602 |
| LATS: Language Agent Tree Search | https://arxiv.org/abs/2310.04406 |
| Fairness Impossibility (Chouldechova) | https://arxiv.org/abs/1703.00056 |

---

## 📊 Depth Summary

| Module | Depth | Core Skill |
|--------|-------|------------|
| 1. Agents & Problem Formulation | 🟢 Introductory | PEAS framing, environment classification |
| 2. Search Algorithms | 🟡 Intermediate | A* implementation + heuristic design |
| 3. Constraint Satisfaction | 🟡 Intermediate | Backtracking + AC-3 + ordering |
| 4. Adversarial Search / Games | 🟡🔴 Advanced | Minimax, Alpha-Beta, MCTS |
| 5. MDPs | 🟡🔴 Advanced | Bellman equations, value iteration |
| 5b. POMDPs | 🔴🟣 PhD | Belief state planning |
| 6. Reinforcement Learning | 🟡🔴 Advanced | Q-learning convergence proofs |
| 7. Probabilistic Reasoning | 🟡🔴 Advanced | Variable elimination, particle filters |
| 8. ML within AI | 🟡 Intermediate | Linear models, SGD |
| 9. Logic & KR | 🟡🔴 Advanced | FOL inference, unification |
| 10. Planning | 🔴 Advanced | PDDL, STRIPS, planning heuristics |
| 11. AI Safety & Ethics | 🟢🟡 Intro/Inter | Fairness mathematics, alignment basics |

---

*Report 04 of 12 — Artificial Intelligence*
*Researched from live course pages (Stanford CS221 Spring 2025, Berkeley CS188 Fall 2025, MIT 6.4110 Spring 2026)*
*Written by Claude (Anthropic) — May 2026*
*Part of the World-Class CS / AI / ML Curriculum Deep-Dive Series*
*Next: Report 05 — Machine Learning*
