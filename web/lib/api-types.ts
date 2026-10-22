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
  id?: string;
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

// ==========================================
// PHASE 7: INTERVIEW & ORAL DEFENSE CONTRACTS
// ==========================================

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  expected_points: string[];
  linked_evidence: CitationItem[];
  score?: number | null;
  justification?: string | null;
}

export interface InterviewRubric {
  criteria: RubricCriterion[];
  passing_score: number;
}

export interface InterviewStartRequest {
  course_id: string;
  user_id?: string;
  role: string;
  topic: string;
  max_rounds?: number;
}

export interface InterviewStartResponse {
  session_id: string;
  course_id: string;
  user_id: string;
  role: string;
  topic: string;
  current_round: number;
  max_rounds: number;
  initial_question: string;
  rubric: RubricCriterion[];
  status: string;
}

export interface TurnEvaluation {
  criterion_id: string;
  criterion_name: string;
  score: number;
  justification: string;
  missed_points: string[];
  demonstrated_points: string[];
}

export interface InterviewTurnRequest {
  session_id: string;
  user_answer: string;
}

export interface InterviewTurnResponse {
  session_id: string;
  round_number: number;
  max_rounds: number;
  is_completed: boolean;
  evaluation?: TurnEvaluation | null;
  rubric: RubricCriterion[];
  next_question?: string | null;
  justification?: string | null;
  feedback?: string | null;
}

export interface CriterionReport {
  criterion_id: string;
  name: string;
  score: number;
  weight: number;
  justification: string;
  linked_evidence: CitationItem[];
}

export interface InterviewExchangeTranscript {
  round: number;
  question: string;
  answer: string;
  justification?: string | null;
  evaluation?: TurnEvaluation | null;
}

export interface InterviewReportResponse {
  session_id: string;
  course_id: string;
  user_id: string;
  role: string;
  topic: string;
  status: string;
  overall_score: number;
  criteria_scores: CriterionReport[];
  strengths: string[];
  gaps: string[];
  revision_links: RevisionAction[];
  transcript: InterviewExchangeTranscript[];
  created_at?: string | null;
  completed_at?: string | null;
}

// ==========================================
// PHASE 7: EDUCATOR ANALYTICS CONTRACTS
// ==========================================

export interface ConfusionHeatmapBucket {
  bucket_index: number;
  start_sec: number;
  end_sec: number;
  coordinate_label: string;
  query_count: number;
  misconception_count: number;
  confusion_intensity: number;
  most_confused_topic: string;
}

export interface TopMisconceptionItem {
  misconception_tag: string;
  concept_tag: string;
  occurrences: number;
  prevalence_percentage: number;
  landmark_coordinate: string;
  remediation_action: string;
}

export interface TopQuestionItem {
  question: string;
  occurrences: number;
  concept_tag: string;
  playback_coordinate: string;
  timestamp_sec: number;
}

export interface ConceptMasteryDistribution {
  concept_tag: string;
  demonstrated_count: number;
  improving_count: number;
  gap_count: number;
  unassessed_count: number;
  average_score: number;
}

export interface EducatorInsightsResponse {
  course_id: string;
  total_questions_asked: number;
  total_practice_attempts: number;
  total_interviews: number;
  active_students: number;
  avg_course_mastery_percentage: number;
  confusion_heatmap: ConfusionHeatmapBucket[];
  top_misconceptions: TopMisconceptionItem[];
  top_questions: TopQuestionItem[];
  concept_distributions: ConceptMasteryDistribution[];
}

// ==========================================
// PHASE 8: OBSERVABILITY & ADMIN CONTRACTS
// ==========================================

export interface LatencyDistributionBucket {
  bucket: string;
  count: number;
}

export interface TimelinePoint {
  timestamp: string;
  latency_ms: number;
  validation_passed: boolean;
  query: string;
  playback_sec: number;
  mode: string;
}

export interface AdminMetricsResponse {
  total_queries: number;
  p50_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  mean_latency_ms: number;
  validation_pass_rate: number;
  firewall_leak_rate: number;
  temporal_enforcement_rate: number;
  learn_so_far_count: number;
  explore_ahead_count: number;
  latency_distribution: LatencyDistributionBucket[];
  recent_timeline: TimelinePoint[];
}

export interface TraceItem {
  id: string;
  trace_id: string;
  request_id?: string;
  session_id?: string;
  query: string;
  latency_ms: number;
  playback_sec: number;
  mode: string;
  citation_count: number;
  admitted_chunks: number;
  blocked_chunks: number;
  validation_passed: boolean;
  leakage_detected: boolean;
  diagnostic_generated: boolean;
  timestamp: string;
}


