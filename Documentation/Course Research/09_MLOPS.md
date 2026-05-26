# 📦 Report 09: MLOps — Machine Learning in Production
## World-Class CS / AI / ML Curriculum Deep-Dive Series
### Based on CMU · Full Stack Deep Learning · Google · Industry Standards (2025–2026)

---

> **Depth Level:** 🔴 Advanced → 🟣 PhD  
> **Research Date:** May 2026  
> **Primary Source:** CMU 17-445/17-645/17-745 *Machine Learning in Production / AI Engineering* (Spring 2026)  
> **Cross-referenced with:** Full Stack Deep Learning (FSDL 2022), Google MLOps on Vertex AI, MLflow, Kubeflow, DVC, Evidently AI, industry reports 2025–2026

---

## 📋 TABLE OF CONTENTS

1. [Course Overview & University Comparison](#1-course-overview--university-comparison)
2. [Prerequisite Map](#2-prerequisite-map)
3. [Topic Tree — All Modules](#3-topic-tree--all-modules)
4. [Detailed Chapter Breakdown](#4-detailed-chapter-breakdown)
5. [Practical Labs & Assignments](#5-practical-labs--assignments)
6. [Tools & Technologies](#6-tools--technologies)
7. [Key Textbooks & Papers](#7-key-textbooks--papers)
8. [University Comparison Table](#8-university-comparison-table)
9. [Industry Relevance 2025–2026](#9-industry-relevance-20252026)
10. [Mathematics for MLOps](#10-mathematics-for-mlops)
11. [Research Links & Sources](#11-research-links--sources)

---

## 1. Course Overview & University Comparison

### What is MLOps?

**MLOps** (Machine Learning Operations) is the discipline of reliably engineering, deploying, monitoring, and maintaining machine learning systems in production. It extends DevOps practices to cover the unique challenges of ML: non-deterministic software behavior, data dependencies, concept drift, model versioning, and the feedback loops between deployed systems and the data they generate.

The core thesis of MLOps is captured in a landmark 2015 Google paper: ***"Hidden Technical Debt in Machine Learning Systems"*** (Sculley et al., NeurIPS). The paper argues that actual ML model code is a tiny fraction of a production ML system — the rest is data pipelines, serving infrastructure, monitoring, configuration management, and glue code. MLOps is the engineering discipline that manages this iceberg.

```
╔══════════════════════════════════════════════════════════════════╗
║           The ML Production System Iceberg                       ║
║                                                                  ║
║            ┌─────────────┐   ← ML Model Code (~5%)              ║
║   ┌─────────────────────────────────────┐                        ║
║   │  Data Collection    │  Feature Eng. │                        ║
║   │  Data Verification  │  Process Mgmt.│                        ║
║   │  Serving Infra      │  Monitoring   │  (~95% of system)      ║
║   │  CI/CD Pipelines    │  Config Mgmt  │                        ║
║   └─────────────────────────────────────┘                        ║
╚══════════════════════════════════════════════════════════════════╝
```

### The MLOps Maturity Spectrum

| Level | Description | What You Have |
|-------|-------------|---------------|
| **Level 0** | Manual process | Jupyter notebooks, manual deployment |
| **Level 1** | ML pipeline automation | Automated retraining, triggered pipelines |
| **Level 2** | CI/CD pipeline automation | Automated model validation, staged rollouts |
| **Level 3** | Full MLOps | Continuous training, drift detection, automated remediation |

*(Source: Google MLOps whitepaper, Vertex AI documentation)*

### Primary University: CMU 17-445/17-645 — *Machine Learning in Production / AI Engineering*

**CMU** is the world-leading institution for MLOps as an engineering discipline. The course — taught by **Christian Kaestner** and **Claire Le Goues** — was one of the first university courses globally to treat MLOps as a serious systems engineering subject, not just a tooling tutorial. It is offered under four course numbers:

| Course # | Audience |
|----------|----------|
| 17-445 | Undergraduate |
| 17-645 | Graduate (MS) |
| 17-745 | PhD (replaces 2 HW with research project) |
| 11-695 | AI Engineering track |

**Spring 2026** is the latest offering, now extensively updated to cover **AI agents, LLMOps, MCP security, and risk management** — reflecting the 2025–2026 frontier.

> *"This course covers the entire lifecycle from a prototype ML model to an entire system deployed in production that you will run and update for several weeks under high load."* — CMU Spring 2026 Course Page

---

## 2. Prerequisite Map

```
REQUIRED BEFORE MLOps:
┌─────────────────────────────────────┐
│  Python Programming (Report 10)     │
│  Basic ML (sklearn, model training) │  ← Report 05
│  Unix shell / command line          │
│  Basic software engineering         │  ← Report 02
└─────────────────────────────────────┘

HELPFUL BUT NOT REQUIRED:
┌─────────────────────────────────────┐
│  Software testing experience        │
│  Docker / container basics          │
│  Database / SQL knowledge           │  ← Report 01
│  System design awareness           │  ← Report 03
└─────────────────────────────────────┘

WHAT MLOps DOES NOT ASSUME:
- Deep ML theory (no proofs required)
- Formal software engineering background
- Prior DevOps / cloud experience
```

---

## 3. Topic Tree — All Modules

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

---

## 4. Detailed Chapter Breakdown

### MODULE 1: Foundations & Systems Thinking

#### 1.1 From Models to AI-Enabled Systems

The first conceptual shift MLOps demands is moving from a **model-centric view** to a **system-centric view**. A production ML system is not a model — it is an entire software product in which the model is one (often small) component.

**Key contrasts:**

| Property | Traditional Software | ML Component |
|----------|----------------------|--------------|
| Specification | Explicit (if/else logic) | Implicit (learned from data) |
| Testing | Unit/integration tests | Statistical evaluation |
| Bugs | Reproducible, traceable | Probabilistic, data-dependent |
| Updates | Code commits | Data updates, retraining |
| Failures | Clear error messages | Silent degradation |

**System composition challenges:** ML and non-ML components are developed with different processes and must be integrated. The lack of formal specifications for ML behavior makes traditional software composition principles (abstraction, contracts) difficult to apply.

**Guardrails pattern:** One of the key system-level strategies is introducing non-ML guardrails around ML components — hard rules, sanity checks, and fallback logic that limit the blast radius of model errors.

```
       ┌─────────────────────────────────┐
       │         Production System       │
       │                                 │
Input ──►  [Pre-processing] ──► [ML Model] ──► [Post-processing/Guardrails] ──► Output
       │                                 │
       │  [Fallback Logic / Rules Engine]│
       └─────────────────────────────────┘
```

#### 1.2 Correctness, Risk & Error Framing

Since ML models make mistakes by design, MLOps engineers must plan for failure from the beginning. This requires **risk framing**: understanding the consequences of different error types and designing systems that tolerate them gracefully.

**Error taxonomy for production ML:**

| Error Type | Description | Example |
|------------|-------------|---------|
| **False Positive** | Model predicts positive when negative | Spam filter blocks legitimate email |
| **False Negative** | Model misses a true positive | Cancer screening misses a tumor |
| **Distribution Shift** | Production data differs from training data | Seasonal fraud patterns |
| **Feedback Loop** | Model output influences future training data | Recommendation systems amplifying bias |

**Asymmetric costs:** In most production systems, different error types have radically different costs. A self-driving car that fails to detect a pedestrian (FN) is far more costly than one that brakes unnecessarily (FP). MLOps engineers must understand business context and tune models accordingly.

#### 1.3 Requirements Engineering for ML Systems

Before building, MLOps engineers must define measurable quality requirements — not just accuracy targets. The CMU curriculum emphasizes structured **requirements elicitation** for ML systems.

**Quality attribute dimensions for ML systems:**

```
Accuracy         → Precision, recall, F1, AUC-ROC on held-out test data
Latency          → p50, p95, p99 inference latency under production load
Throughput       → Requests per second the system can serve
Scalability      → How does performance degrade under 10x, 100x load?
Availability     → Uptime SLA: 99.9%? 99.99%?
Updateability    → How often does the model need retraining?
Explainability   → Can decisions be explained to end users or regulators?
Fairness         → Equal performance across demographic subgroups
Privacy          → User data protection, compliance with GDPR/HIPAA
Cost             → Inference cost per prediction, training cost per run
Robustness       → Performance under adversarial inputs or distribution shift
```

---

### MODULE 2: Model Quality & Evaluation

#### 2.1 Beyond Accuracy: Behavioral Testing

Standard benchmark accuracy is a **poor proxy** for production quality. CMU introduces a richer evaluation framework:

**Slicing analysis:** Break down evaluation metrics by meaningful subgroups (age, geography, device type). A model that achieves 90% overall accuracy but 60% accuracy for a minority demographic is a fairness failure.

**Behavioral testing categories (inspired by NLP research "CheckList"):**

| Test Type | Description | Example |
|-----------|-------------|---------|
| **Minimum Functionality** | Basic expected behaviors | Sentiment classifier agrees "great" is positive |
| **Invariance** | Output should not change for irrelevant perturbations | Changing a name in a resume should not change a hiring score |
| **Directional Expectation** | Known input-output relationships | Higher income should increase loan approval likelihood |

#### 2.2 LLM-as-a-Judge & Automated Evaluation (2025–2026)

A major curriculum addition in 2025–2026 is **LLM-assisted evaluation** of model outputs — particularly critical for evaluating generative AI systems where there is no single ground-truth answer.

**Approaches:**
- **Rubric-based scoring:** Define structured criteria; have an LLM score each output on those criteria
- **Pairwise comparison:** Ask the LLM which of two outputs is better
- **Reference-free evaluation:** Grade responses without needing ground-truth labels

**Critical caveat:** As the required reading "Who validates the validators?" (ACM CHI 2024) demonstrates, LLM evaluators can have systematic biases (length preference, verbosity bias, sycophancy) and must themselves be validated against human judgments before deployment.

#### 2.3 A/B Testing & Experiments in Production

**A/B testing** is the gold standard for evaluating model changes in production. Rather than relying solely on offline evaluation, you expose a fraction of real users to the new model and measure business outcomes.

**Staged rollout strategies:**

```
Canary Release:
  ┌─────────────────────────────────────────────┐
  │  Traffic: 95% → Model V1 (stable)           │
  │           5% → Model V2 (candidate)         │
  │                                             │
  │  Monitor for: error rates, latency, KPIs    │
  │  Decision: promote V2 or rollback           │
  └─────────────────────────────────────────────┘

Blue-Green Deployment:
  ┌─────────────────────────────────────────────┐
  │  BLUE (active):  Model V1 serving 100%      │
  │  GREEN (standby): Model V2 ready to switch  │
  │                                             │
  │  Instant switch with zero-downtime rollback │
  └─────────────────────────────────────────────┘

Shadow Deployment:
  ┌─────────────────────────────────────────────┐
  │  All traffic → Model V1 (serves users)      │
  │  All traffic → Model V2 (predictions logged │
  │                           but NOT served)   │
  │                                             │
  │  Compare V2 outputs to V1 offline           │
  └─────────────────────────────────────────────┘
```

**Statistical considerations:** A/B tests must be properly powered (sufficient sample size), account for multiple comparisons, and use appropriate metrics (not just accuracy, but business KPIs like click-through rate, conversion, retention).

---

### MODULE 3: ML Pipelines & Automation

#### 3.1 ML Pipeline Architecture

A **ML pipeline** is the automated sequence of steps that transforms raw data into a deployed model. In production, every step must be reproducible, versioned, and testable.

```
Raw Data → [Ingestion] → [Validation] → [Feature Engineering] → [Training] → [Evaluation] → [Model Registry] → [Deployment] → [Monitoring]
             ↑                                                                                                              │
             └──────────────────────────── Feedback / Retraining ─────────────────────────────────────────────────────────┘
```

**Key pipeline components:**

| Component | Responsibility | Tools |
|-----------|---------------|-------|
| Data ingestion | Pull from sources (databases, APIs, streams) | Airflow, Kafka, Spark |
| Data validation | Schema checks, distribution checks, anomaly detection | Great Expectations, TensorFlow Data Validation |
| Feature engineering | Transform raw data into model-ready features | Feast, Tecton, Hopsworks |
| Training | Reproducible model training with tracked hyperparameters | MLflow, W&B, SageMaker |
| Evaluation | Offline model quality checks before promotion | Custom metrics, MLflow |
| Model registry | Store, version, and tag model artifacts | MLflow Registry, HuggingFace Hub |
| Deployment | Package and serve the model | Docker, Kubernetes, BentoML, TorchServe |
| Monitoring | Track model and data quality in production | Evidently AI, Prometheus, Grafana |

#### 3.2 Continuous Integration / Continuous Deployment / Continuous Training (CI/CD/CT)

MLOps extends the classic DevOps CI/CD pipeline to add **Continuous Training (CT)** — automated retraining triggered by data drift, time schedules, or performance thresholds.

**The ML Test Score (Google, 2017):** A landmark paper by Breck et al. defines a structured test suite for production ML systems:

```
Test Categories:
1. Feature/Data Tests     → Is input data valid and within expected distribution?
2. Model Development Tests → Do training outputs meet quality thresholds?
3. ML Infrastructure Tests → Does the serving system behave correctly?
4. Monitoring Tests        → Are production metrics being tracked correctly?
```

**CI for ML with GitHub Actions:**

```yaml
# Example: .github/workflows/ml-pipeline.yml
name: ML CI Pipeline
on: [push, pull_request]
jobs:
  train-and-evaluate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      - name: Pull data with DVC
        run: dvc pull
      - name: Run data validation
        run: python scripts/validate_data.py
      - name: Train model
        run: python scripts/train.py
      - name: Evaluate model
        run: python scripts/evaluate.py --threshold 0.85
      - name: Register model if quality passes
        run: python scripts/register_model.py
```

#### 3.3 Data Version Control (DVC)

**DVC** (Data Version Control) extends Git to version large datasets and ML models alongside code. It stores data in remote storage (S3, GCS, Azure Blob) while tracking metadata in Git.

```bash
# Initialize DVC in a project
dvc init

# Track a dataset
dvc add data/training_data.csv
git add data/training_data.csv.dvc .gitignore

# Push data to remote storage
dvc push

# Reproduce a pipeline stage
dvc repro train

# Compare experiments
dvc metrics show
dvc plots show
```

**DVC pipeline stages (dvc.yaml):**
```yaml
stages:
  prepare:
    cmd: python src/prepare.py
    deps:
      - src/prepare.py
      - data/raw
    outs:
      - data/prepared

  train:
    cmd: python src/train.py
    deps:
      - src/train.py
      - data/prepared
    params:
      - params.yaml:
          - train.lr
          - train.epochs
    outs:
      - models/model.pkl
    metrics:
      - metrics/train_metrics.json
```

---

### MODULE 4: Model Deployment

#### 4.1 Deployment Patterns

The right deployment pattern depends on latency requirements, throughput, and whether predictions need to be pre-computed or computed on-demand.

| Pattern | How It Works | Latency | Use Cases |
|---------|-------------|---------|-----------|
| **Batch inference** | Run predictions on a dataset periodically | Hours | Recommendation pre-computation, nightly reports |
| **Online (synchronous)** | Request → Model → Instant response | Milliseconds | Search ranking, fraud detection, chatbots |
| **Streaming** | Predictions triggered by event stream | Seconds | Real-time anomaly detection, IoT |
| **Edge inference** | Model runs on-device, no network call | Sub-millisecond | Mobile apps, autonomous vehicles, IoT |

#### 4.2 Model Serving Infrastructure

**REST API serving (Flask/FastAPI example):**

```python
from fastapi import FastAPI
import mlflow.pyfunc
import pandas as pd

app = FastAPI()
model = mlflow.pyfunc.load_model("models:/churn_model/production")

@app.post("/predict")
async def predict(features: dict):
    input_df = pd.DataFrame([features])
    prediction = model.predict(input_df)
    return {"prediction": prediction.tolist()}
```

**Key serving concerns:**
- **Model serialization formats:** ONNX (cross-framework), TorchScript (PyTorch), SavedModel (TensorFlow), pickle (scikit-learn)
- **Batching for efficiency:** Group individual requests into micro-batches to amortize GPU overhead
- **Model versioning:** Multiple versions running simultaneously for canary/A-B testing
- **Autoscaling:** Kubernetes Horizontal Pod Autoscaler based on CPU/GPU/request queue depth

#### 4.3 Docker for ML Model Packaging

Every production model should be packaged as a **Docker container** to ensure environment reproducibility and portability.

```dockerfile
# Example MLOps Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY model/ ./model/
COPY serve.py .

# Health check
HEALTHCHECK --interval=30s --timeout=10s \
  CMD curl -f http://localhost:8080/health || exit 1

EXPOSE 8080
CMD ["python", "serve.py"]
```

#### 4.4 Kubernetes for ML Orchestration

**Kubernetes** manages containerized ML services at scale: automatic scaling, self-healing, rolling deployments, and load balancing.

**Key Kubernetes concepts for MLOps:**

```
Deployment    → Declares the desired state of your model-serving pods
Service       → Exposes the deployment as a network endpoint
Ingress       → Routes external traffic to services
HPA           → Horizontal Pod Autoscaler (scales based on load)
PersistentVolume → Stores model artifacts and data
ConfigMap/Secret → Manages configuration and credentials
```

**Kubeflow Pipelines:** Kubernetes-native workflow orchestration for ML — each pipeline step runs as a container, enabling reproducible, scalable ML workflows.

---

### MODULE 5: Data Infrastructure & Scalability

#### 5.1 Data Quality & Validation

**Data quality** is the single largest source of production ML failures. The required reading "Data Cascades in High-Stakes AI" (Sambasivan et al., CHI 2021) documents how upstream data quality problems systematically destroy downstream model quality.

**Data validation categories:**

```
Schema validation    → Are all expected columns present and typed correctly?
Range checks         → Are values within plausible bounds?
Completeness checks  → Are there unexpected null values?
Distribution checks  → Has the feature distribution shifted from training?
Referential integrity → Are foreign keys valid?
Business rule checks  → Do values make domain sense?
```

**Great Expectations (tool):** Declarative data validation framework.

```python
import great_expectations as gx

context = gx.get_context()
suite = context.add_expectation_suite("user_features")

# Define expectations
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToNotBeNull(column="user_id")
)
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToBeBetween(
        column="age", min_value=0, max_value=120
    )
)
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToBeBetween(
        column="purchase_amount", min_value=0, max_value=100000
    )
)
```

#### 5.2 Feature Stores

A **Feature Store** is a centralized repository for ML features — computed once, stored, versioned, and reused across many models. It solves two critical problems:

1. **Training-serving skew:** Ensures that features computed at serving time exactly match those used during training
2. **Feature reuse:** A feature computed for one model (e.g., "customer's 30-day purchase count") can be reused by any other model without recomputation

```
                    ┌─────────────────────┐
Batch Sources ──────►                     │◄──── Training Pipeline
                    │    Feature Store    │
Stream Sources ─────►   (Feast / Tecton)  │◄──── Online Serving
                    │                     │
                    └─────────────────────┘
                         │           │
                    Offline Store  Online Store
                    (S3/BigQuery)  (Redis/DynamoDB)
                    [history]      [low-latency]
```

#### 5.3 Stream Processing with Apache Kafka

**Apache Kafka** is the de facto standard for high-throughput, real-time data streaming in production ML systems. In CMU's labs, students work with Kafka directly.

**Kafka architecture:**

```
                    ┌──────────────────────────────────┐
                    │           Kafka Cluster           │
Producers ──────────► Topic: user_events (partitioned) │
(Web servers,       │  Partition 0: [e1, e2, e5, ...]  ├──────► Consumers
 mobile apps,       │  Partition 1: [e3, e6, ...]      │        (ML feature
 IoT sensors)       │  Partition 2: [e4, e7, ...]      │         pipelines,
                    └──────────────────────────────────┘         monitoring)
```

**Use cases in ML:**
- Real-time feature computation from user events
- Triggering model retraining when data volumes cross thresholds
- Streaming predictions to downstream systems
- Collecting model feedback (user clicks, corrections) back to training pipelines

#### 5.4 Lambda Architecture for ML

When a system must handle both batch historical data and real-time streaming data, the **Lambda Architecture** pattern is commonly used:

```
               ┌─────────────────────────────────────────┐
               │           Lambda Architecture            │
               │                                         │
Raw Data ──────►  Batch Layer      ──────────────────────►│
               │  (Spark, Hive)                          │  Serving Layer
               │                                         │  (combines both)
               │  Speed Layer (streaming) ───────────────►│
               │  (Kafka, Flink)                         │
               └─────────────────────────────────────────┘
```

---

### MODULE 6: Monitoring & Observability

Monitoring is not optional — it is the mechanism by which you know your production system is working. The CMU Spring 2026 lab covers **Prometheus + Grafana** setup directly.

#### 6.1 The Four Layers of Production ML Monitoring

| Layer | What to Track | Tools |
|-------|---------------|-------|
| **Infrastructure** | CPU/GPU utilization, memory, latency, error rates | Prometheus, Grafana |
| **Data quality** | Input feature distributions, null rates, schema violations | Evidently AI, Great Expectations |
| **Model performance** | Prediction distributions, accuracy (when labels available), confidence calibration | Evidently AI, Arize, WhyLabs |
| **Business KPIs** | Revenue, conversion, user satisfaction tied to model decisions | Custom dashboards, Datadog |

#### 6.2 Data Drift & Concept Drift

**Drift** is the degradation of a model's relevance over time because the world has changed.

**Types of drift:**

```
Data Drift (Covariate Shift):
  P(X) changes, but P(Y|X) stays the same
  → The input feature distribution shifts
  → Example: user demographics of your product change
  → Detection: statistical tests (KS test, PSI, Jensen-Shannon divergence)

Concept Drift (Label Shift):
  P(Y|X) changes
  → The relationship between inputs and correct outputs changes
  → Example: spam techniques evolve, so old patterns no longer indicate spam
  → Detection: monitor model accuracy over time (requires labels)

Prior Probability Shift:
  P(Y) changes
  → The base rate of the target class changes
  → Example: fraud rate changes seasonally
```

**Population Stability Index (PSI):** The most widely used metric for detecting covariate drift in production:

```
PSI = Σ (Actual_% - Expected_%) × ln(Actual_% / Expected_%)

Interpretation:
  PSI < 0.1  → Insignificant shift
  PSI 0.1–0.2 → Moderate shift (investigate)
  PSI > 0.2  → Significant shift (retrain!)
```

**Evidently AI** — open-source toolkit for generating drift detection reports:

```python
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset

report = Report(metrics=[DataDriftPreset()])
report.run(reference_data=train_df, current_data=production_df)
report.save_html("drift_report.html")
```

#### 6.3 Feedback Loops

**Feedback loops** occur when model predictions influence future training data, which then influences future model predictions — creating a runaway cycle.

**Examples:**
- **Recommendation systems:** A model recommends only popular items → users click on popular items → model learns that popular items should be recommended → diversity collapses
- **Predictive policing:** A model predicts crime in certain areas → police patrol those areas more → more arrests recorded there → model's prediction confirmed → more policing → discrimination amplifies
- **Credit scoring:** A model denies credit to a group → they can't build credit history → future models have no history → they are always denied

**Detection and mitigation:** Monitoring for feedback loops requires tracking not just model accuracy but **diversity metrics, fairness metrics**, and **temporal correlations** between predictions and subsequent training data.

---

### MODULE 7: Responsible AI & Safety

#### 7.1 ML Safety Engineering

**Safety** in ML refers to preventing model failures from causing serious harm. The CMU curriculum distinguishes between:

| Concern | Description |
|---------|-------------|
| **Safety** | Preventing physical or societal harm (e.g., medical diagnosis, autonomous vehicles) |
| **Security** | Defending against adversarial attacks (e.g., prompt injection, model poisoning) |
| **Fairness** | Ensuring equitable treatment across demographic groups |
| **Privacy** | Protecting sensitive user data and preventing model memorization |
| **Explainability** | Ability to justify model decisions to users, regulators, and auditors |

**Safe system design patterns:**
- **Fail-safe defaults:** When uncertain, default to a safe action (e.g., reject a medical diagnosis if confidence is below threshold)
- **Human-in-the-loop:** For high-stakes decisions, route uncertain predictions to human reviewers
- **Graceful degradation:** If the ML component fails, the system falls back to simpler rules
- **Audit logging:** Every prediction and its inputs are logged for post-hoc analysis

#### 7.2 Fairness in ML Systems

**Fairness** is measurable but contested — different mathematical definitions of fairness are mutually incompatible (a proven impossibility result).

**Common fairness metrics:**

```
Demographic Parity:
  P(Ŷ=1 | A=0) = P(Ŷ=1 | A=1)
  Equal positive prediction rates across groups
  → Example: same loan approval rate for men and women

Equal Opportunity:
  P(Ŷ=1 | Y=1, A=0) = P(Ŷ=1 | Y=1, A=1)
  Equal true positive rates
  → Example: same hiring rate for qualified candidates across groups

Equalized Odds:
  Both TPR and FPR equal across groups
  → Stronger constraint than equal opportunity

Calibration:
  P(Y=1 | Ŷ=p, A=a) = p for all groups a
  → Confidence scores mean the same thing for all groups
```

**Impossibility theorem (Chouldechova, 2017):** When base rates differ across groups, it is impossible to simultaneously satisfy calibration, equal false positive rates, AND equal false negative rates. Engineers must make principled tradeoffs based on context.

#### 7.3 ML Security: Adversarial Attacks

Production ML systems face unique security threats:

| Attack Type | Description | Defense |
|-------------|-------------|---------|
| **Adversarial examples** | Tiny input perturbations that fool the model | Adversarial training, input preprocessing |
| **Data poisoning** | Injecting malicious training examples | Data validation, anomaly detection |
| **Model extraction** | Querying an API to clone a model | Rate limiting, output perturbation |
| **Prompt injection** | Malicious inputs hijack LLM behavior | Input sanitization, output filtering, sandboxing |
| **MCP tool abuse** | Malicious MCP servers exfiltrate data | Principle of least privilege, audit logs |

The CMU Spring 2026 curriculum added a dedicated lecture and lab on **MCP (Model Context Protocol) security** — reflecting the 2025 emergence of MCP as a standard for agentic tool use and its associated attack surfaces.

---

### MODULE 8: Technical Debt & Process

#### 8.1 Hidden Technical Debt in ML Systems

The paper "Hidden Technical Debt in Machine Learning Systems" (Sculley et al., NeurIPS 2015) identifies ML-specific forms of technical debt that accumulate in production systems:

| Debt Type | Description |
|-----------|-------------|
| **Entanglement** | Changing any input feature changes model behavior for all features (CACE principle: *Changing Anything Changes Everything*) |
| **Undeclared consumers** | Other systems consuming your model's output without coordination |
| **Data dependencies** | Unstable upstream data pipelines that silently corrupt inputs |
| **Feedback loops** | (see Module 6.3) |
| **Pipeline jungle** | Accumulated data preparation scripts with no clear ownership |
| **Configuration debt** | Untracked hyperparameters and feature flags that affect model behavior |
| **Glue code** | Generic ML packages wrapped in massive amounts of supporting code |

#### 8.2 Model Cards & Documentation

**Model Cards** (Mitchell et al., Google, 2018) are structured documentation for ML models that describe:
- Model purpose and intended use cases
- Training data (sources, preprocessing, splits)
- Evaluation results across subgroups
- Known limitations and biases
- Deployment constraints and recommendations

They are now required by regulations (EU AI Act) and platform policies (Hugging Face, Google Model Hub).

#### 8.3 EU AI Act & Governance (2025–2026)

The **EU AI Act** came into full effect in 2025, creating compliance requirements for ML systems in Europe. Regulation is real now: the EU AI Act and algorithmic accountability laws require auditability, explainability, and bias testing, with fines reaching 6% of global revenue. Governance-first MLOps is risk management, not overhead.

Key requirements for **high-risk AI systems** (medical, credit, hiring, law enforcement):
- Maintain a risk management system throughout the lifecycle
- Ensure data governance and data quality
- Provide technical documentation and model cards
- Enable human oversight mechanisms
- Achieve accuracy, robustness, and cybersecurity requirements
- Register the system in an EU database

---

### MODULE 9: LLMOps & AI Agents (2025–2026 Frontier)

#### 9.1 LLMOps — What's Different from Classical MLOps

| Dimension | Classical MLOps | LLMOps |
|-----------|----------------|--------|
| Model training | Full retraining from data | Fine-tuning, RLHF, or prompt engineering |
| Versioning | Model weights + code | Model weights + prompts + system messages |
| Evaluation | Metrics on labeled test set | LLM-as-a-judge, human preference, rubrics |
| Monitoring | Data drift, accuracy | Hallucination rates, toxicity, cost-per-token |
| Serving | Single model API | RAG pipeline, tool calls, agent loop |
| Cost | GPU training cost | Token cost (input + output) at inference |

**Unified platforms in 2026:** Tooling matured in three important ways: feature stores and data-lake/lakehouse integrations became standard infrastructure, experiment and prompt tracking expanded into GenAI observability primitives, and specialized LLM/RAG tooling (vector stores, prompt/version control, hallucination diagnostics) entered mainstream MLOps stacks.

#### 9.2 RAG Pipelines in Production

**Retrieval-Augmented Generation (RAG)** requires its own operational discipline:

```
Query
  │
  ▼
[Embedding Model] ──► [Vector Store] ──► [Retrieved Chunks]
                                                │
                                                ▼
                                        [LLM + Context] ──► Response
                                                │
                                        [Monitoring Layer]
                                         - Retrieval quality
                                         - Answer groundedness
                                         - Latency
                                         - Cost per query
```

**RAG-specific monitoring metrics:**
- **Context relevance:** Are retrieved chunks actually relevant to the query?
- **Answer faithfulness:** Does the answer only contain claims supported by the retrieved context?
- **Answer relevance:** Does the answer address the user's question?

#### 9.3 Agentic Systems & MCP Security

The Spring 2026 CMU curriculum added a dedicated week on **AI agents and MCP (Model Context Protocol)**, reflecting the 2025 explosion of agentic AI systems. Key concerns:

- **Prompt injection through tools:** A malicious document retrieved by an agent could contain instructions that hijack the agent's behavior
- **Least-privilege tool design:** Agents should only have access to tools they need for the current task
- **Audit trails:** Every tool call should be logged for security review
- **Human-in-the-loop checkpoints:** For high-stakes agentic actions (sending emails, executing code, making purchases), require explicit human approval

---

## 5. Practical Labs & Assignments

### CMU Spring 2026 Lab Schedule (Primary Source: mlip-cmu.github.io/s2026)

| Lab | Topic | Tools / Skills |
|-----|-------|---------------|
| **Lab 01** | Calling, securing, and creating APIs | Flask, REST APIs, API authentication |
| **Lab 02** | Stream processing | Apache Kafka — producer/consumer setup |
| **Lab 03** | Collaboration with Git | Git workflows, branching strategies |
| **Lab 04** | Model testing | Behavioral testing, slicing analysis |
| **Lab 05** | Containers | Docker — building, running, deploying |
| **Lab 06** | Continuous Integration | GitHub Actions — ML CI pipeline |
| **Lab 07** | Agents and MCP | MCP server setup, tool calling, security |
| **Lab 08** | Monitoring | Prometheus + Grafana — dashboards and alerts |

### Group Project: Movie Recommendation Service

The semester-long project requires teams to build, deploy, and maintain a **movie recommendation service** simulating production conditions with **1 million active users**.

**Project milestones (Spring 2026):**

| Milestone | Deliverable |
|-----------|-------------|
| **I1: ML Product** | Case study analysis of an ML product; feature design |
| **I2: Requirements** | Risk analysis, quality requirements specification |
| **I3: MCP and Security** | Agent security threat model and mitigations |
| **M1: Modeling and First Deployment** | Trained model, REST API, Docker deployment |
| **M2: Infrastructure Quality** | CI/CD pipeline, tests, monitoring dashboards |
| **M3: (continued)** | Full production system with telemetry, drift detection, A/B tests |

### Full Stack Deep Learning (FSDL 2022) Lab Sequence

FSDL, originated as a UC Berkeley course, provides an excellent complementary practical track:

| Lab | Topic |
|-----|-------|
| Lab 1 | Setup, PyTorch Lightning fundamentals |
| Lab 2 | Experiment tracking with Weights & Biases |
| Lab 3 | Python testing tools and PyTorch performance profiling |
| Lab 4 | Data sourcing, versioning, labeling pipeline |
| Lab 5 | Model deployment as REST API |
| Lab 6 | CI/CD pipeline with GitHub Actions |
| Lab 7 | Monitoring and alerting setup |
| Lab 8 | Data flywheel and active learning |

---

## 6. Tools & Technologies

### Core MLOps Stack (2026)

| Category | Tool | Description | Maturity |
|----------|------|-------------|----------|
| **Experiment Tracking** | MLflow | Open-source, de facto standard | ⭐⭐⭐⭐⭐ |
| **Experiment Tracking** | Weights & Biases | Richer UI, collaborative, commercial | ⭐⭐⭐⭐⭐ |
| **Data Versioning** | DVC | Git for data and models | ⭐⭐⭐⭐ |
| **Pipeline Orchestration** | Apache Airflow | DAG-based, data engineering standard | ⭐⭐⭐⭐⭐ |
| **Pipeline Orchestration** | Kubeflow Pipelines | Kubernetes-native ML workflows | ⭐⭐⭐⭐ |
| **Pipeline Orchestration** | Prefect / Dagster | Modern Python-first alternatives | ⭐⭐⭐⭐ |
| **Feature Store** | Feast | Open-source feature store | ⭐⭐⭐⭐ |
| **Feature Store** | Tecton | Enterprise feature platform | ⭐⭐⭐⭐ |
| **Feature Store** | Hopsworks | Open-source with streaming support | ⭐⭐⭐ |
| **Model Registry** | MLflow Registry | Integrated with MLflow tracking | ⭐⭐⭐⭐⭐ |
| **Model Serving** | BentoML | Flexible, framework-agnostic | ⭐⭐⭐⭐ |
| **Model Serving** | KServe / Seldon | Kubernetes-native model serving | ⭐⭐⭐ |
| **Monitoring** | Evidently AI | Open-source drift detection | ⭐⭐⭐⭐⭐ |
| **Monitoring** | Arize AI | Enterprise ML observability | ⭐⭐⭐⭐ |
| **Infrastructure Monitoring** | Prometheus + Grafana | Standard metrics stack | ⭐⭐⭐⭐⭐ |
| **Stream Processing** | Apache Kafka | Event streaming backbone | ⭐⭐⭐⭐⭐ |
| **Containerization** | Docker | Packaging ML services | ⭐⭐⭐⭐⭐ |
| **Orchestration** | Kubernetes | Production container management | ⭐⭐⭐⭐⭐ |
| **CI/CD** | GitHub Actions | ML pipeline automation | ⭐⭐⭐⭐⭐ |
| **Data Validation** | Great Expectations | Declarative data quality | ⭐⭐⭐⭐ |
| **Managed Platform** | AWS SageMaker | End-to-end managed ML platform | ⭐⭐⭐⭐⭐ |
| **Managed Platform** | Google Vertex AI | GCP-native ML platform | ⭐⭐⭐⭐⭐ |
| **Managed Platform** | Azure ML | Azure ML platform | ⭐⭐⭐⭐ |
| **Managed Platform** | Databricks | Unified data + ML platform | ⭐⭐⭐⭐⭐ |
| **LLMOps** | LangSmith | LLM tracing, evaluation | ⭐⭐⭐⭐ |
| **LLMOps** | Helicone / LangFuse | LLM observability | ⭐⭐⭐ |

### The Common Enterprise Pattern (2026)

The most common enterprise pattern in 2026 is a hybrid approach: a managed cloud platform (SageMaker, Vertex AI, or Azure ML) for infrastructure, combined with open-source tools (MLflow, Evidently AI, Feast) for portability and cost control.

---

## 7. Key Textbooks & Papers

### Primary Textbook

| Resource | Authors | URL | Notes |
|----------|---------|-----|-------|
| **Designing ML Systems** (O'Reilly) | Chip Huyen | ISBN 978-1098107963 | Best single-volume MLOps reference |
| **MLip/AI Engineering Textbook** | Kaestner et al. (CMU) | https://mlip-cmu.github.io/book/ | Free; directly corresponds to CMU course chapters |
| **Reliable Machine Learning** | Todd et al. (Google) | O'Reilly 2022 | Google SRE perspective on ML reliability |

### Foundational Papers

| Paper | Authors | Venue | Year | Why It Matters |
|-------|---------|-------|------|---------------|
| **Hidden Technical Debt in Machine Learning Systems** | Sculley et al. | NeurIPS | 2015 | Defines the ML debt taxonomy; required reading |
| **The ML Test Score** | Breck et al. | IEEE BigData | 2017 | Structured test framework for production ML |
| **Data Cascades in High-Stakes AI** | Sambasivan et al. | ACM CHI | 2021 | Documents how data quality failures propagate |
| **Making Data Science Systems Work** | Yang et al. | Big Data & Society | 2020 | Sociotechnical perspective on production ML |
| **Who Validates the Validators?** | Shankar et al. | ACM CHI | 2024 | LLM evaluator validation |
| **Model Cards for Model Reporting** | Mitchell et al. | ACM FAccT | 2019 | Standard for ML model documentation |
| **Fairness Through Awareness** | Dwork et al. | ITCS | 2012 | Foundational fairness formalization |
| **MLMD: Managing ML Metadata** | Schelter et al. | NeurIPS MLSys | 2019 | ML metadata management at scale |
| **Challenges in Deploying ML** | Paleyes et al. | ACM Computing Surveys | 2022 | Comprehensive survey of deployment challenges |

### Courses & Practical Resources

| Resource | Provider | URL | Type |
|----------|----------|-----|------|
| **CMU 17-445 Spring 2026** | CMU | https://mlip-cmu.github.io/s2026/ | Primary Course |
| **Full Stack Deep Learning 2022** | FSDL | https://fullstackdeeplearning.com/course/2022/ | Practical Course |
| **MLOps Zoomcamp** | DataTalks.Club | https://datatalks.club/courses/mlops-zoomcamp | Free hands-on course |
| **Made With ML** | Goku Mohandas | https://github.com/GokuMohandas/mlops-course | Comprehensive GitHub course |
| **Google MLOps Whitepaper** | Google | https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning | Reference Architecture |

---

## 8. University Comparison Table

| Topic | CMU 17-445 | Full Stack DL (Berkeley) | Google (Industry) | Coursera ML Eng. (Ng) |
|-------|------------|--------------------------|-------------------|----------------------|
| Systems thinking | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Data quality | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Model deployment | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| CI/CD for ML | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Monitoring | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Responsible AI | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Fairness | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Security | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| LLMOps | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Hands-on labs | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Theory depth | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Free access | ⭐⭐⭐⭐⭐ (GitHub) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

**Verdict:** CMU 17-445 is the gold standard for academic MLOps — uniquely rigorous on systems thinking, responsible AI, and interdisciplinary collaboration. FSDL is the best practical complement for hands-on tooling. Google's Vertex AI documentation is essential for cloud-native deployment.

---

## 9. Industry Relevance 2025–2026

### The MLOps Job Market

In 2026, demand for MLOps engineers has surged by over 35% year-on-year as enterprises race to bridge the gap between model development and production deployment.

According to Gartner's 2025 AI report, over 85% of ML projects fail to reach production — and of those that do, fewer than 40% sustain business value beyond 12 months. MLOps engineers exist to close this gap.

### Career Paths from MLOps Training

| Role | Core MLOps Skills Used | Salary Range (US, 2026) |
|------|----------------------|------------------------|
| **ML Engineer** | Pipelines, deployment, CI/CD, monitoring | $160K–$250K |
| **MLOps Engineer** | Platform engineering, Kubernetes, orchestration | $150K–$240K |
| **AI Platform Engineer** | SageMaker/Vertex AI, custom serving infrastructure | $160K–$260K |
| **Data Engineer (ML)** | Feature stores, Kafka, data pipelines | $130K–$200K |
| **ML Reliability Engineer** | Monitoring, drift detection, incident response | $150K–$230K |
| **AI Safety Engineer** | Fairness, red-teaming, responsible AI tooling | $160K–$280K |
| **LLMOps Engineer** | RAG systems, prompt management, LLM evaluation | $170K–$280K |

### Technology Adoption Map (2026)

MLflow for experiment tracking and model registry, Docker and Kubernetes for packaging and deployment, plus one cloud-native platform (SageMaker, Vertex AI, or Azure ML) — that combination covers about 80% of MLOps job listings in 2026.

### The 2026 Convergence

In 2026, the lines blur. Classical ML platforms now support LLM deployment. RAG systems combine LLMs with embedding models. AIOps platforms use LLMs for log analysis. The winning strategy isn't picking one, it's building operations that span all three. LLMOps convergence: Unified platforms manage XGBoost classifiers and fine-tuned LLaMA models through the same registry, monitoring, and deployment tooling.

---

## 10. Mathematics for MLOps

MLOps is less math-heavy than ML research, but several mathematical concepts are essential:

### Statistical Testing for Drift Detection

**Kolmogorov-Smirnov (KS) Test:** Tests whether two distributions are the same:
```
D = sup_x |F_train(x) - F_production(x)|

Where:
  F_train(x)      = CDF of training feature distribution
  F_production(x) = CDF of current production distribution
  
If D > critical value → distributions differ significantly (drift detected)
```

**Population Stability Index (PSI):**
```
PSI = Σ_{i=1}^{n} (A_i - E_i) × ln(A_i / E_i)

Where:
  A_i = actual (production) proportion in bucket i
  E_i = expected (reference/training) proportion in bucket i
```

### A/B Testing Statistics

**Sample size calculation for an A/B test:**
```
n = (z_{α/2} + z_β)² × (σ₁² + σ₂²) / δ²

Where:
  z_{α/2} = z-score for significance level α (e.g., 1.96 for α=0.05)
  z_β     = z-score for power (e.g., 0.84 for 80% power)
  σ²      = variance of the metric
  δ       = minimum detectable effect size
```

### Information Theory for Model Monitoring

**KL Divergence** — measuring how much a production distribution has shifted from the reference:
```
KL(P || Q) = Σ P(x) × log(P(x) / Q(x))

Interpretation: 0 means identical distributions; larger values indicate greater divergence
```

**Jensen-Shannon Divergence** (symmetric, bounded):
```
JSD(P || Q) = ½ KL(P || M) + ½ KL(Q || M)
Where M = ½(P + Q)

Range: [0, 1] — suitable for normalizing drift scores
```

### Reliability Engineering (SRE Concepts)

**Mean Time To Recovery (MTTR):**
```
MTTR = Total downtime / Number of incidents
```

**Service Level Objectives (SLOs):**
```
Availability SLO = (Total time - Downtime) / Total time × 100%

Error budget = 1 - SLO
For 99.9% SLO: error budget = 0.1% ≈ 8.7 hours/year of allowable downtime
```

---

## 11. Research Links & Sources

### Primary Course Materials

| Source | URL | Type |
|--------|-----|------|
| CMU 17-445 Spring 2026 (live) | https://mlip-cmu.github.io/s2026/ | Primary syllabus & labs |
| CMU MLIP GitHub | https://github.com/mlip-cmu | All course materials (open source) |
| CMU MLIP Textbook (free) | https://mlip-cmu.github.io/book/ | Official course textbook |
| CMU SEAI GitHub (historical) | https://github.com/ckaestne/seai/ | Older course materials |
| Full Stack Deep Learning 2022 | https://fullstackdeeplearning.com/course/2022/ | Practical course |

### Tools Documentation

| Tool | URL |
|------|-----|
| MLflow | https://mlflow.org/docs/latest/index.html |
| DVC | https://dvc.org/doc |
| Kubeflow Pipelines | https://www.kubeflow.org/docs/ |
| Evidently AI | https://docs.evidentlyai.com/ |
| Weights & Biases | https://docs.wandb.ai/ |
| Apache Kafka | https://kafka.apache.org/documentation/ |
| Prometheus | https://prometheus.io/docs/introduction/overview/ |
| Grafana | https://grafana.com/docs/ |
| Google Vertex AI | https://cloud.google.com/vertex-ai/docs/ |
| Feast Feature Store | https://docs.feast.dev/ |
| Great Expectations | https://docs.greatexpectations.io/ |

### Key Papers

| Paper | URL |
|-------|-----|
| Hidden Technical Debt in ML Systems | https://proceedings.neurips.cc/paper_files/paper/2015/file/86df7dcfd896fcaf2674f757a2463eba-Paper.pdf |
| The ML Test Score (Google) | https://static.googleusercontent.com/media/research.google.com/en//pubs/archive/46555.pdf |
| Data Cascades in High-Stakes AI | https://dl.acm.org/doi/abs/10.1145/3411764.3445518 |
| Monitoring and Explainability in Production | https://arxiv.org/abs/2007.06299 |

---

## 🧭 Learning Path Recommendations

```
Beginner Track (3–4 months):
  1. Complete MLOps Zoomcamp (DataTalks.Club — free)
  2. Read CMU textbook Chapters 1–7, 10–13
  3. Build a simple end-to-end project: train → MLflow → Docker → deploy API
  4. Add monitoring: Prometheus + Grafana + Evidently AI

Intermediate Track (2–3 months additional):
  1. Audit CMU 17-445 labs (all open source on GitHub)
  2. Implement DVC + GitHub Actions CI pipeline
  3. Set up Kubeflow or Airflow for pipeline orchestration
  4. Read: Hidden Technical Debt paper + ML Test Score paper

Advanced / Production Track:
  1. Study FSDL 2022 full course
  2. Implement feature store with Feast
  3. Build A/B testing framework with proper statistical power analysis
  4. Add responsible AI: fairness metrics, model cards, drift detection
  5. Explore LLMOps: LangSmith, RAG monitoring, prompt versioning
```

---

*Report written by Claude (Anthropic) — May 2026*  
*Primary research source: CMU 17-445/17-645/17-745 Machine Learning in Production, Spring 2026 (mlip-cmu.github.io/s2026)*  
*Cross-referenced with: Full Stack Deep Learning 2022, Google Vertex AI MLOps documentation, MLOps Zoomcamp, industry reports 2025–2026*
