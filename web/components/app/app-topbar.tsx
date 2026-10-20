"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Compass,
  Lock,
  Flame,
  Activity,
  Layers,
} from "lucide-react";
import { usePlayerStore } from "@/lib/stores/use-player-store";
import { formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AppTopBarProps {
  courseTitle?: string;
  courseCode?: string;
  lectureTitle?: string;
}

export const AppTopBar: React.FC<AppTopBarProps> = ({
  courseTitle = "CS 201: Binary Search Trees & Balanced Structures",
  courseCode = "CS-201",
  lectureTitle = "Lecture 14: Invariants, Operations & Complexity",
}) => {
  const { currentTime, duration, firewallMode, setFirewallMode } = usePlayerStore();

  const formattedTime = formatTime(currentTime);

  return (
    <header className="h-16 border-b border-white/[0.08] bg-[#07080D]/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4 z-20 flex-shrink-0 select-none">
      {/* Left: Breadcrumbs & Course Info */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/app"
          className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-white/[0.06] text-prism-cyan border border-prism-cyan/20 hover:bg-white/[0.1] transition-colors flex-shrink-0"
        >
          {courseCode}
        </Link>

        <div className="hidden sm:flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white truncate">
            <span className="truncate">{courseTitle}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono truncate">
            {lectureTitle}
          </span>
        </div>
      </div>

      {/* Center: Learn So Far / Explore Ahead Segmented Control */}
      <div className="flex items-center bg-black/40 border border-white/[0.08] rounded-xl p-1 shadow-inner">
        <button
          onClick={() => setFirewallMode("learn_so_far")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
            firewallMode === "learn_so_far"
              ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
              : "text-slate-400 hover:text-white"
          )}
        >
          <Lock className="h-3 w-3" />
          <span>Learn So Far</span>
        </button>

        <button
          onClick={() => setFirewallMode("explore_ahead")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
            firewallMode === "explore_ahead"
              ? "bg-gradient-to-r from-prism-violet/20 to-prism-pink/20 text-prism-pink border border-prism-pink/30 shadow-sm"
              : "text-slate-400 hover:text-white"
          )}
        >
          <Compass className="h-3 w-3" />
          <span>Explore Ahead</span>
        </button>
      </div>

      {/* Right: Live Firewall Status Badge */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {firewallMode === "learn_so_far" ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-300 text-xs font-mono shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="hidden md:inline">Firewall active:</span>
            <span className="font-semibold text-white">context up to {formattedTime}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 text-amber-300 text-xs font-mono shadow-sm">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline">Full context unconstrained:</span>
            <span className="font-semibold text-white">{formatTime(duration)}</span>
          </div>
        )}
      </div>
    </header>
  );
};
