"use client";

import * as React from "react";
import { Lock, Compass, AlertTriangle, ArrowRight, Clock } from "lucide-react";
import { usePlayerStore } from "@/lib/stores/use-player-store";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface NotCoveredYetCardProps {
  topic?: string | null;
  availableAtSec?: number | null;
  currentPlaybackSec?: number;
  onExploreAhead?: () => void;
  className?: string;
}

export const NotCoveredYetCard: React.FC<NotCoveredYetCardProps> = ({
  topic,
  availableAtSec,
  currentPlaybackSec,
  onExploreAhead,
  className,
}) => {
  const { setFirewallMode } = usePlayerStore();

  const handleUnlock = () => {
    setFirewallMode("explore_ahead");
    if (onExploreAhead) {
      onExploreAhead();
    }
  };

  return (
    <div
      className={cn(
        "mt-3 rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 via-card/70 to-card/90 p-4 shadow-xl backdrop-blur-md relative overflow-hidden",
        className
      )}
    >
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
          <Lock className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Temporal Firewall Active
            </h4>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
              Not Covered Yet
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
            This concept appears further ahead in the curriculum.
          </p>
        </div>
      </div>

      {/* Content Details */}
      <div className="bg-background/40 rounded-lg p-3 border border-border/40 mb-3 space-y-1.5 text-xs">
        {topic && (
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Detected concept:</span>
            <span className="font-medium text-foreground">{topic}</span>
          </div>
        )}
        {availableAtSec !== undefined && availableAtSec !== null && (
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Introduced in lecture at:</span>
            <span className="font-mono text-cyan-400 font-semibold inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(availableAtSec)}
            </span>
          </div>
        )}
      </div>

      {/* Spoiler Warning */}
      <div className="flex items-start gap-2 text-[11px] text-amber-300/80 bg-amber-500/5 border border-amber-500/10 rounded-lg p-2.5 mb-3 leading-relaxed">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong>Spoiler guard:</strong> Answers are restricted to timestamps up to{" "}
          {formatTime(currentPlaybackSec || 0)} to preserve natural cognitive progression.
        </span>
      </div>

      {/* Action CTA */}
      <button
        type="button"
        onClick={handleUnlock}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-amber-100 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 transition-all shadow-md hover:shadow-amber-500/20 cursor-pointer group"
      >
        <Compass className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
        <span>Switch to Explore Ahead mode to unlock</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};
