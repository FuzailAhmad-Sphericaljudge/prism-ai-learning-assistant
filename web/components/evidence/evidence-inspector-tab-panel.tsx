"use client";

import * as React from "react";
import { ShieldCheck, Lock, Play, ExternalLink, Sparkles, Filter, CheckCircle2, AlertCircle } from "lucide-react";
import { usePlayerStore } from "@/lib/stores/use-player-store";
import { formatTime } from "@/lib/utils";

interface EvidenceChunk {
  id: string;
  sourceType: "video" | "slide" | "pdf" | "notes";
  title: string;
  location: string;
  timestamp?: number;
  slideNumber?: number;
  pdfPage?: number;
  similarity: number;
  text: string;
  occursAfterCurrent: boolean;
}

const SAMPLE_EVIDENCE_CHUNKS: EvidenceChunk[] = [
  {
    id: "ev-1",
    sourceType: "video",
    title: "Lecture Recording: BST Invariants",
    location: "03:45 - 04:30",
    timestamp: 225,
    similarity: 0.96,
    text: "For any node x, all keys in its left subtree must be strictly less than x.key, and all keys in its right subtree must be greater than or equal to x.key. This condition holds recursively across every descendant.",
    occursAfterCurrent: false,
  },
  {
    id: "ev-2",
    sourceType: "slide",
    title: "Slide 3: Subtree Ordering Invariant",
    location: "Slide 3",
    slideNumber: 3,
    similarity: 0.94,
    text: "Subtree Ordering Invariant: For any node y in left subtree of x: key(y) < key(x). For any node y in right subtree of x: key(y) >= key(x). Universal Scope: All descendant subtrees.",
    occursAfterCurrent: false,
  },
  {
    id: "ev-3",
    sourceType: "pdf",
    title: "Handout: Section 1.2 The Binary Search Tree Invariant",
    location: "Page 1",
    pdfPage: 1,
    similarity: 0.91,
    text: "Crucial Observation: This invariant is recursive and ancestral. Every descendant in the left subtree must remain strictly bounded by key(x), not merely the direct left child.",
    occursAfterCurrent: false,
  },
  {
    id: "ev-4",
    sourceType: "notes",
    title: "Lecture Notes: Section 2 The BST Property",
    location: "Notes Sec 2",
    similarity: 0.89,
    text: "An in-order traversal of a binary search tree visits the stored keys in strictly non-decreasing sorted order. By induction on tree height.",
    occursAfterCurrent: false,
  },
  {
    id: "ev-5",
    sourceType: "video",
    title: "Lecture Recording: Deletion Algorithm Case 3",
    location: "19:15 - 20:30",
    timestamp: 1155,
    similarity: 0.93,
    text: "When deleting node z with two children, replace z with its in-order successor y located in z's right subtree. Splice y out from its original location.",
    occursAfterCurrent: true,
  },
];

export const EvidenceInspectorTabPanel: React.FC = () => {
  const currentTime = usePlayerStore((s) => s.currentTime);
  const firewallMode = usePlayerStore((s) => s.firewallMode);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const setActiveSlide = usePlayerStore((s) => s.setActiveSlide);
  const setActivePdfPage = usePlayerStore((s) => s.setActivePdfPage);
  const setRightTab = usePlayerStore((s) => s.setRightTab);
  const setResourcesSubTab = usePlayerStore((s) => s.setResourcesSubTab);

  const [filterType, setFilterType] = React.useState<string>("all");

  const filteredChunks = SAMPLE_EVIDENCE_CHUNKS.filter((chunk) => {
    if (filterType !== "all" && chunk.sourceType !== filterType) return false;
    return true;
  });

  const handleJumpToSource = (chunk: EvidenceChunk) => {
    if (chunk.sourceType === "video" && chunk.timestamp !== undefined) {
      seekTo(chunk.timestamp);
    } else if (chunk.sourceType === "slide" && chunk.slideNumber !== undefined) {
      setActiveSlide(chunk.slideNumber);
      setRightTab("resources");
      setResourcesSubTab("slides");
    } else if (chunk.sourceType === "pdf" && chunk.pdfPage !== undefined) {
      setActivePdfPage(chunk.pdfPage);
      setRightTab("resources");
      setResourcesSubTab("pdf");
    } else if (chunk.sourceType === "notes") {
      setRightTab("resources");
      setResourcesSubTab("notes");
    }
  };

  const getSourceBadge = (type: EvidenceChunk["sourceType"]) => {
    switch (type) {
      case "video":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-prism-cyan/20 border border-prism-cyan/40 text-prism-cyan">Video</span>;
      case "slide":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-prism-violet/20 border border-prism-violet/40 text-prism-violet">Slide</span>;
      case "pdf":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-prism-pink/20 border border-prism-pink/40 text-prism-pink">PDF</span>;
      case "notes":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-prism-amber/20 border border-prism-amber/40 text-prism-amber">Notes</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0E1017]/90 rounded-2xl border border-white/[0.08] backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#07080D]/80 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold text-white">Evidence Inspector</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-400">
            {filteredChunks.length} Citations
          </span>
        </div>

        {/* Source Filters */}
        <div className="flex items-center gap-1">
          {["all", "video", "slide", "pdf", "notes"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2 py-0.5 text-[11px] rounded font-mono uppercase transition-colors ${
                filterType === t
                  ? "bg-white/[0.1] text-white border border-white/[0.1] font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-prism-cyan/10 border-b border-white/[0.06] text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span>Every claim is grounded in multi-modal vector embeddings (768-dim).</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 font-semibold">100% Grounded</span>
      </div>

      {/* Chunks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {filteredChunks.map((chunk) => {
          const isFirewallRestricted =
            firewallMode === "learn_so_far" &&
            chunk.timestamp !== undefined &&
            chunk.timestamp > currentTime;

          return (
            <div
              key={chunk.id}
              className={`relative rounded-xl border p-4 transition-all ${
                isFirewallRestricted
                  ? "border-red-500/30 bg-red-950/10 opacity-75"
                  : "border-white/[0.08] bg-black/40 hover:border-prism-cyan/30 hover:bg-black/60 shadow-lg"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {getSourceBadge(chunk.sourceType)}
                  <span className="text-xs font-semibold text-white truncate max-w-[200px]">
                    {chunk.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    {Math.round(chunk.similarity * 100)}% match
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {chunk.location}
                  </span>
                </div>
              </div>

              {/* Text Snippet */}
              <p className="text-xs text-slate-300 leading-relaxed mb-3 italic bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04]">
                &ldquo;{chunk.text}&rdquo;
              </p>

              {/* Action / Jump footer */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[11px]">
                  {isFirewallRestricted ? (
                    <span className="flex items-center gap-1 text-red-400 font-mono text-[10px]">
                      <Lock className="h-3 w-3" />
                      Locked by Temporal Firewall (occurs after {formatTime(currentTime)})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified grounded evidence
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleJumpToSource(chunk)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-200 hover:text-white bg-white/[0.06] hover:bg-prism-cyan/20 hover:border-prism-cyan/40 border border-white/[0.08] rounded-md transition-colors"
                >
                  <ExternalLink className="h-3 w-3 text-prism-cyan" />
                  <span>Jump to Source</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
