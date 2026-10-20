"use client";

import React from "react";
import Link from "next/link";
import { AttemptSubmitResponse } from "@/lib/api-types";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Video,
  FileText,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface PracticeFeedbackCardProps {
  feedback: AttemptSubmitResponse;
  onNextQuestion: () => void;
  onRetry?: () => void;
  courseId?: string;
}

export function PracticeFeedbackCard({
  feedback,
  onNextQuestion,
  onRetry,
  courseId = "00000000-0000-0000-0000-000000000002",
}: PracticeFeedbackCardProps) {
  const isCorrect = feedback.is_correct;
  const revAction = feedback.revision_action;

  // Build deep link for video timestamp
  const getRevisionHref = () => {
    if (!revAction) return `/learn/${courseId}`;
    if (revAction.timestamp_sec !== undefined && revAction.timestamp_sec !== null) {
      return `/learn/${courseId}?t=${revAction.timestamp_sec}`;
    }
    return `/learn/${courseId}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "demonstrated":
        return {
          label: "Demonstrated",
          color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        };
      case "improving":
        return {
          label: "Improving",
          color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        };
      case "gap_found":
        return {
          label: "Gap Found",
          color: "bg-rose-500/20 text-rose-300 border-rose-500/30",
        };
      default:
        return {
          label: "Not Assessed",
          color: "bg-zinc-800 text-zinc-400 border-white/10",
        };
    }
  };

  const statusInfo = getStatusBadge(feedback.updated_mastery_status);

  return (
    <div
      className={`w-full rounded-2xl border backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300 ${
        isCorrect
          ? "border-emerald-500/30 bg-emerald-950/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
          : "border-rose-500/30 bg-rose-950/20 shadow-[0_0_30px_rgba(244,63,94,0.15)]"
      }`}
    >
      {/* Background glow */}
      <div
        className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
          isCorrect ? "bg-emerald-500/10" : "bg-rose-500/10"
        }`}
      />

      {/* Header Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
              isCorrect
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-white">
              {isCorrect ? "Demonstrated Understanding" : "Misconception Detected"}
            </h4>
            <p className="text-xs text-zinc-400">
              Concept: <span className="text-zinc-200">{feedback.concept_tag}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 hidden sm:inline">Concept Status:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Misconception Diagnostic (if incorrect) */}
      {!isCorrect && feedback.misconception_tag && (
        <div className="mb-5 p-4 rounded-xl bg-rose-950/40 border border-rose-500/20 text-rose-200 text-sm">
          <div className="flex items-center gap-2 font-semibold text-rose-300 mb-1">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Diagnosed Cognitive Fallacy: {feedback.misconception_tag}</span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {feedback.feedback}
          </p>
        </div>
      )}

      {/* Positive Feedback (if correct) */}
      {isCorrect && (
        <div className="mb-5 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-200 text-sm">
          <p className="leading-relaxed font-medium">{feedback.feedback}</p>
        </div>
      )}

      {/* Detailed Grounding Explanation */}
      <div className="mb-6 p-4 rounded-xl bg-zinc-900/60 border border-white/5 space-y-1.5">
        <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
          Verified Lecture Principle
        </span>
        <p className="text-sm text-zinc-200 leading-relaxed">
          {feedback.explanation}
        </p>
      </div>

      {/* Revision Link CTA (Non-negotiable requirement for deep-linking into /learn) */}
      {revAction && (
        <div className="mb-6 p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 shrink-0">
              {revAction.type === "video" ? (
                <Video className="w-4 h-4" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{revAction.label}</p>
              <p className="text-xs text-indigo-300/80">
                Grounding coordinate: {revAction.coordinate}
              </p>
            </div>
          </div>

          <Link
            href={getRevisionHref()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md transition-all shrink-0 cursor-pointer"
          >
            <span>Revise at {revAction.coordinate}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        {onRetry && !isCorrect ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-zinc-300 bg-zinc-900 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={onNextQuestion}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 shadow-[0_0_15px_rgba(139,92,246,0.25)] transition-all cursor-pointer"
        >
          <span>Next Question</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
