"use client";

import * as React from "react";
import { ChatMessage, CitationItem, ChatResponse } from "@/lib/api-types";
import { usePlayerStore } from "@/lib/stores/use-player-store";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatSuggestedPrompts } from "@/components/chat/chat-suggested-prompts";
import { ChatComposer } from "@/components/chat/chat-composer";
import { streamChat } from "@/lib/chat-stream-client";

interface ChatTabPanelProps {
  courseId?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "init-1",
    role: "assistant",
    content:
      "Hello! I am your PRISM Socratic learning assistant for **CS 201: Binary Search Trees**.\n\nThe **Temporal Evidence Firewall** is active: I am mathematically restricted from referencing topics, algorithms, or proofs from parts of the lecture you haven't watched yet. Ask me anything about what has been covered so far!",
    created_at: new Date().toISOString(),
    citations: [
      {
        evidence_id: "E1",
        chunk_id: "init-chunk-1",
        source_type: "video",
        coordinate: "00:00 - 02:30",
        quote: "Welcome to CS 201. Today we are exploring Binary Search Trees and their fundamental invariants.",
        start_sec: 0,
        end_sec: 150,
      },
    ],
  },
];

export const ChatTabPanel: React.FC<ChatTabPanelProps> = ({
  courseId = "00000000-0000-0000-0000-000000000002",
}) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [lastQuery, setLastQuery] = React.useState<string>("");

  const streamAbortRef = React.useRef<{ abort: () => void } | null>(null);

  const {
    currentTime,
    firewallMode,
    openEvidenceInspector,
    setFirewallMode,
  } = usePlayerStore();

  const handleAbort = () => {
    if (streamAbortRef.current) {
      streamAbortRef.current.abort();
      streamAbortRef.current = null;
    }
    setIsLoading(false);
    // Mark current streaming message as finished
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
    );
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim() || isLoading) return;

    setHasError(false);
    setLastQuery(text);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp_sec: currentTime,
      created_at: new Date().toISOString(),
    };

    const asstMsgId = `asst-${Date.now()}`;
    const initialAsstMsg: ChatMessage = {
      id: asstMsgId,
      role: "assistant",
      content: "",
      timestamp_sec: currentTime,
      created_at: new Date().toISOString(),
      isStreaming: true,
      citations: [],
    };

    setMessages((prev) => [...prev, userMsg, initialAsstMsg]);
    setIsLoading(true);

    const stream = streamChat(
      {
        query: text,
        course_id: courseId,
        playback_sec: currentTime,
        mode: firewallMode,
      },
      {
        onToken: (token: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === asstMsgId
                ? { ...msg, content: msg.content + token }
                : msg
            )
          );
        },
        onFinal: (response: ChatResponse) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === asstMsgId
                ? {
                    ...msg,
                    content: response.answer || msg.content,
                    citations: response.citations || [],
                    check: response.check,
                    is_not_covered: response.is_not_covered,
                    not_covered_topic: response.not_covered_topic,
                    available_at_sec: response.available_at_sec,
                    isStreaming: false,
                  }
                : msg
            )
          );
          setIsLoading(false);
          streamAbortRef.current = null;
        },
        onError: (err: Error) => {
          console.error("Chat streaming error:", err);
          setHasError(true);
          setIsLoading(false);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === asstMsgId
                ? {
                    ...msg,
                    content:
                      msg.content ||
                      "Sorry, I encountered an issue connecting to the PRISM tutor engine. Please retry.",
                    isStreaming: false,
                  }
                : msg
            )
          );
          streamAbortRef.current = null;
        },
      }
    );

    streamAbortRef.current = stream;
  };

  const handleRetry = () => {
    if (lastQuery) {
      handleSendMessage(lastQuery);
    }
  };

  const handleInspectCitation = (citation: CitationItem) => {
    openEvidenceInspector(citation, lastQuery);
  };

  const handleExploreAhead = () => {
    setFirewallMode("explore_ahead");
    if (lastQuery) {
      // Re-query with explore_ahead mode unlocked
      setTimeout(() => {
        handleSendMessage(lastQuery);
      }, 100);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0E1017]/90 rounded-2xl border border-white/[0.08] backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Messages Scroll Area */}
      <ChatMessageList
        messages={messages}
        isLoading={isLoading}
        onInspectCitation={handleInspectCitation}
        onExploreAhead={handleExploreAhead}
      />

      {/* Suggested Prompts Pill Bar */}
      <ChatSuggestedPrompts onSelectPrompt={(p) => handleSendMessage(p)} />

      {/* Composer Input Form */}
      <ChatComposer
        input={input}
        setInput={setInput}
        onSubmit={handleSendMessage}
        isLoading={isLoading}
        onAbort={handleAbort}
        onRetry={handleRetry}
        hasError={hasError}
      />
    </div>
  );
};
