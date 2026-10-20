#!/usr/bin/env python3
"""
PRISM Phase 4 Verification Suite
Executes all unit and integration tests for the Temporal Evidence Firewall,
Hybrid Retrieval (pgvector + tsvector + RRF), Policy Layer, Scoped Context Builder,
and Anti-Leakage Invariants.
"""

import sys
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

TEST_SUITES = [
    "api/tests/test_prefix_interpolator.py",
    "api/tests/test_firewall.py",
    "api/tests/test_rrf.py",
    "api/tests/test_context_resolver.py",
    "api/tests/test_context_builder.py",
    "api/tests/test_cache_keys.py",
    "api/tests/test_session_endpoints.py",
    "api/tests/test_retrieve_endpoint.py",
    "api/tests/test_boundary_conditions.py",
    "api/tests/test_leakage_adversarial.py",
    "api/tests/test_end_to_end_firewall.py",
]


def run_tests():
    print("==================================================")
    print("  PRISM Phase 4: Core Backend Innovation Tests")
    print("  Temporal Evidence Firewall & Hybrid Retrieval")
    print("==================================================")

    cmd = [sys.executable, "-m", "pytest", "-v"] + TEST_SUITES
    print(f"Executing: {' '.join(cmd)}\n")

    result = subprocess.run(cmd, cwd=ROOT_DIR, capture_output=True, text=True)

    print(result.stdout)
    if result.stderr:
        print(result.stderr)

    if result.returncode == 0:
        print("\n==================================================")
        print(">>> ALL PHASE 4 INVARIANT AND UNIT TESTS PASSED <<<")
        print("==================================================")
        return True
    else:
        print("\n==================================================")
        print(">>> SOME PHASE 4 TESTS FAILED <<<")
        print("==================================================")
        return False


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)

