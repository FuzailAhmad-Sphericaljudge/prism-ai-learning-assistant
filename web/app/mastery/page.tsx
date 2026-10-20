"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app/app-shell";
import { ConceptMasteryGrid } from "@/components/mastery/concept-mastery-grid";
import { NextBestActionCard } from "@/components/mastery/next-best-action-card";
import { MasteryEvidenceTimeline } from "@/components/mastery/mastery-evidence-timeline";
import { MasteryChart } from "@/components/mastery/mastery-chart";
import { MasteryEmptyState } from "@/components/mastery/mastery-empty-state";
import { fetchMasteryDashboard, fetchMasteryTimeline } from "@/lib/practice-api";
import {
  MasteryDashboardResponse,
  MasteryTimelineResponse,
} from "@/lib/api-types";
import {
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

const COURSE_ID = "00000000-0000-0000-0000-000000000002";
const USER_ID = "00000000-0000-0000-0000-000000000001";

export default function MasteryDashboardPage() {
  const [dashboard, setDashboard] = useState<MasteryDashboardResponse | null>(null);
  const [timeline, setTimeline] = useState<MasteryTimelineResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, timeRes] = await Promise.all([
        fetchMasteryDashboard(COURSE_ID, USER_ID),
        fetchMasteryTimeline(COURSE_ID, USER_ID),
      ]);
      setDashboard(dashRes);
      setTimeline(timeRes);
    } catch (err) {
      console.error("Failed to load mastery data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const hasAssessedConcepts = dashboard && dashboard.assessed_concepts > 0;

  return (
    <AppShell activeNav="mastery" courseTitle="CS 201: Binary Search Trees & Balanced Structures">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 w-full space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300 mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Verified Longitudinal Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Concept Mastery Dashboard
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Rigorous, formulaic mastery derived strictly from problem-solving attempts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-300 text-xs font-medium transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/practice"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 shadow-[0_0_15px_rgba(139,92,246,0.25)] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Practice Questions</span>
            </Link>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && !dashboard ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-xs text-zinc-400 font-mono">
              Computing derived mastery formula across assessed attempts...
            </p>
          </div>
        ) : !hasAssessedConcepts ? (
          <MasteryEmptyState courseId={COURSE_ID} />
        ) : (
          <>
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {/* Overall Score */}
              <div className="col-span-2 sm:col-span-1 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 backdrop-blur-md">
                <span className="text-xs font-medium text-indigo-300">Overall Mastery</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    {dashboard?.overall_mastery_percentage}%
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Across {dashboard?.assessed_concepts} assessed concepts
                </p>
              </div>

              {/* Demonstrated */}
              <div className="rounded-2xl border border-emerald-500/20 bg-zinc-950/60 p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Demonstrated</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                  {dashboard?.demonstrated_count}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">≥ 80% with streak</p>
              </div>

              {/* Improving */}
              <div className="rounded-2xl border border-amber-500/20 bg-zinc-950/60 p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Improving</span>
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
                  {dashboard?.improving_count}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Recent positive trend</p>
              </div>

              {/* Gap Found */}
              <div className="rounded-2xl border border-rose-500/20 bg-zinc-950/60 p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Gaps Found</span>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-bold text-rose-400 font-mono mt-1">
                  {dashboard?.gap_count}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Requires remediation</p>
              </div>

              {/* Unassessed */}
              <div className="rounded-2xl border border-white/5 bg-zinc-950/60 p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Unassessed</span>
                  <HelpCircle className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="text-2xl font-bold text-zinc-400 font-mono mt-1">
                  {dashboard?.unassessed_count}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Pending student attempt</p>
              </div>
            </div>

            {/* Next Best Action Banner */}
            <NextBestActionCard action={dashboard?.next_best_action} courseId={COURSE_ID} />

            {/* Visual Analytics Chart (Recharts) */}
            <div className="space-y-3">
              <MasteryChart concepts={dashboard?.concepts || []} />
            </div>

            {/* Detailed Concept Mastery Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    <span>Curricular Concept Breakdown</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Grounded in lecture landmarks and attempt history.
                  </p>
                </div>
              </div>

              <ConceptMasteryGrid concepts={dashboard?.concepts || []} courseId={COURSE_ID} />
            </div>

            {/* Longitudinal Attempt Evidence Timeline */}
            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    <span>Evidence Audit Timeline</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Chronological verification of every student diagnostic and practice attempt.
                  </p>
                </div>

                <span className="text-xs font-mono text-zinc-500">
                  {timeline?.total_attempts || 0} total attempts recorded
                </span>
              </div>

              <MasteryEvidenceTimeline timeline={timeline?.timeline || []} courseId={COURSE_ID} />
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
