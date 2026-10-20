"use client";

import * as React from "react";
import { ChatMessage, CitationItem } from "@/lib/api-types";
import { ChatMessageBubble } from "./chat-message-bubble";
import { usePlayerStore } from "@/lib/stores/use-player-store";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  onInspectCitation?: (citation: CitationItem) => void;
  onExploreAhead?: () => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isLoading,
  onInspectCitation,
  onExploreAhead,
}) => {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const currentTime = usePlayerStore((s) => s.currentTime);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-5 scroll-smooth"
    >
      {messages.map((msg) => (
        <ChatMessageBubble
          key={msg.id}
          message={msg}
          onInspectCitation={onInspectCitation}
          onExploreAhead={onExploreAhead}
          currentPlaybackSec={currentTime}
        />
      ))}
    </div>
  );
};
