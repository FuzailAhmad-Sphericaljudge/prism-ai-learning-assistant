"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  InterviewExchangeTranscript,
  TurnEvaluation,
} from "@/lib/api-types";
import { InterviewSpeechInput } from "./interview-speech-input";
import {
  Clock,
  HelpCircle,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface InterviewChatProps {
  role: string;
  topic: string;
  currentRound: number;
  maxRounds: number;
  history: InterviewExchangeTranscript[];
  currentQuestion: string;
  currentJustification?: string | null;
  latestEvaluation?: TurnEvaluation | null;
  isSubmitting: boolean;
  isCompleted: boolean;
  onSubmitAnswer: (answer: string) => void;
  onViewReport: () => void;
}

export function InterviewChat({
  role,
  topic,
  currentRound,
  maxRounds,
  history,
  currentQuestion,
  currentJustification,
  latestEvaluation,
  isSubmitting,
  isCompleted,
  onSubmitAnswer,
  onViewReport,
}: InterviewChatProps) {
  const [inputAnswer, setInputAnswer] = useState("");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [expandedJustifications, setExpandedJustifications] = useState<Record<number, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Timer: count up elapsed interview seconds
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  // Auto-scroll on new questions or replies
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, currentQuestion, isSubmitting]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSend = () => {
    if (!inputAnswer.trim() || isSubmitting || isCompleted) return;
    const text = inputAnswer;
    setInputAnswer("");
    onSubmitAnswer(text);
  };

  const toggleJustification = (roundIndex: number) => {
    setExpandedJustifications((prev) => ({
      ...prev,
      [roundIndex]: !prev[roundIndex],
    }));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/40 relative overflow-hidden">
      {/* Top Session Bar with Timer & Status */}
      <div className="px-6 py-3.5 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              {role}
            </h2>
            <p className="text-xs text-slate-400 truncate max-w-md">{topic}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Elapsed Timer */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formatTimer(elapsedSec)}</span>
          </div>

          {/* Round Tag */}
          <div className="px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-indigo-300 text-xs font-mono font-medium">
            Round {isCompleted ? maxRounds : currentRound} of {maxRounds}
          </div>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* Course Alignment Intro Card */}
        <div className="p-4 rounded-xl border border-indigo-900/40 bg-indigo-950/20 text-xs text-indigo-300/90 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-indigo-200">Autonomous Oral Defense Active: </span>
            Your responses will be evaluated against real lecture evidence. The examiner generates justified follow-up questions tailored to any gaps detected in prior answers.
          </div>
        </div>

        {/* Prior Rounds History */}
        {history.map((exchange, idx) => (
          <div key={idx} className="space-y-4">
            {/* Examiner Question */}
            <div className="flex items-start gap-3 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-950">
                <Bot className="w-4 h-4" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">
                    Examiner (Round {exchange.round})
                  </span>
                  {exchange.justification && (
                    <button
                      type="button"
                      onClick={() => toggleJustification(exchange.round)}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 hover:text-purple-200 hover:border-purple-500/60 transition-colors"
                      title="Why this specific follow-up was chosen"
                    >
                      <HelpCircle className="w-3 h-3 text-purple-400" />
                      <span>Why this question?</span>
                      {expandedJustifications[exchange.round] ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                {/* Justification Accordion Panel */}
                {exchange.justification && expandedJustifications[exchange.round] && (
                  <div className="p-3 rounded-lg border border-purple-800/60 bg-purple-950/30 text-xs text-purple-200 animate-fade-in space-y-1">
                    <span className="font-medium text-purple-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      Adaptive Probe Justification:
                    </span>
                    <p className="text-[11px] text-purple-300/80 leading-relaxed">
                      {exchange.justification}
                    </p>
                  </div>
                )}

                <div className="p-4 rounded-2xl rounded-tl-sm bg-slate-900/80 border border-slate-800 text-sm text-slate-100 shadow-md leading-relaxed">
                  {exchange.question}
                </div>
              </div>
            </div>

            {/* Candidate User Answer */}
            <div className="flex items-start gap-3 justify-end max-w-3xl ml-auto">
              <div className="space-y-2 flex-1 text-right">
                <span className="text-xs font-semibold text-slate-400">
                  You (Candidate)
                </span>
                <div className="p-4 rounded-2xl rounded-tr-sm bg-indigo-600/20 border border-indigo-500/40 text-sm text-slate-100 shadow-md text-left leading-relaxed">
                  {exchange.answer}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                <User className="w-4 h-4" />
              </div>
            </div>

            {/* Turn Evaluation Summary */}
            {exchange.evaluation && (
              <div className="max-w-2xl mx-auto rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">
                    Rubric Evaluation: {exchange.evaluation.criterion_name}
                  </span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                      exchange.evaluation.score >= 70
                        ? "text-emerald-300 bg-emerald-950/60 border border-emerald-800/60"
                        : "text-amber-300 bg-amber-950/60 border border-amber-800/60"
                    }`}
                  >
                    Score: {Math.round(exchange.evaluation.score)}%
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {exchange.evaluation.justification}
                </p>

                {exchange.evaluation.missed_points &&
                  exchange.evaluation.missed_points.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/60 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-amber-400/90 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Gaps Flagged for Follow-up Probe:
                      </span>
                      <ul className="space-y-0.5">
                        {exchange.evaluation.missed_points.map((mp, mIdx) => (
                          <li
                            key={mIdx}
                            className="text-[11px] text-slate-400 flex items-center gap-1.5"
                          >
                            <span className="text-amber-400">•</span>
                            <span>{mp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </div>
        ))}

        {/* Current Active Question (if not completed) */}
        {!isCompleted && currentQuestion && (
          <div className="flex items-start gap-3 max-w-3xl animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-950">
              <Bot className="w-4 h-4" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">
                  Examiner (Round {currentRound})
                </span>
                {currentJustification && (
                  <div
                    className="group relative inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 cursor-help"
                    title={currentJustification}
                  >
                    <HelpCircle className="w-3 h-3 text-purple-400" />
                    <span>Why this question?</span>
                    {/* Tooltip Hover */}
                    <div className="absolute left-0 bottom-full mb-2 w-72 p-2.5 rounded-lg bg-slate-900 border border-purple-500/40 text-[11px] text-slate-200 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20">
                      <span className="font-semibold text-purple-300 block mb-1">
                        Adaptive Follow-up Reason:
                      </span>
                      {currentJustification}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl rounded-tl-sm bg-slate-900/80 border border-slate-800 text-sm text-slate-100 shadow-md leading-relaxed">
                {currentQuestion}
              </div>
            </div>
          </div>
        )}

        {/* Evaluation Progress Indicator */}
        {isSubmitting && (
          <div className="flex items-center gap-3 max-w-md p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 animate-pulse">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Evaluating oral defense against course rubric & compiling adaptive probe...</span>
          </div>
        )}

        {/* Completion Card */}
        {isCompleted && (
          <div className="p-6 rounded-2xl border border-emerald-800/80 bg-emerald-950/20 backdrop-blur-xl text-center space-y-4 max-w-xl mx-auto shadow-2xl animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-900/40 border border-emerald-700/60 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-100">
                Oral Defense Completed
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All {maxRounds} rounds evaluated. PRISM has synthesized your comprehensive defense audit report with criterion scores, conceptual strengths, gaps, and lecture timestamps for revision.
              </p>
            </div>
            <button
              type="button"
              onClick={onViewReport}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-950 cursor-pointer"
            >
              <span>View Defense Audit Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer Strip */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/70 backdrop-blur-xl">
        <InterviewSpeechInput
          value={inputAnswer}
          onChange={setInputAnswer}
          onSubmit={handleSend}
          disabled={isSubmitting || isCompleted}
          placeholder={
            isCompleted
              ? "Defense session complete. View your audit report above."
              : `State your answer for Round ${currentRound} (e.g. explain pointer mechanics or complexity proofs)...`
          }
        />
      </div>
    </div>
  );
}
