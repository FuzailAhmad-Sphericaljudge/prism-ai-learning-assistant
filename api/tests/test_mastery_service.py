import pytest
from api.database import SessionLocal
from api.mastery.service import MasteryService
from api.practice.evaluator import PracticeEvaluator
from api.schemas.practice import AttemptSubmitRequest


def test_mastery_service_record_attempt_and_dashboard():
    db = SessionLocal()
    try:
        service = MasteryService()
        evaluator = PracticeEvaluator()
        seeded_course_id = "00000000-0000-0000-0000-000000000002"
        test_user_id = "00000000-0000-0000-0000-000000000001"

        # 1. First attempt: incorrect MCQ on BST Invariant
        eval_res_1 = evaluator.evaluate(
            concept_tag="BST Invariant",
            question_type="mcq",
            question_text="What is the BST invariant?",
            user_answer="B",
            correct_answer="A",
            options=["Left < root <= right", "Direct children only", "Balanced height", "Array index"],
        )
        submit_req_1 = AttemptSubmitRequest(
            question_id="pq-01",
            course_id=seeded_course_id,
            user_id=test_user_id,
            concept_tag="BST Invariant",
            question_text="What is the BST invariant?",
            question_type="mcq",
            user_answer="B",
        )
        res_1 = service.record_attempt(db, submit_req_1, eval_res_1)
        assert res_1.is_correct is False
        assert res_1.updated_mastery_status == "gap_found"
        assert res_1.misconception_tag == "Local Parent-Child Fallacy"
        assert res_1.revision_action is not None

        # 2. Check dashboard: 1 assessed concept, status gap_found
        dash_1 = service.get_dashboard(db, course_id=seeded_course_id, user_id=test_user_id)
        assert dash_1.assessed_concepts == 1
        assert dash_1.gap_count == 1
        assert dash_1.demonstrated_count == 0
        assert dash_1.next_best_action is not None
        assert dash_1.next_best_action.recommended_type == "revise"
        assert dash_1.next_best_action.concept_tag == "BST Invariant"

        # 3. Second attempt: correct MCQ on BST Invariant -> transitions to improving
        eval_res_2 = evaluator.evaluate(
            concept_tag="BST Invariant",
            question_type="mcq",
            question_text="What is the BST invariant?",
            user_answer="A",
            correct_answer="A",
            options=["Left < root <= right", "Direct children only", "Balanced height", "Array index"],
        )
        submit_req_2 = AttemptSubmitRequest(
            question_id="pq-02",
            course_id=seeded_course_id,
            user_id=test_user_id,
            concept_tag="BST Invariant",
            question_text="What is the BST invariant?",
            question_type="mcq",
            user_answer="A",
        )
        res_2 = service.record_attempt(db, submit_req_2, eval_res_2)
        assert res_2.is_correct is True
        assert res_2.updated_mastery_status == "improving"

        # 4. Check timeline: returns 2 attempts ordered newest first
        timeline_res = service.get_timeline(db, course_id=seeded_course_id, user_id=test_user_id)
        assert timeline_res.total_attempts >= 2
        assert timeline_res.timeline[0].is_correct is True  # newest
        assert timeline_res.timeline[1].is_correct is False
    finally:
        db.close()
