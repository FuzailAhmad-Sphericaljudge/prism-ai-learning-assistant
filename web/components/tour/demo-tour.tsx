"use client";

import React, { useState, useEffect } from "react";
import { Shield, FileText, Search, Target, Award, ArrowRight, ArrowLeft, X, Sparkles, Check } from "lucide-react";

export interface TourStep {
  id: string;
  title: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  actionHint: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "firewall",
    title: "Temporal Evidence Firewall",
    badge: "Core Innovation",
    description:
      "PRISM locks all future knowledge based on the active lecture timestamp. The AI tutor strictly excludes all transcript chunks and slides after this moment, preventing learning spoilers.",
    icon: <Shield className="h-6 w-6 text-cyan-400" />,
    actionHint: "Notice the active firewall badge updating live as the video plays.",
  },
  {
    id: "citations",
    title: "Strict Inline Citations [E1]",
    badge: "Attribution Engine",
    description:
      "Every answer is grounded in admitted chunks with inline citations like [E1] and [E2]. Ungrounded claims fail verification and are rejected before reaching the learner.",
    icon: <FileText className="h-6 w-6 text-violet-400" />,
    actionHint: "Click any citation chip in chat to inspect exact quotes and audio timestamps.",
  },
  {
    id: "inspector",
    title: "Evidence Inspector & Why Allowed",
    badge: "Auditable Transparency",
    description:
      "Inspect the candidate retrieval stage in real-time. See exactly which chunks were admitted, which future chunks were locked, and how boundary straddles were interpolated at word precision.",
    icon: <Search className="h-6 w-6 text-emerald-400" />,
    actionHint: "Open the Evidence tab in the right panel to explore admitted evidence.",
  },
  {
    id: "practice",
    title: "Misconception-to-Mastery Practice",
    badge: "Formative Assessment",
    description:
      "PRISM generates targeted diagnostic probes after each answer. Submitting an answer grades your understanding, tags specific misconceptions, and gives a 'Revise this' deep-link.",
    icon: <Target className="h-6 w-6 text-amber-400" />,
    actionHint: "Visit /practice or answer the check card at the bottom of each chat answer.",
  },
  {
    id: "interview",
    title: "Adaptive Oral Defense & Educator Insights",
    badge: "Mastery Proof",
    description:
      "Test your depth in an interactive viva-voce oral defense interview with justified rubric scoring, and explore aggregate learner confusion heatmaps in Educator Insights.",
    icon: <Award className="h-6 w-6 text-pink-400" />,
    actionHint: "Navigate to /interview to start a defense session, or /educator for class analytics.",
  },
];

interface DemoTourProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function DemoTour({ forceOpen = false, onClose }: DemoTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }
    // Check if previously dismissed
    const seen = localStorage.getItem("prism_tour_seen");
    if (!seen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  const handleDismiss = () => {
    localStorage.setItem("prism_tour_seen", "true");
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStepIndex];
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-32 w-32 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header: Badge & Close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              PRISM Interactive Tour • Step {currentStepIndex + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step Content */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 shrink-0 shadow-inner">
            {step.icon}
          </div>

          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">{step.title}</h2>
            </div>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/20">
              {step.badge}
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
          </div>
        </div>

        {/* Action Hint Card */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2 font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
          <span>{step.actionHint}</span>
        </div>

        {/* Progress Dots & Buttons */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? "w-6 bg-cyan-400"
                    : "w-2 bg-slate-700 hover:bg-slate-500"
                }`}
                title={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
            >
              <span>{isLast ? "Get Started" : "Next"}</span>
              {isLast ? <Check className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
