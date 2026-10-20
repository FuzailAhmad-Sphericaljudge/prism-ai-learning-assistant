"use client";

import React from "react";
import Link from "next/link";
import { RevisionAction } from "@/lib/api-types";
import {
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  ArrowRight,
  BookOpen,
  Sparkles,
} from "lucide-react";

interface ReportStrengthsGapsProps {
  strengths: string[];
  gaps: string[];
  revisionLinks: RevisionAction[];
  courseId: string;
}

export function ReportStrengthsGaps({
  strengths,
  gaps,
  revisionLinks,
  courseId,
}: ReportStrengthsGapsProps) {
  return (
    <div className="space-y-6">
      {/* 2-Column Strengths vs Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths Card */}
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/10 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <h3 className="font-semibold text-sm">Demonstrated Proficiencies</h3>
          </div>

          {strengths.length > 0 ? (
            <ul className="space-y-2">
              {strengths.map((st, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-300 flex items-start gap-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60"
                >
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                  <span className="leading-relaxed">{st}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">
              No strong proficiencies verified during this defense session.
            </p>
          )}
        </div>

        {/* Identified Gaps Card */}
        <div className="rounded-xl border border-amber-900/40 bg-amber-950/10 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="font-semibold text-sm">Identified Conceptual Gaps</h3>
          </div>

          {gaps.length > 0 ? (
            <ul className="space-y-2">
              {gaps.map((gp, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-300 flex items-start gap-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60"
                >
                  <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                  <span className="leading-relaxed">{gp}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-400/90 font-medium bg-emerald-950/20 p-3 rounded-lg border border-emerald-800/40">
              Outstanding performance: no critical conceptual gaps identified across the examined criteria!
            </p>
          )}
        </div>
      </div>

      {/* Targeted Lecture Revision Roadmap */}
      {revisionLinks && revisionLinks.length > 0 && (
        <div className="rounded-xl border border-indigo-900/40 bg-gradient-to-br from-indigo-950/20 to-purple-950/20 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="font-semibold text-sm text-slate-100">
                Targeted Lecture Revision Actions
              </h3>
            </div>
            <span className="text-xs text-indigo-300 font-mono">
              Direct Timestamp Jumps
            </span>
          </div>

          <p className="text-xs text-slate-400">
            PRISM mapped your defense gaps to exact moments in the lecture material. Jump straight to these segments to clear up misconceptions:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {revisionLinks.map((rev, idx) => {
              const targetUrl = rev.action_url || `/learn/${courseId}?t=${rev.playback_sec || 0}`;

              return (
                <Link
                  key={idx}
                  href={targetUrl}
                  className="group rounded-lg border border-slate-800 bg-slate-900/70 p-3.5 hover:border-indigo-500/70 hover:bg-indigo-950/20 transition-all flex flex-col justify-between space-y-2 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {rev.concept_tag}
                      </span>
                      <span className="font-mono text-[11px] text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-950/50 border border-indigo-800/40">
                        {rev.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {rev.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium pt-2 border-t border-slate-800/60 group-hover:text-indigo-300">
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Jump to Lecture Moment</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform ml-auto" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
