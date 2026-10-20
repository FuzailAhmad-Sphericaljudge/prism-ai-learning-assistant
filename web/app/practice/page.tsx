"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app/app-shell";
import { PracticeConceptFilter } from "@/components/practice/practice-concept-filter";
import { PracticeQuestionCard } from "@/components/practice/practice-question-card";
import { PracticeFeedbackCard } from "@/components/practice/practice-feedback-card";
import { PracticeEmptyState } from "@/components/practice/practice-empty-state";
import {
  generatePracticeQuestions,
  submitPracticeAttempt,
  fetchMasteryDashboard,
} from "@/lib/practice-api";
import {
  PracticeQuestion,
  AttemptSubmitResponse,
  ConceptMastery,
  FirewallMode,
} from "@/lib/api-types";
import {
  Sparkles,
  ShieldAlert,
  Award,
  BarChart2,
  RefreshCw,
  Flame,
  CheckCircle2,
  Layers,
} from "lucide-react";

const COURSE_ID = "00000000-0000-0000-0000-000000000002";
const ALL_TAXONOMY_CONCEPTS = [
  "BST Invariant",
  "Tree Search Complexity",
  "Tree Insertion",
  "In-Order Successor",
  "Node Deletion",
  "Self-Balancing Trees",
];

export default function PracticePage() {
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [questionType, setQuestionType] = useState<"mcq" | "short_answer">("mcq");
  const [mode, setMode] = useState<FirewallMode>("learn_so_far");
  const [playbackSec, setPlaybackSec] = useState<number>(1200.0); // 20:00 boundary

  // Data states
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<AttemptSubmitResponse | null>(null);

  // Session Stats
  const [completedCount, setCompletedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [conceptStatuses, setConceptStatuses] = useState<
    Record<string, "not_assessed" | "gap_found" | "improving" | "demonstrated">
  >({});

  // Fetch initial mastery status map
  useEffect(() => {
    fetchMasteryDashboard(COURSE_ID)
      .then((data) => {
        const map: Record<string, any> = {};
        data.concepts.forEach((c) => {
          map[c.concept_tag] = c.status;
        });
        setConceptStatuses(map);
      })
      .catch((err) => console.error("Could not fetch mastery dashboard:", err));
  }, []);

  // Fetch or generate questions when concept or type changes
  const loadQuestions = useCallback(async (concept: string | null = selectedConcept) => {
    setIsLoading(true);
    setCurrentFeedback(null);
    try {
      const res = await generatePracticeQuestions({
        course_id: COURSE_ID,
        playback_sec: playbackSec,
        mode: mode,
        concept_tag: concept,
        question_type: questionType,
        count: 1,
      });

      if (res.questions && res.questions.length > 0) {
        setQuestions(res.questions);
        setCurrentIndex(0);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.error("Failed to generate questions:", err);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedConcept, playbackSec, mode, questionType]);

  useEffect(() => {
    loadQuestions(selectedConcept);
  }, [loadQuestions, selectedConcept]);

  const handleConceptSelect = (concept: string | null) => {
    setSelectedConcept(concept);
  };

  const handleSubmitAnswer = async (userAnswer: string) => {
    const activeQ = questions[currentIndex];
    if (!activeQ) return;

    setIsSubmitting(true);
    try {
      const res = await submitPracticeAttempt({
        question_id: activeQ.id,
        course_id: COURSE_ID,
        concept_tag: activeQ.concept_tag,
        question_text: activeQ.question_text,
        question_type: activeQ.question_type,
        user_answer: userAnswer,
        playback_sec: playbackSec,
      });

      setCurrentFeedback(res);
      setCompletedCount((prev) => prev + 1);
      if (res.is_correct) {
        setCorrectCount((prev) => prev + 1);
      }

      // Update local concept status badge
      setConceptStatuses((prev) => ({
        ...prev,
        [res.concept_tag]: res.updated_mastery_status,
      }));
    } catch (err) {
      console.error("Failed to submit attempt:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setCurrentFeedback(null);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Generate next question
      loadQuestions(selectedConcept);
    }
  };

  const handleRetry = () => {
    setCurrentFeedback(null);
  };

  const activeQuestion = questions[currentIndex];

  return (
    <AppShell activeNav="practice" courseTitle="CS 201: Binary Search Trees & Balanced Structures">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 w-full space-y-8">
        {/* Top Header Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Misconception-to-Mastery Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Adaptive Practice & Diagnostics
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Every question is derived strictly from admitted temporal evidence. Zero hallucinated percentages.
            </p>
          </div>

          {/* Quick Session Stats & Links */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="text-zinc-400">Score:</span>
              <span className="font-semibold text-white">
                {completedCount > 0 ? `${correctCount}/${completedCount}` : "0/0"}
              </span>
            </div>

            <Link
              href="/mastery"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 text-xs font-semibold transition-all cursor-pointer"
            >
              <BarChart2 className="w-4 h-4" />
              <span>Mastery Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Concept Filter Bar & Question Type Toggle */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Filter by Curriculum Concept</span>
            </span>

            {/* MCQ vs Short Answer Segmented Control */}
            <div className="inline-flex rounded-lg bg-zinc-900 p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => setQuestionType("mcq")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  questionType === "mcq"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Multiple Choice
              </button>
              <button
                type="button"
                onClick={() => setQuestionType("short_answer")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  questionType === "short_answer"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Short Answer
              </button>
            </div>
          </div>

          <PracticeConceptFilter
            concepts={ALL_TAXONOMY_CONCEPTS}
            selectedConcept={selectedConcept}
            onSelectConcept={handleConceptSelect}
            conceptStatusMap={conceptStatuses}
            disabled={isLoading || isSubmitting}
          />
        </div>

        {/* Main Content Area */}
        <div className="min-h-[380px] flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-xs text-zinc-400 font-mono tracking-wide">
                Retrieving permitted temporal evidence chunks...
              </p>
            </div>
          ) : currentFeedback ? (
            <PracticeFeedbackCard
              feedback={currentFeedback}
              onNextQuestion={handleNextQuestion}
              onRetry={handleRetry}
              courseId={COURSE_ID}
            />
          ) : activeQuestion ? (
            <PracticeQuestionCard
              question={activeQuestion}
              onSubmit={handleSubmitAnswer}
              isSubmitting={isSubmitting}
            />
          ) : (
            <PracticeEmptyState
              conceptTag={selectedConcept}
              onGenerateAll={() => loadQuestions(null)}
              courseId={COURSE_ID}
            />
          )}
        </div>

        {/* Pedagogical Grounding Guarantee */}
        <div className="rounded-xl border border-white/5 bg-zinc-950/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Temporal Evidence Firewall locks questions to content introduced before playback moment.
            </span>
          </div>
          <Link
            href={`/learn/${COURSE_ID}`}
            className="text-indigo-400 hover:text-indigo-300 font-medium shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <span>Review video lecture</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
