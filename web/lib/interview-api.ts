import { apiClient } from "@/lib/api-client";
import {
  InterviewStartRequest,
  InterviewStartResponse,
  InterviewTurnRequest,
  InterviewTurnResponse,
  InterviewReportResponse,
} from "@/lib/api-types";

const DEFAULT_COURSE_ID = "00000000-0000-0000-0000-000000000002";
const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Start a new oral defense / technical interview session.
 * Generates initial evidence-grounded rubric and opening question.
 */
export async function startInterview(
  req: Partial<InterviewStartRequest> = {}
): Promise<InterviewStartResponse> {
  return apiClient<InterviewStartResponse>("/interview/start", {
    method: "POST",
    body: JSON.stringify({
      course_id: req.course_id || DEFAULT_COURSE_ID,
      user_id: req.user_id || DEFAULT_USER_ID,
      role: req.role || "Algorithm & Systems Engineer",
      topic: req.topic || "Binary Search Trees & Structural Invariants",
      max_rounds: req.max_rounds || 3,
    }),
  });
}

/**
 * Submit candidate answer for adaptive rubric evaluation and justified follow-up generation.
 */
export async function submitInterviewTurn(
  sessionId: string,
  userAnswer: string
): Promise<InterviewTurnResponse> {
  return apiClient<InterviewTurnResponse>("/interview/turn", {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
      user_answer: userAnswer,
    }),
  });
}

/**
 * Retrieve comprehensive post-interview defense audit report.
 */
export async function fetchInterviewReport(
  sessionId: string
): Promise<InterviewReportResponse> {
  return apiClient<InterviewReportResponse>(`/interview/${sessionId}`, {
    method: "GET",
  });
}
