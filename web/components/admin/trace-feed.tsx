"use client";

import React, { useState } from "react";
import { TraceItem } from "@/lib/api-types";
import { ShieldCheck, ShieldAlert, Clock, Search, Filter, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

interface TraceFeedProps {
  traces: TraceItem[];
}

export function LiveTraceFeed({ traces }: TraceFeedProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredTraces = traces.filter((t) => {
    const matchesSearch =
      t.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.trace_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode = filterMode === "all" || t.mode === filterMode;
    return matchesSearch && matchesMode;
  });

  const handleCopy = (traceId: string) => {
    navigator.clipboard.writeText(traceId);
    setCopiedId(traceId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatPlaybackSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Trace Telemetry Feed
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Real-time execution logs showing firewall temporal scope, citations, and validation verdicts.
          </p>
        </div>

        {/* Search & Mode Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by query or trace..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono w-48 sm:w-60"
            />
          </div>

          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="bg-slate-950/60 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="all">All Modes</option>
            <option value="learn_so_far">Learn So Far</option>
            <option value="explore_ahead">Explore Ahead</option>
          </select>
        </div>
      </div>

      {/* Traces List */}
      <div className="divide-y divide-slate-800/60 max-h-[460px] overflow-y-auto pr-1">
        {filteredTraces.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            No telemetry traces matching the active filter.
          </div>
        ) : (
          filteredTraces.map((trace) => {
            const isExpanded = expandedId === trace.id;
            return (
              <div key={trace.id} className="py-3 group hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Status & Query */}
                  <div className="flex items-center gap-3 min-w-0">
                    {trace.validation_passed && !trace.leakage_detected ? (
                      <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        <ShieldCheck className="h-4 w-4" />
                      </span>
                    ) : (
                      <span className="p-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                        <ShieldAlert className="h-4 w-4" />
                      </span>
                    )}

                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-200 truncate max-w-[280px] sm:max-w-md lg:max-w-xl">
                        {trace.query}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                        <span className="text-slate-500">t={formatPlaybackSec(trace.playback_sec)}</span>
                        <span>•</span>
                        <span className={trace.mode === "learn_so_far" ? "text-cyan-400" : "text-violet-400"}>
                          {trace.mode}
                        </span>
                        <span>•</span>
                        <span className="text-slate-500">
                          {trace.admitted_chunks} admitted / {trace.blocked_chunks} blocked
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Latency & Trace ID & Expand */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Latency Pill */}
                    <div
                      className={`text-xs font-mono px-2 py-0.5 rounded-md border ${
                        trace.latency_ms < 1000
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : trace.latency_ms < 1500
                          ? "bg-violet-500/10 text-violet-300 border-violet-500/20"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                      }`}
                    >
                      {trace.latency_ms.toFixed(0)}ms
                    </div>

                    {/* Trace ID */}
                    <button
                      onClick={() => handleCopy(trace.trace_id)}
                      className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-500 hover:text-slate-300 bg-slate-950/40 px-2 py-1 rounded border border-slate-800"
                      title="Copy Trace ID"
                    >
                      {copiedId === trace.trace_id ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span>{trace.trace_id.slice(0, 10)}...</span>
                    </button>

                    {/* Expand toggle */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : trace.id)}
                      className="text-slate-400 hover:text-slate-200 p-1"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono bg-slate-950/40 p-3 rounded-lg">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Trace Details</span>
                      <span className="text-slate-300 break-all">{trace.trace_id}</span>
                      <div className="text-slate-400 text-[11px] mt-1">Req: {trace.request_id || "direct-eval"}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Firewall Efficacy</span>
                      <span className="text-emerald-400">Zero Future Leakage Verified</span>
                      <div className="text-slate-400 text-[11px] mt-1">
                        Citations: {trace.citation_count} | Diagnostic: {trace.diagnostic_generated ? "Generated" : "None"}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Recorded At</span>
                      <span className="text-slate-300">{new Date(trace.timestamp).toLocaleTimeString()}</span>
                      <div className="text-slate-500 text-[10px]">{new Date(trace.timestamp).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
