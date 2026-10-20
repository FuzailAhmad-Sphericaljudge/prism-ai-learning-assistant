"use client";

import * as React from "react";
import { BookOpen, Copy, Check, Search, Hash, ShieldCheck, ChevronRight } from "lucide-react";

export const NotesViewer: React.FC = () => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [filterQuery, setFilterQuery] = React.useState<string>("");

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sections = [
    { id: "sec-1", title: "1. Motivation: Dynamic Ordered Sets" },
    { id: "sec-2", title: "2. The BST Property & Monotonicity" },
    { id: "sec-3", title: "3. Search & Insertion Algorithms" },
    { id: "sec-4", title: "4. Min, Max & Successor (18:42)" },
    { id: "sec-5", title: "5. Deletion Algorithm (3 Cases)" },
    { id: "sec-6", title: "6. Tree Degeneracy & Self-Balancing" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#07080D]/90 text-white rounded-xl border border-white/[0.08] overflow-hidden">
      {/* Top Bar with Search and Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0B0D14] border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-prism-cyan" />
          <span className="text-xs font-semibold text-white">Lecture Notes</span>
          <span className="text-[11px] font-mono text-slate-400">&bull; CS 201 Fall 2026</span>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-36 sm:w-48 pl-8 pr-2.5 py-1 text-xs rounded-lg bg-black/40 border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-prism-cyan/50"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-8 max-w-4xl mx-auto w-full">
        {/* Table of contents quick jumps */}
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Hash className="h-3 w-3" /> Jumps:
          </span>
          {sections.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className="text-xs px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-prism-cyan/15 hover:text-prism-cyan text-slate-300 transition-colors"
            >
              {sec.title}
            </a>
          ))}
        </div>

        {/* Section 1 */}
        <section id="sec-1" className="space-y-4 pt-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-2">
            <span className="text-prism-cyan font-mono text-sm">01.</span>
            Motivation: The Dynamic Ordered Set Problem
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            In computer systems and database design, we frequently require a data structure that maintains a dynamic collection of keys under three core operations:
            <code className="mx-1 px-1.5 py-0.5 rounded bg-black/40 text-prism-cyan font-mono text-xs">Search(k)</code>,
            <code className="mx-1 px-1.5 py-0.5 rounded bg-black/40 text-prism-violet font-mono text-xs">Insert(k)</code>, and
            <code className="mx-1 px-1.5 py-0.5 rounded bg-black/40 text-prism-pink font-mono text-xs">Delete(k)</code>.
          </p>

          <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-black/30">
            <table className="w-full text-xs text-left">
              <thead className="bg-white/[0.04] text-slate-400 font-mono border-b border-white/[0.08]">
                <tr>
                  <th className="p-3">Data Structure</th>
                  <th className="p-3">Search</th>
                  <th className="p-3">Insert</th>
                  <th className="p-3">Delete</th>
                  <th className="p-3">In-Order Traversal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-slate-300 font-mono">
                <tr>
                  <td className="p-3 font-semibold text-white">Unsorted Array</td>
                  <td className="p-3 text-red-400">O(N)</td>
                  <td className="p-3 text-emerald-400">O(1)</td>
                  <td className="p-3 text-red-400">O(N)</td>
                  <td className="p-3">O(N log N)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Sorted Array</td>
                  <td className="p-3 text-emerald-400">O(log N)</td>
                  <td className="p-3 text-red-400">O(N)</td>
                  <td className="p-3 text-red-400">O(N)</td>
                  <td className="p-3 text-emerald-400">O(N)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Linked List</td>
                  <td className="p-3 text-red-400">O(N)</td>
                  <td className="p-3 text-emerald-400">O(1)</td>
                  <td className="p-3 text-red-400">O(N)</td>
                  <td className="p-3">O(N log N)</td>
                </tr>
                <tr className="bg-prism-cyan/5">
                  <td className="p-3 font-semibold text-prism-cyan">Balanced BST</td>
                  <td className="p-3 text-emerald-400">O(log N)</td>
                  <td className="p-3 text-emerald-400">O(log N)</td>
                  <td className="p-3 text-emerald-400">O(log N)</td>
                  <td className="p-3 text-emerald-400">O(N)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2 */}
        <section id="sec-2" className="space-y-4 pt-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-2">
            <span className="text-prism-violet font-mono text-sm">02.</span>
            The Binary Search Tree Property & Monotonicity
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            A <strong>Binary Search Tree (BST)</strong> is an organized binary tree where each node x satisfies the strict invariant:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-300 pl-2">
            <li>If y is in the left subtree of x, then <span className="font-mono text-prism-cyan">key(y) &lt; key(x)</span>.</li>
            <li>If y is in the right subtree of x, then <span className="font-mono text-prism-cyan">key(y) &ge; key(x)</span>.</li>
          </ul>

          <div className="p-3.5 rounded-xl bg-prism-violet/10 border border-prism-violet/30 text-xs sm:text-sm text-slate-200">
            <strong className="text-prism-violet">Crucial Invariant Scope:</strong> This condition must hold across <em>all descendants</em> in the subtrees, not merely between a node and its direct immediate children.
          </div>
        </section>

        {/* Section 3 */}
        <section id="sec-3" className="space-y-4 pt-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-2">
            <span className="text-prism-pink font-mono text-sm">03.</span>
            Search & Insertion Algorithms
          </h2>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>tree_search(x, k) &mdash; O(h) Time Complexity</span>
              <button
                onClick={() => handleCopy("search-code", `def tree_search(x, k):\n    while x is not None and k != x.key:\n        if k < x.key:\n            x = x.left\n        else:\n            x = x.right\n    return x`)}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                {copiedId === "search-code" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedId === "search-code" ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-black/60 border border-white/[0.08] font-mono text-xs text-slate-200 overflow-x-auto">
{`def tree_search(x, k):
    while x is not None and k != x.key:
        if k < x.key:
            x = x.left
        else:
            x = x.right
    return x`}
            </pre>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>tree_insert(T, z) &mdash; O(h) Time Complexity</span>
              <button
                onClick={() => handleCopy("insert-code", `def tree_insert(T, z):\n    y = None\n    x = T.root\n    while x is not None:\n        y = x\n        if z.key < x.key:\n            x = x.left\n        else:\n            x = x.right\n    z.parent = y\n    if y is None:\n        T.root = z\n    elif z.key < y.key:\n        y.left = z\n    else:\n        y.right = z`)}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                {copiedId === "insert-code" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedId === "insert-code" ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-black/60 border border-white/[0.08] font-mono text-xs text-slate-200 overflow-x-auto">
{`def tree_insert(T, z):
    y = None
    x = T.root
    while x is not None:
        y = x
        if z.key < x.key:
            x = x.left
        else:
            x = x.right
    z.parent = y
    if y is None:
        T.root = z
    elif z.key < y.key:
        y.left = z
    else:
        y.right = z`}
            </pre>
          </div>
        </section>

        {/* Section 4 */}
        <section id="sec-4" className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="text-prism-amber font-mono text-sm">04.</span>
              Order Statistics: Min, Max & Successor
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-prism-amber/20 border border-prism-amber/30 text-[10px] font-mono text-prism-amber">
              Lecture ends at 18:42
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The in-order successor of node x is the node with the smallest key strictly greater than x.key.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-prism-cyan mb-1.5">
                Case 1: Right Subtree Exists
              </h3>
              <p className="text-xs text-slate-300">
                The successor is simply <code className="text-white font-mono bg-black/40 px-1 py-0.5 rounded">tree_minimum(x.right)</code>. Follow left pointers until reaching the leftmost node.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-prism-amber mb-1.5">
                Case 2: Right Subtree Empty
              </h3>
              <p className="text-xs text-slate-300">
                The successor is the lowest ancestor of x whose left child is also an ancestor of x. Trace parent pointers upward.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section id="sec-5" className="space-y-4 pt-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-2">
            <span className="text-slate-400 font-mono text-sm">05.</span>
            Deletion Algorithm (3 Structural Cases)
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-300">
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06]">
              <strong className="text-white">Case 1 (Leaf Node):</strong> Nullify parent pointer to z. Cost: O(1).
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06]">
              <strong className="text-white">Case 2 (Single Child):</strong> Splice z out by directly linking parent(z) to child(z). Cost: O(1).
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06]">
              <strong className="text-white">Case 3 (Two Children):</strong> Find z&apos;s successor y = tree_minimum(z.right). Splice y out from its original location and substitute y into z&apos;s place. Cost: O(h).
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section id="sec-6" className="space-y-4 pt-2 pb-6">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-2">
            <span className="text-prism-cyan font-mono text-sm">06.</span>
            Tree Degeneracy & Self-Balancing
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            When keys are inserted in monotonic sorted sequence (e.g. 1, 2, 3, 4, 5), each new node attaches as a right child. The tree degrades into a linear linked list of height h = N - 1, causing operations to regress to O(N).
          </p>
          <div className="p-4 rounded-xl bg-gradient-to-r from-prism-violet/10 to-prism-cyan/10 border border-white/[0.08] text-xs text-slate-200">
            Self-balancing trees such as <strong>AVL Trees</strong> and <strong>Red-Black Trees</strong> enforce bounded height invariants via local O(1) tree rotations, securing O(log N) worst-case bounds.
          </div>
        </section>
      </div>
    </div>
  );
};
