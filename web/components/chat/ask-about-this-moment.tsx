"use client";

import * as React from "react";
import { Sparkles, Clock, ArrowRight } from "lucide-react";
import { usePlayerStore } from "@/lib/stores/use-player-store";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AskAboutThisMomentProps {
  className?: string;
  onSelectPrompt?: (promptText: string) => void;
}

export const AskAboutThisMoment: React.FC<AskAboutThisMomentProps> = ({
  className,
  onSelectPrompt,
}) => {
  const { currentTime, pauseAndSnapshot, setActiveRightTab } = usePlayerStore();

  const handleClick = () => {
    const time = pauseAndSnapshot();
    setActiveRightTab("ask");
    if (onSelectPrompt) {
      onSelectPrompt(`Can you explain the key concept being taught at ${formatTime(time)}?`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center justify-between w-full p-2.5 rounded-xl bg-gradient-to-r from-prism-cyan/10 via-prism-violet/10 to-prism-pink/10 hover:from-prism-cyan/20 hover:via-prism-violet/20 hover:to-prism-pink/20 border border-white/10 hover:border-white/20 transition-all duration-200 text-left group",
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-prism-cyan to-prism-violet flex items-center justify-center text-white shadow-sm flex-shrink-0">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div>
          <div className="text-xs font-semibold text-white group-hover:text-prism-cyan transition-colors">
            Ask about this moment
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Pauses playback at {formatTime(currentTime)} and scopes evidence
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 font-mono text-[11px] text-prism-cyan pr-1">
        <span>{formatTime(currentTime)}</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </button>
  );
};
