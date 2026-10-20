"use client";

import React, { useState } from "react";
import { PracticeQuestion, CitationItem } from "@/lib/api-types";
import { BookOpen, Video, FileText, Send, Sparkles, HelpCircle } from "lucide-react";

interface PracticeQuestionCardProps {
  question: PracticeQuestion;
  onSubmit: (userAnswer: string) => void;
  isSubmitting?: boolean;
}

export function PracticeQuestionCard({
  question,
  onSubmit,
  isSubmitting = false,
}: PracticeQuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [shortAnswerText, setShortAnswerText] = useState("");

  const isMcq = question.question_type === "mcq" && !!question.options?.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMcq) {
      if (selectedOption) {
        onSubmit(selectedOption);
      }
    } else {
      if (shortAnswerText.trim().length > 0) {
        onSubmit(shortAnswerText.trim());
      }
    }
  };

  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Background ambient prism glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            {question.concept_tag}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-800/80 text-zinc-400 border border-white/5 uppercase tracking-wider">
            {isMcq ? "Multiple Choice" : "Free Response"}
          </span>
        </div>

        {/* Evidence Links */}
        {question.evidence_links?.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 hidden sm:inline">Grounding:</span>
            {question.evidence_links.map((link, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono bg-zinc-900 border border-white/10 text-zinc-300"
                title={link.quote}
              >
                {link.source_type === "video" ? (
                  <Video className="w-3 h-3 text-cyan-400" />
                ) : (
                  <FileText className="w-3 h-3 text-amber-400" />
                )}
                <span>{link.coordinate}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Question Text */}
      <h3 className="text-lg sm:text-xl font-medium text-zinc-100 leading-relaxed mb-6">
        {question.question_text}
      </h3>

      {/* Interaction Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {isMcq ? (
          <div className="grid grid-cols-1 gap-3">
            {question.options!.map((option, idx) => {
              const letter = optionLetters[idx] || String(idx + 1);
              const isSelected = selectedOption === letter;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setSelectedOption(letter)}
                  className={`w-full flex items-start gap-3.5 p-4 rounded-xl text-left transition-all duration-200 border ${
                    isSelected
                      ? "bg-indigo-500/15 border-indigo-500/60 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                      : "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04] text-zinc-300"
                  } ${isSubmitting ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span
                    className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-mono font-bold shrink-0 transition-colors ${
                      isSelected
                        ? "bg-indigo-500 text-white shadow-sm"
                        : "bg-zinc-800 text-zinc-400 border border-white/10"
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-sm pt-0.5 leading-relaxed">{option}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              rows={4}
              disabled={isSubmitting}
              value={shortAnswerText}
              onChange={(e) => setShortAnswerText(e.target.value)}
              placeholder="Explain the invariant in your own words, citing key algorithmic properties covered in the lecture..."
              className="w-full rounded-xl bg-zinc-900/60 border border-white/10 p-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none font-sans"
            />
            <div className="flex justify-between items-center text-xs text-zinc-500 px-1">
              <span>Ground your answer in verified lecture definitions.</span>
              <span>{shortAnswerText.length} chars</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              (isMcq ? !selectedOption : shortAnswerText.trim().length === 0)
            }
            className="px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Evaluating against Evidence...</span>
              </>
            ) : (
              <>
                <span>Submit Answer</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
