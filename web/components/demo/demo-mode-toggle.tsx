"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Terminal, Copy, Check, Clock, X, ChevronRight, Zap } from "lucide-react";

export const DEMO_PRESETS = [
  {
    id: "q1",
    question: "What is an Attention Head?",
    timestamp_sec: 195,
    timestamp_label: "3:15",
    topic: "Attention Projections",
    expected: "Permitted: Q, K, V dot-product similarity scaling",
  },
  {
    id: "q2",
    question: "Why do we divide by the square root of d_k?",
    timestamp_sec: 465,
    timestamp_label: "7:45",
    topic: "Gradient Stabilization",
    expected: "Permitted: Prevents softmax saturation & vanishing gradients",
  },
  {
    id: "q3",
    question: "How does the firewall handle the 18:42 boundary case?",
    timestamp_sec: 1122,
    timestamp_label: "18:42",
    topic: "Boundary Interpolation",
    expected: "Permitted: Word-level sub-second prefix interpolation",
  },
  {
    id: "q4",
    question: "How does node deletion work in an AVL tree?",
    timestamp_sec: 1122,
    timestamp_label: "18:42",
    topic: "Temporal Withholding",
    expected: "Strictly Withheld: Not covered yet; unlocked in Explore Ahead",
  },
  {
    id: "q5",
    question: "Explain Multi-Head Attention vs Single-Head Attention",
    timestamp_sec: 730,
    timestamp_label: "12:10",
    topic: "Subspace Projections",
    expected: "Permitted: Joint representation across distinct subspaces",
  },
  {
    id: "q6",
    question: "How does Cross-Attention differ from Self-Attention?",
    timestamp_sec: 1530,
    timestamp_label: "25:30",
    topic: "Encoder-Decoder Conditioning",
    expected: "Permitted: Decoder Q with Encoder K/V representations",
  },
];

interface DemoModeToggleProps {
  onSelectQuestion?: (question: string, seekSec?: number) => void;
}

export function DemoModeToggle({ onSelectQuestion }: DemoModeToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDemoModeActive, setIsDemoModeActive] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // Read saved preference
    const saved = localStorage.getItem("prism_demo_mode") === "true";
    setIsDemoModeActive(saved);

    // Global keyboard listener: Ctrl+Shift+D or Cmd+Shift+D
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleDemoMode = () => {
    const next = !isDemoModeActive;
    setIsDemoModeActive(next);
    localStorage.setItem("prism_demo_mode", String(next));
  };

  const handleCopyQuestion = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Discrete Floating Trigger (bottom-right) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 p-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 shadow-xl transition-all group"
        title="Open Presenter Demo Palette (Ctrl+Shift+D)"
      >
        <Sparkles className="h-4 w-4" />
        <span className="sr-only">Demo Palette</span>
      </button>

      {/* Demo Palette Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-400">
                  <Terminal className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    Presenter Demo Palette
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      Ctrl + Shift + D
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Deterministic offline-proof evaluation questions & instant time-jumping.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Demo Mode Toggle Status */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDemoModeActive ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">
                    {isDemoModeActive ? "Deterministic Demo Mode ACTIVE" : "Production Mode Active"}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {isDemoModeActive
                      ? "Pre-cached responses enabled with sub-50ms offline resilience"
                      : "Live LLM generation via configured backend provider"}
                  </div>
                </div>
              </div>

              <button
                onClick={toggleDemoMode}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isDemoModeActive
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {isDemoModeActive ? "Disable" : "Enable Demo Mode"}
              </button>
            </div>

            {/* 6 Canonical Demo Questions */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Canonical Demo Question Catalog (6/6)
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto pr-1">
                {DEMO_PRESETS.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
                        {item.question}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="h-3 w-3" />
                          {item.timestamp_label}
                        </span>
                        <span>•</span>
                        <span className="text-slate-400">{item.topic}</span>
                        <span>•</span>
                        <span className="text-slate-500 truncate max-w-[200px]">{item.expected}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Copy Question */}
                      <button
                        onClick={() => handleCopyQuestion(item.id, item.question)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                        title="Copy question text"
                      >
                        {copiedId === item.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {/* Select & Jump */}
                      {onSelectQuestion && (
                        <button
                          onClick={() => {
                            onSelectQuestion(item.question, item.timestamp_sec);
                            setIsOpen(false);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono"
                        >
                          <span>Ask & Seek</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Press ESC or click close to dismiss</span>
              <span className="text-cyan-400">Team The Falcons • Hackathon 2026</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
