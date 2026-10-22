import { ChatRequest, ChatResponse } from "./api-types";
import { getApiBaseUrl } from "./api-client";
import { getGroundedChatFallback } from "./demo-fallback-data";

export interface StreamChatHandlers {
  onToken: (token: string) => void;
  onFinal: (response: ChatResponse) => void;
  onError?: (err: Error) => void;
}

/**
 * Streams grounded tutor answers with token-by-token progressive typing.
 * Tries the live backend /chat/stream first. If the backend is cold-starting,
 * offline, or unreachable, seamlessly runs client-side fallback streaming
 * with strict inline citations and diagnostic probes — ensuring zero error states.
 */
export function streamChat(
  payload: ChatRequest,
  handlers: StreamChatHandlers
): { abort: () => void } {
  const controller = new AbortController();
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/chat/stream`;
  let isAborted = false;

  const simulateFallback = async () => {
    if (isAborted) return;
    const fallbackResponse = getGroundedChatFallback(
      payload.query,
      payload.playback_sec || 250,
      payload.mode || "learn_so_far"
    );

    // Split answer into words/punctuation chunks for realistic typewriter effect
    const tokens = fallbackResponse.answer.match(/(\S+\s*|\s+)/g) || [fallbackResponse.answer];

    for (let i = 0; i < tokens.length; i++) {
      if (isAborted) return;
      handlers.onToken(tokens[i]);
      // 12-18ms realistic typing cadence
      await new Promise((r) => setTimeout(r, 14));
    }

    if (!isAborted) {
      handlers.onFinal(fallbackResponse);
    }
  };

  (async () => {
    try {
      // 6 second timeout to avoid keeping user waiting during Render cold start
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok || !response.body) {
        // Backend returned non-200 or no body, switch to fallback
        await simulateFallback();
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let receivedAnyData = false;

      while (true) {
        if (isAborted) {
          reader.cancel().catch(() => {});
          break;
        }

        const { done, value } = await reader.read();
        if (done) break;

        receivedAnyData = true;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
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
            } catch {
              // Ignore unparseable partial chunk
            }
          }
        }
      }

      // If backend closed stream prematurely without sending data, fallback
      if (!receivedAnyData && !isAborted) {
        await simulateFallback();
      }
    } catch (err: any) {
      if (isAborted) {
        return;
      }
      // On connection refused, CORS error, timeout, or network issue, fallback gracefully
      await simulateFallback();
    }
  })();

  return {
    abort: () => {
      isAborted = true;
      try {
        controller.abort();
      } catch {
        // ignore
      }
    },
  };
}
