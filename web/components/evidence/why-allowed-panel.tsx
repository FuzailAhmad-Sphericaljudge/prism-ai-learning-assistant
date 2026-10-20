"use client";

import * as React from "react";
import { ShieldCheck, Lock, AlertTriangle, Layers, Video, BookOpen, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { AdmittedChunkDebug, BlockedChunkDebug, RetrieveDebugResponse } from "@/lib/api-types";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface WhyAllowedPanelProps {
  debugData?: RetrieveDebugResponse | null;
  playbackSec: number;
  mode: string;
  className?: string;
}

export const WhyAllowedPanel: React.FC<WhyAllowedPanelProps> = ({
  debugData,
  playbackSec,
  mode,
  className,
}) => {
  const [activeTab, setActiveTab] = React.useState<"admitted" | "blocked">("admitted");
  const [isExpanded, setIsExpanded] = React.useState(true);

  if (!debugData) {
    return (
      <div className={cn("p-4 rounded-xl border border-border/50 bg-card/40 text-center text-xs text-muted-foreground", className)}>
        <p>No retrieval debug telemetry recorded for this turn.</p>
      </div>
    );
  }

  const getSourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "video":
        return <Video className="w-3.5 h-3.5 text-cyan-400" />;
      case "ppt":
      case "slide":
        return <Layers className="w-3.5 h-3.5 text-amber-400" />;
      case "pdf":
        return <BookOpen className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-card/60 backdrop-blur-md overflow-hidden shadow-lg transition-all",
        className
      )}
    >
      {/* Panel Accordion Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3.5 bg-muted/20 hover:bg-muted/30 border-b border-border/40 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">
                Why was this allowed?
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                Firewall Policy Audit
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Evaluated against playback landmark {formatTime(playbackSec)} ({mode})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              {debugData.admitted.length} Admitted
            </span>
            <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
              {debugData.blocked.length} Blocked
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3.5 space-y-3 animate-in fade-in duration-200">
          {/* Segmented Controller */}
          <div className="flex items-center rounded-lg bg-muted/40 p-0.5 border border-border/40 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("admitted")}
              className={cn(
                "flex-1 py-1 px-3 rounded-md font-medium transition-all flex items-center justify-center gap-1.5",
                activeTab === "admitted"
                  ? "bg-card text-foreground shadow-sm font-semibold text-emerald-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admitted Chunks ({debugData.admitted.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("blocked")}
              className={cn(
                "flex-1 py-1 px-3 rounded-md font-medium transition-all flex items-center justify-center gap-1.5",
                activeTab === "blocked"
                  ? "bg-card text-foreground shadow-sm font-semibold text-rose-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Lock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Blocked Chunks ({debugData.blocked.length})</span>
            </button>
          </div>

          {/* Admitted Tab View */}
          {activeTab === "admitted" && (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {debugData.admitted.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-4">
                  No chunks passed admission criteria for this scope.
                </p>
              ) : (
                debugData.admitted.map((adm, idx) => (
                  <div
                    key={`adm-${adm.chunk_id}-${idx}`}
                    className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-950/10 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {getSourceIcon(adm.source_type)}
                        <span className="font-semibold text-foreground capitalize">
                          {adm.source_type}
                        </span>
                        <span className="text-muted-foreground font-mono text-[10px]">
                          [{adm.coordinate}]
                        </span>
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-mono px-1.5 py-0.5 rounded border",
                          adm.status === "interpolated_straddling"
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        )}
                      >
                        {adm.status === "interpolated_straddling"
                          ? "Straddling Prefix Interpolated"
                          : "Fully Admitted"}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[11px] line-clamp-2 italic font-sans">
                      &ldquo;{adm.excerpt}&rdquo;
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Blocked Tab View */}
          {activeTab === "blocked" && (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {debugData.blocked.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-4">
                  Zero chunks blocked. All candidates satisfied firewall invariants.
                </p>
              ) : (
                debugData.blocked.map((blk, idx) => (
                  <div
                    key={`blk-${blk.chunk_id}-${idx}`}
                    className="p-2.5 rounded-lg border border-rose-500/30 bg-rose-950/10 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {getSourceIcon(blk.source_type)}
                        <span className="font-semibold text-foreground capitalize">
                          {blk.source_type}
                        </span>
                        <span className="text-rose-300 font-mono text-[10px]">
                          [{blk.coordinate}]
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 inline-flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-rose-400" />
                        Future Withheld
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 text-[11px] text-rose-300/80 bg-rose-950/30 p-2 rounded border border-rose-500/20">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{blk.reason}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
