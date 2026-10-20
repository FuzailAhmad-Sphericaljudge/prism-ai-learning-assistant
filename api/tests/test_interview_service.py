import pytest
from api.database import SessionLocal
from api.interview.service import InterviewService
from api.schemas.interview import InterviewStartRequest, InterviewTurnRequest

COURSE_ID = "00000000-0000-0000-0000-000000000002"
USER_ID = "00000000-0000-0000-0000-000000000001"


def test_interview_service_lifecycle_and_multi_round_turns():
    db = SessionLocal()
    service = InterviewService()

    try:
        # 1. Start Session
        start_req = InterviewStartRequest(
            course_id=COURSE_ID,
            user_id=USER_ID,
            role="Systems Software Engineer",
            topic="Binary Search Trees & Structural Invariants",
            max_rounds=3,
        )
        start_res = service.start_session(db, start_req)

        assert start_res.session_id is not None
        assert start_res.current_round == 1
        assert start_res.max_rounds == 3
        assert len(start_res.rubric) == 4
        assert len(start_res.initial_question) > 10

        session_id = start_res.session_id

        # 2. Turn 1: Incomplete answer (should get follow-up probe)
        turn1_req = InterviewTurnRequest(
            session_id=session_id,
            user_answer="A node's left child is less and right child is greater.",
        )
        turn1_res = service.process_turn(db, turn1_req)

        assert turn1_res.is_completed is False
        assert turn1_res.round_number == 2
        assert turn1_res.next_question is not None
        assert turn1_res.justification is not None
        assert "ancestral" in turn1_res.justification.lower() or "probing" in turn1_res.justification.lower()

        # 3. Turn 2: Strong answer addressing ancestral invariant
        turn2_req = InterviewTurnRequest(
            session_id=session_id,
            user_answer="The invariant is ancestral across all descendants; left subtree keys are strictly less than root, so binary search pruning works.",
        )
        turn2_res = service.process_turn(db, turn2_req)

        assert turn2_res.is_completed is False
        assert turn2_res.round_number == 3
        assert turn2_res.next_question is not None

        # 4. Turn 3: Final round answer
        turn3_req = InterviewTurnRequest(
            session_id=session_id,
            user_answer="Search takes O(h) time, touching at most h+1 nodes; worst case is a degenerate linear list of height N yielding O(N).",
        )
        turn3_res = service.process_turn(db, turn3_req)

        assert turn3_res.is_completed is True
        assert turn3_res.next_question is None

        # 5. Fetch Final Report
        report = service.get_report(db, session_id)
        assert report.session_id == session_id
        assert report.status in ["passed", "needs_revision"]
        assert 0.0 <= report.overall_score <= 100.0
        assert len(report.criteria_scores) == 4
        assert len(report.strengths) >= 1
        assert len(report.gaps) >= 1
        assert len(report.revision_links) >= 1

    finally:
        db.close()
