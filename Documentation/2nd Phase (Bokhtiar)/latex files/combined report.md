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

```
SYSTEMS ANALYSIS & DESIGN
│
├── MODULE 1: FOUNDATIONS OF SYSTEMS THINKING
│   ├── 1.1 Complexity and Modularity
│   ├── 1.2 Abstraction & Layering
│   ├── 1.3 Naming and Binding
│   ├── 1.4 Coping with Complexity (enforced modularity)
│   └── 1.5 System Design Principles (KISS, DRY, SOLID)
│
├── MODULE 2: COMPUTER ORGANIZATION & HARDWARE ABSTRACTIONS
│   ├── 2.1 Digital Abstraction — Logic Gates to ISA
│   ├── 2.2 Instruction Set Architecture (ISA) — x86, ARM, RISC-V
│   ├── 2.3 The Memory Hierarchy (Registers → L1/L2/L3 → RAM → Disk)
│   ├── 2.4 CPU Pipelining & Hazard Resolution
│   ├── 2.5 Caches — Direct-mapped, Set-associative, Fully-associative
│   ├── 2.6 Virtual Memory & Address Translation
│   └── 2.7 I/O Systems & Interrupts
│
├── MODULE 3: OPERATING SYSTEMS
│   ├── 3.1 Processes and Threads
│   ├── 3.2 CPU Scheduling (FIFO, SJF, RR, CFS)
│   ├── 3.3 Synchronization — Locks, Semaphores, Monitors
│   ├── 3.4 Deadlock — Detection, Prevention, Avoidance
│   ├── 3.5 Memory Management — Paging, Segmentation, TLBs
│   ├── 3.6 File Systems — FAT, ext4, NTFS, Log-Structured FS
│   ├── 3.7 I/O and Device Drivers
│   └── 3.8 Virtualization & Containers (VMs, Docker internals)
│
├── MODULE 4: SYSTEMS ANALYSIS METHODOLOGIES
│   ├── 4.1 Requirements Engineering
│   ├── 4.2 Structured Analysis (DFDs, ERDs, Data Dictionaries)
│   ├── 4.3 Object-Oriented Analysis (UML — Use Case, Class, Sequence)
│   ├── 4.4 System Modeling — State Machines, Petri Nets
│   ├── 4.5 Feasibility Studies & Trade-off Analysis
│   └── 4.6 Formal Specification (TLA+, Z notation) 🔴
│
├── MODULE 5: SYSTEM DESIGN PATTERNS & ARCHITECTURES
│   ├── 5.1 Layered Architecture
│   ├── 5.2 Client-Server Model
│   ├── 5.3 Microservices Architecture
│   ├── 5.4 Event-Driven Architecture (EDA)
│   ├── 5.5 Pipe-and-Filter Architecture
│   ├── 5.6 Service-Oriented Architecture (SOA)
│   └── 5.7 CQRS and Event Sourcing 🔴
│
├── MODULE 6: NETWORKING & DISTRIBUTED SYSTEMS
│   ├── 6.1 Network Fundamentals — OSI Model, TCP/IP Stack
│   ├── 6.2 Transport Layer — TCP, UDP, QUIC
│   ├── 6.3 Application Layer — HTTP/2, HTTP/3, gRPC, WebSockets
│   ├── 6.4 DNS, CDNs, Load Balancers
│   ├── 6.5 Distributed Consensus — Paxos, Raft 🔴
│   ├── 6.6 CAP Theorem & Consistency Models
│   ├── 6.7 Replication — Primary-Backup, Multi-Paxos, Chain Replication
│   └── 6.8 Fault Tolerance — Crash-Stop, Byzantine Failures 🟣
│
├── MODULE 7: RELIABILITY & FAULT TOLERANCE
│   ├── 7.1 Reliability Metrics — MTBF, MTTR, Availability
│   ├── 7.2 Fault, Error, Failure Model
│   ├── 7.3 Redundancy — Active/Passive, N-modular redundancy
│   ├── 7.4 Transactions — ACID Properties
│   ├── 7.5 Logging and Recovery (WAL — Write-Ahead Logging)
│   └── 7.6 Chaos Engineering (Netflix Chaos Monkey model)
│
├── MODULE 8: SECURITY IN SYSTEMS
│   ├── 8.1 Threat Modeling (STRIDE)
│   ├── 8.2 Authentication & Authorization (OAuth2, JWT, RBAC)
│   ├── 8.3 Cryptography Applied — TLS, AES, RSA, ECDH
│   ├── 8.4 Common Vulnerabilities (Buffer Overflow, SQL Injection, CSRF)
│   ├── 8.5 Secure System Design Principles (Saltzer & Schroeder)
│   └── 8.6 Trusted Execution Environments (TEE) / SGX 🟣
│
├── MODULE 9: PERFORMANCE ANALYSIS & OPTIMIZATION
│   ├── 9.1 Profiling — CPU, Memory, I/O
│   ├── 9.2 Amdahl's Law & Gustafson's Law
│   ├── 9.3 Queuing Theory Basics (M/M/1, M/M/k)
│   ├── 9.4 Benchmarking Methodology
│   ├── 9.5 Cache Optimization & Memory Access Patterns
│   └── 9.6 Concurrency & Parallelism Performance 🔴
│
└── MODULE 10: SYSTEMS DESIGN FOR ML/AI [CMU 17-645 / 🔴🟣]
    ├── 10.1 ML Pipelines as Systems
    ├── 10.2 Feature Stores, Model Registries, Experiment Tracking
    ├── 10.3 Model Serving Systems — Latency vs. Throughput Trade-offs
    ├── 10.4 Data Versioning and Lineage
    ├── 10.5 Scalable Training Infrastructure (GPU Clusters, Parameter Servers)
    ├── 10.6 Online vs. Offline Systems (Lambda / Kappa Architecture)
    └── 10.7 Responsible Systems Design (Fairness, Monitoring, Drift Detection)
```

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

LLMs: MODEL TRAINING & INFERENCE
│
├── MODULE 1 — Language Model Foundations
│   ├── What is a language model? P(token | context)
│   ├── Autoregressive (AR) generation
│   ├── N-gram models → neural language models → Transformers
│   └── Perplexity as evaluation metric
│
├── MODULE 2 — Tokenization & Embeddings
│   ├── Character, word, subword tokenization
│   ├── Byte Pair Encoding (BPE) — GPT family
│   ├── WordPiece — BERT family
│   ├── SentencePiece — multilingual models
│   ├── Token embeddings (d_model dimensional lookup)
│   └── Positional encodings (sinusoidal, learned, RoPE, ALiBi)
│
├── MODULE 3 — Transformer Architecture
│   ├── Encoder-only (BERT), Decoder-only (GPT), Encoder-Decoder (T5)
│   ├── Self-Attention: Q, K, V matrices
│   ├── Scaled Dot-Product Attention: softmax(QKᵀ/√d_k)V
│   ├── Multi-Head Attention (MHA)
│   ├── Grouped Query Attention (GQA), Multi-Query Attention (MQA)
│   ├── Feed-Forward Network (FFN) — position-wise MLP
│   ├── Residual connections + Layer Normalization
│   ├── Pre-norm vs Post-norm variants
│   └── FlashAttention — memory-efficient attention kernel
│
├── MODULE 4 — Pre-Training at Scale
│   ├── Causal language modeling (CLM) objective
│   ├── Masked language modeling (MLM) — BERT
│   ├── Data curation: CommonCrawl, C4, The Pile, FineWeb
│   ├── Data deduplication, quality filtering, toxic content filtering
│   ├── Tokenizer training on pretraining corpus
│   ├── Distributed training: data parallelism, tensor parallelism, pipeline parallelism
│   ├── 3D parallelism (Megatron-DeepSpeed)
│   ├── ZeRO optimizer (DeepSpeed stages 1/2/3)
│   ├── Mixed-precision training (FP16, BF16, FP8)
│   ├── Gradient checkpointing
│   └── Long-context training stages
│
├── MODULE 5 — Scaling Laws
│   ├── Kaplan et al. (OpenAI) — original power laws
│   ├── Chinchilla (Hoffmann et al.) — compute-optimal training
│   ├── Parameters N, training tokens D, compute budget C
│   ├── C ≈ 6ND heuristic
│   ├── Emergent capabilities vs smooth scaling
│   └── Data quality matters more than raw size (2024–2026 insight)
│
├── MODULE 6 — Alignment & Post-Training
│   ├── Supervised Fine-Tuning (SFT) — instruction following
│   ├── RLHF: reward model + PPO optimization
│   ├── InstructGPT pipeline (OpenAI, 2022)
│   ├── Direct Preference Optimization (DPO) — no reward model needed
│   ├── RLVR (Reinforcement Learning with Verifiable Rewards) — DeepSeek R1
│   ├── Constitutional AI (Anthropic)
│   ├── Rejection Sampling Fine-Tuning (RSFT)
│   ├── RLAIF (AI feedback instead of human feedback)
│   └── Sycophancy, alignment tax, safety-performance tradeoffs
│
├── MODULE 7 — Parameter-Efficient Fine-Tuning
│   ├── Full fine-tuning vs PEFT
│   ├── LoRA: W' = W + AB (rank decomposition, r << d)
│   ├── QLoRA: 4-bit NF4 quantization + LoRA adapters
│   ├── DoRA: magnitude + direction decomposition
│   ├── Prefix Tuning, Prompt Tuning, Adapter layers
│   ├── Hugging Face PEFT library
│   └── Merging adapters back into base weights
│
├── MODULE 8 — Inference Optimization
│   ├── Prefill phase (compute-bound) vs Decode phase (memory-bandwidth-bound)
│   ├── KV cache — storing past K and V to avoid recomputation
│   ├── PagedAttention (vLLM) — eliminates KV cache fragmentation
│   ├── Continuous batching — no idle GPU cycles
│   ├── Quantization: INT8, INT4, GPTQ, AWQ, GGUF (llama.cpp)
│   ├── Speculative decoding — draft model + verify with target model
│   ├── Tensor parallelism for multi-GPU serving
│   ├── Prompt caching / prefix caching
│   └── Serving frameworks: vLLM, TGI, SGLang, TensorRT-LLM
│
├── MODULE 9 — Evaluation & Benchmarks
│   ├── Perplexity on held-out text
│   ├── MMLU, HellaSwag, ARC, TruthfulQA
│   ├── MATH, GSM8K (reasoning benchmarks)
│   ├── HumanEval, MBPP (code benchmarks)
│   ├── MT-Bench, Chatbot Arena (instruction-following)
│   ├── Hallucination: TruthfulQA, FACTSCORE
│   └── HELM — holistic evaluation (Stanford)
│
└── MODULE 10 — Frontier Topics (2025–2026)
    ├── Mixture of Experts (MoE) — Mixtral, DeepSeek, GPT-4
    ├── Reasoning models — chain-of-thought, o1/o3-style test-time compute
    ├── Multimodal LLMs — LLaVA, GPT-4V, Gemini
    ├── Long-context models (128K–1M tokens)
    ├── Retrieval-Augmented Generation (RAG)
    ├── Model distillation and compression
    └── AI safety and interpretability

```

AI APPLICATION DEVELOPMENT
│
├── MODULE 1 — LLM APIs & Provider Landscape
│   ├── OpenAI API (GPT-4o, o1, o3 family)
│   ├── Anthropic API (Claude 3 / 4 family)
│   ├── Google Gemini API
│   ├── Open-source via HuggingFace Inference Endpoints
│   ├── Self-hosted models (vLLM, Ollama)
│   ├── API cost structures: input/output tokens, cached tokens
│   └── Multi-provider routing & fallback strategies
│
├── MODULE 2 — Prompt Engineering for Production
│   ├── Zero-shot prompting
│   ├── Few-shot prompting (3–5 high-quality examples)
│   ├── Chain-of-Thought (CoT) and Zero-Shot CoT
│   ├── System prompts and role assignment
│   ├── Structured output: JSON mode, response schemas
│   ├── Meta-prompting and prompt templates
│   ├── Prompt versioning and testing
│   └── Automated prompt optimization (DSPy)
│
├── MODULE 3 — Retrieval-Augmented Generation (RAG)
│   ├── Why RAG: knowledge cutoff + hallucination + private data
│   ├── RAG pipeline: Ingest → Chunk → Embed → Store → Retrieve → Generate
│   ├── Document loaders (PDF, DOCX, HTML, CSV, Notion, etc.)
│   ├── Chunking strategies (fixed, semantic, recursive, AST-based)
│   ├── Naive RAG vs Advanced RAG vs Agentic RAG
│   ├── Hybrid search (dense + sparse / BM25)
│   ├── Re-ranking (Cohere Rerank, cross-encoder models)
│   ├── HyDE (Hypothetical Document Embeddings)
│   ├── GraphRAG (knowledge graph + vector retrieval)
│   └── Evaluation: RAGAS, retrieval recall, precision
│
├── MODULE 4 — Vector Databases & Embedding Models
│   ├── Embedding models: text-embedding-3, Voyage-3, BGE, E5
│   ├── ANN search: HNSW, IVF-PQ algorithms
│   ├── Pinecone, Weaviate, Qdrant, Milvus, Chroma
│   ├── pgvector (PostgreSQL extension)
│   ├── Metadata filtering and hybrid search
│   └── Embedding drift, multi-tenancy, latency budgets
│
├── MODULE 5 — Orchestration Frameworks
│   ├── LangChain: chains, agents, memory, tools ecosystem
│   ├── LangGraph: graph-based stateful agent workflows
│   ├── LlamaIndex: RAG-optimized data framework
│   ├── DSPy (Stanford): prompt optimization as code
│   └── Choosing between frameworks for your use case
│
├── MODULE 6 — Tool Calling & Function Calling
│   ├── OpenAI / Anthropic function calling API
│   ├── Defining tools with JSON schema
│   ├── Tool execution loop: LLM calls tool → result returned → LLM continues
│   ├── Parallel tool calls
│   ├── MCP (Model Context Protocol) — Anthropic standard
│   └── Tool use safety: validation, sandboxing, permissions
│
├── MODULE 7 — Memory & State Management
│   ├── Conversation history: stateless vs stateful
│   ├── In-context memory (conversation buffer)
│   ├── Summarization memory (compress old turns)
│   ├── External memory: vector store retrieval for long-term memory
│   ├── Entity memory: tracking people, facts, preferences
│   └── Episodic vs semantic memory in production agents
│
├── MODULE 8 — Agentic Application Architectures
│   ├── What makes an app "agentic"
│   ├── ReAct pattern: Reason + Act loops
│   ├── Plan-and-Execute agents
│   ├── Multi-agent systems: orchestrator + specialized sub-agents
│   ├── Human-in-the-loop: approval gates, escalation
│   └── Agentic failure modes and recovery strategies
│
├── MODULE 9 — Frontend, Backend & Full-Stack AI Stack
│   ├── Prototyping UI: Streamlit, Gradio, Chainlit
│   ├── Production backend: FastAPI + Pydantic v2
│   ├── Production frontend: Next.js + Vercel AI SDK
│   ├── Streaming responses (SSE, WebSockets)
│   ├── Authentication, rate limiting, multitenancy
│   └── Deployment: Docker, Modal, Fly.io, Vercel, AWS
│
├── MODULE 10 — Evaluation, Observability & Guardrails
│   ├── LLM evaluation: correctness, faithfulness, relevance
│   ├── LLM-as-judge (GPT-4 / Claude scoring outputs)
│   ├── Observability: LangSmith, Helicone, Arize Phoenix, Langfuse
│   ├── Tracing: prompt, retrieval step, tool call, response
│   ├── Guardrails: input/output content filters, schema validation
│   ├── OWASP Top 10 for LLMs: prompt injection, data leakage
│   └── A/B testing prompts and models in production
│
└── MODULE 11 — Cost, Latency & Production Optimization
    ├── Token counting and cost estimation
    ├── Prompt caching (Anthropic, OpenAI)
    ├── Semantic caching (cache by query similarity)
    ├── Model routing: GPT-4o vs GPT-4o-mini based on complexity
    ├── Batching async requests
    └── Self-hosted vs API: the cost crossover point
```

AI APPLICATION DEVELOPMENT
│
├── MODULE 1 — LLM APIs & Provider Landscape
│   ├── OpenAI API (GPT-4o, o1, o3 family)
│   ├── Anthropic API (Claude 3 / 4 family)
│   ├── Google Gemini API
│   ├── Open-source via HuggingFace Inference Endpoints
│   ├── Self-hosted models (vLLM, Ollama)
│   ├── API cost structures: input/output tokens, cached tokens
│   └── Multi-provider routing & fallback strategies
│
├── MODULE 2 — Prompt Engineering for Production
│   ├── Zero-shot prompting
│   ├── Few-shot prompting (3–5 high-quality examples)
│   ├── Chain-of-Thought (CoT) and Zero-Shot CoT
│   ├── System prompts and role assignment
│   ├── Structured output: JSON mode, response schemas
│   ├── Meta-prompting and prompt templates
│   ├── Prompt versioning and testing
│   └── Automated prompt optimization (DSPy)
│
├── MODULE 3 — Retrieval-Augmented Generation (RAG)
│   ├── Why RAG: knowledge cutoff + hallucination + private data
│   ├── RAG pipeline: Ingest → Chunk → Embed → Store → Retrieve → Generate
│   ├── Document loaders (PDF, DOCX, HTML, CSV, Notion, etc.)
│   ├── Chunking strategies (fixed, semantic, recursive, AST-based)
│   ├── Naive RAG vs Advanced RAG vs Agentic RAG
│   ├── Hybrid search (dense + sparse / BM25)
│   ├── Re-ranking (Cohere Rerank, cross-encoder models)
│   ├── HyDE (Hypothetical Document Embeddings)
│   ├── GraphRAG (knowledge graph + vector retrieval)
│   └── Evaluation: RAGAS, retrieval recall, precision
│
├── MODULE 4 — Vector Databases & Embedding Models
│   ├── Embedding models: text-embedding-3, Voyage-3, BGE, E5
│   ├── ANN search: HNSW, IVF-PQ algorithms
│   ├── Pinecone, Weaviate, Qdrant, Milvus, Chroma
│   ├── pgvector (PostgreSQL extension)
│   ├── Metadata filtering and hybrid search
│   └── Embedding drift, multi-tenancy, latency budgets
│
├── MODULE 5 — Orchestration Frameworks
│   ├── LangChain: chains, agents, memory, tools ecosystem
│   ├── LangGraph: graph-based stateful agent workflows
│   ├── LlamaIndex: RAG-optimized data framework
│   ├── DSPy (Stanford): prompt optimization as code
│   └── Choosing between frameworks for your use case
│
├── MODULE 6 — Tool Calling & Function Calling
│   ├── OpenAI / Anthropic function calling API
│   ├── Defining tools with JSON schema
│   ├── Tool execution loop: LLM calls tool → result returned → LLM continues
│   ├── Parallel tool calls
│   ├── MCP (Model Context Protocol) — Anthropic standard
│   └── Tool use safety: validation, sandboxing, permissions
│
├── MODULE 7 — Memory & State Management
│   ├── Conversation history: stateless vs stateful
│   ├── In-context memory (conversation buffer)
│   ├── Summarization memory (compress old turns)
│   ├── External memory: vector store retrieval for long-term memory
│   ├── Entity memory: tracking people, facts, preferences
│   └── Episodic vs semantic memory in production agents
│
├── MODULE 8 — Agentic Application Architectures
│   ├── What makes an app "agentic"
│   ├── ReAct pattern: Reason + Act loops
│   ├── Plan-and-Execute agents
│   ├── Multi-agent systems: orchestrator + specialized sub-agents
│   ├── Human-in-the-loop: approval gates, escalation
│   └── Agentic failure modes and recovery strategies
│
├── MODULE 9 — Frontend, Backend & Full-Stack AI Stack
│   ├── Prototyping UI: Streamlit, Gradio, Chainlit
│   ├── Production backend: FastAPI + Pydantic v2
│   ├── Production frontend: Next.js + Vercel AI SDK
│   ├── Streaming responses (SSE, WebSockets)
│   ├── Authentication, rate limiting, multitenancy
│   └── Deployment: Docker, Modal, Fly.io, Vercel, AWS
│
├── MODULE 10 — Evaluation, Observability & Guardrails
│   ├── LLM evaluation: correctness, faithfulness, relevance
│   ├── LLM-as-judge (GPT-4 / Claude scoring outputs)
│   ├── Observability: LangSmith, Helicone, Arize Phoenix, Langfuse
│   ├── Tracing: prompt, retrieval step, tool call, response
│   ├── Guardrails: input/output content filters, schema validation
│   ├── OWASP Top 10 for LLMs: prompt injection, data leakage
│   └── A/B testing prompts and models in production
│
└── MODULE 11 — Cost, Latency & Production Optimization
    ├── Token counting and cost estimation
    ├── Prompt caching (Anthropic, OpenAI)
    ├── Semantic caching (cache by query similarity)
    ├── Model routing: GPT-4o vs GPT-4o-mini based on complexity
    ├── Batching async requests
    └── Self-hosted vs API: the cost crossover point

```


```

MLOps — Machine Learning in Production
│
├── MODULE 1: Foundations & Systems Thinking
│   ├── 1.1 From Models to AI-Enabled Systems
│   ├── 1.2 Correctness, Risk & Error Framing
│   ├── 1.3 Requirements Engineering for ML Systems
│   └── 1.4 Interdisciplinary Team Dynamics
│
├── MODULE 2: Model Quality & Evaluation
│   ├── 2.1 Beyond Accuracy: Behavioral Testing
│   ├── 2.2 Slicing, Rubrics & Capability Evaluation
│   ├── 2.3 LLM-as-a-Judge & Automated Evaluation
│   └── 2.4 A/B Testing & Experiments in Production
│
├── MODULE 3: ML Pipelines & Automation
│   ├── 3.1 ML Pipeline Architecture
│   ├── 3.2 Automating & Testing ML Pipelines
│   ├── 3.3 Continuous Integration for ML (CI/CD/CT)
│   └── 3.4 Data Version Control (DVC)
│
├── MODULE 4: Model Deployment
│   ├── 4.1 Deployment Patterns (batch, online, streaming)
│   ├── 4.2 Model Serving (REST API, gRPC, edge)
│   ├── 4.3 Containerization with Docker
│   ├── 4.4 Orchestration with Kubernetes
│   └── 4.5 Canary Releases & Blue-Green Deployment
│
├── MODULE 5: Data Infrastructure & Scalability
│   ├── 5.1 Data Quality & Validation
│   ├── 5.2 Feature Stores
│   ├── 5.3 Stream Processing (Apache Kafka)
│   ├── 5.4 Batch vs Stream vs Lambda Architecture
│   └── 5.5 Scaling the Production System
│
├── MODULE 6: Monitoring & Observability
│   ├── 6.1 Infrastructure Monitoring (Prometheus, Grafana)
│   ├── 6.2 Data Drift & Concept Drift Detection
│   ├── 6.3 Feedback Loops
│   ├── 6.4 Model Performance Tracking
│   └── 6.5 Planning for Operations
│
├── MODULE 7: Responsible AI & Safety
│   ├── 7.1 ML Safety Engineering
│   ├── 7.2 ML Security & Adversarial Attacks
│   ├── 7.3 Fairness in ML Systems
│   ├── 7.4 Privacy & Differential Privacy
│   └── 7.5 Explainability (SHAP, LIME, LLM-as-a-Judge)
│
├── MODULE 8: Technical Debt & Process
│   ├── 8.1 Hidden Technical Debt in ML
│   ├── 8.2 ML Process & Agile Practices
│   ├── 8.3 Documentation & Model Cards
│   └── 8.4 Governance & Compliance (EU AI Act)
│
└── MODULE 9: LLMOps & AI Agents (2025–2026 Frontier)
    ├── 9.1 LLMOps vs MLOps
    ├── 9.2 Agentic Systems & MCP Security
    ├── 9.3 RAG in Production
    ├── 9.4 Prompt Versioning & Evaluation
    └── 9.5 GenAI Observability & Cost Management

```

```

BLOCKCHAIN TECHNOLOGIES
│
├── LAYER 0: CRYPTOGRAPHIC FOUNDATIONS
│   ├── Hash functions & collision resistance
│   ├── Merkle trees & Merkle proofs
│   ├── Public-key cryptography (ECDSA, BLS signatures)
│   └── Commitment schemes
│
├── LAYER 1A: BITCOIN
│   ├── UTXO model & transaction structure
│   ├── Bitcoin Script
│   ├── P2P network & mempool
│   ├── Mining & proof-of-work
│   ├── Nakamoto consensus & longest-chain rule
│   └── Wallets (HD wallets, BIP32/39/44)
│
├── LAYER 1B: CONSENSUS PROTOCOLS
│   ├── Classical consensus (BFT, PBFT, Tendermint)
│   ├── Network models (synchrony, asynchrony, partial sync)
│   ├── Nakamoto consensus & sybil resistance
│   ├── Proof-of-Stake (PoS) & accountable safety
│   ├── Selfish mining & 51% attacks
│   └── Availability–Finality Dilemma (Ebb-and-Flow)
│
├── LAYER 1C: ETHEREUM
│   ├── Account model vs UTXO
│   ├── Ethereum Virtual Machine (EVM)
│   ├── Gas & fee markets (EIP-1559)
│   ├── Solidity programming language
│   ├── ABI encoding & contract interaction
│   └── Ethereum post-Merge (PoS Ethereum)
│
├── DEFI APPLICATIONS
│   ├── Stablecoins (algorithmic, collateralized, fiat-backed)
│   ├── Lending & borrowing (Compound, Aave)
│   ├── Decentralized exchanges (Uniswap AMM, CPMM formula)
│   ├── Flash loans
│   ├── Yield farming & liquidity mining
│   ├── MEV (Maximal Extractable Value) & front-running
│   └── DAOs (Decentralized Autonomous Organizations)
│
├── PRIVACY
│   ├── Blockchain de-anonymization
│   ├── CoinJoin & mixing protocols
│   ├── Zcash & confidential transactions
│   └── ZK-proofs for privacy
│
├── ZERO-KNOWLEDGE PROOFS
│   ├── ZK-SNARK fundamentals (Groth16)
│   ├── PLONK (universal trusted setup)
│   ├── ZK-STARKs (transparent, post-quantum)
│   ├── Circom circuit language
│   ├── zkEVM (Polygon, zkSync, Scroll, Linea)
│   └── Applications: Zcash, Tornado Cash, zkRollups
│
├── SCALABILITY
│   ├── Payment channels & Lightning Network
│   ├── State channels
│   ├── Optimistic rollups (Optimism, Arbitrum)
│   ├── ZK rollups (zkSync, StarkNet, Polygon zkEVM)
│   ├── Data availability (EIP-4844 blobs)
│   └── Shared sequencing
│
├── SMART CONTRACT SECURITY
│   ├── Reentrancy attacks (The DAO hack)
│   ├── Integer overflow/underflow
│   ├── Oracle manipulation & flash loan attacks
│   ├── Access control failures
│   ├── Front-running (MEV)
│   ├── Static analysis (Slither, MythX)
│   └── Formal verification (Certora, Halmos)
│
├── OTHER L1 ARCHITECTURES
│   ├── Solana (Proof-of-History, SVM, Alpenglow)
│   ├── Sui & Aptos (Move language, object model)
│   └── Cosmos (IBC, app-chains)
│
├── LEGAL, REGULATION & TOKENOMICS
│   ├── Securities law (Howey Test)
│   ├── Token classification (utility vs security)
│   ├── Staking taxation
│   ├── CBDC (Central Bank Digital Currencies)
│   ├── Tokenomics design
│   └── DAO governance models
│
└── AI × BLOCKCHAIN FRONTIER
    ├── Account abstraction (EIP-7702)
    ├── On-chain AI inference
    ├── Post-quantum blockchains (BIP-360)
    ├── Cross-chain bridges (Optics/Celo)
    └── Private DAOs (ZK + governance)

```


```

COURSE 16: CYBERSECURITY
│
├── MODULE A: Foundations & Threat Modelling
│     ├── A1 — The Security Mindset: Attackers vs. Defenders
│     ├── A2 — Threat Models: Assumptions, Adversary Capabilities, Trust Boundaries
│     ├── A3 — Security Principles (Least Privilege, Defence-in-Depth, etc.)
│     ├── A4 — CIA Triad: Confidentiality, Integrity, Availability
│     ├── A5 — Attack Surfaces and Attack Vectors
│     └── A6 — Security Economics: Why Security Fails
│
├── MODULE B: Cryptography
│     ├── B1 — Symmetric Encryption (AES, block ciphers, modes of operation)
│     ├── B2 — Asymmetric Encryption (RSA, elliptic curve cryptography)
│     ├── B3 — Hash Functions (SHA-256, SHA-3, collision resistance)
│     ├── B4 — Message Authentication Codes (HMAC)
│     ├── B5 — Digital Signatures (RSA-PSS, ECDSA, Ed25519)
│     ├── B6 — Key Exchange (Diffie-Hellman, ECDH)
│     ├── B7 — Public Key Infrastructure (PKI, X.509 certificates, CAs)
│     ├── B8 — TLS / HTTPS (handshake, certificate validation, pitfalls)
│     ├── B9 — Post-Quantum Cryptography (lattice-based, CRYSTALS-Kyber/Dilithium)
│     └── B10 — Zero-Knowledge Proofs (basics; deep coverage in Report 13)
│
├── MODULE C: System Security
│     ├── C1 — Memory Safety: Buffer Overflows, Stack Smashing
│     ├── C2 — Control Hijacking Attacks (return-to-libc, ROP chains)
│     ├── C3 — Defences (ASLR, stack canaries, DEP/NX, CFI)
│     ├── C4 — Privilege Separation and Least Privilege
│     ├── C5 — Access Control Models (DAC, MAC, RBAC, ABAC)
│     ├── C6 — Operating System Security (reference monitors, capabilities)
│     ├── C7 — Sandboxing and Isolation (seccomp, containers, VMs)
│     ├── C8 — Hardware & Microarchitecture Security
│     │     ├── Spectre / Meltdown (speculative execution attacks)
│     │     ├── Rowhammer
│     │     ├── Intel TDX / AMD SEV (confidential computing)
│     │     └── Trusted Execution Environments (TEEs)
│     └── C9 — Malware: Viruses, Worms, Ransomware, Rootkits
│
├── MODULE D: Web Security
│     ├── D1 — The Web Security Model (SOP, CORS, CSP)
│     ├── D2 — Injection Attacks (SQL injection, command injection, XXE)
│     ├── D3 — Cross-Site Scripting (reflected, stored, DOM-based)
│     ├── D4 — Cross-Site Request Forgery (CSRF)
│     ├── D5 — Authentication Attacks (session hijacking, cookie theft, credential stuffing)
│     ├── D6 — Broken Access Control (IDOR, privilege escalation)
│     ├── D7 — Supply Chain Attacks (npm/PyPI poisoning, SolarWinds-style)
│     ├── D8 — HTTPS Pitfalls (HSTS, certificate pinning, BREACH, CRIME)
│     └── D9 — OWASP Top 10 Web Application Security Risks (2025)
│
├── MODULE E: Network Security
│     ├── E1 — Network Protocol Attacks (ARP spoofing, DNS poisoning, BGP hijacking)
│     ├── E2 — TCP/IP Attacks (SYN flooding, TCP session hijacking, MITM)
│     ├── E3 — Denial of Service (volumetric DDoS, application-layer DoS, amplification)
│     ├── E4 — Firewalls (packet filtering, stateful inspection, NGFW)
│     ├── E5 — Intrusion Detection & Prevention Systems (IDS/IPS, SIEM)
│     ├── E6 — VPNs and Tunnelling (IPSec, WireGuard, SSL VPN)
│     ├── E7 — Wireless Security (WPA3, 802.1X, rogue access points)
│     └── E8 — Privacy & Anonymity (Tor, onion routing, traffic analysis)
│
├── MODULE F: Application Security & Secure Development
│     ├── F1 — Secure Coding Principles (input validation, output encoding)
│     ├── F2 — Static Analysis and Dynamic Analysis
│     ├── F3 — Fuzzing (coverage-guided: AFL, libFuzzer, Honggfuzz)
│     ├── F4 — Symbolic Execution (KLEE, angr, Manticore)
│     ├── F5 — DevSecOps — Security in CI/CD Pipelines
│     ├── F6 — Dependency & Supply Chain Security (SBOMs, Sigstore)
│     └── F7 — Secure Code Review
│
├── MODULE G: Offensive Security (Ethical Hacking)
│     ├── G1 — Penetration Testing Methodology (PTES, OWASP Testing Guide)
│     ├── G2 — Reconnaissance (OSINT, Shodan, passive recon)
│     ├── G3 — Vulnerability Scanning (Nmap, Nessus, OpenVAS)
│     ├── G4 — Exploitation Frameworks (Metasploit, manual exploit development)
│     ├── G5 — Post-Exploitation (lateral movement, privilege escalation, persistence)
│     ├── G6 — Red Teaming vs. Penetration Testing
│     ├── G7 — Capture The Flag (CTF) competitions
│     └── G8 — Bug Bounty Programs
│
├── MODULE H: Defensive Security & Blue Teaming
│     ├── H1 — Security Operations Centres (SOC) and Roles
│     ├── H2 — SIEM Platforms (Splunk, Microsoft Sentinel, Elastic SIEM)
│     ├── H3 — Threat Intelligence (MITRE ATT&CK, threat feeds, IOCs)
│     ├── H4 — Incident Response (IR lifecycle, playbooks, forensics)
│     ├── H5 — Digital Forensics (memory forensics, disk imaging, chain of custody)
│     ├── H6 — Threat Hunting
│     └── H7 — Zero Trust Architecture (NIST SP 800-207, CISA ZT Maturity Model)
│
├── MODULE I: Cloud & Infrastructure Security
│     ├── I1 — Cloud Security Fundamentals (shared responsibility model)
│     ├── I2 — AWS / Azure / GCP Security Controls
│     ├── I3 — Identity & Access Management (IAM, MFA, PAM)
│     ├── I4 — Container Security (Docker, Kubernetes, image scanning)
│     ├── I5 — Infrastructure as Code Security (Terraform misconfiguration)
│     └── I6 — Cloud Security Posture Management (CSPM)
│
├── MODULE J: AI Security (NEW — 2025–2026)
│     ├── J1 — Threat Landscape for AI/LLM Systems
│     ├── J2 — OWASP Top 10 for LLM Applications (2025)
│     │     ├── LLM01: Prompt Injection
│     │     ├── LLM02: Sensitive Information Disclosure
│     │     ├── LLM03: Supply Chain Vulnerabilities
│     │     ├── LLM04: Data and Model Poisoning
│     │     ├── LLM05: Insecure Output Handling
│     │     ├── LLM06: Excessive Agency
│     │     ├── LLM07: System Prompt Leakage
│     │     ├── LLM08: Vector and Embedding Weaknesses
│     │     ├── LLM09: Misinformation
│     │     └── LLM10: Unbounded Consumption
│     ├── J3 — OWASP Agentic Top 10 (2026)
│     │     └── Agent Goal Hijacking, Tool Call Injection, etc.
│     ├── J4 — Adversarial Machine Learning (evasion, poisoning, extraction, inversion)
│     ├── J5 — AI-Assisted Penetration Testing (PentestGPT, LLM-guided hacking)
│     ├── J6 — Deepfakes as a Security Threat
│     └── J7 — Securing RAG Pipelines and Vector Databases
│
├── MODULE K: Governance, Risk & Compliance (GRC)
│     ├── K1 — Cybersecurity Frameworks (NIST CSF 2.0, ISO 27001, CIS Controls v8)
│     ├── K2 — Risk Management (risk assessment, risk treatment, residual risk)
│     ├── K3 — Compliance Regimes (GDPR, HIPAA, PCI-DSS, SOC 2, FedRAMP)
│     ├── K4 — Security Policies and Procedures
│     ├── K5 — EU Cyber Resilience Act (2025 enforcement begins 2026)
│     └── K6 — Security Metrics and Reporting to the Board
│
└── MODULE L: Cryptographic Deep Dives (Advanced)
      ├── L1 — Formal Security Definitions (IND-CPA, IND-CCA2, existential unforgeability)
      ├── L2 — Provable Security and Reductions
      ├── L3 — Zero-Knowledge Proofs (ZK-SNARKs, ZK-STARKs)
      ├── L4 — Multi-Party Computation (MPC)
      ├── L5 — Homomorphic Encryption
      ├── L6 — Post-Quantum Cryptography Standards (NIST PQC 2024 final standards)
      └── L7 — Secure Channels and Authenticated Key Exchange
```