# PRISM Phase 4: Temporal Evidence Firewall & Hybrid Retrieval

**Team:** The Falcons (Fuzail Ahmad & Lakshya Garg)  
**Status:** In Production  
**Backend API:** `https://prism-api-z7c9.onrender.com` / `http://localhost:8000`  
**Endpoints:** `POST /sessions`, `PATCH /sessions/{id}/playback`, `POST /retrieve`  

---

## 1. Architectural Overview

Phase 4 implements PRISM's primary technical breakthrough: the **Temporal Evidence Firewall** and **SQL Pre-Filtered Hybrid Retrieval Engine**. 

Generic LLM learning assistants suffer from **Downstream Information Leakage**—they retrieve content from later in a lecture, spoiling homework assignments, revealing answers prematurely, and depriving students of active discovery. PRISM mathematically guarantees that no chunk, token, or concept from downstream timestamps can enter the retrieval pool or reach an LLM in `learn_so_far` mode.

```
+-------------------------------------------------------------------------------+
|                               Learner Query                                   |
|                "How do we delete a node with two children?"                   |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                    Deictic Context Resolver (api/context/)                    |
|           Resolves "this" / "that" / "here" to nearby permitted cue           |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                   SQL-Level Temporal Candidate Pre-Filter                     |
|           WHERE (video AND start_sec < t) OR (ppt AND slide <= max_s)         |
|  +------------------------------------+------------------------------------+  |
|  |     pgvector Cosine Similarity     |    Postgres tsvector Full-Text     |  |
|  |       (768-dim embeddings)         |            (GIN Index)             |  |
|  +------------------------------------+------------------------------------+  |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                    Reciprocal Rank Fusion (RRF, k=60)                         |
|                    RRF(d) = sum( 1 / (60 + rank_m(d)) )                       |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                    Word-Level Straddling Interpolator                         |
|     At 18:42: reconstructs ONLY elapsed words; excludes future suffix        |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                    Cross-Encoder / LLM Semantic Reranker                      |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                     Scoped Context Builder (E1, E2... En)                     |
|                    Bounded token budget & stable citations                    |
+-------------------------------------------------------------------------------+
```

---

## 2. Temporal Evidence Firewall Specification

### 2.1 Pure Evaluation Engine (`api/firewall/engine.py`)
The firewall evaluates candidate chunks against strict causal rules:
1. **Fully Elapsed ($t_{\text{end}} \le t_{\text{current}}$):** Admitted completely without modification.
2. **Fully Future ($t_{\text{start}} \ge t_{\text{current}}$):** Blocked completely (`EXCLUDED_FUTURE`). Zero tokens reach the prompt.
3. **Straddling Boundary ($t_{\text{start}} < t_{\text{current}} < t_{\text{end}}$):** Proportional word-level timing interpolation reconstructs the permitted prefix.
4. **Static Multi-Modal Resources (Slides & PDF):** Mapped to chronological lecture landmarks via `ResourceTimestampPolicy`.

### 2.2 The 18:42 Boundary Invariant
In the seeded CS 201 Binary Search Trees lecture:
- **0:00 - 18:42 (0.0s - 1122.0s):** Motivation, BST Property, In-Order Traversal, Search, Insertion, and Order Statistics (Minimum, Maximum, Successor).
- **18:42:** Order Statistics concludes. Deletion algorithm begins.
- **Firewall Guarantee:** A student at 18:42 querying "How do we delete a node with two children?" is strictly blocked from receiving deletion algorithm chunks. If a straddling chunk spans 18:30 to 19:00, only the first 40% (the successor conclusion) is admitted, terminating with an ellipsis `...`.

### 2.3 Mode Switching & History Sanitization
- `learn_so_far`: Strict anti-spoiler mode.
- `explore_ahead`: Unconstrained exploration across future chunks. All turns generated are tagged with `explored_ahead = True`.
- **Mode Switch Back:** When the student returns to `learn_so_far`, `filter_conversation_history` purges all exploratory turns from the LLM prompt context to eliminate conversational memory leakage.

---

## 3. Policy Layer & API Endpoints

### 3.1 Session Lifecycle (`api/routers/sessions.py`)
- `POST /sessions`: Initializes a session with `course_id`, `playback_sec`, and `mode`.
- `GET /sessions/{id}`: Returns live session state.
- `PATCH /sessions/{id}/playback`: Updates playback boundary and firewall mode.

### 3.2 Debug Retrieval Endpoint (`api/routers/retrieve.py`)
- `POST /retrieve`:
```json
{
  "query": "What is the binary search tree property?",
  "course_id": "00000000-0000-0000-0000-000000000002",
  "playback_sec": 1122.0,
  "mode": "learn_so_far",
  "top_k": 5
}
```
Returns:
- `admitted`: List of permitted chunks with reconstructed text, similarity score, and admission reason.
- `blocked`: List of excluded chunks with explicit causal rejection reasons (`EXCLUDED_FUTURE`, `EXCLUDED_RESOURCE_POLICY`).
- `scoped_prompt_preview`: Exact formatted prompt block with stable `[E1]`, `[E2]` citation IDs.

---

## 4. Test Verification Suite (`scripts/verify_phase4.py`)

Run the automated verification suite:

```bash
python scripts/verify_phase4.py
# or
npm run verify:phase4
```

### Test Suite Matrix (35 Passed):
| Suite | Tests | Description |
| :--- | :--- | :--- |
| `test_prefix_interpolator.py` | 5 | Word-level timing interpolation at 18:42, minimum word thresholds, punctuation cleaning. |
| `test_firewall.py` | 9 | Chunk admission, future exclusion, slide/PDF policy, mode switching, anti-leakage. |
| `test_rrf.py` | 3 | Reciprocal Rank Fusion score aggregation, rank stability, dual-match boosting. |
| `test_context_resolver.py` | 3 | Deictic pronoun resolution ("this", "that", "here") against permitted focal cues. |
| `test_context_builder.py` | 2 | Stable evidence IDs (`E1..En`), coordinate formatting, token budget limit. |
| `test_cache_keys.py` | 4 | SHA256 isolation by user, authorization role, quantized temporal bin, and mode. |
| `test_session_endpoints.py` | 2 | `POST /sessions`, `GET /sessions/{id}`, `PATCH /sessions/{id}/playback`. |
| `test_retrieve_endpoint.py` | 2 | `POST /retrieve` audit endpoint with admitted vs blocked diagnostics. |
| `test_boundary_conditions.py` | 3 | Exact-equal timestamps (`playback == end`, `playback == start`, epsilon precision). |
| `test_leakage_adversarial.py` | 1 | Prompt injection resistance; programmatic SQL-level enforcement. |
| `test_end_to_end_firewall.py` | 1 | Full lifecycle: session creation, guarded retrieval at 18:42, playback advance, unlocked retrieval. |

---

*Team The Falcons &bull; PRISM Platform &bull; Hackathon 2026*
