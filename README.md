# PRISM

> **Temporal Evidence Firewall & Timestamp-Aware Learning Assistant**  
> *Built by Team The Falcons for Hackathon 2026*

---

## 🔮 Overview

**PRISM** solves the fundamental problem of learning with AI: **premature spoiler delivery and hallucinated context**. Learners watching video lectures, reading lecture slide decks, PDFs, and notes need an assistant that respects where they are in their learning journey.

With the **Temporal Evidence Firewall**, PRISM guarantees:
1. **Timestamp-Aware Retrieval**: Answers cite **ONLY** evidence that the student is permitted to see at their current video playback time $T_{current}$.
2. **Evidence Inspector**: Every claim links directly to multimodal evidence — exact video timestamps (`04:12`), lecture slides (`Slide 8`), PDF pages (`p. 23`), or transcript lines.
3. **Misconception-to-Mastery**: Automated diagnostic probes test understanding right after each answer, identifying conceptual drift.
4. **Adaptive Mock Interviews**: Generates course-aligned Socratic interviews with rubric scoring and targeted revision links.

---

## 🏗️ Architecture & Monorepo Structure

```
Prism/
├── /web                 # Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
│   ├── app/             # App Router pages (/design kitchen sink, dashboard, classroom)
│   ├── components/      # UI components (primitives + custom PRISM design system)
│   ├── lib/             # Utilities, theme tokens, API clients, hooks
│   └── public/          # Static assets & brand icons
├── /api                 # FastAPI backend, SQLAlchemy, PostgreSQL, pgvector
│   ├── config.py        # Settings via pydantic-settings
│   ├── main.py          # App factory, CORS, request tracing, router mounting
│   ├── routers/         # REST API endpoints (/health, /query, /interview)
│   └── tests/           # Pytest test suite
├── /docs                # Architecture documentation, API specs, deployment guides
├── /demo-data           # Sample lecture videos, synced transcripts, slides, notes
└── /scripts             # Local development, database migration, and evaluation scripts
```

---

## 🎨 Design System

PRISM uses a dark, premium, futuristic glass aesthetic:
- **Background**: `#07080D` (Obsidian Void)
- **Surface**: `#0E1018` (Dark Slate Glass)
- **Border**: `rgba(255, 255, 255, 0.08)`
- **Prism Gradient**:
  - Cyan: `#22D3EE`
  - Violet: `#8B5CF6`
  - Pink: `#F472B6`
  - Amber: `#FBBF24`
- **Typography**: `Inter` for crisp UI, `JetBrains Mono` for precise citations and timestamps.

Explore the component kitchen sink at `/design`.

---

## 🚀 Quickstart

### Prerequisites
- Node.js 20+ (recommended v24)
- Python 3.11+
- Git

### 1. Web Frontend
```bash
cd web
npm install
npm run dev
# Open http://localhost:3000 (Kitchen Sink at http://localhost:3000/design)
```

### 2. API Backend
```bash
cd api
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
# Health check available at http://localhost:8000/health
```

---

## 🧪 Testing & Verification
```bash
# Frontend lint and build
npm run lint:web
npm run build:web

# Backend tests
pytest api
```

---

## 🛡️ License
MIT © 2026 Team The Falcons
