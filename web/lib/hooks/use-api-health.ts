"use client";

import * as React from "react";
import { getApiBaseUrl } from "@/lib/api-client";

export type ApiHealthStatus = "online" | "offline" | "checking";

export interface ApiHealthData {
  status: string;
  app: string;
  version: string;
  environment: string;
  llm_provider: string;
  uptime_seconds?: number;
  timestamp?: string;
}

export function useApiHealth(intervalMs: number = 30000) {
  const [status, setStatus] = React.useState<ApiHealthStatus>("checking");
  const [data, setData] = React.useState<ApiHealthData | null>(null);
  const [lastChecked, setLastChecked] = React.useState<Date | null>(null);

  const checkHealth = React.useCallback(async () => {
    const apiUrl = getApiBaseUrl();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${apiUrl}/health`, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json: ApiHealthData = await res.json();
        setData(json);
        setStatus("online");
      } else {
        setStatus("offline");
      }
    } catch {
      // In demo environments without live backend yet, report graceful offline
      setStatus("offline");
    } finally {
      setLastChecked(new Date());
    }
  }, []);

  React.useEffect(() => {
    checkHealth();
    const timer = setInterval(checkHealth, intervalMs);
    return () => clearInterval(timer);
  }, [checkHealth, intervalMs]);

  return { status, data, lastChecked, refetch: checkHealth };
}
