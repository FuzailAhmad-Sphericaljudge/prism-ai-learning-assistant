# PRISM System Architecture Specification

> **Team The Falcons | Hackathon 2026**  
> System: **PRISM — Timestamp-Aware AI Learning Assistant with Temporal Evidence Firewall**

---

## 1. High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph UI ["Client Layer (Vercel Global Edge CDN)"]
        User(["Learner / Browser"])
        LP["Landing & Refraction Visualizer (/)"]
        Learn["Learn Screen (/learn/[id])"]
        Prac["Practice & Mastery (/practice & /mastery)"]
        Oral["Oral Defense Mock Interview (/interview)"]
        Edu["Educator Insights Dashboard (/educator)"]
        Player["HTML5 Video / Dynamic Canvas Engine"]
        Zustand["Zustand Playback Store (playback_sec)"]
    end

    subgraph API ["Backend Layer (Render FastAPI Container)"]
        Router["FastAPI ASGI Gateway"]
        AuthMiddleware["TraceContext & RequestId Middleware"]
        SessionMgr["Session & Playback Manager"]
        
        subgraph CoreEngine ["Core PRISM Innovations"]
            Firewall["Temporal Evidence Firewall\n(t <= t_playback Cutoff + Word-Level Interpolation)"]
            Hybrid["Hybrid Retrieval Engine\n(pgvector Cosine Top-K + GIN tsvector BM25)"]
            RRF["Reciprocal Rank Fusion (RRF)"]
            Validator["Output Citation & Temporal Scope Validator"]
        end

        TutorFlow["Socratic Grounded Tutor Workflow"]
        PracticeGen["Misconception & Practice Evaluator"]
        InterviewAgent["Adaptive Oral Defense Interview Loop"]
    end

    subgraph Data ["Data & Storage Layer (Supabase PostgreSQL 16)"]
        DB[("PostgreSQL 16 with pgvector & GIN")]
        Chunks[("Source Chunks\nvector(768) + tsvector")]
        Sessions[("Learner Sessions & Temporal Snapshots")]
        MasteryRec[("Derived Mastery Records & Attempts")]
        Storage[("Multi-Modal Media (VTT, PDF, PPTX, Notes)")]
    end

    subgraph LLM ["AI & Embedding Providers"]
        GeminiPro["Google Gemini 1.5 Pro / Flash API"]
        GeminiEmbed["Google text-embedding-004 (768-dim)"]
        MockProvider["Deterministic Cached Demo Engine"]
    end

    %% Connections
    User --> LP & Learn & Prac & Oral & Edu
    Learn --> Player
    Player --> Zustand
    Zustand -->|"playback_sec live sync"| Router

    Router --> AuthMiddleware --> SessionMgr
    SessionMgr --> Firewall
    Firewall --> Hybrid
    Hybrid --> RRF
    RRF --> TutorFlow
    TutorFlow --> GeminiPro & GeminiEmbed & MockProvider
    TutorFlow --> Validator
    Validator -->|"Validated Stream [E1]"| Learn

    Router --> PracticeGen --> DB
    Router --> InterviewAgent --> DB
    Hybrid --> DB
    DB --> Chunks & Sessions & MasteryRec
```

---

## 2. Architectural Pillars

### 1. Temporal Evidence Firewall
- **Invariant:** At video timestamp $t_{\text{playback}}$, an admitted evidence chunk $C$ must satisfy $\max(\text{timestamp}(C)) \le t_{\text{playback}}$.
- **Boundary Straddle Handling:** For chunks straddling $t_{\text{playback}}$ (e.g. at 18:42 for a segment ending at 19:00), sub-second word-level timestamp interpolation reconstructs ONLY the permitted spoken prefix. The future suffix is strictly withheld prior to candidate retrieval.
- **Pedagogical Integrity:** Future concepts (e.g. node deletion, AVL rebalancing) cannot be spoiled or cited while in **Learn So Far** mode.

### 2. Hybrid Retrieval with Reciprocal Rank Fusion (RRF)
- Dense semantic vector search via PostgreSQL `pgvector` (cosine distance top-$K$).
- Sparse lexical search via PostgreSQL `tsvector` with GIN indexing (BM25 keyword top-$K$).
- Candidates are merged via RRF score:
  $$\text{RRF}(d) = \sum_{m \in \{\text{dense}, \text{sparse}\}} \frac{1}{60 + \text{rank}_m(d)}$$

### 3. Pre-Output Citation Validation
- Every generated response must contain inline bracketed citations (e.g. `[E1]`, `[E2]`).
- A deterministic validation layer verifies that every cited chunk ID resides strictly in the admitted candidate set.
- Any forward-referencing claims trigger an automatic one-time regeneration or safe "Not covered yet" redirection.

### 4. Zero-Downtime Multi-Tier Deployment
- **Frontend:** Next.js 14 App Router deployed to Vercel Global Edge CDN with responsive multi-modal panels.
- **Backend:** FastAPI container hosted on Render with health checks, structured tracing, and request-id telemetry.
- **Database:** Supabase PostgreSQL 16 with native `pgvector 0.8.2` and connection pooling.
