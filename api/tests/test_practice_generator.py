import pytest
from api.database import SessionLocal
from api.practice.generator import PracticeGenerator
from api.schemas.practice import PracticeGenerateRequest
from api.firewall.types import FirewallMode


def test_practice_generator_respects_temporal_firewall_boundaries():
    """
    Validates that in learn_so_far mode at 500s (Tree Search taught, Deletion future),
    only permitted concepts are generated, and future concepts are blocked.
    """
    db = SessionLocal()
    try:
        generator = PracticeGenerator()
        seeded_course_id = "00000000-0000-0000-0000-000000000002"

        # Request at 500.0s in learn_so_far mode
        req = PracticeGenerateRequest(
            course_id=seeded_course_id,
            playback_sec=500.0,
            mode=FirewallMode.LEARN_SO_FAR,
            concept_tag="Node Deletion",  # Future concept taught at 1122s
        )

        res = generator.generate(req=req, db=db)

        # Deletion must NOT be in available_concepts at 500s
        assert "Node Deletion" not in res.available_concepts
        assert "Self-Balancing Trees" not in res.available_concepts
        assert "BST Invariant" in res.available_concepts
        assert "Tree Search Complexity" in res.available_concepts

        # Target concept was safely clamped to latest permitted concept
        assert len(res.questions) > 0
        q = res.questions[0]
        assert q.concept_tag in ("BST Invariant", "Tree Search Complexity")
        assert q.concept_tag != "Node Deletion"

        # Verify evidence links respect boundary
        for ev in q.evidence_links:
            if ev.start_sec is not None:
                assert ev.start_sec <= 765.0
    finally:
        db.close()


def test_practice_generator_explore_ahead_unconstrains_future_concepts():
    """
    Validates that in explore_ahead mode, future concepts like Node Deletion
    and Self-Balancing Trees can be freely generated.
    """
    db = SessionLocal()
    try:
        generator = PracticeGenerator()
        seeded_course_id = "00000000-0000-0000-0000-000000000002"

        req = PracticeGenerateRequest(
            course_id=seeded_course_id,
            playback_sec=500.0,
            mode=FirewallMode.EXPLORE_AHEAD,
            concept_tag="Node Deletion",
        )

        res = generator.generate(req=req, db=db)
        assert "Node Deletion" in res.available_concepts
        assert len(res.questions) > 0
        q = res.questions[0]
        assert q.concept_tag == "Node Deletion"
        assert "delet" in q.question_text.lower() or "successor" in q.question_text.lower()
    finally:
        db.close()


def test_practice_generator_mcq_and_short_answer_types():
    """
    Validates that the generator can produce both MCQ (with 4 options)
    and short-answer (with rubric explanation) question formats.
    """
    db = SessionLocal()
    try:
        generator = PracticeGenerator()
        seeded_course_id = "00000000-0000-0000-0000-000000000002"

        # 1. Test MCQ
        mcq_req = PracticeGenerateRequest(
            course_id=seeded_course_id,
            playback_sec=500.0,
            concept_tag="BST Invariant",
            question_type="mcq",
        )
        mcq_res = generator.generate(req=mcq_req, db=db)
        assert len(mcq_res.questions) > 0
        mcq_q = mcq_res.questions[0]
        assert mcq_q.question_type == "mcq"
        assert mcq_q.options is not None
        assert len(mcq_q.options) == 4
        assert mcq_q.correct_index is not None
        assert 0 <= mcq_q.correct_index < 4

        # 2. Test Short-Answer
        sa_req = PracticeGenerateRequest(
            course_id=seeded_course_id,
            playback_sec=500.0,
            concept_tag="BST Invariant",
            question_type="short_answer",
        )
        sa_res = generator.generate(req=sa_req, db=db)
        assert len(sa_res.questions) > 0
        sa_q = sa_res.questions[0]
        assert sa_q.question_type == "short_answer"
        assert sa_q.options is None
        assert sa_q.correct_index is None
        assert len(sa_q.correct_answer) > 10
        assert len(sa_q.explanation) > 10
    finally:
        db.close()


def test_practice_generator_all_canonical_concepts_covered():
    """
    Validates that every canonical concept defined in the BST taxonomy
    can generate valid questions with complete evidence links.
    """
    db = SessionLocal()
    try:
        generator = PracticeGenerator()
        seeded_course_id = "00000000-0000-0000-0000-000000000002"
        from api.practice.taxonomy import BST_CONCEPTS

        for concept in BST_CONCEPTS:
            req = PracticeGenerateRequest(
                course_id=seeded_course_id,
                playback_sec=1680.0,
                mode=FirewallMode.EXPLORE_AHEAD,
                concept_tag=concept.tag,
                question_type="mcq",
            )
            res = generator.generate(req=req, db=db)
            assert len(res.questions) > 0
            q = res.questions[0]
            assert q.concept_tag == concept.tag
            assert len(q.evidence_links) > 0
            assert q.options is not None
            assert len(q.options) == 4
    finally:
        db.close()

