# 📘 REPORT 01: DATABASE MANAGEMENT SYSTEMS
## As Taught at the World's Best Universities
### MIT · Stanford · CMU · Berkeley · Harvard · Cambridge

---

> **Series:** World-Class CS / AI / ML Curriculum Deep-Dive  
> **Report:** 01 of 12  
> **Research Date:** May 2026  
> **Depth Level:** 🟢 Intro → 🟡 Intermediate → 🔴 Advanced → 🟣 PhD  
> **Cross-reference:** Links to all source syllabi are listed in Section 10

---

## TABLE OF CONTENTS

1. [Course Overview & Context](#1-course-overview--context)
2. [University Comparison Matrix](#2-university-comparison-matrix)
3. [Prerequisites Map](#3-prerequisites-map)
4. [Full Topic Tree](#4-full-topic-tree)
5. [Chapter-by-Chapter Breakdown](#5-chapter-by-chapter-breakdown)
6. [Practical Labs & Projects](#6-practical-labs--projects)
7. [Tools, Languages & Platforms](#7-tools-languages--platforms)
8. [Key Textbooks & Papers](#8-key-textbooks--papers)
9. [AI-Era Additions (2024–2026)](#9-ai-era-additions-20242026)
10. [Career Relevance & Industry Map](#10-career-relevance--industry-map)
11. [Research Sources & Links](#11-research-sources--links)

---

## 1. COURSE OVERVIEW & CONTEXT

### What is Database Management?

A **Database Management System (DBMS)** is software that enables users to define, create, maintain, and control access to a database. The academic course on DBMS goes far beyond SQL — it is a deep engineering discipline covering how data is stored on disk, how queries are executed and optimized, how multiple users access data concurrently without corruption, and how data survives system failures.

At the world's top universities, the DBMS course is considered a **core systems course** — alongside operating systems and computer networks — because it teaches foundational principles of storage, concurrency, fault tolerance, and query languages that apply across virtually all modern computing systems.

### Why It Matters in the AI Era (2025–2026)

The AI boom has massively expanded the importance of database knowledge:

- **LLMs retrieve knowledge from databases** via RAG (Retrieval-Augmented Generation)
- **Vector databases** (Pinecone, Weaviate, Milvus, pgvector) are now a core AI infrastructure component
- **Feature stores** for ML pipelines are purpose-built databases
- **Data warehouses and lakehouses** (Snowflake, Databricks, BigQuery) are where ML training data lives
- **Streaming databases** (Apache Kafka + Flink) feed real-time AI systems
- Every AI product team needs engineers who understand **query optimization, transactions, and distributed data**

> As of 2026, vectors are no longer a specific database *type* — they have become a specific data *type* integrated into multimodel databases. Understanding classical DBMS is the prerequisite to understanding this evolution.

---

## 2. UNIVERSITY COMPARISON MATRIX

| Topic Area | MIT 6.5830 | CMU 15-445 | Stanford CS245 | Berkeley CS186 | Harvard | Cambridge MPhil |
|------------|:---------:|:---------:|:--------------:|:--------------:|:-------:|:---------------:|
| Relational Model & Algebra | ✅ Deep | ✅ Deep | ✅ Deep | ✅ Deep | ✅ | ✅ |
| SQL (Basic to Advanced) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Schema Design & Normal Forms | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Storage Engines & Buffer Pools | ✅ | ✅ Deep | ✅ | ✅ | ⬜ | ✅ |
| Indexing (B-Trees, Hash) | ✅ | ✅ Deep | ✅ | ✅ | ⬜ | ✅ |
| Query Processing & Execution | ✅ Deep | ✅ Deep | ✅ | ✅ | ✅ | ✅ |
| Query Optimization & Cost Est. | ✅ Deep | ✅ Deep | ✅ | ✅ | ⬜ | ✅ |
| Transaction Processing & ACID | ✅ Deep | ✅ Deep | ✅ | ✅ | ✅ | ✅ |
| Concurrency Control | ✅ Deep | ✅ Deep | ✅ | ✅ | ⬜ | ✅ |
| Recovery & Logging (ARIES) | ✅ | ✅ Deep | ✅ | ✅ | ⬜ | ✅ |
| Distributed Databases | ✅ | ✅ | ✅ Deep | ✅ | ⬜ | ✅ |
| NoSQL & Key-Value Stores | ✅ | ✅ | ✅ | ✅ | ⬜ | ✅ |
| Vector Databases | ✅ (new) | ✅ (new) | ⬜ | ⬜ | ⬜ | ⬜ |
| Streaming Databases | ✅ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| Semester-Long Build Project | ✅ | ✅ (BusTub) | ⬜ | ✅ | ⬜ | Research |

**Legend:** ✅ = Covered | ✅ Deep = Deep focus / dedicated lectures | ⬜ = Not covered / optional

### Depth Comparison

```
MIT 6.5830    ████████████████████  Research-paper based, graduate level
CMU 15-445   ████████████████████  Implementation focused, build a DBMS from scratch  
Stanford CS245  ██████████████████  Architecture & design focus
Berkeley CS186  ████████████████    Broad coverage, excellent labs
Harvard          ████████████        Broader CS, less DBMS depth
Cambridge        ████████████████    Theoretical, formal methods
```

---

## 3. PREREQUISITES MAP

```
REQUIRED BEFORE TAKING DATABASE SYSTEMS:
╔══════════════════════════════════════════════════════╗
║  Introduction to Algorithms (MIT 6.006 equivalent)   ║
║  ├─ Sorting, searching, hashing                      ║
║  ├─ B-trees & balanced tree structures               ║
║  └─ Time/space complexity analysis                   ║
╠══════════════════════════════════════════════════════╣
║  Computer Systems / Systems Programming              ║
║  ├─ Memory management (stack, heap, pointers)        ║
║  ├─ File I/O and disk operations                     ║
║  └─ Processes, threads, and synchronization          ║
╠══════════════════════════════════════════════════════╣
║  Programming Proficiency                             ║
║  ├─ MIT 6.5830: Go (taught in course)                ║
║  ├─ CMU 15-445: C++17 (required, not taught)         ║
║  ├─ Berkeley CS186: Java                             ║
║  └─ Stanford CS245: No heavy coding required         ║
╠══════════════════════════════════════════════════════╣
║  Basic Discrete Mathematics                          ║
║  ├─ Set theory (for relational algebra)              ║
║  ├─ Logic (for query optimization proofs)            ║
║  └─ Probability (for cost estimation)                ║
╚══════════════════════════════════════════════════════╝
```

---

## 4. FULL TOPIC TREE

```
DATABASE MANAGEMENT SYSTEMS
├── MODULE 1: FOUNDATIONS
│   ├── 1.1 History of Data Management
│   ├── 1.2 Data Models Overview
│   │   ├── Hierarchical
│   │   ├── Network
│   │   ├── Relational (dominant)
│   │   ├── Object-Relational
│   │   ├── Document (NoSQL)
│   │   ├── Key-Value (NoSQL)
│   │   ├── Graph
│   │   └── Vector (AI-era)
│   ├── 1.3 DBMS Architecture (ANSI/SPARC 3-tier)
│   └── 1.4 Database vs File System
│
├── MODULE 2: RELATIONAL MODEL & SQL
│   ├── 2.1 Relational Algebra
│   │   ├── Selection (σ)
│   │   ├── Projection (π)
│   │   ├── Join (⋈)
│   │   ├── Union, Intersection, Difference
│   │   ├── Division
│   │   └── Aggregation & Grouping
│   ├── 2.2 Tuple Relational Calculus
│   ├── 2.3 Domain Relational Calculus
│   ├── 2.4 SQL: Basic Queries
│   │   ├── SELECT, FROM, WHERE
│   │   ├── GROUP BY, HAVING, ORDER BY
│   │   └── JOIN types (INNER, LEFT, RIGHT, FULL, CROSS)
│   ├── 2.5 SQL: Advanced Features
│   │   ├── Subqueries and CTEs (WITH clause)
│   │   ├── Window Functions (OVER, PARTITION BY, RANK)
│   │   ├── Triggers
│   │   ├── Views and Materialized Views
│   │   └── Stored Procedures and Functions
│   └── 2.6 SQL: Data Definition
│       ├── CREATE, ALTER, DROP
│       ├── Integrity constraints (PK, FK, UNIQUE, CHECK)
│       └── Indexes (CREATE INDEX)
│
├── MODULE 3: DATABASE DESIGN
│   ├── 3.1 Entity-Relationship (ER) Modeling
│   │   ├── Entities, Attributes, Relationships
│   │   ├── Cardinality (1:1, 1:N, M:N)
│   │   ├── Weak Entities
│   │   ├── ISA Hierarchies (generalization/specialization)
│   │   └── ER-to-Relational Mapping
│   ├── 3.2 Enhanced ER (EER) Diagrams
│   ├── 3.3 Functional Dependencies
│   │   ├── Armstrong's Axioms (Reflexivity, Augmentation, Transitivity)
│   │   ├── Closure of a set of FDs
│   │   └── Canonical cover / minimal cover
│   └── 3.4 Normalization Theory
│       ├── 1NF — Atomic values
│       ├── 2NF — No partial dependencies
│       ├── 3NF — No transitive dependencies
│       ├── BCNF (Boyce-Codd Normal Form)
│       ├── 4NF — Multi-valued dependencies
│       └── 5NF — Join dependencies
│
├── MODULE 4: STORAGE & INDEXING
│   ├── 4.1 Storage Hardware
│   │   ├── Disk (HDD) — seek time, rotational latency, transfer rate
│   │   ├── SSD — NAND flash, wear leveling, I/O patterns
│   │   └── NVM/Persistent Memory (emerging)
│   ├── 4.2 File & Page Organization
│   │   ├── Heap files (unsorted)
│   │   ├── Sequential/sorted files
│   │   ├── Clustered files
│   │   └── Log-structured storage (LSM trees)
│   ├── 4.3 Buffer Pool Management
│   │   ├── Buffer pool architecture
│   │   ├── Page replacement policies (LRU, Clock, LFU, MRU)
│   │   ├── Dirty pages and write-back
│   │   └── Prefetching strategies
│   ├── 4.4 Tree Indexes
│   │   ├── B-Tree structure & operations
│   │   ├── B+ Tree (dominant in practice)
│   │   │   ├── Search, insert, delete, split, merge
│   │   │   ├── Clustered vs unclustered
│   │   │   └── Composite keys
│   │   └── Prefix compression, bulk loading
│   ├── 4.5 Hash Indexes
│   │   ├── Static hashing
│   │   ├── Dynamic hashing (extendible, linear)
│   │   └── Hash vs B+ tree trade-offs
│   ├── 4.6 Bitmap Indexes
│   ├── 4.7 Bloom Filters (for existence queries)
│   └── 4.8 Vector Indexes (AI-era) 🟣
│       ├── HNSW (Hierarchical Navigable Small World)
│       ├── IVF (Inverted File Index)
│       ├── Product Quantization (PQ)
│       └── ANN (Approximate Nearest Neighbor) algorithms
│
├── MODULE 5: QUERY PROCESSING & EXECUTION
│   ├── 5.1 Query Processing Pipeline
│   │   └── SQL → Parser → Logical Plan → Physical Plan → Execute
│   ├── 5.2 Sorting
│   │   ├── External sort-merge (2-pass, N-pass)
│   │   └── Replacement sort
│   ├── 5.3 Hashing (for joins & aggregation)
│   │   └── Grace hash join, hybrid hash join
│   ├── 5.4 Join Algorithms
│   │   ├── Nested Loop Join (NLJ)
│   │   ├── Block Nested Loop Join (BNLJ)
│   │   ├── Sort-Merge Join
│   │   ├── Hash Join
│   │   └── Index Nested Loop Join
│   ├── 5.5 Aggregation
│   │   ├── Sort-based aggregation
│   │   └── Hash-based aggregation
│   └── 5.6 Execution Models
│       ├── Iterator/Volcano model (tuple-at-a-time)
│       ├── Batch / vectorized execution (column-at-a-time)
│       └── Compiled query execution (LLVM)
│
├── MODULE 6: QUERY OPTIMIZATION
│   ├── 6.1 Cost Models
│   │   ├── I/O cost, CPU cost, network cost
│   │   ├── Statistics: histograms, cardinality estimation
│   │   └── Selectivity estimation
│   ├── 6.2 Equivalence Rules & Transformations
│   │   ├── Predicate pushdown
│   │   ├── Join reordering
│   │   └── Projection pushdown
│   ├── 6.3 Join Ordering
│   │   ├── Dynamic programming (System-R approach)
│   │   ├── Greedy heuristics
│   │   └── Left-deep vs bushy trees
│   ├── 6.4 Catalog & Statistics
│   │   ├── ANALYZE / VACUUM (PostgreSQL)
│   │   └── Updating statistics
│   └── 6.5 Adaptive Query Processing (AQP) 🔴
│       ├── Re-optimization at runtime
│       └── Learned query optimizers (ML-based)
│
├── MODULE 7: TRANSACTIONS & CONCURRENCY
│   ├── 7.1 ACID Properties
│   │   ├── Atomicity — all or nothing
│   │   ├── Consistency — constraints maintained
│   │   ├── Isolation — concurrent txns don't interfere
│   │   └── Durability — committed txns survive crashes
│   ├── 7.2 Transaction States
│   │   └── Active → Partially committed → Committed / Failed → Aborted
│   ├── 7.3 Schedules & Serializability
│   │   ├── Serial vs interleaved schedules
│   │   ├── Conflict serializability
│   │   ├── Precedence graphs
│   │   └── View serializability
│   ├── 7.4 Concurrency Control Protocols
│   │   ├── Lock-Based Protocols
│   │   │   ├── 2-Phase Locking (2PL)
│   │   │   ├── Strict 2PL
│   │   │   ├── Strong Strict 2PL
│   │   │   ├── Shared (S) and Exclusive (X) locks
│   │   │   ├── Intention locks (IS, IX, SIX)
│   │   │   └── Multiple granularity locking
│   │   ├── Deadlock Handling
│   │   │   ├── Prevention (wait-die, wound-wait)
│   │   │   ├── Detection (waits-for graph)
│   │   │   └── Avoidance
│   │   ├── Timestamp-Based Protocols
│   │   │   ├── Basic T/S ordering
│   │   │   └── Thomas Write Rule
│   │   └── Optimistic Concurrency Control (OCC)
│   └── 7.5 Isolation Levels (SQL Standard)
│       ├── Read Uncommitted
│       ├── Read Committed
│       ├── Repeatable Read
│       └── Serializable
│       └── Anomalies: dirty read, non-repeatable read, phantom read
│
├── MODULE 8: RECOVERY & CRASH CONSISTENCY
│   ├── 8.1 Failure Types
│   │   ├── Transaction failures
│   │   ├── System failures (crashes)
│   │   └── Media failures (disk crash)
│   ├── 8.2 Write-Ahead Logging (WAL)
│   │   ├── Log records: begin, update, commit, abort
│   │   ├── Force and No-Force policies
│   │   └── Steal and No-Steal policies
│   ├── 8.3 ARIES Recovery Algorithm 🔴
│   │   ├── Analysis Phase (reconstruct state)
│   │   ├── Redo Phase (redo all logged actions)
│   │   └── Undo Phase (undo incomplete transactions)
│   ├── 8.4 Checkpointing
│   │   ├── Sharp checkpoints
│   │   └── Fuzzy checkpoints
│   └── 8.5 Shadow Paging (alternative to WAL)
│
├── MODULE 9: DISTRIBUTED & PARALLEL DATABASES
│   ├── 9.1 Distributed Data Storage
│   │   ├── Horizontal partitioning (sharding)
│   │   ├── Vertical partitioning
│   │   └── Replication (primary-replica, multi-primary)
│   ├── 9.2 Distributed Query Processing
│   │   ├── Parallel joins, sorting, grouping
│   │   └── Semi-join optimization
│   ├── 9.3 Distributed Transactions
│   │   ├── 2-Phase Commit (2PC)
│   │   └── 3-Phase Commit (3PC)
│   ├── 9.4 CAP Theorem 🔴
│   │   ├── Consistency, Availability, Partition Tolerance
│   │   └── Trade-offs in practice (CP vs AP systems)
│   ├── 9.5 PACELC Model (extension of CAP) 🔴
│   ├── 9.6 Consistency Models in Distributed Systems
│   │   ├── Strong consistency
│   │   ├── Eventual consistency
│   │   ├── Linearizability
│   │   └── Causal consistency
│   └── 9.7 MapReduce and Spark (OLAP at scale)
│
├── MODULE 10: NoSQL SYSTEMS
│   ├── 10.1 Motivation for NoSQL
│   ├── 10.2 Key-Value Stores
│   │   └── Redis, DynamoDB, Riak
│   ├── 10.3 Document Stores
│   │   └── MongoDB, CouchDB, Firestore
│   ├── 10.4 Column-Family Stores
│   │   └── Cassandra, HBase, BigTable
│   ├── 10.5 Graph Databases
│   │   └── Neo4j, Amazon Neptune, Cypher query language
│   ├── 10.6 NewSQL Systems
│   │   └── CockroachDB, Google Spanner, TiDB, AlloyDB
│   └── 10.7 Multi-Model Databases (emerging 2025-2026)
│
├── MODULE 11: OBJECT-RELATIONAL & ADVANCED SQL
│   ├── 11.1 Object-Relational Mappings (ORMs)
│   │   └── SQLAlchemy, Hibernate, Prisma, Django ORM
│   ├── 11.2 JSON in SQL Databases (PostgreSQL JSONB, MySQL JSON)
│   ├── 11.3 Full-Text Search
│   └── 11.4 Spatial Data & PostGIS
│
├── MODULE 12: DATA WAREHOUSING & OLAP
│   ├── 12.1 OLTP vs OLAP workloads
│   ├── 12.2 Star Schema, Snowflake Schema, Galaxy Schema
│   ├── 12.3 OLAP Operations (Roll-up, Drill-down, Slice, Dice, Pivot)
│   ├── 12.4 Column-Oriented Storage (DuckDB, Redshift, BigQuery)
│   │   └── Compression: RLE, delta encoding, dictionary encoding
│   ├── 12.5 Materialized Views
│   ├── 12.6 Data Lakehouse Architecture (Delta Lake, Iceberg)
│   └── 12.7 ETL vs ELT pipelines
│
└── MODULE 13: AI-ERA DATABASE TOPICS (2024-2026) 🟣
    ├── 13.1 Vector Databases
    │   ├── Embedding storage (text, image, audio vectors)
    │   ├── Similarity search (cosine, dot product, L2)
    │   ├── Approximate Nearest Neighbor (ANN)
    │   ├── HNSW graph index
    │   └── pgvector (PostgreSQL extension)
    ├── 13.2 RAG (Retrieval-Augmented Generation) pipelines
    │   ├── Chunking strategies
    │   ├── Embedding models (text-embedding-3, BGE, E5)
    │   └── Hybrid search (dense + sparse)
    ├── 13.3 ML Feature Stores
    │   └── Feast, Tecton, Hopsworks
    ├── 13.4 Streaming Databases
    │   └── Apache Flink, RisingWave, Materialize
    └── 13.5 AI-Powered Query Optimization
        └── Learned cardinality estimation, learned indexes
```

---

## 5. CHAPTER-BY-CHAPTER BREAKDOWN

### Chapter 1: Foundations of Database Systems 🟢

**What the relational model is and why it won**

The relational model, invented by **Edgar F. Codd (IBM, 1970)**, represented data as mathematical relations (tables with rows and columns). Before this, databases used hierarchical (IMS) and network (CODASYL) models where programmers navigated data with explicit pointers. Codd's key insight was **data independence**: the physical storage of data should be completely decoupled from how applications use it.

**DBMS Architecture Layers (ANSI/SPARC 3-schema)**

```
┌─────────────────────────────────────────────┐
│           External Level (Views)             │  ← How each user sees the data
├─────────────────────────────────────────────┤
│         Conceptual Level (Logical Schema)    │  ← Logical design (tables, constraints)
├─────────────────────────────────────────────┤
│         Internal Level (Physical Schema)     │  ← How data is stored on disk
└─────────────────────────────────────────────┘
```

**Key DBMS Components (as covered in MIT & CMU)**

```
┌────────────────────────────────────────────────────┐
│                  SQL Interface                      │
├─────────────┬──────────────┬──────────────────────┤
│   Parser    │   Optimizer  │   Execution Engine    │
├─────────────┴──────────────┴──────────────────────┤
│              Storage Manager                       │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────┐  │
│  │ Buffer   │  │  Index   │  │  Heap / File    │  │
│  │ Pool     │  │  Manager │  │  Manager        │  │
│  └──────────┘  └──────────┘  └─────────────────┘  │
├────────────────────────────────────────────────────┤
│           Transaction & Recovery Manager           │
├────────────────────────────────────────────────────┤
│                    Disk (Persistent Storage)        │
└────────────────────────────────────────────────────┘
```

---

### Chapter 2: Relational Algebra 🟡

Relational algebra is the **mathematical foundation of SQL**. Every SQL query is compiled into a relational algebra expression. Understanding it is essential for query optimization.

**Core Operations**

| Operation | Symbol | SQL Equivalent | Description |
|-----------|--------|----------------|-------------|
| Selection | σ_condition(R) | WHERE | Filters rows matching a condition |
| Projection | π_attrs(R) | SELECT (cols) | Keeps only specified columns |
| Natural Join | R ⋈ S | JOIN ... ON | Joins on matching attribute names |
| Theta Join | R ⋈_θ S | JOIN ... ON condition | Join with arbitrary condition |
| Union | R ∪ S | UNION | Rows in R or S (duplicate elimination) |
| Intersection | R ∩ S | INTERSECT | Rows in both R and S |
| Difference | R − S | EXCEPT | Rows in R but not S |
| Cartesian Product | R × S | CROSS JOIN | All combinations of rows |
| Aggregation | γ_attrs,agg(R) | GROUP BY + aggregate | Group and compute aggregates |
| Rename | ρ_name(R) | AS | Renames relation or attributes |

**Example: Expression Tree**

```sql
SELECT S.name 
FROM Students S, Enrolled E 
WHERE S.sid = E.sid AND E.grade = 'A';
```

Becomes:

```
π_name
  └─ σ_grade='A'
       └─ S ⋈_(S.sid=E.sid) E
```

This tree representation is what the query optimizer manipulates to find the cheapest execution plan.

---

### Chapter 3: Database Design & Normalization 🟡

**The Goal:** Design a schema where each piece of information appears once, to minimize redundancy and update anomalies.

**Functional Dependencies (FDs)**

A functional dependency A → B means: if two tuples agree on A, they must agree on B.

Example: In a Students table, `StudentID → Name` (knowing the ID determines the name), but `Name ↛ StudentID` (names are not unique).

**Armstrong's Axioms** (complete and sound rules for deriving FDs):
- **Reflexivity:** If B ⊆ A, then A → B
- **Augmentation:** If A → B, then AC → BC
- **Transitivity:** If A → B and B → C, then A → C

**Normal Forms Explained Intuitively**

| Normal Form | Rule | Violation Example | Fix |
|-------------|------|-------------------|-----|
| 1NF | Every attribute must be atomic | A "Colors" column containing "Red,Blue" | Split into rows |
| 2NF | No partial dependency on PK | In (OrderID, ProductID) → ProductName, ProductName depends only on ProductID | Separate Products table |
| 3NF | No transitive dependency | StudentID → Dept → Dean (Dean transitively depends on StudentID via Dept) | Separate Dept table |
| BCNF | Every determinant is a superkey | When 3NF still has anomalies from overlapping candidate keys | Decompose further |
| 4NF | No non-trivial multi-valued dependency | Employee has multiple skills AND multiple projects (independent) | Separate tables |

**Decomposition Properties**

A good decomposition must have:
1. **Lossless join** — you can reconstruct the original relation by joining the pieces
2. **Dependency preservation** — FDs can still be checked on individual relations

---

### Chapter 4: Storage & Indexing 🟡🔴

**Why This Matters**

A database on modern NVMe SSD can do ~500,000 random I/Os per second. A database on HDD does ~200. Accessing 1 page from memory takes nanoseconds; from disk, microseconds to milliseconds. The entire storage engine of a DBMS is engineered to minimize disk I/O.

**Buffer Pool Architecture**

```
Main Memory (RAM)
┌────────────────────────────────────────────┐
│  Buffer Pool                                │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ Page │ │ Page │ │ Page │ │ Free │      │
│  │  P1  │ │  P7  │ │ P12  │ │Frame │      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│  Page Table: {P1→frame0, P7→frame1, ...}   │
└────────────────────────────────────────────┘
          ↕ (fetch/flush)
┌────────────────────────────────────────────┐
│  Disk  [P1][P2][P3]...[P7]...[P12]...      │
└────────────────────────────────────────────┘
```

The **buffer pool manager** decides which pages to keep in memory and which to evict. The standard eviction policy is **LRU (Least Recently Used)**, but CMU's course covers why LRU is actually suboptimal for sequential scans (use **Clock** or **MRU** instead for scan-heavy workloads).

**B+ Tree Index**

The B+ tree is the dominant index structure used by PostgreSQL, MySQL, Oracle, and SQL Server.

Properties:
- Balanced tree — all leaves at same depth
- **Internal nodes** store only keys (routing keys)
- **Leaf nodes** store key + record pointer (or actual data if clustered)
- Leaf nodes are **linked** in a doubly-linked list → enables efficient range scans
- Order `d`: each node holds between `d` and `2d` keys (except root)

```
B+ Tree (order 2):

              [30  | 60]
             /     |     \
       [10|20]  [40|50]  [70|80]
      ↓     ↓    ↓    ↓    ↓   ↓
   records  ...  ...  ...  ...  ...
   (leaves linked: → → → →)
```

Operations:
- **Search:** O(log_d N) — traverse from root to leaf
- **Insert:** Find leaf, insert, split up if overflow
- **Delete:** Find leaf, delete, merge/redistribute if underflow

**Index Types Compared**

| Index Type | Best For | Sequential Scan | Range Query | Point Query |
|------------|----------|-----------------|-------------|-------------|
| B+ Tree (clustered) | Range + point queries | ✅ Excellent | ✅ Excellent | ✅ Good |
| B+ Tree (unclustered) | Low-selectivity queries | ❌ Poor | ✅ OK | ✅ Good |
| Hash (static) | Equality only | ❌ | ❌ | ✅ Excellent |
| Bitmap | Low-cardinality, OLAP | ✅ | ✅ | ✅ |
| HNSW (vector) | Semantic similarity | N/A | N/A (ANN) | ✅ |

---

### Chapter 5: Query Processing 🔴

**The Full Pipeline**

```
SQL Query (text)
     ↓ [Lexer + Parser]
Parse Tree (AST)
     ↓ [Semantic Analysis / Binder]
Logical Query Plan (relational algebra)
     ↓ [Query Rewriter]
Rewritten Logical Plan (after rule-based optimizations)
     ↓ [Cost-Based Optimizer]
Physical Query Plan (specific algorithms selected)
     ↓ [Execution Engine (Volcano / Vectorized)]
Result Tuples
```

**Join Algorithms Compared**

Assume: Relation R (10,000 pages), Relation S (5,000 pages), Buffer: B pages

| Algorithm | I/O Cost (approx.) | Best When |
|-----------|-------------------|-----------|
| Naive Nested Loop Join | R.pages × S.pages = 50M | Never (worst case) |
| Block Nested Loop Join | R.pages + ⌈R.pages/(B-2)⌉ × S.pages | Small buffer available |
| Sort-Merge Join | 3(R+S) | Both relations sortable, output needed sorted |
| Hash Join | 3(R+S) | Uniform data, hash fits in memory |
| Index NLJ | R.pages + |R| × cost(index lookup on S) | S has index on join attr |

**External Sort-Merge (for large sorts)**

Phase 1 (Sort): Pass over all data, create sorted runs of size B pages.  
Phase 2+ (Merge): Merge B-1 runs at a time.

For N pages with B buffer pages: Cost = 2N × (1 + ⌈log_{B-1}(⌈N/B⌉)⌉) I/Os

---

### Chapter 6: Query Optimization 🔴

**Why Optimization is Hard**

For a query joining N tables, there are N! possible join orderings (plus choices of algorithm per join). For 10 tables, that's 3,628,800 possible orderings. The optimizer must find a good plan fast using **dynamic programming** (System R approach).

**Cost-Based Optimization Steps**

1. Enumerate plan alternatives using equivalence rules
2. Estimate the cost of each alternative using **statistics** (histograms, distinct value counts)
3. Select the plan with lowest estimated cost

**Selectivity Estimation Formulas**

```
σ_A=v(R):        sel = 1 / NDistinct(A)
σ_A>v(R):        sel = (max(A) - v) / (max(A) - min(A))
σ_A=v AND B=w:   sel(A=v) × sel(B=w)   [attribute independence assumption]

Join cardinality estimate:
|R ⋈_A=A S| ≈ |R| × |S| / max(NDistinct(R.A), NDistinct(S.A))
```

**Plan Space Reduction (System R / IBM DB2 approach)**

- Only consider **left-deep trees** (not bushy) → reduces search space from O(N!) to O(N × 2^N)
- Use **dynamic programming**: solve optimal plan for subsets bottom-up
- **Pruning**: discard any partial plan more expensive than a known complete plan

---

### Chapter 7: Transaction Processing & ACID 🔴

**Motivating Example**

Bank transfer: deduct $100 from Account A, add $100 to Account B.

Without transactions:
- System crashes between the two operations → $100 disappears
- Two users read/write simultaneously → incorrect balances

**ACID Properties Formally Defined**

- **Atomicity:** A transaction T is atomic. Either all operations in T are executed, or none are. Implemented via **undo logging**.
- **Consistency:** If the database is consistent before T starts, it will be consistent after T commits. Enforced by integrity constraints and application logic.
- **Isolation:** The result of executing T1 and T2 concurrently must be equivalent to executing them in some serial order. Enforced via **concurrency control**.
- **Durability:** If T commits, its effects persist even after system failures. Implemented via **redo logging**.

**Two-Phase Locking (2PL)**

Rule: Transactions have two phases:
1. **Growing phase:** acquire locks, never release
2. **Shrinking phase:** release locks, never acquire

Theorem: 2PL guarantees conflict-serializable schedules.

Strict 2PL: Release all locks only at transaction end (commit/abort). Avoids cascading aborts.

**Deadlock Example**

```
T1: Lock(A)... waiting for Lock(B)
T2: Lock(B)... waiting for Lock(A)
→ Circular wait → Deadlock
```

Detection: Build a **waits-for graph**. If cycle exists → deadlock → abort one transaction (the "victim").

---

### Chapter 8: Database Recovery (ARIES) 🔴🟣

**ARIES** (Algorithms for Recovery and Isolation Exploiting Semantics) is the standard recovery algorithm used by IBM DB2, SQL Server, and most modern DBMS.

**Key Properties of ARIES**

- **Steal policy:** Dirty (uncommitted) pages can be written to disk (needed for buffer pool management)
- **No-Force policy:** Dirty pages don't need to be flushed at commit (improves write performance)
- Uses **Write-Ahead Logging (WAL):** A page must not be written to disk until its log record is flushed

**WAL Rule** (critical invariant): 
```
Log(page update) must reach stable storage BEFORE the dirty page reaches disk
```

**Three-Phase Recovery**

```
CRASH
  ↓
[ANALYSIS PHASE]
  - Scan log forward from last checkpoint
  - Determine: dirty page table, active transactions at crash
  ↓
[REDO PHASE]
  - Re-apply ALL logged updates from redo LSN
  - Restores database to state at crash time
  ↓
[UNDO PHASE]
  - Undo all operations of uncommitted transactions (in reverse log order)
  - Uses CLR (Compensation Log Records) to avoid re-undoing during another crash
  ↓
Database in consistent state
```

**LSN (Log Sequence Number):** Every log record has a monotonically increasing LSN. Each page stores the LSN of the most recent update to it (pageLSN). Recovery uses LSNs to determine what to redo or undo.

---

### Chapter 9: Distributed Databases 🔴🟣

**CAP Theorem (Brewer 2000)**

> A distributed system can guarantee at most **two** of the following three properties simultaneously:
> - **C**onsistency — every read sees the most recent write
> - **A**vailability — every request receives a (non-error) response
> - **P**artition tolerance — the system continues despite network partitions

Practical systems choose:
- **CP systems** (consistency + partition tolerance): HBase, Zookeeper, Spanner
- **AP systems** (availability + partition tolerance): DynamoDB, Cassandra, CouchDB

**PACELC Extension**

In the absence of network Partition (P), there is still a trade-off between **Latency (L)** and **Consistency (C)**:
- High consistency → more coordination → higher latency
- Low latency → relaxed consistency (stale reads possible)

**2-Phase Commit (2PC)**

Distributed commit protocol ensuring all-or-nothing across multiple nodes:

```
Phase 1 (Prepare):
  Coordinator → "PREPARE" → all participants
  Participants → log, acquire locks → "YES" or "NO"

Phase 2 (Commit):
  If ALL said YES → Coordinator → "COMMIT" → all participants
  If ANY said NO  → Coordinator → "ABORT"  → all participants
```

Problem: **Blocking** — if coordinator crashes after Phase 1, participants are stuck (they hold locks, can't proceed or abort alone).  
Solution: **3PC** (adds a pre-commit phase), or **Paxos/Raft** consensus.

---

### Chapter 10: NoSQL & Modern Data Systems 🟡🔴

**Why NoSQL Emerged**

Web-scale companies (Google, Amazon, Facebook) in the 2000s needed:
- Horizontal scalability (sharding across thousands of nodes)
- Flexible schemas (user-generated content varies)
- Lower latency at massive scale
- Sacrifice of full ACID in favor of BASE: **B**asically Available, **S**oft state, **E**ventually consistent

**System Design Examples**

| System | Type | Use Case | Consistency |
|--------|------|----------|-------------|
| Redis | Key-Value | Caching, sessions, pub/sub | Strong (single node) |
| DynamoDB | Key-Value | Shopping cart, user profiles | Eventual (configurable) |
| MongoDB | Document | CMS, catalogs, user data | Tunable |
| Cassandra | Wide-Column | Time-series, IoT, logging | Tunable (quorum) |
| Neo4j | Graph | Social networks, knowledge graphs | ACID |
| Pinecone | Vector | LLM RAG, semantic search | Eventual |
| Spanner | NewSQL | Global OLTP | Serializable |
| CockroachDB | NewSQL | Distributed SQL | Serializable |

---

## 6. PRACTICAL LABS & PROJECTS

### MIT 6.5830 — GoDB Labs (Go Language)

Students implement a working DBMS called **GoDB** from scratch in Go.

| Lab | Name | What You Build | Key Concepts |
|-----|------|---------------|--------------|
| Lab 0 | Go Tutorial | Go language basics | Goroutines, channels, interfaces |
| Lab 1 | GoDB — Storage | Heap files, tuples, field types, iterators | Page layout, buffer management |
| Lab 2 | GoDB — Operators | Scan, Filter, Join, Aggregate, Project | Volcano model, query execution |
| Lab 3 | GoDB — Transactions | Lock manager, 2PL, deadlock detection | ACID, locking, serializability |
| Project | Research Project | End-to-end DB feature or optimization | Open-ended, research-grade |

### CMU 15-445 — BusTub Projects (C++)

Students implement core components of **BusTub**, a disk-oriented relational DBMS, in C++17.

| Project | Name | What You Build | Concepts |
|---------|------|---------------|----------|
| P0 | Copy-on-Write Trie | C++ Trie data structure (warm-up) | C++ skills, COW, functional data structures |
| P1 | Buffer Pool Manager | LRU-K eviction, buffer pool, disk scheduler | Memory management, page replacement |
| P2 | B+ Tree Index | Full B+ tree with concurrent access | Tree insertion/deletion, latching |
| P3 | Query Execution | Executors: scan, join, aggregation, sort | Volcano model, projection, filtering |
| P4 | Concurrency Control | Lock manager, deadlock detection, isolation levels | 2PL, deadlock, transaction lifecycle |

### Berkeley CS186 Labs (Java)

| Lab | Name | Description |
|-----|------|-------------|
| HW1 | SQL | Complex SQL queries on real datasets |
| HW2 | B+ Trees | Implement B+ tree operations |
| HW3 | Buffer Management | LRU eviction, page pinning |
| HW4 | Join Algorithms | Implement sort-merge and hash join |
| HW5 | Query Optimization | Cost-based join ordering |
| HW6 | Transactions | Implement lock manager and 2PL |
| Project | Relational DB | End-to-end query processing |

---

## 7. TOOLS, LANGUAGES & PLATFORMS

### Languages Used in Labs

| University | Primary Language | Reason |
|------------|-----------------|--------|
| MIT 6.5830 | **Go** | Concurrency features, GC, modern systems language |
| CMU 15-445 | **C++17** | Low-level memory control, industry standard |
| Berkeley CS186 | **Java** | Familiar, good for teaching OOP patterns |
| Stanford CS245 | **Python/SQL** | Higher-level focus on concepts |

### Databases Studied

| System | Why Studied |
|--------|-------------|
| **PostgreSQL** | Most feature-rich open-source RDBMS; extensible (pgvector, PostGIS) |
| **MySQL / MariaDB** | Widely deployed web databases |
| **SQLite** | Embedded DB, excellent for understanding internals |
| **DuckDB** | Modern columnar OLAP engine (replaces pandas for analytics) |
| **MongoDB** | Dominant document store |
| **Redis** | Caching, pub/sub, leaderboards |
| **Apache Cassandra** | Wide-column, tunable consistency |
| **Apache Spark / Flink** | Distributed data processing |
| **Pinecone / Weaviate / pgvector** | Vector search (AI era) |

### Query & Analysis Tools

| Tool | Purpose |
|------|---------|
| psql | PostgreSQL command-line client |
| DBeaver / DataGrip | GUI for multi-database querying |
| EXPLAIN / EXPLAIN ANALYZE | View query execution plans |
| pgBadger | PostgreSQL log analyzer |
| Apache JMeter | DB performance/load testing |
| Python (SQLAlchemy, psycopg2) | Programmatic DB access |

---

## 8. KEY TEXTBOOKS & PAPERS

### Primary Textbooks

| Title | Authors | Level | Access |
|-------|---------|-------|--------|
| **Database System Concepts (7th ed.)** | Silberschatz, Korth, Sudarshan | 🟢🟡 Undergrad | Standard textbook; McGraw-Hill |
| **Database Systems: The Complete Book** | Garcia-Molina, Ullman, Widom (Stanford) | 🟡🔴 | Stanford's own textbook |
| **Readings in Database Systems ("Red Book")** | Stonebraker & Hellerstein (eds.) | 🔴🟣 Grad | Free: http://www.redbook.io |
| **Database Management Systems (3rd ed.)** | Ramakrishnan & Gehrke | 🟡🔴 | CMU's primary textbook |
| **A Practical Introduction to Databases** | Painter-Wakefield | 🟢 | MIT 6.5830 supplement |

### Seminal Research Papers (used in MIT 6.5830 & graduate courses)

| Paper | Authors | Year | Why Important |
|-------|---------|------|---------------|
| A Relational Model of Data for Large Shared Data Banks | E.F. Codd | 1970 | Birth of relational databases |
| What Goes Around Comes Around | Stonebraker & Hellerstein | 2005 | History of data models; required reading at MIT |
| Architecture of a Database System | Hellerstein et al. | 2007 | Definitive DBMS architecture overview |
| Access Path Selection in a Relational Database | Selinger et al. (IBM) | 1979 | System-R query optimizer (foundation of all optimizers) |
| ARIES: A Transaction Recovery Method | Mohan et al. (IBM) | 1992 | The standard recovery algorithm |
| Spanner: Google's Globally Distributed Database | Corbett et al. | 2012 | Distributed SQL with external consistency |
| Dynamo: Amazon's Highly Available Key-Value Store | DeCandia et al. | 2007 | Foundational NoSQL design paper |
| Bigtable: A Distributed Storage System | Chang et al. (Google) | 2006 | Column-family store; inspired HBase, Cassandra |
| MapReduce: Simplified Data Processing | Dean & Ghemawat | 2004 | Distributed computation at scale |
| The Case for Column-Stores | Stonebraker et al. | 2005 | Why OLAP needs different storage |
| In Search of an Understandable Consensus Algorithm (Raft) | Ongaro & Ousterhout | 2014 | Modern distributed consensus |

---

## 9. AI-ERA ADDITIONS (2024–2026)

### Vector Databases — The New Essential Layer

The AI boom introduced **vector databases** as a fundamental infrastructure component. Every LLM application that retrieves context (RAG) needs one.

**How Vector Search Works**

1. Documents are chunked and passed through an **embedding model** (e.g., text-embedding-3-large, BGE-M3)
2. The embedding model produces a **dense vector** (e.g., 1536-dimensional float array)
3. Vectors are stored in a vector database with an **ANN index** (e.g., HNSW)
4. At query time: embed the query → find nearest vectors by cosine similarity → retrieve documents

```
Query: "What is the capital of France?"
   ↓ (embed)
[0.23, -0.11, 0.87, ..., 0.04]  (1536 dims)
   ↓ (HNSW search)
Top-k nearest vectors: [Paris doc, France doc, EU doc, ...]
   ↓ (retrieve text)
Context for LLM prompt
```

**HNSW Algorithm** (Hierarchical Navigable Small World)

The dominant ANN algorithm. Builds a multi-layer graph where:
- **Upper layers** have long-range connections (few nodes) for fast navigation
- **Lower layers** have short-range connections for precise search
- Search starts at top layer, greedily descends to find exact neighbors

Properties:
- Query time: O(log N)
- Excellent recall (~98%) with tunable trade-offs (efSearch, M parameters)
- Used by: Pinecone, Weaviate, Milvus, FAISS, pgvector

**pgvector** — Adding Vector Search to PostgreSQL

```sql
-- Enable extension
CREATE EXTENSION vector;

-- Create table with vector column
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  content TEXT,
  embedding vector(1536)  -- dimension matches embedding model
);

-- Create HNSW index
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);

-- Similarity search
SELECT content, 1 - (embedding <=> query_embedding) AS similarity
FROM documents
ORDER BY embedding <=> query_embedding
LIMIT 10;
```

**Hybrid Search (2025 standard)**

Pure vector search misses exact keyword matches. Modern RAG uses:
- **Dense retrieval**: vector similarity (semantic)
- **Sparse retrieval**: BM25 / TF-IDF (keyword)
- **Re-ranking**: cross-encoder to reorder fused results

### AI-Powered Database Features (2025-2026)

| Feature | Description | Systems |
|---------|-------------|---------|
| **Learned Index Structures** | Neural networks replacing B-trees | Tim Kraska (MIT) research |
| **Learned Cardinality Estimation** | ML models for query cost estimation | PostgreSQL research, Naru |
| **Automatic Indexing** | AI selects which indexes to create | Microsoft Auto-Index, OtterTune |
| **Natural Language to SQL (NL2SQL)** | LLMs convert English queries to SQL | GPT-4, DAIL-SQL, DIN-SQL |
| **Agentic Data Analysis** | AI agents write, execute, and interpret SQL | LangChain SQL Agent, Vanna.ai |

---

## 10. CAREER RELEVANCE & INDUSTRY MAP

### Job Roles That Require DBMS Knowledge

| Role | DBMS Depth Required | Key Topics Used |
|------|--------------------|--------------|
| **Backend Software Engineer** | 🟡 Intermediate | SQL, indexing, ORM, transactions |
| **Database Administrator (DBA)** | 🔴 Advanced | Storage engines, tuning, recovery, replication |
| **Data Engineer** | 🟡🔴 | Data warehousing, ETL, Spark, Kafka |
| **ML Engineer** | 🟡 | Feature stores, vector DBs, data pipelines |
| **AI/LLM Application Engineer** | 🟡 + Vector | pgvector, RAG, embedding search |
| **Data Scientist** | 🟢🟡 | SQL proficiency, analytical queries |
| **Distributed Systems Engineer** | 🔴🟣 | CAP, consensus, distributed transactions |
| **Database Researcher** | 🟣 PhD | All of the above + current research |

### Industry Systems Map

```
OLTP (Online Transactions)          OLAP (Analytics)
PostgreSQL                          DuckDB
MySQL / MariaDB            →        Snowflake
Oracle                   ETL/ELT    BigQuery
SQL Server               pipelines  Redshift
CockroachDB                         Databricks (Delta Lake)

NoSQL                               AI / Vector
MongoDB ← documents                 Pinecone
Redis ← cache/sessions              Weaviate
Cassandra ← time-series             Milvus
Neo4j ← graphs                      pgvector (in PostgreSQL)
DynamoDB ← serverless key-val       Qdrant
```

### 2025-2026 Industry Trends

- **Multi-model databases** are consolidating the fragmented NoSQL landscape — one engine for JSON, graph, vector, and relational data
- **Database + AI integration** is becoming standard: every major database now has a vector extension or native vector support
- **DuckDB** has emerged as the in-process analytics engine replacing pandas + SQLite for data science workflows
- **Serverless databases** (PlanetScale, Neon, Turso) allow branching databases like git branches
- **lakehouse architecture** (Delta Lake, Apache Iceberg) is replacing separate data warehouses + data lakes

---

## 11. RESEARCH SOURCES & LINKS

### Official University Course Pages (verified May 2026)

| Course | University | URL |
|--------|-----------|-----|
| 6.5830 Database Systems (Spring 2026) | MIT | https://dsg.csail.mit.edu/6.5830/ |
| 6.5830 Syllabus | MIT | https://dsg.csail.mit.edu/6.5830/syllabus.php |
| 6.5830 on OCW (Fall 2023) | MIT | https://ocw.mit.edu/courses/6-5830-database-systems-fall-2023/ |
| 15-445/645 Intro to Database Systems (Spring 2026) | CMU | https://15445.courses.cs.cmu.edu/ |
| 15-445 Syllabus (Fall 2025) | CMU | https://15445.courses.cs.cmu.edu/fall2025/syllabus.html |
| CS245 Principles of Data-Intensive Systems | Stanford | https://cs245.stanford.edu/ |
| CS186 Database Systems | UC Berkeley | https://cs186berkeley.net/ |
| CS186 Online Notes | UC Berkeley | https://cs186berkeley.net/notes/ |
| CS44800 Database Systems (Fall 2024) | Purdue | https://www.cs.purdue.edu/homes/bb/cs448f24/schedule.html |

### Free Textbooks & Papers

| Resource | URL |
|----------|-----|
| Readings in Database Systems (Red Book) | http://www.redbook.io |
| Database System Concepts Slides (Silberschatz) | https://www.db-book.com/ |
| CMU Database Group YouTube (Andy Pavlo) | https://www.youtube.com/@CMUDatabaseGroup |
| Architecture of a Database System (paper) | https://dsf.berkeley.edu/papers/fntdb07-architecture.pdf |
| Codd 1970 Relational Model Paper | https://dl.acm.org/doi/10.1145/362384.362685 |
| What Goes Around Comes Around | https://people.cs.umass.edu/~yanlei/courses/CS691LL-f06/papers/SH05.pdf |
| Spanner Paper (Google) | https://research.google/pubs/spanner-googles-globally-distributed-database/ |
| Dynamo Paper (Amazon) | https://dl.acm.org/doi/10.1145/1323293.1294281 |
| ARIES Recovery Paper (IBM) | https://dl.acm.org/doi/10.1145/128765.128770 |
| Raft Consensus Algorithm | https://raft.github.io/raft.pdf |

### Practical Tools & Hands-On Resources

| Tool | URL |
|------|-----|
| PostgreSQL Official Docs | https://www.postgresql.org/docs/ |
| pgvector Extension | https://github.com/pgvector/pgvector |
| DuckDB Documentation | https://duckdb.org/docs/ |
| MongoDB University (free) | https://learn.mongodb.com/ |
| SQLZoo (SQL Practice) | https://sqlzoo.net/ |
| Mode SQL Tutorial | https://mode.com/sql-tutorial/ |
| BusTub (CMU teaching DBMS) | https://github.com/cmu-db/bustub |
| GoDB (MIT teaching DBMS) | https://github.com/mit-pdos/go-db-class |

### AI-Era Resources

| Resource | URL |
|----------|-----|
| Weaviate Vector DB Docs | https://weaviate.io/developers/weaviate |
| Pinecone Documentation | https://docs.pinecone.io/ |
| Milvus Vector DB | https://milvus.io/docs |
| LangChain Vector Stores | https://python.langchain.com/docs/integrations/vectorstores/ |
| pgvector README | https://github.com/pgvector/pgvector |
| Toronto CSC2233 Vector DB Course (2025) | https://www.cs.toronto.edu/~mgabel/csc2233/ |
| Hugging Face Embedding Models | https://huggingface.co/models?pipeline_tag=feature-extraction |

---

## SUMMARY KNOWLEDGE MAP

```
DATABASE MANAGEMENT SYSTEMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THEORY LAYER
  Relational Model (Codd 1970)
  Relational Algebra (σ π ⋈ ∪ ∩ −)
  Functional Dependencies & Normal Forms (1NF-BCNF-4NF)
  Transaction Theory (ACID, Serializability, 2PL)
  CAP/PACELC Theorems

SYSTEMS LAYER  
  Storage: Buffer Pools, Page Layout, Disk/SSD I/O
  Indexing: B+ Trees, Hash Indexes, Bloom Filters
  Query Processing: Joins, Sorting, Aggregation
  Query Optimization: Cost Models, DP Join Ordering
  Concurrency: 2PL, OCC, MVCC, Isolation Levels
  Recovery: WAL, ARIES, Checkpointing

SYSTEMS IN THE WILD
  OLTP: PostgreSQL, MySQL, Oracle, SQL Server
  OLAP: DuckDB, Snowflake, BigQuery, Redshift
  NoSQL: MongoDB, Redis, Cassandra, DynamoDB
  NewSQL: Spanner, CockroachDB, TiDB
  Vector: pgvector, Pinecone, Weaviate, Milvus

AI-ERA LAYER
  Vector Search (HNSW, IVF, PQ, ANN)
  RAG Pipelines (embed → store → retrieve → generate)
  Feature Stores (ML pipeline data management)
  Learned DB Components (indexes, optimizers)
  NL-to-SQL (LLMs writing SQL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

*Report 01 of 12 — Database Management Systems*  
*Next: Report 02 — Software Engineering*  
*Research by Claude (Anthropic) — May 2026*  
*Sources: MIT OCW, CMU 15-445, Stanford CS245, Berkeley CS186, and research papers cited above*
