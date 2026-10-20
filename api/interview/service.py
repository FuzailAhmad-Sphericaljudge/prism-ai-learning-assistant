import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session as DBSession

from api.models.interview import InterviewSession, InterviewExchange
from api.schemas.interview import (
    InterviewStartRequest,
    InterviewStartResponse,
    InterviewTurnRequest,
    InterviewTurnResponse,
    InterviewReportResponse,
    RubricCriterion,
)
from api.interview.roles import get_role_by_id, get_default_role
from api.interview.rubric import RubricGenerator
from api.interview.adaptive_engine import AdaptiveInterviewEngine
from api.interview.report_generator import InterviewReportGenerator

logger = logging.getLogger("prism.interview.service")


class InterviewService:
    """
    Orchestrates adaptive mock oral interviews, manages database persistence,
    evaluates responses with Socratic follow-ups, and serializes final defense reports.
    """

    def start_session(
        self,
        db: DBSession,
        req: InterviewStartRequest,
    ) -> InterviewStartResponse:
        user_id = req.user_id or "00000000-0000-0000-0000-000000000001"
        session_id = str(uuid.uuid4())

        role_obj = get_role_by_id(req.role) or get_default_role()
        role_title = role_obj.title
        topic = req.topic or role_obj.target_topic
        initial_question = role_obj.sample_first_question

        # 1. Generate Rubric
        rubric_criteria = RubricGenerator.generate_rubric(
            course_id=req.course_id,
            topic=topic,
            role_id=role_obj.id,
            db=db,
        )

        # 2. Persist InterviewSession
        session = InterviewSession(
            id=session_id,
            user_id=user_id,
            course_id=req.course_id,
            target_concept=topic,
            role=role_title,
            topic=topic,
            current_round=1,
            max_rounds=req.max_rounds,
            status="in_progress",
            rubric=[c.model_dump() for c in rubric_criteria],
            transcript_json=[{"role": "interviewer", "text": initial_question, "round": 1}],
            report_json={},
            created_at=datetime.now(timezone.utc),
        )
        db.add(session)

        # 3. Persist Initial Exchange for Round 1
        exchange = InterviewExchange(
            id=str(uuid.uuid4()),
            interview_session_id=session_id,
            round_number=1,
            question_text=initial_question,
            learner_response=None,
            justification="Initial contextual prompt introducing foundational topic requirements.",
            evaluation={},
            rubric_scores={},
            revision_links=[],
            created_at=datetime.now(timezone.utc),
        )
        db.add(exchange)
        db.commit()

        return InterviewStartResponse(
            session_id=session_id,
            course_id=req.course_id,
            user_id=user_id,
            role=role_title,
            topic=topic,
            current_round=1,
            max_rounds=req.max_rounds,
            initial_question=initial_question,
            rubric=rubric_criteria,
            status="in_progress",
        )

    def process_turn(
        self,
        db: DBSession,
        req: InterviewTurnRequest,
    ) -> InterviewTurnResponse:
        session = db.query(InterviewSession).filter(InterviewSession.id == req.session_id).first()
        if not session:
            raise ValueError(f"Interview session '{req.session_id}' not found.")

        current_round = session.current_round
        max_rounds = session.max_rounds

        # Load rubric
        stored_rubric_data = session.rubric or []
        rubric = [RubricCriterion(**item) for item in stored_rubric_data]

        # 1. Evaluate candidate answer and get justified next question
        turn_eval, updated_rubric, next_q, next_justification, is_completed = (
            AdaptiveInterviewEngine.evaluate_and_next_question(
                round_number=current_round,
                max_rounds=max_rounds,
                candidate_answer=req.user_answer,
                rubric=rubric,
            )
        )

        # 2. Update current exchange in DB
        curr_exchange = (
            db.query(InterviewExchange)
            .filter(
                InterviewExchange.interview_session_id == session.id,
                InterviewExchange.round_number == current_round,
            )
            .first()
        )
        if curr_exchange:
            curr_exchange.learner_response = req.user_answer
            curr_exchange.evaluation = turn_eval.model_dump()
            curr_exchange.rubric_scores = {turn_eval.criterion_id: turn_eval.score}
            curr_exchange.socratic_feedback = turn_eval.justification

        # Update session transcript
        transcript = session.transcript_json or []
        transcript.append({"role": "candidate", "text": req.user_answer, "round": current_round})

        # Update rubric in session
        session.rubric = [c.model_dump() for c in updated_rubric]

        if is_completed:
            session.status = "completed"
            # Generate final report
            report = InterviewReportGenerator.generate_report(
                session_id=session.id,
                course_id=session.course_id,
                user_id=session.user_id,
                role=session.role or "Algorithm Specialist",
                topic=session.topic or "Binary Search Trees",
                rubric=updated_rubric,
                transcript=transcript,
                created_at=session.created_at,
            )
            session.report_json = report.model_dump(mode="json")
            session.overall_score = report.overall_score
            session.feedback = f"Oral defense completed with overall score: {report.overall_score}%."
            db.commit()

            return InterviewTurnResponse(
                session_id=session.id,
                round_number=current_round,
                max_rounds=max_rounds,
                is_completed=True,
                evaluation=turn_eval,
                rubric=updated_rubric,
                next_question=None,
                justification=None,
                feedback=f"Oral defense concluded. Overall score: {report.overall_score}%. Review your defense report.",
            )

        # Session continues to next round
        next_round = current_round + 1
        session.current_round = next_round
        transcript.append({"role": "interviewer", "text": next_q, "round": next_round})
        session.transcript_json = transcript

        # Create next exchange in DB
        next_exchange = InterviewExchange(
            id=str(uuid.uuid4()),
            interview_session_id=session.id,
            round_number=next_round,
            question_text=next_q,
            justification=next_justification,
            learner_response=None,
            evaluation={},
            rubric_scores={},
            revision_links=[],
            created_at=datetime.now(timezone.utc),
        )
        db.add(next_exchange)
        db.commit()

        return InterviewTurnResponse(
            session_id=session.id,
            round_number=next_round,
            max_rounds=max_rounds,
            is_completed=False,
            evaluation=turn_eval,
            rubric=updated_rubric,
            next_question=next_q,
            justification=next_justification,
            feedback=turn_eval.justification,
        )

    def get_report(
        self,
        db: DBSession,
        session_id: str,
    ) -> InterviewReportResponse:
        session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
        if not session:
            raise ValueError(f"Interview session '{session_id}' not found.")

        if session.report_json and "overall_score" in session.report_json:
            return InterviewReportResponse(**session.report_json)

        # Generate on demand if completed
        stored_rubric_data = session.rubric or []
        rubric = [RubricCriterion(**item) for item in stored_rubric_data]
        report = InterviewReportGenerator.generate_report(
            session_id=session.id,
            course_id=session.course_id,
            user_id=session.user_id,
            role=session.role or "Algorithm Specialist",
            topic=session.topic or "Binary Search Trees",
            rubric=rubric,
            transcript=session.transcript_json or [],
            created_at=session.created_at,
        )
        session.report_json = report.model_dump(mode="json")
        session.overall_score = report.overall_score
        db.commit()
        return report

    def get_session(
        self,
        db: DBSession,
        session_id: str,
    ) -> InterviewStartResponse:
        session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
        if not session:
            raise ValueError(f"Interview session '{session_id}' not found.")

        stored_rubric_data = session.rubric or []
        rubric = [RubricCriterion(**item) for item in stored_rubric_data]

        first_exchange = (
            db.query(InterviewExchange)
            .filter(InterviewExchange.interview_session_id == session.id)
            .order_by(InterviewExchange.round_number.asc())
            .first()
        )
        initial_q = first_exchange.question_text if first_exchange else "Explain the core invariant."

        return InterviewStartResponse(
            session_id=session.id,
            course_id=session.course_id,
            user_id=session.user_id,
            role=session.role or "Algorithm Specialist",
            topic=session.topic or "Binary Search Trees",
            current_round=session.current_round,
            max_rounds=session.max_rounds,
            initial_question=initial_q,
            rubric=rubric,
            status=session.status,
        )
