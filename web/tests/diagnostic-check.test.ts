import { test } from "node:test";
import assert from "node:assert/strict";

interface DiagnosticCheck {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

function evaluateOption(check: DiagnosticCheck, selectedIndex: number) {
  const isCorrect = selectedIndex === check.correct_index;
  const selectedText = check.options[selectedIndex];
  const correctText = check.options[check.correct_index];
  const optionLetter = String.fromCharCode(65 + selectedIndex);
  return {
    isCorrect,
    selectedText,
    correctText,
    optionLetter,
    feedback: isCorrect ? "Spot on!" : "Not quite.",
    explanation: check.explanation,
  };
}

test("DiagnosticCheckCard correctly evaluates correct answer", () => {
  const check: DiagnosticCheck = {
    question: "What is the time complexity of searching in a balanced BST?",
    options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
    correct_index: 1,
    explanation: "Because a balanced BST discards half the remaining subtree at each step.",
  };

  const result = evaluateOption(check, 1);
  assert.equal(result.isCorrect, true);
  assert.equal(result.optionLetter, "B");
  assert.equal(result.selectedText, "O(log N)");
  assert.equal(result.feedback, "Spot on!");
  assert.ok(result.explanation.includes("discards half"));
});

test("DiagnosticCheckCard correctly evaluates incorrect answer and reveals explanation", () => {
  const check: DiagnosticCheck = {
    question: "What is the time complexity of searching in a balanced BST?",
    options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
    correct_index: 1,
    explanation: "Because a balanced BST discards half the remaining subtree at each step.",
  };

  const result = evaluateOption(check, 2);
  assert.equal(result.isCorrect, false);
  assert.equal(result.optionLetter, "C");
  assert.equal(result.selectedText, "O(N)");
  assert.equal(result.correctText, "O(log N)");
  assert.equal(result.feedback, "Not quite.");
});
