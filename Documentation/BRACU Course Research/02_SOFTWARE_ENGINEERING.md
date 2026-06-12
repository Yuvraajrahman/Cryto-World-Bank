# 📗 REPORT 02: SOFTWARE ENGINEERING
## As Taught at the World's Best Universities
### MIT · CMU · Stanford · Berkeley · Cornell · Cambridge · ETH Zürich

---

> **Series:** World-Class CS / AI / ML Curriculum Deep-Dive
> **Report:** 02 of 12
> **Research Date:** May 2026
> **Depth Level:** 🟢 Intro → 🟡 Intermediate → 🔴 Advanced → 🟣 PhD
> **Cross-reference:** All source links listed in Section 11

---

## TABLE OF CONTENTS

1. [Course Overview & Context](#1-course-overview--context)
2. [University Comparison Matrix](#2-university-comparison-matrix)
3. [Prerequisites Map](#3-prerequisites-map)
4. [Full Topic Tree](#4-full-topic-tree)
5. [Chapter-by-Chapter Breakdown](#5-chapter-by-chapter-breakdown)
   - 5.1 Software Construction Principles
   - 5.2 Requirements Engineering
   - 5.3 Software Design & Architecture
   - 5.4 Design Patterns
   - 5.5 Testing & Quality Assurance
   - 5.6 Process Models & Agile
   - 5.7 DevOps, CI/CD & Deployment
   - 5.8 Concurrency & Parallel Programming
   - 5.9 Software Performance Engineering
   - 5.10 Maintainability & Refactoring
   - 5.11 Security in Software Engineering
6. [Practical Labs & Projects](#6-practical-labs--projects)
7. [Tools, Languages & Platforms](#7-tools-languages--platforms)
8. [Key Textbooks & Papers](#8-key-textbooks--papers)
9. [AI-Era Additions (2024–2026)](#9-ai-era-additions-20242026)
10. [Career Relevance & Industry Map](#10-career-relevance--industry-map)
11. [Research Sources & Links](#11-research-sources--links)

---

## 1. COURSE OVERVIEW & CONTEXT

### What is Software Engineering?

Software Engineering is the **systematic, disciplined, and quantifiable approach** to the development, operation, and maintenance of software. It is distinct from programming: while programming solves a computational problem, software engineering ensures that systems built by teams of engineers are **correct, maintainable, scalable, testable, and deliverable on time**.

Fred Brooks, in his classic 1975 book *The Mythical Man-Month*, captured the core challenge: large-scale software is fundamentally different from single-programmer code. Adding more people to a late project makes it later. Building correct, reliable, team-developed software requires disciplined processes, clear specifications, rigorous testing, and carefully designed architectures.

Top universities teach software engineering across two conceptual tracks:

**Track 1 — Construction Track (MIT 6.1020 style)**
: How do *you*, as an individual programmer, write code that is:
- **Safe from bugs** — correct now and in the future
- **Easy to understand** — readable by other engineers
- **Ready for change** — easy to modify as requirements evolve

**Track 2 — Engineering Process Track (CMU 17-313 style)**
: How does a *team* deliver software successfully by:
- Eliciting and managing requirements
- Choosing and executing development processes (Agile, Scrum)
- Building quality assurance strategies
- Managing risk, time, and human dynamics

### Why Software Engineering is More Important Than Ever (2025-2026)

The AI coding revolution has fundamentally altered what software engineers do — but has amplified, not diminished, the importance of SE principles:

- **AI generates code faster than ever** — but code duplication is up 4× with AI tools, and short-term churn is rising. Engineers who understand maintainability, design patterns, and refactoring are now more valuable, not less.
- **25% of Google's code is AI-assisted** (Q1 2025) — but CEO Sundar Pichai calls it an *engineering velocity gain*, not a replacement. Human engineers architect, review, and validate.
- **Only ~30% of GitHub Copilot suggestions are accepted** — the engineer's judgment remains essential.
- **Vibe coding → Vibe Engineering**: The term "vibe coding" (coined by Andrej Karpathy, Feb 2025) describes prompting AI to generate code intuitively. But "Vibe Engineering" — structuring the AI's constraints and agents to produce reliable production software — requires deep SE knowledge.

The field of software engineering has split into a new taxonomy:
```
Vibe Coder         → prompt-driven, fast POC, single developer, disposable code
Vibe Engineer      → architect the AI-assisted system, define rules, review, harden
AI-Enabled SE Team → multi-agent coding pipelines with human oversight at key gates
```

---

## 2. UNIVERSITY COMPARISON MATRIX

| Topic | MIT 6.1020 | MIT 6.172 | CMU 17-313 | CMU 17-445 | Berkeley CS169 | Stanford CS169 |
|-------|:---------:|:---------:|:---------:|:---------:|:--------------:|:--------------:|
| Software Construction Principles | ✅ Core | ⬜ | ✅ | ⬜ | ✅ | ✅ |
| Specifications & Invariants | ✅ Deep | ⬜ | ✅ | ⬜ | ✅ | ✅ |
| Abstract Data Types | ✅ Deep | ⬜ | ✅ | ⬜ | ✅ | ✅ |
| Testing & QA | ✅ | ⬜ | ✅ Deep | ✅ | ✅ Deep | ✅ |
| Design Patterns | ✅ | ⬜ | ✅ | ⬜ | ✅ | ✅ |
| OOP & Functional Programming | ✅ Deep | ⬜ | ✅ | ⬜ | ✅ | ✅ |
| Concurrency & Parallelism | ✅ Deep | ✅ Deep | ✅ | ⬜ | ✅ | ⬜ |
| Requirements Engineering | ⬜ | ⬜ | ✅ Deep | ✅ | ✅ | ⬜ |
| Software Architecture | ⬜ | ⬜ | ✅ Deep | ✅ Deep | ✅ | ✅ |
| Agile / Scrum | ⬜ | ⬜ | ✅ Deep | ✅ | ✅ Deep | ✅ |
| DevOps & CI/CD | ⬜ | ⬜ | ✅ | ✅ Deep | ✅ | ✅ |
| Performance Engineering | ⬜ | ✅ Deep | ⬜ | ⬜ | ⬜ | ⬜ |
| Code Optimization & Profiling | ⬜ | ✅ Deep | ⬜ | ⬜ | ⬜ | ⬜ |
| Responsible AI in SE | ⬜ | ⬜ | ⬜ | ✅ Deep | ⬜ | ⬜ |
| Static / Dynamic Analysis | ✅ | ⬜ | ✅ | ✅ | ✅ | ✅ |
| Project Management | ⬜ | ⬜ | ✅ Deep | ✅ | ✅ | ✅ |

**Key:**
- **MIT 6.1020** = Elements of Software Construction (code quality, type safety, concurrency)
- **MIT 6.172** = Performance Engineering of Software Systems (optimization, parallelism)
- **CMU 17-313** = Foundations of Software Engineering (process, requirements, architecture)
- **CMU 17-445** = ML in Production / AI Engineering (SE for ML systems, MLOps)
- **Berkeley CS169** = Software Engineering (Agile, BDD, test-driven)
- **Stanford CS169** = Software Engineering (design, testing, architecture)

### Depth Map

```
COVERAGE BREADTH (topics per course):
MIT 6.1020   ████████████        Deep on code quality, concurrency, functional programming
MIT 6.172    ████████████████    Deepest performance + parallelism track in any university
CMU 17-313   ████████████████    Broadest SE fundamentals: process, architecture, teams
CMU 17-445   ██████████████      AI/ML-specific SE — unique course globally
Berkeley     ████████████        Best Agile + BDD track; project-based
Stanford     ██████████          Design-focused; strong architecture coverage
```

---

## 3. PREREQUISITES MAP

```
REQUIRED BEFORE SOFTWARE ENGINEERING:
╔══════════════════════════════════════════════════════════════╗
║  Programming Proficiency                                      ║
║  ├─ At least one OOP language (Java, Python, TypeScript, C++)║
║  ├─ Data structures (lists, trees, maps, graphs)             ║
║  └─ Recursion, iteration, basic algorithm complexity         ║
╠══════════════════════════════════════════════════════════════╣
║  Basic CS Theory                                             ║
║  ├─ Logic (Boolean algebra, predicates, quantifiers)         ║
║  └─ Sets and basic discrete math                             ║
╠══════════════════════════════════════════════════════════════╣
║  For MIT 6.172 (Performance Engineering):                    ║
║  ├─ C programming (pointers, memory management)              ║
║  ├─ Computer architecture (CPU, caches, pipelining)          ║
║  └─ Multithreading concepts                                  ║
╠══════════════════════════════════════════════════════════════╣
║  For CMU 17-445 (ML in Production):                          ║
║  ├─ Machine learning fundamentals (sklearn-level)            ║
║  └─ Basic Python + Unix shell                                ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 4. FULL TOPIC TREE

```
SOFTWARE ENGINEERING
│
├── MODULE 1: SOFTWARE CONSTRUCTION PRINCIPLES
│   ├── 1.1 Goals of Good Software
│   │   ├── Safe from bugs (correctness + defensiveness)
│   │   ├── Easy to understand (readable, self-documenting)
│   │   └── Ready for change (modular, extensible)
│   ├── 1.2 Types & Type Safety
│   │   ├── Static vs dynamic typing
│   │   ├── Type inference
│   │   └── Null safety and Optional types
│   ├── 1.3 Specifications & Contracts
│   │   ├── Preconditions, postconditions
│   │   ├── Exceptions vs special values
│   │   ├── Checked vs unchecked exceptions
│   │   └── Behavioral subtyping (Liskov)
│   ├── 1.4 Immutability
│   │   ├── Mutable vs immutable objects
│   │   ├── Defensive copying
│   │   └── Functional programming & pure functions
│   ├── 1.5 Abstract Data Types (ADTs)
│   │   ├── Representation independence
│   │   ├── Abstraction functions
│   │   ├── Representation invariants
│   │   └── Equality contracts (equals, hashCode)
│   └── 1.6 Modularity
│       ├── Coupling and cohesion
│       ├── Information hiding
│       └── Interface vs implementation
│
├── MODULE 2: REQUIREMENTS ENGINEERING
│   ├── 2.1 Why Requirements Matter
│   ├── 2.2 Types of Requirements
│   │   ├── Functional requirements
│   │   ├── Non-functional requirements (NFRs)
│   │   │   ├── Performance, scalability, reliability
│   │   │   ├── Security and privacy
│   │   │   ├── Usability and accessibility
│   │   │   └── Maintainability and portability
│   │   └── Constraints (regulatory, budget, technical)
│   ├── 2.3 Elicitation Techniques
│   │   ├── User interviews and surveys
│   │   ├── Observation and ethnography
│   │   ├── Use cases (Jacobson notation)
│   │   └── User stories (Agile format)
│   ├── 2.4 Requirements Documentation
│   │   ├── Software Requirements Specification (SRS)
│   │   ├── UML Use Case Diagrams
│   │   └── Behavior-Driven Development (BDD) scenarios
│   └── 2.5 Requirements Validation
│       ├── Prototyping
│       ├── Reviews and walkthroughs
│       └── Model checking for specifications
│
├── MODULE 3: SOFTWARE DESIGN & ARCHITECTURE
│   ├── 3.1 Design Principles (SOLID)
│   │   ├── S — Single Responsibility Principle (SRP)
│   │   ├── O — Open/Closed Principle (OCP)
│   │   ├── L — Liskov Substitution Principle (LSP)
│   │   ├── I — Interface Segregation Principle (ISP)
│   │   └── D — Dependency Inversion Principle (DIP)
│   ├── 3.2 Additional Principles
│   │   ├── DRY (Don't Repeat Yourself)
│   │   ├── YAGNI (You Aren't Gonna Need It)
│   │   ├── KISS (Keep It Simple, Stupid)
│   │   └── Law of Demeter (principle of least knowledge)
│   ├── 3.3 Software Architecture Styles
│   │   ├── Monolithic Architecture
│   │   ├── Layered (N-tier) Architecture
│   │   ├── Client-Server
│   │   ├── MVC (Model-View-Controller)
│   │   ├── Event-Driven Architecture
│   │   ├── Microservices Architecture
│   │   ├── Service-Oriented Architecture (SOA)
│   │   ├── Hexagonal / Ports & Adapters
│   │   ├── CQRS (Command Query Responsibility Segregation)
│   │   └── Event Sourcing
│   ├── 3.4 Architecture Documentation
│   │   ├── C4 Model (Context, Container, Component, Code)
│   │   ├── UML Diagrams
│   │   │   ├── Class diagrams
│   │   │   ├── Sequence diagrams
│   │   │   ├── Activity diagrams
│   │   │   └── Deployment diagrams
│   │   └── Architecture Decision Records (ADRs)
│   └── 3.5 Quality Attributes in Architecture
│       ├── Scalability: horizontal vs vertical
│       ├── Availability & fault tolerance
│       ├── Security
│       ├── Observability (logs, metrics, traces)
│       └── Deployability
│
├── MODULE 4: DESIGN PATTERNS
│   ├── 4.1 Creational Patterns
│   │   ├── Singleton
│   │   ├── Factory Method
│   │   ├── Abstract Factory
│   │   ├── Builder
│   │   └── Prototype
│   ├── 4.2 Structural Patterns
│   │   ├── Adapter
│   │   ├── Bridge
│   │   ├── Composite
│   │   ├── Decorator
│   │   ├── Facade
│   │   ├── Flyweight
│   │   └── Proxy
│   ├── 4.3 Behavioral Patterns
│   │   ├── Chain of Responsibility
│   │   ├── Command
│   │   ├── Iterator
│   │   ├── Mediator
│   │   ├── Memento
│   │   ├── Observer
│   │   ├── State
│   │   ├── Strategy
│   │   ├── Template Method
│   │   └── Visitor
│   └── 4.4 Modern Patterns (Cloud/Distributed era)
│       ├── Circuit Breaker
│       ├── Bulkhead
│       ├── Sidecar
│       ├── Saga (distributed transactions)
│       └── Event Sourcing + CQRS
│
├── MODULE 5: TESTING & QUALITY ASSURANCE
│   ├── 5.1 Testing Philosophy
│   │   ├── Why testing is not optional
│   │   ├── Test-first vs test-last development
│   │   └── Testing pyramid
│   ├── 5.2 Unit Testing
│   │   ├── Properties of good unit tests (FIRST: Fast, Isolated, Repeatable, Self-checking, Timely)
│   │   ├── Partition testing (equivalence classes)
│   │   ├── Boundary value analysis
│   │   ├── Mock objects and test doubles (mock, stub, fake, spy)
│   │   └── Tools: JUnit, pytest, Jest, NUnit
│   ├── 5.3 Integration Testing
│   │   ├── Bottom-up vs top-down integration
│   │   └── Contract testing (Pact)
│   ├── 5.4 System & Acceptance Testing
│   │   ├── End-to-End (E2E) testing
│   │   ├── User Acceptance Testing (UAT)
│   │   └── BDD with Cucumber / Gherkin
│   ├── 5.5 Test-Driven Development (TDD)
│   │   ├── Red → Green → Refactor cycle
│   │   └── TDD for design quality
│   ├── 5.6 Coverage Metrics
│   │   ├── Statement coverage
│   │   ├── Branch coverage
│   │   ├── Path coverage
│   │   └── Mutation testing
│   ├── 5.7 Static Analysis
│   │   ├── Linters (pylint, ESLint, Checkstyle)
│   │   ├── Type checkers (mypy, TypeScript)
│   │   ├── Bug finders (FindBugs, SonarQube, Semgrep)
│   │   └── Formal verification
│   ├── 5.8 Dynamic Analysis
│   │   ├── Profilers (perf, VTune, Instruments)
│   │   ├── Memory leak detectors (Valgrind, ASan)
│   │   ├── Race condition detectors (ThreadSanitizer)
│   │   └── Fuzzing (AFL, libFuzzer, OSS-Fuzz)
│   └── 5.9 Performance Testing
│       ├── Load testing (JMeter, k6, Locust)
│       ├── Stress testing
│       └── Chaos engineering (Netflix Chaos Monkey)
│
├── MODULE 6: PROCESS MODELS & AGILE
│   ├── 6.1 Waterfall Model
│   │   └── Phases: Requirements → Design → Implementation → Test → Deploy → Maintain
│   ├── 6.2 Iterative Development
│   ├── 6.3 Agile Manifesto & Principles
│   ├── 6.4 Scrum Framework
│   │   ├── Roles: Product Owner, Scrum Master, Dev Team
│   │   ├── Artifacts: Product Backlog, Sprint Backlog, Increment
│   │   └── Events: Sprint, Planning, Daily, Review, Retrospective
│   ├── 6.5 Extreme Programming (XP)
│   │   ├── Pair programming
│   │   ├── Continuous integration
│   │   ├── Test-driven development
│   │   └── Refactoring
│   ├── 6.6 Kanban
│   │   ├── Work-in-progress (WIP) limits
│   │   └── Cycle time and throughput
│   ├── 6.7 Lean Software Development
│   ├── 6.8 Measuring Software Quality
│   │   ├── Cyclomatic complexity
│   │   ├── Code coverage
│   │   ├── Technical debt estimation
│   │   └── DORA metrics (deployment frequency, lead time, change failure rate, MTTR)
│   └── 6.9 Project Management Fundamentals
│       ├── Estimation techniques (story points, t-shirt sizing, PERT)
│       ├── Risk management
│       └── Team dynamics (Tuckman's stages)
│
├── MODULE 7: VERSION CONTROL & COLLABORATION
│   ├── 7.1 Git Internals
│   │   ├── Blob, tree, commit, tag objects
│   │   ├── Staging area (index)
│   │   └── Refs, HEAD, branches
│   ├── 7.2 Branching Strategies
│   │   ├── Git Flow
│   │   ├── GitHub Flow (trunk-based development)
│   │   └── GitLab Flow
│   ├── 7.3 Code Review
│   │   ├── Pull Request (PR) workflow
│   │   ├── Review best practices
│   │   └── AI-assisted code review (Copilot, CodeRabbit, etc.)
│   └── 7.4 Collaborative Practices
│       ├── Pair programming
│       ├── Mob programming
│       └── Documentation-as-code
│
├── MODULE 8: DEVOPS & CI/CD
│   ├── 8.1 DevOps Philosophy
│   │   ├── Breaking silos (Dev + Ops)
│   │   └── Three Ways: Flow, Feedback, Continual Learning
│   ├── 8.2 Continuous Integration (CI)
│   │   ├── Automated build on every commit
│   │   ├── CI pipelines (GitHub Actions, Jenkins, GitLab CI)
│   │   └── Build failure triage
│   ├── 8.3 Continuous Delivery & Deployment (CD)
│   │   ├── Delivery vs Deployment distinction
│   │   ├── Deployment strategies
│   │   │   ├── Blue-Green deployment
│   │   │   ├── Canary releases
│   │   │   ├── Rolling updates
│   │   │   └── Feature flags (LaunchDarkly, Unleash)
│   │   └── Infrastructure as Code (IaC)
│   ├── 8.4 Containerization
│   │   ├── Docker: images, containers, Dockerfile
│   │   ├── Container registries (Docker Hub, ECR, GCR)
│   │   └── Multi-stage builds
│   ├── 8.5 Container Orchestration
│   │   ├── Kubernetes core concepts
│   │   │   ├── Pods, Deployments, Services, ConfigMaps, Secrets
│   │   │   ├── Namespaces and RBAC
│   │   │   └── Horizontal Pod Autoscaler
│   │   └── Helm charts
│   ├── 8.6 Infrastructure as Code (IaC)
│   │   ├── Terraform
│   │   ├── Ansible
│   │   └── Pulumi
│   └── 8.7 Observability
│       ├── The three pillars: Logs, Metrics, Traces
│       ├── Prometheus + Grafana (metrics)
│       ├── ELK / OpenSearch (logs)
│       ├── Jaeger / Zipkin (distributed tracing)
│       └── OpenTelemetry (unified instrumentation)
│
├── MODULE 9: PERFORMANCE ENGINEERING (MIT 6.172)
│   ├── 9.1 Performance Analysis Methodology
│   ├── 9.2 Bentley Rules (Algorithmic Optimization)
│   │   ├── Data structure choice
│   │   ├── Loop transformations
│   │   ├── Logic simplifications
│   │   └── Procedure call elimination
│   ├── 9.3 Instruction-Level Optimization
│   │   ├── Assembly and CPU pipeline
│   │   ├── SIMD / vectorization
│   │   ├── Branch prediction
│   │   └── Bit manipulation tricks
│   ├── 9.4 Memory Hierarchy Optimization
│   │   ├── Cache hierarchy (L1/L2/L3/RAM)
│   │   ├── Cache-friendly data structures
│   │   ├── Cache-oblivious algorithms
│   │   └── Memory access patterns
│   ├── 9.5 Parallel Programming (Cilk / OpenMP / pthreads)
│   │   ├── Fork-join parallelism
│   │   ├── Work-span analysis (T1, T∞, parallelism)
│   │   ├── Race conditions and data races
│   │   └── Amdahl's Law and Gustafson's Law
│   ├── 9.6 Synchronization Without Locks
│   │   ├── Compare-and-swap (CAS)
│   │   ├── Lock-free data structures
│   │   └── Memory ordering models
│   └── 9.7 Storage Allocation & Garbage Collection
│       ├── Stack vs heap allocation
│       ├── Memory allocators (jemalloc, tcmalloc)
│       └── GC algorithms (mark-and-sweep, stop-and-copy, generational)
│
├── MODULE 10: MAINTAINABILITY & REFACTORING
│   ├── 10.1 Code Smells (Fowler taxonomy)
│   │   ├── Long Method, Large Class, Long Parameter List
│   │   ├── Duplicate Code, Dead Code
│   │   ├── Feature Envy, Data Clumps
│   │   └── Inappropriate Intimacy, Shotgun Surgery
│   ├── 10.2 Refactoring Techniques
│   │   ├── Extract Method / Extract Class
│   │   ├── Rename Variable / Method / Class
│   │   ├── Inline Method
│   │   ├── Move Method / Move Field
│   │   └── Replace Conditional with Polymorphism
│   ├── 10.3 Technical Debt
│   │   ├── Types: deliberate, inadvertent, bit rot
│   │   └── Debt management strategies
│   ├── 10.4 Code Review Practices
│   └── 10.5 Documentation
│       ├── Inline comments (why, not what)
│       ├── API documentation (JSDoc, Sphinx, Javadoc)
│       └── Architecture decision records (ADRs)
│
└── MODULE 11: SECURITY IN SOFTWARE ENGINEERING
    ├── 11.1 Threat Modeling (STRIDE)
    ├── 11.2 OWASP Top 10 (2021+)
    │   ├── Injection (SQL, command, LDAP)
    │   ├── Broken Authentication
    │   ├── Sensitive Data Exposure
    │   ├── XML External Entities (XXE)
    │   ├── Broken Access Control
    │   ├── Security Misconfiguration
    │   ├── Cross-Site Scripting (XSS)
    │   ├── Insecure Deserialization
    │   ├── Using Components with Known Vulnerabilities
    │   └── Insufficient Logging & Monitoring
    ├── 11.3 Secure Coding Practices
    │   ├── Input validation and sanitization
    │   ├── Principle of least privilege
    │   ├── Defense in depth
    │   └── Cryptography fundamentals
    └── 11.4 Dependency Security
        ├── Software Composition Analysis (SCA)
        ├── SBOM (Software Bill of Materials)
        └── Supply chain security
```

---

## 5. CHAPTER-BY-CHAPTER BREAKDOWN

### 5.1 Software Construction Principles 🟢🟡

**MIT's Three Goals — The North Star of Good Code**

MIT 6.1020 establishes three overarching goals for all code produced in the course:

```
┌────────────────────────────────────────────────────────────┐
│  GOAL 1: SAFE FROM BUGS                                    │
│  Correct today AND defensively handles future use         │
├────────────────────────────────────────────────────────────┤
│  GOAL 2: EASY TO UNDERSTAND                               │
│  Clear to a future reader, including yourself in 6 months│
├────────────────────────────────────────────────────────────┤
│  GOAL 3: READY FOR CHANGE                                 │
│  Easy to modify when requirements or environment changes  │
└────────────────────────────────────────────────────────────┘
```

Every concept in the course is evaluated against these three goals. For example:

- **Immutability** → Safe from bugs (no surprise mutation), Easy to understand (no need to track state changes)
- **Specifications** → Safe from bugs (contracts enforced), Easy to understand (documents intent)
- **Abstract Data Types** → Ready for change (representation can change without affecting clients)

**Abstract Data Types (ADTs)**

An ADT separates the *what* (the abstract interface) from the *how* (the concrete implementation). This is one of the most important concepts in software construction.

```java
// ABSTRACT INTERFACE (what clients know)
interface Set<E> {
    boolean contains(E element);
    Set<E> add(E element);
    int size();
}

// CONCRETE REPRESENTATION 1 (hidden from clients)
class HashSet<E> implements Set<E> { ... uses hash table ... }

// CONCRETE REPRESENTATION 2 (hidden from clients)
class TreeSet<E> implements Set<E> { ... uses red-black tree ... }
```

The abstraction function (AF) maps from concrete representation to abstract value:
```
AF(array [3, 1, 4, 1, 5]) = {1, 3, 4, 5}   // Set, ignoring duplicates
```

The representation invariant (RI) specifies valid concrete states:
```
RI: array contains no null entries
RI: size field equals number of non-null entries in array
```

**Specifications (Pre/Postconditions)**

A method specification is a contract between implementor and client:

```java
/**
 * Find index of value in sorted array.
 * @param arr  sorted array of integers (non-null, may be empty)
 * @param val  value to search for
 * @return     index i such that arr[i] == val,
 *             or -1 if val is not in arr
 * @throws     IllegalArgumentException if arr is null
 */
int binarySearch(int[] arr, int val)
```

Good specifications:
- Are **strong enough** to be useful (tell clients what they need to know)
- Are **weak enough** to give implementors freedom
- Cover all expected behaviors and document exceptional cases

---

### 5.2 Requirements Engineering 🟡

**User Stories vs Use Cases**

Both capture what the system must do, but from different perspectives:

| Dimension | User Story (Agile) | Use Case (UML/Traditional) |
|-----------|-------------------|-----------------------------|
| Format | "As a [user], I want [goal] so that [benefit]" | Actor + sequence of interactions |
| Detail | Minimal (fits on index card) | Detailed steps, alternatives |
| When used | Sprint planning, backlog | Architecture design, formal spec |
| Acceptance | GIVEN/WHEN/THEN (BDD) | Preconditions/Postconditions |

**INVEST Criteria for Good User Stories**

```
I — Independent: can be developed in any order
N — Negotiable: details can be changed via conversation
V — Valuable: provides value to the customer
E — Estimable: can estimate the effort required
S — Small: fits in a sprint
T — Testable: acceptance criteria can be written
```

**Requirements Pitfalls (what CMU 17-313 warns against)**

- **Ambiguous requirements**: "The system should be fast" → What is fast? Under what load?
- **Gold plating**: adding features nobody asked for
- **Scope creep**: requirements growing without corresponding timeline/budget adjustment
- **Requirements volatility**: changing requirements mid-sprint → mitigated by Agile

---

### 5.3 Software Architecture 🟡🔴

**Architecture Styles Compared**

| Style | Description | Strengths | Weaknesses | Used By |
|-------|-------------|-----------|------------|---------|
| **Monolith** | Single deployable unit | Simple to develop, test, deploy (initially) | Scaling bottleneck, tech lock-in | Small startups, early products |
| **Layered (N-tier)** | Presentation → Business → Data | Clear separation of concerns | Can be rigid, performance overhead | Enterprise apps, MVC frameworks |
| **Microservices** | Independent services per capability | Independent scaling, deployment, tech diversity | Distributed systems complexity, operational overhead | Netflix, Amazon, Uber |
| **Event-Driven** | Components communicate via events/messages | Loose coupling, scalability, async | Eventual consistency, debugging difficulty | Real-time systems, IoT, finance |
| **CQRS** | Separate read (query) and write (command) models | Optimized reads and writes independently | Complexity, eventual consistency | High-scale read/write asymmetry |
| **Hexagonal** | Core domain isolated from adapters (DB, UI, APIs) | Testability, framework independence | Requires discipline to maintain | Domain-driven design projects |

**SOLID Principles — Deep Dive**

**Single Responsibility Principle (SRP)**
```
A class should have one, and only one, reason to change.
```
Bad: `UserManager` class that handles: login, password hashing, email sending, audit logging → 4 reasons to change

Good: `Authenticator`, `PasswordHasher`, `EmailService`, `AuditLogger` → each with 1 responsibility

**Open/Closed Principle (OCP)**
```
Open for extension, closed for modification.
```
Add new behavior by adding new code, not modifying existing code.

```python
# Violates OCP: adding a new discount type requires modifying this function
def calculate_price(order, customer_type):
    if customer_type == "regular": return order.price
    if customer_type == "vip": return order.price * 0.9
    if customer_type == "employee": return order.price * 0.7
    # every new type = modifying this function

# Follows OCP: new discount types add classes, don't touch existing code
class RegularDiscount:
    def apply(self, price): return price
class VIPDiscount:
    def apply(self, price): return price * 0.9
class EmployeeDiscount:
    def apply(self, price): return price * 0.7
```

**Dependency Inversion Principle (DIP)**
```
High-level modules should not depend on low-level modules.
Both should depend on abstractions.
```

```python
# Violates DIP: EmailService is coupled to MySQLDatabase directly
class EmailService:
    def __init__(self):
        self.db = MySQLDatabase()  # concrete dependency

# Follows DIP: depends on abstraction
class EmailService:
    def __init__(self, db: DatabaseInterface):  # abstract dependency
        self.db = db
# Now MySQLDatabase, PostgresDatabase, MockDatabase all work via injection
```

---

### 5.4 Design Patterns — The Gang of Four 🟡🔴

The 23 design patterns from *Design Patterns: Elements of Reusable Object-Oriented Software* (Gamma, Helm, Johnson, Vlissides — "Gang of Four", 1994) remain the industry standard vocabulary.

**Most Important Patterns with Code Examples**

**Observer Pattern** (Behavioral) — Event handling systems, UI frameworks, pub/sub

```python
# Subject
class EventEmitter:
    def __init__(self):
        self._listeners = defaultdict(list)

    def on(self, event, callback):
        self._listeners[event].append(callback)

    def emit(self, event, data=None):
        for cb in self._listeners[event]:
            cb(data)

# Usage
emitter = EventEmitter()
emitter.on("user_signup", send_welcome_email)
emitter.on("user_signup", create_trial_subscription)
emitter.emit("user_signup", {"email": "user@example.com"})
```

**Strategy Pattern** (Behavioral) — Swappable algorithms at runtime

```python
class Sorter:
    def __init__(self, strategy):
        self._strategy = strategy

    def sort(self, data):
        return self._strategy(data)

# Strategies
quick_sorter = Sorter(sorted)                   # Python built-in
custom_sorter = Sorter(lambda x: sorted(x, key=lambda i: -i))  # reverse

# Runtime swap
sorter = Sorter(sorted)
sorter._strategy = my_radix_sort  # change strategy without changing Sorter class
```

**Factory Method Pattern** (Creational)

```python
from abc import ABC, abstractmethod

class Notifier(ABC):
    @abstractmethod
    def send(self, message: str) -> None: ...

class EmailNotifier(Notifier):
    def send(self, message): print(f"EMAIL: {message}")

class SMSNotifier(Notifier):
    def send(self, message): print(f"SMS: {message}")

def notifier_factory(channel: str) -> Notifier:
    if channel == "email": return EmailNotifier()
    if channel == "sms": return SMSNotifier()
    raise ValueError(f"Unknown channel: {channel}")
```

**Circuit Breaker Pattern** (Modern Distributed — not in GoF but essential today)

```
State Machine:
CLOSED (normal) → on X failures in window → OPEN (reject all)
OPEN → after timeout → HALF_OPEN (let one request through)
HALF_OPEN → on success → CLOSED; on failure → OPEN
```

Used by: Netflix Hystrix, Resilience4j, Python's `circuitbreaker` library

---

### 5.5 Testing & QA — The Testing Pyramid 🟡🔴

```
              ╱╲
             ╱  ╲
            ╱ E2E╲          ← Few, slow, expensive (Selenium, Playwright)
           ╱──────╲
          ╱Integrat╲        ← Moderate number (DB tests, API tests)
         ╱──────────╲
        ╱    Unit    ╲      ← Many, fast, cheap (JUnit, pytest, Jest)
       ╱──────────────╲
```

**Unit Testing — Partition Testing**

MIT's systematic approach to test case design:

1. Identify the **input space** of the function
2. Partition the space into **equivalence classes** (inputs that should behave similarly)
3. Choose **boundary values** within and between partitions
4. **Combine** partitions systematically

Example: `int[] multiply(int a, int b)`

```
Partitions for a:
  - a < 0 (negative)
  - a = 0 (zero)
  - a > 0 (positive)

Partitions for b:
  - b < 0, b = 0, b > 0

Test cases (covering each combination):
  multiply(-3, -4)  → positive result
  multiply(-3, 0)   → zero
  multiply(0, 5)    → zero
  multiply(3, 4)    → positive result
  multiply(INT_MAX, 2)  → overflow boundary
```

**Test Doubles (Mocking)**

| Type | What it does | When to use |
|------|-------------|-------------|
| **Stub** | Returns hardcoded values | When you need controlled responses from dependencies |
| **Mock** | Verifies calls were made correctly | When you want to assert an interaction happened |
| **Fake** | Working implementation but simplified | In-memory database instead of real DB |
| **Spy** | Wraps real object and records calls | When you want partial mocking |

**TDD Red-Green-Refactor Cycle**

```
┌─────────┐    Write failing    ┌─────────┐   Make it    ┌───────────┐
│   RED   │ ──── test first ──→ │  GREEN  │ ─── pass ──→ │ REFACTOR  │
│(failing)│                     │(passing)│              │(clean up) │
└─────────┘ ←───────────────────┴─────────┘ ←────────────└───────────┘
              next test cycle                  next test cycle
```

**DORA Metrics — Measuring Engineering Velocity (2025 industry standard)**

The DevOps Research and Assessment (DORA) team identified four key metrics:

| Metric | Elite Performers | High | Medium | Low |
|--------|-----------------|------|--------|-----|
| Deployment Frequency | Multiple/day | Once/day–week | Once/week–month | Once/month–6 months |
| Lead Time for Changes | < 1 hour | 1 day – 1 week | 1 week – 1 month | 1–6 months |
| Change Failure Rate | 0–15% | 16–30% | 16–30% | 16–30% |
| Time to Restore Service | < 1 hour | < 1 day | 1 day – 1 week | 1 week – 1 month |

---

### 5.6 Agile & Scrum 🟢🟡

**The Agile Manifesto (2001) — 4 Values**

```
Individuals and interactions  OVER  processes and tools
Working software              OVER  comprehensive documentation
Customer collaboration        OVER  contract negotiation
Responding to change          OVER  following a plan
```

**Scrum Sprint Cycle**

```
Product Backlog (ordered wish list)
       ↓ [Sprint Planning — select items, estimate story points]
Sprint Backlog (what we'll do this sprint)
       ↓ [Sprint Execution — typically 2 weeks]
       │  [Daily Standup — What did I do? What will I do? Blockers?]
       ↓
Potentially Shippable Increment
       ↓ [Sprint Review — demo to stakeholders]
       ↓ [Sprint Retrospective — what worked? what to improve?]
       ↓ [Repeat]
```

**Estimation: Planning Poker**

Teams use relative story points (Fibonacci-ish: 1, 2, 3, 5, 8, 13, 21) to estimate complexity:
- Everyone votes simultaneously (avoids anchoring bias)
- Large disagreements spark discussion
- Velocity (average points/sprint) used for release planning

---

### 5.7 DevOps & CI/CD Pipeline 🟡🔴

**A Complete CI/CD Pipeline**

```
Developer pushes code to feature branch
          ↓
[GitHub Actions / Jenkins / GitLab CI triggers]
          ↓
┌─────────────────────────────────────────────┐
│ CI PIPELINE                                 │
│  1. Checkout code                           │
│  2. Install dependencies                   │
│  3. Static analysis (lint, type check)     │
│  4. Unit tests (pytest / JUnit)            │
│  5. Integration tests                      │
│  6. Build artifact (Docker image, JAR)     │
│  7. Security scan (Snyk, Trivy)            │
│  8. Push to container registry             │
└─────────────────────────────────────────────┘
          ↓ (on merge to main)
┌─────────────────────────────────────────────┐
│ CD PIPELINE                                 │
│  1. Deploy to staging environment           │
│  2. Smoke tests                             │
│  3. E2E tests (Playwright / Cypress)       │
│  4. Performance tests                       │
│  5. Manual approval gate (optional)        │
│  6. Deploy to production (canary 5%)       │
│  7. Monitor metrics & error rates          │
│  8. Promote to full rollout (or rollback)  │
└─────────────────────────────────────────────┘
```

**GitHub Actions Example (CI)**

```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with: { python-version: '3.12' }
      - run: pip install -r requirements.txt
      - run: pytest --cov=src --cov-report=xml
      - run: mypy src/
      - uses: codecov/codecov-action@v3
```

---

### 5.8 Concurrency (MIT 6.1020) 🔴

**The Fundamental Problem: Shared Mutable State**

```
Thread T1:                Thread T2:
x = balance              x = balance   ← both read 100
x = x + 50               x = x - 30
balance = x              balance = x   ← T2 writes 70, T1 overwrites with 150!

Final: balance = 150  (should be 120!)
```

This is a **race condition**: the result depends on unpredictable thread scheduling.

**Three Strategies to Avoid Races**

1. **Confinement** — don't share data between threads
   - Thread-local storage
   - Stack-allocated variables
   - Message passing (each thread owns its data)

2. **Immutability** — share data but never mutate it
   - Final fields (Java), frozen objects (Python dataclasses with `frozen=True`)
   - Persistent/functional data structures

3. **Thread-Safe Data Types & Locks**
   - Synchronized methods / `synchronized` blocks (Java)
   - `Lock`, `ReentrantLock`, `ReadWriteLock`
   - `threading.Lock()` in Python
   - `std::mutex` in C++

**Deadlock Conditions (Coffman 1971)**

All four conditions must hold simultaneously for deadlock:
1. **Mutual exclusion**: only one thread can hold resource
2. **Hold and wait**: thread holds resource while waiting for another
3. **No preemption**: resources can't be forcibly taken
4. **Circular wait**: T1 waits for T2, T2 waits for T1

Prevention: break any one condition (e.g., order locks globally, use timeouts)

---

### 5.9 Performance Engineering (MIT 6.172) 🔴🟣

**Bentley's Rules for Optimizing Work**

MIT 6.172 organizes optimizations into four categories:

**1. Data Structure Rules**
- Use the simplest structure that satisfies requirements
- Pack struct fields to minimize padding (struct layout matters!)
- Augment data structures with precomputed values

**2. Loop Transformation Rules**
- **Hoisting**: move loop-invariant computation outside loop
- **Unrolling**: handle multiple iterations per loop body (reduces branch overhead)
- **Loop fusion**: combine two adjacent loops into one (better cache utilization)
- **Interchange**: swap nested loops to improve memory access pattern
- **Tiling**: divide loop iteration space into cache-sized tiles

Example of loop tiling for matrix multiplication:
```c
// Naive: poor cache behavior (column-major access of B)
for (int i=0; i<N; i++)
  for (int j=0; j<N; j++)
    for (int k=0; k<N; k++)
      C[i][j] += A[i][k] * B[k][j];

// Tiled: cache-friendly (B accessed in tiles)
for (int ii=0; ii<N; ii+=TILE)
  for (int jj=0; jj<N; jj+=TILE)
    for (int kk=0; kk<N; kk+=TILE)
      for (int i=ii; i<ii+TILE; i++)
        for (int j=jj; j<jj+TILE; j++)
          for (int k=kk; k<kk+TILE; k++)
            C[i][j] += A[i][k] * B[k][j];
```

**Work-Span Analysis (Parallel Performance)**

For a parallel program expressed as a DAG:
- **T₁** = total work (time on 1 processor)
- **T∞** = critical path (time with infinite processors)
- **Tp** = time on P processors

Key bounds:
```
Tp ≥ T₁/P          (work bound: can't do better than distributing work)
Tp ≥ T∞             (span bound: can't beat critical path)
Speedup ≤ T₁/T∞    (parallelism = maximum achievable speedup)
```

Example: Matrix multiplication N×N
- T₁ = O(N³)
- T∞ = O(log N) (using a recursive parallel approach)
- Parallelism = O(N³/log N) → massive potential speedup

---

### 5.10 Refactoring 🟢🟡

**Code Smells — Martin Fowler's Taxonomy**

| Smell | Description | Refactoring |
|-------|-------------|-------------|
| Long Method | Method > 10-15 lines doing too much | Extract Method |
| Large Class | Class with too many responsibilities | Extract Class |
| Long Parameter List | Method with > 3-4 parameters | Introduce Parameter Object |
| Duplicate Code | Same code in multiple places | Extract Method / Pull Up |
| Dead Code | Unused variables, methods, classes | Remove Dead Code |
| Magic Numbers | Unexplained numeric literals | Replace with named constant |
| Feature Envy | Method uses another class's data more than its own | Move Method |
| Data Clumps | Same group of fields always appearing together | Extract Class |
| Primitive Obsession | Overuse of primitives instead of small objects | Replace Primitive with Object |
| Switch Statements | Long switch/if-else on type | Replace with Polymorphism |

---

## 6. PRACTICAL LABS & PROJECTS

### MIT 6.1020 — Weekly Problem Sets + Group Projects

| Assignment | Language | What You Build | Key Concepts |
|-----------|---------|---------------|--------------|
| PS0 | TypeScript | Getting started, basic static types | Type safety basics |
| PS1 | TypeScript | Turtle graphics with immutable state | Immutability, ADTs |
| PS2 | TypeScript | Poetic walks — graph traversal | Specifications, testing |
| PS3 | TypeScript | Expressivo math expression system | Recursive data types, ASTs |
| PS4 | TypeScript | Collaborative text editor | Concurrency, operational transforms |
| Group Project 1 | TypeScript | Multiplayer board game | Full ADT + concurrency |
| Group Project 2 | TypeScript | Distributed chat application | Network concurrency, testing |

### MIT 6.172 — Performance Engineering Labs (C language)

| Project | Name | Goal | Techniques |
|---------|------|------|------------|
| P1 | Bit manipulation | Implement fast bit operations | Bit hacks, integer arithmetic |
| P2 | Chess engine optimization | Optimize Leiserchess (chess program) | Profiling, loop transforms, SIMD |
| P3 | Parallel Leiserchess | Parallelize chess engine with Cilk | Work-stealing, race detection |
| P4 | Final Project | Competitive optimization of a new program | All techniques combined |

Each project includes:
- **Alpha submission**: first attempt (gets design review from industry mentor)
- **Beta submission**: optimized version after mentor feedback
- **Code review meeting**: 60-90 min with industry mentor

### CMU 17-313 — Software Engineering Practicum

| Component | Description | Topics Covered |
|-----------|-------------|----------------|
| HW1 | Static analysis (extend FindBugs) | Bug patterns, AST analysis |
| HW2 | Requirements elicitation | User stories, personas, acceptance criteria |
| HW3 | Architecture documentation | C4 model, ADRs, quality attributes |
| HW4 | CI/CD pipeline setup | GitHub Actions, Docker, deployment |
| HW5 | Chaos engineering experiment | Netflix-style resilience testing |
| Group Project | Full sprint-based development | Agile, code review, CI/CD |

### Berkeley CS169 — Agile Development Project

Students build a Ruby on Rails application using:
- BDD with Cucumber (Given/When/Then scenarios)
- TDD with RSpec
- Continuous integration with Travis CI
- Pair programming in-class sessions
- User stories and acceptance testing with real clients

---

## 7. TOOLS, LANGUAGES & PLATFORMS

### Languages by Course

| University | Course | Language | Why |
|------------|--------|---------|-----|
| MIT 6.1020 | Elements of SW Construction | **TypeScript** | Static types, modern, web-compatible |
| MIT 6.172 | Performance Engineering | **C** | Low-level control, performance-critical |
| CMU 17-313 | Foundations of SE | **Python + JS** | Broad applicability |
| Berkeley CS169 | Software Engineering | **Ruby on Rails** | Rapid web development, good for Agile |
| CMU 17-445 | ML in Production | **Python** | ML ecosystem standard |

### Essential Developer Tools

| Category | Tools |
|----------|-------|
| **Version Control** | Git, GitHub, GitLab, Bitbucket |
| **CI/CD** | GitHub Actions, Jenkins, GitLab CI, CircleCI, ArgoCD |
| **Containerization** | Docker, Podman |
| **Orchestration** | Kubernetes, Helm, Docker Compose |
| **IaC** | Terraform, Ansible, Pulumi, CDK |
| **Testing (Python)** | pytest, unittest, hypothesis (property-based) |
| **Testing (JS/TS)** | Jest, Vitest, Playwright, Cypress |
| **Testing (Java)** | JUnit 5, Mockito, AssertJ |
| **Static Analysis** | ESLint, mypy, Pylint, SonarQube, Semgrep |
| **Profiling** | perf, VTune, py-spy, cProfile |
| **Observability** | Prometheus, Grafana, Jaeger, OpenTelemetry |
| **Project Management** | Jira, Linear, GitHub Issues |

### AI-Assisted Development Tools (2025-2026)

| Tool | Description | Market Position |
|------|-------------|----------------|
| **GitHub Copilot** | AI pair programmer in IDE + Agent Mode | 42% market share, 15M+ users |
| **Cursor** | AI-first IDE with codebase context | Fastest growing dev tool 2025 |
| **Claude Code** | Terminal-based agentic coding | Anthropic, deep reasoning |
| **Windsurf (Codeium)** | AI IDE with flow state design | Strong enterprise adoption |
| **Gemini Code Assist** | Google's coding assistant | Tight Google Cloud integration |
| **CodeRabbit** | AI code review in PRs | Automated PR review |
| **Copilot Workspace** | Multi-file agentic issue resolution | GitHub's full-cycle agent |

---

## 8. KEY TEXTBOOKS & PAPERS

### Primary Textbooks

| Title | Authors | Level | Course |
|-------|---------|-------|--------|
| **The Mythical Man-Month** | Fred Brooks (1975) | 🟢 | All SE courses |
| **Clean Code** | Robert C. Martin (Uncle Bob) | 🟢🟡 | CMU 17-313 |
| **Refactoring (2nd ed.)** | Martin Fowler | 🟡 | All SE |
| **Design Patterns (GoF)** | Gamma, Helm, Johnson, Vlissides (1994) | 🟡🔴 | All SE |
| **The Pragmatic Programmer** | Thomas & Hunt | 🟢🟡 | All SE |
| **A Philosophy of Software Design** | John Ousterhout (2018) | 🟡 | All SE |
| **Software Engineering at Google** | Winters, Manshreck, Wright (free) | 🟡🔴 | CMU, Berkeley |
| **Designing Data-Intensive Applications** | Martin Kleppmann | 🔴 | Systems + SE |
| **Building Microservices** | Sam Newman (2nd ed.) | 🔴 | Architecture |
| **Release It! Design and Deploy Production-Ready Software** | Nygard | 🔴 | DevOps, CMU 17-445 |

### Seminal Papers

| Paper | Authors | Year | Why Important |
|-------|---------|------|---------------|
| No Silver Bullet | Fred Brooks | 1987 | Essential complexity of software; still relevant |
| Manifesto for Agile Software Development | Beck et al. | 2001 | Birth of Agile |
| Continuous Delivery | Humble & Farley | 2010 | Foundation of modern CD pipelines |
| The Google File System | Ghemawat et al. | 2003 | Large-scale systems SE |
| Dynamo: Amazon's Highly Available KV Store | DeCandia et al. | 2007 | Distributed systems design decisions |
| ARIES Recovery | Mohan et al. | 1992 | Fault tolerance in systems |
| Why Google Stores Billions of Lines in a Monorepo | Potvin & Levenberg | 2016 | Monorepo SE practices |
| Accelerate: State of DevOps Report (2024) | DORA / Google | annual | DORA metrics, engineering performance |

---

## 9. AI-ERA ADDITIONS (2024–2026)

### The AI-Assisted Software Engineering Landscape

The 2025-2026 SE curriculum is being reshaped by two forces:

**Force 1 — AI as a coding tool** (tools that help humans write code)
- GitHub Copilot, Cursor, Claude Code, Gemini Code Assist
- Used by 82% of developers weekly as of Q1 2025

**Force 2 — SE for AI-enabled products** (CMU 17-445 focus)
- Building, deploying, and maintaining ML-powered software
- Responsible AI: fairness, explainability, safety

### New SE Principles for AI-Augmented Development

**Vibe Engineering vs Vibe Coding**

```
VIBE CODING (single-player mode)
  "Just describe what you want in a prompt,
   paste whatever the AI generates, don't worry too much"
  → Great for: POC, personal projects, throw-away scripts
  → Risk for production: no maintainability, no tests, no architecture

VIBE ENGINEERING (multiplayer mode — the SE skill)
  "Architect the constraints, rules, and agents so that
   the AI produces reliable, testable, maintainable code at scale"
  → Requires: specification writing, architecture design,
    test suite definition, code review, security review
  → This is where SE principles become MORE important, not less
```

**Practical SE Practices for AI-Assisted Workflows**

| Practice | How AI Changes It | SE Principle Still Needed |
|----------|------------------|--------------------------|
| **Code Review** | AI generates code 10× faster | Reviewers must understand architecture + security |
| **Testing** | AI writes unit tests automatically | Engineer must design coverage strategy, edge cases |
| **Refactoring** | AI suggests refactors | Engineer must evaluate whether it follows SOLID |
| **Documentation** | AI generates docstrings | Engineer validates correctness and completeness |
| **Architecture** | AI produces boilerplate | Engineer must design for scalability, resilience |
| **Security** | AI may introduce vulnerabilities | Engineer must do threat modeling, code audit |

**CMU 17-445: AI Engineering (SE for ML)**

This unique course covers how classical SE principles apply specifically to systems with ML components:

```
CHALLENGES UNIQUE TO ML SYSTEMS:
├── Data dependency: code quality ≠ model quality
├── Non-determinism: same code, different model behavior
├── Feedback loops: deployed models affect training data
├── Gradual performance decay (concept drift)
├── Testing is harder: no oracle for "is this prediction correct"
└── Fairness and bias: SE implications of algorithmic decisions

TOPICS:
├── Requirement analysis for ML systems
│   └── Data requirements, model quality specs, SLOs
├── Architecture for ML pipelines
│   └── Feature stores, model registries, serving layers
├── Testing ML-enabled software
│   └── Behavioral testing, metamorphic testing, slicing
├── Deployment: canary, shadow mode, A/B testing
├── Monitoring: data drift, model drift, alerting
└── Responsible AI: fairness, explainability, safety
```

### AI Tools SE Engineers Must Know in 2026

| Category | Tool | What It Does |
|----------|------|-------------|
| Code generation | GitHub Copilot Agent Mode | Autonomous multi-file edits |
| Code review | CodeRabbit | Automated PR review with AI |
| Test generation | Copilot / Keploy | Generate unit & integration tests |
| Documentation | Mintlify | Auto-generate API docs |
| Security scanning | Semgrep, Snyk | AI-enhanced vulnerability detection |
| Architecture | AWS Application Composer | Visual AI-assisted architecture |
| Incident management | PagerDuty + AI | AI-assisted RCA and remediation |

---

## 10. CAREER RELEVANCE & INDUSTRY MAP

### Job Roles & SE Knowledge Required

| Role | SE Knowledge Level | Key Topics |
|------|--------------------|-----------|
| **Junior Software Engineer** | 🟢🟡 | Clean code, testing, Git, Agile, basic design patterns |
| **Senior Software Engineer** | 🟡🔴 | Architecture, SOLID, refactoring, CI/CD, performance |
| **Staff/Principal Engineer** | 🔴🟣 | Systems design, org-level architecture, engineering culture |
| **Software Architect** | 🔴🟣 | Architecture patterns, quality attributes, ADRs, trade-offs |
| **DevOps/Platform Engineer** | 🟡🔴 | CI/CD, Docker, Kubernetes, IaC, observability |
| **ML Engineer** | 🟡 + AI SE | CMU 17-445 topics, MLOps, model deployment |
| **Tech Lead** | 🔴 + leadership | All SE + project management, mentoring, communication |

### Industry Toolkit Map

```
PHASE 1: Development
  IDE: VS Code / IntelliJ / Cursor / Windsurf
  AI Assistant: Copilot / Claude Code / Gemini
  VCS: Git + GitHub / GitLab
  Testing: pytest / Jest / JUnit

PHASE 2: Build & Integration
  CI: GitHub Actions / Jenkins / GitLab CI
  Quality: SonarQube / Semgrep / CodeClimate
  Containers: Docker / BuildKit

PHASE 3: Deployment
  Registry: ECR / GCR / Docker Hub
  Orchestration: Kubernetes / ECS
  CD: ArgoCD / Spinnaker / Flux

PHASE 4: Operation
  Monitoring: Prometheus + Grafana
  Logging: ELK Stack / Loki / Datadog
  Tracing: Jaeger / Zipkin / Honeycomb
  Alerting: PagerDuty / OpsGenie
  Chaos: Chaos Monkey / Gremlin
```

### 2025-2026 SE Industry Trends

- **AI-native development** is now standard at most companies — but demand for senior engineers who can architect and review AI-generated code is increasing
- **Platform engineering** (internal developer platforms) is the fastest-growing SE specialization
- **FinOps + engineering**: engineers are now expected to understand cloud cost implications of their architectural choices
- **SRE (Site Reliability Engineering)**: the DevOps-evolved role that combines SE depth with operational excellence
- **Developer experience (DevEx)**: companies investing heavily in internal tooling, frictionless CI/CD, faster feedback loops

---

## 11. RESEARCH SOURCES & LINKS

### Official University Course Pages

| Course | University | URL |
|--------|-----------|-----|
| 6.1020 Software Construction (Spring 2026) | MIT | https://web.mit.edu/6.031/www/ |
| 6.005 Software Construction (OCW) | MIT | https://ocw.mit.edu/courses/6-005-software-construction-spring-2016/ |
| 6.172 Performance Engineering (OCW) | MIT | https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018 |
| 17-313 Foundations of SE (Fall 2025) | CMU | https://cmu-313.github.io/ |
| 17-445 ML in Production (Spring 2025) | CMU | https://mlip-cmu.github.io/s2025/ |
| 17-445 GitHub (course materials) | CMU | https://github.com/ckaestne/seai/ |
| CS169A Software Engineering | Berkeley | https://bcourses.berkeley.edu/courses/1507976/assignments/syllabus |
| CS5150 Software Engineering | Cornell | https://classes.cornell.edu/browse/roster/SP26/class/CS/5150 |

### Essential Books (free access where available)

| Book | URL |
|------|-----|
| Software Engineering at Google (free PDF) | https://abseil.io/resources/swe-book |
| A Philosophy of Software Design (Stanford) | https://web.stanford.edu/~ouster/cgi-bin/book.php |
| The Pragmatic Programmer (sample) | https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/ |
| Clean Code (summary) | https://gist.github.com/wojteklu/73f6214de0f1e4f...(community summary) |
| Refactoring catalog (Fowler's site) | https://refactoring.com/catalog/ |

### Industry Research

| Resource | URL |
|----------|-----|
| DORA State of DevOps 2024 | https://dora.dev/research/ |
| GitHub Octoverse 2024 (AI + developer trends) | https://octoverse.github.com/ |
| Stack Overflow Developer Survey 2025 | https://survey.stackoverflow.co/2025/ |
| AI Code Statistics 2026 | https://www.netcorpsoftwaredevelopment.com/blog/ai-generated-code-statistics |
| Accelerate Book (DORA metrics) | https://itrevolution.com/product/accelerate/ |
| SWEBOK v4 (IEEE) | https://www.computer.org/education/bodies-of-knowledge/software-engineering |
| OWASP Top 10 | https://owasp.org/www-project-top-ten/ |

### Tools & Practical Resources

| Tool | URL |
|------|-----|
| GitHub Actions Docs | https://docs.github.com/en/actions |
| Docker Documentation | https://docs.docker.com/ |
| Kubernetes Docs | https://kubernetes.io/docs/home/ |
| Terraform Docs | https://developer.hashicorp.com/terraform/docs |
| OpenTelemetry | https://opentelemetry.io/docs/ |
| Prometheus Docs | https://prometheus.io/docs/ |
| Refactoring.guru (patterns + refactoring) | https://refactoring.guru/ |
| SourceMaking (design patterns) | https://sourcemaking.com/design_patterns |

---

## SUMMARY KNOWLEDGE MAP

```
SOFTWARE ENGINEERING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONSTRUCTION LAYER (MIT 6.1020)
  Goals: Safe from bugs | Easy to understand | Ready for change
  ADTs, Specifications, Immutability, Modularity
  Testing: Partition testing, TDD, Coverage
  Concurrency: Shared state, locks, message passing

DESIGN LAYER (CMU 17-313 + All)
  SOLID Principles (SRP, OCP, LSP, ISP, DIP)
  23 GoF Design Patterns (Creational, Structural, Behavioral)
  Architecture Styles (Monolith → Microservices → Event-Driven)
  Modern Patterns (Circuit Breaker, Saga, CQRS)

PROCESS LAYER (CMU 17-313 + Berkeley)
  Requirements: User stories, use cases, BDD scenarios
  Agile: Scrum, XP, Kanban, estimation, sprint cadence
  Quality: Testing pyramid, DORA metrics, code review

OPERATIONS LAYER (CMU 17-445 + Berkeley)
  DevOps: CI/CD pipelines, GitHub Actions, deployment strategies
  Containerization: Docker, Kubernetes
  Observability: Logs, metrics, traces (OpenTelemetry)
  Reliability: Chaos engineering, SLOs, incident response

PERFORMANCE LAYER (MIT 6.172)
  Profiling, Bentley Rules, Loop transforms
  Cache optimization, SIMD, parallel programming
  Work-span analysis, Cilk parallelism

AI-ERA LAYER (2024–2026)
  AI-Assisted Development (Copilot, Claude Code, Cursor)
  Vibe Engineering: AI constraints, review, hardening
  SE for ML (CMU 17-445): data requirements, model testing,
    deployment, drift monitoring, responsible AI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

*Report 02 of 12 — Software Engineering*
*Next: Report 03 — Systems Analysis & Design*
*Research by Claude (Anthropic) — May 2026*
*Sources: MIT OCW, CMU 17-313, CMU 17-445, Berkeley CS169, Cornell CS5150, DORA, GitHub Octoverse*
