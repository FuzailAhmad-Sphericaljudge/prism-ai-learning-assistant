"use client";

import React from "react";
import { AdminMetricsResponse } from "@/lib/api-types";
import { ShieldCheck, Zap, AlertTriangle, Clock, Activity, CheckCircle2 } from "lucide-react";

interface MetricCardsProps {
  metrics: AdminMetricsResponse;
}

export function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Validation Pass Rate */}
      <div className="relative group overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-900/70 backdrop-blur-xl p-5 shadow-lg shadow-emerald-500/5 transition-all hover:border-emerald-500/50">
        <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400/90 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Validation Pass Rate
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            STRICT
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {metrics.validation_pass_rate.toFixed(1)}%
          </span>
          <span className="text-xs text-slate-400 font-medium">zero ungrounded claims</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>All citations strictly admitted & verified</span>
        </div>
      </div>

      {/* 2. Firewall Leakage Rate */}
      <div className="relative group overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-900/70 backdrop-blur-xl p-5 shadow-lg shadow-cyan-500/5 transition-all hover:border-cyan-500/50">
        <div className="absolute top-0 right-0 h-24 w-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400/90 flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-cyan-400" />
            Firewall Leak Rate
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            0.00% TARGET
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {metrics.firewall_leak_rate.toFixed(2)}%
          </span>
          <span className="text-xs text-emerald-400 font-medium">Guaranteed</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Future concepts blocked before generation</span>
        </div>
      </div>

      {/* 3. Latency Percentiles */}
      <div className="relative group overflow-hidden rounded-2xl border border-violet-500/30 bg-slate-900/70 backdrop-blur-xl p-5 shadow-lg shadow-violet-500/5 transition-all hover:border-violet-500/50">
        <div className="absolute top-0 right-0 h-24 w-24 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-violet-400/90 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-violet-400" />
            p50 / p95 Latency
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20">
            P50: {metrics.p50_latency_ms.toFixed(0)}ms
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {metrics.p95_latency_ms.toFixed(0)}
          </span>
          <span className="text-sm text-slate-400 font-mono">ms (p95)</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>mean: {metrics.mean_latency_ms.toFixed(0)}ms</span>
          <span>p99: {metrics.p99_latency_ms.toFixed(0)}ms</span>
        </div>
      </div>

      {/* 4. Total Queries Evaluated */}
      <div className="relative group overflow-hidden rounded-2xl border border-amber-500/30 bg-slate-900/70 backdrop-blur-xl p-5 shadow-lg shadow-amber-500/5 transition-all hover:border-amber-500/50">
        <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-amber-400/90 flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-amber-400" />
            Total Queries
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
            ACTIVE
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {metrics.total_queries}
          </span>
          <span className="text-xs text-slate-400 font-medium">benchmarked</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span className="text-cyan-300 font-mono">Learn So Far: {metrics.learn_so_far_count}</span>
          <span className="text-violet-300 font-mono">Explore: {metrics.explore_ahead_count}</span>
        </div>
      </div>
    </div>
  );
}

export function LatencyChart({ metrics }: MetricCardsProps) {
  const maxBucketCount = Math.max(...metrics.latency_distribution.map((d) => d.count), 1);
  const maxTimelineLatency = Math.max(...metrics.recent_timeline.map((t) => t.latency_ms), 1500);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Latency Distribution Breakdown */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl">
        <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          Latency Distribution
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Histogram of request durations across retrieval, firewall & LLM generation.
        </p>

        <div className="mt-6 space-y-3">
          {metrics.latency_distribution.map((item) => {
            const pct = Math.round((item.count / maxBucketCount) * 100);
            return (
              <div key={item.bucket} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-mono">{item.bucket}</span>
                  <span className="text-slate-400 font-mono font-medium">{item.count} queries</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Latency Sparkline / Timeline */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase flex items-center gap-2">
                <Clock className="h-4 w-4 text-violet-400" />
                Response Latency Timeline
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Temporal trace history showing response duration (ms) for the last 30 queries.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Valid (100%)
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-violet-400" />
                Latency (ms)
              </span>
            </div>
          </div>

          {/* SVG Latency Curve */}
          <div className="mt-6 h-40 w-full relative flex items-end gap-1.5 pt-4">
            {metrics.recent_timeline.map((point, idx) => {
              const heightPct = Math.min(100, Math.max(12, Math.round((point.latency_ms / maxTimelineLatency) * 100)));
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                    <div className="bg-slate-950 border border-slate-700 text-[11px] rounded-lg p-2 shadow-2xl whitespace-nowrap font-mono text-slate-200">
                      <div className="text-cyan-400 font-semibold">{point.latency_ms.toFixed(0)} ms</div>
                      <div className="text-slate-400 truncate max-w-[200px]">{point.query}</div>
                      <div className="text-[10px] text-slate-500">t={point.playback_sec}s • {point.mode}</div>
                    </div>
                    <div className="w-2 h-2 bg-slate-950 border-r border-b border-slate-700 rotate-45 -mt-1" />
                  </div>

                  <div
                    className="w-full rounded-t-sm bg-gradient-to-t from-violet-600/40 via-cyan-500/60 to-cyan-400 transition-all duration-300 group-hover:from-violet-500 group-hover:to-cyan-300"
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Older</span>
          <span>Target Budget: &lt;1,500ms</span>
          <span>Most Recent</span>
        </div>
      </div>
    </div>
  );
}
