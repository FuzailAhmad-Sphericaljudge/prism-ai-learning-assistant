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
