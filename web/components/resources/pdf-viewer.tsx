"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Download, BookOpen, Search } from "lucide-react";
import { usePlayerStore } from "@/lib/stores/use-player-store";

interface PdfPageContent {
  page: number;
  title: string;
  sections: {
    heading: string;
    paragraphs: string[];
    equations?: string[];
    note?: string;
  }[];
}

const PDF_PAGES: PdfPageContent[] = [
  {
    page: 1,
    title: "1. Motivation & Binary Search Tree Property",
    sections: [
      {
        heading: "1.1 The Dynamic Dictionary Problem",
        paragraphs: [
          "Dynamic sets support queries (Search, Minimum, Maximum, Successor, Predecessor) and modifying operations (Insert, Delete).",
          "Arrays offer O(1) random access or O(log N) binary search when sorted, but insertion and deletion demand O(N) element shifts. Unsorted linked lists permit O(1) node splicing once located, yet search requires linear O(N) scanning.",
          "Binary Search Trees (BSTs) synthesize the hierarchical partitioning of binary search with dynamic linked pointers, achieving O(h) operations where h represents tree height.",
        ],
      },
      {
        heading: "1.2 The Binary Search Tree Invariant",
        paragraphs: [
          "Let x be a node in a binary search tree. If y is a node in the left subtree of x, then key(y) <= key(x). If y is a node in the right subtree of x, then key(y) >= key(x).",
          "Crucial Observation: This invariant is recursive and ancestral. Every descendant in the left subtree must remain strictly bounded by key(x), not merely the direct left child.",
        ],
        equations: [
          "\\forall y \\in Subtree_{left}(x): key(y) \\le key(x)",
          "\\forall y \\in Subtree_{right}(x): key(y) \\ge key(x)",
        ],
      },
      {
        heading: "2. In-Order Traversal & Monotonicity",
        paragraphs: [
          "An in-order tree walk systematically prints every key in non-decreasing order.",
          "Algorithm: INORDER(x) { if x != NIL { INORDER(x.left); PRINT(x.key); INORDER(x.right); } }",
          "Theorem: An in-order traversal of a binary search tree with N nodes takes exactly Theta(N) time and outputs elements in sorted order.",
        ],
      },
    ],
  },
  {
    page: 2,
    title: "2. Query Operations: Search, Min/Max & Successor",
    sections: [
      {
        heading: "3. Search & Insertion Algorithms",
        paragraphs: [
          "Searching a key k begins at the root x. If k < x.key, we branch left; if k > x.key, we branch right. The search terminates when k matches x.key or when a NIL reference is reached.",
          "Insertion mirrors search: we descend along a single root-to-leaf trajectory with a trailing parent pointer y. Once the terminal NIL leaf is identified, the new node z is attached as y's left or right child.",
          "Both algorithms visit at most h + 1 vertices, achieving strict O(h) time complexity.",
        ],
      },
      {
        heading: "4. Successor & Predecessor Invariants",
        paragraphs: [
          "The successor of node x is the node with the smallest key strictly greater than key(x).",
          "Case A (Right Subtree Exists): The successor is the minimum node in x's right subtree, found by following left pointers from x.right.",
          "Case B (No Right Subtree): The successor is the lowest ancestor of x whose left child is also an ancestor of x.",
        ],
        note: "Temporal Milestone: In the reference lecture, discussion of predecessor and successor terminates precisely at 18:42 before deletion is introduced.",
      },
    ],
  },
  {
    page: 3,
    title: "3. Deletion, Degeneracy & Self-Balancing",
    sections: [
      {
        heading: "5. The Deletion Algorithm (3 Cases)",
        paragraphs: [
          "Case 1 (Leaf Node): If node z has no children, modify parent(z) to reference NIL. Takes O(1) pointer updates.",
          "Case 2 (Single Child): If node z has exactly one child c, elevate c to take z's position in parent(z). Takes O(1) pointer updates.",
          "Case 3 (Two Children): Find z's successor y in its right subtree. Splice y out from its original location (y has at most one child: its right child), then substitute y into z's place.",
        ],
      },
      {
        heading: "6. Degenerate Trees & Asymptotic Analysis",
        paragraphs: [
          "On randomly constructed BSTs, expected height h is O(log N).",
          "However, if keys arrive in sorted order (e.g. 10, 20, 30, 40, 50), each insertion appends to the right, collapsing the tree into an O(N) linear linked list.",
          "Under degenerate topologies, search, insertion, and deletion degrade to catastrophic O(N) worst-case time.",
        ],
      },
      {
        heading: "7. Preview: Self-Balancing Search Trees",
        paragraphs: [
          "To guarantee O(log N) operations regardless of insertion sequence, self-balancing trees enforce height balance invariants via tree rotations.",
          "AVL Trees maintain |h(left) - h(right)| <= 1 at every vertex.",
          "Red-Black Trees enforce color properties guaranteeing that the longest path is at most twice the length of the shortest path.",
        ],
      },
    ],
  },
];

export const PdfViewer: React.FC = () => {
  const activePdfPage = usePlayerStore((s) => s.activePdfPage);
  const setActivePdfPage = usePlayerStore((s) => s.setActivePdfPage);
  const [zoomLevel, setZoomLevel] = React.useState<number>(100);
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const currentPage = Math.min(Math.max(activePdfPage, 1), PDF_PAGES.length);
  const currentContent = PDF_PAGES[currentPage - 1];

  const handlePrev = () => {
    if (currentPage > 1) {
      setActivePdfPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < PDF_PAGES.length) {
      setActivePdfPage(currentPage + 1);
    }
  };

  const zoomIn = () => setZoomLevel((z) => Math.min(z + 15, 145));
  const zoomOut = () => setZoomLevel((z) => Math.max(z - 15, 75));
  const resetZoom = () => setZoomLevel(100);

  return (
    <div className="flex flex-col h-full bg-[#07080D]/90 text-white rounded-xl border border-white/[0.08] overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0B0D14] border-b border-white/[0.08]">
        {/* Page navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md hover:bg-white/[0.08] disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1 text-xs font-mono px-2 py-1 rounded bg-black/40 border border-white/[0.06]">
            <span className="text-white font-semibold">{currentPage}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{PDF_PAGES.length}</span>
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage === PDF_PAGES.length}
            className="p-1.5 rounded-md hover:bg-white/[0.08] disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 transition-colors"
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Quick jump pills */}
          <div className="hidden sm:flex items-center gap-1 ml-2">
            {PDF_PAGES.map((p) => (
              <button
                key={p.page}
                onClick={() => setActivePdfPage(p.page)}
                className={`px-2 py-0.5 text-xs rounded font-mono transition-colors ${
                  currentPage === p.page
                    ? "bg-prism-cyan/20 border border-prism-cyan/40 text-prism-cyan font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                P{p.page}
              </button>
            ))}
          </div>
        </div>

        {/* Zoom & Document Info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/40 border border-white/[0.06] rounded-md px-1.5 py-0.5">
            <button
              onClick={zoomOut}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs font-mono text-slate-300 min-w-[3rem] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={zoomIn}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={resetZoom}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded transition-colors ml-0.5"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>

          <a
            href="/demo-data/cs201_bst_handout.pdf"
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] rounded-md transition-colors"
            title="Download PDF Handout"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </a>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#04060A]/80 custom-scrollbar flex justify-center">
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
          className="transition-transform duration-150 w-full max-w-2xl bg-[#0E111A] border border-white/[0.1] rounded-xl shadow-2xl p-6 sm:p-8 space-y-6"
        >
          {/* Handout Header */}
          <div className="border-b border-white/[0.08] pb-4">
            <div className="flex items-center justify-between text-xs font-mono text-prism-cyan/80 mb-1">
              <span>CS 201: ALGORITHMS & DATA STRUCTURES</span>
              <span>PAGE {currentPage} OF {PDF_PAGES.length}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {currentContent.title}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Course Reference Handout &bull; Lecture 14: Binary Search Trees
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {currentContent.sections.map((sec, idx) => (
              <div key={idx} className="space-y-2.5">
                <h2 className="text-sm font-semibold text-prism-violet flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-prism-violet" />
                  {sec.heading}
                </h2>

                <div className="space-y-2">
                  {sec.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>

                {sec.equations && sec.equations.length > 0 && (
                  <div className="p-3 rounded-lg bg-black/60 border border-white/[0.08] font-mono text-xs sm:text-sm text-prism-cyan space-y-1">
                    {sec.equations.map((eq, eqIdx) => (
                      <div key={eqIdx} className="text-center py-0.5">
                        {eq}
                      </div>
                    ))}
                  </div>
                )}

                {sec.note && (
                  <div className="p-3 rounded-lg bg-prism-amber/10 border border-prism-amber/30 text-xs text-prism-amber leading-relaxed flex items-start gap-2">
                    <span className="font-bold uppercase tracking-wider text-[10px] mt-0.5 px-1 rounded bg-prism-amber/20 border border-prism-amber/30">
                      Firewall Note
                    </span>
                    <span>{sec.note}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer of PDF page */}
          <div className="border-t border-white/[0.06] pt-4 mt-8 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>DEPARTMENT OF COMPUTER SCIENCE</span>
            <span>PRISM VERIFIED HANDOUT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
