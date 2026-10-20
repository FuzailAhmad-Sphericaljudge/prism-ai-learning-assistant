"use client";

import React from "react";
import Link from "next/link";
import { CriterionReport } from "@/lib/api-types";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Video,
  FileText,
  ExternalLink,
} from "lucide-react";

interface ReportCriterionCardProps {
  criterion: CriterionReport;
  courseId: string;
}

export function ReportCriterionCard({
  criterion,
  courseId,
}: ReportCriterionCardProps) {
  const isPassing = criterion.score >= 70;

  return (
    <div
      className={`rounded-xl border p-5 transition-all duration-200 ${
        isPassing
          ? "border-emerald-800/40 bg-emerald-950/10 hover:border-emerald-700/60"
          : "border-amber-800/40 bg-amber-950/10 hover:border-amber-700/60"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-slate-100 text-sm md:text-base">
              {criterion.name}
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Criterion ID: {criterion.criterion_id} • Weight: {criterion.weight}x
          </span>
        </div>

        {/* Score pill */}
        <div className="text-right shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              isPassing
                ? "text-emerald-300 bg-emerald-950/60 border-emerald-800/80"
                : "text-amber-300 bg-amber-950/60 border-amber-800/80"
            }`}
          >
            {isPassing ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            )}
            {Math.round(criterion.score)}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isPassing
              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
              : "bg-gradient-to-r from-amber-500 to-rose-400"
          }`}
          style={{ width: `${Math.min(100, Math.max(5, criterion.score))}%` }}
        />
      </div>

      {/* Justification */}
      <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed mb-3">
        <span className="font-medium text-indigo-300">Examiner Finding: </span>
        {criterion.justification}
      </div>

      {/* Linked Evidence Landmarks */}
      {criterion.linked_evidence && criterion.linked_evidence.length > 0 && (
        <div className="pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-[11px] text-slate-400">Grounded Course Evidence:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {criterion.linked_evidence.map((ev, idx) => {
              const isVideo = ev.source_type === "video";
              const label =
                ev.coordinate ||
                (ev.page ? `Page ${ev.page}` : ev.evidence_id || `E${idx + 1}`);

              return (
                <Link
                  key={idx}
                  href={`/learn/${courseId}?t=${ev.start_sec || 0}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono border border-cyan-800/50 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/40 hover:text-cyan-200 transition-colors"
                >
                  {isVideo ? (
                    <Video className="w-3 h-3 text-cyan-400" />
                  ) : (
                    <FileText className="w-3 h-3 text-cyan-400" />
                  )}
                  <span>{label}</span>
                  <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-70" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
