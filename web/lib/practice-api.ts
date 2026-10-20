import { apiClient } from "@/lib/api-client";
import {
  PracticeGenerateRequest,
  PracticeGenerateResponse,
  AttemptSubmitRequest,
  AttemptSubmitResponse,
  MasteryDashboardResponse,
  MasteryTimelineResponse,
} from "@/lib/api-types";

const DEFAULT_COURSE_ID = "00000000-0000-0000-0000-000000000002";
const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Generate practice questions grounded strictly in admitted temporal evidence.
 */
export async function generatePracticeQuestions(
  req: PracticeGenerateRequest
): Promise<PracticeGenerateResponse> {
  return apiClient<PracticeGenerateResponse>("/practice/generate", {
    method: "POST",
    body: JSON.stringify({
      course_id: req.course_id || DEFAULT_COURSE_ID,
      playback_sec: req.playback_sec ?? null,
      mode: req.mode || "learn_so_far",
      concept_tag: req.concept_tag ?? null,
      question_type: req.question_type || "mcq",
      count: req.count || 1,
    }),
  });
}

/**
 * Submit student practice attempt for rubric grading and misconception diagnosis.
 */
export async function submitPracticeAttempt(
  req: AttemptSubmitRequest
): Promise<AttemptSubmitResponse> {
  return apiClient<AttemptSubmitResponse>("/practice/submit", {
    method: "POST",
    body: JSON.stringify({
      question_id: req.question_id,
      course_id: req.course_id || DEFAULT_COURSE_ID,
      user_id: req.user_id || DEFAULT_USER_ID,
      session_id: req.session_id ?? null,
      concept_tag: req.concept_tag,
      question_text: req.question_text,
      question_type: req.question_type,
      user_answer: req.user_answer,
      playback_sec: req.playback_sec ?? null,
    }),
  });
}

/**
 * Fetch derived mastery dashboard with assessed metrics, status flags, and next action.
 */
export async function fetchMasteryDashboard(
  courseId: string = DEFAULT_COURSE_ID,
  userId: string = DEFAULT_USER_ID
): Promise<MasteryDashboardResponse> {
  return apiClient<MasteryDashboardResponse>(
    `/mastery?course_id=${encodeURIComponent(courseId)}&user_id=${encodeURIComponent(userId)}`
  );
}

/**
 * Fetch chronological audit timeline of all assessed practice attempts.
 */
export async function fetchMasteryTimeline(
  courseId: string = DEFAULT_COURSE_ID,
  userId: string = DEFAULT_USER_ID
): Promise<MasteryTimelineResponse> {
  return apiClient<MasteryTimelineResponse>(
    `/mastery/timeline?course_id=${encodeURIComponent(courseId)}&user_id=${encodeURIComponent(userId)}`
  );
}
