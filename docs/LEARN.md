# PRISM Phase 3: The Learning Environment & Temporal Evidence Firewall

**Author:** Team The Falcons (Fuzail Ahmad & Lakshya Garg)  
**Workspace:** `/learn/[courseId]` and `/app`  
**Backend API:** `https://prism-api-z7c9.onrender.com` / `http://localhost:8000`  
**Web Application:** `https://web-one-blue-mbb8ovavhb.vercel.app`  

---

## 1. Executive Summary

Phase 3 delivers PRISM's flagship learning workspace: an interactive, synchronized, multi-modal classroom screen engineered around the **Temporal Evidence Firewall**. Unlike conventional educational interfaces that leak downstream spoilers or treat transcripts as static text, PRISM treats time as a strict monotonic causal boundary.

The system guarantees that AI explanations, student chats, transcript cues, and multi-modal citations are bounded by the exact second the student is currently watching, or optionally expanded into exploratory mode with transparent disclosure.

```
                      +---------------------------------------+
                      |       Zustand Video Playback Store    |
                      |   (currentTime, isPlaying, firewall)  |
                      +-------------------+-------------------+
                                          |
        +---------------------------------+---------------------------------+
        |                                 |                                 |
        v                                 v                                 v
+------------------+             +------------------+             +--------------------+
|  Video Player    |             | Synced Transcript|             | Right Tabbed Panel |
|  - HTML5 Video   |             | - Live Highlight |             | - Socratic Chat    |
|  - Canvas Tree   |             | - Auto Scroll    |             | - Multi-Modal Docs |
|  - Prism Scrub   |             | - Click to Seek  |             | - Evidence Vectors |
+------------------+             +------------------+             +--------------------+
        |                                 |                                 |
        +---------------------------------+---------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |       Temporal Evidence Firewall      |
                      | (Permitted: [0, t]; Redacted: (t, T]) |
                      +---------------------------------------+
```

---

## 2. Page Hierarchy & Routing

| Route | Component | Purpose |
| :--- | :--- | :--- |
| `/app` | `AppLibraryPage` | Course library catalog with SVG gradient progress rings, search filtering, and "Resume Active Session" banner. |
| `/learn` | `LearnIndexPage` | Server redirect to default seeded course (`00000000-0000-0000-0000-000000000002`). |
| `/learn/[courseId]` | `LearnCoursePage` | Flagship 3-column learning environment with synchronized video player, transcript, and tabbed intelligence suite. |

---

## 3. Core Architectural Modules

### 3.1 App Shell (`web/components/app/app-shell.tsx`)
- **Collapsible Sidebar (`AppSidebar`):** Minimalist glassmorphic drawer providing one-click navigation across **Learn**, **Practice**, **Mastery**, **Interview**, and **Educator** workspaces.
- **Top Bar (`AppTopBar`):** Contextual header displaying the active course code (`CS 201`), lecture title, live firewall mode badge, and user identity profile.

### 3.2 Custom Video Player Core (`web/components/player/`)
- **HTML5 Video Engine with Dynamic Canvas Fallback:** Renders lecture MP4 streams when available, or executes a dynamic hierarchical Binary Search Tree visualizer on an HTML5 `<canvas>` that animates node insertions, pulses, and traversal paths synchronized with playback time.
- **Prism Gradient Progress Bar (`PrismProgressBar`):** Custom SVG/CSS slider featuring chapter markers, hover preview tooltip, buffered range indicator, and animated scrub thumb.
- **Keyboard Shortcut Suite (`usePlayerShortcuts`):**
  - `Space` / `K`: Toggle Play / Pause
  - `ArrowLeft` / `J`: Seek backward 5 seconds (10s for J)
  - `ArrowRight` / `L`: Seek forward 5 seconds (10s for L)
  - `ArrowUp` / `ArrowDown`: Volume step up / down (10%)
  - `M`: Toggle Audio Mute
  - `[` / `]`: Playback speed step (0.75x, 1.0x, 1.25x, 1.5x, 2.0x)

### 3.3 Synced Transcript Panel (`web/components/transcript/`)
- **Micro-Cue Synchronization:** Calculates active cue index in $O(1)$ from the Zustand clock.
- **Bi-directional Navigation:** Clicking any transcript line immediately seeks the video player to that cue's start timestamp.
- **Smooth Auto-Scroll:** Keeps the active speaking sentence centered in view while preserving manual scroll override when user inspects other sections.
- **Search Filtering:** Instant keyword highlighting across all lecture timestamps.

### 3.4 Temporal Evidence Firewall (`web/components/firewall/`)
- **Two Operating Modes:**
  1. `learn_so_far` (**Strict Anti-Spoiler Mode**): Knowledge retrieval, AI completions, and evidence citations are strictly clamped to $t \le t_{\text{current}}$. Any question regarding downstream concepts triggers a constructive Socratic redaction.
  2. `explore_ahead` (**Unconstrained Mode**): Permits forward retrieval across the entire lecture duration, clearly watermarked with future citation pills.
- **The 18:42 Boundary Case:**
  - Up to **18:42**, the lecture covers: BST invariant, tree search, insertion, and order statistics (minimum, maximum, successor).
  - At **18:42**, order statistics concludes and deletion begins.
  - In `learn_so_far` mode prior to 18:42, questions about "node deletion with two children" are intercepted by the firewall with a Socratic redirection.

### 3.5 Tabbed Intelligence Suite (`web/components/right-panel/`)
- **Tab 1: Ask PRISM (`ChatTabPanel`):**
  - "Ask about this moment" shortcut pauses playback and captures current temporal context.
  - Contextual prompt pills derived from active chapter topic.
  - Socratic AI reasoning with temporal context injection and multi-modal evidence badges.
- **Tab 2: Multi-Modal Resources (`ResourcesTabPanel`):**
  - **Slide Deck Viewer (`SlideViewer`):** 10-slide synchronized deck with thumbnail selector, slide jump, and instructor speaker notes.
  - **Handout PDF Viewer (`PdfViewer`):** 3-page academic handout with zoom controls, page jumps, LaTeX formulas, and download link.
  - **Lecture Notes Viewer (`NotesViewer`):** Structured Markdown documentation with table of contents anchor jumping, comparison matrix, and one-click code copying.
- **Tab 3: Evidence Inspector (`EvidenceInspectorTabPanel`):**
  - Direct visualization of retrieved multi-modal evidence vectors.
  - Displays cosine similarity scores (e.g. `96% match`), source types (`Video`, `Slide`, `PDF`, `Notes`), and one-click jump buttons that navigate the active video, slide, or PDF page to the exact citation location.

---

## 4. State Management Contract (`web/lib/stores/use-player-store.ts`)

```typescript
export interface PlayerState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackSpeed: number;
  volume: number;
  isMuted: boolean;
  seekTarget: number | null;

  firewallMode: "learn_so_far" | "explore_ahead";
  maxLearnedTime: number;

  activeRightTab: "ask" | "resources" | "evidence";
  resourcesSubTab: "slides" | "pdf" | "notes";
  activeSlide: number;
  activePdfPage: number;

  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  togglePlay: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  seekTo: (time: number) => void;
  setFirewallMode: (mode: FirewallMode) => void;
  pauseAndSnapshot: () => number;
}
```

---

## 5. Verification & Testing

To run the automated Phase 3 verification suite:

```bash
# Verify all components, routes, and temporal invariants
python scripts/verify_phase3.py

# Verify landing page invariants
python scripts/verify_landing.py

# Compile Next.js production build
npm run build --workspace=web
```

---

*Team The Falcons &bull; PRISM Platform &bull; Hackathon 2026*
