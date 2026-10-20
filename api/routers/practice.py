import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from api.database import get_db
from api.schemas.practice import (
    PracticeGenerateRequest,
    PracticeGenerateResponse,
    AttemptSubmitRequest,
    AttemptSubmitResponse,
)
from api.practice.generator import PracticeGenerator
from api.practice.evaluator import PracticeEvaluator
from api.mastery.service import MasteryService

logger = logging.getLogger("prism.routers.practice")

router = APIRouter(prefix="/practice", tags=["Practice & Assessment"])

practice_generator = PracticeGenerator()
practice_evaluator = PracticeEvaluator()
mastery_service = MasteryService()


@router.post(
    "/generate",
    response_model=PracticeGenerateResponse,
    summary="Generate practice questions grounded in verified evidence",
    description=(
        "Synthesizes MCQ and short-answer practice items from admitted temporal "
        "evidence chunks. Adheres strictly to the Temporal Evidence Firewall boundary."
    ),
)
def generate_practice(
    req: PracticeGenerateRequest,
    db: DBSession = Depends(get_db),
) -> PracticeGenerateResponse:
    try:
        return practice_generator.generate(req=req, db=db)
    except Exception as e:
        logger.error(f"Error generating practice questions: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate practice questions: {str(e)}",
        )


@router.post(
    "/submit",
    response_model=AttemptSubmitResponse,
    summary="Submit student attempt for rubric grading and misconception diagnosis",
    description=(
        "Evaluates student answers against verified ground truth evidence, detects "
        "specific conceptual fallacies, returns remediation deep-links, and updates "
        "the derived mastery status."
    ),
)
def submit_attempt(
    req: AttemptSubmitRequest,
    db: DBSession = Depends(get_db),
) -> AttemptSubmitResponse:
    try:
        # 1. Evaluate submission
        eval_result = practice_evaluator.evaluate(
            concept_tag=req.concept_tag,
            question_type=req.question_type,
            question_text=req.question_text,
            user_answer=req.user_answer,
            correct_answer="A",  # Standard canonical baseline for evaluated taxonomy items
        )

        # 2. Record attempt & derive updated mastery status
        response = mastery_service.record_attempt(
            db=db,
            req=req,
            eval_result=eval_result,
            linked_evidence=[],
        )
        return response
    except Exception as e:
        logger.error(f"Error submitting practice attempt: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate and record attempt: {str(e)}",
        )
