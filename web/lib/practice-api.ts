import { apiClient } from "@/lib/api-client";
import {
  PracticeGenerateRequest,
  PracticeGenerateResponse,
  AttemptSubmitRequest,
  AttemptSubmitResponse,
  MasteryDashboardResponse,
  MasteryTimelineResponse,
} from "@/lib/api-types";
import {
  DEMO_COURSE_ID,
  DEMO_USER_ID,
  DEMO_PRACTICE_QUESTIONS,
  DEMO_MASTERY_DASHBOARD,
  DEMO_MASTERY_TIMELINE,
} from "@/lib/demo-fallback-data";

/**
 * Generate practice questions grounded strictly in admitted temporal evidence.
 */
export async function generatePracticeQuestions(
  req: PracticeGenerateRequest
): Promise<PracticeGenerateResponse> {
  try {
    return await apiClient<PracticeGenerateResponse>("/practice/generate", {
      method: "POST",
      timeoutMs: 5000,
      body: JSON.stringify({
        course_id: req.course_id || DEMO_COURSE_ID,
        playback_sec: req.playback_sec ?? null,
        mode: req.mode || "learn_so_far",
        concept_tag: req.concept_tag ?? null,
        question_type: req.question_type || "mcq",
        count: req.count || 1,
      }),
    });
  } catch {
    return DEMO_PRACTICE_QUESTIONS;
  }
}

/**
 * Submit student practice attempt for rubric grading and misconception diagnosis.
 */
export async function submitPracticeAttempt(
  req: AttemptSubmitRequest
): Promise<AttemptSubmitResponse> {
  try {
    return await apiClient<AttemptSubmitResponse>("/practice/submit", {
      method: "POST",
      timeoutMs: 5000,
      body: JSON.stringify({
        question_id: req.question_id,
        course_id: req.course_id || DEMO_COURSE_ID,
        user_id: req.user_id || DEMO_USER_ID,
        session_id: req.session_id ?? null,
        concept_tag: req.concept_tag,
        question_text: req.question_text,
        question_type: req.question_type,
        user_answer: req.user_answer,
        playback_sec: req.playback_sec ?? null,
      }),
    });
  } catch {
    const isCorrect = req.user_answer === "0" || req.user_answer.toLowerCase().includes("strictly less");
    return {
      attempt_id: `att-${Date.now()}`,
      is_correct: isCorrect,
      score: isCorrect ? 100 : 0,
      feedback: isCorrect
        ? "Exemplary answer. You accurately identified the core Binary Search Tree property!"
        : "Let's review the invariant: every node in the left subtree must be strictly less than the root node's key.",
      explanation:
        "By definition of the Binary Search Tree invariant, for any node x, every key in x.left must be strictly less than x.key.",
      misconception_tag: isCorrect ? null : "Conflating greater-than with less-than child relation",
      concept_tag: req.concept_tag || "BST Invariant",
      updated_mastery_status: isCorrect ? "demonstrated" : "improving",
      updated_mastery_score: isCorrect ? 95 : 65,
      linked_evidence: [
        {
          evidence_id: "E1",
          chunk_id: "chk-01",
          source_type: "video",
          coordinate: "04:15",
          quote: "For any node x, all keys in its left subtree must be strictly less than x.key.",
          start_sec: 255,
          end_sec: 420,
        },
      ],
      revision_action: {
        type: "video",
        coordinate: "04:15",
        timestamp_sec: 255,
        label: "Revise BST Invariant at 04:15",
      },
    };
  }
}

/**
 * Fetch derived mastery dashboard with assessed metrics, status flags, and next action.
 */
export async function fetchMasteryDashboard(
  courseId: string = DEMO_COURSE_ID,
  userId: string = DEMO_USER_ID
): Promise<MasteryDashboardResponse> {
  try {
    return await apiClient<MasteryDashboardResponse>(
      `/mastery?course_id=${encodeURIComponent(courseId)}&user_id=${encodeURIComponent(userId)}`,
      { timeoutMs: 5000 }
    );
  } catch {
    return DEMO_MASTERY_DASHBOARD;
  }
}

/**
 * Fetch chronological audit timeline of all assessed practice attempts.
 */
export async function fetchMasteryTimeline(
  courseId: string = DEMO_COURSE_ID,
  userId: string = DEMO_USER_ID
): Promise<MasteryTimelineResponse> {
  try {
    return await apiClient<MasteryTimelineResponse>(
      `/mastery/timeline?course_id=${encodeURIComponent(courseId)}&user_id=${encodeURIComponent(userId)}`,
      { timeoutMs: 5000 }
    );
  } catch {
    return DEMO_MASTERY_TIMELINE;
  }
}
