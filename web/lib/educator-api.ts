import { apiClient, getApiBaseUrl } from "@/lib/api-client";
import { EducatorInsightsResponse, ConfusionHeatmapBucket } from "@/lib/api-types";
import {
  DEMO_COURSE_ID,
  DEMO_EDUCATOR_INSIGHTS,
  DEMO_CONFUSION_HEATMAP,
} from "@/lib/demo-fallback-data";

/**
 * Fetch comprehensive educator analytics dashboard data.
 */
export async function fetchEducatorInsights(
  courseId: string = DEMO_COURSE_ID
): Promise<EducatorInsightsResponse> {
  try {
    return await apiClient<EducatorInsightsResponse>(
      `/educator/insights?course_id=${encodeURIComponent(courseId)}`,
      { timeoutMs: 5000 }
    );
  } catch {
    return DEMO_EDUCATOR_INSIGHTS;
  }
}

/**
 * Fetch high-resolution confusion heatmap buckets along video playback timeline.
 */
export async function fetchConfusionHeatmap(
  courseId: string = DEMO_COURSE_ID,
  bucketSeconds: number = 120
): Promise<ConfusionHeatmapBucket[]> {
  try {
    return await apiClient<ConfusionHeatmapBucket[]>(
      `/educator/heatmap?course_id=${encodeURIComponent(courseId)}&bucket_seconds=${bucketSeconds}`,
      { timeoutMs: 5000 }
    );
  } catch {
    return DEMO_CONFUSION_HEATMAP;
  }
}

/**
 * Get direct download URL for educator CSV export.
 */
export function getEducatorCsvExportUrl(
  courseId: string = DEMO_COURSE_ID
): string {
  const base = getApiBaseUrl().replace(/\/$/, "");
  return `${base}/educator/export/csv?course_id=${encodeURIComponent(courseId)}`;
}
