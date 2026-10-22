import { apiClient } from "@/lib/api-client";
import {
  InterviewStartRequest,
  InterviewStartResponse,
  InterviewTurnRequest,
  InterviewTurnResponse,
  InterviewReportResponse,
  RubricCriterion,
} from "@/lib/api-types";
import { DEMO_COURSE_ID, DEMO_USER_ID } from "@/lib/demo-fallback-data";

const DEFAULT_RUBRIC: RubricCriterion[] = [
  {
    id: "crit-01",
    name: "Invariant Rigor",
    description: "Formal specification of the BST left-less, right-greater invariant",
    weight: 0.35,
    expected_points: [
      "Left subtree strictly less than node key",
      "Right subtree greater than or equal to node key",
      "Holds recursively for every subtree",
    ],
    linked_evidence: [
      {
        evidence_id: "E1",
        chunk_id: "chk-01",
        source_type: "video",
        coordinate: "04:15",
        quote: "For any node x, all keys in its left subtree must be strictly less than x.key.",
      },
    ],
    score: null,
    justification: null,
  },
  {
    id: "crit-02",
    name: "Complexity Derivation",
    description: "Deriving O(h) runtime bound for search and insert",
    weight: 0.35,
    expected_points: [
      "Search follows single root-to-leaf path",
      "O(1) comparison cost per level",
      "Runtime bounded by tree height h",
    ],
    linked_evidence: [
      {
        evidence_id: "E2",
        chunk_id: "chk-02",
        source_type: "video",
        coordinate: "09:45",
        quote: "Both search and insertion execute in O(h) time, where h is the tree height.",
      },
    ],
    score: null,
    justification: null,
  },
  {
    id: "crit-03",
    name: "Degeneracy Mitigation",
    description: "Understanding tree height degeneracy and balanced tree motivation",
    weight: 0.3,
    expected_points: [
      "Sorted keys create O(N) degenerate linked list",
      "Balanced trees maintain O(log N) height",
      "AVL rotations prevent worst-case drift",
    ],
    linked_evidence: [
      {
        evidence_id: "E3",
        chunk_id: "chk-03",
        source_type: "notes",
        coordinate: "Page 4",
        quote: "AVL height balancing ensures h <= 1.44 log2(N + 2).",
      },
    ],
    score: null,
    justification: null,
  },
];

/**
 * Start a new oral defense / technical interview session.
 * Generates initial evidence-grounded rubric and opening question.
 */
export async function startInterview(
  req: Partial<InterviewStartRequest> = {}
): Promise<InterviewStartResponse> {
  try {
    return await apiClient<InterviewStartResponse>("/interview/start", {
      method: "POST",
      timeoutMs: 5000,
      body: JSON.stringify({
        course_id: req.course_id || DEMO_COURSE_ID,
        user_id: req.user_id || DEMO_USER_ID,
        role: req.role || "Algorithm & Systems Engineer",
        topic: req.topic || "Binary Search Trees & Structural Invariants",
        max_rounds: req.max_rounds || 3,
      }),
    });
  } catch {
    return {
      session_id: `int-demo-${Date.now()}`,
      course_id: req.course_id || DEMO_COURSE_ID,
      user_id: req.user_id || DEMO_USER_ID,
      role: req.role || "Algorithm & Systems Engineer",
      topic: req.topic || "Binary Search Trees & Structural Invariants",
      max_rounds: req.max_rounds || 3,
      current_round: 1,
      initial_question:
        "Welcome to the technical oral defense for CS 201. To begin: how does the Binary Search Tree property allow us to systematically reduce search time from O(N) linear scan down to O(h)?",
      rubric: DEFAULT_RUBRIC,
      status: "in_progress",
    };
  }
}

/**
 * Submit candidate answer for adaptive rubric evaluation and justified follow-up generation.
 */
export async function submitInterviewTurn(
  sessionId: string,
  userAnswer: string
): Promise<InterviewTurnResponse> {
  try {
    return await apiClient<InterviewTurnResponse>("/interview/turn", {
      method: "POST",
      timeoutMs: 6000,
      body: JSON.stringify({
        session_id: sessionId,
        user_answer: userAnswer,
      }),
    });
  } catch {
    return {
      session_id: sessionId,
      round_number: 2,
      max_rounds: 3,
      is_completed: false,
      evaluation: {
        criterion_id: "crit-01",
        criterion_name: "Invariant Rigor",
        score: 85.0,
        justification:
          "Clear explanation of the directional left/right branching invariant.",
        demonstrated_points: ["Left subtree strictly less than node key"],
        missed_points: ["Did not mention edge case where tree degenerates into a linear chain"],
      },
      next_question:
        "Great foundation. Now, suppose the input keys arrive in strictly sorted ascending order [1, 2, 3, ..., N]. What specific shape does the tree take, and what happens to the height h and search runtime?",
      justification:
        "Follow-up probe because the candidate's initial answer assumed balanced height without addressing the degenerate insertion case.",
      rubric: DEFAULT_RUBRIC.map((r, i) =>
        i === 0 ? { ...r, score: 85.0, justification: "Demonstrated clear understanding" } : r
      ),
      feedback:
        "Solid conceptual start. Be sure to address degenerate insertion sequences in your next answer.",
    };
  }
}

/**
 * Retrieve comprehensive post-interview defense audit report.
 */
export async function fetchInterviewReport(
  sessionId: string
): Promise<InterviewReportResponse> {
  try {
    return await apiClient<InterviewReportResponse>(`/interview/${sessionId}/report`, {
      method: "GET",
      timeoutMs: 5000,
    });
  } catch {
    return {
      session_id: sessionId,
      course_id: DEMO_COURSE_ID,
      user_id: DEMO_USER_ID,
      role: "Algorithm & Systems Engineer",
      topic: "Binary Search Trees & Structural Invariants",
      overall_score: 88.0,
      status: "passed",
      completed_at: new Date().toISOString(),
      criteria_scores: [
        {
          criterion_id: "crit-01",
          name: "Invariant Rigor",
          score: 92.0,
          weight: 0.35,
          justification:
            "Demonstrated precise recall of the recursive BST invariant and in-order traversal sorting properties.",
          linked_evidence: [
            {
              evidence_id: "E1",
              chunk_id: "chk-01",
              source_type: "video",
              coordinate: "04:15",
              quote: "For any node x, all keys in its left subtree must be strictly less than x.key.",
            },
          ],
        },
        {
          criterion_id: "crit-02",
          name: "Complexity Derivation",
          score: 85.0,
          weight: 0.35,
          justification:
            "Accurately derived O(h) upper bounds for search, insert, min, and max.",
          linked_evidence: [
            {
              evidence_id: "E2",
              chunk_id: "chk-02",
              source_type: "video",
              coordinate: "09:45",
              quote: "Both search and insertion execute in O(h) time, where h is the tree height.",
            },
          ],
        },
        {
          criterion_id: "crit-03",
          name: "Degeneracy Mitigation",
          score: 87.0,
          weight: 0.3,
          justification:
            "Understood the vulnerability to sorted insertion sequence and the necessity of AVL rotations.",
          linked_evidence: [
            {
              evidence_id: "E3",
              chunk_id: "chk-03",
              source_type: "notes",
              coordinate: "Page 4",
              quote: "AVL height balancing ensures h <= 1.44 log2(N + 2).",
            },
          ],
        },
      ],
      strengths: [
        "Rigorous formulation of mathematical invariants",
        "Clear articulation of the dynamic set trade-offs between arrays and linked lists",
      ],
      gaps: [
        "Remember to explicitly highlight the empty tree base case when defining tree height",
      ],
      revision_links: [
        {
          type: "video",
          coordinate: "04:15",
          timestamp_sec: 255,
          label: "Lecture 14: BST Invariant Proof",
        },
        {
          type: "video",
          coordinate: "09:45",
          timestamp_sec: 585,
          label: "Lecture 14: Search Complexity",
        },
      ],
      transcript: [
        {
          round: 1,
          question:
            "How does the Binary Search Tree property allow us to systematically reduce search time from O(N) linear scan down to O(h)?",
          answer:
            "By checking if the target key is less than or greater than the current node, we eliminate half the remaining candidates at each step along a single path of length h.",
          justification: "Assesses baseline divide-and-conquer understanding.",
        },
      ],
    };
  }
}
