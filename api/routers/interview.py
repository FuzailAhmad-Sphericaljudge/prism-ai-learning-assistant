import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from api.database import get_db
from api.schemas.interview import (
    InterviewStartRequest,
    InterviewStartResponse,
    InterviewTurnRequest,
    InterviewTurnResponse,
    InterviewReportResponse,
)
from api.interview.service import InterviewService
from api.interview.roles import INTERVIEW_ROLES, InterviewRole

logger = logging.getLogger("prism.routers.interview")

router = APIRouter(prefix="/interview", tags=["Adaptive Oral Defense Interview"])

interview_service = InterviewService()


@router.get(
    "/roles",
    response_model=List[InterviewRole],
    summary="List available technical interview roles and topics",
)
def list_interview_roles() -> List[InterviewRole]:
    return INTERVIEW_ROLES


@router.post(
    "/start",
    response_model=InterviewStartResponse,
    summary="Initialize adaptive mock oral defense session",
    description=(
        "Selects technical role, generates evidence-grounded rubric criteria, "
        "and produces the opening question."
    ),
)
def start_interview(
    req: InterviewStartRequest,
    db: DBSession = Depends(get_db),
) -> InterviewStartResponse:
    try:
        return interview_service.start_session(db=db, req=req)
    except Exception as e:
        logger.error(f"Error starting interview session: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize interview session: {str(e)}",
        )


@router.post(
    "/turn",
    response_model=InterviewTurnResponse,
    summary="Submit candidate response for evaluation and receive justified follow-up",
    description=(
        "Evaluates the candidate's oral or typed response against the active rubric criterion, "
        "detects specific gaps, updates rubric progress, and produces a justified follow-up question."
    ),
)
def submit_turn(
    req: InterviewTurnRequest,
    db: DBSession = Depends(get_db),
) -> InterviewTurnResponse:
    try:
        return interview_service.process_turn(db=db, req=req)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error processing interview turn: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process interview turn: {str(e)}",
        )


@router.get(
    "/{session_id}",
    response_model=InterviewStartResponse,
    summary="Get current interview session status and live rubric",
)
def get_interview_session(
    session_id: str,
    db: DBSession = Depends(get_db),
) -> InterviewStartResponse:
    try:
        return interview_service.get_session(db=db, session_id=session_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error retrieving interview session: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve interview session: {str(e)}",
        )


@router.get(
    "/{session_id}/report",
    response_model=InterviewReportResponse,
    summary="Get final oral defense report with strengths, gaps, and revision links",
)
def get_interview_report(
    session_id: str,
    db: DBSession = Depends(get_db),
) -> InterviewReportResponse:
    try:
        return interview_service.get_report(db=db, session_id=session_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error generating interview report: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate interview report: {str(e)}",
        )
