"use client";

import * as React from "react";
import { Sparkles, User, ShieldCheck } from "lucide-react";
import { ChatMessage, CitationItem } from "@/lib/api-types";
import { MarkdownRenderer } from "./markdown-renderer";
import { DiagnosticCheckCard } from "./diagnostic-check-card";
import { NotCoveredYetCard } from "./not-covered-yet-card";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onInspectCitation?: (citation: CitationItem) => void;
  onExploreAhead?: () => void;
  currentPlaybackSec?: number;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  onInspectCitation,
  onExploreAhead,
  currentPlaybackSec,
}) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-3 text-left w-full group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-sm transition-transform duration-200 group-hover:scale-105",
          isUser
            ? "bg-muted border-border text-muted-foreground"
            : "bg-gradient-to-br from-indigo-500/20 via-cyan-500/20 to-emerald-500/20 border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Bubble Container */}
      <div className={cn("flex flex-col max-w-[85%]", isUser ? "items-end" : "items-start")}>
        {/* Author & Timestamp */}
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[11px] font-medium text-muted-foreground">
            {isUser ? "You" : "PRISM Tutor"}
          </span>
          {message.timestamp_sec !== undefined && message.timestamp_sec !== null && (
            <span className="font-mono text-[10px] text-muted-foreground/60">
              at {formatTime(message.timestamp_sec)}
            </span>
          )}
          {!isUser && !message.is_not_covered && (
            <span className="text-[10px] text-emerald-400/90 inline-flex items-center gap-0.5">
              <ShieldCheck className="w-2.5 h-2.5" /> Admitted
            </span>
          )}
        </div>

        {/* Message Body */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed border transition-all",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm border-primary/20 shadow-sm"
              : "bg-card/70 backdrop-blur-md text-card-foreground rounded-tl-sm border-border/70 shadow-md"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div>
              <MarkdownRenderer
                content={message.content}
                citations={message.citations}
                onInspectCitation={onInspectCitation}
              />

              {/* Streaming Cursor */}
              {message.isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-cyan-400 animate-pulse ml-1 align-middle rounded-sm" />
              )}

              {/* Not Covered Yet Guard Card */}
              {message.is_not_covered && (
                <NotCoveredYetCard
                  topic={message.not_covered_topic}
                  availableAtSec={message.available_at_sec}
                  currentPlaybackSec={currentPlaybackSec}
                  onExploreAhead={onExploreAhead}
                />
              )}

              {/* Diagnostic Understanding Check */}
              {message.check && !message.isStreaming && (
                <DiagnosticCheckCard check={message.check} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
