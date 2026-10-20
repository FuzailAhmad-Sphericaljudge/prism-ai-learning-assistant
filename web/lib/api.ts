import { apiClient } from "@/lib/api-client";
import {
  Course,
  CourseTranscriptResponse,
  CourseResourcesResponse,
  SourceStatusResponse,
} from "@/lib/api-types";

/**
 * Fetch all registered courses with multi-modal source counts.
 */
export async function fetchCourses(): Promise<Course[]> {
  return apiClient<Course[]>("/courses");
}

/**
 * Fetch a single course by ID.
 */
export async function fetchCourse(courseId: string): Promise<Course> {
  return apiClient<Course>(`/courses/${courseId}`);
}

/**
 * Fetch transcript cues for a course with optional Temporal Firewall max_time_sec cutoff.
 */
export async function fetchCourseTranscript(
  courseId: string,
  maxTimeSec?: number
): Promise<CourseTranscriptResponse> {
  const query = maxTimeSec !== undefined ? `?max_time_sec=${maxTimeSec}` : "";
  return apiClient<CourseTranscriptResponse>(`/courses/${courseId}/transcript${query}`);
}

/**
 * Fetch all course materials grouped by modality (video, pdf, ppt, notes).
 */
export async function fetchCourseResources(
  courseId: string
): Promise<CourseResourcesResponse> {
  return apiClient<CourseResourcesResponse>(`/courses/${courseId}/resources`);
}

/**
 * Poll ingestion state and chunk count for a specific source.
 */
export async function fetchSourceStatus(
  sourceId: string
): Promise<SourceStatusResponse> {
  return apiClient<SourceStatusResponse>(`/sources/${sourceId}/status`);
}

/**
 * Returns the direct URL to stream an uploaded source file from the API.
 */
export function getSourceFileUrl(sourceId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${baseUrl.replace(/\/$/, "")}/sources/${sourceId}/file`;
}
