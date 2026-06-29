# CSE471 — System Analysis and Design — Course Study Guide

> **Course:** CSE471 — System Analysis and Design  
> **Institution:** BRAC University, Department of Computer Science & Engineering  
> **Coordinator:** Dr. Muhammad Iqbal Hossain  
> **Textbook:** *Systems Analysis and Design* — Dennis, Wixom, Roth (5th ed. cited in lectures; 8th ed. provided in course files)  
> **Source:** `Coursework files/CSE471 Contents/` (14 lecture PPTX + textbook PDFs)  
> **Purpose:** Concept-level study notes — what was **taught in lectures**, organized by topic. Not full slide/textbook content.

---

## Table of Contents

1. [Course at a Glance](#1-course-at-a-glance)
2. [SDLC Phase Map](#2-sdlc-phase-map)
3. [Lecture 01 — Introduction & SDLC](#lecture-01--introduction--sdlc)
4. [Lecture 02 — Feasibility Analysis](#lecture-02--feasibility-analysis)
5. [Lecture 03 — Requirements Determination](#lecture-03--requirements-determination)
6. [Lecture 04 — UML Use Case & Activity Diagrams](#lecture-04--uml-use-case--activity-diagrams)
7. [Lecture 04.01 — Use Case Extended (Include & Extend)](#lecture-0401--use-case-extended-include--extend)
8. [Lecture 05 — Sequence Diagrams](#lecture-05--sequence-diagrams)
9. [Lecture 06 — Component Diagrams](#lecture-06--component-diagrams)
10. [Lecture 07 — Data Flow Diagrams](#lecture-07--data-flow-diagrams)
11. [Lecture 08 — Data Store Design](#lecture-08--data-store-design)
12. [Lecture 09 — Program Design](#lecture-09--program-design)
13. [Lecture 10 — User Interface Design](#lecture-10--user-interface-design)
14. [Lecture 11 — Documentation, Deployment & Release Management](#lecture-11--documentation-deployment--release-management)
15. [Lecture 12 — Software Ethics](#lecture-12--software-ethics)
16. [Supplementary — State Machine Diagrams](#supplementary--state-machine-diagrams)
17. [Textbook Chapters vs Lectures](#textbook-chapters-vs-lectures)
18. [UML Diagram Quick Reference](#uml-diagram-quick-reference)
19. [Key Formulas & Economic Concepts](#key-formulas--economic-concepts)

---

## 1. Course at a Glance

### What this course teaches

- How to **analyze business problems** and design **information systems (IS)** that create organizational value
- The **Systems Development Life Cycle (SDLC)** and when to use different development methodologies
- **Requirements engineering** — elicitation, specification, and analysis strategies
- **Modeling techniques:** Use Case, Activity, Sequence, Component, State Machine, and Data Flow Diagrams
- **Design deliverables:** UI design, program design (structure charts), data storage design
- **Implementation concerns:** documentation, deployment, release management, software ethics

### Why systems analysis matters (lecture emphasis)

- ~**45%** of software errors originate in **requirements and design** (not coding)
- Fixing requirements errors **after delivery** can cost up to **100×** more than catching them during analysis
- Large IT projects frequently fail: ~30% cancelled, ~50% over budget by 200%+, many deliver <60% of planned functionality

### Information System (IS) components

- **Hardware** — physical devices
- **Software** — programs processing data
- **Databases** — organized stored data
- **Networks** — connectivity between systems
- **Procedures** — rules for combining components to produce output

---

## 2. SDLC Phase Map

| Phase | Core question | Key deliverables taught |
|-------|---------------|-------------------------|
| **Planning** | Why build the system? | System request, feasibility study, work plan |
| **Analysis** | Who, what, when, where? | Requirements definition, use cases, DFDs, analysis models, system proposal |
| **Design** | How will the system work? | Architecture, UI, database, program specs, structure charts, physical models |
| **Implementation** | System delivery | Construction, testing, training, conversion, documentation, deployment |

### SDLC attributes (taught)

- Moves **systematically through phases** with standard outputs (deliverables)
- Uses **gradual refinement** — each phase adds detail
- Deliverables from one phase feed into the next

---

## Lecture 01 — Introduction & SDLC

**Textbook alignment:** Ch. 1 (Systems Analyst & IS Development), partial Ch. 2  
**Segments:** System Analysis intro → Software lifecycle → DevOps → Project team roles

### Segment 1: What is System Analysis and Design?

**Systems Development Life Cycle (SDLC)**
- Process of determining how an IS supports business needs, designing it, building it, and delivering it to users
- Four phases: **Planning → Analysis → Design → Implementation**

**Role of the Systems Analyst**
- Analyzes the business situation
- Identifies improvement opportunities
- Designs IS to implement improvements
- Acts as a **change agent** — trains and motivates others to use new systems
- Primary goal: create **value** for the organization (often = increased profit)
- Works closely with all project team members

**Systems Analyst skills**
- **Technical skills** — understand existing and new technology; integrate solutions
- **Business skills** — apply IT to business processes; ensure real business value
- **Analytical skills** — continuous problem solving at project and organizational level

**What is Systems Analysis?**
- Collection of **notations, methodologies, and tools** to gather and analyze a problem before design/implementation
- Also called **requirements analysis**
- Must ensure: meets **user needs**, deliverable **on time**, updatable **inexpensively**
- Common pitfalls: ill-defined situations, ambiguities, inconsistencies, mixing requirements with design

**Key ideas**
- Failed systems often result from building without understanding the organization
- Value creation is the central objective

### Segment 2: Software Lifecycle

**Major SDLC phase activities**

| Phase | Activities taught |
|-------|-------------------|
| **Planning** | Identify business value; analyze feasibility; develop work plan; staff project; control/direct project |
| **Analysis** | Determine analysis strategy; study existing system; collect/analyze requirements; develop new system concept; create analysis models; prepare system proposal; Go/No-Go decision |
| **Design** | Determine design strategy (build/buy/outsource); design architecture, interface, database, programs; assemble system specification; Go/No-Go decision |
| **Implementation** | Construction; programming & testing; installation; training; conversion; ongoing support |

**Methodology**
- Formalized approach or series of steps to implement SDLC
- Categories: **process-centered**, **data-centered**, **object-oriented**
- Need: code without design fails for large systems

**Development methodologies taught**
- Structured Design
- Waterfall Development
- Parallel Development
- Rapid Application Development (RAD)
- Phased Development
- Prototyping (regular and throwaway)
- Agile Development
- Extreme Programming (XP)
- **DevOps**

### Segment 3 & 4: DevOps

**Definition**
- **Culture + practices** combining Development (Dev) and Operations (Ops) for faster, more reliable, higher-quality software delivery

**Problems DevOps solves**
- Dev and Ops historically worked in isolation
- Testing/deployment happened late and slowly
- Manual deployment caused human errors
- Misaligned timelines between teams

**DevOps approach**
- Developers package code in **containers** (lightweight software environments)
- Ops runs the container — works as expected across environments

**DevOps lifecycle steps**
1. **Plan** — gather monitoring feedback; implement improvements
2. **Code** — developers write code
3. **Build** — compile/package application
4. **Test** — automated testing (e.g., Selenium)
5. **Release** — manage scheduling across environments
6. **Deploy** — execute on servers
7. **Operate** — users run the application
8. **Monitor** — track uptime and performance

**Continuous practices**
- Continuous Development, Testing, Integration, Deployment, Monitoring

**DevOps advantages**
- Reduced product failure risk
- Improved flexibility and support
- Faster time to market
- Better team efficiency
- Clearer product vision

**DevOps challenges**
- Integration difficulties
- Automated testing complexity
- Relatively high costs
- Toolset selection
- Talent shortage

### Segment 5: Project Team Roles

**IS roles taught**
- **Business analyst**
- **Systems analyst**
- **Infrastructure analyst**
- **Change management analyst**
- **Project manager**

---

## Lecture 02 — Feasibility Analysis

**Textbook alignment:** Ch. 1 — Project Initiation, System Request, Feasibility Analysis

### Identifying Business Value

**Why projects start**
- Create business value through information technology
- Common business needs: lower cost, increase revenue, improve customer service, adopt emerging tech

**Tangible vs intangible value**
- **Tangible** — quantifiable (e.g., 2% cost reduction, 5% sales increase)
- **Intangible** — important but hard to measure (e.g., better customer service, competitive position)

### System Request

**Purpose**
- Brief summary of a **business need**
- Explains how the proposed system creates **business value**

**Key stakeholders**
- **Project sponsor** — initiates project; primary business contact; wants system to succeed
- **Approval committee** — reviews proposals; approves/declines/suspends projects

**Elements of a system request**

| Element | What it covers |
|---------|----------------|
| **Project sponsor** | Person/group initiating the project |
| **Business need** | Business reason for the system |
| **Business requirements** | New/enhanced capabilities the system will provide |
| **Business value** | Expected benefits (quantified where possible) |
| **Special issues/constraints** | Deadlines, security clearance, seasonal needs, etc. |

### Feasibility Analysis

**Purpose**
- Guides Go/No-Go decision
- Identifies **risks** that must be managed if approved
- Assesses three areas: **technical**, **economic**, **organizational**

### Technical Feasibility — *Can we build it?*

- Familiarity with the **application**
- Knowledge of the **business domain**
- Familiarity with **technology**
- Whether it extends existing firm technologies
- **Project size** (people, time, features)
- **Compatibility** with existing technology

### Economic Feasibility — *Should we build it?*

**Cost-benefit analysis steps**
1. Identify costs and benefits
2. Assign values
3. Calculate cash flow and ROI

**Cost types**
- **Development costs** — servers, licenses, labor, etc.
- **Operational costs** — ongoing hardware, software, labor

**Benefit types**
- **Tangible benefits** — measurable savings/revenue
- **Intangible benefits** — harder to quantify

**Financial metrics taught**

| Metric | Concept |
|--------|---------|
| **Present Value (PV)** | Future cash flow discounted by interest rate: `PV = Cash flow / (1 + rate)^n` |
| **Net Present Value (NPV)** | `NPV = PV(Total Benefits) − PV(Total Costs)` |
| **Return on Investment (ROI)** | Money received vs money invested; high ROI = benefits exceed costs; can be per-year or total project |
| **Break-even point** | When cumulative returns match amount invested; longer break-even = higher risk |

**Break-even calculation method taught**
1. Find number of years of **negative cumulative cash flow** (N)
2. Check if benefit exists in the initial year — if not, adjust N

### Organizational Feasibility — *If we build it, will they come?*

- Will **users accept** the system?
- Will it be **incorporated** into the organization?

**Assessment methods**
1. **Strategic alignment** — does project fit business strategy?
2. **Stakeholder analysis** — identify anyone affected by the system
   - Project champion(s)
   - Organizational management
   - System users

---

## Lecture 03 — Requirements Determination

**Textbook alignment:** Ch. 3 — Requirements Determination  
**Note:** Slides list interview/JAD segments; detailed interview/JAD content is in textbook Ch. 3 §80–96. Lecture emphasized specification types and analysis strategies.

### Analysis Phase objectives

- Refine system request into detailed **requirements definition**
- Produce **functional models**, **structural models**, **behavioral models**
- Output: **system proposal** with revised feasibility analysis and work plan

### Requirements Specification

**What is a requirement?**
- Statement of what the system must do OR characteristics it must have

**Requirement types taught**

| Type | Description |
|------|-------------|
| **Business requirements** | What the business needs |
| **User requirements** | What users need to do |
| **Functional requirements** | What the software should do (processes + information provided) |
| **Nonfunctional requirements** | Quality attributes, constraints, external interfaces |
| **System requirements** | How the system should be built |

**Functional requirements**
- Processes the system performs to support user tasks
- Information provided as users perform tasks

**Nonfunctional requirement categories**

| Category | Examples taught |
|----------|-----------------|
| **Operational** | Runs on Android; integrates with inventory; browser-compatible |
| **Performance** | Interaction ≤ 2 seconds; 24/7 availability; 300 concurrent users 9–11 AM |
| **Security** | Role-based access; virus safeguards |
| **Cultural & political** | Currency rules; company hardware policy; GDPR compliance |

### Requirements Elicitation Techniques (listed)

1. **Interviews**
2. **JAD sessions** (Joint Application Design)
3. **Questionnaires**
4. **Document analysis**
5. **Observation**

*Principle:* Understand current business processes and new-system needs **before** design.

### Requirements Analysis Strategies

| Strategy | Concept | Limitation / use |
|----------|---------|------------------|
| **Problem analysis** | Ask users for problems and solutions | Incremental improvements only; rarely high business value |
| **Root cause analysis** | Users list prioritized problems + root causes; analyst investigates solutions | Finds common root causes across problems |
| **Duration analysis** | Compare time per process step vs total process time | Large gap = fragmented process; solutions: integration or parallelization |
| **Activity-based costing (ABC)** | Calculate cost per process step (direct + indirect) | Focus improvement on most costly steps |
| **Informal benchmarking** | Study how other orgs perform same process | Common for customer-facing processes |
| **Technology analysis** | List interesting technologies; identify business applications | Innovation-driven improvement |
| **Activity elimination** | Ask what happens if each activity is eliminated; use "force-fit" | Challenges unnecessary work |

**Comparing strategies** — evaluate by: potential business value, project cost, breadth of analysis, risk

---

## Lecture 04 — UML Use Case & Activity Diagrams

**Textbook alignment:** Ch. 4 (Use Cases); Activity diagrams supplementary (Whitten et al. reference)  
**Reference:** Whitten et al., *Systems Analysis and Design Methods* 7e

### UML Introduction

- **Unified Modeling Language** — standardized notation for software stakeholders
- Originated at Rational Software (1994–95)
- Tools: Rational Rose, Microsoft Visio, Draw.io

### Use Case Diagrams

**Purpose**
- Requirements analysis tool
- Identifies **uses** (actions) of the system in context of a **case** (scenario)
- Action verbs in requirements → candidate use cases

**Four components**
1. **Actor**
2. **Use case**
3. **System boundary**
4. **Relations**

**Actor types**

| Type | Description | Example |
|------|-------------|---------|
| **Primary actor** | Performs main system functions | Ride-sharing rider |
| **Secondary actor** | Administrative functions | Discount manager |
| **External hardware** | Hardware device in application | Amazon datastore |
| **Other system** | External interacting system | Payment gateway |

**Use case rules**
- Unique name; starts with **principal verb**
- Represented by **ellipse**
- Enclosed inside **system boundary** (rectangle)
- Connected to actor(s) or other use cases

**Relation types**

| Relation | Meaning | Notation |
|----------|---------|----------|
| **Association** | Actor uses a use case | Solid line, no arrow |
| **Generalization** | Parent-child (actors or use cases) | Hollow arrow to parent |
| **Include** | Base use case **requires** included functionality | `<<include>>`; arrow to completing use case first |
| **Extend** | Optional additional behavior on base use case | `<<extend>>`; arrow to base use case |

**Creating use case diagrams — steps**
1. Identify actors
2. Identify use cases (what actors need from system)
3. Find common functionality → `<<include>>`
4. Generalize actors/use cases where possible
5. Mark optional functions → `<<extend>>`

### Use Case Description (tabular)

**Fields taught**
- Use case name, ID, priority
- Actor(s)
- **Trigger** — external or temporal event starting the use case
- **Preconditions** — system state before execution
- **Normal course** ("happy path") — major steps, inputs, outputs
- **Alternative courses** — successful branches off normal path
- **Postconditions** — final products; may become preconditions for next use case
- **Exceptions** — errors leading to unsuccessful results
- **Summary inputs/outputs** — major I/O with sources/destinations

### Activity Diagrams

**Purpose**
- **Behavior diagram** — sequential and parallel activities in a process
- Models: business processes, workflows, data flows, complex algorithms
- Better than use cases alone for complex multi-party processes

**Key notations**

| Element | Meaning |
|---------|---------|
| **Initial node** | Flow start (filled circle); may have multiple |
| **Final node** | Flow end; first final node reached stops all flows |
| **Action** | Single non-decomposed step; waits for all inputs |
| **Decision node** | Splits flow based on **guards** on outgoing edges |
| **Merge node** | Joins alternate flows (not synchronization) |
| **Fork node** | Splits into **concurrent** flows |
| **Join node** | Synchronizes concurrent flows |
| **Object node** | Classifier instance available at a point in the activity |
| **Note** | Comments; no semantic force |
| **Swimlanes** | Show where activities occur (by actor, class, or use case) |

**Activity modeling guidelines**
- Most valuable for **complex, multi-party** processes
- Level 0 = high abstraction; decompose in level 1, 2, etc.
- Keep action abstraction levels consistent within one diagram
- Swimlanes partition by actor, class, or use case

---

## Lecture 04.01 — Use Case Extended (Include & Extend)

**Focus:** Deeper treatment of dependency relationships

### `<<include>>` relationship

- Simplifies large use cases by splitting or extracting **common behavior**
- **Mandatory** — base use case is **incomplete** without included use case
- Used when two or more use cases share common functionality

### `<<extend>>` relationship

- **Optional** additional functionality
- May be restricted by **constraints** (e.g., amount > 50,000 OR age > 55)
- Extending use case **depends on** base use case
- Base use case must be **meaningful on its own**

### Arrow placement rule

- Arrow points to the use case that **completes first**
- Include: book ride → confirm ride (arrow at book ride)
- Extend: finish ride → give review (arrow at finish ride; review is optional)

---

## Lecture 05 — Sequence Diagrams

**Textbook alignment:** Behavioral modeling (supplementary to Ch. 4/9)  
**Type:** Dynamic / interaction diagram

### Core concepts

- Illustrates objects participating in a **use case**
- Shows **sequence of messages** over time for one scenario
- Models a **single scenario** executing in the system
- Also called **System Sequence Diagram (SSD)** when system is treated as black box

### Diagram structure

- **Horizontal dimension** — participating objects
- **Vertical dimension** — message order in time
- Messages may be numbered for concurrency

### Object lifespan notation

| Notation | Meaning |
|----------|---------|
| **Lifeline** | Vertical dashed line for object existence |
| **Activation bar** | Rectangle on lifeline — object is active |
| **Create message** | Object life starts |
| **Deletion (X)** | Object life ends |
| **Return message** | Dashed arrow back |

### Building a sequence diagram — steps

1. Determine context (which use case/scenario)
2. Identify participating objects
3. Set lifeline for each object
4. Add messages in time order
5. Add execution occurrences (activation bars)
6. Validate the diagram

### Advanced: alternate / if-else

- **Alt frames** — only one branch executes based on condition
- Multiple if-else conditions can be nested in frames

---

## Lecture 06 — Component Diagrams

**Textbook alignment:** Related to Ch. 7 — Architecture Design  
**Type:** Structural UML diagram

### Purpose

- Model **software components** and their **dependencies**
- Physical/static implementation view — files, modules, deployable units
- Shows high-level components and **interfaces**

### What is a component?

- **Modular, replaceable** unit with well-defined interfaces
- **Autonomous** within the system
- Has **provided** and **required** interfaces
- Internals **encapsulated** (hidden)
- Can be software, hardware, or business unit

### Component notation

- Rectangle with `<<component>>` stereotype
- Stereotypes: `<<entity>>`, `<<subsystem>>`, `<<table>>`, `<<library>>`
- Icon-based notation variants

### Component elements

| Element | Description |
|---------|-------------|
| **Interface** | Declared operations (no implementation); provided or required |
| **Provided interface** | Services the component offers (ball notation) |
| **Required interface** | Services the component needs (socket notation) |
| **Usage dependency** | Client requires supplier; dashed arrow with `<<use>>` |
| **Port** | Distinct interaction point; public (on boundary) or private (inside) |
| **Connector** | Links components through interfaces |

### Connector types

| Type | Description |
|------|-------------|
| **Assembly connector** | Ball-and-socket; one component provides what another requires |
| **Delegation connector** | Links external contract to internal component; forwards signals |

### Where to use

- Model system components
- Model source code structure
- Model executable releases
- Model physical databases
- Model adaptable systems
- **Nested components** — delegation connectors + ports for internal structure

---

## Lecture 07 — Data Flow Diagrams

**Textbook alignment:** Ch. 4 — Data Flow Diagrams (Process Models)

### Logical vs physical models

| Model | Description |
|-------|-------------|
| **Logical** | Nontechnical; what system does (essential/conceptual/business model) |
| **Physical** | Technical; what system does AND how it is implemented |

### What is a DFD?

- Diagrams **business processes** and **data** passing among them
- Describes to-be system interactions with environment
- **Logical DFD** — processes without implementation detail
- **Physical DFD** — adds implementation information

### Four basic symbols

| Symbol | Name | Rules taught |
|--------|------|--------------|
| **Process** | Work/transform on data (Gane-Sarson shape) | Named: **verb + object**; responds to events |
| **Data flow** | Data in motion | Named noun; must start/end at a process |
| **Data store** | Data at rest (file/database) | Stores instances of data entities (from ERD) |
| **External agent/entity** | Outside person, unit, system, org | Defines system **boundary/scope** |

**Additional concepts**
- **Composite data flow** — one logical flow containing multiple data elements
- **Control flow** — non-data trigger; use sparingly
- **Data flow packet** — related data travels as one flow
- **Diverging flow** — one flow splits to multiple destinations
- **Converging flow** — multiple flows merge into one packet

### Common DFD errors (taught)

- Processes without inputs or outputs
- Data flows that don't connect to processes
- Unnamed flows
- Two-headed arrows
- Too many/few processes per diagram

### DFD hierarchy & decomposition

| Level | Description |
|-------|-------------|
| **Context diagram (Level 0 / Process 0)** | Single process "black box"; external agents; top-level inputs/outputs |
| **Level 0 DFD** | Major processes; inter-process flows; data stores; external entities |
| **Level 1 DFD** | One diagram per Level 0 process; child processes wholly compose parent |
| **Level 2+ DFD** | Further decomposition until **primitive** (single-purpose) processes |

**Numbering convention**
- Context = Process **0**
- Level 0 = integers (1, 2, 3…)
- Level 1 = `parent.child` (1.1, 1.2…)
- Level 2 = `1.1.1`, `1.1.2`…

**Balancing**
- Child DFD must show same data flows/stores as parent — consistency across levels

### DFD creation process

1. Build **context diagram** (external entities + major inflows/outflows)
2. Identify major processes
3. Create **DFD fragments** per event/use case
4. Merge fragments into **Level 0**
5. Decompose to Level 1, 2, … as needed
6. **Validate** with users

### DFD validation checklist (taught)

**Processes:** unique verb-phrase name + number; ≥1 input AND ≥1 output; 3–7 processes per diagram  
**Data flows:** unique noun name; connects to ≥1 process; one direction only  
**Data stores:** unique noun; ≥1 input flow AND ≥1 output flow (across all pages)  
**External entities:** unique noun; ≥1 input or output flow

---

## Lecture 08 — Data Store Design

**Textbook alignment:** Ch. 10 — Data Storage Design (slides cite 5th ed. Ch. 11)

### Introduction

**Data storage design goals**
- Select data storage **format**
- Convert **logical data model** → **physical data model**
- Ensure **DFDs and ERDs balance**
- Optimize processing **efficiency**

### Data storage formats

**Files**
- Electronic lists optimized for particular transactions
- Often **sequentially** organized
- Records linked by **pointers** (linked lists)

**File types taught**

| Type | Purpose |
|------|---------|
| **Master file** | Core application information |
| **Look-up file** | Static reference values |
| **Transaction file** | Data to update master files |
| **Audit file** | Before/after images of changes |
| **History/archive file** | Past transactions |

**Databases**
- Collection of related information groupings
- Managed by **DBMS**

**Database types taught**

| Type | Key concept |
|------|-------------|
| **Relational** | Tables with PK/FK; SQL; referential integrity; most common |
| **Object** | Objects with attributes + behaviors; encapsulation; reuse |
| **Multidimensional** | Data warehousing; DSS; data marts |
| **NoSQL** | Cloud-scale; non-relational — document (MongoDB), wide-column (Cassandra), graph DBs |

**Selecting storage format** — compare strengths/weaknesses by: data complexity, application type, existing formats, future needs

### Logical → Physical data models

| Model | Purpose |
|-------|---------|
| **Conceptual ERD** | Business requirements; entities/relationships; no DB design yet |
| **Logical ERD** | More detail; optional column types for analysis (not DB creation) |
| **Physical ERD** | DBMS-specific blueprint; data types, PKs, FKs, constraints; avoid reserved words |

**Metadata** — data about data (documents structure, types, constraints)

### Optimizing data storage

**Two dimensions**
1. **Storage efficiency**
2. **Access speed**

**Storage efficiency**
- Minimize redundant data and null values
- **Normalization** — primary technique

**Access speed techniques**
- **Denormalization** — combine tables for faster reads (4 reasons taught in slides)
- **Clustering** — store related records physically together
  - Intrafile: similar records in same table
  - Interfile: records from multiple tables retrieved together
- **Indexing** — mini-table mapping column values to locations; adds storage overhead
- **Volumetrics** — estimate storage needs for hardware planning
  1. Calculate raw data size
  2. Add DBMS overhead
  3. Record initial records + expected monthly growth

---

## Lecture 09 — Program Design

**Textbook alignment:** Ch. 9 — Program Design

### Introduction

**Program design** — determine what programs to write; create instructions for programmers

**Deliverables**
- **Physical DFDs** — logical DFDs modified with implementation decisions
- **Structure chart** — program module hierarchy
- **Program specifications** — detailed coding instructions

### Physical Data Flow Diagram

- Shows **how** processes will be implemented (programs, files, databases, manual steps)
- Created by refining logical DFD with technology choices

### Structure Chart

**Purpose**
- Hierarchical view of code modules showing:
  - **Sequence** — order of invocation
  - **Selection** — conditions for invoking modules
  - **Iteration** — repeated modules

**Example flow taught (GPA listing)**
1. Get student grade records
2. Calculate current GPA
3. Calculate cumulative GPA
4. Print listing

**Syntax elements**
- Modules (boxes)
- Control connections (calls)
- **Couples** — data passed between modules

### Design guidelines

**Cohesion** — how closely lines within a module relate (worst → best)

| Type | Description |
|------|-------------|
| Coincidental | Random unrelated tasks grouped |
| Logical | Tasks by category; selected by flags |
| Temporal | Tasks done at same time (e.g., init) |
| Procedural | Sequential steps |
| Communicational | Tasks on same data |
| Sequential | Output of one = input of next |
| **Functional** | **Best** — all parts serve one task |

**Fan-in**
- Number of control modules calling a subordinate
- **High fan-in = good** (module reused in many places)

**Fan-out**
- Number of subordinates called by one control module
- **Limit to ~7** — avoid high fan-out

### Program Specification

**Four essential components**
1. Program information
2. Events
3. Inputs and outputs
4. **Pseudocode** — detailed outline of code logic

---

## Lecture 10 — User Interface Design

**Textbook alignment:** Ch. 8 — User Interface Design

### Introduction

**Interface design** — defining how system interacts with external entities

**Three fundamental UI parts**
1. **Navigation** — user tells system what to do
2. **Input** — system captures information
3. **Output** — system provides information

**GUI** — windows, menus, icons (most common)

### UI design principles

- **Layout** — organized screen structure
- **Content awareness** — user knows where they are
- **Aesthetics** — pleasing appearance
- **User experience / usage level** — appropriate for user skill
- **Consistency** — same patterns across screens and sections
- **Minimize user effort** — reduce keystrokes and cognitive load
- **Density** — avoid overcrowded forms

### UI design process (5 iterative steps)

1. **Use scenario development** — narrative steps users perform (tied to DFD)
2. **Interface standards design** — template for all screens/forms/reports
3. **Interface design prototyping** — storyboards, HTML prototypes, language prototypes
4. **Interface evaluation** — heuristic, walk-through, interactive, formal usability testing
5. *(Organize interface / understand users — implied in textbook integration)*

**Interface template defines**
- Names for major **interface objects**
- Names for common **interface actions**
- **Interface icons** for objects, actions, status

### Navigation design

**Principles**
- Assume users have **not** read manual or attended training
- Controls clear, intuitive placement
- **Prevent mistakes** — good labels, limit choices, confirm irreversible actions
- **Simplify recovery** — undo where possible
- **Consistent grammar** — e.g., Windows **object-action** order

**Window Navigation Diagram (WND)** — maps screen-to-screen flow

### Input design

**Goal** — capture accurate information simply and easily

**Principles taught**
- **Minimize keystrokes** — don't ask for retrievable data; use lists over typing; default frequent values
- Various input field types for different data

### Output design

**Goal** — present information accurately with least effort

**Principles**
- **Understand report usage** — design for how reports are actually used
- **Manage information load** — avoid overload
- **Minimize bias** — especially in graphs and summaries

---

## Lecture 11 — Documentation, Deployment & Release Management

**Textbook alignment:** Ch. 11 (Implementation — documentation, testing); deployment/release supplementary

### Implementation phase overview

- Develop and test software
- Finalize **system documentation** and **user documentation**
- Analyst manages programming process and designs **tests**

### Documentation types

| Type | Audience | Purpose |
|------|----------|---------|
| **System documentation** | Programmers, analysts | Understand, build, maintain system |
| **User documentation** | End users | Operate the system |

**Online documentation strengths**
- Simpler searching
- Different representations (hyperlinks, multimedia)
- User interaction
- Lower cost

### Documentation requirements

- Enable team communication
- Information repository for maintenance engineers
- Support management activities
- Describe operation and administration for users
- Created **before** code (design docs) and **after** code (user manuals)

### Process vs product documentation

| Category | Examples | Lifespan |
|----------|----------|----------|
| **Process docs** | Planning, cost, schedule, standards | Short; internal; some migrate to product docs |
| **Product docs — system** | Requirements spec, architecture, detailed design, commented source, test plans, V&V, known bugs | Evolves with product |
| **Product docs — user** | End-user docs, system administrator docs | Must match target audience |

**Five areas for formal software release**
1. Functional description
2. Installation instructions
3. Introductory manual
4. Reference manual
5. System administrator's guide

### Document quality & structure

- Professional writing matters
- Consistent structure across product documents
- **IEEE standard** for user documentation (structure superset)
- Best practices: cover page, chapters/sections, index, glossary
- **Online docs** supplement (not replace) paper; always current on web
- Storage: file system + metadata DB, or CMS (CVS, Subversion)

### System deployment

**Post-development activities**
- Configuration, release, installation, updating, adapting, reconfiguration, uninstallation

**Traditional deployment models**
- **Foot-and-hand** — manual install; small client base only; expensive
- **Self-service** — users install themselves; scales well; hard for complex setups

**Deployment strategies**

| Strategy | Description |
|----------|-------------|
| **Direct ("Cold Turkey")** | Old system off, new system on immediately |
| **Parallel** | Old and new run simultaneously |
| **Phased** | Roll out incrementally by location/group/function |
| **Structured** | Combination approach with planned stages |

**Good deployment solution requirements**
- Incremental updates, versioning, automatic install/config
- Centralized inventory, decentralized control
- Security, scalability, heterogeneous support, live updates, licensing

**Software deployment lifecycle**

| Producer side | Customer side |
|---------------|---------------|
| Release, Retire | Install, Activate, Deactivate, Reconfigure, Update, Adapt, Remove |

**Windows deployment challenges**
- Reliable, effective, automated, targeted, upgradeable, removable, secure

### Software versioning

| Version | Description |
|---------|-------------|
| **Alpha** | Incomplete; internal testing; dummy data |
| **Beta** | Stable enough for extended end-user testing; real data |
| **Production** | Formally released to all users |

### Release management

**Definition**
- Planning, building, testing, deploying hardware/software
- Version control and storage
- Ensures consistent, tested deployments; reduces rollout incidents

**Goals**
- Mitigate SDLC risk
- Align all teams
- Streamline development/release
- Meet deadlines consistently
- Align dev goals with business goals

**Release cycle phases**
- **Design** — architecture of new ICT service
- **Build** — compile components
- **Test** — internal technical testing
- **Acceptance testing** — functionality validation

**Release policy elements**
1. Roles & responsibilities
2. Levels of authority
3. Identification & packaging
4. Release unit (full vs delta)
5. Release numbering
6. Release frequency
7. Emergency change procedures
8. Business-critical times & risks

**Key roles**
- **Release manager** — pace and resources for rollouts
- **Product owner** — requirements and acceptance criteria
- **Quality manager** — testing oversight
- **DevOps team** — full feature lifecycle

---

## Lecture 12 — Software Ethics

**Presenter:** Md. Aquib Azmain (Lecturer, CSE, BRAC University)  
**Textbook alignment:** Professional practice (supplementary)

### Introduction

**Software ethics** — decisions respecting user privacy, fairness, and societal benefit

Involves:
- Adhering to professional codes
- Navigating ethical dilemmas
- Understanding impact of unethical practices

### Need for software ethics

- Software quality is **critical to society** (air traffic, nuclear systems, etc.)
- Quality depends on engineers' **ethics and professional conduct**

### ACM Code of Ethics

**Moral imperatives**
- Contribute to society and human well-being
- Avoid harm
- Be honest and trustworthy

**Professional responsibilities**
- Strive for excellence
- Maintain confidentiality
- Respect intellectual property

**Professional leadership**
- Lead by example
- Promote public knowledge
- Mentor younger professionals

### IEEE Code of Ethics (8 principles)

Public · Client and Employer · Product · Judgment · Management · Profession · Colleagues · Self

**Responsibilities to the public**
- Public safety and welfare
- Environmental considerations
- Public understanding of technology

**Responsibilities to clients and employers**
- Confidentiality
- Conflict of interest
- Quality assurance

**Responsibilities to the profession**
- Professional development
- Professional conduct
- Support for colleagues

### Impact of unethical practices

- **Legal consequences** — lawsuits, fines, criminal charges (e.g., GDPR violations)
- **Reputational damage**
- Harm to users and society

### Ethical decision-making models

| Model | Focus |
|-------|-------|
| **Consequence-based** | Choose action with most good / least harm |
| **Duty-based** | Follow professional duties regardless of outcome |
| **Virtue-based** | Align actions with character and virtues |

---

## Supplementary — State Machine Diagrams

**File:** `Lecture xx State Machine Diagram.pptx`  
**Type:** Behavioral UML diagram

### Concepts taught

**Definition**
- Depicts **states** an object may be in and **transitions** between states
- Also: state-transition diagrams, state diagrams
- UML 2.4: **behavioral** vs **protocol** state machines

**Notations**

| Element | Description |
|---------|-------------|
| **State** | Round-cornered rectangle |
| **Initial state** | Filled black circle |
| **Final state** | Circle with dot inside |
| **Transition** | Arrowed line; may have trigger, guard, effect |
| **Event/trigger** | Noteworthy occurrence causing state change |
| **Guard** | Condition that must be true for transition |
| **Self-transition** | Returns to same state (often with effect) |
| **Entry/exit actions** | Actions on entering/leaving state |
| **Substates (composite state)** | Nested states within parent |
| **Concurrent states** | Parallel state regions |

### Steps to draw

1. Identify all states for selected object over its lifetime
2. Identify transition sequence between states
3. Label transitions with triggers; add guards where needed

**Practice domains taught:** digital music download (tune states), bank account, campus housing apartment, user account lifecycle (created → verified → active → suspended → cancelled)

---

## Textbook Chapters vs Lectures

| Textbook Ch. | Title | Covered in lecture? |
|--------------|-------|---------------------|
| **1** | Systems Analyst & IS Development | ✅ L01, L02 |
| **2** | Project Selection & Management | ⚠️ Partial (roles, methodologies in L01) |
| **3** | Requirements Determination | ✅ L03 (strategies); elicitation detail in textbook |
| **4** | Use Cases & Process Models (DFD) | ✅ L04, L07 |
| **5** | Data Modeling (ERD, Normalization) | ❌ No dedicated lecture — study from textbook |
| **6** | Moving into Design (Build/Buy/Outsource) | ❌ Not lectured |
| **7** | Architecture Design | ⚠️ Partial via L06 (component diagrams) |
| **8** | User Interface Design | ✅ L10 |
| **9** | Program Design | ✅ L09 |
| **10** | Data Storage Design | ✅ L08 |
| **11** | Moving into Implementation | ⚠️ Partial via L11 (documentation, testing refs) |
| **12** | Transition to New System (Conversion) | ⚠️ Partial via L11 (deployment strategies) |
| **13** | Agile Development (Scrum) | ❌ Not lectured (Agile/DevOps intro in L01 only) |

---

## UML Diagram Quick Reference

| Diagram | Type | Primary use taught |
|---------|------|-------------------|
| **Use Case** | Structural/behavioral | Requirements; actors & system functions |
| **Activity** | Behavioral | Business processes, workflows, parallelism |
| **Sequence** | Behavioral (dynamic) | Object interactions over time for one scenario |
| **Component** | Structural | Software modules, interfaces, dependencies |
| **State Machine** | Behavioral | Object state lifecycle and transitions |
| **DFD** | Process model | Data flows, processes, stores, external entities |
| **Structure Chart** | Program design | Module hierarchy, cohesion, fan-in/out |
| **WND** | UI design | Screen navigation flow |

---

## Key Formulas & Economic Concepts

```
Present Value (PV) = Cash Flow / (1 + interest_rate)^n

NPV = Σ PV(Benefits) − Σ PV(Costs)

ROI = (Gain from Investment − Cost of Investment) / Cost of Investment

Break-even = point where cumulative (discounted) benefits = cumulative costs
```

**Feasibility decision framework**
- **Technical** → Can we build it?
- **Economic** → Should we build it? (NPV, ROI, break-even)
- **Organizational** → Will they use it? (alignment + stakeholders)

---


## Lecture Source Files

| # | File |
|---|------|
| 01 | `Lecture 01 Introduction and SDLC.pptx` |
| 02 | `Lecture 02 Feasibility Analysis.pptx` |
| 03 | `Lecture 03 Requirements Determination.pptx` |
| 04 | `Lecture 04 UML Use case and Activity.pptx` |
| 04.01 | `Lecture 04.01_Use case_extended.pptx` |
| 05 | `Lecture 05 Design with Sequence.pptx` |
| 06 | `Lecture 06 Component Diagram updated.pptx` |
| 07 | `Lecture 07 Data flow diagram.pptx` |
| 08 | `Lecture 08 Data Store Design.pptx` |
| 09 | `Lecture 09 Program Design.pptx` |
| 10 | `Lecture 10 UI Design.pptx` |
| 11 | `Lecture 11 Documentation, Deployment and release management.pptx` |
| 12 | `Lecture 12 Software Ethics.pptx` |
| Supp. | `Lecture xx State Machine Diagram.pptx` |

## Practice Scenarios from Lectures

- **Use cases:** ATM (PIN, transactions, admin); course management (BSc/MSc, advising, payments); Bangladeshi courier service; hospital reception; bank customer/NFRC customer
- **Activity diagrams:** Parcel shipping; order management; SAF authorization (Tk. 10,000 threshold); student assistance fund
- **Sequence diagrams:** Patient appointment; vending machine; university food ordering (SearchEngine, StudentCart)
- **Component diagrams:** Life Care Hospital; WebStore subsystem; hospital management with Security/Synchronization
- **DFDs:** Food ordering; payroll; patient information; taxi fare estimation (L1/L2 decomposition)
- **State machine:** Apartment lifecycle; user account (created → verified → active → suspended → cancelled)

## Exam Preparation Tips

1. **Draw diagrams from scenarios** — use cases, activity, sequence, DFD (context → L0 → L1), component, state machine
2. **Distinguish similar concepts** — include vs extend; merge vs join; logical vs physical DFD/ERD; cohesion types
3. **Write use case descriptions** — normal course, alternatives, exceptions, pre/postconditions
4. **Feasibility math** — PV, NPV, ROI, break-even with multi-year cash flows
5. **DFD rules** — balancing, numbering, validation checklist
6. **Structure chart quality** — cohesion ranking, fan-in/out limits
7. **UI principles** — navigation, input minimization, output bias
8. **Ethics** — ACM/IEEE principles and decision models
9. **Self-study textbook gaps** — Ch. 5 (ERD/normalization), Ch. 6 (acquisition), Ch. 12 (conversion), Ch. 13 (Scrum)

---

*Generated from BRACU CSE471 lecture slides in `Coursework files/CSE471 Contents/`. For full depth, cross-reference Dennis, Wixom & Roth textbook and in-class examples.*
