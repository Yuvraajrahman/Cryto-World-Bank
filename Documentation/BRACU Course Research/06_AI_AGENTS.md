# 📘 REPORT 06 — AI AGENTS
## World-Class CS / AI / ML Curriculum Deep-Dive Series
### Based on Stanford · MIT · Berkeley · Anthropic · OpenAI Research

---

> **Report:** 06 of 12
> **Topic:** AI Agents — Architecture, Frameworks, and Engineering
> **Research Date:** May 2026
> **Depth Range:** 🟢 Introductory → 🟣 PhD
> **Primary Sources (live-verified):**
> - Stanford **CS329A** Self-Improving AI Agents — Autumn 2025 (cs329a.stanford.edu, full schedule verified)
> - OpenAI **Agents SDK** Documentation — openai.github.io/openai-agents-python (verified May 2026)
> - Anthropic **MCP** — Model Context Protocol (97M installs by March 2026; donated to Agentic AI Foundation Dec 2025)
> - LangGraph / CrewAI / Google ADK current documentation
> - Agent benchmark landscape: SWE-bench, GAIA, OSWorld, ARC-AGI-3 (all current)
>
> **⚠️ Key 2025–2026 Developments Verified:**
> - Stanford CS329A (Chowdhery & Mirhoseini) launched Autumn 2025 as a **graduate research seminar** — the first dedicated AI agents course at a top university. Full paper-by-paper schedule retrieved.
> - OpenAI Agents SDK released **March 2025** (replaced experimental Swarm). Google ADK released **April 2025**.
> - MCP crossed **97 million installs** on March 25, 2026 — the fastest adoption of any AI infrastructure standard in history.
> - **ARC-AGI-3** launched March 2026; all frontier systems score below 1%.
> - **SWE-bench Verified** is being superseded by **SWE-bench Pro** (Scale AI SEAL leaderboard) due to data contamination issues.

---

## 📋 TABLE OF CONTENTS

1. [What is an AI Agent?](#1-what-is-an-ai-agent)
2. [University Coverage at a Glance](#2-university-coverage-at-a-glance)
3. [Prerequisite Map](#3-prerequisite-map)
4. [Topic Tree — Full Curriculum](#4-topic-tree--full-curriculum)
5. [Detailed Chapter Breakdown](#5-detailed-chapter-breakdown)
6. [Frameworks & SDKs (2026 Landscape)](#6-frameworks--sdks-2026-landscape)
7. [Benchmarks & Evaluation](#7-benchmarks--evaluation)
8. [Stanford CS329A — Full Schedule & Papers](#8-stanford-cs329a--full-schedule--papers)
9. [Practical Labs & Projects](#9-practical-labs--projects)
10. [Key Textbooks & Papers](#10-key-textbooks--papers)
11. [Industry Relevance 2025–2026](#11-industry-relevance-20252026)
12. [Research Links & Sources](#12-research-links--sources)

---

## 1. What is an AI Agent?

### Definition

An **AI agent** is a system that combines a foundation model (typically an LLM) with the ability to **reason, plan, use tools, maintain memory, and take multi-step actions** in pursuit of a goal — without requiring explicit human instructions at every step.

The classic (pre-LLM) definition from Report 04 described agents as PEAS entities. The modern definition, reflecting 2024–2026 LLM-era practice, is:

> *"An AI agent is an LLM configured with instructions, tools, memory, and the ability to orchestrate other agents — capable of autonomously completing multi-step tasks across extended time horizons."*
> — OpenAI Agents SDK documentation (verified May 2026)

### The Four Core Capabilities

```
┌─────────────────────────────────────────────────────────────┐
│                      AI AGENT                               │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ REASON   │  │  PLAN    │  │  ACT     │  │ REMEMBER │  │
│  │          │  │          │  │          │  │          │  │
│  │ Chain-of │  │ Decompose│  │ Tool use │  │ Context  │  │
│  │ thought  │  │ tasks,   │  │ Code exec│  │ Short-   │  │
│  │ Self-    │  │ sequence │  │ Web/APIs │  │ term,    │  │
│  │ critique │  │ steps,   │  │ File I/O │  │ Long-    │  │
│  │ Verify   │  │ delegate │  │ Computer │  │ term,    │  │
│  │          │  │          │  │ use      │  │ Episodic │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Single-Agent vs. Multi-Agent

| Dimension | Single Agent | Multi-Agent System |
|-----------|-------------|-------------------|
| **Structure** | One LLM + tools | Multiple specialized agents coordinated |
| **Best for** | Focused, bounded tasks | Complex, parallel, or specialized workflows |
| **Coordination** | Internal reasoning | Orchestrator / handoffs / message passing |
| **Failure modes** | Context window limits | Coordination overhead, cascading failures |
| **Examples** | Claude Code, Cursor | AutoGPT, multi-agent pipelines, AI Scientist |

---

## 2. University Coverage at a Glance

AI Agents as a standalone course is **very new** — the field moved too fast for traditional curricula. As of 2025–2026, dedicated coverage exists at:

| University | Course | Status | Focus |
|------------|--------|--------|-------|
| **Stanford** | **CS329A** Self-Improving AI Agents | ✅ Autumn 2025 (verified) | Graduate research seminar; self-improvement, tool use, memory, multi-step reasoning, coding agents |
| **Stanford** | CS372 AGI: Reasoning, Planning, Decision Making | ✅ Online | Planning, classical + neural |
| **MIT** | 6.S191 L7 "The Three Laws of AI" | ✅ 2026 | AI safety + agent responsibilities |
| **CMU** | 17-645 / 11-695 MLIP / AI Engineering | ✅ Spring 2026 | ML systems + agents in production |
| **Berkeley** | CS294 Advanced Topics (various) | ✅ Various | Research seminars on agents |
| **Oxford / Cambridge** | Embedded in NLP / ML courses | ✅ | Tool use, planning modules |

**Key finding:** Stanford CS329A (Aakanksha Chowdhery + Azalia Mirhoseini, Autumn 2025) is the most comprehensive dedicated AI agents course available at a top university. It is structured as a research seminar with 20 lectures, 3 homework assignments, and original research projects. Guest lecturers from Google DeepMind (Melvin Johnson, Denny Zhou, Thang Luong), Physical Intelligence, and Reflection AI.

---

## 3. Prerequisite Map

```
AI AGENTS
│
Prerequisites (from CS329A live syllabus):
│
├── NLP with Deep Learning (CS224N) OR
│   Systems for ML (CS229S) OR equivalent
├── Fluency in Python + LLM API usage (OpenAI / Anthropic / Gemini)
├── Machine Learning fundamentals (Report 05)
└── AI fundamentals — MDPs, search, planning (Report 04)
│
┌──────────────────────────────────────────────────────────────┐
│  Prior knowledge assumed:                                    │
│  • Transformer architecture (attention, positional encoding) │
│  • LLM inference (sampling, temperature, top-p)             │
│  • Prompt engineering basics                                 │
│  • Python async programming (asyncio) — for parallel agents  │
│  • REST API usage, JSON handling                             │
│  • Basic Docker/containers — for sandboxed agent execution   │
└──────────────────────────────────────────────────────────────┘
│
              ▼
      AI AGENTS (this course)
│
              ▼
┌──────────────────────────────────────────────────────┐
│  Unlocks:                                            │
│  LLM Training & Inference (Report 07)               │
│  AI Application Development (Report 08)             │
│  MLOps — Production AI Systems (Report 09)          │
└──────────────────────────────────────────────────────┘
```

---

## 4. Topic Tree — Full Curriculum

*Synthesized from Stanford CS329A Autumn 2025 (full schedule verified), OpenAI Agents SDK docs, Anthropic MCP documentation, and 2025–2026 research literature.*

```
AI AGENTS
│
├── MODULE 1: AGENT FOUNDATIONS 🟢🟡
│   ├── 1.1 The Agent Loop — Perceive → Reason → Act → Observe
│   ├── 1.2 Anatomy of an LLM Agent (instructions, tools, memory, handoffs)
│   ├── 1.3 Tool Use — Function calling, JSON schema, validation
│   ├── 1.4 The Role of Context Windows
│   └── 1.5 Agent vs. Chatbot vs. Workflow — What makes a system "agentic"?
│
├── MODULE 2: REASONING PATTERNS 🟡🔴
│   ├── 2.1 Chain-of-Thought (CoT) Prompting
│   ├── 2.2 ReAct — Reasoning + Acting Interleaved
│   ├── 2.3 Reflection and Self-Critique (Reflexion)
│   ├── 2.4 Self-Refine — Iterative improvement with feedback
│   ├── 2.5 Tree of Thought (ToT) — Branching search over reasoning paths
│   └── 2.6 Program of Thought (PoT) — Reasoning via code generation
│
├── MODULE 3: TEST-TIME COMPUTE SCALING 🟡🔴
│   ├── 3.1 Best-of-N Sampling (Large Language Monkeys)
│   ├── 3.2 Majority Voting / Self-Consistency
│   ├── 3.3 Process Reward Models (PRMs) — Step-by-step verification
│   ├── 3.4 Outcome Reward Models (ORMs)
│   ├── 3.5 Monte Carlo Tree Search (MCTS) applied to LLM reasoning
│   ├── 3.6 LATS — Language Agent Tree Search
│   ├── 3.7 Adaptive Branching — Wider vs. Deeper search (AB-MCTS)
│   └── 3.8 Archon — Architecture Search for Inference-Time Techniques 🔴
│
├── MODULE 4: TRAIN-TIME SCALING & SELF-IMPROVEMENT 🔴🟣
│   ├── 4.1 STaR — Bootstrapping Reasoning with Reasoning
│   ├── 4.2 Constitutional AI — Self-critique from principles
│   ├── 4.3 RLEF — RL from Execution Feedback
│   ├── 4.4 DAPO — Distributed Actor-learner Policy Optimization
│   ├── 4.5 DeepSeekMath / DeepSeekR1 — Math reasoning via RL
│   ├── 4.6 Scalable RL for Reasoning — GRPO, PPO, REINFORCE variants
│   └── 4.7 Self-Play and Debate as Self-Improvement Mechanisms 🟣
│
├── MODULE 5: PLANNING & MULTI-STEP REASONING 🟡🔴
│   ├── 5.1 Task Decomposition — Breaking goals into subgoals
│   ├── 5.2 Plan-and-Execute Pattern
│   ├── 5.3 SWiRL — Synthetic data + multi-step RL for tool use
│   ├── 5.4 ADaPT — As-Needed Decomposition and Planning
│   ├── 5.5 SPRINT — Interleaved Planning and Parallelized Execution
│   └── 5.6 Hierarchical Planning — Task → Subtask → Action
│
├── MODULE 6: TOOL USE & ENVIRONMENT INTERACTION 🟡🔴
│   ├── 6.1 Tool Definition (JSON schema, Pydantic models)
│   ├── 6.2 Function Calling — OpenAI / Anthropic / Gemini API patterns
│   ├── 6.3 Code Execution Tools — Python REPL, sandboxes
│   ├── 6.4 Web Browsing / Search Tools
│   ├── 6.5 File System and Database Tools
│   ├── 6.6 Computer Use — GUI control (mouse, keyboard, screen)
│   ├── 6.7 MCP — Model Context Protocol (Anthropic, Nov 2024) 🔴
│   └── 6.8 A2A — Agent-to-Agent Protocol (Google, Apr 2025) 🔴
│
├── MODULE 7: MEMORY SYSTEMS 🟡🔴
│   ├── 7.1 Four Memory Types — Sensory, Working, Episodic, Semantic
│   ├── 7.2 In-Context Memory — The conversation window as memory
│   ├── 7.3 External Memory — Vector stores, key-value stores
│   ├── 7.4 RAG — Retrieval-Augmented Generation
│   ├── 7.5 MemGPT — LLMs as Operating Systems for memory
│   ├── 7.6 Mem0 — Production memory layer (2026 state-of-art)
│   ├── 7.7 Graph Memory — Entity-relationship structured retrieval 🔴
│   └── 7.8 Cache Augmentation — KV cache reuse, CacheBlend 🔴🟣
│
├── MODULE 8: MULTI-AGENT ARCHITECTURES 🔴🟣
│   ├── 8.1 Orchestrator–Subagent Pattern
│   ├── 8.2 Peer Agents with Handoffs
│   ├── 8.3 Role-Based Multi-Agent Systems (CrewAI pattern)
│   ├── 8.4 Agent as Tool (OpenAI SDK pattern)
│   ├── 8.5 Supervisor / Hierarchical Networks
│   ├── 8.6 Debate and Critique Multi-Agent Patterns
│   └── 8.7 Agent Communication Protocols — MCP, A2A, shared state 🟣
│
├── MODULE 9: SELF-IMPROVING & OPEN-ENDED AGENTS 🔴🟣
│   ├── 9.1 Automated Algorithm Design (AADS)
│   ├── 9.2 The AI Scientist — Fully automated scientific discovery
│   ├── 9.3 AlphaEvolve — Gemini-powered coding agent for algorithm design
│   ├── 9.4 Self-Evolving Agent Systems (open-ended evolution)
│   ├── 9.5 Recursive Self-Improvement — Gödel Machine, STOP
│   └── 9.6 Safety of Self-Improving Systems — PAC learnability boundary 🟣
│
├── MODULE 10: CODING & SOFTWARE ENGINEERING AGENTS 🔴
│   ├── 10.1 SWE-bench and Coding Agent Benchmarks
│   ├── 10.2 CodeMonkeys — Test-time scaling for software engineering
│   ├── 10.3 SWE-agent — Shell interface for coding agents
│   ├── 10.4 AlphaCode 2 — Competition-level code generation
│   ├── 10.5 KernelBench — LLMs writing efficient GPU kernels
│   ├── 10.6 Claude Code — Agentic coding in the terminal
│   └── 10.7 Cursor, Devin, GitHub Copilot Workspace — Industry products
│
├── MODULE 11: AGENTIC EVALUATION & SAFETY 🟡🔴🟣
│   ├── 11.1 Evaluation Frameworks — GAIA, WebArena, OSWorld, SWE-bench
│   ├── 11.2 Long-Horizon Task Benchmarks — METR HCAST, Time Horizons
│   ├── 11.3 ARC-AGI-2 and ARC-AGI-3 (launched March 2026)
│   ├── 11.4 Human-in-the-Loop Design — When to pause for human approval
│   ├── 11.5 Guardrails — Input/output validation, content filtering
│   ├── 11.6 Prompt Injection Attacks and Defenses
│   ├── 11.7 Benchmark Integrity Issues (contamination, gaming) 🔴
│   └── 11.8 Interpretability of Agent Decisions 🟣
│
└── MODULE 12: PRODUCTION AGENT ENGINEERING 🟡🔴
    ├── 12.1 Agent Lifecycle — Design, prompt, test, monitor, improve
    ├── 12.2 Tracing and Observability (LangSmith, Langfuse, Arize)
    ├── 12.3 Cost and Latency Management
    ├── 12.4 Stateful Agents — Sessions, checkpointing, durable execution
    ├── 12.5 Realtime Agents — Voice, streaming, low-latency
    ├── 12.6 Sandboxed Execution — Docker, E2B, Modal
    └── 12.7 Human-in-the-Loop Workflows — Interrupt, approve, resume
```

---

## 5. Detailed Chapter Breakdown

### MODULE 1 — Agent Foundations 🟢🟡

#### 1.1 The Modern Agent Loop

Unlike the classical AI agent loop from Report 04, a modern LLM agent loop looks like this:

```
┌─────────────────────────────────────────────────────────┐
│                    AGENT LOOP                           │
│                                                         │
│  User/System prompt                                     │
│        ↓                                               │
│  [LLM: Reason about task]                              │
│        ↓                                               │
│  Emit: text response OR tool call                      │
│        ↓                          ↓                   │
│  Return to user          Execute tool                  │
│  (terminate)                   ↓                      │
│                         Observe tool result            │
│                                   ↓                   │
│                         Append to context              │
│                                   ↓                   │
│                         [LLM: Reason again]   ← loop  │
└─────────────────────────────────────────────────────────┘
```

The loop continues until:
- The LLM produces a final text response (no tool call)
- A stop condition is triggered (max turns, cost limit)
- Human approval is required (HITL interrupt)

#### 1.2 Anatomy of an Agent (OpenAI Agents SDK definition)

From the OpenAI Agents SDK documentation (verified May 2026):

```python
from agents import Agent

agent = Agent(
    name="Research Agent",
    instructions="You are a research assistant. Search the web, "
                 "read papers, and summarize findings accurately.",
    model="gpt-4o",
    tools=[web_search, read_pdf, write_file],    # what the agent can do
    handoffs=[citation_agent, critic_agent],      # agents it can delegate to
    output_type=ResearchReport,                   # structured output schema
)
```

**Core primitives** (from OpenAI Agents SDK):
- **Agent:** LLM + instructions + tools + guardrails + handoffs
- **Tool:** Any Python function → auto-converted to JSON schema
- **Handoff:** Transfer control to a specialized agent
- **Guardrail:** Input/output validation running in parallel
- **Trace:** Built-in observability for the full agent run

#### 1.3 Tool Use — The Foundation of Agency

A tool is a function the LLM can call. The LLM outputs a structured request; the framework executes the function and returns the result.

```python
# Tool definition (Python)
def search_web(query: str) -> str:
    """Search the internet for information about the query."""
    return web_search_api(query)

# Auto-converted to JSON schema for the LLM:
{
  "name": "search_web",
  "description": "Search the internet for information about the query.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {"type": "string", "description": "The search query"}
    },
    "required": ["query"]
  }
}
```

**Tool types** (from OpenAI Agents SDK / Anthropic docs):

| Type | Examples | Notes |
|------|---------|-------|
| **Function tools** | Any Python/JS function | Most flexible; automatic schema generation |
| **Hosted tools** | Web search, code interpreter | Managed by API provider |
| **MCP tools** | Any MCP server's exposed tools | Standardized via Model Context Protocol |
| **Computer use** | Mouse, keyboard, screenshot | GUI automation; Claude's Computer Use API |
| **Agent-as-tool** | Sub-agents | Another agent callable as a tool |

---

### MODULE 2 — Reasoning Patterns 🟡🔴

#### 2.1 Chain-of-Thought (CoT)

The simplest and most impactful prompt engineering technique for complex reasoning:

```
Without CoT:
  Q: "Roger has 5 tennis balls. He buys 2 cans of 3 balls. How many total?"
  A: "11"

With CoT (Wei et al. 2022):
  Q: [same question] "Let's think step by step."
  A: "Roger starts with 5 balls.
      He buys 2 × 3 = 6 more balls.
      Total = 5 + 6 = 11 balls."
```

**Zero-shot CoT:** Adding "Let's think step by step" — zero examples needed.
**Few-shot CoT:** Providing worked examples in the prompt.

**Why it works:** CoT forces the model to externalize intermediate reasoning into the token stream, which the model then conditions on to produce better subsequent tokens. It's serial computation at test time.

#### 2.2 ReAct — Reasoning + Acting (Yao et al. 2022)

ReAct interleaves reasoning and tool use in the same token stream:

```
Thought: I need to find the population of Tokyo.
Action: search_web("Tokyo population 2025")
Observation: "Tokyo has a population of approximately 13.96 million in 2025."

Thought: Now I have the population. I can answer the question.
Action: final_answer("Tokyo's population is approximately 13.96 million.")
```

ReAct is the foundational pattern for most production agents. It is one of the first papers assigned in Stanford CS329A (Lecture 4, Oct 3, 2025).

**ReAct advantages:**
- Grounded in real information from tool calls
- Reasoning traces are human-readable / debuggable
- Can backtrack and try different tools on failure

#### 2.3 Reflexion — Learning from Failure

Reflexion (Shinn et al. 2023) extends ReAct by adding a **reflection phase** after failure:

```
Episode 1: Agent attempts task → fails
Reflect: "I failed because I searched too broadly. Next time, be more specific."
[Reflection stored in working memory]

Episode 2: Agent uses reflection as context → improved attempt
```

**From the Redis AI Architecture blog (Feb 2026):**
> *"The Reflexion pattern extends ReAct through five phases: reasoning, acting, observing results, reflecting on what worked or failed, and repeating with learned improvements. This costs typically 2–3× more tokens versus single-pass approaches."*

#### 2.4 Tree of Thought (ToT) 🔴

ToT treats reasoning as a search problem over a tree of thoughts. Instead of one linear chain, the model generates multiple reasoning branches and evaluates them:

```
Problem: Write a persuasive essay on X
                    Goal
                   /    \
          Approach A    Approach B
          /      \         /     \
    Draft A1  Draft A2  Draft B1  Draft B2
       ↓
  [Evaluator scores each]
       ↓
  Best path selected → continue
```

More expensive (O(branching factor × depth) LLM calls) but substantially better on tasks requiring search over solution spaces.

---

### MODULE 3 — Test-Time Compute Scaling 🟡🔴

This is the defining research theme of 2024–2026 and the opening topic of Stanford CS329A.

#### 3.1 The Core Insight

**Training-time scaling** (more data, more parameters, more compute during training) has driven AI progress since 2018. **Test-time compute scaling** is the idea that spending more compute *at inference time* — via multiple samples, search, or verification — can dramatically improve performance on hard tasks.

**Large Language Monkeys (Brown et al. 2024 — CS329A Week 2 paper):**
> Performance on coding tasks increases near-log-linearly with the number of samples, as long as any one correct sample can be identified.

```
Performance ∝ 1 − (1 − p)^n

Where:
  p = probability of a single sample being correct
  n = number of samples drawn

Key result: Even if p = 0.01 (1% per sample), with n = 100 samples,
            probability of at least one correct = 1 − 0.99^100 ≈ 63%
            With n = 300: ≈ 95%
```

**The verification bottleneck:** Sampling more is only useful if you can identify the correct answer. This is why **verifiers/reward models** are so critical.

#### 3.2 Process Reward Models (PRMs)

PRMs (Lightman et al. 2023, "Let's Verify Step by Step" — CS329A Week 3) evaluate the correctness of **each reasoning step**, not just the final answer.

```
Problem: Solve math problem X

Model generates:
  Step 1: [reasoning] → PRM: 0.95 (likely correct)
  Step 2: [reasoning] → PRM: 0.87
  Step 3: [reasoning] → PRM: 0.31 ← ERROR DETECTED HERE
  Step 4: [wrong reasoning]

Use PRM to:
  (a) Select best-of-N based on step scores
  (b) Guide beam search (only expand high-scoring prefixes)
  (c) Train the model to correct low-scoring steps
```

**Math-Shepherd (Wang et al. 2023 — CS329A Week 3):** Generates PRM training data automatically via execution feedback — no human annotations needed.

#### 3.3 LATS — Language Agent Tree Search 🔴

LATS (Zhou et al. 2023 — CS329A Week 5) combines LLM reasoning with MCTS:

```
LATS = ReAct + Monte Carlo Tree Search

Selection:    UCB1 to pick promising node in reasoning tree
Expansion:    LLM generates candidate next actions/thoughts
Simulation:   Roll out to terminal state (LLM generates until done)
Backpropagation: Update value estimates based on outcome
```

**Result:** LATS significantly outperforms chain-of-thought and ReAct on complex reasoning, code generation, and web navigation — at the cost of many more LLM calls.

---

### MODULE 4 — Train-Time Scaling & Self-Improvement 🔴🟣

#### 4.1 STaR — Self-Taught Reasoner (Zelikman et al. 2022 — CS329A Week 6)

The core idea: use the model to generate reasoning traces, filter those that lead to correct answers, and train the model on them.

```
Algorithm STaR:
  Dataset D = {(x, y)}   [problems and answers]

  Repeat until convergence:
    1. For each x in D:
       Sample rationale r = Model(x)
       Check: does r lead to correct y?
    2. Add (x, r, y) to training set where r is correct
    3. Fine-tune Model on new training set
    4. Model now generates better rationales → better outcomes
```

**This is self-improvement:** The model generates its own training data and gets better over time — without additional human labels.

#### 4.2 Constitutional AI (Anthropic 2022 — CS329A Week 4)

Constitutional AI trains models to critique and revise their own outputs according to a set of principles (the "constitution"):

```
Step 1 — Critique:
  [Prompt]: Here is a response: {response}
  Identify specific ways it violates {principle_X}.

Step 2 — Revision:
  [Prompt]: Rewrite the response to address the critique above.

Step 3 — RL from AI Feedback (RLAIF):
  Train a preference model on (original, revised) pairs
  → Use preference model instead of human raters in RLHF
```

**Significance:** Constitutional AI is the foundation of Claude's training at Anthropic. RLAIF (RL from AI Feedback) scales supervision beyond what human labelers alone can provide.

#### 4.3 DeepSeekR1 / DeepSeekMath — RL for Reasoning at Scale 🟣

DeepSeekMath (Wang et al. 2024 — CS329A Week 6) and its successors demonstrated that math and code reasoning can be dramatically improved through:

```
GRPO (Group Relative Policy Optimization):
  - Sample N outputs for each problem
  - Use relative rankings within the group as reward signal
  - No separate value model needed (simpler than PPO)

Key result: DeepSeekR1 (671B, MoE) achieved GPT-4-level math/reasoning
            using open data and RL — without RLHF from human raters
```

---

### MODULE 5 — Planning & Multi-Step Reasoning 🟡🔴

#### 5.1 Plan-and-Execute Pattern

The most common planning architecture:

```
Phase 1 — PLAN:
  Input: User goal
  Planner LLM → Structured plan: [step1, step2, step3, ...]

Phase 2 — EXECUTE:
  For each step in plan:
    Executor agent → runs step, handles tool calls
    Reports result back

Phase 3 — REPLAN (if needed):
  If step fails or new info changes the plan → replan
```

**Advantage over pure ReAct:** Plans can be executed in parallel (different agents execute different steps). Predictable cost and structure.

**Disadvantage:** Plans can go stale when early steps produce unexpected results.

#### 5.2 SPRINT — Interleaved Planning + Parallelized Execution 🔴

*(CS329A Week 5 reading — Arxiv 2506.05745)*

SPRINT extends Plan-and-Execute by:
- **Interleaving** plan updates with execution results
- **Parallelizing** independent subtasks across multiple workers
- Using a **controller** to manage dependencies between tasks

```
                  CONTROLLER
                 /     |      \
          Task A    Task B    Task C    [Parallel]
            ↓         ↓         ↓
         Result A  Result B  Result C
                 \     |      /
                  CONTROLLER
                 [Update plan based on results]
                      ↓
                  Continue...
```

---

### MODULE 6 — Tool Use & Environment Interaction 🟡🔴

#### 6.1 Model Context Protocol (MCP) 🔴

MCP was introduced by Anthropic in November 2024 and has become the **universal standard** for connecting AI agents to external tools and data sources.

**The problem MCP solves:** Before MCP, every AI model needed custom connectors for every tool (the N×M integration problem). MCP creates a standard client-server protocol — like USB-C for AI tools.

**MCP architecture:**
```
┌─────────────────────────────────────────────────────────┐
│                    HOST PROCESS                         │
│   (Claude Desktop, Claude Code, custom app)             │
│                                                         │
│   ┌──────────────┐         ┌──────────────────┐        │
│   │  AI Model    │◄───────►│   MCP Client     │        │
│   │  (LLM)       │         │  (protocol layer)│        │
│   └──────────────┘         └──────────────────┘        │
│                                      │                  │
└──────────────────────────────────────┼──────────────────┘
                                       │ JSON-RPC 2.0
                         ┌─────────────┴──────────────┐
                         │                            │
                  ┌──────┴─────┐            ┌────────┴─────┐
                  │ MCP Server  │            │ MCP Server   │
                  │ (GitHub)    │            │ (Postgres)   │
                  └─────────────┘            └──────────────┘
```

**MCP Server exposes three primitives:**
- **Tools:** Functions the LLM can call (search, write file, query DB)
- **Resources:** Data the LLM can read (files, DB tables, API data)
- **Prompts:** Reusable prompt templates

**Adoption (verified May 2026):**
- 97 million installs by March 25, 2026 (fastest adoption of any AI infra standard)
- Adopted by: OpenAI, Google DeepMind, Microsoft, Cloudflare, and thousands of developers
- Donated to the **Agentic AI Foundation** by Anthropic in December 2025
- Claude's tool use error rates dropped 40% in March 2026 through enhanced computer use

#### 6.2 Computer Use — GUI Agents

Computer Use agents control a computer's GUI directly — mouse clicks, keyboard input, screen capture — allowing them to use any application without API access.

```
Loop:
  1. Take screenshot of current screen state
  2. LLM: "What action should I take to accomplish goal X?"
  3. Execute action: click(x=342, y=156) OR type("Hello") OR scroll(...)
  4. Take new screenshot → observe result
  5. Repeat until goal achieved or error
```

**Current state (2026):** Anthropic's Computer Use API and Claude Code are the most capable. OSWorld benchmark (369 cross-app tasks) shows a 60-point gap between human and AI performance at launch (2024), with rapid improvement through 2025–2026.

---

### MODULE 7 — Memory Systems 🟡🔴

#### 7.1 The Four Memory Types in AI Agents

Drawing from cognitive science (and MemGPT, Packer et al. 2023 — CS329A Week 14):

| Memory Type | In Humans | In AI Agents | Example |
|-------------|-----------|-------------|---------|
| **Sensory/Working** | Short-term buffer | LLM context window | Current conversation |
| **Episodic** | Specific past events | Retrieved conversation summaries | "Last Tuesday the user said..." |
| **Semantic** | General knowledge | Vector store / knowledge base | Company policies, domain facts |
| **Procedural** | Skills / how-to | System prompts, tools, fine-tuning | How to format a report |

#### 7.2 RAG — Retrieval-Augmented Generation

RAG is the dominant pattern for giving agents access to large external knowledge bases:

```
RAG Pipeline:
  Offline (index time):
    Documents → Chunk → Embed (e.g., text-embedding-3-small)
    → Store in vector DB (Pinecone, Chroma, pgvector, Weaviate)

  Online (query time):
    User query → Embed query
    → kNN search in vector DB → retrieve top-K chunks
    → Inject into LLM context: "Here is relevant context: {chunks}"
    → LLM generates grounded response

  Limitations:
    - Chunks must fit in context window
    - Embedding quality determines retrieval quality
    - Struggles with multi-hop reasoning (A → B → C relationships)
```

#### 7.3 MemGPT — LLMs as Operating Systems 🔴

*(CS329A Week 14 paper — Packer et al. 2023)*

MemGPT treats the LLM's context window like RAM in an OS, with external storage as disk. The agent actively manages what stays in context:

```
MemGPT Architecture:
  Main Context (FIFO, limited) ← "RAM"
  Archival Storage (infinite)  ← "Disk"
  Recall Storage (recent)      ← "Cache"

Agent operations:
  archival_memory_insert(content)   → move to long-term storage
  archival_memory_search(query)     → retrieve from long-term storage
  core_memory_replace(old, new)     → update in-context facts
```

#### 7.4 Production Memory — State of the Art (May 2026)

From the Mem0 "State of AI Agent Memory 2026" report (verified May 2026):

- **Multi-signal retrieval:** Semantic similarity + keyword matching + entity matching — fused results outperform pure vector similarity
- **Graph memory is emerging:** Moving beyond flat vector stores to entity-relationship graphs for multi-hop reasoning
- **Temporal queries** (what happened when?) remain the hardest — +29.6 points from new algorithms
- **Key production databases:** Pinecone, Weaviate, pgvector, Chroma (open-source), Redis (vector + in-memory)

---

### MODULE 8 — Multi-Agent Architectures 🔴🟣

#### 8.1 Orchestrator–Subagent Pattern

The most common production multi-agent architecture:

```
User Request
     ↓
┌─────────────────┐
│  ORCHESTRATOR   │  ← Planner, router, coordinator
│  (Triage Agent) │
└─────────────────┘
  ↙      ↓       ↘
[A]    [B]       [C]    ← Specialist subagents
Code   Research  Writer
Agent  Agent     Agent
```

In the OpenAI Agents SDK, this is implemented via **Handoffs**:

```python
from agents import Agent, handoff

coding_agent = Agent(name="Coding Agent", instructions="Write and debug code.")
research_agent = Agent(name="Research Agent", instructions="Search and synthesize.")
writer_agent = Agent(name="Writer Agent", instructions="Write clear documentation.")

orchestrator = Agent(
    name="Orchestrator",
    instructions="Route tasks to the right specialist.",
    handoffs=[
        handoff(coding_agent),
        handoff(research_agent),
        handoff(writer_agent),
    ]
)
```

#### 8.2 LangGraph State Machine Pattern

LangGraph (part of LangChain ecosystem) models multi-agent workflows as **directed graphs with shared typed state**:

```python
from langgraph.graph import StateGraph
from typing import TypedDict

class AgentState(TypedDict):
    messages: list
    research_results: str
    draft: str
    final_output: str

workflow = StateGraph(AgentState)
workflow.add_node("research", research_agent_node)
workflow.add_node("write", writer_agent_node)
workflow.add_node("critique", critic_agent_node)
workflow.add_node("revise", revise_agent_node)

# Conditional routing
workflow.add_conditional_edges(
    "critique",
    should_revise,        # function returning "revise" or "finalize"
    {"revise": "revise", "finalize": END}
)
```

**LangGraph leads the production framework space in 2026** (27,100 monthly searches), providing checkpointing, durable execution, HITL approvals, and graph visualization via LangGraph Studio.

#### 8.3 The AI Scientist — Open-Ended Evolution 🟣

*(CS329A Week 7 paper — Lu et al. 2024, Arxiv 2408.06292)*

The AI Scientist is a fully automated research pipeline that can:
1. Brainstorm novel research ideas
2. Search related literature
3. Write and execute experiment code
4. Analyze results
5. Write a full research paper
6. Self-review the paper

It represents the most advanced example of **open-ended self-improving agents** — a system that can potentially generate its own training data, experiments, and feedback loops without human intervention.

---

### MODULE 9 — Self-Improving & Open-Ended Agents 🔴🟣

#### 9.1 AlphaEvolve — Algorithm Design via Evolution 🟣

*(CS329A Week 7 reading — Google DeepMind 2025)*

AlphaEvolve combines:
- **Gemini** for code generation
- **Evolutionary search** over algorithm variants
- **Automated evaluation** (run the algorithm, measure performance)

Results: Discovered algorithms that improved Google's own data center scheduling and matrix multiplication — beating human-designed solutions on some metrics.

**The pattern (verified from CS329A Week 7):**
```
1. Start with initial algorithm implementation
2. LLM generates variants (mutations, crossovers)
3. Run variants, evaluate performance
4. Select best variants → repeat
5. Discovered algorithms deployed to production
```

#### 9.2 Safety of Self-Improving Systems 🟣

*(From "On The Statistical Limits of Self-Improving Agents" — ArXiv 2510.04399)*

A critical theoretical result (2025): **PAC learning guarantees are preserved by self-modification if and only if the policy-reachable function family has uniformly bounded capacity (VC dimension)**.

**Practical implication:** Unconstrained self-improvement can destroy the conditions needed for learning. The **Two-Gate guardrail** (validation margin τ + capacity cap K) is proposed to keep self-improving agents within safe learning boundaries.

This formalizes a concern that has long been intuited: self-improvement can lead to reward hacking, specification gaming, or capability gain in unintended directions.

---

## 6. Frameworks & SDKs (2026 Landscape)

### The 2026 Framework Landscape

*(Sources: AI Agent Frameworks 2026 rankings, verified from multiple sources May 2026)*

| Framework | Released | Primary Pattern | Best For | License |
|-----------|----------|----------------|----------|---------|
| **LangGraph** | 2023 (matured 2025) | Stateful directed graph | Complex branching, HITL, durable workflows | Open source (MIT); Platform is paid |
| **OpenAI Agents SDK** | March 2025 | Handoffs + tools | OpenAI-native; rapid prototyping | Open source |
| **Google ADK** | April 2025 | Hierarchical tree + A2A | Gemini-native; multimodal; cross-framework via A2A | Open source |
| **CrewAI** | 2024 | Role-based crews | Team simulations; structured role assignment | Open source core; Enterprise paid |
| **Pydantic AI** | Late 2024 | Type-first, Pydantic models | Python teams wanting strict typing | Open source |
| **AutoGen (Microsoft)** | 2023 (v2: 2024) | Conversational multi-agent | Research, flexible agent conversations | Open source (MIT) |
| **Anthropic Agent SDK** | 2025 | Tools + hooks + MCP + subagents | Claude-native; powers Claude Code | Open source |

**Key insight from 2026 rankings:** Framework choice is necessary but insufficient. Production agents also need **observability** (LangSmith, Langfuse, Arize), **guardrails**, **evaluation harnesses**, and a deployment story.

### MCP — The Universal Protocol Layer

MCP sits *below* all frameworks as the standard integration layer:

```
┌──────────────────────────────────────────────────┐
│  FRAMEWORK LAYER                                 │
│  LangGraph / OpenAI SDK / CrewAI / Pydantic AI  │
├──────────────────────────────────────────────────┤
│  MCP PROTOCOL LAYER                             │
│  (Anthropic, Nov 2024 → Agentic AI Foundation)  │
├────────────────┬─────────────────────────────────┤
│  Tools         │  Resources         │  Prompts   │
│  (GitHub MCP)  │  (Postgres MCP)    │  Templates │
│  (Search MCP)  │  (Filesystem MCP)  │            │
└────────────────┴─────────────────────────────────┘
```

By May 2026, MCP has **97 million installs** and is adopted by all major LLM providers. It has become the "USB-C of AI integrations."

---

## 7. Benchmarks & Evaluation

### Current Benchmark Landscape (May 2026)

| Benchmark | Tasks | What It Tests | SOTA (May 2026) | Notes |
|-----------|-------|--------------|-----------------|-------|
| **SWE-bench Verified** | 500 | Real GitHub bug fixes (Python) | ~80%+ (frontier, vendor-reported) | **Contamination issues** — OpenAI stopped reporting; SWE-bench Pro emerging |
| **SWE-bench Pro** (SEAL) | 1,865 | Multi-language, harder bugs | ~45% (Claude Opus 4.5) | Cleaner benchmark; 250-turn limit; identical tooling across models |
| **GAIA** | 466 | General assistant: web browsing + file parsing + reasoning | ~75% (top agents) | Humans: 92%; 7-point gap from orchestration scaffold alone |
| **OSWorld** | 369 | Cross-app computer use (GUI) | 60-pt gap human–AI at launch (2024); rapid progress since | Most rigorous computer use test |
| **WebArena** | 812 | Web interaction tasks | ~61.7% (IBM CUGA, 2025) | Planner-Executor-Memory architectures, not single model |
| **ARC-AGI-2** | — | Novel visual reasoning | 77.1% (Gemini 3.1 Pro, Feb 2026) | Saturated by ARC-AGI-3 |
| **ARC-AGI-3** | — | Turn-based game, no stated rules | < 1% (all frontier models) | Launched March 2026; truly hard |
| **τ²-Bench** (Sierra) | — | Customer service (dual-control) | Hard; agent-user coordination is key bottleneck | Dual-control design: both agent and simulated user modify environment |
| **METR HCAST** | — | Long-horizon tasks | Active benchmark; few-week tasks | "How long can an agent work independently?" |

### Benchmark Integrity Warnings ⚠️

Critical findings from 2025–2026 research (verified from ICLR Blogposts 2026, Berkeley RDI):

1. **Data contamination:** "59.4% of the hardest SWE-bench Verified tasks have tests that would pass even when the underlying bug was unfixed" (OpenAI audit, Feb 2026). One-third of issues have solutions in the comments.

2. **Scaffold dependency:** "The same Claude Opus 4 scores 64.9% inside one agent framework and 57.6% inside another. That 7-point gap comes from the orchestration layer alone." — Performance reflects the agent harness as much as the model.

3. **Benchmark gaming:** Researchers have shown WebArena can be gamed to 100% by exploiting file:// URL access to config files. GAIA's public answers enable ~98% via lookup.

4. **LLM judge bias:** 50%+ error rates in LLM judges (2025–2026 audits), driven by position bias (prefers first answer ~60%), length bias, and sycophancy.

**The takeaway:** Benchmark scores must be interpreted with care. The emerging standard is **SWE-bench Pro** on the Scale AI SEAL leaderboard (uniform tooling, clean data, no contamination).

---

## 8. Stanford CS329A — Full Schedule & Papers

**Autumn 2025 | Instructors: Aakanksha Chowdhery, Azalia Mirhoseini | Skilling Auditorium, Mon/Fri 4:30–5:50pm**

*(Full schedule retrieved from cs329a.stanford.edu — May 2026)*

| # | Date | Topic | Key Papers |
|---|------|-------|-----------|
| 1 | Sep 22 | Course Overview | — |
| 2 | Sep 26 | **Test-time Compute Scaling** | Large Language Monkeys (Brown 2024); Archon (Saad-Falcon 2024); Snell et al. 2024 |
| 3 | Sep 29 | **Robust Verification** | Cobbe et al. 2021 (PRMs); Lightman et al. "Let's Verify Step by Step"; Math-Shepherd |
| 4 | Oct 3 | **Learning from Feedback with Tools/Code** | ReAct (Yao 2022); RLEF; Constitutional AI (Anthropic 2022) |
| 5 | Oct 6 | **Multi-step Reasoning/Planning** | SWiRL; LATS (Zhou 2023); SPRINT; ADaPT; AB-MCTS |
| 6 | Oct 10 | **Train Time Scaling / Scaling RL** | STaR (Zelikman 2022); DeepSeekMath; DAPO |
| 7 | Oct 13 | **Open-Ended Evolution of Self-Improving Agents** | Automated design of agentic systems; The AI Scientist (Lu 2024); AlphaEvolve |
| 8 | Oct 17 | **Self-Improvement with Search & Deep Research** | AlphaCode 2; Search-o1 |
| 9 | Oct 20 | **Guest: Melvin Johnson (Google DeepMind)** | Evolution of Post-training from Chatbots to Agents |
| 10–12 | Oct 24–31 | **Midterm presentations** | — |
| 13 | Nov 3 | **Agentic Frameworks for Software Engineering** | CodeMonkeys; KernelBench; LLM Optimizers |
| 14 | Nov 7 | **Augmenting Agents with Memory** (Guest: Junchen Jiang, LMCache) | Cartridges; MemGPT (Packer 2023); CacheBlend |
| 15 | Nov 10 | **Guest: Denny Zhou (Google DeepMind)** | LLM Reasoning |
| 16 | Nov 14 | **Guest: Thang Luong (Google DeepMind)** | AlphaProof, AlphaGeometry, Gemini IMO Gold Medal |
| 17 | Nov 17 | **Agentic Evaluations & Long-Horizon Tasks** | Measuring AI Ability to Complete Long Tasks; GDPVal |
| 18 | Nov 21 | **Guest: Misha Laskin (Reflection AI)** | Building Agentic Systems for Autonomy |
| 19 | Dec 1 | **Guest: Danny Driess (Physical Intelligence)** | Multimodal AI Agents in Robotics |
| 20 | Dec 5 | **Future Research Areas** | — |

**Grading:** HW1 15% + HW2 15% + HW3 20% + Project Proposal 2.5% + Midterm 10% + Final Project 35% + Poster 2.5%

---

## 9. Practical Labs & Projects

### Stanford CS329A Homework Assignments

| HW | Released | Topics | Key Techniques |
|----|----------|--------|---------------|
| **HW1** | Oct 3 | Test-time compute scaling | Zero-shot eval; majority voting; Best-of-N with generative reward model; self-improvement with feedback |
| **HW2** | Oct 13 | Multi-step reasoning | Multi-step RL; tool use; reasoning chains |
| **HW3** | Oct 23 | Advanced agentic techniques | TBD per year |
| **Final Project** | All quarter | Original research | Teams of 2–4; API credits provided; poster + report |

**CS329A HW1 structure** (verified from GitHub course material):
1. Zero-shot Evaluation (10 pts)
2. Majority Voting (30 pts)
3. Best-of-N with Generative Reward Model (30 pts)
4. Self-Improvement with Feedback (45 pts)
5. Analysis (15 pts)

### Suggested Hands-On Projects for Self-Study

| Project | Concepts Practiced | Estimated Time |
|---------|-------------------|---------------|
| Build a ReAct agent from scratch (no framework) | Tool use, reasoning loop, observation handling | 1–2 days |
| Implement Best-of-N sampling with PRM scoring | Test-time compute scaling, reward modeling | 2–3 days |
| Multi-agent research pipeline (search → synthesize → write) | Orchestrator-subagent, handoffs, memory | 3–5 days |
| MCP server + client from scratch | MCP protocol, JSON-RPC, tool registration | 1–2 days |
| Reflexion agent for coding tasks | Self-reflection, memory of past failures | 2–3 days |
| Mini AI Scientist (generate experiment → run → report) | Open-ended evolution, evaluation, writing | 1–2 weeks |
| SWE-bench agent (fix GitHub issues) | Software engineering agent, tool use, testing | 1–2 weeks |

---

## 10. Key Textbooks & Papers

### Foundational Papers (CS229A Reading List — Verified)

| Paper | Authors | Year | Key Contribution |
|-------|---------|------|-----------------|
| **ReAct: Synergizing Reasoning and Acting** | Yao et al. | 2022 | Foundational agent pattern — interleaved reasoning + tool use |
| **Chain-of-Thought Prompting** | Wei et al. | 2022 | CoT prompting; enables complex multi-step reasoning |
| **Reflexion: Language Agents with Verbal Reinforcement** | Shinn et al. | 2023 | Self-reflection for agent improvement across episodes |
| **Tree of Thoughts** | Yao et al. | 2023 | Tree search over reasoning paths |
| **MemGPT: Towards LLMs as Operating Systems** | Packer et al. | 2023 | Hierarchical memory for agents |
| **LATS: Language Agent Tree Search** | Zhou et al. | 2023 | MCTS applied to LLM agent reasoning |
| **STaR: Bootstrapping Reasoning with Reasoning** | Zelikman et al. | 2022 | Self-taught reasoner; model generates own training data |
| **Constitutional AI** | Bai et al. (Anthropic) | 2022 | Principle-based self-critique; RLAIF |
| **Toolformer: Language Models Can Teach Themselves to Use Tools** | Schick et al. | 2023 | LLMs learn when and how to call tools via self-supervised learning |
| **Training Verifiers to Solve Math Word Problems** | Cobbe et al. | 2021 | Original outcome reward model (ORM) for math |
| **Let's Verify Step by Step** | Lightman et al. | 2023 | Process reward models (PRMs) for math reasoning |
| **Large Language Monkeys** | Brown et al. | 2024 | Test-time scaling via repeated sampling |
| **The AI Scientist** | Lu et al. | 2024 | Fully automated scientific discovery via agents |
| **AlphaEvolve** | Google DeepMind | 2025 | Evolutionary algorithm design with LLMs |
| **DeepSeekMath / DeepSeekR1** | DeepSeek | 2024/2025 | RL for reasoning; GRPO; open-source frontier |
| **Automated Design of Agentic Systems** | Various | 2025 | ArXiv 2505.22954; meta-agent design |

### Resources and Documentation

| Resource | URL | Type |
|----------|-----|------|
| Stanford CS329A (full schedule + papers) | https://cs329a.stanford.edu/ | Live course |
| OpenAI Agents SDK docs | https://openai.github.io/openai-agents-python/ | SDK documentation |
| MCP Protocol documentation | https://modelcontextprotocol.io/ | Protocol spec |
| LangGraph documentation | https://langchain-ai.github.io/langgraph/ | Framework docs |
| LangChain Academy (free) | https://academy.langchain.com/ | Courses on LangGraph |
| CrewAI documentation | https://docs.crewai.com/ | Framework docs |
| Anthropic agents research | https://www.anthropic.com/research | Research papers |
| SWE-bench | https://www.swebench.com/ | Coding benchmark |
| GAIA leaderboard | https://huggingface.co/spaces/gaia-benchmark/leaderboard | Benchmark |
| Berkeley RDI agent benchmarks | https://rdi.berkeley.edu/ | Research |

---

## 11. Industry Relevance 2025–2026

### The Agentic AI Market (2026)

From multiple verified sources (May 2026):
- MCP at 97M installs; adopted universally
- **Claude Code**, **Cursor**, **GitHub Copilot Workspace**, **Devin** are deployed coding agents with millions of users
- **AI Scientist** systems are being deployed at research labs
- Every major cloud provider (AWS, Azure, GCP) now offers managed agent infrastructure
- **Framework space consolidated:** LangGraph (stateful, production), OpenAI SDK (simple, OpenAI-native), Google ADK (multimodal, Vertex), CrewAI (role-based)

### Roles Requiring AI Agent Expertise

| Role | Core Agent Skills | Tools | Salary (US, 2026) |
|------|-----------------|-------|-------------------|
| **AI Agent Engineer** | Agent loop, tool use, MCP, frameworks | LangGraph / OpenAI SDK, Python | $200k–$380k |
| **Autonomous Systems Engineer** | Multi-agent coordination, long-horizon tasks | Custom + LangGraph, Docker sandboxes | $220k–$400k |
| **AI Research Scientist (Agents)** | Test-time scaling, self-improvement, eval | PyTorch, custom agent harnesses | $250k–$500k+ |
| **AI Product Engineer** | Agent UX, HITL design, evals, guardrails | Full stack + agent SDKs | $180k–$320k |
| **AI Safety Researcher (Agents)** | Alignment, guardrails, spec gaming, interpretability | Research + deployment | $200k–$500k+ |

### Most In-Demand Agent Skills (2026)

1. **MCP integration** — connecting agents to real data sources and tools
2. **Multi-agent orchestration** — LangGraph, OpenAI SDK, CrewAI
3. **Evaluation and benchmarking** — building rigorous eval harnesses
4. **Memory system design** — RAG, graph memory, Mem0
5. **Test-time compute scaling** — implementing Best-of-N, PRMs, MCTS
6. **HITL design** — when to pause, how to surface agent decisions for review
7. **Prompt injection defense** — security for production agents
8. **Tracing and observability** — LangSmith, Langfuse, Arize

---

## 12. Research Links & Sources

### Live Course Pages (Verified May 2026)

| Resource | URL |
|----------|-----|
| Stanford CS329A (full schedule) | https://cs329a.stanford.edu/ |
| Stanford CS329A YouTube playlist | https://www.youtube.com/playlist?list=PL3058ht9NqT1NG6Y663elpHSDh-AW1TIr |
| OpenAI Agents SDK documentation | https://openai.github.io/openai-agents-python/ |
| OpenAI Agents SDK GitHub | https://github.com/openai/openai-agents-python |
| MCP documentation | https://modelcontextprotocol.io/ |
| LangGraph documentation | https://langchain-ai.github.io/langgraph/ |
| CrewAI documentation | https://docs.crewai.com/ |

### Key Papers (ArXiv Links)

| Paper | ArXiv |
|-------|-------|
| ReAct | https://arxiv.org/abs/2210.03629 |
| Toolformer | https://arxiv.org/abs/2302.04761 |
| AutoGen (Microsoft) | https://arxiv.org/abs/2308.08155 |
| LATS | https://arxiv.org/abs/2310.04406 |
| MemGPT | https://arxiv.org/abs/2310.08560 |
| STaR | https://arxiv.org/abs/2203.14465 |
| Constitutional AI | https://arxiv.org/abs/2212.08073 |
| Let's Verify Step by Step | https://arxiv.org/abs/2305.20050 |
| The AI Scientist | https://arxiv.org/abs/2408.06292 |
| Large Language Monkeys | https://arxiv.org/abs/2407.21787 |
| AlphaEvolve (DeepMind) | https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/AlphaEvolve.pdf |
| Reflexion | https://arxiv.org/abs/2303.11366 |
| Tree of Thought | https://arxiv.org/abs/2305.10601 |

---

## 📊 Depth Summary

| Module | Depth | Core Skill |
|--------|-------|------------|
| 1. Agent Foundations | 🟢🟡 | Build a basic agent from scratch |
| 2. Reasoning Patterns | 🟡🔴 | Implement ReAct, Reflexion, ToT |
| 3. Test-Time Compute Scaling | 🟡🔴 | Best-of-N, PRMs, MCTS on LLMs |
| 4. Train-Time Self-Improvement | 🔴🟣 | STaR, Constitutional AI, GRPO |
| 5. Planning & Multi-Step | 🟡🔴 | Plan-and-Execute, SPRINT, ADaPT |
| 6. Tool Use & MCP | 🟡🔴 | MCP server/client, computer use |
| 7. Memory Systems | 🟡🔴 | RAG, MemGPT, graph memory |
| 8. Multi-Agent Architectures | 🔴🟣 | LangGraph, handoffs, A2A |
| 9. Self-Improving Agents | 🔴🟣 | AI Scientist, AlphaEvolve, safety |
| 10. Coding Agents | 🔴 | SWE-bench, CodeMonkeys, Claude Code |
| 11. Evaluation & Safety | 🟡🔴🟣 | GAIA, OSWorld, benchmark integrity |
| 12. Production Engineering | 🟡🔴 | Tracing, guardrails, HITL, cost |

---

*Report 06 of 12 — AI Agents*
*Researched from live sources: Stanford CS329A (cs329a.stanford.edu, full schedule), OpenAI Agents SDK (openai.github.io), MCP documentation, agent benchmark landscape (May 2026)*
*Written by Claude (Anthropic) — May 2026*
*Part of the World-Class CS / AI / ML Curriculum Deep-Dive Series*
*Next: Report 07 — LLMs: Model Training & Inference*
