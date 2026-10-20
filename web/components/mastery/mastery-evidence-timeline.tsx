"use client";

import React from "react";
import Link from "next/link";
import { TimelineAttemptItem } from "@/lib/api-types";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Video,
  FileText,
  ExternalLink,
  Layers,
} from "lucide-react";

interface MasteryEvidenceTimelineProps {
  timeline: TimelineAttemptItem[];
  courseId?: string;
}

export function MasteryEvidenceTimeline({
  timeline,
  courseId = "00000000-0000-0000-0000-000000000002",
}: MasteryEvidenceTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-8 text-center">
        <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
        <p className="text-sm text-zinc-400 font-medium">No practice attempts recorded yet.</p>
        <p className="text-xs text-zinc-500 mt-1">
          Complete practice questions to build your verified mastery audit timeline.
        </p>
      </div>
    );
  }

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500/50 before:via-purple-500/20 before:to-transparent">
      {timeline.map((item, idx) => {
        const isCorrect = item.is_correct;
        const revAction = item.revision_action;

        return (
          <div key={item.id || idx} className="relative group">
            {/* Timeline Node Icon */}
            <div
              className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full flex items-center justify-center border text-xs shadow-md ${
                isCorrect
                  ? "bg-emerald-950 border-emerald-500 text-emerald-400"
                  : "bg-rose-950 border-rose-500 text-rose-400"
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
            </div>

            {/* Content Card */}
            <div className="rounded-xl border border-white/10 bg-zinc-950/70 backdrop-blur-md p-4 sm:p-5 space-y-3 transition-all group-hover:border-white/20">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                    {item.concept_tag}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      isCorrect ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>

                <span className="text-xs font-mono text-zinc-500">
                  {formatTimestamp(item.created_at)}
                </span>
              </div>

              {/* Question & Answer Excerpt */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-200 leading-snug">
                  {item.question_text}
                </p>
                <p className="text-xs text-zinc-400 font-mono">
                  Student Answer: <span className="text-zinc-200">"{item.user_answer}"</span>
                </p>
              </div>

              {/* Misconception Diagnostic Alert */}
              {!isCorrect && item.misconception_tag && (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/20 text-xs text-rose-300 space-y-1">
                  <span className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    Misconception: {item.misconception_tag}
                  </span>
                  <p className="text-zinc-300 leading-relaxed">{item.feedback}</p>
                </div>
              )}

              {/* Remediation Jump Link */}
              {revAction && (
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-xs text-zinc-500">
                    Remediation: <span className="text-zinc-300 font-mono">{revAction.coordinate}</span>
                  </span>

                  <Link
                    href={
                      revAction.timestamp_sec !== undefined && revAction.timestamp_sec !== null
                        ? `/learn/${courseId}?t=${revAction.timestamp_sec}`
                        : `/learn/${courseId}`
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    <span>Jump to Lecture moment</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
