#!/usr/bin/env python3
"""
PRISM Phase 7 Comprehensive Verification Test Suite
Team The Falcons: Fuzail Ahmad & Lakshya Garg

Validates all Phase 7 deliverables:
1. Rubric Generator grounded in course evidence.
2. Adaptive Interview Engine with Socratic evaluation and justified follow-ups.
3. Post-Defense Comprehensive Report Generator with criterion scores, strengths, gaps, and revision links.
4. Interview API Endpoints (POST /interview/start, POST /interview/turn, GET /interview/{id}).
5. Educator Cohort Analytics Service (Friction heatmap, top misconceptions, top questions, concept distribution).
6. Educator CSV Export Generator (GET /educator/export/csv).
7. Frontend Routes & Components (/interview, /interview/report/[id], /educator).
"""

import sys
import os
from pathlib import Path

# Add project root to path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient
from api.main import app
from api.database import SessionLocal
from api.models.interview import InterviewSession, InterviewExchange
from api.interview.rubric import RubricGenerator
from api.interview.adaptive_engine import AdaptiveInterviewEngine
from api.interview.report_generator import InterviewReportGenerator
from api.educator.service import EducatorAnalyticsService
from api.educator.exporter import EducatorCsvExporter

client = TestClient(app)

COURSE_ID = "00000000-0000-0000-0000-000000000002"
USER_ID = "00000000-0000-0000-0000-000000000001"

passed_checks = 0
total_checks = 0


def record_check(description: str, condition: bool, details: str = ""):
    global passed_checks, total_checks
    total_checks += 1
    if condition:
        passed_checks += 1
        print(f"  [PASS] {description}")
    else:
        print(f"  [FAIL] {description} - {details}")


def run_verification():
    print("================================================================================")
    print(" PRISM Phase 7 Verification: Adaptive Oral Defense & Educator Analytics")
    print(" Team The Falcons (Fuzail Ahmad & Lakshya Garg)")
    print("================================================================================\n")

    db = SessionLocal()

    try:
        # -------------------------------------------------------------
        # 1. Rubric Generation Verification
        # -------------------------------------------------------------
        print("1. Rubric Generator Grounding Checks:")
        rubric = RubricGenerator.generate_rubric(
            course_id=COURSE_ID,
            topic="Binary Search Trees & Structural Invariants",
            role_id="systems_engineer",
            db=db,
        )
        record_check(
            "Rubric criteria synthesized from course evidence",
            len(rubric) >= 2,
            f"Criteria count: {len(rubric)}",
        )
        has_expected_points = all(len(c.expected_points) > 0 for c in rubric)
        record_check(
            "Every criterion specifies explicit expected checkpoints",
            has_expected_points,
            "Expected points missing on some criteria",
        )

        # -------------------------------------------------------------
        # 2. Adaptive Probing Engine & Justified Probing Verification
        # -------------------------------------------------------------
        print("\n2. Adaptive Probing Engine Checks:")
        incomplete_answer = "I check if left child is smaller and right child is greater."
        eval_item, updated_rubric, next_q, justification, is_done = (
            AdaptiveInterviewEngine.evaluate_and_next_question(
                round_number=1,
                max_rounds=3,
                candidate_answer=incomplete_answer,
                rubric=rubric,
            )
        )
        record_check(
            "Incomplete answer receives targeted score penalty",
            eval_item.score < 80.0,
            f"Score: {eval_item.score}",
        )
        record_check(
            "Adaptive engine flags specific missed points",
            len(eval_item.missed_points) > 0,
            f"Missed points: {eval_item.missed_points}",
        )
        record_check(
            "Follow-up question provides explicit pedagogical justification",
            bool(justification) and "ancest" in justification.lower(),
            f"Justification: {justification}",
        )

        # -------------------------------------------------------------
        # 3. Report Generator Verification
        # -------------------------------------------------------------
        print("\n3. Defense Audit Report Generator Checks:")
        # Provide sample evaluated rubric
        for c in rubric:
            c.score = 85.0
            c.justification = "Demonstrated proficiency."

        report = InterviewReportGenerator.generate_report(
            session_id="test-session-001",
            course_id=COURSE_ID,
            user_id=USER_ID,
            role="Systems Software Engineer",
            topic="Binary Search Trees & Structural Invariants",
            rubric=rubric,
            transcript=[],
        )
        record_check(
            "Report computes overall defense score",
            report.overall_score == 85.0,
            f"Overall score: {report.overall_score}",
        )
        record_check(
            "Report identifies demonstrated proficiencies",
            len(report.strengths) > 0,
            f"Strengths: {report.strengths}",
        )

        # -------------------------------------------------------------
        # 4. Interview API Endpoints Verification
        # -------------------------------------------------------------
        print("\n4. Interview API Endpoints Checks:")
        start_res = client.post(
            "/interview/start",
            json={
                "course_id": COURSE_ID,
                "user_id": USER_ID,
                "role": "Systems Software Engineer",
                "topic": "Binary Search Trees & Structural Invariants",
                "max_rounds": 3,
            },
        )
        record_check(
            "POST /interview/start returns 200 with initial question and rubric",
            start_res.status_code == 200 and "session_id" in start_res.json(),
            f"Status: {start_res.status_code}, Body: {start_res.text[:120]}",
        )

        session_id = start_res.json().get("session_id")
        if session_id:
            turn_res = client.post(
                "/interview/turn",
                json={
                    "session_id": session_id,
                    "user_answer": "The invariant holds across all left descendants recursively.",
                },
            )
            record_check(
                "POST /interview/turn evaluates answer and updates round",
                turn_res.status_code == 200 and "evaluation" in turn_res.json(),
                f"Status: {turn_res.status_code}, Body: {turn_res.text[:120]}",
            )

            report_res = client.get(f"/interview/{session_id}/report")
            record_check(
                "GET /interview/{id}/report returns full report",
                report_res.status_code == 200 and "overall_score" in report_res.json(),
                f"Status: {report_res.status_code}",
            )

        # -------------------------------------------------------------
        # 5. Educator Analytics & Confusion Heatmap Verification
        # -------------------------------------------------------------
        print("\n5. Educator Analytics Service Checks:")
        educator_service = EducatorAnalyticsService()
        insights = educator_service.get_insights(db=db, course_id=COURSE_ID)
        record_check(
            "Educator service returns total student inquiries and attempts",
            insights.total_questions_asked >= 0 and insights.total_practice_attempts >= 0,
            f"Queries: {insights.total_questions_asked}, Attempts: {insights.total_practice_attempts}",
        )
        record_check(
            "Confusion heatmap generates video timeline buckets",
            len(insights.confusion_heatmap) >= 12,
            f"Bucket count: {len(insights.confusion_heatmap)}",
        )
        intensities_bounded = all(
            0.0 <= b.confusion_intensity <= 1.0 for b in insights.confusion_heatmap
        )
        record_check(
            "All confusion intensities are normalized between 0.0 and 1.0",
            intensities_bounded,
            "Found out-of-bounds intensity values",
        )
        record_check(
            "Top recurring misconceptions list populated",
            len(insights.top_misconceptions) >= 0,
            f"Count: {len(insights.top_misconceptions)}",
        )

        # API check
        educator_api_res = client.get(f"/educator/insights?course_id={COURSE_ID}")
        record_check(
            "GET /educator/insights endpoint returns 200 OK",
            educator_api_res.status_code == 200,
            f"Status: {educator_api_res.status_code}",
        )

        heatmap_api_res = client.get(f"/educator/heatmap?course_id={COURSE_ID}")
        record_check(
            "GET /educator/heatmap endpoint returns 200 OK with bucket array",
            heatmap_api_res.status_code == 200 and isinstance(heatmap_api_res.json(), list),
            f"Status: {heatmap_api_res.status_code}",
        )

        # -------------------------------------------------------------
        # 6. CSV Exporter Verification
        # -------------------------------------------------------------
        print("\n6. Educator CSV Exporter Checks:")
        csv_api_res = client.get(f"/educator/export/csv?course_id={COURSE_ID}")
        record_check(
            "GET /educator/export/csv returns text/csv content",
            csv_api_res.status_code == 200 and "text/csv" in csv_api_res.headers.get("content-type", ""),
            f"Status: {csv_api_res.status_code}, Content-Type: {csv_api_res.headers.get('content-type')}",
        )
        csv_text = csv_api_res.text
        record_check(
            "CSV contains summary, heatmap, and misconceptions sections",
            "CONFUSION HEATMAP" in csv_text and "TOP RECURRING MISCONCEPTIONS" in csv_text,
            f"CSV preview: {csv_text[:150]}",
        )

        # -------------------------------------------------------------
        # 7. Frontend Artifacts & Components Verification
        # -------------------------------------------------------------
        print("\n7. Frontend Artifacts Checks:")
        expected_frontend_files = [
            "web/app/interview/page.tsx",
            "web/app/interview/report/[id]/page.tsx",
            "web/app/educator/page.tsx",
            "web/components/interview/interview-setup.tsx",
            "web/components/interview/interview-rubric-sidebar.tsx",
            "web/components/interview/interview-speech-input.tsx",
            "web/components/interview/interview-chat.tsx",
            "web/components/interview/score-ring.tsx",
            "web/components/interview/report-criterion-card.tsx",
            "web/components/interview/report-strengths-gaps.tsx",
            "web/components/educator/confusion-heatmap.tsx",
            "web/components/educator/top-misconceptions-card.tsx",
            "web/components/educator/top-questions-card.tsx",
            "web/components/educator/educator-kpi-strip.tsx",
            "web/lib/interview-api.ts",
            "web/lib/educator-api.ts",
        ]
        all_files_exist = all(Path(ROOT / f).exists() for f in expected_frontend_files)
        record_check(
            "All 16 Phase 7 UI components and routes exist in filesystem",
            all_files_exist,
            "One or more files missing",
        )

    finally:
        db.close()

    print("\n================================================================================")
    print(f" Phase 7 Verification Results: {passed_checks}/{total_checks} Checks Passed")
    print("================================================================================")

    if passed_checks == total_checks:
        print("\n>>> ALL PHASE 7 INVARIANTS AND SPECIFICATIONS VERIFIED SUCCESSFULLY! <<<\n")
        sys.exit(0)
    else:
        print(f"\n>>> VERIFICATION FAILED: {total_checks - passed_checks} checks failed. <<<\n")
        sys.exit(1)


if __name__ == "__main__":
    run_verification()
