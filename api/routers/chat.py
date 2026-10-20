import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session as DBSession

from api.database import get_db
from api.models.course import Course
from api.models.source import Source
from api.models.chunk import Chunk
from api.schemas.chat import ChatRequest, ChatResponse
from api.tutor.workflow import TutorWorkflow
from api.tutor.streamer import format_sse_stream
from api.tutor.persistence import persist_chat_turn

logger = logging.getLogger("prism.routers.chat")

router = APIRouter(prefix="/chat", tags=["chat"])
workflow = TutorWorkflow()


def _get_nearby_transcript_cues(
    db: DBSession,
    course_id: str,
    playback_sec: float,
) -> List[Dict[str, Any]]:
    """
    Fetches transcript cues around current playback timestamp for deictic reference resolution.
    """
    try:
        chunks = (
            db.query(Chunk)
            .join(Source, Chunk.source_id == Source.id)
            .filter(
                Source.course_id == course_id,
                Source.type == "video",
                Chunk.start_sec <= playback_sec + 15.0,
                Chunk.end_sec >= max(0.0, playback_sec - 45.0),
            )
            .order_by(Chunk.start_sec.asc())
            .limit(5)
            .all()
        )
        return [
            {
                "text": c.text,
                "start_sec": c.start_sec,
                "end_sec": c.end_sec,
            }
            for c in chunks
        ]
    except Exception as e:
        logger.warning(f"Failed to fetch nearby transcript cues: {e}")
        return []


@router.post("/stream")
async def chat_stream(
    payload: ChatRequest,
    db: DBSession = Depends(get_db),
):
    """
    Server-Sent Events (SSE) streaming endpoint for grounded AI tutor.
    Emits progressive tokens followed by a final structured JSON event
    containing citations, diagnostic check card, and validation metadata.
    """
    # 1. Verify course
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID '{payload.course_id}' not found.",
        )

    # 2. Gather temporal context cues
    nearby_cues = _get_nearby_transcript_cues(
        db=db,
        course_id=payload.course_id,
        playback_sec=payload.playback_sec,
    )

    # 3. Execute tutor workflow
    chat_response = workflow.execute(
        req=payload,
        db=db,
        nearby_cues=nearby_cues,
    )

    # 4. Persist messages and evidence snapshot
    msg_id = persist_chat_turn(
        db=db,
        session_id=payload.session_id,
        user_query=payload.query,
        chat_response=chat_response,
        playback_sec=payload.playback_sec,
        mode=payload.mode,
    )
    if msg_id:
        chat_response.message_id = msg_id

    # 5. Return SSE Stream
    return StreamingResponse(
        format_sse_stream(chat_response, token_delay_sec=0.015),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("", response_model=ChatResponse)
def chat_sync(
    payload: ChatRequest,
    db: DBSession = Depends(get_db),
):
    """
    Synchronous chat endpoint for grounded AI tutor queries.
    Returns complete ChatResponse with citations and diagnostic check.
    """
    # 1. Verify course
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID '{payload.course_id}' not found.",
        )

    # 2. Gather temporal context cues
    nearby_cues = _get_nearby_transcript_cues(
        db=db,
        course_id=payload.course_id,
        playback_sec=payload.playback_sec,
    )

    # 3. Execute tutor workflow
    chat_response = workflow.execute(
        req=payload,
        db=db,
        nearby_cues=nearby_cues,
    )

    # 4. Persist messages and evidence snapshot
    msg_id = persist_chat_turn(
        db=db,
        session_id=payload.session_id,
        user_query=payload.query,
        chat_response=chat_response,
        playback_sec=payload.playback_sec,
        mode=payload.mode,
    )
    if msg_id:
        chat_response.message_id = msg_id

    return chat_response

