import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from api.schemas.interview import (
    RubricCriterion,
    CriterionReport,
    InterviewReportResponse,
)
from api.schemas.practice import RevisionAction
from api.practice.revision import resolve_revision_action, MISCONCEPTION_RULES
from api.practice.taxonomy import get_concept_by_tag

logger = logging.getLogger("prism.interview.report")


class InterviewReportGenerator:
    """
    Synthesizes final oral interview defense audit reports with per-criterion scores,
    justifications, strengths, detected gaps, and targeted lecture revision deep-links.
    """

    @classmethod
    def generate_report(
        cls,
        session_id: str,
        course_id: str,
        user_id: str,
        role: str,
        topic: str,
        rubric: List[RubricCriterion],
        transcript: List[Dict[str, Any]],
        created_at: Optional[datetime] = None,
    ) -> InterviewReportResponse:
        criteria_scores: List[CriterionReport] = []
        total_weight = 0.0
        weighted_sum = 0.0

        strengths: List[str] = []
        gaps: List[str] = []
        revision_links: List[RevisionAction] = []

        # Coordinate mappings for revision actions
        criterion_landmarks = {
            "crit-01": {"tag": "BST Invariant", "coord": "05:25", "sec": 325.0, "slide": 3, "label": "Revise BST Invariant & Ancestral Traversal at 05:25 (Slide 3)"},
            "crit-02": {"tag": "Tree Search Complexity", "coord": "08:15", "sec": 495.0, "slide": 5, "label": "Revise Worst-Case O(N) Degeneracy & Height Bounds at 08:15 (Slide 5)"},
            "crit-03": {"tag": "Tree Insertion", "coord": "12:40", "sec": 760.0, "slide": 8, "label": "Revise Trailing Pointer Maintenance in Tree-Insert at 12:40 (Slide 8)"},
            "crit-04": {"tag": "Node Deletion", "coord": "21:10", "sec": 1270.0, "slide": 14, "label": "Revise Node Deletion Successor Splicing at 21:10 (Slide 14)"},
        }

        for crit in rubric:
            score = crit.score if crit.score is not None else 60.0
            weight = crit.weight or 1.0

            total_weight += weight
            weighted_sum += score * weight

            justification = crit.justification or f"Evaluated under oral defense rubric for {crit.name}."

            criteria_scores.append(
                CriterionReport(
                    criterion_id=crit.id,
                    name=crit.name,
                    score=score,
                    weight=weight,
                    justification=justification,
                    linked_evidence=crit.linked_evidence,
                )
            )

            # Classify strengths vs gaps
            if score >= 75.0:
                strengths.append(f"Demonstrated command of {crit.name}: articulated foundational algorithmic guarantees.")
            elif score < 70.0:
                gaps.append(f"Under-specified {crit.name}: omitted core structural or complexity invariants.")

                # Generate actionable remediation deep link
                meta = criterion_landmarks.get(crit.id)
                if meta:
                    revision_links.append(
                        RevisionAction(
                            type="video",
                            coordinate=meta["coord"],
                            timestamp_sec=meta["sec"],
                            slide=meta["slide"],
                            page=1,
                            label=meta["label"],
                        )
                    )

        overall_score = round(weighted_sum / total_weight, 1) if total_weight > 0 else 0.0
        status = "passed" if overall_score >= 70.0 else "needs_revision"

        if not strengths:
            strengths.append("Participated actively across all oral defense rounds.")
        if not gaps:
            gaps.append("No critical conceptual gaps detected; candidate satisfied all primary rubric criteria.")

        return InterviewReportResponse(
            session_id=session_id,
            course_id=course_id,
            user_id=user_id,
            role=role,
            topic=topic,
            status=status,
            overall_score=overall_score,
            criteria_scores=criteria_scores,
            strengths=strengths,
            gaps=gaps,
            revision_links=revision_links,
            transcript=transcript,
            created_at=created_at or datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc),
        )
