"use client";

import * as React from "react";
import { ShieldCheck, Compass, Lock, Zap } from "lucide-react";
import { usePlayerStore } from "@/lib/stores/use-player-store";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface FirewallStatusBadgeProps {
  className?: string;
  showBoundaryButton?: boolean;
}

export const FirewallStatusBadge: React.FC<FirewallStatusBadgeProps> = ({
  className,
  showBoundaryButton = true,
}) => {
  const { currentTime, duration, firewallMode, seekTo } = usePlayerStore();

  const formattedTime = formatTime(currentTime);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {firewallMode === "learn_so_far" ? (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-300 text-xs font-mono shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-medium text-emerald-400">Firewall active:</span>
          <span className="font-bold text-white tracking-wide">context up to {formattedTime}</span>
          <Lock className="h-3 w-3 text-emerald-400/80 ml-0.5" />
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-prism-pink/[0.08] border border-prism-pink/20 text-prism-pink text-xs font-mono shadow-sm">
          <Compass className="h-3.5 w-3.5 text-prism-pink" />
          <span className="font-medium text-prism-pink">Explore ahead:</span>
          <span className="font-bold text-white tracking-wide">unconstrained ({formatTime(duration)})</span>
        </div>
      )}

      {showBoundaryButton && (
        <button
          onClick={() => seekTo(1122)} // 18:42
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
          title="Jump to the 18:42 boundary case where deletion begins"
        >
          <Zap className="h-3 w-3 text-prism-cyan" />
          <span>Jump 18:42</span>
        </button>
      )}
    </div>
  );
};
