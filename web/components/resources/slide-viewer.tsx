"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Layers, FileText, User } from "lucide-react";
import { usePlayerStore } from "@/lib/stores/use-player-store";

const SLIDES_CONTENT = [
  {
    slide: 1,
    title: "CS 201: Binary Search Trees",
    subtitle: "Lecture 14 | Foundations of Hierarchical Data Structures",
    points: [
      "Instructor: Dr. Elena Rostova",
      "Term: Fall 2026",
      "Core focus: dynamic ordered sets and worst-case bounds.",
    ],
    notes: "Welcome students to lecture 14. Emphasize that binary search trees bridge the gap between fast search and fast dynamic updates.",
  },
  {
    slide: 2,
    title: "Motivation: The Dynamic Search Dilemma",
    subtitle: "Why We Need Hierarchical Trees",
    points: [
      "Unsorted Array: O(1) insert at tail, but O(N) linear search.",
      "Sorted Array: O(log N) binary search, but O(N) insertion/deletion due to element shifting.",
      "Linked List: O(1) pointer updates, but O(N) sequential search.",
      "The Goal: O(log N) search and O(log N) updates simultaneously.",
    ],
    notes: "Walk through the trade-off matrix. Set up the challenge of dynamic ordered sets.",
  },
  {
    slide: 3,
    title: "The Binary Search Tree Property",
    subtitle: "Subtree Ordering Invariant",
    points: [
      "For any node y in left subtree of x: key(y) < key(x)",
      "For any node y in right subtree of x: key(y) >= key(x)",
      "Universal Scope: This condition spans all descendant subtrees, not just direct children!",
    ],
    notes: "Warn against the classic misconception where a grand-child violates the root property while satisfying its immediate parent.",
  },
  {
    slide: 4,
    title: "In-Order Traversal & Tree Sort",
    subtitle: "Monotonicity Invariant Proof",
    points: [
      "InOrder(x): Visit left subtree, print x.key, visit right subtree.",
      "Theorem: In-order traversal visits keys in monotonically non-decreasing order.",
      "Complexity: Theta(N) visiting each node exactly once.",
    ],
    notes: "Review induction proof over tree height. Show that in-order traversal yields sorted output without extra comparisons.",
  },
  {
    slide: 5,
    title: "Search & Insertion Algorithms",
    subtitle: "Single-Path Descent",
    points: [
      "Search(x, k): Discards half the tree at each level (Cost: O(h)).",
      "Insert(T, z): Traces search path with trailing pointer y (Cost: O(h)).",
      "Both operations touch at most h + 1 nodes from root to leaf.",
    ],
    notes: "Stress that search and insert trace a single path from root to leaf, touching at most h+1 nodes.",
  },
  {
    slide: 6,
    title: "Order Statistics: Min, Max & Successor",
    subtitle: "Concludes at 18:42 in Lecture",
    points: [
      "Tree-Minimum(x): Follow left pointers until null.",
      "Successor(x): Smallest key strictly greater than x.key.",
      "Case 1 (Right child exists): Tree-Minimum(x.right).",
      "Case 2 (No right child): Lowest ancestor whose left child is an ancestor of x.",
    ],
    notes: "Walk through both cases. Highlight the 18:42 timestamp mark where predecessor/successor discussion concludes.",
  },
  {
    slide: 7,
    title: "Deletion: The 3 Structural Cases",
    subtitle: "Introduced after 18:42",
    points: [
      "Case 1: z is a leaf -> nullify parent pointer (O(1)).",
      "Case 2: z has single child -> link parent to child (O(1)).",
      "Case 3: z has two children -> find successor y, splice y out, replace z with y (O(h)).",
    ],
    notes: "Carefully illustrate Case 3 successor substitution. Reassure students that successor in right subtree has no left child.",
  },
  {
    slide: 8,
    title: "Complexity & Degenerate Trees",
    subtitle: "Balanced vs Linear Chain",
    points: [
      "Best/Average Case: Height h = O(log N). Operations run in O(log N).",
      "Worst Case: Sorted keys [1..N] create a single linear chain of height N-1.",
      "Consequence: Operations collapse to linear O(N) time.",
    ],
    notes: "Illustrate degenerate right-skewed tree when inserting presorted sequences. Motivate balancing invariants.",
  },
  {
    slide: 9,
    title: "Preview: Self-Balancing Trees",
    subtitle: "Tree Rotations & Height Invariants",
    points: [
      "AVL Trees: Balance factor |h_left - h_right| <= 1.",
      "Red-Black Trees: Color invariants bounding height to <= 2 * log(N+1).",
      "Upcoming: Lecture 15 on dynamic tree rotations.",
    ],
    notes: "Preview next lecture on AVL and Red-Black trees to test firewall boundary leakage.",
  },
];

export const SlideViewer: React.FC = () => {
  const { activeSlide, jumpToSlide } = usePlayerStore();

  const currentIdx = Math.max(0, Math.min(SLIDES_CONTENT.length - 1, activeSlide - 1));
  const currentSlide = SLIDES_CONTENT[currentIdx];

  const handlePrev = () => {
    if (activeSlide > 1) {
      jumpToSlide(activeSlide - 1);
    }
  };

  const handleNext = () => {
    if (activeSlide < SLIDES_CONTENT.length) {
      jumpToSlide(activeSlide + 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0E1017] p-4 overflow-y-auto">
      {/* Slide Navigation Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-prism-violet" />
          <span className="text-xs font-semibold text-white">
            Slide {activeSlide} of {SLIDES_CONTENT.length}
          </span>
        </div>

        {/* Slide Jump Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            disabled={activeSlide <= 1}
            className="p-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors"
            title="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-mono text-xs text-slate-400 px-1">
            {activeSlide} / {SLIDES_CONTENT.length}
          </span>
          <button
            onClick={handleNext}
            disabled={activeSlide >= SLIDES_CONTENT.length}
            className="p-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors"
            title="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Slide Card Canvas */}
      <div className="relative aspect-[16/10] w-full rounded-2xl border border-white/10 bg-gradient-to-br from-[#121422] to-[#0A0B10] p-6 shadow-2xl flex flex-col justify-between mb-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-prism-violet/20 text-prism-violet border border-prism-violet/30">
              Slide {currentSlide.slide}
            </span>
            <span className="text-[10px] font-mono text-slate-500">CS 201 • Fall 2026</span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mb-1">
            {currentSlide.title}
          </h2>
          <h3 className="text-xs font-medium text-prism-cyan mb-4 font-mono">
            {currentSlide.subtitle}
          </h3>

          <ul className="space-y-2">
            {currentSlide.points.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-prism-violet mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed">{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Dr. Elena Rostova</span>
          <span>PRISM Multi-Modal Evidence</span>
        </div>
      </div>

      {/* Presenter Speaker Notes Accordion */}
      {currentSlide.notes && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-left mb-4">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-prism-amber font-semibold mb-1">
            <User className="h-3.5 w-3.5" />
            <span>Speaker Notes:</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic">
            &quot;{currentSlide.notes}&quot;
          </p>
        </div>
      )}

      {/* Slide Thumbnails Jump Bar */}
      <div className="mt-auto pt-3 border-t border-white/[0.08]">
        <span className="text-[10px] font-mono text-slate-400 block mb-2">
          Jump to Slide:
        </span>
        <div className="grid grid-cols-9 gap-1.5">
          {SLIDES_CONTENT.map((s) => (
            <button
              key={s.slide}
              onClick={() => jumpToSlide(s.slide)}
              className={`h-8 rounded-lg font-mono text-xs font-semibold flex items-center justify-center transition-all ${
                activeSlide === s.slide
                  ? "bg-prism-violet text-white shadow-prism-glow scale-105"
                  : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white"
              }`}
            >
              {s.slide}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
