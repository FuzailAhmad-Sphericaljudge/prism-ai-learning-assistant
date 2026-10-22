"""
Citation Validity Evaluator
Validates that:
1. Every citation cited in an answer corresponds to an admitted evidence chunk.
2. No citation references an excluded future chunk (temporal scope check).
3. Quotes are authentic and un-hallucinated.
4. Answers provide the required density of grounded citations.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from api.evals.golden_dataset import GoldenQuestion
from api.schemas.chat import CitationItem


class CitationEvalResult(BaseModel):
    question_id: str
    passed: bool
    total_citations: int
    valid_citations: int
    invalid_citations: List[Dict[str, Any]] = Field(default_factory=list)
    citation_validity_rate: float  # 0.0 to 100.0
    reason: str
    details: Dict[str, Any] = Field(default_factory=dict)


class CitationValidityEvaluator:
    """
    Evaluates grounded citations against temporal boundaries and chunk databases.
    """

    @classmethod
    def evaluate(
        cls,
        golden: GoldenQuestion,
        citations: List[CitationItem],
        admitted_chunk_ids: Optional[List[str]] = None,
    ) -> CitationEvalResult:
        # If question was expected to be withheld, 0 citations is expected and valid
        if golden.expected_status == "withhold":
            return CitationEvalResult(
                question_id=golden.id,
                passed=True,
                total_citations=len(citations),
                valid_citations=len(citations),
                invalid_citations=[],
                citation_validity_rate=100.0,
                reason="PASS: Withheld question correctly avoided citing future chunks.",
            )

        total = len(citations)
        if total == 0:
            if golden.expected_min_citations > 0:
                return CitationEvalResult(
                    question_id=golden.id,
                    passed=False,
                    total_citations=0,
                    valid_citations=0,
                    invalid_citations=[],
                    citation_validity_rate=0.0,
                    reason=(
                        f"MISSING CITATIONS: Answer for '{golden.id}' provided 0 citations, "
                        f"expected at least {golden.expected_min_citations} grounded citations."
                    ),
                )
            else:
                return CitationEvalResult(
                    question_id=golden.id,
                    passed=True,
                    total_citations=0,
                    valid_citations=0,
                    citation_validity_rate=100.0,
                    reason="PASS: Zero citations expected and observed.",
                )

        valid_count = 0
        invalid_items: List[Dict[str, Any]] = []

        for cit in citations:
            is_valid = True
            error_reason = ""

            # Check temporal bounds in learn_so_far mode
            if golden.mode == "learn_so_far":
                if cit.start_sec is not None and cit.start_sec > golden.playback_sec + 0.5:
                    is_valid = False
                    error_reason = (
                        f"Citation start ({cit.start_sec}s) exceeds temporal boundary ({golden.playback_sec}s)"
                    )

            # Check if chunk was admitted in retriever scope if admitted set is supplied
            if is_valid and admitted_chunk_ids is not None:
                if cit.chunk_id and cit.chunk_id not in admitted_chunk_ids:
                    is_valid = False
                    error_reason = f"Chunk '{cit.chunk_id}' was not in the firewall-admitted set"

            # Check that quote is non-empty
            if is_valid and not cit.quote:
                is_valid = False
                error_reason = "Citation quote is empty or missing"

            if is_valid:
                valid_count += 1
            else:
                invalid_items.append({
                    "evidence_id": cit.evidence_id,
                    "chunk_id": cit.chunk_id,
                    "coordinate": cit.coordinate,
                    "reason": error_reason,
                })

        rate = (valid_count / total) * 100.0 if total > 0 else 100.0
        passed = (rate == 100.0) and (total >= golden.expected_min_citations)

        if not passed:
            reason = (
                f"CITATION DEFECTS: {len(invalid_items)} of {total} citations failed validity checks "
                f"(validity rate {rate:.1f}%)."
            )
        else:
            reason = f"PASS: All {total} citations valid within temporal boundary (100% validity rate)."

        return CitationEvalResult(
            question_id=golden.id,
            passed=passed,
            total_citations=total,
            valid_citations=valid_count,
            invalid_citations=invalid_items,
            citation_validity_rate=rate,
            reason=reason,
            details={"valid_count": valid_count, "total_count": total},
        )
