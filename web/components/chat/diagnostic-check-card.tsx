"use client";

import * as React from "react";
import { CheckCircle2, XCircle, Sparkles, RefreshCw, HelpCircle } from "lucide-react";
import { DiagnosticCheck } from "@/lib/api-types";
import { cn } from "@/lib/utils";

interface DiagnosticCheckCardProps {
  check: DiagnosticCheck;
  className?: string;
}

export const DiagnosticCheckCard: React.FC<DiagnosticCheckCardProps> = ({
  check,
  className,
}) => {
  const [selectedIdx, setSelectedIdx] = React.useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSelect = (idx: number) => {
    if (isSubmitted) return;
    setSelectedIdx(idx);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setSelectedIdx(null);
    setIsSubmitted(false);
  };

  const isCorrect = selectedIdx === check.correct_index;

  return (
    <div
      className={cn(
        "mt-4 rounded-xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 to-card/60 p-4 shadow-lg backdrop-blur-sm transition-all duration-200",
        isSubmitted && isCorrect && "border-emerald-500/40 from-emerald-950/20",
        isSubmitted && !isCorrect && "border-rose-500/40 from-rose-950/20",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Understanding Check
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Test your grasp of this moment
            </p>
          </div>
        </div>

        {isSubmitted && (
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors px-2 py-0.5 rounded border border-border/40 bg-muted/30"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            <span>Retry</span>
          </button>
        )}
      </div>

      {/* Question */}
      <p className="text-sm font-medium text-foreground mb-3 leading-snug">
        {check.question}
      </p>

      {/* Options */}
      <div className="space-y-2">
        {check.options.map((opt, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isCurrentSelected = selectedIdx === idx;
          const isTargetCorrect = idx === check.correct_index;

          let btnStyle = "border-border/60 bg-muted/20 hover:border-indigo-500/40 hover:bg-muted/40 text-foreground/80";

          if (isSubmitted) {
            if (isTargetCorrect) {
              btnStyle = "border-emerald-500 bg-emerald-950/40 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.2)]";
            } else if (isCurrentSelected) {
              btnStyle = "border-rose-500 bg-rose-950/40 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.2)]";
            } else {
              btnStyle = "border-border/30 bg-muted/10 opacity-50 text-muted-foreground";
            }
          }

          return (
            <button
              key={`opt-${idx}`}
              type="button"
              disabled={isSubmitted}
              onClick={() => handleSelect(idx)}
              className={cn(
                "w-full text-left rounded-lg p-2.5 text-xs border transition-all flex items-start gap-2.5 group cursor-pointer",
                btnStyle
              )}
            >
              <span
                className={cn(
                  "font-mono font-bold text-[11px] px-1.5 py-0.5 rounded border shrink-0 transition-colors",
                  isSubmitted && isTargetCorrect
                    ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                    : isSubmitted && isCurrentSelected
                    ? "border-rose-400 bg-rose-500/20 text-rose-300"
                    : "border-border bg-background/50 text-muted-foreground group-hover:border-indigo-400 group-hover:text-indigo-300"
                )}
              >
                {letter}
              </span>
              <span className="flex-1 leading-relaxed pt-0.5">{opt}</span>
              {isSubmitted && isTargetCorrect && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              {isSubmitted && isCurrentSelected && !isTargetCorrect && (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Feedback */}
      {isSubmitted && (
        <div
          className={cn(
            "mt-3 pt-3 border-t text-xs leading-relaxed animate-in fade-in duration-200",
            isCorrect
              ? "border-emerald-500/30 text-emerald-300/90"
              : "border-rose-500/30 text-foreground/80"
          )}
        >
          <div className="flex items-start gap-1.5 font-medium mb-1">
            {isCorrect ? (
              <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Spot on!
              </span>
            ) : (
              <span className="text-rose-400 font-semibold inline-flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                Not quite.
              </span>
            )}
          </div>
          <p className="text-muted-foreground pl-5">{check.explanation}</p>
        </div>
      )}
    </div>
  );
};
