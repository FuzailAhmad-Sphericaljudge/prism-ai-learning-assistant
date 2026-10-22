import { apiClient } from "@/lib/api-client";
import { AdminMetricsResponse, TraceItem } from "@/lib/api-types";

/**
 * Fetch aggregated system performance, latency percentiles, and firewall validation pass rate.
 */
export async function fetchAdminMetrics(): Promise<AdminMetricsResponse> {
  return apiClient<AdminMetricsResponse>("/admin/metrics");
}

/**
 * Fetch recent telemetry request traces.
 */
export async function fetchAdminTraces(limit: number = 50): Promise<TraceItem[]> {
  return apiClient<TraceItem[]>(`/admin/traces?limit=${limit}`);
}

/**
 * Trigger full benchmark evaluation runner on the backend.
 */
export async function triggerEvalRun(): Promise<{
  status: string;
  summary: any;
  total_questions: number;
  generated_at: string;
}> {
  return apiClient<{
    status: string;
    summary: any;
    total_questions: number;
    generated_at: string;
  }>("/admin/run-eval", {
    method: "POST",
  });
}
