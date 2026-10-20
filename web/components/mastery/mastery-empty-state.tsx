"use client";

import React from "react";
import Link from "next/link";
import { Award, Sparkles, PlayCircle, ShieldCheck } from "lucide-react";

interface MasteryEmptyStateProps {
  courseId?: string;
}

export function MasteryEmptyState({
  courseId = "00000000-0000-0000-0000-000000000002",
}: MasteryEmptyStateProps) {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-xl p-8 sm:p-12 text-center relative overflow-hidden">
      <div className="max-w-lg mx-auto space-y-6 relative z-10">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.25)]">
          <Award className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            No Assessed Evidence Yet
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            PRISM calculates mastery strictly from verified problem-solving and diagnostic attempts.
            Passive video playback alone never inflates your score. Complete your first practice challenge
            to build your cognitive mastery profile.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/practice"
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Practice Challenge</span>
          </Link>

          <Link
            href={`/learn/${courseId}`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-sm text-zinc-300 bg-zinc-900 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 text-cyan-400" />
            <span>Resume Lecture</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
