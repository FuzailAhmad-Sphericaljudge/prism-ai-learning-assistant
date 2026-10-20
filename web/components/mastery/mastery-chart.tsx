"use client";

import React, { useState } from "react";
import { ConceptMastery } from "@/lib/api-types";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { BarChart3, Compass, Info } from "lucide-react";

interface MasteryChartProps {
  concepts: ConceptMastery[];
}

export function MasteryChart({ concepts }: MasteryChartProps) {
  const [chartType, setChartType] = useState<"radar" | "bar">("radar");

  // Strictly filter for ASSESSED concepts only as per product invariant
  const assessedConcepts = concepts.filter((c) => c.status !== "not_assessed");

  if (assessedConcepts.length === 0) {
    return (
      <div className="w-full h-80 rounded-2xl border border-white/5 bg-zinc-950/40 p-6 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-500">
          <Compass className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-zinc-300">No Concepts Assessed Yet</p>
        <p className="text-xs text-zinc-500 max-w-sm">
          PRISM charts only plot verified assessment evidence. Complete practice questions to unlock your cognitive mastery profile.
        </p>
      </div>
    );
  }

  const chartData = assessedConcepts.map((c) => ({
    concept: c.concept_tag.length > 16 ? c.concept_tag.slice(0, 14) + "…" : c.concept_tag,
    fullName: c.concept_tag,
    score: Math.round(c.mastery_score * 100),
    status: c.status,
    attempts: c.attempts_count,
    correct: c.correct_count,
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "demonstrated":
        return "#10B981"; // emerald-500
      case "improving":
        return "#F59E0B"; // amber-500
      case "gap_found":
        return "#F43F5E"; // rose-500
      default:
        return "#6366F1"; // indigo-500
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 rounded-xl bg-zinc-900/95 border border-white/15 shadow-xl text-xs space-y-1">
          <p className="font-semibold text-white">{data.fullName}</p>
          <p className="text-indigo-400 font-mono font-medium">
            Assessed Score: {data.score}%
          </p>
          <p className="text-zinc-400">
            Status: <span className="capitalize text-zinc-200">{data.status.replace("_", " ")}</span>
          </p>
          <p className="text-zinc-500 font-mono">
            {data.correct}/{data.attempts} correct attempts
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-xl p-6 shadow-xl flex flex-col justify-between">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-base font-semibold text-white flex items-center gap-2">
            <span>Cognitive Mastery Profile</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Assessed Concepts Only ({assessedConcepts.length})
            </span>
          </h4>
          <p className="text-xs text-zinc-400 mt-0.5">
            Strict empirical derivation from verified practice submissions.
          </p>
        </div>

        {/* Chart View Toggle */}
        <div className="inline-flex rounded-lg bg-zinc-900 p-0.5 border border-white/10">
          <button
            type="button"
            onClick={() => setChartType("radar")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              chartType === "radar"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Radar</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType("bar")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              chartType === "bar"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bar Chart</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 sm:h-80 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "radar" ? (
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid stroke="#27272a" />
              <PolarAngleAxis
                dataKey="concept"
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "#71717a", fontSize: 10 }}
              />
              <Radar
                name="Mastery Score"
                dataKey="score"
                stroke="#8b5cf6"
                fill="#6366f1"
                fillOpacity={0.4}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          ) : (
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
            >
              <XAxis
                dataKey="concept"
                tick={{ fill: "#a1a1aa", fontSize: 10 }}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#71717a", fontSize: 10 }}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getStatusColor(entry.status)}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-white/5 text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Demonstrated (≥ 80%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Improving</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Gap Found</span>
        </div>
      </div>
    </div>
  );
}
