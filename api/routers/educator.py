import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session as DBSession

from api.database import get_db
from api.schemas.educator import EducatorInsightsResponse, ConfusionHeatmapBucket
from api.educator.service import EducatorAnalyticsService
from api.educator.exporter import EducatorCsvExporter

logger = logging.getLogger("prism.routers.educator")

router = APIRouter(prefix="/educator", tags=["Educator Insights & Friction Heatmap"])

educator_service = EducatorAnalyticsService()


@router.get(
    "/insights",
    response_model=EducatorInsightsResponse,
    summary="Get aggregated cohort insights, confusion heatmap, and top misconceptions",
)
def get_educator_insights(
    course_id: str = Query("00000000-0000-0000-0000-000000000002", description="Course UUID"),
    db: DBSession = Depends(get_db),
) -> EducatorInsightsResponse:
    try:
        return educator_service.get_insights(db=db, course_id=course_id)
    except Exception as e:
        logger.error(f"Error compiling educator insights: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate educator insights: {str(e)}",
        )


@router.get(
    "/confusion-heatmap",
    response_model=List[ConfusionHeatmapBucket],
    summary="Get temporal confusion heatmap along lecture video timeline",
)
def get_confusion_heatmap(
    course_id: str = Query("00000000-0000-0000-0000-000000000002", description="Course UUID"),
    db: DBSession = Depends(get_db),
) -> List[ConfusionHeatmapBucket]:
    try:
        insights = educator_service.get_insights(db=db, course_id=course_id)
        return insights.confusion_heatmap
    except Exception as e:
        logger.error(f"Error fetching confusion heatmap: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch confusion heatmap: {str(e)}",
        )


@router.get(
    "/export/csv",
    summary="Export educator telemetry, confusion heatmap, and misconception analytics as CSV",
)
def export_educator_csv(
    course_id: str = Query("00000000-0000-0000-0000-000000000002", description="Course UUID"),
    db: DBSession = Depends(get_db),
) -> Response:
    try:
        insights = educator_service.get_insights(db=db, course_id=course_id)
        csv_data = EducatorCsvExporter.export_csv(insights)

        filename = f"prism_educator_telemetry_{course_id[:8]}.csv"
        return Response(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except Exception as e:
        logger.error(f"Error exporting educator CSV: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export educator CSV: {str(e)}",
        )
