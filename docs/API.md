# PRISM Backend API Specification

> **Base URL:** `https://prism-api.onrender.com` (Production) / `http://localhost:8000` (Local)

---

## 1. System Endpoints

### `GET /health`
Returns runtime uptime, active LLM provider, database connection state, and pgvector extension status.

**Response (200 OK):**
```json
{
  "status": "ok",
  "app": "PRISM API",
  "version": "0.1.0",
  "environment": "production",
  "llm_provider": "gemini",
  "uptime_seconds": 124.5,
  "timestamp": "2026-10-20T04:30:00Z",
  "database": {
    "connected": true,
    "version": "PostgreSQL 17.11",
    "pgvector_active": true,
    "pgvector_version": "0.8.2"
  },
  "provider": {
    "status": "ok",
    "provider": "gemini",
    "gen_model": "gemini-3.5-flash-lite",
    "embed_model": "gemini-embedding-001",
    "embedding_dim": 3072
  }
}
```

### `GET /version`
Returns service metadata and team attribution.

**Response (200 OK):**
```json
{
  "app": "PRISM API",
  "version": "0.1.0",
  "team": "The Falcons",
  "firewall": "Temporal Evidence Firewall v1.0",
  "llm_provider": "gemini"
}
```

---

## 2. Temporal Retrieval & Firewall Endpoints

### `POST /api/query`
Executes temporal vector search strictly bounded by $t \le T_{playback}$.

**Headers:**
- `X-Request-ID`: Unique request tracking UUID

**Request Payload:**
```json
{
  "lecture_id": "8f8b0593-3d0d-407d-a19d-7df66c7b98a1",
  "query": "How does self-attention compute affinities?",
  "playback_timestamp": 125.0
}
```

**Response (200 OK):**
```json
{
  "answer": "The query and key matrices are multiplied via dot product to calculate raw affinities before scaling.",
  "playback_timestamp": 125.0,
  "spoilers_blocked": 0,
  "citations": [
    {
      "type": "transcript",
      "timestamp": 45.0,
      "label": "00:45",
      "content": "The query matrix Q and key matrix K are multiplied using a dot product..."
    },
    {
      "type": "slide",
      "slide_number": 4,
      "label": "Slide 4",
      "content": "Formula: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) V"
    }
  ]
}
```

---

## 3. Adaptive Mock Interview Endpoints

### `POST /api/interview/start`
Initializes an adaptive oral interview session linked to course rubrics.

### `POST /api/interview/respond`
Submits student oral or textual response, evaluates understanding against rubrics, and generates revision links.
