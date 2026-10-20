"use client";

import * as React from "react";
import { ChatMessage, EvidenceBadge } from "@/lib/api-types";
import { usePlayerStore } from "@/lib/stores/use-player-store";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatSuggestedPrompts } from "@/components/chat/chat-suggested-prompts";
import { ChatComposer } from "@/components/chat/chat-composer";
import { formatTime } from "@/lib/utils";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "init-1",
    role: "assistant",
    content:
      "Hello Alex! I am your PRISM Socratic learning assistant for CS 201: Binary Search Trees.\n\nThe **Temporal Evidence Firewall** is active: I am mathematically restricted from referencing topics, algorithms, or proofs from parts of the lecture you haven't watched yet. Ask me anything about what Dr. Rostova has covered!",
    created_at: new Date().toISOString(),
    evidence_badges: [
      { id: "ev-1", type: "video", label: "00:00 Intro", coordinate: "00:00" },
      { id: "ev-2", type: "pdf", label: "p. 1 Notes", coordinate: "Page 1" },
    ],
  },
];

export const ChatTabPanel: React.FC = () => {
  const [messages, setMessages] = React.useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const { currentTime, firewallMode } = usePlayerStore();

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp_sec: currentTime,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Simulate Socratic generation grounded with Temporal Evidence Firewall
    setTimeout(() => {
      const lower = text.toLowerCase();
      let responseText = "";
      let evidenceBadges: EvidenceBadge[] = [];

      // Firewall check: if in learn_so_far mode and student asks about deletion before 18:42
      if (
        firewallMode === "learn_so_far" &&
        currentTime < 1122 &&
        (lower.includes("delete") || lower.includes("deletion") || lower.includes("two children"))
      ) {
        responseText = `⚠️ **Temporal Evidence Firewall Redaction**\n\nYou asked about node deletion with two children, but Dr. Rostova does not introduce the deletion algorithm until **18:42** in this lecture.\n\nBased strictly on the content covered up to **${formatTime(
          currentTime
        )}**, we have established the BST invariant and tree search/insertion. Would you like to review how the trailing pointer works during insertion instead? Or toggle to **Explore Ahead** mode to unconstrain future context?`;
        evidenceBadges = [
          { id: "ev-redact", type: "video", label: "18:42 Boundary", coordinate: "18:42" },
        ];
      }
      // Firewall check: asking about AVL or Red-Black trees before 25:30
      else if (
        firewallMode === "learn_so_far" &&
        currentTime < 1530 &&
        (lower.includes("avl") || lower.includes("red-black") || lower.includes("rotation"))
      ) {
        responseText = `⚠️ **Temporal Evidence Firewall Redaction**\n\nSelf-balancing AVL and Red-Black tree rotations are previewed at **25:30** at the conclusion of this lecture. Up to **${formatTime(
          currentTime
        )}**, we are focusing on why standard unbalanced binary search trees can degenerate to O(N) when keys are inserted in sorted order.`;
        evidenceBadges = [
          { id: "ev-rot", type: "video", label: "25:30 Preview", coordinate: "25:30" },
          { id: "ev-rot-p", type: "pdf", label: "p. 3 PDF", coordinate: "Page 3" },
        ];
      }
      // In-scope answer
      else if (lower.includes("invariant") || lower.includes("property")) {
        responseText = `The **Binary Search Tree Property** states that for any node $x$:\n- All keys in $x$'s left subtree must be strictly less than $x.\\text{key}$.\n- All keys in $x$'s right subtree must be greater than or equal to $x.\\text{key}$.\n\nCrucially, this is a **global property** across the entire descendant subtree, not just between a parent and its direct child.`;
        evidenceBadges = [
          { id: "ev-inv-1", type: "video", label: "05:25 Video", coordinate: "05:25" },
          { id: "ev-inv-2", type: "ppt", label: "Slide 3", coordinate: "Slide 3" },
          { id: "ev-inv-3", type: "pdf", label: "p. 1 PDF", coordinate: "Page 1" },
        ];
      } else if (lower.includes("search") || lower.includes("insert") || lower.includes("cost") || lower.includes("complexity")) {
        responseText = `Both Search and Insertion descend a single path from the root to a leaf. At each node, we compare the key and branch either left or right, discarding the opposite subtree.\n\nBecause the path length cannot exceed the tree height $h$, both operations run in **$O(h)$ time**. If the tree is balanced, $h = O(\\log N)$.`;
        evidenceBadges = [
          { id: "ev-sc-1", type: "video", label: "10:25 Video", coordinate: "10:25" },
          { id: "ev-sc-2", type: "ppt", label: "Slide 5", coordinate: "Slide 5" },
        ];
      } else if (lower.includes("successor") || lower.includes("minimum")) {
        responseText = `To find the in-order successor of node $x$:\n1. **Case 1 (Right subtree non-empty):** The successor is simply the minimum node in $x$'s right subtree (\`Tree-Minimum(x.right)\`).\n2. **Case 2 (Right subtree empty):** The successor is the lowest ancestor whose left child is also an ancestor of $x$.`;
        evidenceBadges = [
          { id: "ev-suc-1", type: "video", label: "16:55 Video", coordinate: "16:55" },
          { id: "ev-suc-2", type: "ppt", label: "Slide 6", coordinate: "Slide 6" },
          { id: "ev-suc-3", type: "pdf", label: "p. 2 PDF", coordinate: "Page 2" },
        ];
      } else {
        responseText = `Based strictly on the verified lecture materials covered up to **${formatTime(
          currentTime
        )}**, the principles of hierarchical ordering apply directly.\n\nNotice how the in-order traversal visits all nodes in sorted order because keys in the left subtree are processed prior to the root node.`;
        evidenceBadges = [
          { id: "ev-gen-1", type: "video", label: `${formatTime(currentTime)} Video`, coordinate: formatTime(currentTime) },
          { id: "ev-gen-2", type: "ppt", label: "Slide Deck", coordinate: "Slide 4" },
        ];
      }

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: responseText,
        timestamp_sec: currentTime,
        created_at: new Date().toISOString(),
        evidence_badges: evidenceBadges,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full bg-[#0E1017]/90 rounded-2xl border border-white/[0.08] backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Messages Scroll Area */}
      <ChatMessageList messages={messages} isLoading={isLoading} />

      {/* Suggested Prompts Pill Bar */}
      <ChatSuggestedPrompts onSelectPrompt={(p) => handleSendMessage(p)} />

      {/* Composer Input Form */}
      <ChatComposer
        input={input}
        setInput={setInput}
        onSubmit={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};
