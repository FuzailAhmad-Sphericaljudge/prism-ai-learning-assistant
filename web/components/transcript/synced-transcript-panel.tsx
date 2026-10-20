"use client";

import * as React from "react";
import { Search, Compass, Lock, ArrowDown, Sparkles, Filter } from "lucide-react";
import { TranscriptCue } from "@/lib/api-types";
import { usePlayerStore } from "@/lib/stores/use-player-store";
import { TranscriptItem } from "@/components/transcript/transcript-item";

interface SyncedTranscriptPanelProps {
  cues: TranscriptCue[];
  isLoading?: boolean;
}

export const SyncedTranscriptPanel: React.FC<SyncedTranscriptPanelProps> = ({
  cues = [],
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [autoScrollEnabled, setAutoScrollEnabled] = React.useState(true);
  const activeItemRef = React.useRef<HTMLDivElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const { currentTime, firewallMode, seekTo } = usePlayerStore();

  // Find active cue index
  const activeIndex = cues.findIndex(
    (cue) => currentTime >= cue.start_sec && currentTime < cue.end_sec
  );

  // Auto-scroll effect
  React.useEffect(() => {
    if (!autoScrollEnabled || !activeItemRef.current) return;
    activeItemRef.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeIndex, autoScrollEnabled]);

  // Filter cues by search query
  const filteredCues = React.useMemo(() => {
    if (!searchQuery.trim()) return cues;
    const q = searchQuery.toLowerCase().trim();
    return cues.filter(
      (c) =>
        c.text.toLowerCase().includes(q) ||
        (c.speaker && c.speaker.toLowerCase().includes(q))
    );
  }, [cues, searchQuery]);

  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/[0.08] bg-[#0E1017]/80 backdrop-blur-xl overflow-hidden shadow-xl">
      {/* Panel Header */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-prism-cyan animate-pulse" />
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Synced Transcript
          </h3>
          <span className="text-[11px] font-mono text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
            {cues.length} cues
          </span>
        </div>

        {/* Auto-scroll toggle */}
        <button
          onClick={() => setAutoScrollEnabled(!autoScrollEnabled)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors border ${
            autoScrollEnabled
              ? "bg-prism-cyan/10 border-prism-cyan/30 text-prism-cyan"
              : "bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white"
          }`}
          title={autoScrollEnabled ? "Auto-scroll is on" : "Click to enable auto-scroll"}
        >
          <ArrowDown className={`h-3 w-3 ${autoScrollEnabled ? "animate-bounce" : ""}`} />
          <span>Auto-scroll {autoScrollEnabled ? "ON" : "OFF"}</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="px-4 py-2.5 border-b border-white/[0.06] bg-black/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search spoken words or timestamps..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-prism-cyan/50 transition-all font-sans"
          />
        </div>
      </div>

      {/* Transcript Items Scroll Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-white/[0.03]"
      >
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse font-mono">
            Loading synced transcript from API...
          </div>
        ) : filteredCues.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">
            No cues matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredCues.map((cue, idx) => {
            const isActive =
              currentTime >= cue.start_sec && currentTime < cue.end_sec;
            const isLocked =
              firewallMode === "learn_so_far" && cue.start_sec > currentTime;

            return (
              <TranscriptItem
                key={`${cue.start_sec}-${idx}`}
                cue={cue}
                isActive={isActive}
                isLocked={isLocked}
                onSeek={seekTo}
                cueRef={isActive ? activeItemRef : undefined}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
