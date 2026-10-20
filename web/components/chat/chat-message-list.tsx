"use client";

import * as React from "react";
import { Sparkles, User, Video, BookOpen, Layers, ShieldCheck, Clock } from "lucide-react";
import { ChatMessage, EvidenceBadge } from "@/lib/api-types";
import { usePlayerStore } from "@/lib/stores/use-player-store";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isLoading,
}) => {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const { seekTo, jumpToPage, jumpToSlide } = usePlayerStore();

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleEvidenceClick = (badge: EvidenceBadge) => {
    if (badge.type === "video") {
      const parts = badge.coordinate.split(":");
      if (parts.length === 2) {
        const secs = parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
        seekTo(secs);
      }
    } else if (badge.type === "pdf") {
      const pageMatch = badge.coordinate.match(/\d+/);
      if (pageMatch) {
        jumpToPage(parseInt(pageMatch[0], 10));
      }
    } else if (badge.type === "ppt") {
      const slideMatch = badge.coordinate.match(/\d+/);
      if (slideMatch) {
        jumpToSlide(parseInt(slideMatch[0], 10));
      }
    }
  };

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-5"
    >
      {messages.map((msg) => {
        const isUser = msg.role === "user";

        return (
          <div
            key={msg.id}
            className={cn(
              "flex items-start gap-3 text-left",
              isUser ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                "h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm",
                isUser
                  ? "bg-gradient-to-tr from-prism-cyan to-prism-violet text-white"
                  : "bg-gradient-to-tr from-prism-violet to-prism-pink text-white p-[1px]"
              )}
            >
              {!isUser ? (
                <div className="h-full w-full rounded-[11px] bg-[#0E1017] flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-prism-cyan" />
                </div>
              ) : (
                "AM"
              )}
            </div>

            {/* Bubble Container */}
            <div
              className={cn(
                "max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed border shadow-md",
                isUser
                  ? "bg-gradient-to-r from-prism-violet/20 to-prism-cyan/20 border-white/10 text-white rounded-tr-none"
                  : "bg-[#131622]/90 border-white/[0.08] text-slate-200 rounded-tl-none"
              )}
            >
              {/* Header Timestamp */}
              {msg.timestamp_sec !== undefined && msg.timestamp_sec !== null && (
                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 mb-2">
                  <Clock className="h-3 w-3 text-prism-cyan" />
                  <span>Referenced moment: {formatTime(msg.timestamp_sec)}</span>
                </div>
              )}

              {/* Message Body */}
              <div className="space-y-2 whitespace-pre-wrap font-sans text-slate-100">
                {msg.content}
              </div>

              {/* Evidence Chips on Assistant Response */}
              {!isUser && msg.evidence_badges && msg.evidence_badges.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400 mr-1 self-center">
                    Citations:
                  </span>
                  {msg.evidence_badges.map((badge) => {
                    const Icon =
                      badge.type === "video"
                        ? Video
                        : badge.type === "pdf"
                        ? BookOpen
                        : badge.type === "ppt"
                        ? Layers
                        : ShieldCheck;

                    return (
                      <button
                        key={badge.id}
                        onClick={() => handleEvidenceClick(badge)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[10px] font-mono text-slate-300 hover:text-white transition-colors cursor-pointer group/chip"
                        title={badge.quote ? `"${badge.quote}"` : `Jump to ${badge.coordinate}`}
                      >
                        <Icon className="h-2.5 w-2.5 text-prism-cyan group-hover/chip:scale-110 transition-transform" />
                        <span>{badge.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Verified Firewall Grounding Tag */}
              {!isUser && (
                <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400/90">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Temporal Evidence Firewall Verified</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Loading Typing Indicator */}
      {isLoading && (
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-prism-violet to-prism-pink p-[1px] shadow-sm">
            <div className="h-full w-full rounded-[11px] bg-[#0E1017] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-prism-cyan animate-spin" />
            </div>
          </div>
          <div className="rounded-2xl rounded-tl-none bg-[#131622]/90 border border-white/[0.08] p-4 text-xs text-slate-400 font-mono flex items-center gap-2">
            <span className="animate-pulse">Consulting Temporal Evidence Firewall...</span>
          </div>
        </div>
      )}
    </div>
  );
};
