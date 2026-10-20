"use client";

import React from "react";
import { RubricCriterion } from "@/lib/api-types";
import { Award, CheckCircle2, AlertCircle, Clock, ShieldCheck, ChevronRight } from "lucide-react";

interface InterviewRubricSidebarProps {
  rubric: RubricCriterion[];
  currentRound: number;
  maxRounds: number;
  role: string;
}

export function InterviewRubricSidebar({
  rubric,
  currentRound,
  maxRounds,
  role,
}: InterviewRubricSidebarProps) {
  const completedCriteria = rubric.filter((c) => c.score !== undefined && c.score !== null);
  const avgScore =
    completedCriteria.length > 0
      ? Math.round(
          completedCriteria.reduce((sum, c) => sum + (c.score || 0), 0) /
            completedCriteria.length
        )
      : null;

  return (
    <aside className="w-full lg:w-80 border-l border-slate-800 bg-slate-950/70 backdrop-blur-xl flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-slate-200">Defense Rubric</h2>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 font-mono">
            R {currentRound}/{maxRounds}
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-slate-400 truncate" title={role}>
            Role: <span className="text-slate-200 font-medium">{role}</span>
          </p>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500">Live Cumulative:</span>
            {avgScore !== null ? (
              <span
                className={`font-semibold font-mono ${
                  avgScore >= 70 ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {avgScore}%
              </span>
            ) : (
              <span className="text-slate-500 italic">Awaiting R1 response</span>
            )}
          </div>
        </div>
      </div>

      {/* Criteria List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {rubric.map((criterion, idx) => {
          const isEvaluated = criterion.score !== undefined && criterion.score !== null;
          const score = criterion.score ?? 0;
          const isPassing = score >= 70;

          return (
            <div
              key={criterion.id || idx}
              className={`rounded-xl border p-3.5 transition-all duration-300 ${
                isEvaluated
                  ? isPassing
                    ? "border-emerald-800/60 bg-emerald-950/15"
                    : "border-amber-800/60 bg-amber-950/15"
                  : "border-slate-800/80 bg-slate-900/40"
              }`}
            >
              {/* Criterion Title & Score Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-200 leading-snug">
                  {criterion.name}
                </span>
                {isEvaluated ? (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      isPassing
                        ? "text-emerald-300 border-emerald-700/50 bg-emerald-900/40"
                        : "text-amber-300 border-amber-700/50 bg-amber-900/40"
                    }`}
                  >
                    {isPassing ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-amber-400" />
                    )}
                    {Math.round(score)}%
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                    <Clock className="w-2.5 h-2.5" />
                    Pending
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
                {criterion.description}
              </p>

              {/* Justification if evaluated */}
              {isEvaluated && criterion.justification && (
                <div className="mb-2.5 p-2 rounded bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300 leading-normal">
                  <span className="text-indigo-400 font-medium">Evaluation: </span>
                  {criterion.justification}
                </div>
              )}

              {/* Expected points / checkpoints */}
              {criterion.expected_points && criterion.expected_points.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-800/50">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Expected Defense Points
                  </span>
                  <ul className="space-y-1">
                    {criterion.expected_points.map((pt, pIdx) => (
                      <li
                        key={pIdx}
                        className="text-[11px] text-slate-400 flex items-start gap-1.5"
                      >
                        <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Linked Evidence Chips */}
              {criterion.linked_evidence && criterion.linked_evidence.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center gap-1.5 flex-wrap">
                  <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="text-[10px] text-slate-500">Evidence:</span>
                  {criterion.linked_evidence.map((ev, eIdx) => (
                    <span
                      key={eIdx}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/30 text-cyan-300 border border-cyan-800/40"
                    >
                      {ev.id}
                      {ev.timestamp_range && ` (${ev.timestamp_range})`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/30 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Evaluator: Temporal Policy</span>
        <span className="text-emerald-400/80 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Adaptive Scoring
        </span>
      </div>
    </aside>
  );
}
