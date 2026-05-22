# Crypto World Bank — assistant / chatbot flows

This note matches the current codebase: the **in-product assistant** (widget, landing section, AI Assistant page) uses **streaming LLM** via `/api/ai/chat/stream`. A separate **rule-based intent API** exists at `/api/chatbot` for structured replies (not used by the React UI today). **Peer messaging** uses `/api/chat/threads` and is not part of these assistant flows.

---

## 1. End-to-end flow (Mermaid)

Use this block in tools that render Mermaid (or export to PNG/SVG for LaTeX, e.g. [Mermaid Live Editor](https://mermaid.live) or `mmdc`).

```mermaid
flowchart TB
  %% Thesis-friendly end-to-end streaming assistant flow

  subgraph client["Client (React)"]
    U[User enters message / clicks suggestion]
    UI["Surfaces: ChatbotWidget · LandingAssistantSection · AIAssistant page"]
    HIST["Build transcript: user+assistant turns"]
    SC["streamChat() — aiStream.ts (SSE fetch)"]
    JWT[("localStorage: JWT (if logged in)")]
    SSE["SSE handler: meta → token* → done | error"]
    RENDER["Render: MarkdownMessage + typing/streaming UI"]
    ERRUI["Show error state + retry option"]
  end

  subgraph api["CWB backend (Express)"]
    EP["POST /api/ai/chat/stream"]
    CT["Set/verify stream headers (text/event-stream)"]
    VAL["Validate input (Zod): messages[1..80], featureKey?, route?"]
    OA["optionalAuth: attach user when Bearer JWT present"]
    SP["buildSystemPrompt: domain rules + page/feature context + user role/name"]
    NM["normalizeMessages: trim / drop empty"]
    FM["Assemble: [system] + normalized conversation"]
    LLM_REQ["Call LLM: POST {llmBaseUrl}/v1/chat/completions (stream=true)"]
    BR["Bridge upstream stream → SSE events (meta/token/error/done)"]
    CLOSE["Close SSE response"]
  end

  subgraph upstream["External"]
    LLM["OpenAI-compatible LLM"]
  end

  U --> UI --> HIST --> SC
  JWT -.->|Authorization: Bearer| SC

  SC -->|HTTP request body| EP
  EP --> CT --> VAL --> OA --> SP --> NM --> FM --> LLM_REQ --> LLM
  LLM --> BR -->|text/event-stream| SSE --> RENDER --> U

  %% End conditions / failures
  SSE -->|error event| ERRUI
  VAL -.->|400/validation error| ERRUI
  LLM_REQ -.->|upstream/network error| BR
  BR --> CLOSE
```

---

## 2. Rule-based intent chatbot (backend API only)

Optional path for deterministic, database-backed answers (keyword `classify` → `handleIntent`); response is JSON, not streamed.

```mermaid
flowchart LR
  C[Client — any HTTP client] -->|POST /api/chatbot/message + JWT| RA["requireAuth"]
  RA --> Z["Validate body: message, optional context"]
  Z --> CL["classify(message) — keyword intents"]
  CL --> H["handleIntent — role checks, db.store reads"]
  H --> J["JSON: reply, intent, confidence, actions[], suggestions[]"]
```

`GET /api/chatbot/welcome` returns a greeting and role-tailored suggestion chips (same router).

---

## 3. High-level sequence (text, for thesis captions)

**Streaming assistant**

1. User submits text in the UI; the client builds the chat transcript and calls `streamChat`.
2. The client sends `POST /api/ai/chat/stream` with `messages`, optional `featureKey` (from route), `route`, and `roleHint`; it adds `Authorization` when a session token exists.
3. The backend optionally resolves the user from JWT, builds a **system prompt** (CWB hierarchy, safety/limitations, current page context, user role/name).
4. The backend forwards the conversation to the configured **OpenAI-compatible** endpoint with `stream: true`.
5. Tokens from the model are relayed to the browser as **Server-Sent Events** until `done` or an error; the UI appends tokens to the assistant bubble and shows the model id from `meta`.

**Intent API**

1. Authenticated `POST /api/chatbot/message` runs keyword classification, then handlers that read in-memory `db` state (limits, loans, banks) and return structured text plus deep links (`actions`) and follow-up prompts (`suggestions`).
