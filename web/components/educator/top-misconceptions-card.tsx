"use client";

import React from "react";
import Link from "next/link";
import { TopMisconceptionItem } from "@/lib/api-types";
import {
  AlertTriangle,
  Lightbulb,
  PlayCircle,
  ExternalLink,
  Layers,
} from "lucide-react";

interface TopMisconceptionsCardProps {
  misconceptions: TopMisconceptionItem[];
  courseId: string;
}

export function TopMisconceptionsCard({
  misconceptions,
  courseId,
}: TopMisconceptionsCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 space-y-5 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold text-slate-100">
              Top Recurring Misconceptions
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Cognitive gaps diagnosed across student queries, practice attempts, and oral defenses.
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-amber-950/40 border border-amber-800/60 text-amber-300">
          {misconceptions.length} Gaps Tracked
        </span>
      </div>

      <div className="space-y-3">
        {misconceptions.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 space-y-3 hover:border-slate-700 transition-colors"
          >
            {/* Header: Tag + Prevalence */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-slate-200">
                    {item.misconception_tag.replace(/_/g, " ")}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    {item.concept_tag}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Lecture Landmark: {item.landmark_coordinate}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-bold text-amber-400">
                  {Math.round(item.prevalence_percentage)}% Prevalence
                </span>
                <span className="block text-[11px] text-slate-500">
                  {item.occurrences} occurrences
                </span>
              </div>
            </div>

            {/* Prevalence Bar */}
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                style={{ width: `${Math.min(100, item.prevalence_percentage)}%` }}
              />
            </div>

            {/* Educator Remediation Suggestion */}
            <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-start gap-1.5 text-slate-300">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-amber-300">Pedagogical Remediation: </strong>
                  {item.remediation_action}
                </span>
              </div>

              <Link
                href={`/learn/${courseId}?search=${encodeURIComponent(item.concept_tag)}`}
                className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors shrink-0"
              >
                <PlayCircle className="w-3 h-3" />
                <span>Inspect in Course</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
