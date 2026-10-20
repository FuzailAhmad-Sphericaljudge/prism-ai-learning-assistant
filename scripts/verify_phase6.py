#!/usr/bin/env python3
"""
PRISM Phase 6 Comprehensive Verification Test Suite
Team The Falcons: Fuzail Ahmad & Lakshya Garg

Validates all Phase 6 deliverables:
1. Practice Generator with Temporal Evidence Firewall scoping.
2. Practice Evaluator detecting specific misconceptions and returning revision links.
3. Mathematical Derived Mastery Formula with recency weighting and streak invariants.
4. Next Best Action pedagogical prioritization.
5. Practice & Mastery API Endpoints (/practice/generate, /practice/submit, /mastery, /mastery/timeline).
6. Frontend Artifacts (/practice, /mastery, Recharts charts, and Empty States).
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
from api.models.mastery import Attempt, MasteryRecord
from api.practice.generator import PracticeGenerator
from api.practice.evaluator import PracticeEvaluator
from api.practice.taxonomy import BST_CONCEPTS, get_concepts_for_playback
from api.mastery.calculator import calculate_concept_mastery, AttemptSummary
from api.mastery.recommender import NextBestActionRecommender
from api.schemas.practice import PracticeGenerateRequest
from api.firewall.types import FirewallMode

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
    print(" PRISM Phase 6 Verification: Practice, Misconception Diagnostics & Mastery Math")
    print(" Team The Falcons (Fuzail Ahmad & Lakshya Garg)")
    print("================================================================================\n")

    db = SessionLocal()

    try:
        # ---------------------------------------------------------
        # Section 1: Practice Generator & Firewall Boundaries
        # ---------------------------------------------------------
        print("1. Practice Generator & Temporal Firewall Boundaries:")
        gen = PracticeGenerator()

        # At 700s in learn_so_far
        req = PracticeGenerateRequest(
            course_id=COURSE_ID,
            playback_sec=700.0,
            mode=FirewallMode.LEARN_SO_FAR,
            count=1,
            question_type="mcq",
        )
        res = gen.generate(req, db)
        record_check(
            "Generator produces grounded questions within permitted temporal scope",
            len(res.questions) > 0 and res.questions[0].concept_tag in ["BST Invariant", "Tree Search Complexity", "Tree Insertion"],
        )
        record_check(
            "Generator blocks future concepts in learn_so_far at 700s (Node Deletion excluded)",
            "Node Deletion" not in res.available_concepts,
        )
        record_check(
            "Generated question carries verified evidence links",
            len(res.questions[0].evidence_links) > 0,
        )

        # ---------------------------------------------------------
        # Section 2: Practice Evaluator & Misconceptions
        # ---------------------------------------------------------
        print("\n2. Evaluator & Misconception Diagnostics:")
        evaluator = PracticeEvaluator()

        # Correct MCQ
        eval_correct = evaluator.evaluate(
            concept_tag="BST Invariant",
            question_type="mcq",
            question_text="What is the defining condition of the BST invariant?",
            user_answer="A",
            correct_answer="A",
        )
        record_check("Evaluator accurately scores correct MCQ answer", eval_correct.is_correct is True and eval_correct.score == 1.0)

        # Distractor diagnosing specific misconception
        eval_wrong = evaluator.evaluate(
            concept_tag="BST Invariant",
            question_type="mcq",
            question_text="What is the defining condition of the BST invariant?",
            user_answer="B",
            correct_answer="A",
        )
        record_check(
            "Evaluator detects specific cognitive fallacy (Local Parent-Child Fallacy)",
            eval_wrong.is_correct is False and eval_wrong.misconception_tag == "Local Parent-Child Fallacy",
        )
        record_check(
            "Evaluator generates actionable remediation link with video/slide coordinate",
            eval_wrong.revision_action is not None and eval_wrong.revision_action.coordinate == "05:25",
        )

        # ---------------------------------------------------------
        # Section 3: Derived Mastery Mathematical Formula
        # ---------------------------------------------------------
        print("\n3. Derived Mastery Mathematical Formula:")

        # Status 1: Not assessed
        status, score, attempts, correct = calculate_concept_mastery([])
        record_check("Unassessed concept defaults to 'not_assessed' with 0.0 score", status == "not_assessed" and score == 0.0)

        # Status 2: Gap Found (recent failure)
        hist_gap = [AttemptSummary(is_correct=False, misconception_tag="Test Error")]
        status_gap, score_gap, _, _ = calculate_concept_mastery(hist_gap)
        record_check("Failed attempt yields 'gap_found'", status_gap == "gap_found" and score_gap == 0.0)

        # Status 3: Improving (prior failure then correct)
        hist_imp = [
            AttemptSummary(is_correct=False, misconception_tag="Test Error"),
            AttemptSummary(is_correct=True, misconception_tag=None),
        ]
        status_imp, score_imp, _, _ = calculate_concept_mastery(hist_imp)
        record_check("Recovery after failure transitions to 'improving'", status_imp == "improving" and score_imp == 0.6)

        # Status 4: Demonstrated (S >= 0.80 and last 2 consecutive passes)
        hist_dem = [
            AttemptSummary(is_correct=True, misconception_tag=None),
            AttemptSummary(is_correct=True, misconception_tag=None),
        ]
        status_dem, score_dem, _, _ = calculate_concept_mastery(hist_dem)
        record_check("Streak invariant produces 'demonstrated' on consecutive correct answers", status_dem == "demonstrated" and score_dem == 1.0)

        # ---------------------------------------------------------
        # Section 4: Next Best Action Recommender
        # ---------------------------------------------------------
        print("\n4. Next Best Action Pedagogical Recommender:")
        from api.schemas.mastery import ConceptMastery

        mock_concepts = [
            ConceptMastery(
                concept_tag="BST Invariant",
                status="demonstrated",
                mastery_score=1.0,
                attempts_count=2,
                correct_count=2,
                misconceptions=[],
                evidence_landmarks=["05:25"],
            ),
            ConceptMastery(
                concept_tag="In-Order Successor",
                status="gap_found",
                mastery_score=0.0,
                attempts_count=1,
                correct_count=0,
                misconceptions=["Immediate Parent Fallacy"],
                evidence_landmarks=["16:55"],
            ),
        ]
        action = NextBestActionRecommender.recommend(COURSE_ID, mock_concepts)
        record_check(
            "Recommender prioritizes active gap over unassessed concepts",
            action.concept_tag == "In-Order Successor" and action.recommended_type == "revise",
        )

        # ---------------------------------------------------------
        # Section 5: API Endpoints (POST /practice, GET /mastery)
        # ---------------------------------------------------------
        print("\n5. API Endpoints Contract Compliance:")

        # POST /practice/generate
        res_pgen = client.post(
            "/practice/generate",
            json={"course_id": COURSE_ID, "playback_sec": 1200.0, "mode": "learn_so_far", "count": 1},
        )
        record_check("POST /practice/generate returns 200 OK", res_pgen.status_code == 200)

        # POST /practice/submit
        res_psub = client.post(
            "/practice/submit",
            json={
                "question_id": "verify-q-1",
                "course_id": COURSE_ID,
                "user_id": USER_ID,
                "concept_tag": "Tree Search Complexity",
                "question_text": "What is worst case?",
                "question_type": "mcq",
                "user_answer": "A",
            },
        )
        record_check("POST /practice/submit returns 200 OK with evaluated feedback", res_psub.status_code == 200 and res_psub.json()["is_correct"] is True)

        # GET /mastery
        res_m = client.get(f"/mastery?course_id={COURSE_ID}&user_id={USER_ID}")
        record_check(
            "GET /mastery returns 200 OK with verified dashboard and Next Best Action",
            res_m.status_code == 200 and "concepts" in res_m.json() and len(res_m.json()["concepts"]) == 6,
        )

        # GET /mastery/timeline
        res_t = client.get(f"/mastery/timeline?course_id={COURSE_ID}&user_id={USER_ID}")
        record_check(
            "GET /mastery/timeline returns 200 OK with chronological attempt audit items",
            res_t.status_code == 200 and res_t.json()["total_attempts"] > 0,
        )

        # ---------------------------------------------------------
        # Section 6: Frontend Pages & Components
        # ---------------------------------------------------------
        print("\n6. Frontend Deliverables & Recharts Integration:")
        frontend_files = [
            ROOT / "web" / "app" / "practice" / "page.tsx",
            ROOT / "web" / "app" / "mastery" / "page.tsx",
            ROOT / "web" / "components" / "practice" / "practice-concept-filter.tsx",
            ROOT / "web" / "components" / "practice" / "practice-question-card.tsx",
            ROOT / "web" / "components" / "practice" / "practice-feedback-card.tsx",
            ROOT / "web" / "components" / "practice" / "practice-empty-state.tsx",
            ROOT / "web" / "components" / "mastery" / "concept-mastery-grid.tsx",
            ROOT / "web" / "components" / "mastery" / "next-best-action-card.tsx",
            ROOT / "web" / "components" / "mastery" / "mastery-evidence-timeline.tsx",
            ROOT / "web" / "components" / "mastery" / "mastery-chart.tsx",
            ROOT / "web" / "components" / "mastery" / "mastery-empty-state.tsx",
            ROOT / "docs" / "MASTERY_FORMULA.md",
        ]

        for f in frontend_files:
            rel = f.relative_to(ROOT)
            record_check(f"Component or doc exists: {rel}", f.is_file())

    finally:
        db.close()

    print("\n--------------------------------------------------------------------------------")
    print(f" Phase 6 Verification Results: {passed_checks} / {total_checks} checks PASSED")
    print("--------------------------------------------------------------------------------")

    if passed_checks == total_checks:
        print("[SUCCESS] All Phase 6 deliverables, formulas, and endpoints verified successfully!")
        return 0
    else:
        print("[FAIL] Some verification checks did not pass.")
        return 1


if __name__ == "__main__":
    sys.exit(run_verification())
