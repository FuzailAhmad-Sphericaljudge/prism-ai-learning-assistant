"use client";

import React from "react";
import Link from "next/link";
import { ConceptMastery } from "@/lib/api-types";
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Video,
  FileText,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface ConceptMasteryGridProps {
  concepts: ConceptMastery[];
  courseId?: string;
}

export function ConceptMasteryGrid({
  concepts,
  courseId = "00000000-0000-0000-0000-000000000002",
}: ConceptMasteryGridProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "demonstrated":
        return {
          label: "Demonstrated",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
          barColor: "bg-emerald-400",
        };
      case "improving":
        return {
          label: "Improving",
          icon: <TrendingUp className="w-3.5 h-3.5 text-amber-400" />,
          color: "bg-amber-500/10 text-amber-300 border-amber-500/30",
          barColor: "bg-amber-400",
        };
      case "gap_found":
        return {
          label: "Gap Found",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
          color: "bg-rose-500/10 text-rose-300 border-rose-500/30",
          barColor: "bg-rose-400",
        };
      default:
        return {
          label: "Not Assessed",
          icon: <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />,
          color: "bg-zinc-800 text-zinc-400 border-white/5",
          barColor: "bg-zinc-700",
        };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {concepts.map((concept) => {
        const badge = getStatusBadge(concept.status);
        const isAssessed = concept.status !== "not_assessed";
        const scorePercent = Math.round(concept.mastery_score * 100);

        return (
          <div
            key={concept.concept_tag}
            className={`rounded-2xl border p-5 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:border-white/20 ${
              concept.status === "gap_found"
                ? "bg-rose-950/10 border-rose-500/20"
                : concept.status === "demonstrated"
                ? "bg-emerald-950/10 border-emerald-500/20"
                : "bg-zinc-950/60 border-white/10"
            }`}
          >
            {/* Top row: Concept Title & Status Badge */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-zinc-100 text-base leading-snug">
                  {concept.concept_tag}
                </h4>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${badge.color}`}
                >
                  {badge.icon}
                  <span>{badge.label}</span>
                </span>
              </div>

              {/* Progress Bar & Numeric Metric */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500 font-medium">Assessed Mastery</span>
                  <span className="text-zinc-200 font-mono font-semibold">
                    {isAssessed ? `${scorePercent}%` : "No data"}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${badge.barColor}`}
                    style={{ width: isAssessed ? `${Math.max(scorePercent, 5)}%` : "0%" }}
                  />
                </div>
              </div>

              {/* Attempt Stats */}
              <div className="text-xs text-zinc-400 flex items-center justify-between pt-1">
                <span>Attempts:</span>
                <span className="font-mono text-zinc-300">
                  {concept.attempts_count > 0
                    ? `${concept.correct_count}/${concept.attempts_count} correct`
                    : "0 attempts"}
                </span>
              </div>

              {/* Active Misconceptions Alert */}
              {concept.misconceptions?.length > 0 && (
                <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/20 text-[11px] text-rose-300 space-y-1">
                  <span className="font-semibold block">Detected Misconceptions:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-zinc-300">
                    {concept.misconceptions.map((m, idx) => (
                      <li key={idx} className="truncate">
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Evidence Landmarks */}
              {concept.evidence_landmarks?.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1.5">
                    Lecture Evidence Landmarks
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {concept.evidence_landmarks.map((landmark, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-900 border border-white/5 text-zinc-400"
                      >
                        {landmark}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
              <Link
                href={`/practice`}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Practice concept</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {concept.evidence_landmarks?.[0] && (
                <Link
                  href={`/learn/${courseId}`}
                  className="text-xs text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Video className="w-3 h-3 text-cyan-400" />
                  <span>View in Lecture</span>
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
