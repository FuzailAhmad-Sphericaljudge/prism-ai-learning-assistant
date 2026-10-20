#!/usr/bin/env python3
"""
PRISM Phase 5 Verification Suite
Executes all unit, integration, and end-to-end tests for Grounded Answers,
Output Validation, SSE Streaming, Evidence Inspector Drawer, and Diagnostic Checks.
"""

import sys
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

PYTHON_TEST_SUITES = [
    "api/tests/test_output_validator.py",
    "api/tests/test_tutor_workflow.py",
    "api/tests/test_message_persistence.py",
    "api/tests/test_chat_stream.py",
    "api/tests/test_chat_endpoint.py",
    "api/tests/test_e2e_grounded_answer.py",
    "api/tests/test_future_question_e2e.py",
]

NODE_TEST_SUITES = [
    "web/tests/chat-stream.test.ts",
    "web/tests/diagnostic-check.test.ts",
    "web/tests/citation-chip.test.ts",
]


def run_phase5_verification():
    print("=" * 65)
    print("  PRISM Phase 5: Grounded Answers & Evidence Inspector Verification")
    print("  Team The Falcons (Fuzail Ahmad & Lakshya Garg)")
    print("=" * 65)

    # 1. Execute Backend Pytest Suite
    print("\n[1/2] Running Backend Tutor & Output Validator Tests (pytest)...")
    cmd_py = [sys.executable, "-m", "pytest", "-v"] + PYTHON_TEST_SUITES
    res_py = subprocess.run(cmd_py, cwd=ROOT_DIR, capture_output=True, text=True)
    print(res_py.stdout)
    if res_py.stderr and "warning" not in res_py.stderr.lower():
        print(res_py.stderr)

    if res_py.returncode != 0:
        print("\n>>> BACKEND PHASE 5 TESTS FAILED <<<")
        return False

    # 2. Execute Frontend Node Test Suite
    print("\n[2/2] Running Frontend Stream & Citation Tests (node --test)...")
    cmd_node = ["node", "--test"] + NODE_TEST_SUITES
    res_node = subprocess.run(cmd_node, cwd=ROOT_DIR, capture_output=True, text=True)
    print(res_node.stdout)
    if res_node.stderr and "warning" not in res_node.stderr.lower():
        print(res_node.stderr)

    if res_node.returncode != 0:
        print("\n>>> FRONTEND PHASE 5 TESTS FAILED <<<")
        return False

    print("\n" + "=" * 65)
    print(">>> ALL PHASE 5 GROUNDED TUTOR & EVIDENCE TESTS PASSED <<<")
    print("  - Output Validator Invariants Enforced (Zero Hallucinated IDs)")
    print("  - Server-Sent Events (SSE) Progressive Token Streaming Verified")
    print("  - Message Persistence with Citation Snapshot Persisted")
    print("  - Diagnostic Check Card Evaluation Verified")
    print("  - Future Questions Safely Withheld with Spoiler Guardrails")
    print("=" * 65)
    return True


if __name__ == "__main__":
    success = run_phase5_verification()
    sys.exit(0 if success else 1)
