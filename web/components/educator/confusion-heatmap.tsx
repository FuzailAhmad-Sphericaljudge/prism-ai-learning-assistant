"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ConfusionHeatmapBucket } from "@/lib/api-types";
import {
  Flame,
  Clock,
  HelpCircle,
  AlertTriangle,
  PlayCircle,
  ExternalLink,
} from "lucide-react";

interface ConfusionHeatmapProps {
  buckets: ConfusionHeatmapBucket[];
  courseId: string;
}

export function ConfusionHeatmap({ buckets, courseId }: ConfusionHeatmapProps) {
  const [hoveredBucket, setHoveredBucket] = useState<ConfusionHeatmapBucket | null>(null);

  const getHeatmapColor = (intensity: number) => {
    if (intensity >= 0.75) {
      return "bg-rose-500 hover:bg-rose-400 shadow-rose-500/50";
    }
    if (intensity >= 0.5) {
      return "bg-orange-500 hover:bg-orange-400 shadow-orange-500/50";
    }
    if (intensity >= 0.25) {
      return "bg-amber-400 hover:bg-amber-300 shadow-amber-400/50";
    }
    if (intensity > 0.05) {
      return "bg-indigo-500/80 hover:bg-indigo-400 shadow-indigo-500/40";
    }
    return "bg-slate-800 hover:bg-slate-700";
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-semibold text-slate-100">
              Lecture Timeline Confusion Heatmap
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time learner friction and misconception density along the video timeline (2-minute intervals).
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-500">Friction Level:</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-indigo-500/80" />
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-400" />
            <span>Elevated</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-500" />
            <span>High Friction</span>
          </div>
        </div>
      </div>

      {/* Heatmap Bar Strip */}
      <div className="space-y-2">
        <div className="grid grid-flow-col auto-cols-fr gap-1.5 h-14 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800/90 items-end">
          {buckets.map((b) => {
            const isHovered = hoveredBucket?.bucket_index === b.bucket_index;
            const barHeightPercent = Math.max(16, Math.round(b.confusion_intensity * 100));

            return (
              <div
                key={b.bucket_index}
                onMouseEnter={() => setHoveredBucket(b)}
                onMouseLeave={() => setHoveredBucket(null)}
                className="relative group h-full flex items-end cursor-pointer"
              >
                <div
                  className={`w-full rounded-md transition-all duration-200 ${getHeatmapColor(
                    b.confusion_intensity
                  )} ${isHovered ? "ring-2 ring-white scale-105 z-10" : ""}`}
                  style={{ height: `${barHeightPercent}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Timeline Axis Markers */}
        <div className="flex justify-between text-[11px] font-mono text-slate-500 px-1">
          <span>00:00</span>
          <span>05:00</span>
          <span>10:00</span>
          <span>15:00</span>
          <span>20:00</span>
          <span>25:00</span>
          <span>30:00</span>
        </div>
      </div>

      {/* Active Bucket Inspector Hover Card */}
      {hoveredBucket ? (
        <div className="p-4 rounded-xl border border-indigo-500/40 bg-indigo-950/20 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-slate-100">
                Window: {hoveredBucket.coordinate_label}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                Topic: {hoveredBucket.most_confused_topic}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                <strong className="text-slate-200">{hoveredBucket.query_count}</strong> Questions Asked
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <strong className="text-slate-200">{hoveredBucket.misconception_count}</strong> Misconceptions Detected
              </span>
              <span className="font-mono text-rose-400 font-semibold">
                Intensity: {Math.round(hoveredBucket.confusion_intensity * 100)}%
              </span>
            </div>
          </div>

          <Link
            href={`/learn/${courseId}?t=${hoveredBucket.start_sec}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-xs font-semibold text-indigo-200 transition-colors shrink-0"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Jump to Video ({hoveredBucket.coordinate_label})</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
      ) : (
        <div className="p-3 rounded-lg border border-slate-800/80 bg-slate-950/40 text-xs text-slate-500 text-center">
          Hover over any timeline segment above to inspect student friction metrics and jump directly to that lecture moment.
        </div>
      )}
    </div>
  );
}
