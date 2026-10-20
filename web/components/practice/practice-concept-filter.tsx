"use client";

import React from "react";
import { Sparkles, Layers, CheckCircle2, AlertCircle } from "lucide-react";

interface PracticeConceptFilterProps {
  concepts: string[];
  selectedConcept: string | null;
  onSelectConcept: (concept: string | null) => void;
  conceptStatusMap?: Record<string, "not_assessed" | "gap_found" | "improving" | "demonstrated">;
  disabled?: boolean;
}

export function PracticeConceptFilter({
  concepts,
  selectedConcept,
  onSelectConcept,
  conceptStatusMap = {},
  disabled = false,
}: PracticeConceptFilterProps) {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "demonstrated":
        return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
      case "gap_found":
        return <AlertCircle className="w-3 h-3 text-rose-400" />;
      case "improving":
        return <Sparkles className="w-3 h-3 text-amber-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
      {/* "All Concepts" button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelectConcept(null)}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border ${
          selectedConcept === null
            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.25)]"
            : "bg-white/[0.03] text-zinc-400 border-white/10 hover:border-white/20 hover:text-zinc-200"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>All Concepts</span>
      </button>

      {/* Individual Concept Pills */}
      {concepts.map((concept) => {
        const isSelected = selectedConcept === concept;
        const status = conceptStatusMap[concept];

        return (
          <button
            key={concept}
            type="button"
            disabled={disabled}
            onClick={() => onSelectConcept(concept)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border ${
              isSelected
                ? "bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-pink-500/20 text-white border-indigo-400/50 shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                : "bg-white/[0.03] text-zinc-400 border-white/10 hover:border-white/20 hover:text-zinc-200"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {getStatusIcon(status)}
            <span>{concept}</span>
            {status && (
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status === "demonstrated"
                    ? "bg-emerald-400"
                    : status === "gap_found"
                    ? "bg-rose-400 animate-pulse"
                    : status === "improving"
                    ? "bg-amber-400"
                    : "bg-zinc-600"
                }`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
