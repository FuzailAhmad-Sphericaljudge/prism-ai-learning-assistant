from typing import List, Tuple
from dataclasses import dataclass


@dataclass
class AttemptSummary:
    is_correct: bool
    misconception_tag: str | None


def calculate_concept_mastery(attempts: List[AttemptSummary]) -> Tuple[str, float, int, int]:
    """
    Computes derived mastery status and score based strictly on assessed evidence.
    No speculative or guessed percentages.

    Returns:
        (status, score, attempts_count, correct_count)
    Where status is one of:
        - "not_assessed"
        - "gap_found"
        - "improving"
        - "demonstrated"
    """
    n = len(attempts)
    if n == 0:
        return "not_assessed", 0.0, 0, 0

    correct_count = sum(1 for a in attempts if a.is_correct)

    # 1. Exponentially-weighted recency score
    # Recent attempts carry higher diagnostic weight: w_i = 1.5^(i-1)
    weights = [1.5 ** i for i in range(n)]
    weighted_correct = sum(weights[i] for i, a in enumerate(attempts) if a.is_correct)
    total_weights = sum(weights)
    score = round(weighted_correct / total_weights, 3)

    latest_attempt = attempts[-1]
    has_prior_failure = any(not a.is_correct for a in attempts)

    # 2. Strict status state machine
    if not latest_attempt.is_correct or score < 0.50:
        status = "gap_found"
    elif score >= 0.80 and n >= 2 and attempts[-1].is_correct and attempts[-2].is_correct:
        status = "demonstrated"
    elif latest_attempt.is_correct:
        status = "improving"
    else:
        status = "gap_found"

    return status, score, n, correct_count
