"use client";

import * as React from "react";
import { Search, Sparkles, SlidersHorizontal, BookOpen, Layers, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CourseLibraryHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: string;
  onFilterChange: (f: string) => void;
}

export const CourseLibraryHeader: React.FC<CourseLibraryHeaderProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
}) => {
  return (
    <div className="flex flex-col gap-8 mb-10">
      {/* Top Title Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-prism-cyan mb-3">
            <Sparkles className="h-3.5 w-3.5 text-prism-cyan animate-pulse" />
            <span>Learner Workspace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
            Course Library
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Resume multi-modal learning under the Temporal Evidence Firewall, inspect cited source coordinates, or test understanding in adaptive Socratic oral defense.
          </p>
        </div>

        {/* Quick Stats Pill Strip */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300">
            <BookOpen className="h-4 w-4 text-prism-cyan" />
            <span>CS-201 Active</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300">
            <Layers className="h-4 w-4 text-prism-violet" />
            <span>4 Modalities</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Firewall Active</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-2xl bg-[#0E1017]/60 border border-white/[0.08] backdrop-blur-xl">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search courses, topics, instructors..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-prism-cyan/50 focus:ring-1 focus:ring-prism-cyan/50 transition-all"
          />
        </div>

        {/* Term Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {["All", "Fall 2026", "In Progress"].map((tab) => (
            <button
              key={tab}
              onClick={() => onFilterChange(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                activeFilter === tab
                  ? "bg-white/10 text-white border border-white/20 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
