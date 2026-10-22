"""
Firewall Leak Evaluator
Validates that responses strictly conform to the Temporal Evidence Firewall:
1. Under learn_so_far mode, future-only concepts (e.g., deletion case 3, AVL/red-black rotations)
   must be withheld with a safe "not covered yet" response.
2. An answer admitted before a timestamp must NEVER contain terminology or algorithmic steps
   only revealed later in the lecture video.
3. Under explore_ahead mode, future concepts are legitimately unlocked.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from api.evals.golden_dataset import GoldenQuestion


class LeakageEvalResult(BaseModel):
    question_id: str
    passed: bool
    status_matched: bool
    leaked_terms: List[str] = Field(default_factory=list)
    withheld_correctly: bool
    reason: str
    details: Dict[str, Any] = Field(default_factory=dict)


class FirewallLeakEvaluator:
    """
    Evaluates LLM responses for temporal leakage violations.
    """

    @classmethod
    def evaluate(
        cls,
        golden: GoldenQuestion,
        response_text: str,
        is_not_covered: bool = False,
        citations: Optional[List[Any]] = None,
    ) -> LeakageEvalResult:
        text_lower = response_text.lower()
        leaked_terms: List[str] = []

        # 1. Evaluate "withhold" expectation in learn_so_far mode
        if golden.expected_status == "withhold":
            # The system MUST flag it as not covered yet OR return safe refusal
            has_withheld_keywords = any(
                phrase in text_lower
                for phrase in [
                    "not covered yet",
                    "hasn't been covered",
                    "not yet covered",
                    "covered later",
                    "explore ahead",
                    "not covered in the lecture up to",
                    "beyond your current playback",
                    "future topic",
                ]
            )

            withheld = is_not_covered or has_withheld_keywords

            # Check if any forbidden future term leaked into the text
            for term in golden.forbidden_future_terms:
                if term.lower() in text_lower:
                    leaked_terms.append(term)

            if not withheld:
                # Check if any forbidden future term leaked into the un-withheld text
                for term in golden.forbidden_future_terms:
                    if term.lower() in text_lower:
                        leaked_terms.append(term)

                return LeakageEvalResult(
                    question_id=golden.id,
                    passed=False,
                    status_matched=False,
                    leaked_terms=leaked_terms,
                    withheld_correctly=False,
                    reason=(
                        f"CRITICAL LEAK: Question '{golden.id}' was expected to be withheld at "
                        f"{golden.playback_sec}s, but the model provided an un-firewalled answer."
                    ),
                    details={"response_snippet": response_text[:200]},
                )

            # When correctly withheld, verify that no actual evidence citation leaked
            if citations and len(citations) > 0:
                return LeakageEvalResult(
                    question_id=golden.id,
                    passed=False,
                    status_matched=True,
                    leaked_terms=["citation_leak"],
                    withheld_correctly=True,
                    reason="LEAK: Response was withheld but cited future evidence chunks.",
                    details={"citations": [c.model_dump() if hasattr(c, "model_dump") else str(c) for c in citations]},
                )

            return LeakageEvalResult(
                question_id=golden.id,
                passed=True,
                status_matched=True,
                leaked_terms=[],
                withheld_correctly=True,
                reason="PASS: Future concept was safely withheld with zero temporal leakage.",
                details={"is_not_covered": is_not_covered},
            )

        # 2. Evaluate "answer" expectation
        else:
            # Check for false-positive withholding on permitted concepts
            if is_not_covered:
                return LeakageEvalResult(
                    question_id=golden.id,
                    passed=False,
                    status_matched=False,
                    leaked_terms=[],
                    withheld_correctly=False,
                    reason=(
                        f"FALSE WITHHOLDING: Concept '{golden.target_topic}' was already covered "
                        f"before {golden.playback_sec}s, but was falsely withheld."
                    ),
                    details={"response_snippet": response_text[:200]},
                )

            # Check for forbidden terms that belong strictly to later timestamps
            for term in golden.forbidden_future_terms:
                if term.lower() in text_lower:
                    leaked_terms.append(term)

            if leaked_terms:
                return LeakageEvalResult(
                    question_id=golden.id,
                    passed=False,
                    status_matched=True,
                    leaked_terms=leaked_terms,
                    withheld_correctly=False,
                    reason=(
                        f"TEMPORAL LEAK: Answer contained concepts from future sections: {leaked_terms}."
                    ),
                    details={"response_snippet": response_text[:200]},
                )

            return LeakageEvalResult(
                question_id=golden.id,
                passed=True,
                status_matched=True,
                leaked_terms=[],
                withheld_correctly=False,
                reason="PASS: Answer grounded strictly within permitted temporal boundary.",
                details={"snippet": response_text[:120]},
            )
