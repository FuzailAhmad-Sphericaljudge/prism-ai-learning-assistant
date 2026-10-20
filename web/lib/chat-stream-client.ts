import { ChatRequest, ChatResponse } from "./api-types";

export interface StreamChatHandlers {
  onToken: (token: string) => void;
  onFinal: (response: ChatResponse) => void;
  onError?: (err: Error) => void;
}

export function streamChat(
  payload: ChatRequest,
  handlers: StreamChatHandlers
): { abort: () => void } {
  const controller = new AbortController();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const url = `${baseUrl.replace(/\/$/, "")}/chat/stream`;

  (async () => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errMessage = `HTTP ${response.status}`;
        try {
          const errJson = await response.json();
          errMessage = errJson.detail || errMessage;
        } catch {
          // ignore
        }
        throw new Error(errMessage);
      }

      if (!response.body) {
        throw new Error("No response body available for SSE stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep the last partial line in the buffer
        buffer = lines.pop() || "";

        let currentEvent = "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            currentEvent = "";
            continue;
          }

          if (trimmed.startsWith("event:")) {
            currentEvent = trimmed.replace("event:", "").trim();
          } else if (trimmed.startsWith("data:")) {
            const dataStr = trimmed.replace("data:", "").trim();
            try {
              const parsed = JSON.parse(dataStr);
              if (currentEvent === "token" || parsed.token !== undefined) {
                handlers.onToken(parsed.token);
              } else if (currentEvent === "final" || parsed.answer !== undefined) {
                handlers.onFinal(parsed as ChatResponse);
              }
            } catch (jsonErr) {
              // Ignore unparseable partial chunk
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        // Stream deliberately aborted by user
        return;
      }
      if (handlers.onError) {
        handlers.onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  })();

  return {
    abort: () => controller.abort(),
  };
}
