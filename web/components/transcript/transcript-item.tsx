"use client";

import * as React from "react";
import { Lock, Play, User } from "lucide-react";
import { TranscriptCue } from "@/lib/api-types";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TranscriptItemProps {
  cue: TranscriptCue;
  isActive: boolean;
  isLocked: boolean;
  onSeek: (startSec: number) => void;
  cueRef?: React.Ref<HTMLDivElement>;
}

export const TranscriptItem: React.FC<TranscriptItemProps> = ({
  cue,
  isActive,
  isLocked,
  onSeek,
  cueRef,
}) => {
  return (
    <div
      ref={cueRef}
      onClick={() => onSeek(cue.start_sec)}
      className={cn(
        "group relative flex items-start gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer text-left border select-none",
        isActive
          ? "bg-gradient-to-r from-prism-cyan/10 via-prism-violet/10 to-transparent border-prism-cyan/40 shadow-sm"
          : isLocked
          ? "opacity-40 hover:opacity-60 bg-white/[0.01] border-transparent"
          : "hover:bg-white/[0.04] border-transparent"
      )}
    >
      {/* Active Left Indicator Bar */}
      {isActive && (
        <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-prism-cyan to-prism-violet" />
      )}

      {/* Timestamp Pill */}
      <div className="flex-shrink-0 flex items-center gap-1.5 mt-0.5">
        <span
          className={cn(
            "font-mono text-[11px] px-2 py-0.5 rounded-md border",
            isActive
              ? "bg-prism-cyan/20 border-prism-cyan/40 text-prism-cyan font-bold"
              : isLocked
              ? "bg-white/[0.02] border-white/[0.04] text-slate-500"
              : "bg-white/[0.04] border-white/[0.08] text-slate-400 group-hover:text-slate-200"
          )}
        >
          {formatTime(cue.start_sec)}
        </span>
      </div>

      {/* Cue Content & Speaker */}
      <div className="flex-1 min-w-0">
        {cue.speaker && (
          <div className="flex items-center gap-1 text-[10px] font-mono font-semibold text-slate-400 mb-0.5">
            <User className="h-2.5 w-2.5 text-prism-violet" />
            <span>{cue.speaker}</span>
          </div>
        )}

        <p
          className={cn(
            "text-xs leading-relaxed transition-colors",
            isActive
              ? "text-white font-medium"
              : isLocked
              ? "text-slate-500 line-through decoration-slate-600/50"
              : "text-slate-300 group-hover:text-slate-100"
          )}
        >
          {cue.text}
        </p>
      </div>

      {/* Right Lock / Play status icon */}
      <div className="flex-shrink-0 pt-0.5">
        {isLocked ? (
          <span title="Locked by Temporal Firewall">
            <Lock className="h-3.5 w-3.5 text-slate-500" />
          </span>
        ) : isActive ? (
          <Play className="h-3.5 w-3.5 text-prism-cyan fill-prism-cyan animate-pulse" />
        ) : null}
      </div>
    </div>
  );
};
