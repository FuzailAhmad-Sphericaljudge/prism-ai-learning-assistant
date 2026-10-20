"use client";

import * as React from "react";
import { Sparkles, MessageSquare } from "lucide-react";
import { usePlayerStore } from "@/lib/stores/use-player-store";

interface ChatSuggestedPromptsProps {
  onSelectPrompt: (promptText: string) => void;
}

export const ChatSuggestedPrompts: React.FC<ChatSuggestedPromptsProps> = ({
  onSelectPrompt,
}) => {
  const { currentTime, firewallMode } = usePlayerStore();

  const prompts = React.useMemo(() => {
    if (currentTime < 300) {
      return [
        "Why can't binary search run in O(log N) on a linked list?",
        "What trade-off are we trying to solve with a tree?",
        "How is the height h of a tree defined?",
      ];
    } else if (currentTime < 600) {
      return [
        "What is the common misconception with node 8 having child 2?",
        "How does in-order traversal guarantee sorted order?",
        "Why must the BST property hold across the entire subtree?",
      ];
    } else if (currentTime < 900) {
      return [
        "Why does search take O(h) comparisons?",
        "What does the trailing pointer y do during insertion?",
        "Why does inserting 15, 6, 18 produce height 2?",
      ];
    } else if (currentTime < 1122) {
      // 18:42
      return [
        "How do we find the successor if a node has no right subtree?",
        "Why is Tree-Minimum simply following left child pointers?",
        "What happens at the 18:42 mark in the lecture?",
      ];
    } else {
      // 18:42+
      return [
        "Why do we replace with the successor in deletion Case 3?",
        "How does inserting sorted keys degrade a BST to O(N)?",
        "What is the intuition behind tree rotations?",
      ];
    }
  }, [currentTime]);

  return (
    <div className="p-3 border-t border-white/[0.06] bg-black/30">
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mb-2 px-1">
        <Sparkles className="h-3 w-3 text-prism-cyan" />
        <span>Context-Aware Suggested Prompts:</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {prompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(p)}
            className="text-[11px] text-left px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] hover:border-prism-cyan/40 border border-white/[0.06] text-slate-300 hover:text-white transition-all duration-150 line-clamp-1"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};
