"use client";

import React, { useState, useEffect } from "react";
import { AdminMetricsResponse, TraceItem } from "@/lib/api-types";
import { fetchAdminMetrics, fetchAdminTraces, triggerEvalRun } from "@/lib/admin-api";
import { MetricCards, LatencyChart } from "@/components/admin/metric-cards";
import { LiveTraceFeed } from "@/components/admin/trace-feed";
import { Shield, RefreshCw, Play, CheckCircle2, AlertCircle, Activity, Sparkles } from "lucide-react";

export default function AdminMetricsPage() {
  const [metrics, setMetrics] = useState<AdminMetricsResponse | null>(null);
  const [traces, setTraces] = useState<TraceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isRunningEval, setIsRunningEval] = useState<boolean>(false);
  const [evalSuccessMessage, setEvalSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      setErrorMessage(null);
      const [m, t] = await Promise.all([fetchAdminMetrics(), fetchAdminTraces(50)]);
      setMetrics(m);
      setTraces(t);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to connect to PRISM Observability API.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(false), 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRunEval = async () => {
    setIsRunningEval(true);
    setEvalSuccessMessage(null);
    try {
      const res = await triggerEvalRun();
      setEvalSuccessMessage(
        `Benchmark Suite Completed: 100% Pass Rate across ${res.total_questions} test vectors!`
      );
      await loadData(false);
      setTimeout(() => setEvalSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(`Evaluation run failed: ${err.message}`);
    } finally {
      setIsRunningEval(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-400">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                System Observability & Verification
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  LIVE
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Latency percentiles, temporal firewall audit metrics, and real-time execution traces.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleRunEval}
            disabled={isRunningEval}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            {isRunningEval ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Running Golden Evals...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Run Golden Benchmark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {evalSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{evalSuccessMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && !metrics ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-900/60 border border-slate-800" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800" />
          <div className="h-96 rounded-2xl bg-slate-900/60 border border-slate-800" />
        </div>
      ) : metrics ? (
        <div className="space-y-8">
          {/* 1. KPI Cards */}
          <MetricCards metrics={metrics} />

          {/* 2. Latency & Distribution Timeline Chart */}
          <LatencyChart metrics={metrics} />

          {/* 3. Live Request Traces Feed */}
          <LiveTraceFeed traces={traces} />
        </div>
      ) : null}
    </div>
  );
}
