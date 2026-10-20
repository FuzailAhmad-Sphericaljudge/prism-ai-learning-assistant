import pytest
from api.interview.adaptive_engine import AdaptiveInterviewEngine
from api.interview.rubric import RubricGenerator

COURSE_ID = "00000000-0000-0000-0000-000000000002"


def test_adaptive_engine_probes_incomplete_answer():
    rubric = RubricGenerator.generate_rubric(COURSE_ID, "Binary Search Trees")

    # Candidate gives a superficial answer (omits ancestral requirements)
    candidate_answer = "A node's left child is smaller and right child is larger."

    turn_eval, updated_rubric, next_q, justification, is_done = (
        AdaptiveInterviewEngine.evaluate_and_next_question(
            round_number=1,
            max_rounds=3,
            candidate_answer=candidate_answer,
            rubric=rubric,
        )
    )

    assert is_done is False
    assert turn_eval.criterion_id == "crit-01"
    assert turn_eval.score <= 50.0
    assert "Recursive ancestral property across all descendants" in turn_eval.missed_points

    # Justified next question
    assert next_q is not None
    assert justification is not None
    assert "ancestral" in justification.lower() or "probing" in justification.lower()


def test_adaptive_engine_advances_on_strong_answer():
    rubric = RubricGenerator.generate_rubric(COURSE_ID, "Binary Search Trees")

    # Comprehensive candidate response
    candidate_answer = (
        "The BST property requires that for any node x, all keys in left(x) are strictly less than x, "
        "and all keys in right(x) are greater than or equal to x. This is an ancestral, global property "
        "across all descendants, ensuring binary search subtree pruning remains valid."
    )

    turn_eval, updated_rubric, next_q, justification, is_done = (
        AdaptiveInterviewEngine.evaluate_and_next_question(
            round_number=1,
            max_rounds=3,
            candidate_answer=candidate_answer,
            rubric=rubric,
        )
    )

    assert is_done is False
    assert turn_eval.score >= 75.0
    assert len(turn_eval.demonstrated_points) >= 2

    # Should advance to complexity analysis
    assert next_q is not None
    assert justification is not None
    assert "advancing" in justification.lower()
    assert "complexity" in next_q.lower() or "performance" in next_q.lower() or "sorted" in next_q.lower()


def test_adaptive_engine_completes_at_max_rounds():
    rubric = RubricGenerator.generate_rubric(COURSE_ID, "Binary Search Trees")

    candidate_answer = "Node deletion replaces node z with its in-order successor y from the right subtree, then splices y out."

    turn_eval, updated_rubric, next_q, justification, is_done = (
        AdaptiveInterviewEngine.evaluate_and_next_question(
            round_number=3,
            max_rounds=3,
            candidate_answer=candidate_answer,
            rubric=rubric,
        )
    )

    assert is_done is True
    assert next_q is None
    assert justification is None
