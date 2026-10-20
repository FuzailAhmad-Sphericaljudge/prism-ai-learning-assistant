"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ShieldAlert, PlayCircle, Layers } from "lucide-react";

interface PracticeEmptyStateProps {
  conceptTag?: string | null;
  onGenerateAll: () => void;
  courseId?: string;
}

export function PracticeEmptyState({
  conceptTag,
  onGenerateAll,
  courseId = "00000000-0000-0000-0000-000000000002",
}: PracticeEmptyStateProps) {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-xl p-8 sm:p-12 text-center relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial-gradient from-indigo-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-md mx-auto space-y-5 relative z-10">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          <Layers className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">
            {conceptTag
              ? `No Active Question for "${conceptTag}"`
              : "Generate Grounded Practice Questions"}
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            PRISM practice questions are derived strictly from evidence admitted by
            the Temporal Evidence Firewall. No hallucinations, no premature spoilers.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onGenerateAll}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium text-xs text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 shadow-[0_0_15px_rgba(139,92,246,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Practice Questions</span>
          </button>

          <Link
            href={`/learn/${courseId}`}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium text-xs text-zinc-300 bg-zinc-900 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 text-cyan-400" />
            <span>Resume Lecture</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
