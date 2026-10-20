# PRISM Landing Architecture Specification

> **Team The Falcons | Hackathon 2026**  
> Route: `/`  
> Invariant: Sells PRISM in 10 seconds through interactive proof-of-work.

---

## 1. Visual & Pedagogical Invariants

The PRISM landing page is designed according to the core PRISM dark obsidian aesthetic:
- **Background:** `#07080D` (Deep void)
- **Surfaces:** `#0E1018` with subtle glassmorphism and `white/[0.08]` borders
- **Prism Radiant Gradient:** 
  $$\text{Cyan } (\#22D3EE) \longrightarrow \text{Violet } (\#8B5CF6) \longrightarrow \text{Pink } (\#F472B6) \longrightarrow \text{Amber } (\#FBBF24)$$
- **Typography:** Inter (Primary UI) and JetBrains Mono (Timestamps, Code, Citations)
- **Strict Prohibition:** Zero lorem ipsum, zero stock photos, zero mock screenshots — all UI preview components are live React implementations.

---

## 2. Nine Modular Sections

### 1. Sticky Glass Navbar (`LandingNavbar.tsx` & `Navbar.tsx`)
- Obsidian glass header with `backdrop-blur-2xl`
- Live backend `/health` status poll pill connecting to Render API (`https://prism-api-z7c9.onrender.com`)
- One-click "Try the demo" gradient button

### 2. Hero Section (`HeroSection.tsx`)
- Headline: *"Learn in context. Prove understanding."*
- Subtext articulating the Temporal Evidence Firewall
- Custom Canvas Prism Refraction visual:
  - Mathematical simulation of an incident white laser beam entering a triangular glass prism.
  - Optical dispersion into 4 distinct spectral bands with interactive mouse parallax ($\theta_{tilt} = \pm 8^\circ$).
  - Traveling photon particle streams along refracted trajectories.
- Floating product UI mock (`FloatingProductMock.tsx`):
  - In-code reproduction of the classroom studio (video scrubber at `14:28 / 48:10`, slide canvas, chat interface).
  - Clickable citation chips (`[14:12]`, `[Slide 18]`, `[Page 42]`) with interactive hover evidence inspector tooltips.

### 3. Problem Strip (`ProblemStrip.tsx`)
Four high-impact animated glass cards outlining the breakdown of raw LLMs in education:
1. **The Spoiler Trap:** Premature knowledge leaks ruining inductive derivations.
2. **Hallucinated References:** Fictitious timestamps and phantom slides.
3. **Passive Illusion of Competence:** Superficial chatting without durable comprehension.
4. **Zero Verification for Educators:** Unverifiable homework submissions.

### 4. Interactive Temporal Evidence Firewall Demo (`FirewallDemo.tsx`)
- Continuous range scrubber from `00:00` to `30:00` (1800 seconds).
- Six lecture transcript blocks dynamically transitioning between `UNLOCKED`, `ACTIVE`, `BOUNDARY TRUNCATED`, and `LOCKED (Firewalled)`.
- **The 18:42 Boundary Case:**
  - Segment `[18:42 - 19:00]` is dynamically truncated at `18:42`.
  - The forward sub-segment `[18:42 - 19:00]` is censored to prevent premature concurrency formula leakage.
  - Socratic answers adapt reactively across 5 temporal phases.
- Telemetry telemetry panel displaying permitted window and a guaranteed `0.00%` forward leak rate.

### 5. Bento Grid of Core Pillars (`FeaturesBento.tsx`)
Six architectural systems:
1. **Evidence Inspector:** Multi-modal token-to-spectrogram grounding.
2. **Misconception-to-Mastery:** 3-tier diagnostic checks and micro-drills.
3. **Adaptive Mock Interview:** Voice/text oral defense simulator with rubric grading.
4. **Hybrid Dual-Pass Retrieval:** Dense Gemini embeddings (3072 dim) + BM25 RRF fusion.
5. **Mathematical Output Validation:** Deterministic post-generation proof $\max(t_{cite}) \le t_{playback}$.
6. **Educator Cohort Telemetry:** Lecture confusion heatmaps and pause hotspot analytics.

### 6. "How It Works" Pipeline (`HowItWorksPipeline.tsx`)
Interactive seven-stage horizontal sequence:
$$\text{Learner Query} \to \text{Policy Gate} \to \text{Temporal Filter} \to \text{Hybrid Retrieval} \to \text{Cross-Encoder Rerank} \to \text{Grounded Synthesis} \to \text{Output Proof}$$
Includes an interactive JSON state inspector drawer with a one-click "Copy Payload" utility.

### 7. Comparison Table (`ComparisonTable.tsx`)
Side-by-side benchmark contrasting Generic LLM chatbots with PRISM across key pedagogical invariants, with an interactive capability filter toggle.

### 8. Tech Stack & Impact Stats (`TechStackMarquee.tsx`, `ImpactStats.tsx`)
- Infinite smooth logo ticker with pause/resume controls.
- 4 key metrics: 100% Temporal Isolation, 3,072 Embedding Dimensions, <450ms Latency, 0 Phantom Citations.

### 9. Final CTA & Footer (`FinalCta.tsx`, `LandingFooter.tsx`)
- Radiant prism core glow with institutional email access request input.
- Detailed Team The Falcons credits: **Fuzail Ahmad** & **Lakshya Garg**.
- Open-source links, API health status direct link, and MIT License.

---

## 3. SEO & Edge Media Generation
- **Dynamic OG Image:** `web/app/opengraph-image.tsx` using `next/og` (`ImageResponse`, 1200x630, edge runtime).
- **Dynamic Favicon:** `web/app/icon.tsx` using `next/og` (`ImageResponse`, 32x32).
- **Metadata:** Comprehensive canonical URLs, Twitter cards, and OpenGraph tags in `layout.tsx`.
- **Accessibility:** `prefers-reduced-motion` media queries and smooth scrolling in `globals.css`.
