#!/usr/bin/env bash
# ========================================================
# PRISM API Production Smoke Test Suite
# Team The Falcons — Hackathon 2026
# Tests /health, /courses, /retrieve/debug, /chat, and /admin/metrics
# ========================================================
set -e

BASE_URL="${1:-${PRISM_API_URL:-http://localhost:8000}}"
BASE_URL="${BASE_URL%/}"

echo "=================================================="
echo " Starting PRISM Smoke Test Suite"
echo " Target Endpoint: ${BASE_URL}"
echo "=================================================="

FAILED=0

run_check() {
  local name="$1"
  local method="$2"
  local endpoint="$3"
  local data="$4"

  echo -n "Checking ${name} (${method} ${endpoint})... "
  
  if [ "${method}" = "GET" ]; then
    HTTP_CODE=$(curl -s -o /tmp/prism_smoke_out.txt -w "%{http_code}" "${BASE_URL}${endpoint}")
  else
    HTTP_CODE=$(curl -s -o /tmp/prism_smoke_out.txt -w "%{http_code}" -X "${method}" \
      -H "Content-Type: application/json" \
      -d "${data}" "${BASE_URL}${endpoint}")
  fi

  if [ "${HTTP_CODE}" -ge 200 ] && [ "${HTTP_CODE}" -lt 300 ]; then
    echo "✓ [PASS ${HTTP_CODE}]"
  else
    echo "✗ [FAIL ${HTTP_CODE}]"
    cat /tmp/prism_smoke_out.txt
    echo ""
    FAILED=$((FAILED + 1))
  fi
}

# 1. Health Probe
run_check "Health Check" "GET" "/health" ""

# 2. Version and Root Endpoint
run_check "Root Info" "GET" "/" ""

# 3. List Seeded Courses
run_check "Courses Listing" "GET" "/courses" ""

# 4. Candidate Retrieval Debug
RETRIEVE_PAYLOAD='{"course_id":"00000000-0000-0000-0000-000000000002","query":"What is a binary search tree?","playback_sec":1122.0,"mode":"learn_so_far"}'
run_check "Firewall Retrieval Debug" "POST" "/retrieve/debug" "${RETRIEVE_PAYLOAD}"

# 5. Synchronous Chat Answer
CHAT_PAYLOAD='{"course_id":"00000000-0000-0000-0000-000000000002","query":"What is an attention head?","playback_sec":300.0,"mode":"learn_so_far"}'
run_check "Grounded Chat Generation" "POST" "/chat" "${CHAT_PAYLOAD}"

# 6. Admin Observability Metrics
run_check "Admin Observability Metrics" "GET" "/admin/metrics" ""

echo "=================================================="
if [ ${FAILED} -eq 0 ]; then
  echo " All Smoke Tests Passed Successfully! [6/6]"
  echo " PRISM API is Production Ready & Resilient."
  echo "=================================================="
  exit 0
else
  echo " Smoke Test Suite Finished with ${FAILED} Failures."
  echo "=================================================="
  exit 1
fi
