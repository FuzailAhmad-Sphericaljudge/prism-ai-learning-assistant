"use client";

import * as React from "react";
import {
  Play,
  Volume2,
  Maximize2,
  ShieldCheck,
  Sparkles,
  FileText,
  Presentation,
  CheckCircle2,
  Info,
} from "lucide-react";
import { GlowBorder } from "@/components/prism/GlowBorder";
import { CitationChip } from "@/components/prism/CitationChip";

interface EvidenceSnippet {
  type: "video" | "slide" | "notes";
  citation: string;
  timestamp: string;
  text: string;
  context: string;
}

const EVIDENCE_SNIPPETS: Record<string, EvidenceSnippet> = {
  "14:12": {
    type: "video",
    citation: "Video [14:12]",
    timestamp: "14:12 - 14:28",
    text: "Prof. Lynch: 'Notice that if neither vector strictly dominates, the events are concurrent. No message could have traveled between them.'",
    context: "Audio Track • Lecture 4 (Verified by Temporal Firewall)",
  },
  "18": {
    type: "slide",
    citation: "Slide 18",
    timestamp: "Slide 18 / 45",
    text: "Definition: Event a || b iff not(V(a) <= V(b)) and not(V(b) <= V(a)). Concurrent events are independent.",
    context: "Deck: Distributed_Clocks_v3.pdf • Bounding Box [x:120, y:340]",
  },
  "42": {
    type: "notes",
    citation: "Page 42",
    timestamp: "Page 42 §3.4",
    text: "Theorem 3.4 (Causal Independence): Concurrency implies space-like separation in logical spacetime.",
    context: "Course Notes: Distributed Systems Fall 2026",
  },
};

export const FloatingProductMock: React.FC = () => {
  const [activeEvidence, setActiveEvidence] = React.useState<EvidenceSnippet | null>(null);

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <GlowBorder animated intensity="medium" borderRadius="24px">
        <div className="bg-[#0E1018] rounded-[23px] overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/80 flex flex-col">
          {/* Mac-style Window Title Bar */}
          <div className="h-11 px-4 sm:px-6 bg-[#0B0D14] border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#EF4444]/90 inline-block" />
              <span className="h-3 w-3 rounded-full bg-[#F59E0B]/90 inline-block" />
              <span className="h-3 w-3 rounded-full bg-[#10B981]/90 inline-block" />
              <span className="ml-3 text-xs font-mono text-foreground-muted hidden sm:inline">
                PRISM Studio • Distributed Systems (CS 428)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-prism-cyan animate-pulse" />
              <span className="text-[11px] font-mono text-prism-cyan font-semibold">
                FIREWALL ENFORCED (T = 14:28)
              </span>
            </div>
          </div>

          {/* Main Studio Body: Video Player (Left) + Chat & Inspector (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
            {/* Left: Video & Lecture Canvas (7 cols) */}
            <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.06] bg-[#07080D]/60">
              {/* Simulated Lecture Presentation Frame */}
              <div className="relative aspect-video rounded-xl bg-gradient-to-br from-[#121522] to-[#0A0C14] border border-white/[0.08] p-5 flex flex-col justify-between overflow-hidden shadow-inner">
                {/* Ambient prism glow behind slide */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-prism-cyan/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <Presentation className="h-4 w-4 text-prism-cyan" />
                    <span className="text-xs font-semibold text-white tracking-wide">
                      Slide 18 • Vector Clock Update Rules
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-foreground-muted">
                    Fidge & Mattern (1988)
                  </span>
                </div>

                {/* Mathematical blackboard slide content */}
                <div className="space-y-3 font-mono text-xs sm:text-sm py-2">
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-prism-pink font-semibold">Rule 1 (Internal): </span>
                    <span className="text-white">V_i[i] &larr; V_i[i] + 1</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-prism-cyan font-semibold">Rule 2 (Receive): </span>
                    <span className="text-white">V_j[k] &larr; max(V_j[k], V[k]), &forall; k</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-prism-violet/10 border border-prism-violet/20 text-prism-violet">
                    <span className="font-semibold">&bull; Concurrency Test: </span>
                    <span className="text-foreground">a || b &hArr; &not;(V(a) &le; V(b)) &and; &not;(V(b) &le; V(a))</span>
                  </div>
                </div>

                {/* Live Professor Audio Avatar overlay */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px] font-mono text-foreground-subtle">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Prof. Nancy Lynch • Audio Track Active
                  </span>
                  <span>14:28 / 48:10</span>
                </div>
              </div>

              {/* Scrubber & Player Controls */}
              <div className="mt-4 space-y-2">
                {/* Progress bar with played segment */}
                <div className="relative w-full h-2 rounded-full bg-white/[0.08] cursor-pointer overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-prism-cyan via-prism-violet to-prism-pink rounded-full relative"
                    style={{ width: "30.1%" }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md shadow-prism-cyan" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-foreground-muted">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="p-1.5 rounded-lg bg-white/[0.06] text-white hover:bg-white/10 transition-colors"
                      aria-label="Play video"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-foreground-muted hover:text-white transition-colors"
                      aria-label="Volume"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-white font-medium">14:28</span>
                    <span className="text-foreground-subtle">/ 48:10</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px]">
                      1.25x
                    </span>
                    <button
                      type="button"
                      className="p-1.5 text-foreground-muted hover:text-white"
                      aria-label="Fullscreen"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Temporal Firewall Socratic Chat & Evidence (5 cols) */}
            <div className="lg:col-span-5 p-4 sm:p-6 flex flex-col justify-between bg-[#0A0C14]/80">
              <div className="space-y-4">
                {/* Firewall Status Banner */}
                <div className="p-3 rounded-xl bg-prism-cyan/5 border border-prism-cyan/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-prism-cyan" />
                    <span className="text-xs font-semibold text-prism-cyan">
                      Temporal Evidence Firewall
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-foreground-subtle">
                    0 spoilers &bull; 100% cited
                  </span>
                </div>

                {/* Student Query Bubble */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono text-prism-violet font-semibold">
                      Student Question (T = 14:28)
                    </span>
                    <span className="text-[10px] font-mono text-foreground-subtle">14:28:02</span>
                  </div>
                  <p className="text-xs sm:text-sm text-white font-medium">
                    &quot;Can event A cause event B if their vector timestamps are concurrent?&quot;
                  </p>
                </div>

                {/* PRISM Grounded Answer Bubble */}
                <div className="p-4 rounded-xl bg-[#141724] border border-prism-violet/30 shadow-glass text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-prism-violet flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-prism-cyan" /> PRISM Assistant
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Grounded
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                    No. At timestamp <strong className="text-white">14:28</strong>, the lecture establishes that if two events are concurrent (neither vector dominates), neither can causally affect the other. They are logically independent.
                  </p>

                  {/* Interactive Citation Chips */}
                  <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-foreground-subtle">
                        Permitted Evidence:
                      </span>
                      <span className="text-[10px] font-mono text-prism-cyan flex items-center gap-1">
                        <Info className="h-3 w-3" /> Hover chip to inspect
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div
                        onMouseEnter={() => setActiveEvidence(EVIDENCE_SNIPPETS["14:12"])}
                        onMouseLeave={() => setActiveEvidence(null)}
                      >
                        <CitationChip type="timestamp" value="14:12" className="cursor-pointer hover:border-prism-cyan" />
                      </div>
                      <div
                        onMouseEnter={() => setActiveEvidence(EVIDENCE_SNIPPETS["18"])}
                        onMouseLeave={() => setActiveEvidence(null)}
                      >
                        <CitationChip type="slide" value={18} className="cursor-pointer hover:border-prism-violet" />
                      </div>
                      <div
                        onMouseEnter={() => setActiveEvidence(EVIDENCE_SNIPPETS["42"])}
                        onMouseLeave={() => setActiveEvidence(null)}
                      >
                        <CitationChip type="page" value={42} className="cursor-pointer hover:border-prism-pink" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evidence Inspector Floating Preview Popover */}
                {activeEvidence ? (
                  <div className="p-3.5 rounded-xl bg-[#1A1D2E] border border-prism-cyan/40 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-prism-cyan flex items-center gap-1.5 font-mono">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        {activeEvidence.citation}
                      </span>
                      <span className="text-[10px] font-mono text-foreground-muted">
                        {activeEvidence.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-white/90 italic mb-2 leading-relaxed font-serif">
                      &quot;{activeEvidence.text}&quot;
                    </p>
                    <p className="text-[10px] font-mono text-foreground-subtle border-t border-white/[0.06] pt-1.5">
                      {activeEvidence.context}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.08] text-center text-xs text-foreground-subtle font-mono">
                    Hover over any citation chip to inspect exact multi-modal grounding snippet.
                  </div>
                )}
              </div>

              {/* Diagnostic Check preview */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-foreground-muted">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3 w-3 text-prism-pink" />
                  Diagnostic Check Ready: 1 Question
                </span>
                <span className="text-prism-pink font-semibold cursor-pointer hover:underline">
                  Take Diagnostic &rarr;
                </span>
              </div>
            </div>
          </div>
        </div>
      </GlowBorder>
    </div>
  );
};
