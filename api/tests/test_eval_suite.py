import pytest
from api.evals.golden_dataset import GOLDEN_QUESTIONS, GoldenQuestion
from api.evals.leakage_eval import FirewallLeakEvaluator
from api.evals.citation_eval import CitationValidityEvaluator
from api.evals.runner import run_eval_suite
from api.schemas.chat import CitationItem


def test_golden_dataset_structure():
    assert len(GOLDEN_QUESTIONS) >= 20, "Golden dataset must contain at least 20 questions"
    # Check 18:42 boundary presence
    boundary_questions = [q for q in GOLDEN_QUESTIONS if q.playback_sec == 1122.0]
    assert len(boundary_questions) >= 4, "Must contain questions anchored at 18:42 boundary"
    # Check explore ahead questions
    explore_ahead_q = [q for q in GOLDEN_QUESTIONS if q.mode == "explore_ahead"]
    assert len(explore_ahead_q) >= 3, "Must contain explore_ahead test questions"


def test_leakage_evaluator_catches_future_leak():
    gq = GoldenQuestion(
        id="test-leak-01",
        question="How does insertion work?",
        playback_sec=300.0,
        mode="learn_so_far",
        expected_status="answer",
        forbidden_future_terms=["red-black", "avl rotation"],
    )

    # Clean response
    clean_resp = "Insertion compares keys against the root node."
    clean_res = FirewallLeakEvaluator.evaluate(gq, clean_resp, is_not_covered=False)
    assert clean_res.passed is True
    assert len(clean_res.leaked_terms) == 0

    # Leaked response
    leaked_resp = "Insertion uses an AVL rotation to restore balance."
    leak_res = FirewallLeakEvaluator.evaluate(gq, leaked_resp, is_not_covered=False)
    assert leak_res.passed is False
    assert "avl rotation" in leak_res.leaked_terms


def test_leakage_evaluator_requires_withholding_on_future_question():
    gq = GoldenQuestion(
        id="test-withhold-01",
        question="How does Case 3 deletion work?",
        playback_sec=600.0,
        mode="learn_so_far",
        expected_status="withhold",
        forbidden_future_terms=["successor", "splice"],
    )

    # Properly withheld
    safe_resp = "This concept is not covered yet in the lecture up to 10:00."
    res_safe = FirewallLeakEvaluator.evaluate(gq, safe_resp, is_not_covered=True)
    assert res_safe.passed is True
    assert res_safe.withheld_correctly is True

    # Improperly answered without withholding
    leaked_resp = "In Case 3 deletion, we find the in-order successor and splice it out."
    res_leaked = FirewallLeakEvaluator.evaluate(gq, leaked_resp, is_not_covered=False)
    assert res_leaked.passed is False
    assert res_leaked.withheld_correctly is False


def test_citation_evaluator_validates_temporal_boundaries():
    gq = GoldenQuestion(
        id="test-cit-01",
        question="What is BST invariant?",
        playback_sec=300.0,
        mode="learn_so_far",
        expected_status="answer",
        expected_min_citations=1,
    )

    # Valid citation within temporal boundary (200.0s <= 300.0s)
    valid_citations = [
        CitationItem(
            evidence_id="E1",
            chunk_id="chunk-01",
            source_type="video",
            coordinate="03:20",
            quote="Left subtree keys are strictly less than root",
            start_sec=200.0,
            end_sec=250.0,
        )
    ]
    res_valid = CitationValidityEvaluator.evaluate(gq, valid_citations)
    assert res_valid.passed is True
    assert res_valid.citation_validity_rate == 100.0

    # Invalid citation from the future (600.0s > 300.0s)
    future_citations = [
        CitationItem(
            evidence_id="E1",
            chunk_id="chunk-99",
            source_type="video",
            coordinate="10:00",
            quote="Future fact from 10:00",
            start_sec=600.0,
            end_sec=650.0,
        )
    ]
    res_invalid = CitationValidityEvaluator.evaluate(gq, future_citations)
    assert res_invalid.passed is False
    assert res_invalid.citation_validity_rate == 0.0


def test_full_eval_suite_runner(tmp_path):
    report_file = tmp_path / "EVAL.md"
    report_dict = run_eval_suite(output_markdown_path=report_file)

    assert report_dict["total"] >= 20
    assert report_dict["passed"] == report_dict["total"]
    assert report_dict["leakage_rate"] == 0.0
    assert report_dict["citation_validity_rate"] == 100.0
    assert report_dict["withholding_precision"] == 100.0
    assert report_dict["explore_ahead_rate"] == 100.0
    assert report_file.exists()
