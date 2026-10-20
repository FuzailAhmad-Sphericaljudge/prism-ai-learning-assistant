import { apiClient } from "@/lib/api-client";
import { EducatorInsightsResponse, ConfusionHeatmapBucket } from "@/lib/api-types";

const DEFAULT_COURSE_ID = "00000000-0000-0000-0000-000000000002";

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

/**
 * Fetch comprehensive educator analytics dashboard data.
 */
export async function fetchEducatorInsights(
  courseId: string = DEFAULT_COURSE_ID
): Promise<EducatorInsightsResponse> {
  return apiClient<EducatorInsightsResponse>(
    `/educator/insights?course_id=${encodeURIComponent(courseId)}`
  );
}

/**
 * Fetch high-resolution confusion heatmap buckets along video playback timeline.
 */
export async function fetchConfusionHeatmap(
  courseId: string = DEFAULT_COURSE_ID,
  bucketSeconds: number = 120
): Promise<ConfusionHeatmapBucket[]> {
  return apiClient<ConfusionHeatmapBucket[]>(
    `/educator/heatmap?course_id=${encodeURIComponent(courseId)}&bucket_seconds=${bucketSeconds}`
  );
}

/**
 * Get direct download URL for educator CSV export.
 */
export function getEducatorCsvExportUrl(
  courseId: string = DEFAULT_COURSE_ID
): string {
  const base = getApiBaseUrl().replace(/\/$/, "");
  return `${base}/educator/export/csv?course_id=${encodeURIComponent(courseId)}`;
}
