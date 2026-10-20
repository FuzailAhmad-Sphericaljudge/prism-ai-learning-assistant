"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Layers,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  BookOpen,
  Award,
} from "lucide-react";

export interface RoleOption {
  id: string;
  title: string;
  topic: string;
  difficulty: "Foundational" | "Practical" | "Challenging" | "Advanced";
  description: string;
  focusAreas: string[];
}

export const PRESET_ROLES: RoleOption[] = [
  {
    id: "systems_engineer",
    title: "Systems Software Engineer",
    topic: "Binary Search Trees & Structural Invariants",
    difficulty: "Advanced",
    description: "Evaluates low-level pointer mechanics, trailing parent pointers in Tree-Insert, and in-order successor splicing under memory bounds.",
    focusAreas: [
      "Trailing parent pointer linkage in Tree-Insert",
      "In-order successor pointer tracing without parent back-links",
      "Node deletion case splicing and memory safety",
    ],
  },
  {
    id: "algorithm_specialist",
    title: "Algorithm Specialist",
    topic: "Balanced Trees & Algorithmic Complexity",
    difficulty: "Challenging",
    description: "Evaluates invariant proofs, worst-case degeneration to linked lists, tree height bounding, and rotation invariance.",
    focusAreas: [
      "Tree height h vs node count N complexity bounds",
      "Degenerate BST linked-list runtime O(N)",
      "Self-balancing rotations preserving in-order traversal order",
    ],
  },
  {
    id: "backend_engineer",
    title: "Backend Platform Engineer",
    topic: "Database Indexing & Range Queries",
    difficulty: "Practical",
    description: "Evaluates real-world application of BSTs in storage engines, range query scanning, and index traversal efficiency.",
    focusAreas: [
      "B-Tree / BST node layout in page blocks",
      "Range scan retrieval via in-order successor traversal",
      "Concurrent tree mutation and lock striping",
    ],
  },
];

interface InterviewSetupProps {
  onStart: (role: string, topic: string, rounds: number) => void;
  isLoading: boolean;
}

export function InterviewSetup({ onStart, isLoading }: InterviewSetupProps) {
  const [selectedRole, setSelectedRole] = useState<RoleOption>(PRESET_ROLES[0]);
  const [rounds, setRounds] = useState<number>(3);

  const difficultyColors: Record<RoleOption["difficulty"], string> = {
    Foundational: "text-emerald-400 bg-emerald-950/40 border-emerald-800/60",
    Practical: "text-cyan-400 bg-cyan-950/40 border-cyan-800/60",
    Challenging: "text-amber-400 bg-amber-950/40 border-amber-800/60",
    Advanced: "text-rose-400 bg-rose-950/40 border-rose-800/60",
  };

  const handleStart = () => {
    onStart(selectedRole.title, selectedRole.topic, rounds);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Oral Defense & Adaptive Interview</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Validate Technical Mastery in Real Time
          </h1>
          <p className="text-slate-400 max-w-2xl text-base leading-relaxed">
            Engage in a live, multi-round technical oral examination grounded directly in course evidence.
            PRISM formulates an evidence-backed rubric, adaptively probes your explanations, and evaluates conceptual precision.
          </p>
        </div>
      </div>

      {/* Role Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            Select Interview Persona & Technical Track
          </h2>
          <span className="text-xs text-slate-400">Course: CS-201 Data Structures</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESET_ROLES.map((role) => {
            const isSelected = selectedRole.id === role.id;
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`relative cursor-pointer rounded-xl border p-5 transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? "border-indigo-500/80 bg-indigo-950/20 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/50"
                    : "border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        difficultyColors[role.difficulty]
                      }`}
                    >
                      {role.difficulty}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 ring-4 ring-indigo-400/20" />
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-100 text-sm leading-snug">
                    {role.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {role.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60">
                  <p className="text-[11px] font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-indigo-400" />
                    Focus Areas:
                  </p>
                  <ul className="space-y-1">
                    {role.focusAreas.map((fa, idx) => (
                      <li key={idx} className="text-[11px] text-slate-400 flex items-start gap-1">
                        <span className="text-indigo-400/80 leading-none">•</span>
                        <span className="line-clamp-1">{fa}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configuration & Rubric Preview Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Interview Configuration */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Interview Depth
          </h3>
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Total Rounds</label>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRounds(n)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                    rounds === n
                      ? "bg-purple-600/30 border-purple-500 text-purple-200"
                      : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {n} Rounds
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Estimated duration: ~{rounds * 2}-{rounds * 3} minutes
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Evaluation Engine
            </span>
            <p className="text-[11px] text-slate-400 leading-normal">
              Every round generates an evidence-grounded rubric. Follow-up questions are strictly justified by missing points in previous answers.
            </p>
          </div>
        </div>

        {/* Dynamic Rubric Preview */}
        <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Evidence-Grounded Defense Rubric
            </h3>
            <span className="text-xs text-amber-400/80 font-mono">Passing Threshold: 70%</span>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">1. BST Invariant & Ancestral Property</span>
                <span className="text-slate-400 font-mono text-[11px]">Weight: 1.0</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Validates understanding that the BST invariant holds globally across all left and right descendants.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">2. Algorithmic Complexity & Degeneracy</span>
                <span className="text-slate-400 font-mono text-[11px]">Weight: 1.0</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Validates worst-case O(N) chain degeneration vs balanced O(log N) height behavior.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">3. Pointer Mechanics & Successor Splicing</span>
                <span className="text-slate-400 font-mono text-[11px]">Weight: 1.0</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Validates trailing parent pointer updates and minimum element extraction in right subtrees.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Start Action */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="button"
          onClick={handleStart}
          disabled={isLoading}
          className="relative inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Generating Rubric from Course Chunks...</span>
            </>
          ) : (
            <>
              <span>Begin Defense Interview</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
