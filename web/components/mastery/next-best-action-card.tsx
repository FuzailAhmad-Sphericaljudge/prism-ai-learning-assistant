"use client";

import React from "react";
import Link from "next/link";
import { NextBestAction } from "@/lib/api-types";
import {
  Sparkles,
  ArrowRight,
  AlertTriangle,
  PlayCircle,
  HelpCircle,
  CheckCircle2,
  Video,
} from "lucide-react";

interface NextBestActionCardProps {
  action?: NextBestAction | null;
  courseId?: string;
}

export function NextBestActionCard({
  action,
  courseId = "00000000-0000-0000-0000-000000000002",
}: NextBestActionCardProps) {
  if (!action) {
    return (
      <div className="w-full rounded-2xl border border-white/10 bg-zinc-950/60 p-6 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-white">All Assessed Concepts Demonstrated</h4>
            <p className="text-xs text-zinc-400">Continue watching lecture or explore ahead.</p>
          </div>
        </div>
        <Link
          href={`/learn/${courseId}`}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
        >
          Resume Lecture
        </Link>
      </div>
    );
  }

  const isRevise = action.recommended_type === "revise";
  const isPractice = action.recommended_type === "practice";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-zinc-950/70 to-purple-950/40 p-6 sm:p-7 backdrop-blur-xl shadow-[0_0_30px_rgba(99,102,241,0.15)]">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Recommended Next Best Action</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            {isRevise && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
            {isPractice && <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />}
            <span>{action.label}</span>
          </h3>

          <p className="text-sm text-zinc-300 leading-relaxed">{action.reason}</p>

          {action.coordinate && (
            <div className="flex items-center gap-2 pt-1 text-xs text-zinc-400">
              <span className="text-zinc-500">Target Landmark:</span>
              <span className="px-2 py-0.5 rounded font-mono bg-zinc-900 border border-white/10 text-indigo-300">
                {action.coordinate}
              </span>
            </div>
          )}
        </div>

        <Link
          href={action.action_url}
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all shrink-0 cursor-pointer"
        >
          <span>{isRevise ? "Revise in Lecture" : "Start Practice"}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
