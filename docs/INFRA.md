# PRISM Infrastructure Specification

> **Team The Falcons | Hackathon 2026**  
> Architecture: Distributed Free-Tier Cloud Topology

---

## 🗺️ Infrastructure Matrix

| Layer | Service | Provider | Region | Production URL / Endpoint | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Code Repository** | GitHub | GitHub | Global | `https://github.com/FuzailAhmad-Sphericaljudge/prism-ai-learning-assistant` | Source control, CI/CD Actions |
| **Web Frontend** | Vercel | Vercel | Global CDN | `https://web-one-blue-mbb8ovavhb.vercel.app` | Next.js 14 App Router SSR + UI |
| **API Backend** | Render | Render | Oregon | `https://prism-api-z7c9.onrender.com` | FastAPI server, Temporal Firewall engine |
| **Vector & RDBMS** | Supabase | Supabase (AWS) | Tokyo (`ap-northeast-1`) | `aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres` | PostgreSQL 17.11 with `pgvector 0.8.2` |
| **LLM & Embeddings** | Gemini AI | Google AI Studio | Global | `models/gemini-3.5-flash-lite`, `models/gemini-embedding-001` | Socratic answers, rubric scoring, 3072-dim embeddings |

---

## 🔒 Secret Allocation & Hosting Variables

> **RULE:** Strictly zero secrets committed to Git repository. All secrets live only in `.env` (local) and respective cloud provider environment dashboards.

### 1. Render Dashboard (`/api`)
- `APP_NAME`: `PRISM API`
- `APP_ENV`: `production`
- `DEBUG`: `false`
- `PYTHON_VERSION`: `3.11.9`
- `PYTHONPATH`: `..`
- `LLM_PROVIDER`: `gemini` (or `mock` for fallback)
- `GEMINI_API_KEY`: Google AI Studio API key
- `DATABASE_URL`: Supabase Session Pooler connection URI (`postgresql://postgres.qhqoyhqkqfoqcgcaposk:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`)
- `CORS_ORIGINS`: `https://web-one-blue-mbb8ovavhb.vercel.app,http://localhost:3000`

### 2. Vercel Dashboard (`/web`)
- `NEXT_PUBLIC_APP_NAME`: `PRISM`
- `NEXT_PUBLIC_APP_VERSION`: `0.1.0`
- `NEXT_PUBLIC_API_URL`: `https://prism-api-z7c9.onrender.com`
- `NEXT_PUBLIC_ENABLE_DEMO_MOCK`: `true`

---

## 🔄 Deployment & Redeployment Protocols

### Deploying Frontend (`/web`)
Whenever changes are pushed to `main`, Vercel auto-deploys.
To deploy manually via CLI:
```bash
cd web
vercel --prod
```

### Deploying Backend (`/api`)
Whenever changes are pushed to `main`, Render auto-triggers the blueprint rebuild.
To force a manual rebuild from CLI or dashboard:
1. Open [dashboard.render.com](https://dashboard.render.com).
2. Click service **prism-api** -> **Manual Deploy** -> **Deploy latest commit**.

### Verifying Environment Health
Run the automated verification script:
```bash
python scripts/check_env.py
```
This tests:
1. Gemini API key validity + text generation + text-embedding-004 dimensionality.
2. Supabase connection via PostgreSQL driver.
3. Active `vector` extension in database.
