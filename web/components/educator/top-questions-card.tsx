"use client";

import React from "react";
import Link from "next/link";
import { TopQuestionItem } from "@/lib/api-types";
import {
  HelpCircle,
  PlayCircle,
  ExternalLink,
  MessageSquare,
  Clock,
} from "lucide-react";

interface TopQuestionsCardProps {
  questions: TopQuestionItem[];
  courseId: string;
}

export function TopQuestionsCard({ questions, courseId }: TopQuestionsCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 space-y-5 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-100">
              Most Frequent Learner Inquiries
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Common questions asked during lecture playback, mapped to exact timestamps.
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-indigo-950/40 border border-indigo-800/60 text-indigo-300">
          {questions.length} Hot Questions
        </span>
      </div>

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 space-y-2.5 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {q.concept_tag}
                  </span>
                  <span className="text-xs font-mono text-indigo-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    At {q.playback_coordinate}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-100 leading-snug">
                  &ldquo;{q.question}&rdquo;
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-indigo-300 bg-indigo-950/40 border border-indigo-800/50 px-2 py-0.5 rounded">
                  <MessageSquare className="w-3 h-3" />
                  {q.occurrences}x Asked
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-end">
              <Link
                href={`/learn/${courseId}?t=${q.timestamp_sec}`}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Jump to Moment ({q.playback_coordinate})</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
