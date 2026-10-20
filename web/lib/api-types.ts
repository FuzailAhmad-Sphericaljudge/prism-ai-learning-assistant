/**
 * PRISM TypeScript Contracts & Domain Models
 * Synchronized with FastAPI Backend schemas (api/schemas/)
 */

export interface Course {
  id: string;
  title: string;
  code: string;
  description?: string | null;
  instructor: string;
  term?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  source_count?: number;
}

export interface TranscriptCue {
  text: string;
  start_sec: number;
  end_sec: number;
  speaker?: string | null;
}

export interface CourseTranscriptResponse {
  course_id: string;
  source_id?: string | null;
  source_title?: string | null;
  total_cues: number;
  duration_sec?: number | null;
  max_time_sec?: number | null;
  cues: TranscriptCue[];
}

export interface Source {
  id: string;
  course_id: string;
  type: "video" | "pdf" | "ppt" | "notes";
  title: string;
  file_path?: string | null;
  version: number;
  status: "pending" | "processing" | "ready" | "failed";
  error_message?: string | null;
  duration_sec?: number | null;
  page_count?: number | null;
  meta?: Record<string, any> | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CourseResourcesResponse {
  course_id: string;
  total_sources: number;
  resources: {
    video: Source[];
    pdf: Source[];
    ppt: Source[];
    notes: Source[];
  };
}

export interface SourceStatusResponse {
  id: string;
  course_id: string;
  type: string;
  title: string;
  status: "pending" | "processing" | "ready" | "failed";
  chunk_count: number;
  duration_sec?: number | null;
  page_count?: number | null;
  error_message?: string | null;
  version: number;
}

export type FirewallMode = "learn_so_far" | "explore_ahead";

export interface EvidenceBadge {
  id: string;
  type: "video" | "pdf" | "ppt" | "notes";
  label: string;
  coordinate: string;
  quote?: string;
  similarity?: number;
}

export interface DiagnosticCheck {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface CitationItem {
  evidence_id: string;
  chunk_id: string;
  source_type: "video" | "pdf" | "ppt" | "notes" | string;
  coordinate: string;
  quote: string;
  start_sec?: number | null;
  end_sec?: number | null;
  slide?: number | null;
  page?: number | null;
}

export interface ChatRequest {
  query: string;
  course_id: string;
  playback_sec: number;
  mode?: FirewallMode;
  session_id?: string | null;
  user_id?: string;
}

export interface ChatResponse {
  answer: string;
  citations: CitationItem[];
  check?: DiagnosticCheck | null;
  is_not_covered: boolean;
  not_covered_topic?: string | null;
  available_at_sec?: number | null;
  session_id?: string | null;
  message_id?: string | null;
  validation_passed: boolean;
}

export interface AdmittedChunkDebug {
  chunk_id: string;
  source_type: string;
  coordinate: string;
  status: "fully_admitted" | "interpolated_straddling" | "unlocked_explore_ahead";
  start_sec?: number | null;
  end_sec?: number | null;
  page?: number | null;
  slide?: number | null;
  excerpt: string;
}

export interface BlockedChunkDebug {
  chunk_id: string;
  source_type: string;
  coordinate: string;
  status: "excluded_future" | "excluded_resource_policy";
  reason: string;
}

export interface RetrieveDebugResponse {
  course_id: string;
  playback_sec: number;
  mode: FirewallMode;
  admitted_count: number;
  blocked_count: number;
  admitted: AdmittedChunkDebug[];
  blocked: BlockedChunkDebug[];
  scoped_prompt_preview?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp_sec?: number | null;
  created_at: string;
  evidence_badges?: EvidenceBadge[];
  citations?: CitationItem[];
  check?: DiagnosticCheck | null;
  is_not_covered?: boolean;
  not_covered_topic?: string | null;
  available_at_sec?: number | null;
  isStreaming?: boolean;
}

// ==========================================
// Phase 6: Practice & Mastery Tracking Models
// ==========================================

export interface RevisionAction {
  type: "video" | "slide" | "pdf" | string;
  coordinate: string;
  timestamp_sec?: number | null;
  slide?: number | null;
  page?: number | null;
  label: string;
}

export interface PracticeQuestion {
  id: string;
  course_id: string;
  concept_tag: string;
  question_type: "mcq" | "short_answer";
  question_text: string;
  options?: string[] | null;
  correct_answer: string;
  correct_index?: number | null;
  explanation: string;
  evidence_links: CitationItem[];
}

export interface PracticeGenerateRequest {
  course_id: string;
  playback_sec?: number | null;
  mode?: FirewallMode;
  concept_tag?: string | null;
  question_type?: "mcq" | "short_answer" | "all";
  count?: number;
}

export interface PracticeGenerateResponse {
  course_id: string;
  playback_sec?: number | null;
  mode: FirewallMode;
  questions: PracticeQuestion[];
  available_concepts: string[];
}

export interface AttemptSubmitRequest {
  question_id: string;
  course_id: string;
  user_id?: string;
  session_id?: string | null;
  concept_tag: string;
  question_text: string;
  question_type: "mcq" | "short_answer";
  user_answer: string;
  playback_sec?: number | null;
}

export interface AttemptSubmitResponse {
  attempt_id: string;
  is_correct: boolean;
  score: number;
  misconception_tag?: string | null;
  feedback: string;
  explanation: string;
  revision_action?: RevisionAction | null;
  linked_evidence: CitationItem[];
  concept_tag: string;
  updated_mastery_status: "not_assessed" | "gap_found" | "improving" | "demonstrated";
  updated_mastery_score: number;
}

export interface ConceptMastery {
  concept_tag: string;
  status: "not_assessed" | "gap_found" | "improving" | "demonstrated";
  mastery_score: number;
  attempts_count: number;
  correct_count: number;
  misconceptions: string[];
  last_assessed_at?: string | null;
  evidence_landmarks: string[];
}

export interface NextBestAction {
  concept_tag: string;
  reason: string;
  recommended_type: "revise" | "practice" | "explore";
  action_url: string;
  coordinate?: string | null;
  label: string;
}

export interface MasteryDashboardResponse {
  course_id: string;
  user_id: string;
  total_concepts: number;
  assessed_concepts: number;
  demonstrated_count: number;
  improving_count: number;
  gap_count: number;
  unassessed_count: number;
  overall_mastery_percentage: number;
  concepts: ConceptMastery[];
  next_best_action?: NextBestAction | null;
}

export interface TimelineAttemptItem {
  id: string;
  concept_tag: string;
  question_text: string;
  user_answer: string;
  is_correct: boolean;
  misconception_tag?: string | null;
  feedback: string;
  explanation: string;
  created_at: string;
  revision_action?: RevisionAction | null;
  linked_evidence: CitationItem[];
}

export interface MasteryTimelineResponse {
  course_id: string;
  user_id: string;
  total_attempts: number;
  timeline: TimelineAttemptItem[];
}
