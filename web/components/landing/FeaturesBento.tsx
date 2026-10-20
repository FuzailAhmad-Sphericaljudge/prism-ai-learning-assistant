"use client";

import * as React from "react";
import {
  SearchCheck,
  Activity,
  Mic,
  Cpu,
  ShieldCheck,
  LineChart,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Video,
  FileText,
} from "lucide-react";
import { SectionHeading } from "@/components/prism/SectionHeading";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent } from "@/components/prism/GlassCard";
import { GlowBorder } from "@/components/prism/GlowBorder";
import { CitationChip } from "@/components/prism/CitationChip";
import { Badge } from "@/components/ui/badge";

export const FeaturesBento: React.FC = () => {
  return (
    <section id="features" className="py-24 border-t border-white/[0.08] relative overflow-hidden bg-[#07080D]">
      {/* Background ambient orbs */}
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-prism-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-prism-violet/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-8">
        <SectionHeading
          badge="Product Architecture"
          title="Engineered for pedagogical"
          gradientTitle="truth & retention"
          subtitle="Six interconnected systems ensure that AI assistance amplifies comprehension rather than replacing critical thinking."
          align="center"
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Evidence Inspector (Large 2-col span) */}
          <div className="md:col-span-2 lg:col-span-2">
            <GlowBorder intensity="low" borderRadius="20px" className="h-full">
              <div className="p-6 sm:p-8 bg-[#0E1018] rounded-[19px] border border-white/[0.08] h-full flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-11 w-11 rounded-xl bg-prism-cyan/10 border border-prism-cyan/25 flex items-center justify-center text-prism-cyan">
                      <SearchCheck className="h-5 w-5" />
                    </div>
                    <Badge variant="cyan" dot className="text-[10px] font-mono">
                      Multi-Modal Grounding
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-prism-cyan transition-colors">
                    Evidence Inspector
                  </h3>
                  <p className="text-sm text-foreground-muted mt-2 leading-relaxed max-w-xl">
                    Every generated token maps directly to video audio spectrograms, slide deck bounding boxes, and textbook pages. Learners click citations to jump the video or inspect the exact primary source excerpt.
                  </p>

                  {/* Multi-modal Evidence Strip Demo */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="h-3.5 w-3.5 text-prism-cyan" />
                        <span className="text-xs font-mono font-semibold text-white">Video Frame</span>
                      </div>
                      <p className="text-[11px] text-foreground-subtle leading-tight font-serif italic mb-2">
                        &quot;Prof. Lynch derives vector clock rule 2 on chalkboard.&quot;
                      </p>
                      <CitationChip type="timestamp" value="14:28" />
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-3.5 w-3.5 text-prism-violet" />
                        <span className="text-xs font-mono font-semibold text-white">Slide Deck</span>
                      </div>
                      <p className="text-[11px] text-foreground-subtle leading-tight font-serif italic mb-2">
                        &quot;Slide 18: Algebraic inequality condition for concurrent events.&quot;
                      </p>
                      <CitationChip type="slide" value={18} />
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-3.5 w-3.5 text-prism-pink" />
                        <span className="text-xs font-mono font-semibold text-white">Course Notes</span>
                      </div>
                      <p className="text-[11px] text-foreground-subtle leading-tight font-serif italic mb-2">
                        &quot;Theorem 3.4: Formal proof of causal consistency.&quot;
                      </p>
                      <CitationChip type="page" value={42} />
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-foreground-subtle">
                  <span>Zero phantom links</span>
                  <span className="text-prism-cyan flex items-center gap-1">
                    Synchronized scrubbing &rarr;
                  </span>
                </div>
              </div>
            </GlowBorder>
          </div>

          {/* Card 2: Misconception-to-Mastery (1-col) */}
          <GlassCard variant="accent" glowColor="pink" hoverEffect className="flex flex-col justify-between">
            <GlassCardHeader>
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-prism-pink/10 border border-prism-pink/25 flex items-center justify-center text-prism-pink">
                  <Activity className="h-5 w-5" />
                </div>
                <Badge variant="pink" className="text-[10px] font-mono">
                  Diagnostic AI
                </Badge>
              </div>
              <GlassCardTitle>Misconception-to-Mastery</GlassCardTitle>
              <GlassCardDescription className="text-xs mt-2">
                Automated 3-step diagnostic checks identify flawed mental models immediately after student questions, diagnosing misconceptions before they solidify.
              </GlassCardDescription>

              {/* Diagnostic Sample Preview */}
              <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-foreground-subtle">
                  <span>Diagnostic Check #1</span>
                  <span className="text-prism-pink font-semibold">Active</span>
                </div>
                <p className="text-white font-medium text-[11px]">
                  &quot;If L(a) &lt; L(b) in Lamport clocks, did event a cause event b?&quot;
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                    Correct: No (Partial Order)
                  </span>
                </div>
              </div>
            </GlassCardHeader>

            <GlassCardContent className="pt-3 border-t border-white/[0.06]">
              <span className="text-[11px] font-mono text-foreground-subtle">
                Prescriptive micro-drills included
              </span>
            </GlassCardContent>
          </GlassCard>

          {/* Card 3: Adaptive Mock Interview (1-col) */}
          <GlassCard variant="accent" glowColor="violet" hoverEffect className="flex flex-col justify-between">
            <GlassCardHeader>
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-prism-violet/10 border border-prism-violet/25 flex items-center justify-center text-prism-violet">
                  <Mic className="h-5 w-5" />
                </div>
                <Badge variant="violet" className="text-[10px] font-mono">
                  Oral Defense
                </Badge>
              </div>
              <GlassCardTitle>Adaptive Mock Interview</GlassCardTitle>
              <GlassCardDescription className="text-xs mt-2">
                Socratic oral defense simulation. PRISM interrogates the learner on core concepts using course rubrics, evaluates confidence, and produces target revision links.
              </GlassCardDescription>

              <div className="mt-4 p-3 rounded-xl bg-[#141726] border border-prism-violet/30 text-xs space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-[10px] text-foreground-subtle">
                  <span>Rubric Scoring</span>
                  <span className="text-emerald-400 font-bold">92% Grade</span>
                </div>
                <p className="text-[11px] text-white font-sans">
                  Examiner: &quot;Explain why scalar clocks fail to detect concurrent events.&quot;
                </p>
              </div>
            </GlassCardHeader>

            <GlassCardContent className="pt-3 border-t border-white/[0.06]">
              <span className="text-[11px] font-mono text-foreground-subtle">
                Voice & text defense with grading rubrics
              </span>
            </GlassCardContent>
          </GlassCard>

          {/* Card 4: Hybrid Dual-Pass Retrieval (1-col) */}
          <GlassCard variant="accent" glowColor="amber" hoverEffect className="flex flex-col justify-between">
            <GlassCardHeader>
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-prism-amber/10 border border-prism-amber/25 flex items-center justify-center text-prism-amber">
                  <Cpu className="h-5 w-5" />
                </div>
                <Badge variant="amber" className="text-[10px] font-mono">
                  pgvector + BM25
                </Badge>
              </div>
              <GlassCardTitle>Hybrid Dual-Pass Retrieval</GlassCardTitle>
              <GlassCardDescription className="text-xs mt-2">
                Fuses 3072-dimensional Gemini embeddings with sparse lexical BM25 indexing via Reciprocal Rank Fusion (RRF) for millisecond temporal matching.
              </GlassCardDescription>

              <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono space-y-1">
                <div className="flex justify-between text-[10px] text-foreground-subtle">
                  <span>Dense Vector Dim</span>
                  <span className="text-prism-amber font-bold">3,072</span>
                </div>
                <div className="flex justify-between text-[10px] text-foreground-subtle">
                  <span>RRF Fusion Latency</span>
                  <span className="text-white font-bold">&lt;45ms</span>
                </div>
              </div>
            </GlassCardHeader>

            <GlassCardContent className="pt-3 border-t border-white/[0.06]">
              <span className="text-[11px] font-mono text-foreground-subtle">
                HNSW cosine similarity indexing
              </span>
            </GlassCardContent>
          </GlassCard>

          {/* Card 5: Mathematical Output Validation (1-col) */}
          <GlassCard variant="accent" glowColor="cyan" hoverEffect className="flex flex-col justify-between">
            <GlassCardHeader>
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-prism-cyan/10 border border-prism-cyan/25 flex items-center justify-center text-prism-cyan">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <Badge variant="cyan" className="text-[10px] font-mono">
                  Formal Proof
                </Badge>
              </div>
              <GlassCardTitle>Mathematical Validation</GlassCardTitle>
              <GlassCardDescription className="text-xs mt-2">
                Pre-rendering validation layer formally asserts max(t_cite) &le; t_playback. If an LLM attempts to reference forward material, the token stream is aborted.
              </GlassCardDescription>

              <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono space-y-1">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="text-[11px]">Theorem 1: Zero Forward Leak</span>
                </div>
                <p className="text-[10px] text-foreground-subtle">
                  Deterministic regex audit on all citation chips.
                </p>
              </div>
            </GlassCardHeader>

            <GlassCardContent className="pt-3 border-t border-white/[0.06]">
              <span className="text-[11px] font-mono text-foreground-subtle">
                Fail-safe zero-leakage guarantee
              </span>
            </GlassCardContent>
          </GlassCard>

          {/* Card 6: Educator Cohort Telemetry (Full 3-col span) */}
          <div className="md:col-span-2 lg:col-span-3">
            <GlowBorder intensity="low" borderRadius="20px">
              <div className="p-6 sm:p-8 bg-[#0E1018] rounded-[19px] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-prism-violet/10 border border-prism-violet/25 flex items-center justify-center text-prism-violet">
                      <LineChart className="h-4 w-4" />
                    </div>
                    <Badge variant="violet" className="text-[10px] font-mono">
                      Educator Intelligence
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-prism-violet transition-colors">
                    Educator Cohort Telemetry & Confusion Heatmaps
                  </h3>
                  <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
                    Aggregate real-time analytics show instructors exactly which lecture timestamps trigger question spikes, where diagnostic misconceptions cluster, and which slides require curricular revision.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center min-w-[110px]">
                    <span className="block text-lg font-extrabold text-white">18:42</span>
                    <span className="text-[10px] text-foreground-subtle">Confusion Spike</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center min-w-[110px]">
                    <span className="block text-lg font-extrabold text-prism-pink">74%</span>
                    <span className="text-[10px] text-foreground-subtle">Diagnostic Pass</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center min-w-[110px]">
                    <span className="block text-lg font-extrabold text-emerald-400">100%</span>
                    <span className="text-[10px] text-foreground-subtle">Audit Trail</span>
                  </div>
                </div>
              </div>
            </GlowBorder>
          </div>
        </div>
      </div>
    </section>
  );
};
