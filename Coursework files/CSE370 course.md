# CSE370 — Database Systems
## BRAC University | Full Course Plan, Lecture-by-Lecture Breakdown & CO Report

---

## 0. How to read this document

This report has two layers of information:

| Layer | Source | Notes |
|---|---|---|
| **Official data** — course title, prerequisite, course objectives, the 5 Course Outcomes (CO1–CO5) with their exact weights, textbook list, coordinators | BRACU CSE Dept. official course page (`cse.sds.bracu.ac.bd/course/view/CSE370`) | Reproduced in my own words below, not copy-pasted |
| **Constructed teaching plan** — week-by-week lecture topics, slide-by-slide breakdown, lab schedule, CO–PO mapping, assessment-weight split | Built by me, aligned to the official COs/objectives and to the actual chapter sequence BRACU uses in its own slide deck (confirmed from the official buX courseware page) | This is a **template/study plan**, not a leaked or copied instructor file. Your actual section's instructor may sequence things slightly differently — use this as a structured guide and cross-check with your section's own outline |

**On the "lecture drive link" request:** BRACU does not maintain one universal public Drive folder for CSE370 — slides are usually shared per-section via Google Classroom/TSR by the current instructor. The one public, official source is BRACU's **buX courseware platform**, which hosts the chapter-wise PDF slides. Direct links are in Section 5.

---

## 1. Course Snapshot

| Field | Detail |
|---|---|
| Course Code | CSE370 (Theory) + CSE370L (Lab, compulsory, 3 hrs/week) |
| Course Title | Database Systems |
| Credit Hours | 3.0 (Theory) |
| Prerequisite | CSE221 (Algorithms) |
| Department | Computer Science & Engineering, School of Data & Sciences, BRAC University |
| Course Coordinator | Najeefa Nikhat Choudhury |
| Lab Coordinator | Shoaib Ahmed Dipu |
| Delivery | 2 theory classes/week (≈1h20m each) + 1 lab session/week |
| Course Materials | Textbook + reference books, lecture slides, lab handouts, MySQL command-line/mini-server tool |

---

## 2. Course Rationale

Databases are the backbone of virtually every modern software system. CSE370 introduces students to relational database management systems (RDBMS) — how to **model** real-world data requirements, **design** an efficient and consistent relational schema, **query** that schema using SQL, and **optimize** storage and retrieval using indexing/hashing. The course pairs theory classes with a hands-on lab (CSE370L) where students build a complete database-backed application in a team.

---

## 3. Course Objectives (Official)

By the end of this course, the instructor aims to ensure students can:

1. Compare a DBMS-based approach against a traditional file-based system and explain why organizations adopt DBMSs.
2. Model real-world data requirements using the Entity-Relationship (ER) and Enhanced ER (EER) models.
3. Understand relational integrity constraints and how a DBMS enforces them.
4. Convert an ER/EER conceptual model into a relational schema.
5. Understand indexing and hashing and their role in efficient data retrieval.
6. Apply functional dependency theory and normalization to produce a well-structured, redundancy-minimized schema.
7. Write and execute SQL statements to define, manipulate, and query data.
8. Work in a team to design and implement a complete database application using SQL plus a programming language/UI layer.

---

## 4. Textbooks & Reference Materials

| # | Title | Author(s) | Edition | Publisher | ISBN |
|---|---|---|---|---|---|
| 1 (Primary) | *Fundamentals of Database Systems* | Elmasri & Navathe | 7th | Pearson | 978-0-13-397077-7 |
| 2 | *Database Systems: A Practical Approach to Design, Implementation, and Management* | Connolly & Begg | 6th | Pearson | 978-0-13-294326-0 |
| 3 | *Database System Concepts* | Silberschatz, Korth, Sudarshan | 6th | McGraw-Hill | 978-0-07-352332-3 |

### Official public slide source (buX courseware)
BRACU's recorded-lecture courseware page for CSE370 hosts the chapter slide decks used in its video lectures:

- Chapter 1 — Databases and Database Users
- Chapter 2 — Database System Concepts & Architecture
- Chapter 3 — ER Model
- Chapter 4 — EER Model
- ER Diagram Practice Sheet / EER Practice Sheet
- **— Mid-term —**
- Chapter 5 — Relational Data Model & Constraints
- Chapter 7 — ER/EER-to-Relational Mapping
- Chapter 10 — Normalization
- Chapter 8 — SQL Summary
- Practice sheets + solutions for Constraint Violation, Relational Mapping, Normalization, SQL

Platform: `bux.bracu.ac.bd` → search "CSE370" → "Lecture Slides" tab. (Requires a buX account; some assets are public PDFs.)

> For your **current semester's** Drive/Classroom folder, ask your course instructor or class representative — this is normally shared at the start of the semester and is section-specific.

---

## 5. Course Outcomes (CO) — Official, with Weights

| CO | Description (paraphrased from official outline) | Weight | Bloom's Level* |
|---|---|---|---|
| **CO1** | Explain core database management concepts and identify them within a given real-world scenario | 15% | Remember / Understand |
| **CO2** | Apply ER and EER modeling, schema design principles, and normalization to represent and optimize complex organizational data requirements | 35% | Apply / Analyze |
| **CO3** | Apply appropriate indexing and hashing techniques to optimize database performance | 12% | Apply |
| **CO4** | Implement standard SQL queries to store, retrieve, and manipulate data | 22% | Apply |
| **CO5** | Develop a database application as a team project, using SQL and a programming language, to solve a real data-management problem | 16% | Create |

*Bloom's levels are my standard OBE classification for this CO type — confirm exact levels in your section's official CO sheet if your university requires exact figures for accreditation paperwork.

---

## 6. CO → PO Mapping (Representative)

BRACU CSE follows an Outcome-Based Education (OBE) curriculum mapped to 12 standard engineering Program Outcomes (the typical Washington-Accord-style PO set used across Bangladeshi engineering OBE templates). Below is a **representative** mapping appropriate for a database course — verify exact numbers against your department's official CO–PO matrix if needed for accreditation use.

| PO | Description | CO1 | CO2 | CO3 | CO4 | CO5 |
|---|---|---|---|---|---|---|
| PO1 | Engineering knowledge | ✔ | ✔ | ✔ | ✔ | |
| PO2 | Problem analysis | | ✔ | ✔ | | |
| PO3 | Design / development of solutions | | ✔ | | | ✔ |
| PO4 | Investigation | | | | | |
| PO5 | Modern tool usage | | | ✔ | ✔ | ✔ |
| PO6 | Engineer & society | | | | | |
| PO7 | Environment & sustainability | | | | | |
| PO8 | Ethics | | | | | |
| PO9 | Individual & team work | | | | | ✔ |
| PO10 | Communication | | | | | ✔ |
| PO11 | Project management & finance | | | | | ✔ |
| PO12 | Life-long learning | | | | | ✔ |

---

## 7. Assessment Plan & CO Mapping (Typical Split)

> Exact percentages vary slightly by section/semester — confirm with your instructor's distributed course outline. This is the typical BRACU pattern.

### Theory (CSE370)

| Component | Weight | CO(s) Assessed |
|---|---|---|
| Attendance | 5% | — |
| Quizzes (best 3 of 4, unannounced) | 15% | CO1, CO2, CO4, CO3 (one quiz each, roughly) |
| Assignments (2–3, take-home) | 10% | CO2 (ER/EER + Normalization), CO4 (SQL) |
| Mid-Term Exam | 30% | CO1, CO2 |
| Final Exam (comprehensive, slightly cumulative) | 40% | CO2, CO3, CO4 |

### Lab (CSE370L — separate 1-credit course)

| Component | Weight | CO(s) Assessed |
|---|---|---|
| Lab exercises / quizzes | 30% | CO4 |
| SQL Lab Assignments (2–3) | 30% | CO4 |
| Group Project (proposal → design → implementation → demo → report) | 40% | CO5 (reinforces CO2, CO4) |

---

## 8. Full 14-Week Lecture Plan (28 Lectures), Slide-by-Slide

> Each lecture below is written as a usable slide outline (title slide → core content slides → summary/practice slide). Use it as a lecture-prep template or a self-study checklist.

### WEEK 1 — Introduction to Databases

**Lecture 1: Why Databases? (Ch.1)**
1. Title slide: Course intro, grading policy, lab structure overview
2. What is a database? What is a DBMS?
3. Typical examples of database applications (banking, airline, university, e-commerce)
4. File-based systems vs. database systems — limitations of file processing
5. Data redundancy & inconsistency in file systems
6. Difficulty in accessing data, data isolation, integrity problems
7. Atomicity, concurrent-access anomalies, security problems in file systems
8. How a DBMS solves each of the above
9. Brief historical evolution of database systems (hierarchical → network → relational → NoSQL, one slide)
10. Summary + discussion question (CO1)

**Lecture 2: Actors & Components (Ch.1 cont'd)**
1. Recap of Lecture 1
2. Actors on the scene: DBA, designers, end-users (casual, naive, sophisticated), application programmers
3. Workers behind the scene: system designers/developers, tool developers, operators/maintenance staff
4. Advantages of using a DBMS (controlling redundancy, restricting unauthorized access, persistent storage, efficient query processing, backup/recovery, multiple interfaces, relationships representation, integrity constraints, concurrency control)
5. When NOT to use a DBMS (simple, well-defined apps; no multi-user access; real-time constraint systems; embedded systems with no DBMS need)
6. Self-check quiz-style questions (CO1)

---

### WEEK 2 — Database System Architecture

**Lecture 3: Data Models & Schemas (Ch.2)**
1. Recap + agenda
2. Data Models: categories — high-level/conceptual, representational, low-level/physical
3. Schemas vs. instances; schema diagrams vs. schema constructs
4. Database state and valid states
5. The Three-Schema Architecture: external, conceptual, internal levels
6. Data independence: logical and physical
7. Mapping between schema levels
8. Example walkthrough using a university database

**Lecture 4: DBMS Architecture & Classification (Ch.2 cont'd)**
1. DBMS languages: DDL, DML, VDL, SDL
2. DBMS interfaces: menu-based, forms-based, GUI, natural language, parametric
3. Centralized vs client-server DBMS architecture
4. Classification of DBMSs: by data model (relational, NoSQL, object, hierarchical), by number of users (single vs multi-user), by number of sites (centralized vs distributed)
5. Brief intro to NoSQL/NewSQL as future context (1 slide)
6. Wrap-up + transition into ER modeling next week

---

### WEEK 3 — The Entity-Relationship (ER) Model, Part 1

**Lecture 5: Entities, Attributes & Keys (Ch.3)**
1. Why conceptual modeling — bridging real-world requirements and schema design
2. Entities and entity sets
3. Attributes: simple vs composite, single-valued vs multi-valued, stored vs derived
4. NULL values and their meaning
5. Complex attributes (composite + multivalued combinations)
6. Keys: candidate key, primary key, super key
7. Value sets (domains) of attributes
8. Worked example: "STUDENT" entity with attributes and key

**Lecture 6: Relationships & Structural Constraints (Ch.3 cont'd)**
1. Relationship types, relationship sets, relationship instances
2. Degree of a relationship (unary, binary, ternary)
3. Role names and recursive relationships
4. Attributes of relationship types
5. Structural constraints: cardinality ratio (1:1, 1:N, M:N)
6. Participation constraints: total vs partial
7. Notation for constraints (min,max) pairs
8. Worked example: STUDENT–COURSE enrollment relationship

---

### WEEK 4 — ER Model, Part 2 + Practice

**Lecture 7: Weak Entities & ER Notation (Ch.3 cont'd)**
1. Weak entity types vs strong/regular entity types
2. Partial key (discriminator) and identifying relationship
3. ER diagram notation — Chen notation vs. Crow's Foot/UML-style notation
4. Naming conventions for entities, attributes, relationships
5. Common design pitfalls (fan trap, chasm trap — brief intro)
6. Full worked ER diagram for a small case (e.g., COMPANY database)

**Lecture 8: ER Modeling Practice Session**
1. Recap of ER concepts
2. Case Study 1 — practice converting a requirements paragraph into an ER diagram
3. Case Study 2 — identifying weak entities and recursive relationships
4. Group activity: draw ER diagram for a "Library Management" scenario
5. Common mistakes review
6. **Quiz 1 (CO1 + early CO2)**

---

### WEEK 5 — The Enhanced ER (EER) Model

**Lecture 9: Specialization & Generalization (Ch.4)**
1. Motivation: limitations of basic ER for hierarchical/overlapping classes
2. Subclasses and superclasses
3. Attribute inheritance
4. Specialization (top-down) vs Generalization (bottom-up)
5. Specialization/generalization lattice (multiple inheritance) — brief
6. Worked example: EMPLOYEE → {SECRETARY, ENGINEER, TECHNICIAN}

**Lecture 10: Constraints on Specialization/Generalization, Union Types (Ch.4 cont'd)**
1. Disjoint (OR) vs overlapping constraint
2. Total (mandatory) vs partial specialization
3. Combined constraint notations: disjoint/total, overlap/partial, etc.
4. Union type (category) — modeling a subclass of a union of superclasses
5. Aggregation vs association (brief conceptual distinction)
6. Complete EER diagram example: university or hospital database

---

### WEEK 6 — EER Practice + Relational Model Intro

**Lecture 11: EER Practice Session (Assignment 1 due — CO2)**
1. Recap of EER constructs
2. Case study: design EER for a "Hospital Management" scenario including categories
3. Peer-review of sample diagrams
4. Q&A / common misconceptions
5. **Assignment 1 due** — ER/EER conceptual design submission

**Lecture 12: The Relational Model (Ch.5)**
1. Why relational model — informal vs formal terms (table/row/column ↔ relation/tuple/attribute)
2. Relation schema vs relation state
3. Domain, degree, cardinality
4. Relational model notation
5. Characteristics of relations: no duplicate tuples, order of tuples/attributes is immaterial, atomic attribute values
6. Worked example translating an ER diagram informally into table form

---

### WEEK 7 — Relational Constraints + Mid Review

**Lecture 13: Relational Database Constraints (Ch.5 cont'd)**
1. Domain constraints
2. Key constraints: super key, candidate key, primary key
3. NULL value constraints
4. Entity integrity constraint
5. Referential integrity constraint & foreign keys
6. Semantic (business rule) constraints
7. Worked examples of each constraint type on a COMPANY schema

**Lecture 14: Update Operations, Violations & Mid-Term Review**
1. Update operations: Insert, Delete, Modify
2. Constraint violations possible with each operation
3. Strategies for handling violations: reject, cascade, set-null, set-default
4. Full worked "practice constraint-violation" problem set
5. **Mid-term review**: consolidated recap of Ch.1–5 (CO1 + CO2 focus)
6. Sample mid-term style questions

> ### 🔹 MID-TERM EXAMINATION (covers Lectures 1–14 / Ch.1–5) — Tests CO1, CO2

---

### WEEK 8 — Relational Algebra

**Lecture 15: Unary Relational Operations**
1. Why relational algebra — formal query language foundation for SQL
2. SELECT (σ) operation — syntax and examples
3. PROJECT (π) operation — syntax and examples
4. RENAME (ρ) operation
5. Sequences of operations, and using temporary relations
6. Worked queries on a COMPANY database

**Lecture 16: Set Operations, Joins & Division**
1. UNION, INTERSECTION, SET DIFFERENCE — type compatibility requirement
2. CARTESIAN PRODUCT (×)
3. JOIN: theta-join, equi-join, natural join (⋈)
4. Outer joins: left, right, full (conceptual intro before SQL)
5. DIVISION operation
6. Mapping relational algebra expressions to natural-language queries (practice)

---

### WEEK 9 — ER/EER-to-Relational Mapping

**Lecture 17: Mapping Algorithm, Steps 1–4 (Ch.7)**
1. Why mapping — going from conceptual (ER/EER) to logical (relational) design
2. Step 1: Mapping regular (strong) entity types
3. Step 2: Mapping weak entity types
4. Step 3: Mapping binary 1:1 relationship types
5. Step 4: Mapping binary 1:N relationship types
6. Worked example for each step on COMPANY ER diagram

**Lecture 18: Mapping Algorithm, Steps 5–7 + EER Mapping**
1. Step 5: Mapping binary M:N relationship types
2. Step 6: Mapping multivalued attributes
3. Step 7: Mapping n-ary relationship types
4. Mapping EER model constructs: specialization options (a) single table with type attribute, (b) one table per subclass, (c) supertype + subtype tables with FK
5. Mapping union types/categories
6. End-to-end mapping exercise: full EER diagram → complete relational schema

---

### WEEK 10 — SQL: DDL & Basic DML

**Lecture 19: SQL Data Definition (Ch.8 / Ch.6)**
1. Introduction to SQL — history, standard, role in RDBMS
2. CREATE TABLE — column definitions, data types (INT, VARCHAR, DATE, DECIMAL, etc.)
3. Constraints in CREATE TABLE: PRIMARY KEY, FOREIGN KEY, NOT NULL, UNIQUE, CHECK, DEFAULT
4. ALTER TABLE — add/drop/modify column, add/drop constraint
5. DROP TABLE, TRUNCATE TABLE
6. Live demo: creating a small schema (e.g., Bank database) in MySQL

**Lecture 20: Basic SQL Queries**
1. INSERT INTO — single-row and multi-row inserts
2. UPDATE — with WHERE clause
3. DELETE — with WHERE clause, cascading effects
4. Basic SELECT–FROM–WHERE structure
5. Comparison operators, logical operators (AND/OR/NOT), BETWEEN, IN, LIKE, IS NULL
6. ORDER BY, DISTINCT
7. In-class live query practice on sample DB

---

### WEEK 11 — SQL: Aggregation, Joins, Subqueries

**Lecture 21: Aggregate Functions & Grouping (Assignment 2 due — CO4)**
1. Aggregate functions: COUNT, SUM, AVG, MIN, MAX
2. GROUP BY clause
3. HAVING clause vs WHERE clause (filtering groups vs rows)
4. Combining GROUP BY, HAVING, ORDER BY
5. Worked examples: "average salary per department," "count of orders per customer"
6. **Assignment 2 due** — SQL query set submission

**Lecture 22: Joins & Subqueries**
1. INNER JOIN syntax and semantics
2. LEFT / RIGHT / FULL OUTER JOIN
3. Self-join examples (e.g., employee–supervisor)
4. Subqueries: nested queries in WHERE, FROM, SELECT clauses
5. Correlated subqueries
6. EXISTS, NOT EXISTS, IN, ANY, ALL operators
7. Practice problem set comparing join vs subquery solutions to the same problem

---

### WEEK 12 — SQL: Set Operations, Views, Triggers

**Lecture 23: Set Operations, Views & Schema Modification**
1. UNION, INTERSECT, EXCEPT/MINUS in SQL
2. CREATE VIEW — purpose (security, simplification, logical data independence)
3. Updatable vs non-updatable views
4. ALTER TABLE revisited in context of schema evolution
5. Renaming tables/columns
6. Practice: creating a view that simplifies a multi-join report query

**Lecture 24: Triggers, Stored Procedures & Assertions (Quiz on CO4)**
1. Triggers — event-condition-action model, BEFORE/AFTER triggers
2. Use cases for triggers (auditing, enforcing business rules, maintaining derived data)
3. Brief intro to stored procedures/functions
4. Assertions (general constraints) — concept and limited support in practice
5. **Quiz** covering SQL (CO4)
6. Recap of full SQL module

---

### WEEK 13 — Functional Dependencies & Normalization

**Lecture 25: Functional Dependency Theory (Ch.10)**
1. Why normalization — redundancy, update/insert/delete anomalies recap
2. Functional Dependency (FD) — definition and notation
3. Inference rules for FDs (Armstrong's Axioms: reflexivity, augmentation, transitivity)
4. Additional rules: union, decomposition, pseudo-transitivity
5. Closure of a set of FDs, closure of an attribute set
6. Finding candidate keys using FD closure

**Lecture 26: Normal Forms (Assignment 3 due — CO2)**
1. First Normal Form (1NF) — atomicity requirement
2. Second Normal Form (2NF) — full functional dependency, partial dependency removal
3. Third Normal Form (3NF) — transitive dependency removal
4. Boyce-Codd Normal Form (BCNF) — stricter key-based requirement
5. Decomposition properties: lossless-join decomposition, dependency preservation
6. Worked example: normalizing an unnormalized table step-by-step to BCNF
7. **Assignment 3 due** — Normalization problem set

---

### WEEK 14 — Indexing, Hashing & Wrap-Up

**Lecture 27: Indexing Structures**
1. Why indexing — efficient data retrieval motivation (CO3)
2. Single-level ordered indexes: primary index, clustering index, secondary index
3. Multi-level indexes
4. Dynamic multilevel indexes using B-trees and B+-trees
5. Index selection trade-offs (read-heavy vs write-heavy workloads)
6. Worked example: building a B+-tree index step by step

**Lecture 28: Hashing & Course Wrap-Up (Quiz on CO3)**
1. Internal hashing techniques
2. External hashing for disk files
3. Static hashing vs dynamic/extendible hashing
4. Comparing indexing vs hashing for different query types
5. **Quiz** covering indexing & hashing (CO3)
6. Full course recap mapped against CO1–CO5
7. Final-exam guidance + project presentation schedule announcement

> ### 🔹 FINAL EXAMINATION (comprehensive, weighted toward Ch.5–10 i.e. CO2, CO3, CO4) — and reading week / project presentations as scheduled by the department

---

## 9. Lab Plan (CSE370L) — 12 Sessions

| Lab # | Focus | Maps to CO |
|---|---|---|
| 1 | Lab orientation; DB environment setup (MySQL Workbench / mini-server); CREATE/INSERT basics | CO4 |
| 2 | Basic SELECT–FROM–WHERE practice; filtering, sorting | CO4 |
| 3 | JOIN practice on a sample "Bank" database | CO4 |
| 4 | Aggregate functions & GROUP BY practice; Lab Homework 1 | CO4 |
| 5 | Subqueries & nested query practice; Lab Homework 2 | CO4 |
| 6 | Views & Triggers practice; **Project group formation + proposal due** | CO4, CO5 |
| 7 | **Project Milestone 1**: ER/EER diagram submission & review | CO2, CO5 |
| 8 | **Project Milestone 2**: Relational schema + normalization check submission | CO2, CO5 |
| 9 | **Project Milestone 3**: Schema implementation (DDL) + sample data population | CO4, CO5 |
| 10 | **Project Milestone 4**: Core query/CRUD implementation, complex query testing | CO4, CO5 |
| 11 | **Project Milestone 5**: Front-end/UI integration (PHP/Python/Java + DB connector) | CO5 |
| 12 | **Final Project Demo, Presentation & Report submission** | CO5 |

---

## 10. Group Project Guidelines (CO5)

A typical CSE370L project (3–5 person team) runs through these phases:

1. **Proposal** — pick a real-world domain (e.g., hospital, e-commerce, library, ride-sharing, hotel booking) and define scope/requirements.
2. **Conceptual Design** — full ER/EER diagram capturing entities, relationships, constraints, specialization where relevant.
3. **Logical Design** — map ER/EER to a relational schema; apply normalization (target at least 3NF/BCNF) and justify any deliberate denormalization.
4. **Implementation** — create the schema in MySQL/PostgreSQL, populate with realistic sample data, write all core CRUD queries plus several complex queries (joins, subqueries, aggregates, views, at least one trigger).
5. **Application Layer** — connect a simple front-end/UI (web or desktop) to the database to demonstrate real usage.
6. **Demo & Report** — live demo to the lab instructor + a written report covering requirements, ER/EER diagrams, schema (with normalization justification), sample queries, and screenshots of the working app.

---

## 11. CO Attainment Summary (How Grades Map Back to COs)

| CO | Theory Assessment Sources | Lab Assessment Sources | Overall Weight |
|---|---|---|---|
| CO1 | Quiz 1, Mid-term (partial) | — | 15% |
| CO2 | Assignment 1 & 3, Mid-term (partial), Final (partial) | Project Milestones 1–2 | 35% |
| CO3 | Quiz (Lecture 28), Final (partial) | — | 12% |
| CO4 | Assignment 2, Quiz (Lecture 24), Final (partial) | Lab exercises, Project Milestones 3–4 | 22% |
| CO5 | — | Full Group Project | 16% |

CO attainment is typically calculated as: *(average normalized score across all assessment items mapped to that CO) ≥ target threshold (commonly 50–60%)*, per BRACU's OBE attainment policy — confirm the exact threshold/method with your course coordinator.

---

## 12. Sources

- BRACU CSE official course page — `https://cse.sds.bracu.ac.bd/course/view/CSE370`
- BRACU buX courseware (lecture slides, chapter PDFs) — `https://bux.bracu.ac.bd` (search "CSE370")
- *Fundamentals of Database Systems*, Elmasri & Navathe, 7th ed. (chapter structure used as the backbone of the weekly plan)

---

*This report is a structured study/teaching plan built around BRACU's official CSE370 objectives and Course Outcomes. Always cross-check week-by-week pacing, exact assessment weights, and the current semester's Drive/Classroom link with your own section's instructor, since these are set per-semester and may differ from the typical pattern described here.*
