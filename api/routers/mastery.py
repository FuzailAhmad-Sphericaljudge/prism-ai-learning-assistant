import logging
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session as DBSession

from api.database import get_db
from api.schemas.mastery import MasteryDashboardResponse, MasteryTimelineResponse
from api.mastery.service import MasteryService

logger = logging.getLogger("prism.routers.mastery")

router = APIRouter(prefix="/mastery", tags=["Mastery & Analytics"])

mastery_service = MasteryService()


@router.get(
    "",
    response_model=MasteryDashboardResponse,
    summary="Get derived mastery dashboard for course concepts",
    description=(
        "Returns verified mastery progress derived strictly from assessed attempts. "
        "Calculates recency-weighted scores, status flags (Not assessed, Gap found, "
        "Improving, Demonstrated), and recommends the Next Best Action."
    ),
)
def get_mastery(
    course_id: str = Query("00000000-0000-0000-0000-000000000002", description="Course UUID"),
    user_id: str = Query("00000000-0000-0000-0000-000000000001", description="User UUID"),
    db: DBSession = Depends(get_db),
) -> MasteryDashboardResponse:
    try:
        return mastery_service.get_dashboard(db=db, course_id=course_id, user_id=user_id)
    except Exception as e:
        logger.error(f"Error retrieving mastery dashboard: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve mastery dashboard: {str(e)}",
        )


@router.get(
    "/timeline",
    response_model=MasteryTimelineResponse,
    summary="Get chronological timeline of student practice attempts",
    description=(
        "Returns audit history of all assessed attempts, including diagnosed misconceptions, "
        "grading feedback, and revision deep-links."
    ),
)
def get_mastery_timeline(
    course_id: str = Query("00000000-0000-0000-0000-000000000002", description="Course UUID"),
    user_id: str = Query("00000000-0000-0000-0000-000000000001", description="User UUID"),
    db: DBSession = Depends(get_db),
) -> MasteryTimelineResponse:
    try:
        return mastery_service.get_timeline(db=db, course_id=course_id, user_id=user_id)
    except Exception as e:
        logger.error(f"Error retrieving mastery timeline: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve mastery timeline: {str(e)}",
        )
