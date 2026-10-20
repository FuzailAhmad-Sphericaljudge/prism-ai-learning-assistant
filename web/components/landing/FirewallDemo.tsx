"use client";

import * as React from "react";
import {
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Info,
  Clock,
  Layers,
} from "lucide-react";
import { SectionHeading } from "@/components/prism/SectionHeading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlowBorder } from "@/components/prism/GlowBorder";
import { CitationChip } from "@/components/prism/CitationChip";
import { DEMO_TRANSCRIPT_BLOCKS, TranscriptBlock } from "./landing-data";

export const FirewallDemo: React.FC = () => {
  // Current playback time in seconds (default set to 18:42 = 1122 seconds to showcase boundary case immediately!)
  const [playbackSeconds, setPlaybackSeconds] = React.useState<number>(1122);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);

  // Playback timer simulation
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackSeconds((prev) => {
          if (prev >= 1800) {
            setIsPlaying(false);
            return 1800;
          }
          return prev + 2;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Keyboard shortcut listener for timeline scrubbing
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === "ArrowLeft") {
        setPlaybackSeconds((prev) => Math.max(0, prev - 30));
      } else if (e.key === "ArrowRight") {
        setPlaybackSeconds((prev) => Math.min(1800, prev + 30));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Jump presets
  const handleJump = (seconds: number) => {
    setPlaybackSeconds(seconds);
  };

  // Compute status for each transcript block
  const getBlockState = (block: TranscriptBlock) => {
    if (playbackSeconds < block.startTime) {
      return "locked";
    }
    if (playbackSeconds >= block.endTime) {
      return "unlocked";
    }
    if (block.isBoundaryCase && playbackSeconds >= block.startTime && playbackSeconds < block.endTime) {
      return "boundary";
    }
    return "active";
  };

  const unlockedCount = DEMO_TRANSCRIPT_BLOCKS.filter(
    (b) => playbackSeconds >= b.startTime
  ).length;

  const isBoundaryActive = playbackSeconds >= 1122 && playbackSeconds < 1140;

  return (
    <section id="firewall-demo" className="py-24 border-t border-white/[0.08] relative overflow-hidden bg-[#07080D]">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-prism-cyan/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-48 w-96 h-96 bg-prism-violet/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-8">
        <SectionHeading
          badge="Interactive Demonstration"
          title="The Temporal Evidence"
          gradientTitle="Firewall Engine"
          subtitle="Move the playback slider anywhere from 0:00 to 30:00. Watch future lecture blocks lock with mathematical certainty, and see how PRISM adapts answers without spoiling unreached concepts."
          align="center"
          className="mb-12"
        />

        {/* Master Control Deck & Timeline Slider */}
        <div className="w-full max-w-5xl mx-auto mb-10">
          <GlowBorder animated intensity="medium" borderRadius="20px">
            <div className="p-6 sm:p-8 bg-[#0E1018] rounded-[19px] border border-white/[0.08] space-y-6">
              {/* Header with Telemetry Gauges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-prism-cyan/10 border border-prism-cyan/20 flex items-center justify-center text-prism-cyan">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white tracking-wide">
                        Lecture Playback Position
                      </span>
                      <Badge variant="cyan" dot className="font-mono text-[10px]">
                        t = {formatTime(playbackSeconds)}
                      </Badge>
                      <span className="text-[10px] font-mono text-foreground-subtle hidden md:inline">
                        ({Math.round((playbackSeconds / 1800) * 100)}% complete)
                      </span>
                    </div>
                    <span className="text-xs text-foreground-subtle font-mono">
                      Window: [00:00 &rarr; {formatTime(playbackSeconds)}] &bull; Total: 30:00
                    </span>
                  </div>
                </div>

                {/* Firewall Telemetry Chips */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <Layers className="h-3.5 w-3.5 text-prism-violet" />
                    <span className="text-foreground-muted">Blocks:</span>
                    <span className="text-white font-bold">{unlockedCount} / 6</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>0.00% Forward Leak</span>
                  </div>
                </div>
              </div>

              {/* Interactive Timeline Range Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-foreground-muted">
                  <span>00:00 (Start)</span>
                  <span className="text-prism-cyan font-bold text-sm bg-white/[0.04] px-3 py-0.5 rounded-full border border-white/10">
                    Current Playhead: {formatTime(playbackSeconds)} / 30:00
                  </span>
                  <span>30:00 (End)</span>
                </div>

                <div className="relative py-2">
                  <input
                    type="range"
                    min="0"
                    max="1800"
                    step="5"
                    value={playbackSeconds}
                    onChange={(e) => setPlaybackSeconds(Number(e.target.value))}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-white/[0.08] accent-prism-cyan focus:outline-none transition-all"
                    aria-label="Temporal Evidence Firewall Timeline Scrubber"
                  />
                  {/* Boundary Case Marker at 18:42 (1122s / 1800s = 62.3%) */}
                  <div
                    className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                    style={{ left: "62.33%" }}
                  >
                    <span className="h-7 w-0.5 bg-amber-400" />
                    <span className="text-[9px] font-mono text-amber-400 font-bold bg-black/80 px-1 rounded border border-amber-400/40 mt-0.5">
                      18:42 Boundary
                    </span>
                  </div>
                </div>

                {/* Jump Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs font-mono text-foreground-subtle mr-1">
                    Jump to:
                  </span>
                  <Button
                    variant="glass"
                    size="sm"
                    className="text-xs font-mono h-7 px-2.5"
                    onClick={() => handleJump(120)}
                  >
                    02:00 Physical
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    className="text-xs font-mono h-7 px-2.5"
                    onClick={() => handleJump(480)}
                  >
                    08:00 Lamport
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    className="text-xs font-mono h-7 px-2.5"
                    onClick={() => handleJump(870)}
                  >
                    14:30 Vector
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-mono h-7 px-2.5 border-amber-400/40 text-amber-300 bg-amber-400/10 hover:bg-amber-400/20"
                    onClick={() => handleJump(1122)}
                  >
                    ⚡ 18:42 Boundary Case
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    className="text-xs font-mono h-7 px-2.5"
                    onClick={() => handleJump(1260)}
                  >
                    21:00 Concurrency
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    className="text-xs font-mono h-7 px-2.5"
                    onClick={() => handleJump(1620)}
                  >
                    27:00 Matrix
                  </Button>

                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      variant="glass"
                      size="sm"
                      className="h-7 px-2.5 text-xs"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-3 w-3 mr-1" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" /> Play Simulation
                        </>
                      )}
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        setPlaybackSeconds(0);
                        setIsPlaying(false);
                      }}
                      title="Reset timeline"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Boundary Case Alert Banner */}
              {isBoundaryActive && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3 animate-in fade-in duration-300">
                  <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-amber-200">
                      18:42 Boundary Case Triggered!
                    </p>
                    <p className="text-amber-300/90 leading-relaxed">
                      Transcript segment ending at <strong>19:00</strong> is dynamically truncated to its permitted prefix at <strong>18:42</strong>. The forward sub-segment [18:42 &rarr; 19:00] is firewalled and censored to prevent premature concept leak.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </GlowBorder>
        </div>

        {/* Two-Column Demo Grid: Dynamic Socratic Answer (Left) + Transcript Blocks (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          {/* Left Column: Dynamic Grounded Q&A Synthesizer (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0E1018] border border-white/[0.08] shadow-glass space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-prism-cyan" />
                  Learner Question
                </span>
                <span className="text-[10px] font-mono text-foreground-subtle">
                  Simulated Query
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <p className="text-xs sm:text-sm text-white font-medium">
                  &quot;How does a distributed node decide whether two events are concurrent without a central clock?&quot;
                </p>
              </div>

              {/* Dynamic Answer Synthesized Based on Current Playback Time */}
              <div className="p-4 rounded-xl bg-[#141724] border border-prism-violet/30 shadow-glass space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-prism-violet flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-prism-cyan" />
                    PRISM Firewall Synthesis
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-foreground-muted">
                    t &le; {formatTime(playbackSeconds)}
                  </span>
                </div>

                {/* State 1: Before 05:30 (Physical Clocks only) */}
                {playbackSeconds < 330 && (
                  <div className="space-y-2 text-xs leading-relaxed text-foreground-muted">
                    <p className="text-amber-300/90 font-mono text-[11px] font-semibold flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Temporal Firewall Active: Concept Not Yet Covered
                    </p>
                    <p>
                      At this timestamp (<strong className="text-white">{formatTime(playbackSeconds)}</strong>), the lecture only covers physical clock drift and why NTP is insufficient. Logical clocks and concurrency have not yet been introduced.
                    </p>
                    <p className="text-foreground-subtle italic">
                      PRISM refuses to spoil upcoming lecture derivations. Drag playhead to 19:00+ to reveal the concurrency detection algorithm.
                    </p>
                  </div>
                )}

                {/* State 2: 05:30 - 12:15 (Lamport Clocks only) */}
                {playbackSeconds >= 330 && playbackSeconds < 735 && (
                  <div className="space-y-2 text-xs leading-relaxed text-foreground-muted">
                    <p className="text-amber-300/90 font-mono text-[11px] font-semibold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Partial Foundation Available (Lamport Clocks)
                    </p>
                    <p>
                      At <strong className="text-white">{formatTime(playbackSeconds)}</strong>, Lamport Logical Clocks have been introduced with the happens-before relation (a &rarr; b). However, Lamport clocks only provide a partial order and <em>cannot</em> determine if two events are concurrent.
                    </p>
                    <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                      <span className="text-[10px] font-mono text-foreground-subtle">Permitted:</span>
                      <CitationChip type="timestamp" value="08:40" />
                    </div>
                  </div>
                )}

                {/* State 3: 12:15 - 18:42 (Vector Clock update rules, but not concurrency test) */}
                {playbackSeconds >= 735 && playbackSeconds < 1122 && (
                  <div className="space-y-2 text-xs leading-relaxed text-foreground-muted">
                    <p className="text-prism-cyan font-mono text-[11px] font-semibold flex items-center gap-1">
                      <Unlock className="h-3 w-3" /> Vector Clocks Introduced
                    </p>
                    <p>
                      At <strong className="text-white">{formatTime(playbackSeconds)}</strong>, process vector update rules are permitted. Each node maintains an array of size N, incrementing on internal events and taking element-wise maximums upon receipt.
                    </p>
                    <p className="text-foreground-subtle italic">
                      The formal algebraic test for concurrency is covered at 19:00 and remains firewalled.
                    </p>
                    <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                      <span className="text-[10px] font-mono text-foreground-subtle">Permitted:</span>
                      <CitationChip type="timestamp" value="14:28" />
                    </div>
                  </div>
                )}

                {/* State 4: 18:42 Boundary Case (Prefix permitted, forward censored) */}
                {isBoundaryActive && (
                  <div className="space-y-2 text-xs leading-relaxed text-foreground-muted">
                    <p className="text-amber-400 font-mono text-[11px] font-semibold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-amber-400" /> 18:42 Boundary Segment Truncated
                    </p>
                    <p>
                      The professor poses the concurrency question at 18:42. PRISM permits the contextual prefix up to 18:42, but strictly censors the remainder of the 18:42-19:00 segment.
                    </p>
                    <div className="p-2 rounded bg-amber-400/10 border border-amber-400/20 text-[11px] font-mono text-amber-200">
                      Censored forward window: [18:42 - 19:00]
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                      <span className="text-[10px] font-mono text-foreground-subtle">Permitted:</span>
                      <CitationChip type="timestamp" value="14:28" />
                      <CitationChip type="timestamp" value="18:42" />
                    </div>
                  </div>
                )}

                {/* State 5: 19:00+ (Full Concurrency Algorithm Unlocked) */}
                {playbackSeconds >= 1140 && (
                  <div className="space-y-2 text-xs leading-relaxed text-foreground">
                    <p className="text-emerald-400 font-mono text-[11px] font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" /> Full Concurrency Derivation Unlocked
                    </p>
                    <p>
                      Event a is concurrent with event b (a || b) if and only if:
                    </p>
                    <div className="p-2.5 rounded bg-black/40 border border-prism-cyan/30 font-mono text-[11px] text-prism-cyan">
                      &not;(V(a) &le; V(b)) &and; &not;(V(b) &le; V(a))
                    </div>
                    <p className="text-foreground-muted text-[11px]">
                      Neither vector strictly dominates in all dimensions. Causally independent.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
                      <span className="text-[10px] font-mono text-foreground-subtle">Permitted:</span>
                      <CitationChip type="timestamp" value="14:28" />
                      <CitationChip type="timestamp" value="21:05" />
                      {playbackSeconds >= 1470 && <CitationChip type="timestamp" value="27:10" />}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Transcript Segment Feed (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-xs font-mono text-foreground-muted flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-prism-cyan" />
                Lecture Transcript Blocks (Temporal Filtering Active)
              </span>
              <span className="text-[11px] font-mono text-foreground-subtle">
                Green = Unlocked &bull; Grey = Firewalled
              </span>
            </div>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {DEMO_TRANSCRIPT_BLOCKS.map((block) => {
                const state = getBlockState(block);
                const isLocked = state === "locked";
                const isBoundary = state === "boundary";
                const isActive = state === "active";

                return (
                  <div
                    key={block.id}
                    className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                      isLocked
                        ? "bg-white/[0.01] border-white/[0.04] opacity-40 grayscale"
                        : isBoundary
                        ? "bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10"
                        : isActive
                        ? "bg-[#141726] border-prism-cyan/40 shadow-md shadow-prism-cyan/10"
                        : "bg-[#0E1018] border-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-white/[0.06]">
                          {block.startFormatted} - {block.endFormatted}
                        </span>
                        <span className="text-xs font-semibold text-foreground">
                          {block.topic}
                        </span>
                      </div>

                      <div>
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-foreground-subtle px-2 py-0.5 rounded bg-white/[0.03]">
                            <Lock className="h-3 w-3 text-foreground-subtle" /> Locked
                          </span>
                        ) : isBoundary ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-300 px-2 py-0.5 rounded bg-amber-400/20 border border-amber-400/40 font-bold animate-pulse">
                            <AlertTriangle className="h-3 w-3" /> Truncated at 18:42
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                            <Unlock className="h-3 w-3" /> Permitted
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-foreground-muted leading-relaxed font-sans">
                      {isBoundary ? block.truncatedText : block.text}
                    </p>

                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-white/[0.04] text-[10px] font-mono text-foreground-subtle">
                      <span>{block.speaker}</span>
                      {!isLocked && (
                        <span className="text-prism-cyan">
                          Citation Chip: [{block.citationChip}]
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
