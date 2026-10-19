import Link from "next/link";
import { ArrowRight, ShieldCheck, Clock, FileCheck, BrainCircuit, Sparkles, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent } from "@/components/prism/GlassCard";
import { GradientText } from "@/components/prism/GradientText";
import { SectionHeading } from "@/components/prism/SectionHeading";
import { GlowBorder } from "@/components/prism/GlowBorder";
import { CitationChip } from "@/components/prism/CitationChip";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] hero-prism-radial pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-8 pt-16 pb-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md text-xs font-mono mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <span className="flex h-2 w-2 rounded-full bg-prism-cyan animate-pulse" />
          <span className="text-foreground-muted">Hackathon 2026</span>
          <span className="text-white/20">|</span>
          <span className="text-prism-pink font-semibold">Team The Falcons</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
          Learn without spoilers. Grounded in{" "}
          <GradientText variant="prism" animate>
            Exact Temporal Evidence.
          </GradientText>
        </h1>

        <p className="text-base sm:text-xl text-foreground-muted max-w-2xl leading-relaxed mb-10">
          PRISM enforces the <strong>Temporal Evidence Firewall</strong>. Ask any question during a lecture: get answers citing strictly what you have watched up to the current timestamp.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Button variant="primary" size="lg" asChild>
            <Link href="/classroom" className="gap-2">
              Enter Classroom <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="glass" size="lg" asChild>
            <Link href="/design" className="gap-2">
              <Sparkles className="h-4 w-4 text-prism-violet" /> Component Kitchen Sink
            </Link>
          </Button>
        </div>

        {/* Interactive Temporal Firewall Hero Preview */}
        <div className="w-full max-w-3xl">
          <GlowBorder animated intensity="medium" borderRadius="20px">
            <div className="p-6 sm:p-8 bg-[#0E1018] flex flex-col text-left gap-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-foreground-subtle">
                    temporal-firewall.enforce(T = 03:45)
                  </span>
                </div>
                <Badge variant="cyan" dot>
                  Firewall Active
                </Badge>
              </div>

              <div className="flex flex-col gap-3">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-xs font-mono text-foreground-muted mb-1">
                    Student Query at 03:45
                  </p>
                  <p className="text-sm text-white font-medium">
                    &quot;How does self-attention compute the query-key affinity matrix?&quot;
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#161926]/90 border border-prism-violet/30 shadow-glass">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-prism-violet flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-prism-cyan" /> Grounded Answer (Permitted Evidence Only)
                    </span>
                    <span className="text-[11px] font-mono text-foreground-subtle">
                      0 spoilers detected
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed mb-3">
                    At this point in the lecture, the query matrix Q is multiplied by the transposed key matrix K^T, producing raw dot-product scores before softmax scaling.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
                    <span className="text-[11px] text-foreground-subtle font-mono">
                      Citations:
                    </span>
                    <CitationChip type="timestamp" value="02:30" />
                    <CitationChip type="slide" value={4} />
                    <CitationChip type="page" value={7} />
                  </div>
                </div>
              </div>
            </div>
          </GlowBorder>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-white/[0.08]">
        <SectionHeading
          badge="Core Pillars"
          title="Architected for"
          gradientTitle="Zero Hallucination"
          subtitle="Four core engineering pillars ensure deep pedagogy, verifiable evidence, and adaptive learning."
          align="center"
          className="mb-12"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard variant="accent" glowColor="cyan" hoverEffect>
            <GlassCardHeader>
              <div className="h-10 w-10 rounded-xl bg-prism-cyan/10 border border-prism-cyan/20 flex items-center justify-center text-prism-cyan mb-2">
                <Clock className="h-5 w-5" />
              </div>
              <GlassCardTitle>Temporal Firewall</GlassCardTitle>
              <GlassCardDescription>
                Prevents premature knowledge leaks by bounding vector search to $t \le T_{playback}$.
              </GlassCardDescription>
            </GlassCardHeader>
          </GlassCard>

          <GlassCard variant="accent" glowColor="violet" hoverEffect>
            <GlassCardHeader>
              <div className="h-10 w-10 rounded-xl bg-prism-violet/10 border border-prism-violet/20 flex items-center justify-center text-prism-violet mb-2">
                <FileCheck className="h-5 w-5" />
              </div>
              <GlassCardTitle>Evidence Inspector</GlassCardTitle>
              <GlassCardDescription>
                Direct clickable multi-modal links to video frames, slide deck pages, and notes.
              </GlassCardDescription>
            </GlassCardHeader>
          </GlassCard>

          <GlassCard variant="accent" glowColor="pink" hoverEffect>
            <GlassCardHeader>
              <div className="h-10 w-10 rounded-xl bg-prism-pink/10 border border-prism-pink/20 flex items-center justify-center text-prism-pink mb-2">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <GlassCardTitle>Diagnostic Checks</GlassCardTitle>
              <GlassCardDescription>
                Misconception-to-Mastery diagnostics follow every answer to test comprehension.
              </GlassCardDescription>
            </GlassCardHeader>
          </GlassCard>

          <GlassCard variant="accent" glowColor="amber" hoverEffect>
            <GlassCardHeader>
              <div className="h-10 w-10 rounded-xl bg-prism-amber/10 border border-prism-amber/20 flex items-center justify-center text-prism-amber mb-2">
                <Terminal className="h-5 w-5" />
              </div>
              <GlassCardTitle>Adaptive Mock Interview</GlassCardTitle>
              <GlassCardDescription>
                Socratic oral evaluation with rubric-based scoring and target revision links.
              </GlassCardDescription>
            </GlassCardHeader>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
