# 📘 Report 11: Data Structures & Algorithms
## World-Class CS/AI/ML Curriculum Deep-Dive Series
### MIT · Stanford · CMU · Berkeley · Harvard · Cambridge

> **Depth Level:** 🟡 Intermediate → 🔴 Advanced  
> **Prerequisites:** Python or C++ fundamentals, discrete mathematics, basic proof-writing  
> **Research Date:** May 2026  
> **Primary Sources:** MIT OCW 6.006 (Spring 2020), MIT 6.046J, Stanford CS161, CMU 15-210, Harvard CS124

---

## 1. Course Overview & University Positioning

Data Structures and Algorithms (DSA) is the **intellectual core of computer science**. It is the discipline that transforms programming from writing instructions into engineering solutions — teaching students how to represent data efficiently, how to reason about computational cost, and how to design systematic approaches to complex problems.

Every top university treats DSA as a foundational requirement. At MIT, students cannot proceed to advanced systems, AI, or theory courses without passing 6.006. At Stanford and CMU, the equivalent courses gate access to nearly every upper-division CS track. The material studied here directly determines performance in technical interviews at Google, Meta, Apple, Amazon, Microsoft, and virtually every software company.

Unlike many CS subjects that shift rapidly with technology trends, DSA is **stable knowledge** — the B-tree invented in 1970, Dijkstra's algorithm from 1959, and the merge sort analysis from the 1940s remain as relevant in 2026 as ever. What has changed is context: today's engineer applies these ideas inside distributed systems, ML pipelines, real-time inference engines, and LLM orchestration layers. DSA provides the reasoning toolkit that makes that application possible.

### University Course Map

| University | Course Code | Course Name | Level | Language |
|------------|-------------|-------------|-------|----------|
| **MIT** | 6.006 | Introduction to Algorithms | Undergrad | Python |
| **MIT** | 6.046J | Design & Analysis of Algorithms | Undergrad/Grad | Any |
| **Stanford** | CS161 | Design and Analysis of Algorithms | Undergrad | Any |
| **CMU** | 15-210 | Parallel & Sequential Data Structures and Algorithms | Undergrad | SML / C++ |
| **CMU** | 15-451 / 15-351 | Algorithm Design and Analysis | Undergrad/Grad | Any |
| **Harvard** | CS124 | Data Structures and Algorithms | Undergrad | Any |
| **Berkeley** | CS170 | Efficient Algorithms and Intractable Problems | Undergrad | Python |
| **Cambridge** | Part IA Algorithms | Algorithms | Undergrad (Part IA) | Pseudocode |

---

## 2. Prerequisite Map

```
REQUIRED BEFORE STARTING DSA
├── Programming Fundamentals
│   ├── Variables, loops, functions, recursion
│   ├── Python (MIT track) or C++ (competitive track) or Java
│   └── Basic OOP concepts
│
├── Discrete Mathematics
│   ├── Logic and proof techniques (induction, contradiction)
│   ├── Sets, relations, functions
│   ├── Combinatorics and counting
│   └── Basic graph theory (nodes, edges, paths)
│
├── Mathematics
│   ├── Logarithms and exponentials
│   ├── Summation notation (Σ)
│   └── Basic probability (for randomized algorithms)
│
└── Recommended (not required)
    ├── Linear algebra basics (for advanced topics)
    └── Proof-writing comfort

COURSES THIS UNLOCKS (post-DSA)
├── MIT 6.046J — Advanced Algorithm Design
├── Stanford CS265 — Randomized Algorithms
├── CMU 15-750 — Graduate Algorithms
├── Any systems course (databases, OS, compilers)
├── ML/AI courses (algorithms underpin ML efficiency)
└── Competitive programming at ICPC / Codeforces level
```

---

## 3. Topic Tree — Complete Curriculum

```
DATA STRUCTURES & ALGORITHMS
│
├── MODULE 1: FOUNDATIONS
│   ├── What is an algorithm? Models of computation
│   ├── Asymptotic notation: O, Ω, Θ, o, ω
│   ├── Worst-case, best-case, average-case analysis
│   ├── Recurrence relations & Master Theorem
│   └── RAM model of computation
│
├── MODULE 2: ELEMENTARY DATA STRUCTURES
│   ├── Arrays (static & dynamic)
│   ├── Linked Lists (singly, doubly, circular)
│   ├── Stacks & Queues (array-based & linked)
│   ├── Hash Tables
│   │   ├── Hash functions & universal hashing
│   │   ├── Chaining vs. open addressing
│   │   └── Load factor & amortized analysis
│   └── Sequences & Sets (abstract interface)
│
├── MODULE 3: SORTING
│   ├── Comparison-based sorting
│   │   ├── Insertion Sort — O(n²)
│   │   ├── Merge Sort — O(n log n)
│   │   ├── Heap Sort — O(n log n)
│   │   └── Quick Sort — O(n log n) average
│   ├── Sorting lower bound — Ω(n log n) proof
│   └── Linear-time sorting
│       ├── Counting Sort
│       ├── Radix Sort
│       └── Bucket Sort
│
├── MODULE 4: TREES
│   ├── Binary Trees (structure, traversals)
│   ├── Binary Search Trees (BST)
│   │   ├── Insert, delete, search — O(h)
│   │   └── Height analysis
│   ├── Balanced BSTs
│   │   ├── AVL Trees (MIT emphasis)
│   │   ├── Red-Black Trees
│   │   └── Rotations and rebalancing
│   ├── Heaps & Priority Queues
│   │   ├── Min-heap, max-heap
│   │   ├── Heapify, build-heap — O(n)
│   │   └── Heap sort
│   └── Advanced Trees (graduate level)
│       ├── B-Trees and B+-Trees
│       ├── Segment Trees
│       ├── Fenwick Trees (Binary Indexed Trees)
│       └── Tries (prefix trees)
│
├── MODULE 5: GRAPHS
│   ├── Representations: adjacency matrix, adjacency list
│   ├── Graph traversal
│   │   ├── Breadth-First Search (BFS) — O(V+E)
│   │   └── Depth-First Search (DFS) — O(V+E)
│   ├── Topological Sort
│   ├── Strongly Connected Components (Kosaraju, Tarjan)
│   ├── Shortest Paths
│   │   ├── BFS (unweighted)
│   │   ├── Dijkstra's Algorithm — O((V+E) log V)
│   │   ├── Bellman-Ford — O(VE)
│   │   ├── Floyd-Warshall (APSP) — O(V³)
│   │   └── Johnson's Algorithm (sparse APSP)
│   └── Minimum Spanning Trees
│       ├── Prim's Algorithm
│       └── Kruskal's Algorithm + Union-Find
│
├── MODULE 6: ALGORITHM DESIGN PARADIGMS
│   ├── Divide & Conquer
│   │   ├── Merge Sort, Quick Sort
│   │   ├── Binary Search
│   │   ├── Strassen's Matrix Multiplication
│   │   └── Closest Pair of Points
│   ├── Dynamic Programming
│   │   ├── Memoization vs. tabulation
│   │   ├── Fibonacci, rod cutting, coin change
│   │   ├── Longest Common Subsequence (LCS)
│   │   ├── Longest Increasing Subsequence (LIS)
│   │   ├── 0/1 Knapsack & Subset Sum
│   │   ├── Edit Distance (Levenshtein)
│   │   ├── Matrix Chain Multiplication
│   │   └── Pseudopolynomial algorithms
│   ├── Greedy Algorithms
│   │   ├── Activity selection
│   │   ├── Huffman coding
│   │   ├── Fractional knapsack
│   │   └── Greedy proof techniques (exchange argument)
│   └── Amortized Analysis
│       ├── Aggregate method
│       ├── Accounting method
│       └── Potential method
│
├── MODULE 7: ADVANCED TOPICS (6.046J / CS161 level)
│   ├── Randomized Algorithms
│   │   ├── Randomized Quick Sort
│   │   ├── Hashing with randomization
│   │   ├── Bloom filters
│   │   └── Skip lists
│   ├── Network Flow
│   │   ├── Max-flow Min-cut theorem
│   │   ├── Ford-Fulkerson algorithm
│   │   └── Applications (bipartite matching)
│   ├── Computational Geometry
│   │   ├── Convex hull (Graham scan, Jarvis march)
│   │   └── Line segment intersection
│   ├── String Algorithms
│   │   ├── KMP pattern matching
│   │   ├── Rabin-Karp rolling hash
│   │   └── Z-algorithm
│   └── Number-Theoretic Algorithms
│       ├── GCD (Euclidean algorithm)
│       ├── Modular exponentiation
│       └── RSA basics
│
└── MODULE 8: COMPLEXITY THEORY
    ├── P and NP
    ├── NP-completeness & polynomial reductions
    ├── NP-complete problems (SAT, Clique, Vertex Cover)
    └── Approximation algorithms
```

---

## 4. Detailed Chapter Breakdown

### Chapter 1 — Foundations & Asymptotic Analysis

**Theory.** An algorithm is a finite, deterministic, and effective procedure for solving a computational problem. The **RAM (Random Access Machine)** model is the standard abstraction: each basic operation (arithmetic, memory read/write, comparison) costs unit time.

**Asymptotic Notation** describes the growth of functions as input size *n → ∞*:

| Notation | Meaning | Formal Definition |
|----------|---------|-------------------|
| `O(g(n))` | Upper bound (at most) | ∃c, n₀: f(n) ≤ c·g(n) for all n ≥ n₀ |
| `Ω(g(n))` | Lower bound (at least) | ∃c, n₀: f(n) ≥ c·g(n) for all n ≥ n₀ |
| `Θ(g(n))` | Tight bound | f(n) = O(g(n)) AND f(n) = Ω(g(n)) |
| `o(g(n))` | Strictly less | lim(n→∞) f(n)/g(n) = 0 |
| `ω(g(n))` | Strictly greater | lim(n→∞) f(n)/g(n) = ∞ |

**Master Theorem** for recurrences `T(n) = aT(n/b) + f(n)`:

```
Case 1: f(n) = O(n^(log_b a - ε))  →  T(n) = Θ(n^log_b a)
Case 2: f(n) = Θ(n^(log_b a))      →  T(n) = Θ(n^log_b a · log n)
Case 3: f(n) = Ω(n^(log_b a + ε))  →  T(n) = Θ(f(n))
```

Example: Merge Sort has T(n) = 2T(n/2) + Θ(n). Here a=2, b=2, n^log_b_a = n¹. Case 2 applies → **T(n) = Θ(n log n)**.

---

### Chapter 2 — Hash Tables

**Concept.** A hash table maps keys to values in O(1) average time using a hash function h: U → {0, 1, ..., m-1} where U is the universe of keys and m is the table size.

**Collision resolution:**
- **Chaining:** each slot holds a linked list. Average-case O(1) with load factor α = n/m < 1.
- **Open addressing:** probe the table linearly, quadratically, or with double hashing until an empty slot is found.

**Universal hashing:** A family H of hash functions is universal if for any two distinct keys x ≠ y: Pr[h(x) = h(y)] ≤ 1/m. This gives expected O(1) lookups regardless of input.

**Perfect hashing** (Fredman et al., 1984): achieves O(1) worst-case lookup using two levels of hashing — useful when the key set is static.

---

### Chapter 3 — Binary Trees & AVL Trees

**BST Invariant:** For every node n, all keys in its left subtree are < n.key, and all keys in its right subtree are > n.key.

**Height problem:** A random BST has expected height O(log n), but adversarial insertion yields O(n). AVL trees solve this.

**AVL Tree:** Self-balancing BST where the heights of the two subtrees of any node differ by at most 1. The **balance factor** BF(n) = height(right) − height(left) ∈ {-1, 0, 1}.

**Rotations** restore the AVL property after insertions and deletions:
```
Right Rotation (LL case):
      z                y
     / \             /   \
    y   T4   →     x      z
   / \            / \    / \
  x   T3         T1  T2 T3  T4
 / \
T1  T2
```

All operations (search, insert, delete) on an AVL tree with n keys run in **O(log n)** time.

**Red-Black Trees** (used in Linux kernel, C++ STL `std::map`, Java `TreeMap`) offer similar guarantees with slightly faster insertions due to less strict balancing.

---

### Chapter 4 — Graph Algorithms

**Representations:**
- Adjacency matrix: O(V²) space, O(1) edge lookup
- Adjacency list: O(V+E) space, O(degree(v)) edge lookup

**BFS Algorithm** (discovers shortest paths in unweighted graphs):
```
BFS(G, s):
  for each vertex u ≠ s: color[u] = WHITE, d[u] = ∞
  color[s] = GRAY, d[s] = 0
  Q = {s}
  while Q ≠ ∅:
    u = DEQUEUE(Q)
    for each v in Adj[u]:
      if color[v] == WHITE:
        color[v] = GRAY
        d[v] = d[u] + 1
        ENQUEUE(Q, v)
    color[u] = BLACK
```
Time: **O(V + E)**

**Dijkstra's Algorithm** (non-negative edge weights):
```
Dijkstra(G, w, s):
  Initialize d[s] = 0, d[v] = ∞ for all v ≠ s
  S = ∅, Q = all vertices (min-priority queue on d)
  while Q ≠ ∅:
    u = EXTRACT-MIN(Q)
    S = S ∪ {u}
    for each v in Adj[u]:
      RELAX(u, v, w)   // d[v] = min(d[v], d[u] + w(u,v))
```
Time with binary heap: **O((V + E) log V)**. With Fibonacci heap: **O(V log V + E)**.

**Bellman-Ford** handles negative edge weights:
```
for i = 1 to |V| - 1:
  for each edge (u, v) ∈ E:
    RELAX(u, v, w)
# Check for negative cycles:
for each edge (u, v) ∈ E:
  if d[v] > d[u] + w(u,v): report NEGATIVE CYCLE
```
Time: **O(VE)**

---

### Chapter 5 — Dynamic Programming

**Core idea:** Break a problem into overlapping subproblems, solve each once, and cache results. DP requires **optimal substructure** (optimal solution contains optimal subsolutions) and **overlapping subproblems** (same subproblems reused).

**MIT's SRTBOT Framework** (6.006 formulation):
1. **S**ubproblem definition
2. **R**elation (recurrence)
3. **T**opological order (dependency order)
4. **B**ase cases
5. **O**riginal problem
6. **T**ime analysis

**Longest Common Subsequence (LCS):**

Let `dp[i][j]` = length of LCS of X[1..i] and Y[1..j]:

```
dp[i][j] = dp[i-1][j-1] + 1           if X[i] == Y[j]
          = max(dp[i-1][j], dp[i][j-1]) otherwise
Base: dp[0][j] = dp[i][0] = 0
```
Time: **O(mn)**, Space: **O(mn)** (reducible to O(min(m,n)) with rolling array).

**Edit Distance (Levenshtein):**
```
dp[i][j] = dp[i-1][j-1]                   if X[i] == Y[j]
          = 1 + min(dp[i-1][j],            // delete
                    dp[i][j-1],            // insert
                    dp[i-1][j-1])          // replace
```

**0/1 Knapsack:**
```
dp[i][w] = max(dp[i-1][w],               // don't take item i
               dp[i-1][w-wt[i]] + val[i]) // take item i (if w ≥ wt[i])
```
Time: **O(nW)** — pseudopolynomial (W is the capacity value, not its bit length).

---

### Chapter 6 — Greedy Algorithms

Greedy algorithms make the locally optimal choice at each step, hoping to find the global optimum. Unlike DP, they don't reconsider choices. Correctness must be proven — typically via an **exchange argument** (show that any solution not matching the greedy choice can be transformed into one that does, without worsening the objective).

**Huffman Coding** (optimal prefix-free codes):
```
Algorithm:
  Build min-heap of characters by frequency
  while heap has > 1 node:
    x = EXTRACT-MIN(heap)
    y = EXTRACT-MIN(heap)
    z = new node with freq = freq(x) + freq(y)
    z.left = x, z.right = y
    INSERT(heap, z)
  return remaining root
```
Time: **O(n log n)**. Proven optimal by exchange argument.

**Activity Selection Problem:** Given intervals [s_i, f_i], select maximum non-overlapping set. Greedy: always pick the activity that finishes earliest. Time: **O(n log n)** (dominated by sorting).

---

### Chapter 7 — Advanced: Network Flow

**Max-Flow Min-Cut Theorem** (Ford & Fulkerson, 1956): In any flow network, the maximum value of an s-t flow equals the minimum capacity of an s-t cut.

**Ford-Fulkerson Algorithm:**
```
Initialize f(e) = 0 for all edges e
while there exists an augmenting path p in residual graph G_f:
  send flow along p (bottleneck capacity)
  update residual graph
return total flow
```

**Bipartite matching** is reducible to max-flow in O(V·E) via Ford-Fulkerson, making this algorithm essential for scheduling, assignment problems, and recommendation systems.

---

### Chapter 8 — Complexity Theory

**P:** Problems solvable in polynomial time O(n^k) by a deterministic Turing machine.

**NP:** Problems verifiable in polynomial time — or equivalently, solvable in polynomial time by a nondeterministic Turing machine.

**NP-Hard:** At least as hard as any problem in NP (under polynomial-time reductions). A problem X is NP-hard if every NP problem Y satisfies Y ≤_p X.

**NP-Complete:** In NP AND NP-hard. If any NP-complete problem is in P, then P = NP.

**Key NP-complete problems:**

| Problem | Description |
|---------|-------------|
| 3-SAT | Boolean satisfiability with 3 literals/clause |
| Clique | Is there a clique of size k in a graph? |
| Vertex Cover | Set of k vertices covering all edges? |
| Hamiltonian Cycle | Does a Hamiltonian cycle exist? |
| Traveling Salesman | Shortest tour visiting all cities? |
| Subset Sum | Does a subset sum to target T? |

Cook-Levin Theorem (1971): SAT is NP-complete. All NP-complete problems are polynomial-time reducible to each other.

---

## 5. Practical Labs & Assignments

### MIT 6.006 — Problem Sets

| Problem Set | Topic | What Students Implement |
|-------------|-------|------------------------|
| PS0 | Prerequisites check | Basic Python, recursion, math |
| PS1 | Data structures | Dynamic arrays, linked lists, sequences |
| PS2 | Sorting & hashing | Hash table with chaining; linear sorts |
| PS3 | Binary trees | AVL tree with rotations; sequence interface |
| PS4 | Graphs | BFS and DFS on real datasets; topological sort |
| PS5 | Shortest paths | Dijkstra + Bellman-Ford; graph relaxation |
| PS6 | Dynamic programming | LCS, LIS, coin change, edit distance |
| PS7 | DP + Complexity | Knapsack; NP-hardness reductions |

### Stanford CS161 — Problem Sets

| Assignment | Focus |
|------------|-------|
| HW1 | Divide-and-conquer (merge sort analysis, Karatsuba) |
| HW2 | Randomized algorithms (QuickSort, randomized median) |
| HW3 | Graph algorithms (BFS, DFS, SCC) |
| HW4 | Shortest paths (Dijkstra, Bellman-Ford) |
| HW5 | Dynamic programming (knapsack, sequence alignment) |
| HW6 | Greedy + network flow |
| HW7 | NP-completeness reductions |

### CMU 15-210 — Lab Structure

CMU's 15-210 is distinctive in requiring **parallel algorithm implementation** in SML (Standard ML). Labs include:

| Lab | Topic | Parallelism Angle |
|-----|-------|-------------------|
| Lab 1 | Sequences and sorting | Parallel merge sort |
| Lab 2 | Trees and BSTs | Functional BST (immutable) |
| Lab 3 | Graph BFS | Parallel BFS via frontier expansion |
| Lab 4 | Graph contraction | Tree contraction algorithm |
| Lab 5 | Randomized algorithms | Parallel quicksort, treaps |
| Lab 6 | Dynamic programming | DP with functional memoization |

**CMU's unique emphasis:** Work-span analysis. Every algorithm is analyzed for **work** (total operations) and **span** (critical path length). The **parallelism** = Work/Span tells you how many processors can be efficiently used.

```
Parallel Merge Sort:
  Work = O(n log n)  [same as sequential]
  Span = O(log² n)   [key parallel advantage]
  Parallelism = O(n / log n)
```

---

## 6. Tools & Technologies

| Tool / Platform | Purpose | Used At |
|-----------------|---------|---------|
| **Python** | Primary implementation language | MIT, Harvard, Berkeley |
| **C++** | Performance-critical implementations | CMU (competitive track), Stanford |
| **SML (Standard ML)** | Functional + parallel algorithms | CMU 15-210 |
| **Java** | Alternative OOP implementation | Berkeley CS170 |
| **LeetCode** | Interview-style problem practice | All universities recommend |
| **Visualgo** (visualgo.net) | Algorithm animation / visualization | Teaching aid at all institutions |
| **CP-Algorithms** (cp-algorithms.com) | Reference for advanced topics | Competitive programmers |
| **Jupyter Notebooks** | Interactive Python algorithm exploration | MIT, Harvard |
| **GDB / Valgrind** | Debugging C++ implementations | CMU |
| **KACTL** | KTH's competitive programming template library | Advanced competitive track |
| **Codeforces / USACO** | Competitive programming practice | Stanford, CMU recommend |

---

## 7. Key Textbooks & Papers

| Title | Authors | Access | Tier |
|-------|---------|--------|------|
| **Introduction to Algorithms (CLRS)** | Cormen, Leiserson, Rivest, Stein | MIT Press (4th ed., 2022) | 🔴 Essential |
| **Algorithm Design** (KT) | Kleinberg, Tardos | Pearson | 🔴 Essential |
| **Algorithms** | Sedgewick & Wayne | Princeton / online slides free | 🟡 Strong |
| **The Algorithm Design Manual** | Skiena | Springer | 🟡 Practical |
| **Algorithms** (CLRS companion) | Dasgupta, Papadimitriou, Vazirani | Free PDF (UC Berkeley) | 🟢 Accessible |
| **Problem Solving with Algorithms & DS** | Miller & Ranum | Free online (runestone.academy) | 🟢 Beginner |
| **Competitive Programmer's Handbook** | Laaksonen | Free PDF (cses.fi) | 🔴 Advanced Practice |
| **Turing's 1936 paper** | Alan Turing | Free (historical) | 🟣 Foundational |
| **Ford-Fulkerson (1956)** | Ford & Fulkerson | Canadian Journal of Math | 🟣 Classic |
| **Dijkstra (1959)** | Edsger Dijkstra | Numerische Mathematik | 🟣 Classic |
| **A* Search (1968)** | Hart, Nilsson, Raphael | IEEE Transactions | 🟣 Classic |

---

## 8. University Comparison Table

| Topic | MIT 6.006 | Stanford CS161 | CMU 15-210 | Harvard CS124 | Berkeley CS170 |
|-------|-----------|----------------|------------|---------------|----------------|
| Asymptotic Analysis | ✅ Deep | ✅ Deep | ✅ Deep | ✅ Deep | ✅ Deep |
| Hashing | ✅ Universal | ✅ Randomized | ✅ Functional | ✅ Strong | ✅ Strong |
| AVL Trees | ✅ Primary focus | 🔶 Briefly | ✅ Treaps | 🔶 Briefly | 🔶 Briefly |
| Merge/Quick/Heap Sort | ✅ Full depth | ✅ Full depth | ✅ Parallel MSort | ✅ Full depth | ✅ Full depth |
| BFS/DFS | ✅ Full depth | ✅ Full depth | ✅ Parallel BFS | ✅ Full depth | ✅ Full depth |
| Dijkstra | ✅ Core | ✅ Core | ✅ Core | ✅ Core | ✅ Core |
| Bellman-Ford | ✅ Core | ✅ Core | 🔶 Briefly | ✅ Core | ✅ Core |
| Dynamic Programming | ✅ 4 Lectures | ✅ 3 Lectures | ✅ 2 Labs | ✅ Strong | ✅ Strong |
| Greedy Algorithms | ✅ Strong | ✅ Strong | 🔶 Lighter | ✅ Strong | ✅ Strong |
| Network Flow | 🔶 Briefly | ✅ Full coverage | 🔶 Briefly | 🔶 Briefly | ✅ Full coverage |
| Randomized Algorithms | ❌ (→6.046) | ✅ Strong | ✅ Core | 🔶 Brief | ✅ Strong |
| Parallel Algorithms | ❌ | ❌ | ✅ Core Focus | ❌ | ❌ |
| NP-Completeness | ✅ (Lecture 19) | ✅ Strong | 🔶 Brief | ✅ Strong | ✅ Strong |
| Amortized Analysis | ✅ Strong | ✅ Strong | ✅ Strong | ✅ Strong | ✅ Strong |
| String Algorithms | ❌ (→6.046) | 🔶 Optional | ❌ | 🔶 Optional | ❌ |
| Computational Geometry | ❌ (→6.046) | 🔶 Optional | ❌ | ❌ | ❌ |

**Legend:** ✅ Primary coverage | 🔶 Partial/optional | ❌ Not covered (see advanced course)

---

## 9. Key Algorithms: Complexity Quick Reference

| Algorithm | Best | Average | Worst | Space |
|-----------|------|---------|-------|-------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) |
| Counting Sort | O(n+k) | O(n+k) | O(n+k) | O(k) |
| Binary Search | O(1) | O(log n) | O(log n) | O(1) |
| BST Search | O(log n) | O(log n) | O(n) | — |
| AVL Search | O(log n) | O(log n) | O(log n) | — |
| Hash Table (avg) | O(1) | O(1) | O(n) | O(n) |
| BFS / DFS | — | — | O(V+E) | O(V) |
| Dijkstra (heap) | — | — | O((V+E) log V) | O(V) |
| Bellman-Ford | — | — | O(VE) | O(V) |
| Floyd-Warshall | — | — | O(V³) | O(V²) |
| Prim's (heap) | — | — | O(E log V) | O(V) |
| Kruskal's | — | — | O(E log E) | O(V) |
| LCS (DP) | — | — | O(mn) | O(mn) |

---

## 10. DSA & Its Relevance to AI/ML (2025–2026)

A persistent misconception is that AI/ML engineers don't need DSA. This is false. The following table shows direct mappings:

| DSA Concept | Where It Appears in AI/ML |
|-------------|--------------------------|
| **Hash tables** | Embedding lookup tables, attention key-value caches (KV cache in LLMs) |
| **Priority queues / Heaps** | Beam search in NLP (top-k sampling), A* pathfinding in agents |
| **Graph algorithms (BFS/DFS)** | Knowledge graph traversal, dependency resolution, DAG scheduling |
| **Dynamic programming** | Sequence-to-sequence alignment (CTC loss), Viterbi decoding (HMMs) |
| **Shortest paths (Dijkstra)** | Routing in multi-agent systems, navigation AI |
| **Sorting** | Data preprocessing pipelines, retrieval ranking (top-k results) |
| **Trees (BST / B-Trees)** | Database indexes behind vector DBs (Pinecone, Weaviate use tree-based indexes) |
| **Tries** | Tokenizer implementations (BPE trie), autocomplete |
| **Union-Find** | Connected components in graph neural networks |
| **Divide & Conquer** | Parallel training across GPU workers (recursive data splitting) |
| **Amortized analysis** | Understanding dynamic array growth in ML framework tensors |
| **NP-completeness** | Understanding why hyperparameter optimization is hard; motivates approximations |
| **Randomized algorithms** | Stochastic gradient descent, random projections (LSH for ANN search) |

**Approximate Nearest Neighbor (ANN) search** — the engine behind vector databases used in RAG (Retrieval-Augmented Generation) — relies on advanced DSA: locality-sensitive hashing (LSH), HNSW (Hierarchical Navigable Small World graphs), and product quantization. The efficiency of every LLM retrieval system depends directly on DSA.

---

## 11. Industry Relevance (2025–2026 Job Market)

DSA mastery is one of the most directly monetizable technical skills in software engineering, for several reasons:

**Technical Interviews.** Companies including Google, Meta, Apple, Amazon, Microsoft, and virtually all top-tier tech employers use DSA-based coding interviews as primary screens. A 2026 survey across job listings found thousands of postings explicitly requiring demonstrated DSA proficiency.

**Salary impact.** Data engineers and software engineers with strong algorithmic foundations command significantly higher compensation. U.S. data engineers with strong DSA skills typically exceed $100K annually in base compensation, with senior engineers at tier-1 companies reaching $200K–$400K total compensation.

**AI-era relevance.** The rise of LLMs and AI tools does not diminish the need for DSA. AI tools can generate syntactically correct code but cannot reliably determine *which* data structure is optimal for a given problem, or *why* a chosen algorithm will fail at scale. This judgment requires deep DSA understanding.

### Career Paths and DSA Relevance

| Role | DSA Relevance | Key Topics |
|------|--------------|------------|
| Software Engineer (SWE) | 🔴 Critical | Arrays, trees, graphs, DP (interview standard) |
| ML Engineer | 🔴 High | Graph algorithms, DP (Viterbi), sorting, hashing |
| Data Engineer | 🔴 High | Sorting pipelines, hash joins, B-tree indexes |
| Backend Engineer | 🔴 High | Hash tables, trees, caching algorithms |
| Competitive Programmer | 🟣 Advanced | All topics + segment trees, network flow, geometry |
| Research Scientist | 🟡 Medium | Algorithm analysis, complexity, randomized methods |
| DevOps / Platform Eng | 🟡 Medium | Graph scheduling (DAGs), queue structures |
| Frontend Engineer | 🟢 Lower | Basic sorting/searching, tree traversal (DOM) |

### Top Companies and Their DSA Interview Expectations

| Company | Interview Style | Emphasis |
|---------|----------------|----------|
| Google | 4–6 coding rounds (LeetCode Hard) | Graphs, DP, advanced optimization |
| Meta | 2 coding rounds (LeetCode Medium–Hard) | Arrays, trees, graphs |
| Amazon | 2 coding + LP rounds (Medium) | Arrays, strings, trees |
| Microsoft | 3–5 coding rounds (Medium) | All standard topics |
| Apple | 2–3 coding rounds | Trees, graphs, design |
| Stripe | Systems-heavy with DSA | Hash tables, algorithms in context |
| Startups | 1–2 rounds (Medium) | Practical problem-solving |

---

## 12. Learning Path Recommendations

### Student Track (12–16 weeks)
```
Weeks 1–2:   Asymptotic analysis, arrays, linked lists, stacks, queues
Weeks 3–4:   Hash tables, sorting (merge, quick, heap)
Weeks 5–6:   Binary trees, BSTs, AVL trees
Weeks 7–8:   Heaps, priority queues, graph representations
Weeks 9–10:  BFS, DFS, topological sort, shortest paths
Weeks 11–12: Dynamic programming (core patterns)
Weeks 13–14: Greedy algorithms, amortized analysis
Weeks 15–16: NP-completeness, review, and practice
```

### Interview Prep Track (8 weeks, assumes foundations)
```
Weeks 1–2:   Arrays, strings, hashing (LeetCode Easy/Medium)
Weeks 3–4:   Trees, BST, heaps (LeetCode Medium)
Weeks 5–6:   Graphs: BFS, DFS, Dijkstra (LeetCode Medium/Hard)
Weeks 7–8:   Dynamic programming patterns (LeetCode Medium/Hard)
Daily:       2–3 LeetCode problems; review solutions systematically
```

### Advanced/Research Track (post-foundations)
```
→ MIT 6.046J: Randomized algorithms, network flow, computational geometry
→ Stanford CS265: Randomized methods at graduate level
→ CMU 15-750: Graduate algorithms
→ Competitive programming: Codeforces Div 1/2, ICPC
```

---

## 13. Research Links & Sources

| Source | URL | Type |
|--------|-----|------|
| MIT 6.006 Spring 2020 (OCW) | https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/ | Primary |
| MIT 6.006 Lecture Notes Index | https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/pages/lecture-notes/ | Lecture Notes |
| MIT 6.046J Design & Analysis | https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015/ | Advanced |
| Stanford CS161 (current) | https://cs161.stanford.edu/ | Primary |
| Stanford CS161 Bulletin | https://bulletin.stanford.edu/courses/1056871 | Course Description |
| CMU 15-210 (Spring 2026) | https://www.cs.cmu.edu/~15210/ | Primary |
| CMU 15-351/650 Fall 2024 | https://courses.ywyu.net/15351-2024-fall/ | Schedule |
| CLRS Textbook (MIT Press) | https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/ | Textbook |
| Harvard CS124 | https://www.sketchingbigdata.org/ | Course |
| CP-Algorithms Reference | https://cp-algorithms.com/ | Reference |
| Visualgo | https://visualgo.net/ | Visual Tool |
| KACTL Template Library | https://github.com/kth-competitive-programming/kactl | Competitive |
| LeetCode Problems | https://leetcode.com/problemset/ | Practice |
| DPV Algorithms (free) | https://people.eecs.berkeley.edu/~vazirani/algorithms.html | Textbook |

---

## Summary

Data Structures and Algorithms is the bedrock of computer science education and professional practice. Its core curriculum — asymptotic analysis, fundamental data structures, sorting, graph algorithms, dynamic programming, and greedy techniques — is stable across MIT, Stanford, CMU, Harvard, and Berkeley, even as each institution brings its own emphasis. MIT stresses mathematical rigor and the sequence interface abstraction; CMU uniquely incorporates parallel algorithm analysis; Stanford foregrounds randomized techniques and average-case analysis.

The subject is directly and demonstrably relevant to AI/ML engineering, backend systems, database design, and virtually every software discipline. In 2026, despite the proliferation of AI coding assistants, DSA knowledge remains the clearest signal of engineering capability that industry uses to evaluate candidates — and the deepest foundation for building systems that are not just correct, but efficient.

---

*Report 11 of 13 — Data Structures & Algorithms*  
*Research conducted May 2026 — Sources: MIT OCW, Stanford CS161, CMU 15-210, Harvard CS124, industry job data*  
*Part of the World-Class CS/AI/ML Curriculum Deep-Dive Series*
