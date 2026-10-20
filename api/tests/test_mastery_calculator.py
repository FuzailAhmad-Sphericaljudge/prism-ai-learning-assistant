import pytest
from api.mastery.calculator import calculate_concept_mastery, AttemptSummary


def test_mastery_calculator_empty_attempts():
    status, score, total, correct = calculate_concept_mastery([])
    assert status == "not_assessed"
    assert score == 0.0
    assert total == 0
    assert correct == 0


def test_mastery_calculator_gap_found_on_misconception():
    # 1 attempt: failed with Local Parent-Child Fallacy
    attempts = [AttemptSummary(is_correct=False, misconception_tag="Local Parent-Child Fallacy")]
    status, score, total, correct = calculate_concept_mastery(attempts)

    assert status == "gap_found"
    assert score == 0.0
    assert total == 1
    assert correct == 0


def test_mastery_calculator_improving_progression():
    # 1 failure followed by 1 success
    attempts = [
        AttemptSummary(is_correct=False, misconception_tag="Local Parent-Child Fallacy"),
        AttemptSummary(is_correct=True, misconception_tag=None),
    ]
    status, score, total, correct = calculate_concept_mastery(attempts)

    assert status == "improving"
    assert score == 0.60  # (1.5 / 2.5) = 0.6
    assert total == 2
    assert correct == 1


def test_mastery_calculator_demonstrated_progression():
    # 1 failure followed by 2 consecutive successes
    attempts = [
        AttemptSummary(is_correct=False, misconception_tag="Local Parent-Child Fallacy"),
        AttemptSummary(is_correct=True, misconception_tag=None),
        AttemptSummary(is_correct=True, misconception_tag=None),
    ]
    status, score, total, correct = calculate_concept_mastery(attempts)

    # Weights: [1.0, 1.5, 2.25] = total 4.75; correct: 1.5 + 2.25 = 3.75; score = 3.75 / 4.75 = 0.789
    # Add one more success
    attempts.append(AttemptSummary(is_correct=True, misconception_tag=None))
    status, score, total, correct = calculate_concept_mastery(attempts)

    assert status == "demonstrated"
    assert score >= 0.80
    assert total == 4
    assert correct == 3


def test_mastery_calculator_relapse_to_gap_found():
    # Demonstrated, but then relapses on new attempt
    attempts = [
        AttemptSummary(is_correct=True, misconception_tag=None),
        AttemptSummary(is_correct=True, misconception_tag=None),
        AttemptSummary(is_correct=False, misconception_tag="Ancestral Traversal Error"),
    ]
    status, score, total, correct = calculate_concept_mastery(attempts)

    assert status == "gap_found"
    assert total == 3
    assert correct == 2
