from typing import List, Optional
from api.schemas.mastery import ConceptMastery, NextBestAction
from api.practice.taxonomy import get_concept_by_tag


class NextBestActionRecommender:
    """
    Pedagogical recommender that prioritizes:
    1. Active gaps (misconceptions) -> Direct revision link to video timestamp / slide
    2. Concepts in progress ('improving') -> Practice questions to reach 'demonstrated'
    3. Earliest unassessed prerequisite in lecture order -> Diagnostic probe
    4. Full demonstration -> Adaptive oral interview preparation
    """

    @staticmethod
    def recommend(
        course_id: str,
        concepts: List[ConceptMastery],
    ) -> Optional[NextBestAction]:
        if not concepts:
            return None

        # 1. Active Gaps (Highest Priority)
        for c in concepts:
            if c.status == "gap_found":
                misconception = c.misconceptions[-1] if c.misconceptions else "misconception detected in recent attempt"
                concept_def = get_concept_by_tag(c.concept_tag)
                landmark_sec = concept_def.video_landmark_sec if concept_def else 0.0
                mins = int(landmark_sec // 60)
                secs = int(landmark_sec % 60)
                coord = f"{mins:02d}:{secs:02d}"

                return NextBestAction(
                    concept_tag=c.concept_tag,
                    reason=f"Active misconception detected: {misconception}",
                    recommended_type="revise",
                    action_url=f"/learn/{course_id}?t={landmark_sec}",
                    coordinate=coord,
                    label=f"Revise {c.concept_tag} at {coord} in Video (Slide {concept_def.slide_number if concept_def else 1})",
                )

        # 2. Concepts In Progress ('improving')
        for c in concepts:
            if c.status == "improving":
                return NextBestAction(
                    concept_tag=c.concept_tag,
                    reason="Recent attempt was correct; complete one more probe to achieve Demonstrated status.",
                    recommended_type="practice",
                    action_url=f"/practice?concept={c.concept_tag}",
                    coordinate=c.evidence_landmarks[0] if c.evidence_landmarks else None,
                    label=f"Reinforce {c.concept_tag} with Practice",
                )

        # 3. Earliest Unassessed Concept
        for c in concepts:
            if c.status == "not_assessed":
                concept_def = get_concept_by_tag(c.concept_tag)
                return NextBestAction(
                    concept_tag=c.concept_tag,
                    reason="Core lecture prerequisite has not yet been assessed.",
                    recommended_type="practice",
                    action_url=f"/practice?concept={c.concept_tag}",
                    coordinate=c.evidence_landmarks[0] if c.evidence_landmarks else None,
                    label=f"Assess {c.concept_tag}",
                )

        # 4. All Demonstrated
        return NextBestAction(
            concept_tag="Mastery Complete",
            reason="All core concepts in this lecture have been demonstrated with verified evidence.",
            recommended_type="explore",
            action_url=f"/learn/{course_id}",
            coordinate="00:00",
            label="Prepare for Socratic Mock Oral Interview",
        )
