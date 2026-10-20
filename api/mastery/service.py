import uuid
import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session as DBSession

from api.models.mastery import Attempt, MasteryRecord
from api.schemas.practice import AttemptSubmitRequest, AttemptSubmitResponse
from api.practice.types import EvaluationResult
from api.schemas.mastery import (
    ConceptMastery,
    MasteryDashboardResponse,
    MasteryTimelineResponse,
    TimelineAttemptItem,
)
from api.mastery.calculator import calculate_concept_mastery, AttemptSummary
from api.mastery.recommender import NextBestActionRecommender
from api.practice.taxonomy import BST_CONCEPTS, get_concept_by_tag

logger = logging.getLogger("prism.mastery.service")


class MasteryService:
    """
    Manages student attempts, updates assessed evidence records,
    and derives verified mastery dashboards and audit timelines.
    """

    def record_attempt(
        self,
        db: DBSession,
        req: AttemptSubmitRequest,
        eval_result: EvaluationResult,
        linked_evidence: Optional[List[Dict[str, Any]]] = None,
    ) -> AttemptSubmitResponse:
        user_id = req.user_id or "00000000-0000-0000-0000-000000000001"
        attempt_id = str(uuid.uuid4())

        # 1. Insert new Attempt record
        attempt = Attempt(
            id=attempt_id,
            session_id=req.session_id,
            user_id=user_id,
            course_id=req.course_id,
            diagnostic_id=req.question_id,
            concept_tag=req.concept_tag,
            question_type=req.question_type,
            question_text=req.question_text,
            user_answer=req.user_answer,
            is_correct=eval_result.is_correct,
            misconception_tag=eval_result.misconception_tag,
            feedback=eval_result.feedback,
            explanation=eval_result.explanation,
            revision_action=eval_result.revision_action.model_dump() if eval_result.revision_action else None,
            linked_evidence=linked_evidence or [],
            created_at=datetime.now(timezone.utc),
        )
        db.add(attempt)
        db.commit()

        # 2. Query all attempts for this user + course + concept
        attempts = (
            db.query(Attempt)
            .filter(
                Attempt.user_id == user_id,
                Attempt.course_id == req.course_id,
                Attempt.concept_tag == req.concept_tag,
            )
            .order_by(Attempt.created_at.asc())
            .all()
        )

        summaries = [
            AttemptSummary(is_correct=a.is_correct, misconception_tag=a.misconception_tag)
            for a in attempts
        ]
        status, score, total_attempts, correct_count = calculate_concept_mastery(summaries)

        # Collect distinct misconceptions found in history
        misconceptions = []
        for a in attempts:
            if a.misconception_tag and a.misconception_tag not in misconceptions:
                misconceptions.append(a.misconception_tag)

        # 3. Upsert MasteryRecord
        rec = (
            db.query(MasteryRecord)
            .filter(
                MasteryRecord.user_id == user_id,
                MasteryRecord.course_id == req.course_id,
                MasteryRecord.concept == req.concept_tag,
            )
            .first()
        )

        now = datetime.now(timezone.utc)
        if not rec:
            rec = MasteryRecord(
                id=str(uuid.uuid4()),
                user_id=user_id,
                course_id=req.course_id,
                concept=req.concept_tag,
                status=status,
                mastery_score=score,
                attempts_count=total_attempts,
                correct_count=correct_count,
                misconceptions=misconceptions,
                last_assessed_at=now,
            )
            db.add(rec)
        else:
            rec.status = status
            rec.mastery_score = score
            rec.attempts_count = total_attempts
            rec.correct_count = correct_count
            rec.misconceptions = misconceptions
            rec.last_assessed_at = now

        db.commit()

        # 4. Return complete response
        return AttemptSubmitResponse(
            attempt_id=attempt_id,
            is_correct=eval_result.is_correct,
            score=eval_result.score,
            misconception_tag=eval_result.misconception_tag,
            feedback=eval_result.feedback,
            explanation=eval_result.explanation,
            revision_action=eval_result.revision_action,
            linked_evidence=[],
            concept_tag=req.concept_tag,
            updated_mastery_status=status,
            updated_mastery_score=score,
        )

    def get_dashboard(
        self,
        db: DBSession,
        course_id: str,
        user_id: str = "00000000-0000-0000-0000-000000000001",
    ) -> MasteryDashboardResponse:
        records = (
            db.query(MasteryRecord)
            .filter(
                MasteryRecord.user_id == user_id,
                MasteryRecord.course_id == course_id,
            )
            .all()
        )
        rec_map = {r.concept: r for r in records}

        concept_list: List[ConceptMastery] = []
        assessed_scores: List[float] = []

        demonstrated_count = 0
        improving_count = 0
        gap_count = 0
        unassessed_count = 0

        for c_def in BST_CONCEPTS:
            rec = rec_map.get(c_def.tag)
            mins = int(c_def.video_landmark_sec // 60)
            secs = int(c_def.video_landmark_sec % 60)
            landmarks = [f"{mins:02d}:{secs:02d}", f"Slide {c_def.slide_number}", f"p. {c_def.pdf_page}"]

            if rec:
                status = rec.status
                score = rec.mastery_score
                attempts_count = rec.attempts_count
                correct_count = rec.correct_count
                misconceptions = rec.misconceptions or []
                last_at = rec.last_assessed_at

                if status != "not_assessed":
                    assessed_scores.append(score)

                if status == "demonstrated":
                    demonstrated_count += 1
                elif status == "improving":
                    improving_count += 1
                elif status == "gap_found":
                    gap_count += 1
                else:
                    unassessed_count += 1
            else:
                status = "not_assessed"
                score = 0.0
                attempts_count = 0
                correct_count = 0
                misconceptions = []
                last_at = None
                unassessed_count += 1

            concept_list.append(
                ConceptMastery(
                    concept_tag=c_def.tag,
                    status=status,
                    mastery_score=score,
                    attempts_count=attempts_count,
                    correct_count=correct_count,
                    misconceptions=misconceptions,
                    last_assessed_at=last_at,
                    evidence_landmarks=landmarks,
                )
            )

        assessed_count = len(assessed_scores)
        overall_percentage = (
            round((sum(assessed_scores) / assessed_count) * 100, 1)
            if assessed_count > 0
            else 0.0
        )

        next_action = NextBestActionRecommender.recommend(course_id, concept_list)

        return MasteryDashboardResponse(
            course_id=course_id,
            user_id=user_id,
            total_concepts=len(BST_CONCEPTS),
            assessed_concepts=assessed_count,
            demonstrated_count=demonstrated_count,
            improving_count=improving_count,
            gap_count=gap_count,
            unassessed_count=unassessed_count,
            overall_mastery_percentage=overall_percentage,
            concepts=concept_list,
            next_best_action=next_action,
        )

    def get_timeline(
        self,
        db: DBSession,
        course_id: str,
        user_id: str = "00000000-0000-0000-0000-000000000001",
    ) -> MasteryTimelineResponse:
        attempts = (
            db.query(Attempt)
            .filter(
                Attempt.user_id == user_id,
                Attempt.course_id == course_id,
            )
            .order_by(Attempt.created_at.desc())
            .all()
        )

        timeline_items: List[TimelineAttemptItem] = []
        for a in attempts:
            timeline_items.append(
                TimelineAttemptItem(
                    id=a.id,
                    concept_tag=a.concept_tag or "General BST",
                    question_text=a.question_text,
                    user_answer=a.user_answer,
                    is_correct=a.is_correct,
                    misconception_tag=a.misconception_tag,
                    feedback=a.feedback,
                    explanation=a.explanation,
                    created_at=a.created_at,
                    revision_action=a.revision_action,
                    linked_evidence=[],
                )
            )

        return MasteryTimelineResponse(
            course_id=course_id,
            user_id=user_id,
            total_attempts=len(timeline_items),
            timeline=timeline_items,
        )
