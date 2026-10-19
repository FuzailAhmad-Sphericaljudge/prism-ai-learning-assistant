# PRISM Deployment Guide

> **Zero-Cost Free-Tier Production Setup**  
> Frontend: **Vercel** (`/web`)  
> Backend: **Render** / **Railway** (`/api`)  
> Database: **Supabase** (PostgreSQL + `pgvector`)  
> Team: **The Falcons** (Hackathon 2026)

---

## 1. Frontend Deployment on Vercel (`/web`)

### Option A: Via Vercel Web Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** -> **"Project"**.
3. Import the repository: `https://github.com/FuzailAhmad-Sphericaljudge/Prism`.
4. Configure the Project:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
5. **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_APP_NAME` | `PRISM` | Application brand name |
   | `NEXT_PUBLIC_APP_VERSION` | `0.1.0` | Production release version |
   | `NEXT_PUBLIC_API_URL` | `https://prism-api.onrender.com` | Production Render backend URL |
   | `NEXT_PUBLIC_ENABLE_DEMO_MOCK` | `true` | Enables cached mock responses for demo |
6. Click **Deploy**.

### Option B: Via Vercel CLI
```bash
npm install -g vercel
cd web
vercel login
vercel --prod
```

---

## 2. Backend Deployment on Render (`/api`)

### Option A: Web Service via Native Python
1. Log in to [render.com](https://dashboard.render.com).
2. Click **"New +"** -> **"Web Service"**.
3. Connect repository `FuzailAhmad-Sphericaljudge/Prism`.
4. Fill in the deployment details:
   - **Name**: `prism-api`
   - **Region**: Choose closest (e.g., *Oregon (US West)* or *Frankfurt*)
   - **Branch**: `main`
   - **Root Directory**: `api` (or keep empty and run from root)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
5. **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `APP_NAME` | `PRISM API` | Service title |
   | `APP_ENV` | `production` | Environment mode |
   | `DEBUG` | `false` | Disable debug in production |
   | `LLM_PROVIDER` | `mock` | `mock` (demo fallback) or `gemini` |
   | `GEMINI_API_KEY` | `...` | Google AI Studio key (optional in mock mode) |
   | `CORS_ORIGINS` | `["https://prism-*.vercel.app","http://localhost:3000"]` | Permitted origins |
   | `DATABASE_URL` | `postgresql://...` | Supabase connection string |
6. Click **Create Web Service**.

### Option B: Docker Container Deployment on Render / Railway
Render and Railway automatically detect the `api/Dockerfile`:
- **Docker Context**: Root (`.`)
- **Dockerfile Path**: `api/Dockerfile`
- Container exposes port `8000`.

---

## 3. Database Setup on Supabase (`pgvector`)

1. Go to [supabase.com](https://supabase.com) and create a free project: `prism-db`.
2. Open the **SQL Editor** in the Supabase Dashboard and run:
```sql
-- Enable vector extension for Temporal Evidence embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify vector extension is loaded
SELECT * FROM pg_extension WHERE extname = 'vector';
```
3. Copy the **Connection String (URI / Pooler)** from *Project Settings -> Database*:
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - Store as `DATABASE_URL` in backend hosting environment variables.

---

## 4. Verification & Health Probes

### Step 1: Verify API Health Probe
```bash
curl -s https://prism-api.onrender.com/health | jq
```
Expected output:
```json
{
  "status": "ok",
  "app": "PRISM API",
  "version": "0.1.0",
  "environment": "production",
  "llm_provider": "mock",
  "uptime_seconds": 45.12,
  "timestamp": "2026-10-19T17:30:00Z"
}
```

### Step 2: Verify Frontend Connection
1. Visit your Vercel deployment URL (e.g. `https://prism-web.vercel.app`).
2. Observe the top-right status indicator in the `Navbar`:
   - Green pulsating dot: `API Online`
   - Monospace badge: `MOCK DEMO`
3. Visit `https://prism-web.vercel.app/design` to inspect all design components.
