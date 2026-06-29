# CSE470 — Software Engineering — Detailed Course Study Guide

> **Course:** CSE470 — Software Engineering  
> **Institution:** BRAC University, Department of Computer Science & Engineering  
> **Source:** `Coursework files/CSE 470 Content 2024....../` (lecture slides only)  
> **References (from slides):** Sommerville (*Software Engineering* 8e), Pressman (*A Practitioner's Approach* 7e), Martin (*Clean Code*), Fowler (*Refactoring*)  
> **Purpose:** Lecture-by-lecture concept notes — what was **taught**, organized by week and topic. Not full slide reproduction.

---

## Table of Contents

1. [Course at a Glance](#1-course-at-a-glance)
2. [Week 1 — Introduction & Process Models](#week-1--introduction--process-models)
3. [Week 2 — Agile & Requirements Engineering](#week-2--agile--requirements-engineering)
4. [Week 3 — UML Class Diagrams & MVC](#week-3--uml-class-diagrams--mvc)
5. [Week 4 — Software Architecture Patterns](#week-4--software-architecture-patterns)
6. [Week 5 — Design Patterns](#week-5--design-patterns)
7. [Week 6 — Testing & Software Quality](#week-6--testing--software-quality)
8. [Week 7 — Software Metrics](#week-7--software-metrics)
9. [Week 8 — Refactoring & Documentation](#week-8--refactoring--documentation)
10. [Lecture Source Files](#lecture-source-files)
11. [Exam Preparation Quick Reference](#exam-preparation-quick-reference)

---

## 1. Course at a Glance

### Marks distribution

| Component | Weight |
|-----------|--------|
| Quiz (4 quizzes; best N−1 counted) | 5% |
| Assignments (average of 2) | 5% |
| Mid Term Exam | 25% |
| Project | 20% |
| Final Exam | 35% |
| Attendance | 0% (70% mandatory per BRACU policy) |

### Reference books (from slides)

1. Ian Sommerville — *Software Engineering* (Addison Wesley, 8th ed., 2007)
2. Roger S. Pressman — *Software Engineering: A Practitioner's Approach* (McGraw-Hill, 7th ed., 2010)
3. Robert C. Martin — *Clean Code: A Handbook of Agile Software Craftsmanship* (2017)

### Ground rules

- Makeup MID/FINAL per BRACU policy; makeup quiz with valid documentation
- Assignments/reports due by deadline; disciplinary action for cheating
- Maintain class behavior; questions encouraged; consultation hours available

### What Software Engineering is

- **Systematic, disciplined, quantifiable** approach to development, operation, and maintenance of software
- Science and art of building **high-quality** software: on time, on budget, correct operation, acceptable performance
- Balancing conflicting goals — none achieved perfectly in practice

### Goals of Software Engineering

- Produce software that is **absolutely correct**
- Minimum **effort** and **cost**; least possible **time**
- Easily **maintained** and **modified**
- Maximize **profitability**
- SE management = trade-offs among goodness attributes

### What is software?

- Programs, source code, data structures
- Documents: requirements, specifications, design docs, test plans

### What is good software?

- **Correct** (above all)
- Maintainable, modular, well-designed interfaces
- Reliable, robust, good UI, well documented (internal + external)
- Efficient — not wasteful of CPU/memory; optimized structures/algorithms

### Goodness goals conflict

- All attributes cost money; improving one may hurt another (e.g., efficiency vs maintainability)
- Better documentation may divert effort from reliability

### Why SE matters

- Cost of getting software **wrong** can be catastrophic (bankruptcy, injury, death)
- $600B+ spent annually on software production
- Very few systems work correctly on first install
- **Legacy software** must be adapted, enhanced, extended, re-architected

### Real-life software scale (Eclipse example)

- 1.35M+ LOC, 400+ person-years, 17K+ classes, est. $54M+ development cost, 40K+ lifetime bugs

### Software myths

| Stakeholder | Myth |
|-------------|------|
| **Management** | Standards book is enough; tools are state-of-the-art; add programmers to catch up (Mongolian Horde) |
| **Customer** | Vague objectives suffice; requirements change easily because software is flexible |
| **Developer** | Job done when program runs; can't assess quality until running; only deliverable is working program |

### Why large software needs different approaches

- Formal process management; detailed requirements/spec/design
- Modularity and interfaces; version control; rigorous testing
- Long-term maintenance planning; extensive documentation

### Why software development is hard

- Changing requirements; incomplete specifications
- Programmer variability; communication/coordination gaps
- Inadequate tools; inaccurate effort/time estimates
- Nonlinear complexity growth; poor processes; neglected architecture

### SE framework activities

Communication → Planning → Modeling → Construction → Deployment → Maintenance  
(with requirements collection, analysis, design, code generation, testing, release)

### Major software production tasks

Requirements analysis → Specification → Design → Coding → Testing → Release → Maintenance

### Polya's problem-solving (essence of practice)

1. **Understand** the problem (communication, analysis, stakeholders, unknowns, compartmentalization)
2. **Plan** the solution (patterns, reuse, subproblems, design model)
3. **Carry out** the plan (traceability, reviews, correctness)
4. **Examine** the result (testing strategy, validation against stakeholder requirements)

---

## Week 1 — Introduction & Process Models

### 0.0 — Introduction to Software Engineering

*Note: slides marked "No question in exam" — foundational context only.*

---

### 1.1.1 — Waterfall Process Model

**Definition:** Sequential methodology for software project management.

**Phases (in order):**
1. **Requirement Analysis** — client meetings; collect requirements; identify feasible/non-feasible; define how software meets needs → APPROVED
2. **Design** — logical and physical design → APPROVED
3. **Coding** — cannot start until design fixed; design split into blocks → code modules → APPROVED
4. **Testing** — verify against requirements; fix problems in code → APPROVED
5. **Deployment & Maintenance** — production rollout; step-by-step; feedback; maintain at user sites

**When to choose Waterfall:**
- Requirements well known
- Small-scale, short-term project
- Resources available and trained
- Technology tools stable (not dynamic)

**Advantages:**
- Simple and easy; stages go one-by-one
- Sudden changes don't create confusion
- Changes only in development stage — no need to revisit everything

**Disadvantages:**
- Freezes subsequent stages when completing a stage
- No way to verify design early
- Once in testing, no new features
- Code reuse not possible

**Example case:** Uncle's local shop accounting calculator (small, known reqs) vs startup super-shop calculator — Waterfall fits Case 1 better.

---

### 1.1.2 — V-Model

**Definition:** Sequential process model; extension of waterfall emphasizing **earlier and detailed testing**.

**Left side (development):** Requirement Analysis → Architecture Design → Component/Module Design → Code Generation

**Right side (testing):** Unit Testing ← Integration Testing ← System Testing ← Acceptance Testing

**Test design parallels development:** Unit Test Design, Integration Test Design, System Test Design, Acceptance Test Design

**Verification vs Validation:**
- **Verification** — building the product **the right way** (follow standards through requirements → design → code)
- **Validation** — building the **right product** (testing confirms it meets customer needs)

**Characteristics:**
- Changes not welcomed; no dummy prototypes until end
- If test fails, both test document and code must be updated
- Test activities planned **before** testing begins
- Saves time over waterfall; higher success chance

---

### 1.2.1 — Incremental and Iterative Process Models

**Evolutionary models:** Can change requirements; can return to earlier phases (e.g., back to communication after coding).

#### Incremental Model

- Software delivered in **fixed number of increments**
- Customer uses software from beginning; knows requirements well
- Each increment **adds** new sections (e.g., Login → Navigation → next module)
- Parallel stages possible; increments prioritized by customer

**When to use:**
- Thin slices of overall software ready
- Customer wants prototype from project start
- Small/medium projects

#### Iterative Model

- No fixed iteration limit; time set aside for refinement
- Customer/team unsure of requirements or technology
- Each iteration **reworks** same sections (e.g., refine Login, then add Navigation)
- Customer feedback improves quality over repetitions

**When to use:**
- Requirements not fixed
- Technology not identified
- Quality refined over time vs fixed deadline
- Long-term, complex projects

**Example:** Corona awareness app — Bangla only initially, English later if feedback good → **Incremental** (add language as new increment).

---

### 1.2.2 — Spiral Model and CMMI

#### Spiral Model

**Formal definition (Barry Boehm, 1986):** Risk-driven process model generator; adopts elements of incremental, waterfall, or evolutionary prototyping based on project risk patterns.

**Four sectors per loop:**
1. **Objective setting** — specific phase objectives
2. **Risk assessment and reduction** — assess and mitigate key risks
3. **Development and validation** — choose development model; build prototype
4. **Planning** — review project; plan next spiral phase

**When to use:**
- Long-term commitment and budget
- Users/developers unsure of needs
- Complex requirements; new product line
- Significant expected changes (research/exploration)
- Enormous risk (e.g., satellite cellular system, space projects)

**Reality:** Influential for risk-driven thinking; **rarely used** as published in practice.

#### CMMI (Capability Maturity Model Integration)

- Process/behavioral model from **CMU** for streamlining improvement and reducing risk
- Often required for **US government** software contracts
- **5 maturity levels** — improve until Level 5 (then maintenance-focused)
- Work divided so system maturity is measurable and improvable

---

## Week 2 — Agile & Requirements Engineering

### 2.1.1 — Agile Methodology (All Topics)

**Why Agile needed:**
1. **Monolithic software** — ready product only at end; live systems (Amazon, Facebook) can't afford downtime
2. Requirements change frequently — even multiple times per day

**What is Agility?**
- Set of **principles and values**; iterative + incremental with focus on adaptability and customer satisfaction via **rapid delivery of working software**

**Agile Manifesto** (value left over right):
- Individuals and interactions over processes and tools
- Working software over comprehensive documentation
- Responding to change over following a plan
- Customer collaboration over contract negotiation

**Three agile methodologies taught:** XP, Agile Unified Process (AUP), Scrum

#### Extreme Programming (XP)

- New versions built **several times per day**
- Increments delivered every **2 weeks**
- All tests run every build — build accepted only if tests pass

**XP practices:**
- **Pair programming** — two coders switch observer/navigator; better code, learning, lower cost
- **Unit testing** — test per method; **Test-First Development (TDD)** — write test before code
- **Refactoring** — restructure internal code without changing external behavior; reduce duplication, break large methods, better naming

#### Agile Unified Process (AUP)

- Simplified **RUP** (Rational Unified Process)

**Phases:**
| Phase | Focus |
|-------|-------|
| **Inception** | Business scope, initial requirements, potential solution |
| **Elaboration** | Prove architecture; extract more requirements |
| **Construction** | Continuous implementation + unit testing in iterations |
| **Transition** | Deploy to production; adjust feedback |

**Disciplines:** Model, Implementation, Test, Deployment, Configuration Management, Project Management, Environment

#### Scrum

- Most widely used agile project management method
- Full software in **14–30 day** iterations (sprints)

**Roles:**
| Role | Responsibility |
|------|----------------|
| **Product Owner** | Features, release date, prioritization, budget |
| **Scrum Master** | Enact Scrum values; remove impediments; keep team productive |
| **Team** | 5–10 self-organizing, cross-functional members; change only between sprints |

**Artifacts:**
- **Product Backlog** — all desired work; user stories + story points; prioritized by PO; reprioritized each sprint
- **Sprint Backlog** — high-priority items for current sprint; work remaining updated daily; team cannot change (in strict version)
- **Burndown Chart** — work completed vs remaining; daily update; release burndown at sprint end

**Ceremonies:**
- **Daily Scrum** (~15 min stand-up): What did you do yesterday? What today? Obstacles?
- **Sprint Review** — demo of completed work; informal; 2-hour prep max; no slides
- **Sprint Retrospective** — what worked/went wrong; improvement for next sprint

---

### 2.2.1 — Requirements Engineering

**Four sub-processes:**
1. Requirements **elicitation**
2. Requirements **analysis**
3. Requirements **validation**
4. Requirements **management**

#### What is a requirement?

- High-level abstract statement to detailed mathematical specification
- Dual function: basis for **contract bid** (open to interpretation) vs **contract itself** (detailed)

#### Functional vs non-functional

| Type | Description |
|------|-------------|
| **Functional** | Services system should provide; reactions to inputs; behavior in situations; may state what system should NOT do |
| **Non-functional** | Constraints on services/functions — timing, development process, standards; often system-wide; may be **more critical** than functional |

**Non-functional classifications:**
- **Product** — execution speed, reliability
- **Organizational** — process standards, implementation requirements
- **External** — interoperability, legislative requirements

**Example (MHC-PMS):** Search appointments (functional); 5-second max downtime (product); health authority ID card auth (organizational); privacy provisions HStan-03-2006 (external)

#### Requirements engineering process

**Feasibility study** — short focused study:
- Contributes to organizational objectives?
- Engineered with current technology and budget?
- Integrable with existing systems?

**Elicitation and analysis problems:**
- Stakeholders don't know what they want
- Requirements in own terms; conflicting stakeholders
- Organizational/political influences; changing requirements

**Requirements spiral activities:**
1. **Discovery** — interact with stakeholders; domain requirements
2. **Classification & organisation** — group related requirements; use architecture model
3. **Prioritisation & negotiation** — resolve conflicts via stakeholder negotiation
4. **Documentation** — formal or informal (XP uses cards)

**Discovery techniques:**
- Documentation, stakeholders, similar systems
- **Viewpoints** — structure requirements by stakeholder perspective (interactor, indirect, domain)
- **Interviews** — closed (predefined questions) or open (exploratory); mix in practice; good for overall understanding, weak for domain terminology
- **Scenarios** — real-life examples; starting situation, normal flow, what can go wrong, concurrent activities, end state; may use use cases

**Requirements validation:**
- Demonstrates requirements define what customer **really wants**
- Fixing requirements error after delivery may cost **100×** implementation error fix
- Changes ripple to design, implementation, re-testing

**Validation checks:** Validity, Consistency, Completeness, Realism, Verifiability

**Validation techniques:** Requirements reviews, Prototyping, Test-case generation

**Requirements management:**
- Requirements change during RE and development
- Incomplete and inconsistent; new requirements emerge; contradictory viewpoints
- Users discover new needs after deployment experience
- **Enduring requirements** — stable, domain-core (e.g., doctors/nurses in hospital)
- **Volatile requirements** — change during development/use (e.g., healthcare policy)
- **Change management phases:** Problem analysis → Change analysis & costing → Change implementation
- Plan: identification, traceability, CASE tool support

---

### 2.2.2 — Use Case Diagram

**Purpose:** Scenario-based UML technique for requirement gathering; formal representation of business system ↔ environment interaction.

**Four elements:** System (boundary), Actor, Use Cases, Relationships

**System:** Website, app, etc.; boundary rectangle around use cases; actors outside

**Actors:**
- Stick figure; descriptive noun phrase
- Types: Human, peripheral device, external system, time-based event
- **Primary** — initiates use case
- **Secondary** — reacts to use case (e.g., Payment System)

**Use cases:**
- Oval; **Verb-Noun** format
- Verbs from scenario → use cases (login, search, make appointment, pay)

**Relationships:**

| Type | Meaning |
|------|---------|
| **Association** | Solid line; actor ↔ use case communication |
| **Include** | Dashed arrow to included; mandatory; base needs included to complete |
| **Extend** | Dashed arrow to base; optional extension behavior |
| **Generalization** | Child inherits parent (actors or use cases); hollow arrow to parent |

**Example:** Appointment system — Login includes Verify Password; Display Error and Print Appointment extend Make Payment; Payment by Card/Bkash generalize Payment.

---

### Supporting: Agile Development (Week 2)

Reinforces manifesto, characteristics (modular, iterative, time-bound, incremental, convergent, people-oriented, collaborative), plan-driven vs agile specification contrast.

**User stories format:** As a [role], I want to [goal], so I can [reason].  
Example: "As a user, I want to log in, so I can access subscriber content."  
Rated with **story points** (1–10, shirt sizes, etc.)

**Sprint backlog differences (supporting slide):** Team members sign up for work; work emerges; can add/delete/change items.

---

## Week 3 — UML Class Diagrams & MVC

### 3.1.1 — Class Diagram in UML

**Class:** Template for objects; captures attributes and behaviors of a set of objects (people, places, things, events)

**Object:** Entity with identity; encapsulates state and behavior; distinguishable from others

**Potential classes from analysis:** External entities, things, occurrences/events, roles, organizational units, places, structures

**Analysis class types:**
- **Concrete** — from application domain (Customer, Employee)
- **Abstract** — useful abstractions (Person)

**UML class notation:**
```
ClassName
─────────
attributes
─────────
operations
```

**Attributes:**
- Primitive/atomic types; `name : Type`
- **Derived** — calculated; prefix with `/` (e.g., `/ age : Date`)

**Operations:**
- Constructor, query, or update
- Signature: `operationName(param : Type) : ReturnType`

**Visibility:**

| Symbol | Visibility | Accessible to |
|--------|------------|---------------|
| `+` | Public | All objects |
| `#` | Protected | Class + subclasses |
| `-` | Private | Implementing class only |

**Relationships:**

| Type | Notation | Meaning |
|------|----------|---------|
| **Association** | Line between classes | Bidirectional semantic connection; label + role |
| **Aggregation** | Hollow diamond | Whole-part; parts can exist independently |
| **Composition** | Filled diamond | Strong ownership; coincident lifetime |
| **Generalization** | Hollow arrow to parent | Inheritance; a-kind-of |

**Multiplicity:**

| Notation | Meaning |
|----------|---------|
| `1` | Exactly one |
| `0..*` or `0..m` | Zero or more |
| `1..*` or `1..m` | One or more |
| `0..1` | Zero or one |
| `2..4` | Specified range |
| `1..3, 5` | Multiple disjoint ranges |

---

### 3.1.2 — Class Diagram Design

**Noun/verb analysis guidelines:**

| Language cue | UML element |
|--------------|-------------|
| Common/improper noun | Class |
| Proper noun | Object instance |
| Collective noun | Class of grouped instances |
| Adjective | Attribute |
| Doing verb | Operation |
| Being verb | Class relationship |
| Having verb | Aggregation/association |
| Transitive verb | Operation |
| Intransitive verb | Exception |
| Predicate/descriptive phrase | Operation |
| Adverb | Attribute of relationship/operation |

**Quality checks:**
- Classes necessary and sufficient — no missing/extra classes, attributes, or methods

**Discard candidates:**
- **Redundant** — differ only in name
- **Irrelevant** — unrelated to system
- **Vague** — unclear meaning (system, software)
- **Attributes** misidentified as classes (author, title)
- **Operations** misidentified as classes (book search)
- **Roles** misidentified as classes
- **Implementation constructs** — not part of real-world problem

**Example:** Video rental — Customer, Video, Rental Item, Rental Invoice; associations with multiplicity; abstract Rental Item; generalization DVD/VHS/Video Game.

---

### 3.2.1 — Software Architecture, Patterns & MVC

**Software architecture:** How defining components are organized, assembled, communicate; constraints of whole system; input to development phase

**Advantages of explicit architecture:**
- Stakeholder communication
- System analysis (non-functional requirements)
- Large-scale reuse

**4+1 View Model (Kruchten):**

| View | Shows | Diagram type |
|------|-------|--------------|
| **Logical** | Key abstractions as objects/classes | Class, state |
| **Process** | Runtime interacting processes | Activity |
| **Development** | Software decomposition for development | Component, package |
| **Physical** | Hardware + software distribution | Deployment |
| **+1 Scenarios** | Ties views together | Use cases |

**Architectural pattern:** Stylized, tried-and-tested design practice; solution to recurring problem; includes when useful/not useful

#### MVC (Model-View-Controller)

Separates presentation/interaction from data handling logic.

| Component | Role |
|-----------|------|
| **Controller** | User input via URL; HTTP methods (GET/POST/PUT/DELETE); server-side logic; talks to Model and View |
| **Model** | Data logic; DB operations (SELECT/INSERT/UPDATE/DELETE); communicates with controllers |
| **View** | UI (HTML/CSS); dynamic values from controller; multiple views per controller |

**Routes:** `http://domainName/{controller}/{action}/{id}`

**Request flow:** User request → Controller → Model (fetch data) → Controller → View (render) → Response

**When used:** Multiple ways to view/interact with data; unknown future UI requirements

**Advantages:** Data and presentation change independently; same data in different views

**Disadvantages:** Extra complexity when model/interactions are simple

---

## Week 4 — Software Architecture Patterns

*Week 4 repeats MVC (4.1.1) and adds layered + other patterns.*

### 4.1.2 — Layered Architecture

**Problem with monolithic code:** No separation of concerns — UI, business logic, data access mixed; changing one component affects all.

**Layered architecture:** System organized into layers (abstract machines); each provides services; upper layers use lower layer services.

- **Closed layer** — only accessed by layer directly above; changes isolated
- **Open layer** — can be bypassed by upper layers (e.g., shared utilities for business layer); too many open layers weaken the pattern

**When used:**
- Building on existing systems
- Multi-team development (team per layer)
- Multi-level security requirements

**Advantages:** Easy replacement/addition of layers; isolated testing

**Disadvantages:** Clean separation difficult in practice; performance overhead from multiple interpretation levels; layer change may require app restart

---

### 4.2.1 — Repository, Client-Server, Pipe-and-Filter

#### Repository Pattern

- Central place where data is stored and accessed
- Subsystems exchange data via **shared central database/repository** (efficient for large shared data) vs explicit passing

**Formal definition:** Repository mediates between domain and data mapping; acts like in-memory domain object collection; clients submit query specifications declaratively.

**Example:** IDE (Eclipse) — editor, code generator, UML editor, compiler share design information repository

| When used | Advantages | Disadvantages |
|-----------|------------|---------------|
| Large volumes of long-term data; data-driven triggers | Components independent; consistent change propagation; centralized backup | Single point of failure; communication inefficiency; hard to distribute |

#### Client-Server Pattern

- **Server** provides services; **multiple clients** request services
- Network connects clients to stand-alone servers (print, data, etc.)

**Example:** Film/DVD library system

| When used | Advantages | Disadvantages |
|-----------|------------|---------------|
| Shared DB from many locations; variable load (replicated servers) | Servers distributed on network; shared general functionality | Each service = single point of failure; unpredictable performance (network dependent); multi-org management issues |

#### Pipe-and-Filter Pattern

- Stream of data through **filter** components connected by **pipes** (buffer/sync)
- Each filter: discrete, single transformation type

**Examples:** Compiler pipeline (lexical → parse → semantic → codegen); bioinformatics workflows; payment processing

| When used | Advantages | Disadvantages |
|-----------|------------|---------------|
| Batch/transaction data processing with separate stages | Easy to understand; transformation reuse; matches business workflows; sequential or concurrent | Agreed data transfer format required; parse/unparse overhead; hard to reuse incompatible structures |

---

### 4.2.2 — Git and GitHub (Lab supplement)

**Git:** Version control; track changes; local repository  
**GitHub:** Cloud remote repository; host, share, collaborate

**Key commands:** `git init`, `git clone`, `git add`, `git commit`, `git config user.name/email`  
**Branching:** `master`/`main`, `develop`, `feature` branches; merge workflow  
**Collaboration:** fork, pull request, resolve conflicts

---

## Week 5 — Design Patterns

### 5.1.1 — Design Patterns & Observer Pattern

**Design pattern:** Best-practice solution to recurring problems; obtained by trial and error over time

**Gang of Four (GoF, 1994):** Gamma, Helm, Johnson, Vlissides — 23 patterns in 3 categories

**GoF principles:**
- Program to an **interface**, not implementation
- Favor **object composition** over inheritance

**Pattern categories:**

| Category | Focus | Examples |
|----------|-------|----------|
| **Creational** | Object creation; hide creation logic | Singleton, Factory |
| **Structural** | Class/object composition | Adapter, Composite |
| **Behavioral** | Object communication/responsibility | Observer, Strategy |
| **J2EE** | Presentation tier (Sun Java Center) | MVC-related enterprise patterns |

#### Observer Pattern (Behavioral)

**Intent:** One-to-many dependency — when one object changes state, all dependents notified and updated automatically.

**Participants:**
- **Subject** — knows observers; notifies on state change (Celebrity, Teacher)
- **Observer** — updating interface for notified objects (Fan, Student)
- **ConcreteSubject / ConcreteObserver** — specific implementations

**Operations:** `attach()`, `detach()`, `notify()`, `update()`, `setState()`

**Examples taught:** Teacher-Student list; Celebrity-Fan following; Java `List<Fan>` implementation

---

### 5.2.1 — Singleton and Adapter Patterns

#### Singleton Pattern (Creational)

**Intent:** Ensure a class has **only one instance**; provide global access.

**Motivation:**
- Multiple instances → incorrect behavior (thread-specific) or resource waste (DB connection)
- Some classes need single instance (printer spooler, help desk)

**Implementation:**
- Private constructor; static `getInstance()`; lazy initialization (`if null then create`)
- Python: `__new__` override; Java: private static instance

**Lazy initialization:** Instance created only on first use — improves performance and memory

#### Adapter Pattern (Structural)

**Intent:** Convert interface of a class into another interface clients expect; lets incompatible classes work together. Also known as **Wrapper**.

**Two types:**

| Type | Mechanism | Can override adaptee? | Can adapt subclasses? |
|------|-----------|----------------------|----------------------|
| **Class Adapter** | Inheritance (`extends` + `implements`) | Yes | No |
| **Object Adapter** | Composition (holds adaptee instance) | No | Yes |

**Participants:**
- **Target** — interface Client uses (Pizza)
- **Client** — uses Target interface
- **Adaptee** — existing incompatible interface (ChittagongPizza)
- **Adapter** — bridges Adaptee to Target

**Example:** DhakaStylePizza implements Pizza directly; ChittagongPizza adapted via ChittagongClassAdapter or ChittagongObjectAdapter mapping `sausage()` → `toppings()`, `bread()` → `bun()`

---

## Week 6 — Testing & Software Quality

### 6.1.1 — Software Testing (Introduction)

**State of the art:**
- 30–85 errors per 1000 LOC during development
- Tested software: 0.5–3 errors per 1000 LOC
- 60% design errors, 40% implementation; 66% of design errors found only after operational
- Later discovery = exponentially higher fix cost

**Error → Fault (Bug) → Failure**

**Testing:** Evaluate system/components to verify specified requirements

**Who tests:** Software tester, developer, project lead, end user

**Classification by adequacy criterion:**
- Coverage-based, fault-based, error-based

**Classification by information source:**
- **Black-box** (functional, specification-based)
- **White-box** (structural, program-based)
- **Grey-box**

**Testing myths (summary):** Not too expensive; not always time-consuming; can start before full product; complete testing impossible; tested ≠ bug-free; testers aren't solely responsible for quality; automation not always appropriate; testing requires skill

**Testing levels:**

| Functional | Non-functional |
|------------|----------------|
| Unit | Performance (load, stress) |
| Integration (bottom-up, top-down) | Usability |
| System | Security |
| Regression | Portability |
| Acceptance (alpha, beta) | |

**TDD steps (XP):**
1. Add a test
2. Run all tests — see failure
3. Make small change to pass
4. Run all tests — see pass
5. Refactor

---

### 6.1.2 — Unit Testing

| Manual | Automated |
|--------|-----------|
| Users test software; track in spreadsheets | Developers/testers write and run test cases |

**Unit testing:** Automated; tests single component (method/function); narrow scope; **white-box**

**Analogy:** Teacher's question set = test setup; student calculation = actual result; expected answer = expected result; pass/fail comparison

**Test case components:** Setup/preconditions; test steps in test method; predefined expected result

---

### 6.2.1 — Software Quality

**Software quality:** Meets specification; subjective assessment by quality management team

**Quality attributes:** Safety, security, reliability, resilience, robustness, understandability, testability, adaptability, modularity, complexity, portability, usability, reusability, efficiency, learnability

**SQA three-prong approach:**
1. Organization-wide policies, procedures, standards
2. Project-specific tailoring from templates
3. Quality control — ensure procedures followed

**Standards:** ISO 9000-3, ANSI/IEEE; external verification possible

**SQA activities:** Technical methods; testing; enforcing standards; measurement; record keeping and reporting

---

## Week 7 — Software Metrics

### 7.1.1 — Cyclomatic Complexity (Path-Based / White-Box Testing)

**Control Flow Graph (CFG):**
- **Node** — sequential code, no branches
- **Directed edge** — branch/alternate path
- **Path** — trail of nodes linked by edges

**CFG rules:** 1 entry arc, 1 exit arc; every node has ≥1 entry and ≥1 exit; logical join nodes for multiple incoming edges

**White-box path testing steps:**
1. Draw CFG
2. Compute cyclomatic complexity **M**
3. Find **Basic Path Set** (≤ M independent paths)
4. Design test cases for each path

**Cyclomatic complexity formulas (equivalent):**
- `M = R + 1` (R = number of regions)
- `M = P + 1` (P = predicate nodes)
- `M = E − N + 2P` (E = edges, N = nodes, P = connected components)

**Independent path:** Executable path from start to end traversing at least one **unvisited** arc; set size ≤ M

**Example (find minimum in array):** M = 3; paths like `[1-2-6]`, `[1-2-3-5-2-6]`, `[1-2-3-4-5-2-6]` with test cases for array inputs

---

### 7.1.2 — Software Metrics Part 2

**Software measurement:** Numeric value for attribute of product or process; enables objective comparison

**Software metric examples:** LOC, Fog index, person-days, defect rates

**Product metrics:**
- **Dynamic** — measured at execution (efficiency, reliability)
- **Static** — measured from code representation (complexity, maintainability)

**Key metrics taught:**

| Metric | Meaning |
|--------|---------|
| **Fan-in / Fan-out** | Callers of a function / functions called by a function; high fan-in = tight coupling; high fan-out = complex control |
| **Length of code** | Size; larger → more error-prone |
| **Cyclomatic complexity** | Independent paths; lower = easier to modify |
| **Specialization Index (SIX)** | `(NMO × DIT) / (NMO + NMA + NMI)` — subclass override ratio; 0% for root; nominal 0–120% |
| **Defect Removal Efficiency (DRE)** | `E / (E + D)` — errors found before delivery vs after; avg ~85% |

---

## Week 8 — Refactoring & Documentation

### 8.2.1 — Refactoring and Code Smells

**Refactoring (Martin Fowler):** Small steps changing **internal structure** without changing **external behavior**; verify via testing, IDE tools, or careful analysis

**NOT refactoring:** Adding logging feature, switching auth to LDAP, eliminating duplication as a project — those are features/fixes; refactoring is continuous structure improvement

**Why refactor:**
- Deliver business value faster
- Improve design; minimize technical debt
- Maintain development speed; understandability; find bugs

**Two hats:** Adding function (new tests, new capabilities) vs Refactoring (no new features, restructure only)

**When to refactor:** Before adding functionality; to find bugs; during code reviews

**Advice:** First do no harm; baby steps

**Code smell:** Frequently occurring design problem; more specific than general guidelines ("loosely coupled")

**Common smells & remedies:**

| Smell | Remedy |
|-------|--------|
| Inappropriate naming | Rename method/variable |
| Comments (deodorant) | Extract method, rename, introduce assertion |
| Long method | Extract method, replace temp with query, decompose conditional |
| Long parameter list | Introduce parameter object, replace parameter with method, preserve whole object |
| Feature envy | Move field, move method, extract method |
| Duplicated code | Extract method, pull up field, form template method, substitute algorithm |
| Refused bequest | Push down field/method |

**Duplication levels:** Literal, semantic, data, conceptual, logical-steps

---

### 8.2.2 — Documentation

**Definition:** Materials providing information about particular software

**Types:**
- **Product documentation** — delivered product (system + user docs)
- **Process documentation** — development tracking (planning, schedules; short lifespan)

**System documentation subcategories:**
- UX documentation (personas, scenarios, user story maps, style guides)
- **Software Architecture Design (SAD)** — overview, design principles, user stories, solution details, UML diagrams, milestones
- Source code documentation (README, project structure, patterns, class definitions)
- QA documentation (test strategy, plan, cases, checklists)
- Maintenance/help guide (for IT)
- API documentation (endpoints, parameters, methods, outputs, OpenAPI)

---

## Lecture Source Files

| Week | File |
|------|------|
| 1 | `0.0 - Introduction to Software Engineering (No question in exam).pptx` |
| 1 | `1.1.1 Waterfall Process Model.pptx` |
| 1 | `1.1.2 V-Model.pptx` |
| 1 | `1.2.1 Incremental and Iterative Process Model .pptx` |
| 1 | `1.2.2 Spiral Model and CMMI.pptx` |
| 1 | `SDLC all Proces(Supporting slides).ppt` *(not machine-readable)* |
| 2 | `2.1.1 Agile All Topics.pptx` |
| 2 | `2.2.1 Requirements Engineering.pptx` |
| 2 | `2.2.2 UseCase.pptx` |
| 2 | `Agile development (Supporting slide).pptx` |
| 3 | `3.1.1 Class Diagram in UML.pptx` |
| 3 | `3.1.2 Class Diagram Design.pptx` |
| 3 | `3.2.1 Software Architecture, Software Pattern and MVC Pattern.pptx` |
| 4 | `4.1.1 Software Architecture.pptx` |
| 4 | `4.1.2 Layered Architecture.pptx` |
| 4 | `4.2.1 Repository, Client Server and Pipe n Filter Architecture.pptx` |
| 4 | `4.2.2 GitHub v1.pptx.pdf` |
| 5 | `5.1.1 Design Pattern and Observer Pattern_FZN.pptx` |
| 5 | `5.2.1 Singleton and Adapter Pattern_FZN.pptx` |
| 6 | `6.1.1 Software Testing.pptx` |
| 6 | `6.1.2 Unit Testing.pptx` |
| 6 | `6.2.1 Software Quality.pptx` |
| 7 | `7.1.1 Software Metrics Part 1 - Cyclomatic Complexity (Path Based Testing).pptx` |
| 7 | `7.1.2 Software Metrics Part 2.pptx` |
| 8 | `8.2.1 Refactoring and Code Smell - BRACU.pptx` |
| 8 | `8.2.2 Documentation.pptx` |

---

## Exam Preparation Quick Reference

### Process models — when to use which?

| Model | Best when |
|-------|-----------|
| **Waterfall** | Known reqs, small/short, stable tech |
| **V-Model** | Rigid reqs, testing emphasis early |
| **Incremental** | Known reqs, deliver slices early, medium project |
| **Iterative** | Uncertain reqs/tech, long/complex, refine quality |
| **Spiral** | High risk, large budget, research-heavy |
| **Agile/Scrum** | Changing reqs, rapid delivery, live systems |

### Verification vs Validation

- **Verification** = right way (process compliance)
- **Validation** = right product (meets customer need)

### UML relationships quick compare

| Diagram | Key relations |
|---------|---------------|
| Use case | Association, Include, Extend, Generalization |
| Class | Association, Aggregation ◇, Composition ◆, Generalization |
| MVC | Controller ↔ Model ↔ View |

### Architecture patterns

| Pattern | Core idea |
|---------|-----------|
| **MVC** | Separate UI, logic, data |
| **Layered** | Stacked services; closed vs open layers |
| **Repository** | Central shared data store |
| **Client-Server** | Services on servers, clients request |
| **Pipe-Filter** | Data stream through transformation filters |

### Design patterns

| Pattern | Type | One-line |
|---------|------|----------|
| **Observer** | Behavioral | Notify dependents on state change |
| **Singleton** | Creational | One instance, global access |
| **Adapter** | Structural | Bridge incompatible interfaces |

### Testing levels

Unit → Integration → System → Acceptance (Alpha/Beta)

### Cyclomatic complexity

`M = R + 1 = P + 1 = E − N + 2`; design ≤ M independent path test cases

### Key formulas

```
DRE = E / (E + D)

SIX = (NMO × DIT) / (NMO + NMA + NMI)
```

### Scrum ceremony questions (Daily Scrum)

1. What did you do yesterday?
2. What will you do today?
3. What obstacles are in your way?

---

*Generated from BRACU CSE470 lecture slides in `Coursework files/CSE 470 Content 2024....../`. Cross-reference Sommerville and Pressman textbooks for additional depth.*
