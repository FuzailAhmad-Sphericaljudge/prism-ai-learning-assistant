"use client";

import React, { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  passingScore?: number;
}

export function ScoreRing({
  score,
  size = 180,
  strokeWidth = 14,
  label = "Overall Defense Score",
  passingScore = 70,
}: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(Math.min(100, Math.max(0, score)));
    }, 150);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const isPassing = score >= passingScore;

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="prismScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="35%" stopColor="#8b5cf6" />
              <stop offset="70%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="prismWarningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800/80"
            fill="transparent"
          />

          {/* Animated Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isPassing ? "url(#prismScoreGradient)" : "url(#prismWarningGradient)"}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Metrics Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl md:text-4xl font-extrabold font-mono text-slate-100 tracking-tight">
            {Math.round(score)}%
          </span>
          <span
            className={`text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full mt-1 border ${
              isPassing
                ? "text-emerald-400 bg-emerald-950/40 border-emerald-800/50"
                : "text-amber-400 bg-amber-950/40 border-amber-800/50"
            }`}
          >
            {isPassing ? "Passed" : "Revision Needed"}
          </span>
        </div>
      </div>

      <div className="text-center space-y-0.5">
        <h4 className="text-xs font-semibold text-slate-300">{label}</h4>
        <p className="text-[11px] text-slate-500 font-mono">
          Benchmark Threshold: {passingScore}%
        </p>
      </div>
    </div>
  );
}
