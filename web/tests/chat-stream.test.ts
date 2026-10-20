import { test } from "node:test";
import assert from "node:assert/strict";

test("SSE parser extracts tokens and final payload correctly", () => {
  const sseData = `
event: token
data: {"token": "Binary"}

event: token
data: {"token": " Search"}

event: token
data: {"token": " Trees"}

event: final
data: {"answer": "Binary Search Trees", "citations": [{"evidence_id": "E1", "coordinate": "05:00", "quote": "BST property"}], "validation_passed": true}
  `;

  const lines = sseData.split("\n");
  const tokens: string[] = [];
  let finalPayload: any = null;
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
      const parsed = JSON.parse(dataStr);
      if (currentEvent === "token" || parsed.token !== undefined) {
        tokens.push(parsed.token);
      } else if (currentEvent === "final" || parsed.answer !== undefined) {
        finalPayload = parsed;
      }
    }
  }

  assert.equal(tokens.join(""), "Binary Search Trees");
  assert.equal(finalPayload.answer, "Binary Search Trees");
  assert.equal(finalPayload.citations.length, 1);
  assert.equal(finalPayload.citations[0].evidence_id, "E1");
  assert.equal(finalPayload.validation_passed, true);
});

test("SSE parser handles future withheld fallback payload", () => {
  const finalJson = {
    answer: "This topic has not been covered yet in the lecture up to 05:00.",
    is_not_covered: true,
    available_at_sec: 1122.0,
    citations: [],
    validation_passed: true,
  };

  const sseChunk = `event: final\ndata: ${JSON.stringify(finalJson)}\n\n`;
  const dataLine = sseChunk.split("\n").find((l) => l.startsWith("data: "));
  assert.ok(dataLine);

  const parsed = JSON.parse(dataLine.replace("data: ", ""));
  assert.equal(parsed.is_not_covered, true);
  assert.equal(parsed.available_at_sec, 1122.0);
});
