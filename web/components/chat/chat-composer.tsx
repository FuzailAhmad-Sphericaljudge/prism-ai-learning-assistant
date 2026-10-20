"use client";

import * as React from "react";
import { Send, Sparkles, Lock, Compass, CornerDownLeft } from "lucide-react";
import { usePlayerStore } from "@/lib/stores/use-player-store";
import { formatTime } from "@/lib/utils";

interface ChatComposerProps {
  input: string;
  setInput: (val: string) => void;
  onSubmit: (text: string) => void;
  isLoading?: boolean;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  input,
  setInput,
  onSubmit,
  isLoading = false,
}) => {
  const { currentTime, duration, firewallMode, pauseAndSnapshot } = usePlayerStore();
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    const textToSend = input.trim();
    setInput("");
    onSubmit(textToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSnapMoment = () => {
    const time = pauseAndSnapshot();
    const prompt = `What is the core takeaway explained at ${formatTime(time)}?`;
    setInput(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="p-3 border-t border-white/[0.08] bg-[#0A0C14]">
      {/* Context Badge Strip */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          {firewallMode === "learn_so_far" ? (
            <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/[0.08] border border-emerald-500/20 px-2 py-0.5 rounded-md">
              <Lock className="h-2.5 w-2.5" />
              <span>Grounded up to {formatTime(currentTime)}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-prism-pink bg-prism-pink/[0.08] border border-prism-pink/20 px-2 py-0.5 rounded-md">
              <Compass className="h-2.5 w-2.5" />
              <span>Unconstrained context</span>
            </span>
          )}
        </div>

        <button
          onClick={handleSnapMoment}
          type="button"
          className="text-[10px] font-mono text-slate-400 hover:text-prism-cyan flex items-center gap-1 transition-colors"
          title="Pause video and stamp current timestamp"
        >
          <Sparkles className="h-3 w-3 text-prism-cyan" />
          <span>Stamp {formatTime(currentTime)}</span>
        </button>
      </div>

      {/* Input Box Form */}
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question grounded in the lecture so far..."
          rows={2}
          className="flex-1 resize-none rounded-xl bg-white/[0.04] border border-white/[0.08] p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-prism-cyan/50 focus:ring-1 focus:ring-prism-cyan/50 transition-all font-sans"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="h-10 w-10 rounded-xl bg-gradient-to-tr from-prism-cyan via-prism-violet to-prism-pink hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white shadow-prism-glow transition-all flex-shrink-0"
          title="Send message (Enter)"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 mt-1.5 font-mono">
        <span>Enter to send • Shift+Enter for newline</span>
        <span>Temporal Firewall Active</span>
      </div>
    </div>
  );
};
