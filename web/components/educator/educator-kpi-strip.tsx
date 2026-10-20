"use client";

import React from "react";
import {
  Users,
  MessageSquare,
  CheckCircle2,
  Award,
  TrendingUp,
  Flame,
} from "lucide-react";

interface EducatorKpiStripProps {
  activeStudents: number;
  totalQuestions: number;
  totalAttempts: number;
  totalInterviews: number;
  avgMastery: number;
}

export function EducatorKpiStrip({
  activeStudents,
  totalQuestions,
  totalAttempts,
  totalInterviews,
  avgMastery,
}: EducatorKpiStripProps) {
  const kpis = [
    {
      label: "Active Cohort Learners",
      value: activeStudents.toString(),
      subtext: "Engaged in past 30 days",
      icon: Users,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      label: "Lecture Queries Asked",
      value: totalQuestions.toString(),
      subtext: "Temporal firewall queries",
      icon: MessageSquare,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      label: "Practice Submissions",
      value: totalAttempts.toString(),
      subtext: "Formative checks graded",
      icon: CheckCircle2,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      label: "Oral Defenses Defended",
      value: totalInterviews.toString(),
      subtext: "Multi-round interviews",
      icon: Award,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Average Cohort Mastery",
      value: `${Math.round(avgMastery)}%`,
      subtext: "Derived assessed mastery",
      icon: TrendingUp,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-4 space-y-2 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                {kpi.label}
              </span>
              <div className={`p-1.5 rounded-lg border ${kpi.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-2xl font-bold font-mono text-slate-100">
              {kpi.value}
            </div>

            <p className="text-[11px] text-slate-500 truncate">
              {kpi.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
