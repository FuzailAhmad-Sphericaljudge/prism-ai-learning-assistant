import { apiClient, getApiBaseUrl } from "@/lib/api-client";
import {
  Course,
  CourseTranscriptResponse,
  CourseResourcesResponse,
  SourceStatusResponse,
} from "@/lib/api-types";
import {
  DEMO_COURSE,
  DEMO_COURSES,
  DEMO_TRANSCRIPT,
  DEMO_TRANSCRIPT_CUES,
  DEMO_RESOURCES,
} from "@/lib/demo-fallback-data";

/**
 * Fetch all registered courses with multi-modal source counts.
 */
export async function fetchCourses(): Promise<Course[]> {
  try {
    return await apiClient<Course[]>("/courses", { timeoutMs: 5000 });
  } catch {
    return DEMO_COURSES;
  }
}

/**
 * Fetch a single course by ID.
 */
export async function fetchCourse(courseId: string): Promise<Course> {
  try {
    return await apiClient<Course>(`/courses/${courseId}`, { timeoutMs: 5000 });
  } catch {
    const found = DEMO_COURSES.find((c) => c.id === courseId);
    return found || { ...DEMO_COURSE, id: courseId };
  }
}

/**
 * Fetch transcript cues for a course with optional Temporal Firewall max_time_sec cutoff.
 */
export async function fetchCourseTranscript(
  courseId: string,
  maxTimeSec?: number
): Promise<CourseTranscriptResponse> {
  try {
    const query = maxTimeSec !== undefined ? `?max_time_sec=${maxTimeSec}` : "";
    return await apiClient<CourseTranscriptResponse>(
      `/courses/${courseId}/transcript${query}`,
      { timeoutMs: 5000 }
    );
  } catch {
    if (maxTimeSec !== undefined) {
      return {
        ...DEMO_TRANSCRIPT,
        cues: DEMO_TRANSCRIPT_CUES.filter((c) => c.start_sec <= maxTimeSec),
        max_time_sec: maxTimeSec,
      };
    }
    return DEMO_TRANSCRIPT;
  }
}

/**
 * Fetch all course materials grouped by modality (video, pdf, ppt, notes).
 */
export async function fetchCourseResources(
  courseId: string
): Promise<CourseResourcesResponse> {
  try {
    return await apiClient<CourseResourcesResponse>(
      `/courses/${courseId}/resources`,
      { timeoutMs: 5000 }
    );
  } catch {
    return DEMO_RESOURCES;
  }
}

/**
 * Poll ingestion state and chunk count for a specific source.
 */
export async function fetchSourceStatus(
  sourceId: string
): Promise<SourceStatusResponse> {
  try {
    return await apiClient<SourceStatusResponse>(`/sources/${sourceId}/status`, {
      timeoutMs: 5000,
    });
  } catch {
    return {
      id: sourceId,
      course_id: DEMO_COURSE.id,
      type: "video",
      title: "Lecture 14: Binary Search Trees (Recording)",
      status: "ready",
      chunk_count: 42,
      duration_sec: 1800,
      version: 1,
    };
  }
}

/**
 * Returns the direct URL to stream an uploaded source file from the API.
 */
export function getSourceFileUrl(sourceId: string): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/sources/${sourceId}/file`;
}
