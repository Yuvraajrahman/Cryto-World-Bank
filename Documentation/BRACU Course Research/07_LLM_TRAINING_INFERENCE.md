# 📘 REPORT 07 — LLMs: MODEL TRAINING & INFERENCE
## World-Class CS / AI / ML Curriculum Deep-Dive Report Series
### Based on Stanford · MIT · CMU · Berkeley · Harvard · Oxford

---

> **Course Number:** 7 of 12  
> **File:** `07_LLM_TRAINING_INFERENCE.md`  
> **Research Date:** May 2026  
> **Depth Level:** 🔴 Advanced → 🟣 PhD  
> **Primary Source:** Stanford CS324 — Large Language Models  
> **Cross-validated across:** Stanford, MIT, CMU, Berkeley, Harvard  

---

## TABLE OF CONTENTS

1. [Course Overview & University Comparison](#1-course-overview--university-comparison)
2. [Prerequisite Map](#2-prerequisite-map)
3. [Topic Tree — All Modules](#3-topic-tree--all-modules)
4. [Detailed Chapter Breakdown](#4-detailed-chapter-breakdown)
   - 4.1 Language Model Foundations
   - 4.2 Tokenization & Embeddings
   - 4.3 The Transformer Architecture (Deep Dive)
   - 4.4 Pre-Training at Scale
   - 4.5 Scaling Laws
   - 4.6 Alignment & Post-Training (RLHF, DPO, RLVR)
   - 4.7 Parameter-Efficient Fine-Tuning (LoRA, QLoRA, PEFT)
   - 4.8 Inference Optimization
   - 4.9 Evaluation, Benchmarks & Hallucination
   - 4.10 Emerging Architectures & Frontier Topics
5. [Practical Labs & Assignments](#5-practical-labs--assignments)
6. [Tools & Technologies](#6-tools--technologies)
7. [Key Textbooks & Papers](#7-key-textbooks--papers)
8. [University Comparison Table](#8-university-comparison-table)
9. [Industry Relevance — 2025–2026](#9-industry-relevance--20252026)
10. [Research Links & Sources](#10-research-links--sources)

---

## 1. Course Overview & University Comparison

### What This Course Covers

Large Language Models (LLMs) sit at the center of the current AI revolution. This course provides PhD-level understanding of how LLMs are built, trained, aligned, deployed, and optimized. It spans the entire lifecycle of a modern language model — from raw text corpora and tokenization, through multi-billion parameter Transformer training, through alignment with human preferences, to production-grade inference serving hundreds of thousands of concurrent users.

Unlike a practitioner course that merely *uses* LLMs via APIs, this course teaches you to reason about what happens inside the model at every stage. The mathematical, systems, and algorithmic foundations are all covered.

### The Primary Course: Stanford CS324

Stanford CS324 — *Large Language Models* is the gold standard academic course for this topic. Taught by Percy Liang, Tatsu Hashimoto, and Christopher Ré, the course covers:

- Fundamentals of language models and their mathematical basis
- Capabilities and emergent behaviors of LLMs
- Data pipelines and the content of pretraining corpora
- Modeling: Transformer architecture, attention variants
- Training: distributed training, scaling laws, optimization
- Task adaptation: prompt engineering, in-context learning, fine-tuning
- Harms, evaluation, ethics, and societal impact

**Course format:** 90-minute lectures alternating with student paper-panel discussions. All students read and review 1–2 research papers per class.

### Secondary Courses Referenced

| University | Course | Key Focus |
|------------|--------|-----------|
| Stanford | CS324 — Large Language Models | Comprehensive LLM theory + practice |
| Stanford | CS224G — Building LLM Applications | LLM app development layer |
| MIT | 6.S191 — Intro to Deep Learning | Deep learning foundations incl. Transformers |
| CMU | 11-667 — Large Language Models | NLP + LLM research track |
| Berkeley | CS294/194 — LLM Agents | Agent + inference focus |
| Harvard | CS197 — AI Research Experiences | Applied LLM research |
| Oxford | Deep Learning course (MPhil) | Theoretical DL + LLMs |

---

## 2. Prerequisite Map

```
REQUIRED PREREQUISITES
│
├── Linear Algebra
│   ├── Matrix multiplication (critical — every forward pass IS matrix math)
│   ├── Eigendecomposition, SVD (used in LoRA, PCA for embeddings)
│   └── Vector spaces, dot products, norms
│
├── Calculus & Optimization
│   ├── Chain rule (backpropagation = multi-level chain rule)
│   ├── Gradient descent, SGD, Adam optimizer
│   └── Jacobians and Hessians (second-order methods)
│
├── Probability & Statistics
│   ├── Probability distributions, conditional probability
│   ├── Maximum Likelihood Estimation (MLE) — the loss function is MLE
│   ├── KL divergence, cross-entropy (core to training objective)
│   └── Bayesian inference basics
│
├── Machine Learning (Report 05)
│   ├── Supervised learning, neural networks
│   ├── Regularization, overfitting, generalization
│   └── Backpropagation, batch normalization
│
├── Deep Learning
│   ├── CNNs, RNNs (historical context)
│   ├── Attention mechanisms
│   └── PyTorch or JAX proficiency
│
└── Programming
    ├── Python (proficient) — see Report 10
    ├── NumPy, PyTorch
    └── UNIX/HPC environment basics
```

**Recommended but not required:** Information theory (entropy, mutual information), systems programming, CUDA basics.

---

## 3. Topic Tree — All Modules

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

---

## 4. Detailed Chapter Breakdown

---

### 4.1 Language Model Foundations

**Definition:**
A language model assigns a probability distribution over sequences of tokens. Given a vocabulary V, an LM defines:

```
P(x₁, x₂, ..., xₙ) = ∏ P(xₜ | x₁, ..., xₜ₋₁)
```

This factorization via the **chain rule of probability** is the mathematical core of all autoregressive LLMs. The model is trained to maximize the likelihood of the observed token sequence — i.e., to correctly predict the next token given the preceding context.

**Perplexity:**
The standard intrinsic evaluation metric for language models is perplexity (PPL), defined as:

```
PPL(X) = exp(- (1/N) Σ log P(xₜ | x₁,...,xₜ₋₁))
```

Lower perplexity = better model. GPT-2 achieved ~29 PPL on WikiText-103 in 2019; modern models are dramatically lower on equivalent benchmarks.

**From N-grams to Transformers:**
The historical arc is: count-based n-gram models (1990s–2000s) → feed-forward neural language models (Bengio 2003) → RNN/LSTM language models (2010s) → attention-based Transformers (2017) → GPT-scale autoregressive LLMs (2019–present).

---

### 4.2 Tokenization & Embeddings

**Why tokenization matters:**
LLMs operate on *tokens*, not characters or words. The tokenizer's design directly affects model capability, multilingual coverage, and efficiency.

**Byte Pair Encoding (BPE):**
BPE starts with a character-level vocabulary and iteratively merges the most frequent adjacent pair of symbols, building up a fixed-size vocabulary (typically 32K–100K tokens). Used by GPT-2, GPT-3, GPT-4, Llama, and most autoregressive LLMs.

```
Algorithm BPE:
  1. Initialize vocabulary = all individual characters in corpus
  2. Repeat V times:
     a. Count all adjacent symbol pairs in corpus
     b. Merge the most frequent pair into one new symbol
     c. Add merged symbol to vocabulary
  3. Return vocabulary of size V
```

**Token Embeddings:**
Each token ID is mapped to a dense vector of dimension `d_model` via a learned lookup table (embedding matrix E of shape [V × d_model]). For GPT-3, `d_model = 12288`.

**Positional Encoding:**
Transformers have no recurrence, so position must be injected explicitly.

Original sinusoidal encoding (Vaswani et al., 2017):
```
PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
```

Modern alternatives:
- **RoPE** (Rotary Position Embedding): rotates Q and K vectors by position — used in Llama, Mistral, Qwen. Naturally handles relative positions and extrapolates to longer contexts.
- **ALiBi** (Attention with Linear Biases): adds a fixed negative bias to attention scores based on distance — no embedding, very length-generalizable.
- **Learned absolute PE**: GPT-2 style — trained from scratch, fastest to implement.

---

### 4.3 The Transformer Architecture (Deep Dive)

#### Scaled Dot-Product Attention

The fundamental operation:

```
Attention(Q, K, V) = softmax( QKᵀ / √d_k ) · V
```

Where:
- Q ∈ ℝ^(n × d_k) — Queries
- K ∈ ℝ^(n × d_k) — Keys
- V ∈ ℝ^(n × d_v) — Values
- n = sequence length, d_k = key dimension
- Dividing by √d_k prevents vanishing gradients from dot products growing large in high dimensions

**Intuition:** Each token in Q asks a question. The similarity with all K tokens determines how much attention weight to place on each V token. The output is a weighted sum of values.

#### Multi-Head Attention (MHA)

Instead of one attention pass, the model runs h parallel attention heads:

```
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) · W^O

head_i = Attention(Q·W_i^Q, K·W_i^K, V·W_i^V)
```

Each head learns a different relational pattern (syntactic, semantic, coreference, etc.). GPT-3 uses 96 heads with d_k = 128.

**Time complexity:** O(n² · d_model) — quadratic in sequence length. This is why long-context models require special attention variants.

#### Grouped Query Attention (GQA) & Multi-Query Attention (MQA)

Standard MHA: each of H heads has its own K and V projections.

**MQA:** All H query heads share a single K and V head. Reduces KV cache memory by factor of H at some quality cost.

**GQA:** H query heads share G groups of K/V heads, where G < H. Llama 3, Mistral, and Gemma all use GQA as the best speed/quality tradeoff for production.

#### Feed-Forward Network (FFN)

After attention, each token representation passes through a position-wise two-layer MLP:

```
FFN(x) = max(0, xW₁ + b₁)W₂ + b₂
```

Typically the inner dimension is 4× the model dimension (e.g., d_model = 4096, d_ff = 16384). Some models use SwiGLU activation:

```
FFNSwiGLU(x) = (SiLU(xW₁) ⊙ xW₂)W₃
```

This is used in Llama 2/3, PaLM, and most modern models — empirically superior to ReLU.

#### Residual Connections & Layer Normalization

Each sub-layer (attention and FFN) is wrapped in a residual connection:
```
x = x + SubLayer(LayerNorm(x))   # Pre-norm (modern)
x = LayerNorm(x + SubLayer(x))   # Post-norm (original)
```

Pre-norm training is more stable at large scale and is the standard in Llama, GPT-NeoX, and all major open-source LLMs.

#### FlashAttention

Standard attention materializes the full n×n attention matrix in HBM (GPU memory), which becomes the bottleneck for long contexts.

FlashAttention (Dao et al., 2022) uses **tiling**: it computes attention in tiles that fit in on-chip SRAM, avoiding the round-trips to HBM. Result: 2–4× faster, linear memory usage, exact (not approximate) computation.

FlashAttention-2 (2023) and FlashAttention-3 (2024) add further optimizations for H100/A100 hardware, achieving near-theoretical peak FLOP utilization.

---

### 4.4 Pre-Training at Scale

#### Training Objective

Autoregressive LLMs are trained with the **causal language modeling (CLM)** objective — cross-entropy loss over next-token prediction:

```
L = - (1/N) Σᵢ log P_θ(xᵢ | x₁, ..., xᵢ₋₁)
```

This is equivalent to maximizing the log-likelihood of the training corpus under the model. The gradient flows back through the entire Transformer stack via backpropagation.

#### Data Pipelines

Modern LLMs are trained on trillions of tokens. The major public pretraining corpora include:

| Corpus | Size | Source |
|--------|------|--------|
| C4 | ~750 GB | Cleaned CommonCrawl |
| The Pile | ~825 GB | 22 diverse sources (EleutherAI) |
| RedPajama-v2 | ~30T tokens | Multi-source cleaned web |
| FineWeb (HuggingFace) | ~15T tokens | Carefully curated web data |
| Llama 3 corpus | ~15T tokens | Custom, undisclosed sources |

Data quality steps: language identification, URL filtering, deduplication (MinHash LSH), quality classifiers trained to remove boilerplate/spam, toxic content filtering.

**2024–2026 insight:** Data quality and careful mixing now dominate over raw quantity. Labs use domain-specific data (code, math, science) in targeted proportions, plus dedicated **synthetic data** generation from stronger models.

#### Distributed Training

Training a 70B parameter model requires ~140 GB just to store weights in BF16. Multi-GPU, multi-node training is mandatory.

**Data Parallelism:** Each GPU holds a full model copy; different data batches are processed in parallel; gradients are aggregated (all-reduce). Limited by memory per GPU.

**Tensor Parallelism (TP):** Individual weight matrices are split across GPUs column/row-wise. Requires fast interconnect (NVLink). Used within a single node.

**Pipeline Parallelism (PP):** Different Transformer layers are assigned to different GPUs. GPUs are pipelined with microbatches to minimize idle time ("pipeline bubbles").

**3D Parallelism:** Combines TP + PP + DP — the standard for training 100B+ parameter models. Implemented in NVIDIA Megatron-LM and integrated in Microsoft's Megatron-DeepSpeed framework.

**ZeRO Optimizer (DeepSpeed):**
Standard data parallelism stores a full copy of optimizer states on every GPU. ZeRO (Zero Redundancy Optimizer) shards optimizer states, gradients, and parameters across GPUs:
- ZeRO Stage 1: Optimizer state sharding → 4× memory reduction
- ZeRO Stage 2: + Gradient sharding → 8× memory reduction
- ZeRO Stage 3: + Parameter sharding → memory scales with number of GPUs

**Mixed-Precision Training:**
Weights stored in BF16 (16-bit Brain Float); FP32 master copy for optimizer states. The BF16 format has the same exponent range as FP32 (important for training stability) with fewer mantissa bits. Llama 3 was trained in BF16; some frontier labs are exploring FP8 training.

---

### 4.5 Scaling Laws

Scaling laws describe how model loss (and downstream performance) changes with model size (N), dataset size (D), and compute budget (C).

#### Kaplan et al. (OpenAI, 2020) — Original Scaling Laws

The seminal paper showed that language model loss follows power laws:

```
L(N) ∝ N^(-α_N)
L(D) ∝ D^(-α_D)
L(C) ∝ C^(-α_C)
```

Key empirical findings:
- For a fixed compute budget, it's better to train a larger model for fewer tokens than a smaller model for more tokens (counterintuitive at the time)
- Data and model size should scale together

#### Chinchilla (Hoffmann et al., DeepMind, 2022)

Updated analysis with more careful compute-optimal analysis. Key finding:

> For compute-optimal training, model size and training tokens should scale equally.
> **Optimal token count ≈ 20 × model parameters**

For a 70B parameter model → train on ~1.4 trillion tokens (Chinchilla-optimal).

This result caused a shift: GPT-3 (175B params, 300B tokens) was undertrained. Llama 2 (70B params, 2T tokens) is actually overtrained relative to Chinchilla, deliberately, for inference efficiency.

**The Chinchilla formula:**
```
C_opt = 6 · N_opt · D_opt
N_opt = C^0.49
D_opt = C^0.51
```

#### 2024–2026 Updates

Modern labs (Meta, Google, Mistral) train models well *past* Chinchilla-optimal on tokens — this lowers perplexity further and is better for deployment (lower inference cost per parameter). Llama 3 was trained on 15 trillion tokens.

**Emergent capabilities:** Some capabilities appear suddenly at scale thresholds (arithmetic, multi-step reasoning). Whether emergence is truly discontinuous or an artifact of discrete evaluation metrics is an active research debate.

---

### 4.6 Alignment & Post-Training

Pre-trained LLMs are text completers — they continue the input token distribution. Raw pre-trained models are not helpful assistants; they require **post-training alignment** to be useful and safe.

#### Stage 1 — Supervised Fine-Tuning (SFT)

A curated dataset of (instruction, ideal response) pairs is used to fine-tune the pretrained model using standard cross-entropy loss. This teaches instruction following and basic format.

#### Stage 2 — Reward Modeling

A separate reward model (RM) is trained on human preference data: pairs of responses (y₁, y₂) to the same prompt are ranked by human annotators, and the RM learns to score responses by quality.

```
L_RM = -E[(r_θ(x, y_w) - r_θ(x, y_l))]   # Bradley-Terry model
```

Where y_w = preferred response, y_l = rejected response.

#### Stage 3 — RLHF with PPO

The SFT model is treated as a policy π_θ, and PPO (Proximal Policy Optimization) updates the policy to maximize reward from the RM, with a KL-divergence penalty to keep it close to the SFT reference model:

```
max_θ E[r_φ(x, y) - β · KL(π_θ(y|x) || π_ref(y|x))]
```

This is expensive — requires running both the policy model and reward model simultaneously. Used by OpenAI's InstructGPT/ChatGPT and many production models.

#### Direct Preference Optimization (DPO)

DPO (Rafailov et al., 2023) bypasses the reward model entirely. It shows that the RLHF objective can be optimized directly from preference pairs with a classification-style loss:

```
L_DPO = -E[log σ(β log(π_θ(y_w|x)/π_ref(y_w|x)) - β log(π_θ(y_l|x)/π_ref(y_l|x)))]
```

**Advantages:** No separate reward model, simpler pipeline, more stable training.
**Status:** Now the dominant fine-tuning alignment method for most labs and open-source practitioners.

#### RLVR — Reinforcement Learning with Verifiable Rewards

DeepSeek-R1 (2025) demonstrated that for domains with verifiable answers (math, code), you can use reward signals derived from *checking correctness* rather than human feedback. The model learns to reason step-by-step because correct reasoning leads to verifiable correct answers. This enables training on massive amounts of data cheaply — bypassing the human preference bottleneck.

#### Constitutional AI (Anthropic)

Anthropic's approach: instead of human feedback for every preference pair, a "constitution" of principles is used to generate AI feedback (RLAIF), dramatically scaling the preference data collection pipeline.

---

### 4.7 Parameter-Efficient Fine-Tuning (PEFT)

Full fine-tuning a 70B model requires ~140–560 GB VRAM — impractical for most teams. PEFT methods achieve most of the gain at a tiny fraction of the compute.

#### LoRA (Low-Rank Adaptation)

**Key insight:** Weight updates during fine-tuning have low intrinsic rank. We can approximate ΔW with a low-rank decomposition:

```
W' = W + ΔW = W + A · B

A ∈ ℝ^(d × r),  B ∈ ℝ^(r × k),  r << min(d, k)
```

W is frozen; only A and B are trained. With rank r=16 and applying LoRA to all attention weight matrices, a 7B model needs only ~8M trainable parameters instead of 7 billion.

**At inference time:** ΔW = A·B is computed once and merged into W, adding *zero* inference latency.

#### QLoRA

QLoRA (Dettmers et al., 2023) quantizes the frozen base model to 4-bit (NF4 — Normal Float 4) and trains LoRA adapters in 16-bit. This enables fine-tuning a 65B model on a single 40GB A100 GPU.

**Memory math for a 7B model:**
- Full fine-tuning: ~120 GB VRAM (model + optimizer states)
- LoRA: ~24 GB VRAM
- QLoRA: ~10 GB VRAM — fits on a single RTX 4090

**PEFT library (Hugging Face):** `pip install peft` — supports LoRA, QLoRA, Prefix Tuning, Adapters, DoRA, and more out of the box.

#### DoRA (Direction-Magnitude Decomposition)

DoRA decomposes weight updates into magnitude (scalar) and direction (unit vector) components. Empirically outperforms standard LoRA: +3.7% on LLaMA-7B and +1–4.4% on commonsense reasoning benchmarks, with zero inference overhead.

---

### 4.8 Inference Optimization

Inference is not simply "run the model forward." Production-grade LLM serving requires a stack of specialized techniques to achieve reasonable cost and latency.

#### The Two Phases of Inference

**Prefill phase:** All input tokens processed in parallel. Compute-bound (like training). Fast.

**Decode phase:** One token generated at a time (autoregressive). Memory-bandwidth-bound — the GPU must load all model weights from HBM for each token, even though only one row of each weight matrix is used.

#### KV Cache

During decode, the K and V tensors from previous tokens do not change. The **KV cache** stores them to avoid recomputation:

```
For each new token:
  Only compute Q for the new token
  Retrieve cached K, V from previous tokens
  Compute attention with full (cached + new) K, V
```

Cost: KV cache grows linearly with sequence length and batch size. For a 70B model with 128K context and batch size 32: KV cache alone requires tens of GB.

#### PagedAttention (vLLM)

Traditional KV cache allocates a contiguous block of memory per sequence (like malloc), causing **fragmentation** — memory is wasted in gaps. PagedAttention (Kwon et al., 2023) manages the KV cache like OS virtual memory, using fixed-size "pages." This enables:
- Near-zero KV cache waste
- Sharing of common prefixes across requests (prefix caching)
- High-throughput continuous batching

**vLLM** implements PagedAttention and is the dominant open-source LLM serving framework.

#### Quantization

| Method | Bits | VRAM Reduction | Quality Impact |
|--------|------|----------------|----------------|
| FP16/BF16 | 16 | 1× (baseline) | None |
| INT8 (LLM.int8) | 8 | ~2× | Minimal |
| GPTQ | 4 | ~4× | Small |
| AWQ | 4 | ~4× | Better than GPTQ |
| GGUF (llama.cpp) | 2–8 (mixed) | Variable | Flexible |
| FP8 | 8 | ~2× | Minimal (hardware native on H100) |

**Key principle:** Post-training quantization (PTQ) requires no retraining. AWQ (Activation-aware Weight Quantization) analyzes activation statistics to protect salient weights, achieving better quality than GPTQ at the same bit-width.

#### Speculative Decoding

Standard decoding is sequential: one token per forward pass. Speculative decoding (Leviathan et al., 2023) uses a small *draft model* to cheaply generate k tokens, then the large *target model* verifies all k tokens in one parallel forward pass.

If the target model accepts all k drafts: k tokens produced for the cost of ~1 target model forward pass.
If the target model rejects at position i: accept tokens 1..i, discard the rest.

**Speedup:** 2–3× for long generations, especially effective for text with predictable patterns (code, repetitive text).

#### Serving Frameworks Comparison

| Framework | Key Feature | Best For |
|-----------|-------------|----------|
| vLLM | PagedAttention, continuous batching | High-throughput serving |
| TGI (HuggingFace) | Wide model support, easy deployment | Flexibility |
| TensorRT-LLM (NVIDIA) | Maximum GPU utilization, kernel fusion | Latency-sensitive production |
| SGLang | Structured generation, RadixAttention | Complex prompting workflows |
| llama.cpp | CPU+GPU, GGUF quantization | Edge/consumer hardware |
| Ollama | User-friendly local deployment | Developer laptops |

---

### 4.9 Evaluation, Benchmarks & Hallucination

#### Standard Benchmarks

| Benchmark | What It Tests | Notes |
|-----------|--------------|-------|
| MMLU | 57-subject multiple choice | Knowledge breadth |
| HellaSwag | Commonsense completion | Easy for modern LLMs |
| ARC-Challenge | Grade school science | Reasoning |
| TruthfulQA | Factual accuracy | Hallucination resistance |
| GSM8K | Grade school math | Arithmetic reasoning |
| MATH | Competition math | Advanced reasoning |
| HumanEval | Python function generation | Coding capability |
| MBPP | Python programming | Coding capability |
| MT-Bench | Multi-turn instruction | Chatbot quality |
| Chatbot Arena | Human preference voting | Real-world quality |
| HELM (Stanford) | Holistic evaluation | 42 scenarios, 7 metrics |

#### Hallucination

LLMs generate text token-by-token based on statistical patterns — they can produce confident, fluent, *incorrect* statements. This is called **hallucination**.

**Types:**
- Factual hallucination: stating incorrect facts as true
- Source hallucination: citing non-existent papers or URLs
- Reasoning hallucination: correct-seeming but flawed logical steps

**Mitigation approaches:**
- RAG (Retrieval-Augmented Generation): ground responses in retrieved documents
- Constitutional AI: self-critique and revision
- Chain-of-thought prompting: forces intermediate reasoning steps
- RLHF with factuality reward
- Inference-time verification (2025 frontier)

---

### 4.10 Frontier Topics (2025–2026)

#### Mixture of Experts (MoE)

MoE models replace the dense FFN layer with a collection of "expert" FFN sub-networks. A router network assigns each token to the top-k experts (typically k=2 out of 8–64 experts).

**Benefit:** Dramatically increases model capacity (total parameters) while keeping the compute per token constant (only k experts activated per token).

**Examples:** Mixtral 8×7B (sparse 47B total, 12.9B active), Mixtral 8×22B, DeepSeek-MoE, GPT-4 (rumored MoE).

#### Reasoning Models & Test-Time Compute

OpenAI o1/o3 and DeepSeek-R1 demonstrated that spending more compute *at inference time* (extended chain-of-thought, search, revision) substantially improves performance on math, coding, and reasoning tasks. This decouples capability from training compute — a model can "think longer" for harder problems.

**Training approach:** RLVR — reward models verify final answers; the model learns to generate reasoning traces that lead to correct answers.

#### Long-Context Models

Modern LLMs support 128K (Llama 3.1), 200K (Claude 3), and 1M+ (Gemini 1.5 Pro) token context windows, enabled by:
- RoPE with extended/dynamic scaling
- Dedicated long-context training stages
- Modified attention patterns (sparse attention, sliding window)

#### Multimodal LLMs

Vision-language models add a vision encoder (CLIP, SigLIP) projecting image patches into the text token embedding space. The LLM backbone processes interleaved image+text tokens. Examples: LLaVA, GPT-4V, Gemini, Claude 3.

---

## 5. Practical Labs & Assignments

### Stanford CS324 Style Labs

**Lab 1 — Build a Tokenizer from Scratch**
- Implement BPE tokenizer on a small text corpus in Python
- Train vocab of size 5000 on Shakespeare text
- Compare tokenization of multilingual text vs GPT-4 tokenizer
- Tools: raw Python, then verify against `tokenizers` (HuggingFace)

**Lab 2 — Implement a Decoder-only Transformer (nanoGPT style)**
- Follow Andrej Karpathy's nanoGPT tutorial (from-scratch implementation)
- Implement: token embedding, positional embedding, MHA, FFN, residual, layer norm
- Train character-level GPT on Shakespeare (~10M tokens)
- Expected output: coherent but imperfect Shakespearean text after ~1 hour training on 1 GPU
- Tools: PyTorch, Jupyter, Google Colab

**Lab 3 — Pre-Training a Small LLM**
- Use Hugging Face `transformers` + `accelerate` + `datasets`
- Train a 125M parameter GPT-2 style model on a small cleaned corpus
- Track training loss with Weights & Biases
- Evaluate perplexity on held-out test set
- Tools: HuggingFace stack, W&B, A100 on Colab

**Lab 4 — Fine-Tuning with LoRA and QLoRA**
- Start from Llama 3.1 8B (instruction model)
- Fine-tune on a domain-specific dataset (medical QA, legal text, code)
- Compare: full fine-tune (if hardware allows) vs LoRA vs QLoRA
- Evaluate on held-out domain benchmark
- Tools: `peft`, `bitsandbytes`, `trl`, `transformers`

**Lab 5 — RLHF / DPO Alignment**
- Use `trl` (Hugging Face TRL library) to run DPO on a preference dataset
- Dataset: OpenHermes, UltraFeedback, or Anthropic HH-RLHF
- Train a 7B chat model; compare responses to base SFT model
- Evaluate with MT-Bench questions
- Tools: TRL, PEFT, Weights & Biases

**Lab 6 — Inference Optimization**
- Serve a 7B model using vLLM
- Benchmark: throughput (tokens/sec) and latency (TTFT, TPOT)
- Compare: standard (no optimization) vs KV cache vs continuous batching vs INT4 quantization
- Measure memory footprint at each stage
- Tools: vLLM, `torch.profiler`, Locust for load testing

**Lab 7 — Evaluation with HELM / LM-Evaluation-Harness**
- Run EleutherAI's `lm-evaluation-harness` on your fine-tuned model
- Evaluate on: HellaSwag, ARC, TruthfulQA, GSM8K
- Compare your model to base Llama 3.1 8B baseline
- Tools: `lm-eval`, HuggingFace model hub

---

## 6. Tools & Technologies

| Category | Tool | Purpose |
|----------|------|---------|
| **Model Training** | PyTorch | Core deep learning framework |
| **Model Training** | JAX + Flax | Google/TPU-optimized training |
| **Distributed Training** | Megatron-LM (NVIDIA) | Tensor & pipeline parallelism |
| **Distributed Training** | DeepSpeed (Microsoft) | ZeRO optimizer, 3D parallelism |
| **Distributed Training** | PyTorch FSDP | Fully Sharded Data Parallel |
| **PEFT / Alignment** | HuggingFace PEFT | LoRA, QLoRA, adapters |
| **PEFT / Alignment** | HuggingFace TRL | SFT, RLHF, DPO pipelines |
| **PEFT / Alignment** | Axolotl | High-level fine-tuning framework |
| **PEFT / Alignment** | LLaMA Factory | Unified 100+ model fine-tuning |
| **Quantization** | bitsandbytes | INT8/INT4 quantization |
| **Quantization** | AutoAWQ | AWQ quantization |
| **Quantization** | llama.cpp | GGUF quantization, CPU inference |
| **Inference Serving** | vLLM | PagedAttention serving engine |
| **Inference Serving** | HuggingFace TGI | Production text generation |
| **Inference Serving** | TensorRT-LLM | NVIDIA GPU-optimized serving |
| **Inference Serving** | SGLang | Structured generation |
| **Experiment Tracking** | Weights & Biases (W&B) | Training metrics, model registry |
| **Experiment Tracking** | MLflow | Open-source alternative |
| **Tokenization** | HuggingFace tokenizers | Fast tokenization library |
| **Model Hub** | HuggingFace Hub | Pre-trained model downloads |
| **Evaluation** | lm-evaluation-harness | Standard LLM benchmark suite |
| **Evaluation** | HELM (Stanford) | Holistic evaluation framework |
| **Reference Impl.** | nanoGPT (Karpathy) | Minimal GPT training code |

---

## 7. Key Textbooks & Papers

### Textbooks

| Title | Authors | Access | Tier |
|-------|---------|--------|------|
| Deep Learning | Goodfellow, Bengio, Courville | deeplearningbook.org (free) | 🔴 Required |
| Speech and Language Processing (3rd ed.) | Jurafsky & Martin | web.stanford.edu/~jurafsky (free draft) | 🔴 Required |
| Mathematics for Machine Learning | Deisenroth, Faisal, Ong | mml-book.github.io (free) | 🟡 Recommended |
| Pattern Recognition & ML | Bishop | Microsoft Research (free PDF) | 🟡 Recommended |

### Foundational Papers (Must-Read)

| Paper | Authors | Year | What It Introduced |
|-------|---------|------|--------------------|
| Attention Is All You Need | Vaswani et al. | 2017 | Transformer architecture |
| BERT | Devlin et al. | 2018 | Encoder pre-training, MLM |
| GPT-2 | Radford et al. | 2019 | Scaling autoregressive LM |
| Scaling Laws for Neural Language Models | Kaplan et al. | 2020 | Power law scaling relationships |
| Language Models are Few-Shot Learners (GPT-3) | Brown et al. | 2020 | 175B LM, in-context learning |
| Training Compute-Optimal LLMs (Chinchilla) | Hoffmann et al. | 2022 | Optimal N/D compute ratios |
| InstructGPT (RLHF) | Ouyang et al. | 2022 | RLHF alignment pipeline |
| FlashAttention | Dao et al. | 2022 | Memory-efficient attention |
| LLaMA | Touvron et al. | 2023 | Open-source competitive LLM |
| LoRA | Hu et al. | 2021 | Low-rank fine-tuning |
| QLoRA | Dettmers et al. | 2023 | 4-bit quantized LoRA |
| DPO | Rafailov et al. | 2023 | Alignment without reward model |
| Llama 3 | Meta AI | 2024 | Open-source frontier model |
| DeepSeek-R1 | DeepSeek | 2025 | RLVR reasoning model |

### Important Systems Papers

| Paper | Authors | Year | Topic |
|-------|---------|------|-------|
| Efficient Large-Scale Language Model Training (Megatron-LM) | Narayanan et al. | 2021 | 3D parallelism |
| ZeRO: Memory Optimizations for Training Trillion Parameter Models | Rajbhandari et al. | 2020 | ZeRO optimizer |
| Efficient Memory Management for LLM Serving with PagedAttention (vLLM) | Kwon et al. | 2023 | KV cache paging |
| Mixtral of Experts | Jiang et al. (Mistral) | 2024 | Open-source MoE LLM |

---

## 8. University Comparison Table

| Topic | Stanford CS324 | MIT 6.S191 | CMU 11-667 | Berkeley CS294 | Harvard CS197 |
|-------|---------------|-----------|------------|----------------|---------------|
| Transformer architecture | 🔴 Deep | 🟡 Medium | 🔴 Deep | 🟡 Medium | 🟢 Survey |
| Pre-training at scale | 🔴 Deep | 🟢 Overview | 🟡 Medium | 🟢 Overview | 🟢 Survey |
| Scaling laws | 🔴 Deep | ❌ | 🔴 Deep | 🟢 Overview | ❌ |
| RLHF / DPO alignment | 🔴 Deep | 🟢 Brief | 🔴 Deep | 🔴 Deep | 🟡 Medium |
| LoRA / PEFT | 🟡 Medium | 🟢 Brief | 🔴 Deep | 🟡 Medium | 🟡 Medium |
| Inference optimization | 🟡 Medium | ❌ | 🟡 Medium | 🔴 Deep | 🟢 Brief |
| Distributed training systems | 🟡 Medium | ❌ | 🟡 Medium | 🟡 Medium | ❌ |
| Ethics & harms | 🔴 Deep | 🟢 Brief | 🟡 Medium | 🟡 Medium | 🟡 Medium |
| Evaluation & benchmarks | 🔴 Deep | 🟢 Brief | 🔴 Deep | 🟡 Medium | 🟡 Medium |
| Hands-on labs | 🟡 Paper reviews | 🔴 Colab labs | 🔴 Project-heavy | 🔴 Project-heavy | 🟡 Medium |
| MoE & frontier architectures | 🟡 Medium | ❌ | 🟡 Medium | 🔴 Deep | ❌ |

**Legend:** 🔴 Deep treatment | 🟡 Medium coverage | 🟢 Brief overview | ❌ Not covered

**Overall Assessment:**
- **Theoretical depth:** Stanford CS324 > CMU 11-667 > Berkeley CS294
- **Practical labs:** Berkeley CS294 / CMU 11-667 > Stanford CS324 (which focuses on paper reviews)
- **Systems focus:** Berkeley CS294 > CMU 11-667 > Stanford CS324
- **Ethics & societal impact:** Stanford CS324 > all others

---

## 9. Industry Relevance — 2025–2026

### Career Roles & How This Course Applies

| Industry Role | How LLM Training & Inference Knowledge Applies | Salary Range (USD, 2025) |
|---------------|-----------------------------------------------|--------------------------|
| LLM Research Scientist | Pre-training, scaling laws, alignment research — core of the job | $250K–$600K+ (frontier labs) |
| ML Engineer — LLM Infra | Distributed training, inference optimization, serving infrastructure | $200K–$400K |
| Fine-Tuning / Alignment Engineer | LoRA, QLoRA, RLHF, DPO pipelines for production models | $180K–$350K |
| Applied AI Scientist | Fine-tuning pre-trained LLMs for domain applications | $150K–$280K |
| AI Platform Engineer | vLLM, TGI, TensorRT-LLM deployment, scaling serving infra | $160K–$320K |
| AI Product Engineer | Prompt engineering, RAG, LLM app development | $140K–$240K |
| AI Safety Researcher | Alignment theory, evaluation, RLHF safety — critical shortage | $200K–$500K+ |

### Top Hiring Organizations (2025–2026)

**Frontier Labs:** Anthropic, OpenAI, Google DeepMind, Meta AI, Mistral, xAI, Cohere
**Big Tech:** Google, Microsoft, Apple, Amazon, NVIDIA, AMD
**LLM Infrastructure:** Together AI, Replicate, Fireworks AI, Modal, Anyscale
**Enterprise AI:** Salesforce, Adobe, Bloomberg, JPMorgan, Bloomberg

### Most In-Demand Skills (2025–2026 Job Market)

Based on analysis of job postings across the above organizations:

1. **Distributed training proficiency** (PyTorch FSDP, Megatron-LM, DeepSpeed) — high shortage
2. **RLHF / DPO pipeline implementation** — critical for alignment-focused roles
3. **Inference optimization** (vLLM, quantization, speculative decoding) — growing demand
4. **LLM evaluation design** — building eval frameworks beyond standard benchmarks
5. **MoE architecture expertise** — emerging critical skill as MoE dominates frontier models
6. **Data curation at scale** — data quality now the primary lever for model quality

---

## 10. Research Links & Sources

### Primary Course Sources

| Source | URL | Type |
|--------|-----|------|
| Stanford CS324 — Large Language Models | https://stanford-cs324.github.io/winter2022/ | Primary Syllabus |
| Stanford CS324 Lecture Notes | https://stanford-cs324.github.io/winter2022/lectures/ | Lecture Notes |
| Stanford CS224G — Building LLM Apps | https://web.stanford.edu/class/cs224g/index.html | Course Page |
| MIT 6.S191 — Intro to Deep Learning | https://introtodeeplearning.com/ | Course + Videos |
| Andrej Karpathy — nanoGPT | https://github.com/karpathy/nanoGPT | Implementation |
| Andrej Karpathy — LLM from Scratch (video) | https://www.youtube.com/watch?v=kCc8FmEb1nY | Video Lecture |
| HuggingFace NLP Course | https://huggingface.co/learn/nlp-course/chapter1/1 | Practical Course |
| vLLM Documentation | https://docs.vllm.ai/ | Serving Framework |

### Foundational Papers

| Paper | URL |
|-------|-----|
| Attention Is All You Need | https://arxiv.org/abs/1706.03762 |
| BERT | https://arxiv.org/abs/1810.04805 |
| GPT-3 | https://arxiv.org/abs/2005.14165 |
| Scaling Laws (Kaplan et al.) | https://arxiv.org/abs/2001.08361 |
| InstructGPT (RLHF) | https://arxiv.org/abs/2203.02155 |
| FlashAttention | https://arxiv.org/abs/2205.14135 |
| LoRA | https://arxiv.org/abs/2106.09685 |
| QLoRA | https://arxiv.org/abs/2305.14314 |
| DPO | https://arxiv.org/abs/2305.18290 |
| Llama 3 | https://arxiv.org/abs/2407.21783 |
| PagedAttention / vLLM | https://arxiv.org/abs/2309.06180 |

### Tools & Framework Docs

| Tool | URL |
|------|-----|
| HuggingFace PEFT | https://huggingface.co/docs/peft |
| HuggingFace TRL | https://huggingface.co/docs/trl |
| LLaMA Factory | https://github.com/hiyouga/LlamaFactory |
| DeepSpeed | https://github.com/microsoft/DeepSpeed |
| Megatron-LM | https://github.com/NVIDIA/Megatron-LM |
| lm-evaluation-harness | https://github.com/EleutherAI/lm-evaluation-harness |
| HELM (Stanford) | https://crfm.stanford.edu/helm/ |

---

## Summary: What You Will Know After This Course

By the end of this course at PhD level, you will be able to:

1. **Explain from first principles** why Transformers work: attention as contextual embedding update, how residual streams carry information, why layer norm stabilizes training.

2. **Design a pretraining pipeline** end-to-end: data curation philosophy, tokenizer training, BF16 mixed-precision training with ZeRO, monitoring loss curves and detecting instabilities.

3. **Apply scaling laws** to decide model size, token budget, and compute allocation for a given training budget.

4. **Implement RLHF and DPO** from scratch and understand the stability tradeoffs between them.

5. **Fine-tune any open-source LLM** on consumer hardware using QLoRA, and understand exactly what happens mathematically during LoRA adaptation.

6. **Optimize inference** for a production serving system: choose the right quantization scheme, configure vLLM's PagedAttention and continuous batching, apply speculative decoding where appropriate.

7. **Design and execute evaluations** for LLMs beyond standard benchmarks, including task-specific evaluations and hallucination measurement.

8. **Read frontier research papers** (NeurIPS, ICML, ICLR, arXiv) in this area with full comprehension.

---

*Report compiled from primary sources: Stanford CS324, MIT 6.S191, CMU 11-667, UC Berkeley CS294, Hugging Face, vLLM docs, ArXiv papers (2020–2025)*  
*Research date: May 2026 — reflects AI-boom era curriculum (2024–2026 updates included)*  
*Part of the 12-report World-Class CS/AI/ML Curriculum Series*
