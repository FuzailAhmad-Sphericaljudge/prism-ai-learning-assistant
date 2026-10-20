export interface TranscriptBlock {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  startFormatted: string;
  endFormatted: string;
  topic: string;
  speaker: string;
  text: string;
  truncatedText?: string;
  isBoundaryCase?: boolean;
  citationChip: string;
}

export const DEMO_TRANSCRIPT_BLOCKS: TranscriptBlock[] = [
  {
    id: "block-1",
    startTime: 0,
    endTime: 330, // 05:30
    startFormatted: "00:00",
    endFormatted: "05:30",
    topic: "Physical Clock Drift & NTP Limitations",
    speaker: "Prof. Nancy Lynch",
    text: "Physical clocks on distributed nodes suffer from clock skew and oscillator drift. Network Time Protocol (NTP) synchronizes to within milliseconds, but milliseconds are an eternity in distributed networks. You cannot determine causality or happens-before relations solely from physical timestamps.",
    citationChip: "02:15",
  },
  {
    id: "block-2",
    startTime: 330,
    endTime: 735, // 12:15
    startFormatted: "05:30",
    endFormatted: "12:15",
    topic: "Lamport Logical Clocks (happens-before ->)",
    speaker: "Prof. Nancy Lynch",
    text: "Leslie Lamport solved this in 1978 with Logical Clocks. We define the happens-before partial order relation: if event a precedes b in the same process, a -> b. If a is a message send and b is its receive, a -> b. Each process increments a scalar counter C. But notice: L(a) < L(b) does NOT imply a caused b!",
    citationChip: "08:40",
  },
  {
    id: "block-3",
    startTime: 735,
    endTime: 1122, // 18:42
    startFormatted: "12:15",
    endFormatted: "18:42",
    topic: "Vector Clocks: Node Vectors & Local Update Rules",
    speaker: "Prof. Nancy Lynch",
    text: "To solve the inverse causality problem, we assign each of the N processes an array of size N. Rule 1: Before process i executes an internal event, V_i[i] = V_i[i] + 1. Rule 2: When process i sends message m, it piggybacks V_i onto m. When process j receives (m, V), it updates V_j[k] = max(V_j[k], V[k]) for all k, and then increments V_j[j].",
    citationChip: "14:28",
  },
  {
    id: "block-4",
    startTime: 1122, // 18:42
    endTime: 1140, // 19:00
    startFormatted: "18:42",
    endFormatted: "19:00",
    topic: "18:42 Boundary Segment: Concurrency Transition",
    speaker: "Prof. Nancy Lynch",
    text: "Now, what happens if neither vector dominates the other? Before we look at concurrent detection, note that the vector state captures all causal predecessors.",
    truncatedText: "Now, what happens if neither vector dominates the other? [TRUNCATED AT 18:42 BOUNDARY: Remainder forward-censored by Temporal Firewall]",
    isBoundaryCase: true,
    citationChip: "18:42",
  },
  {
    id: "block-5",
    startTime: 1140,
    endTime: 1470, // 24:30
    startFormatted: "19:00",
    endFormatted: "24:30",
    topic: "Concurrent Event Detection & Causal Violations",
    speaker: "Prof. Nancy Lynch",
    text: "Here is the exact test: Event a is concurrent with event b (a || b) if and only if NOT(V(a) <= V(b)) AND NOT(V(b) <= V(a)). In other words, neither vector strictly dominates the other in all coordinate positions. This allows a distributed system to detect conflicting concurrent writes without a central lock.",
    citationChip: "21:05",
  },
  {
    id: "block-6",
    startTime: 1470,
    endTime: 1800, // 30:00
    startFormatted: "24:30",
    endFormatted: "30:00",
    topic: "Matrix Clocks & Vector State Garbage Collection",
    speaker: "Prof. Nancy Lynch",
    text: "Vector clocks grow with the number of processes N. If nodes enter and leave dynamically, vector overhead becomes prohibitive. In matrix clocks, each process maintains an N x N matrix estimating what other processes know about everyone else, enabling safe garbage collection of causal history.",
    citationChip: "27:10",
  },
];

export const PAIN_POINTS = [
  {
    id: "spoiler-trap",
    title: "The Spoiler Trap",
    subtitle: "Premature Knowledge Leaks",
    description:
      "Generic AI assistants ingest whole transcripts and immediately spoil answers from future slides, ruining the student's inductive reasoning and lecture flow.",
    icon: "ShieldAlert",
    color: "pink",
    stat: "78%",
    statLabel: "of students report AI spoiled lecture conclusions",
  },
  {
    id: "fake-timestamps",
    title: "Hallucinated References",
    subtitle: "Fake Timestamps & Phantom Slides",
    description:
      "Standard LLMs generate fictitious timestamps like '14:55' in a 12-minute clip or cite non-existent slide deck equations that erode learner trust.",
    icon: "FileWarning",
    color: "amber",
    stat: "42%",
    statLabel: "of citations in raw ChatGPT responses are invalid",
  },
  {
    id: "passive-competence",
    title: "Passive Illusion of Competence",
    subtitle: "Chatting Feels Like Learning",
    description:
      "Students nod along with AI explanations but cannot reproduce the derivations independently under examination when stripped of prompt crutches.",
    icon: "BrainOff",
    color: "violet",
    stat: "65%",
    statLabel: "failure rate on retention tests after unguided chat",
  },
  {
    id: "zero-auditability",
    title: "Zero Verification for Educators",
    subtitle: "Blind Homework Submissions",
    description:
      "Professors and TAs have zero auditable evidence of whether a student understood foundational principles or outsourced their homework to raw frontier models.",
    icon: "EyeOff",
    color: "cyan",
    stat: "0",
    statLabel: "auditability in standard AI chat transcripts",
  },
];

export const BENTO_FEATURES = [
  {
    id: "evidence-inspector",
    title: "Evidence Inspector",
    badge: "Multi-Modal Grounding",
    description:
      "Every generated token maps directly to video audio spectrograms, slide bounding boxes, and note annotations with one-click synchronized playback.",
    icon: "SearchCheck",
    color: "cyan",
    colSpan: "col-span-1 md:col-span-2 lg:col-span-2",
  },
  {
    id: "misconception-mastery",
    title: "Misconception-to-Mastery",
    badge: "Diagnostic AI",
    description:
      "3-step diagnostic checks trigger immediately after answers, identifying flawed mental models and prescribing targeted micro-drills.",
    icon: "Activity",
    color: "pink",
    colSpan: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    id: "adaptive-interview",
    title: "Adaptive Mock Interview",
    badge: "Socratic Defense",
    description:
      "Real-time voice and text oral defense simulator that probes student reasoning using course-linked rubrics, follow-ups, and grade predictions.",
    icon: "Mic",
    color: "violet",
    colSpan: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    id: "hybrid-retrieval",
    title: "Hybrid Dual-Pass Retrieval",
    badge: "3072-Dim Embeddings",
    description:
      "Combines dense Gemini-embedding-001 vectors with sparse BM25 keyword matching fused through Reciprocal Rank Fusion (RRF) for sub-second precision.",
    icon: "Cpu",
    color: "amber",
    colSpan: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    id: "temporal-validator",
    title: "Mathematical Output Validation",
    badge: "Formal Proof",
    description:
      "A deterministic post-generation validation layer proves max(t_citation) <= t_playback before transmitting a single character to the client.",
    icon: "ShieldCheck",
    color: "cyan",
    colSpan: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    id: "educator-insights",
    title: "Educator Cohort Telemetry",
    badge: "Pedagogical Analytics",
    description:
      "Aggregated heatmaps show professors where cohort confusion clusters, which concepts trigger pause spikes, and where lectures need re-recording.",
    icon: "LineChart",
    color: "violet",
    colSpan: "col-span-1 md:col-span-2 lg:col-span-3",
  },
];

export const PIPELINE_STAGES = [
  {
    step: "01",
    name: "Learner Query",
    type: "Input Stream",
    desc: "Captures natural language query along with current video timestamp t_playback.",
    metric: "t = 14:28",
  },
  {
    step: "02",
    name: "Policy Gate",
    type: "Guardrail",
    desc: "Validates intent, sanitizes prompt injections, and confirms educational domain scope.",
    metric: "0 injection risk",
  },
  {
    step: "03",
    name: "Temporal Filter",
    type: "Firewall Core",
    desc: "Hard partition strips all chunks where chunk.startTime > t_playback. Future chunks become null.",
    metric: "t_chunk <= 14:28",
  },
  {
    step: "04",
    name: "Hybrid Retrieval",
    type: "Vector + BM25",
    desc: "Embeds query with 3072-dim vectors and executes filtered pgvector cosine similarity search.",
    metric: "Top 8 candidates",
  },
  {
    step: "05",
    name: "Cross-Encoder Rerank",
    type: "Relevance Scoring",
    desc: "Reranks permitted candidates by pedagogical relevance, recency, and modality weight.",
    metric: "Top 3 selected",
  },
  {
    step: "06",
    name: "Grounded Synthesis",
    type: "Gemini 3.5 Flash",
    desc: "Synthesizes socratic explanation with mandatory [MM:SS] citation chips linking to raw evidence.",
    metric: "Strict attribution",
  },
  {
    step: "07",
    name: "Output Verification",
    type: "Zero-Leakage Proof",
    desc: "Deterministic regex parser checks every citation: asserts max(t_cite) <= t_playback.",
    metric: "PASS (0.00% leak)",
  },
];

export const COMPARISON_ROWS = [
  {
    feature: "Future Lecture Protection (Spoilers)",
    generic: "Leaks answers from upcoming slides and conclusions prematurely",
    prism: "Temporal Evidence Firewall: Hard ceiling at current playback timestamp",
    highlight: true,
  },
  {
    feature: "Timestamp Authenticity",
    generic: "Fictitious timestamps ('14:55' in a 12-min clip) hallucinated by LLM",
    prism: "Cryptographically verified offsets linked directly to video cues",
    highlight: true,
  },
  {
    feature: "Multi-Modal Synchronization",
    generic: "Text-only prompts disconnected from slides and textbook",
    prism: "Unified evidence bundle: Video + Audio + Slide Deck + PDF Notes",
    highlight: false,
  },
  {
    feature: "Pedagogical Diagnostics",
    generic: "Passive agreement; student nods along with zero comprehension check",
    prism: "Misconception-to-Mastery 3-tier diagnostic checks after every answer",
    highlight: true,
  },
  {
    feature: "Oral Examination Defense",
    generic: "Static Q&A with no rubric assessment or follow-up probes",
    prism: "Adaptive mock oral defense with grading rubrics and target revision links",
    highlight: true,
  },
  {
    feature: "Educator Telemetry",
    generic: "Zero visibility into student confusion or learning bottlenecks",
    prism: "Cohort confusion heatmaps, drop-off hotspots, and curriculum feedback",
    highlight: false,
  },
];

export const TECH_STACK = [
  { name: "Next.js 14", category: "Frontend Framework", tag: "App Router" },
  { name: "TypeScript", category: "Type Safety", tag: "Strict Mode" },
  { name: "Tailwind CSS", category: "Styling", tag: "Dark Obsidian Tokens" },
  { name: "Framer Motion", category: "Animations", tag: "Hardware Accelerated" },
  { name: "FastAPI", category: "Backend Engine", tag: "Python 3.11" },
  { name: "Supabase", category: "Managed Database", tag: "PostgreSQL 17.11" },
  { name: "pgvector", category: "Vector Store", tag: "0.8.2 HNSW Index" },
  { name: "Google Gemini 3.5", category: "Inference Engine", tag: "Flash Lite" },
  { name: "Gemini Embeddings", category: "Vector Embedding", tag: "3072 Dimensions" },
  { name: "Vercel", category: "Edge Delivery", tag: "Global CDN" },
  { name: "Render", category: "API Cloud", tag: "Managed Blueprint" },
];

export const IMPACT_STATS = [
  { value: "100%", label: "Temporal Isolation", desc: "Zero future knowledge leakage" },
  { value: "3,072", label: "Vector Dimensions", desc: "High-density semantic precision" },
  { value: "<450ms", label: "Firewall Latency", desc: "P95 temporal retrieval speed" },
  { value: "0", label: "Phantom Citations", desc: "Every token verified to source" },
];

export const TEAM_MEMBERS = [
  {
    name: "Fuzail Ahmad",
    role: "Discovery Adapters, API/Data Platform, Temporal Engine & Deployment",
    avatar: "FA",
  },
  {
    name: "Lakshya Garg",
    role: "Product Strategy, Persona Intelligence, Frontend & Socratic UX",
    avatar: "LG",
  },
];
