"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app/app-shell";
import { ScoreRing } from "@/components/interview/score-ring";
import { ReportCriterionCard } from "@/components/interview/report-criterion-card";
import { ReportStrengthsGaps } from "@/components/interview/report-strengths-gaps";
import { fetchInterviewReport } from "@/lib/interview-api";
import { InterviewReportResponse } from "@/lib/api-types";
import {
  Award,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export default function InterviewReportPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id as string;

  const [report, setReport] = useState<InterviewReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    let isMounted = true;
    async function loadReport() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await fetchInterviewReport(sessionId);
        if (isMounted) {
          setReport(data);
        }
      } catch (err: any) {
        console.error("Failed to load interview report:", err);
        if (isMounted) {
          setErrorMessage(
            err?.message || "Could not retrieve oral defense audit report."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadReport();
    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const formatDate = (isoStr?: string | null) => {
    if (!isoStr) return "Just now";
    try {
      return new Date(isoStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <AppShell activeNav="interview">
      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 animate-fade-in">
        {/* Navigation & Header Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/interview"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Interview Setup</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/interview"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 text-xs font-medium text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Retake Defense</span>
            </Link>
            <Link
              href="/practice"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-xs font-medium text-indigo-200 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
              <span>Practice Gaps</span>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-400">
              Synthesizing oral defense telemetry, rubric checkpoints, and revision links...
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && errorMessage && (
          <div className="rounded-2xl border border-rose-800/80 bg-rose-950/20 p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-semibold text-rose-200">Report Unavailable</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">{errorMessage}</p>
            <button
              type="button"
              onClick={() => router.push("/interview")}
              className="mt-2 px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-200 hover:bg-slate-700"
            >
              Start New Defense Session
            </button>
          </div>
        )}

        {/* Report Content */}
        {!isLoading && report && (
          <>
            {/* Top Overview Hero Card */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-purple-500/40 bg-purple-500/10 text-purple-300">
                      <Award className="w-3.5 h-3.5" />
                      Oral Defense Audit Report
                    </span>
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(report.completed_at || report.created_at)}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
                    {report.role}
                  </h1>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Topic Track: <span className="text-slate-200 font-medium">{report.topic}</span>
                  </p>

                  <div className="flex items-center gap-4 pt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {report.criteria_scores?.length || 0} Rubric Checkpoints
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      {report.transcript?.length || 0} Defense Rounds
                    </span>
                  </div>
                </div>

                {/* Animated Score Ring Visual */}
                <div className="flex justify-center md:justify-end">
                  <ScoreRing
                    score={report.overall_score}
                    passingScore={70}
                    label="Cumulative Defense Score"
                  />
                </div>
              </div>
            </div>

            {/* Strengths & Conceptual Gaps & Revision Links */}
            <ReportStrengthsGaps
              strengths={report.strengths}
              gaps={report.gaps}
              revisionLinks={report.revision_links}
              courseId={report.course_id}
            />

            {/* Rubric Criteria Evaluation Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Criterion-by-Criterion Evaluation Audit
                </h2>
                <span className="text-xs text-slate-500">
                  Passing Threshold: 70% per criterion
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {report.criteria_scores.map((criterion, idx) => (
                  <ReportCriterionCard
                    key={criterion.criterion_id || idx}
                    criterion={criterion}
                    courseId={report.course_id}
                  />
                ))}
              </div>
            </div>

            {/* Complete Defense Transcript Log */}
            {report.transcript && report.transcript.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
                <button
                  type="button"
                  onClick={() => setShowTranscript((prev) => !prev)}
                  className="w-full flex items-center justify-between text-left text-sm font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Complete Defense Conversation Transcript ({report.transcript.length} Rounds)</span>
                  </div>
                  {showTranscript ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {showTranscript && (
                  <div className="space-y-4 pt-4 border-t border-slate-800/80 animate-fade-in">
                    {report.transcript.map((exchange, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="font-semibold text-indigo-400">
                            Round {exchange.round}
                          </span>
                          {exchange.justification && (
                            <span className="text-[11px] text-purple-300 italic">
                              Adaptive probe triggered
                            </span>
                          )}
                        </div>

                        {/* Question */}
                        <div className="space-y-1">
                          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                            Examiner Question:
                          </span>
                          <p className="text-slate-200 leading-relaxed">
                            {exchange.question}
                          </p>
                        </div>

                        {/* Candidate Answer */}
                        <div className="space-y-1">
                          <span className="text-[11px] uppercase tracking-wider text-indigo-400 font-semibold">
                            Your Defense Answer:
                          </span>
                          <p className="text-slate-300 bg-slate-900/60 p-3 rounded border border-slate-800/80 leading-relaxed">
                            {exchange.answer}
                          </p>
                        </div>

                        {/* Evaluation Justification if present */}
                        {exchange.evaluation && (
                          <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">
                              Criterion: <span className="text-slate-200">{exchange.evaluation.criterion_name}</span>
                            </span>
                            <span
                              className={`font-mono font-bold ${
                                exchange.evaluation.score >= 70
                                  ? "text-emerald-400"
                                  : "text-amber-400"
                              }`}
                            >
                              Score: {Math.round(exchange.evaluation.score)}%
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
