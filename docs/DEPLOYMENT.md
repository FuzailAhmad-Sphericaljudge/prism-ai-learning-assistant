# PRISM Production Deployment Guide

> **Authoritative Deployment Reference**  
> Consolidates, updates, and supersedes legacy notes in [`docs/DEPLOY.md`](file:///c:/Users/Fuzail%20Jarvis/OneDrive/Desktop/Prism/docs/DEPLOY.md) and [`docs/INFRA.md`](file:///c:/Users/Fuzail%20Jarvis/OneDrive/Desktop/Prism/docs/INFRA.md).

---

## 1. High-Level Production Architecture

PRISM is architected as a decoupled, multi-tier system with an edge-optimized frontend, containerized temporal firewall API, and cloud PostgreSQL vector database:

```mermaid
flowchart TD
    subgraph ClientLayer ["Client & Global Edge"]
        User["Learner / Browser"] -->|"HTTPS / WSS"| VercelEdge["Vercel Global Edge Network\nNext.js 14 App Router (SSR)"]
    end

    subgraph ServiceLayer ["Compute Layer (Render Cloud)"]
        VercelEdge -->|"REST / SSE Stream (/chat/stream)"| RenderAPI["Render Web Container (FastAPI)\nTemporal Evidence Firewall Engine"]
    end

    subgraph DataLayer ["Data & AI Cloud"]
        RenderAPI -->|"SQL / pgvector HNSW"| SupabaseDB[("Supabase Cloud PostgreSQL 16\npgvector Extension + GIN Index")]
        RenderAPI -->|"Embeddings / Citations"| GeminiAPI["Google Gemini 1.5 Pro / Flash\nor Deterministic Mock Provider"]
    end
```

---

## 2. Prerequisites & Free-Tier Accounts

To deploy the complete production stack with zero cloud cost, create accounts on the following free-tier platforms:

| Platform | Role | Required Tier | Signup Link |
| :--- | :--- | :--- | :--- |
| **GitHub** | Source repository & CI/CD trigger | Free | [github.com](https://github.com) |
| **Vercel** | Frontend Next.js edge deployment | Hobby (Free) | [vercel.com](https://vercel.com) |
| **Render** | Containerized FastAPI backend server | Individual / Free Tier | [render.com](https://render.com) |
| **Supabase** | Cloud PostgreSQL with native `pgvector` | Free Tier (500MB DB) | [supabase.com](https://supabase.com) |
| **Google AI Studio** | Gemini 1.5 LLM & text-embedding-004 keys | Free Tier (15 RPM) | [aistudio.google.com](https://aistudio.google.com) |

---

## 3. Step-by-Step Deployment Instructions

### Step 3.1: Cloud Database Setup (Supabase)
1. Log in to [supabase.com](https://supabase.com) and click **New project**.
2. Set your **Database Password** and select the region nearest to your Render compute (e.g., `AWS Tokyo - ap-northeast-1` or `AWS US East - us-east-1`).
3. Open the **SQL Editor** in the Supabase Dashboard and enable the vector extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Navigate to **Project Settings** > **Database** > **Connection string**. Copy the **URI** connection string.
   > **Format:** `postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres`

### Step 3.2: Obtain Gemini API Credentials
1. Navigate to [Google AI Studio](https://aistudio.google.com).
2. Click **Get API key** > **Create API key in new project**.
3. Copy the generated key (`AIzaSy...`). *(If evaluating offline or in demo mode, you may omit this and run `LLM_PROVIDER=mock`).*

### Step 3.3: Deploy Containerized Backend (Render)
1. Log in to [render.com](https://dashboard.render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository: `https://github.com/<owner>/prism-ai-learning-assistant`.
4. Configure service parameters:
   - **Name:** `prism-api`
   - **Region:** Nearest to your database (e.g., `Oregon (US West)` or `Singapore`)
   - **Environment:** `Docker`
   - **Dockerfile Path:** `./api/Dockerfile`
   - **Docker Context:** `.` (root directory)
5. Add the required Environment Variables in the Render dashboard:
   - `DATABASE_URL`: Your Supabase connection string.
   - `LLM_PROVIDER`: `gemini` (or `mock` for deterministic demo mode).
   - `GEMINI_API_KEY`: Your Google AI Studio key.
   - `CORS_ORIGINS`: `["https://<your-vercel-domain>.vercel.app","http://localhost:3000"]`
   - `PORT`: `8000`
6. Click **Create Web Service**.
7. Once deployed, verify health:
   ```bash
   curl -s https://prism-api-z7c9.onrender.com/health | jq
   ```

### Step 3.4: Deploy Frontend (Vercel)
1. Log in to [vercel.com](https://vercel.com) and click **Add New...** > **Project**.
2. Select your repository and configure:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `web` *(Click Edit and enter `web`)*
3. Expand **Environment Variables** and add:
   - `NEXT_PUBLIC_API_URL`: `https://prism-api-z7c9.onrender.com`
   - `NEXT_PUBLIC_APP_URL`: `https://web-one-blue-mbb8ovavhb.vercel.app`
4. Click **Deploy**. Vercel will build and assign production URLs.

### Step 3.5: Run Database Migrations & Ingest Course Seed
From your local terminal connected to the production database:
```bash
# 1. Run Alembic schema migrations
alembic -c api/alembic.ini upgrade head

# 2. Seed multi-modal lecture content (VTT transcript, PDF reading, PPT slides, Notes)
python scripts/seed_demo.py
```

---

## 4. Environment Variables Reference

| Variable Name | Target Service | Example (Fake Value) | Description / Where to Obtain |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Render / Local | `postgresql://postgres:db_pass@aws-0-us-east-1.pooler.supabase.com:5432/postgres` | Supabase > Settings > Database > Connection URI |
| `LLM_PROVIDER` | Render / Local | `gemini` or `mock` | LLM execution adapter (`gemini`, `bedrock`, or `mock`) |
| `GEMINI_API_KEY` | Render / Local | `AIzaSyFakeKeyPlaceholder9912048XyZ` | Google AI Studio > Get API Key |
| `CORS_ORIGINS` | Render / Local | `["https://prism-web.vercel.app","http://localhost:3000"]` | Allowed origins for cross-site browser requests |
| `NEXT_PUBLIC_API_URL` | Vercel | `https://prism-api-z7c9.onrender.com` | Base URL of deployed Render API |
| `NEXT_PUBLIC_APP_URL` | Vercel | `https://web-one-blue-mbb8ovavhb.vercel.app` | Canonical domain for OpenGraph / social sharing metadata |
| `PORT` | Render / Local | `8000` | Port for FastAPI Uvicorn ASGI server |

> [!IMPORTANT]
> Never commit real secrets or credentials to version control. Set environment variables exclusively through the Vercel / Render dashboard or a local uncommitted `.env` file.

---

## 5. Local Run with Docker Compose

To test the entire containerized architecture locally with PostgreSQL and pgvector:

```bash
# 1. Start database and API containers
docker compose up -d --build

# 2. Inspect running containers
docker compose ps

# 3. Verify health probe
curl -s http://localhost:8000/health | jq

# 4. Tear down when finished
docker compose down -v
```

---

## 6. Post-Deployment Smoke Test

Verify the deployment using the automated smoke test script:

```bash
# Linux / macOS / Git Bash
bash scripts/smoke.sh https://prism-api-z7c9.onrender.com

# Windows PowerShell
.\scripts\smoke.ps1 -BaseUrl "https://prism-api-z7c9.onrender.com"
```

### Expected Output:
```text
==================================================
 PRISM Production Smoke Test Suite
 Base URL: https://prism-api-z7c9.onrender.com
==================================================
[1/5] Health Check Probe (/health)... PASSED (200 OK)
[2/5] Course Library Listing (/courses)... PASSED (200 OK)
[3/5] Temporal Transcript Retrieval (/courses/{id}/transcript)... PASSED (200 OK)
[4/5] Multi-Modal Resource Bundles (/courses/{id}/resources)... PASSED (200 OK)
[5/5] Temporal Evidence Firewall Query (/retrieve)... PASSED (200 OK)
==================================================
 All smoke tests PASSED. Production deployment operational.
==================================================
```

---

## 7. Troubleshooting Matrix

| Issue | Symptom | Root Cause | Remediation Step |
| :--- | :--- | :--- | :--- |
| **Render Cold Start** | API calls take 30-50s on initial load | Render free-tier spins down container after 15m idle | Built-in client fallback serves cached responses instantly while server wakes; ping `/health` before demos. |
| **CORS Block** | Browser console: `CORS policy blocked access` | Frontend Vercel domain not registered in API | Add domain to `CORS_ORIGINS` in Render or verify wildcard `r"https://.*\.vercel\.app"` in `api/main.py`. |
| **Missing pgvector** | `type "vector" does not exist` on migration | Extension not activated in Postgres | Run `CREATE EXTENSION IF NOT EXISTS vector;` in Supabase SQL editor. |
| **Invalid Database URL** | `connection failed: connection refused` | Missing pooler password or incorrect host | Check Supabase Connection URI; encode special characters in password (`%25`, etc.). |
| **Gemini Quota Exceeded** | `HTTP 429 Too Many Requests` | Google AI Studio rate limit reached | Set `LLM_PROVIDER=mock` in Render to switch to deterministic cached provider. |
| **Client Connection Error** | Chat shows connection retry banner | Frontend calling `localhost:8000` | Ensure `getApiBaseUrl()` defaults to `https://prism-api-z7c9.onrender.com`. |

---

## 8. Redeployment & Rollback Procedures

### Frontend Redeployment & Instant Rollback (Vercel)
- **Automatic Deployment:** Every push to `main` automatically triggers a production build.
- **Instant Rollback:**
  1. Open [vercel.com/falcons22/web](https://vercel.com/falcons22/web).
  2. Navigate to **Deployments**.
  3. Select any prior known good deployment.
  4. Click `...` > **Promote to Production**. Rollback completes in under 2 seconds without rebuilding.

### Backend Redeployment & Rollback (Render)
- **Manual Trigger:** In [dashboard.render.com](https://dashboard.render.com), select `prism-api` > **Manual Deploy** > **Deploy latest commit**.
- **Rollback:** In the **Events** tab, locate the prior successful build and select **Rollback to this revision**.
