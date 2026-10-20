"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { EducatorKpiStrip } from "@/components/educator/educator-kpi-strip";
import { ConfusionHeatmap } from "@/components/educator/confusion-heatmap";
import { TopMisconceptionsCard } from "@/components/educator/top-misconceptions-card";
import { TopQuestionsCard } from "@/components/educator/top-questions-card";
import { fetchEducatorInsights, getEducatorCsvExportUrl } from "@/lib/educator-api";
import { EducatorInsightsResponse } from "@/lib/api-types";
import {
  Download,
  Flame,
  Layers,
  GraduationCap,
  RefreshCw,
  AlertCircle,
  BarChart2,
  CheckCircle2,
} from "lucide-react";

const COURSE_ID = "00000000-0000-0000-0000-000000000002";

export default function EducatorDashboardPage() {
  const [data, setData] = useState<EducatorInsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const loadInsights = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const resp = await fetchEducatorInsights(COURSE_ID);
      setData(resp);
    } catch (err: any) {
      console.error("Failed to load educator insights:", err);
      setErrorMessage(
        err?.message || "Failed to load educator analytics. Ensure backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      const url = getEducatorCsvExportUrl(COURSE_ID);
      window.open(url, "_blank");
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  return (
    <AppShell activeNav="educator">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8 animate-fade-in">
        {/* Top Header Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-rose-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-rose-500/30 bg-rose-500/10 text-rose-300">
                <Flame className="w-3.5 h-3.5" />
                <span>Pedagogical Diagnostics & Cohort Telemetry</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-100">
                Educator Insights & Friction Heatmap
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                Identify where students experience confusion during lectures, examine recurring misconceptions, and target office hours to moments of highest friction.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={loadInsights}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`}
                />
                <span>Refresh Telemetry</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-950 disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Analytics CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="rounded-xl border border-rose-800/80 bg-rose-950/30 p-4 text-xs text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={loadInsights}
              className="text-rose-200 hover:text-white underline text-[11px]"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !data && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-xl bg-slate-900/50 border border-slate-800 animate-pulse"
                />
              ))}
            </div>
            <div className="h-64 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
          </div>
        )}

        {/* Main Content */}
        {data && (
          <>
            {/* KPI Metrics Strip */}
            <EducatorKpiStrip
              activeStudents={data.active_students}
              totalQuestions={data.total_questions_asked}
              totalAttempts={data.total_practice_attempts}
              totalInterviews={data.total_interviews}
              avgMastery={data.avg_course_mastery_percentage}
            />

            {/* Video Timeline Confusion Heatmap */}
            <ConfusionHeatmap
              buckets={data.confusion_heatmap}
              courseId={data.course_id}
            />

            {/* 2-Column Misconceptions vs Top Questions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopMisconceptionsCard
                misconceptions={data.top_misconceptions}
                courseId={data.course_id}
              />
              <TopQuestionsCard
                questions={data.top_questions}
                courseId={data.course_id}
              />
            </div>

            {/* Cohort Concept Mastery Breakdown Table */}
            {data.concept_distributions && data.concept_distributions.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-purple-400" />
                      <h2 className="text-base font-semibold text-slate-100">
                        Cohort Concept Mastery Distribution
                      </h2>
                    </div>
                    <p className="text-xs text-slate-400">
                      Formative breakdown across taxonomy topics assessed during practice and oral examinations.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-3 px-4 font-semibold">Concept Topic</th>
                        <th className="py-3 px-4 font-semibold">Average Mastery</th>
                        <th className="py-3 px-4 font-semibold text-emerald-400">Demonstrated</th>
                        <th className="py-3 px-4 font-semibold text-cyan-400">Improving</th>
                        <th className="py-3 px-4 font-semibold text-rose-400">Gap Found</th>
                        <th className="py-3 px-4 font-semibold text-slate-500">Unassessed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {data.concept_distributions.map((dist, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 font-sans font-medium text-slate-200">
                            {dist.concept_tag}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`font-bold ${
                                dist.average_score >= 70
                                  ? "text-emerald-400"
                                  : "text-amber-400"
                              }`}
                            >
                              {Math.round(dist.average_score)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-emerald-300">
                            {dist.demonstrated_count}
                          </td>
                          <td className="py-3 px-4 text-cyan-300">
                            {dist.improving_count}
                          </td>
                          <td className="py-3 px-4 text-rose-300">
                            {dist.gap_count}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {dist.unassessed_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
