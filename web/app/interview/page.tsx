"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { InterviewSetup } from "@/components/interview/interview-setup";
import { InterviewChat } from "@/components/interview/interview-chat";
import { InterviewRubricSidebar } from "@/components/interview/interview-rubric-sidebar";
import { startInterview, submitInterviewTurn } from "@/lib/interview-api";
import {
  InterviewStartResponse,
  InterviewExchangeTranscript,
  RubricCriterion,
  TurnEvaluation,
} from "@/lib/api-types";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function InterviewPage() {
  const router = useRouter();

  // Session state
  const [session, setSession] = useState<InterviewStartResponse | null>(null);
  const [history, setHistory] = useState<InterviewExchangeTranscript[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentJustification, setCurrentJustification] = useState<string | null>(null);
  const [rubric, setRubric] = useState<RubricCriterion[]>([]);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [latestEvaluation, setLatestEvaluation] = useState<TurnEvaluation | null>(null);

  // Status & error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStartInterview = async (
    role: string,
    topic: string,
    rounds: number
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const resp = await startInterview({
        role,
        topic,
        max_rounds: rounds,
      });

      setSession(resp);
      setRubric(resp.rubric || []);
      setCurrentQuestion(resp.initial_question);
      setCurrentRound(1);
      setIsCompleted(false);
      setHistory([]);
      setCurrentJustification(null);
      setLatestEvaluation(null);
    } catch (err: any) {
      console.error("Failed to start interview:", err);
      setErrorMessage(
        err?.message || "Failed to initialize interview. Please ensure backend is reachable."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async (answer: string) => {
    if (!session || isSubmitting || isCompleted) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const questionAsked = currentQuestion;
    const justification = currentJustification;

    try {
      const resp = await submitInterviewTurn(session.session_id, answer);

      // Record this exchange in the local chat history
      const newExchange: InterviewExchangeTranscript = {
        round: currentRound,
        question: questionAsked,
        answer: answer,
        justification: justification,
        evaluation: resp.evaluation || undefined,
      };

      setHistory((prev) => [...prev, newExchange]);

      // Update rubric scores from the response
      if (resp.rubric && resp.rubric.length > 0) {
        setRubric(resp.rubric);
      }

      setLatestEvaluation(resp.evaluation || null);

      if (resp.is_completed) {
        setIsCompleted(true);
        setCurrentQuestion("");
        setCurrentJustification(null);
      } else {
        setCurrentRound(resp.round_number);
        setCurrentQuestion(resp.next_question || "");
        setCurrentJustification(resp.justification || null);
      }
    } catch (err: any) {
      console.error("Failed to evaluate interview answer:", err);
      setErrorMessage(
        err?.message || "Error submitting answer. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSession(null);
    setHistory([]);
    setCurrentQuestion("");
    setCurrentJustification(null);
    setRubric([]);
    setCurrentRound(1);
    setIsCompleted(false);
    setLatestEvaluation(null);
    setErrorMessage(null);
  };

  const handleViewReport = () => {
    if (session) {
      router.push(`/interview/report/${session.session_id}`);
    }
  };

  return (
    <AppShell activeNav="interview" fullHeight={!!session}>
      {/* Top Notification if Error */}
      {errorMessage && (
        <div className="bg-rose-950/80 border-b border-rose-800 px-6 py-2.5 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-200 hover:text-white underline text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {!session ? (
        // Interview Persona & Track Setup Screen
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <InterviewSetup
            onStart={handleStartInterview}
            isLoading={isLoading}
          />
        </div>
      ) : (
        // Active Multi-Round Oral Defense Chat & Rubric Screen
        <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
          {/* Main Chat Stream */}
          <InterviewChat
            role={session.role}
            topic={session.topic}
            currentRound={currentRound}
            maxRounds={session.max_rounds}
            history={history}
            currentQuestion={currentQuestion}
            currentJustification={currentJustification}
            latestEvaluation={latestEvaluation}
            isSubmitting={isSubmitting}
            isCompleted={isCompleted}
            onSubmitAnswer={handleSubmitAnswer}
            onViewReport={handleViewReport}
          />

          {/* Live Rubric Evaluator Sidebar */}
          <InterviewRubricSidebar
            rubric={rubric}
            currentRound={currentRound}
            maxRounds={session.max_rounds}
            role={session.role}
          />
        </div>
      )}
    </AppShell>
  );
}
