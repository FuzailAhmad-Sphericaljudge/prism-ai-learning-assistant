from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import text

from api.database import get_db
from api.models.course import Course
from api.models.chunk import Chunk
from api.models.source import Source
from api.schemas.retrieve import (
    RetrieveDebugRequest,
    RetrieveDebugResponse,
    AdmittedChunkDebug,
    BlockedChunkDebug,
)
from api.retrieval.hybrid import HybridRetriever
from api.retrieval.types import RetrievalQuery
from api.firewall.engine import evaluate_chunk_firewall
from api.firewall.types import ChunkCandidate, FirewallMode
from api.context.builder import ScopedContextBuilder

router = APIRouter(prefix="/retrieve", tags=["retrieval"])
hybrid_retriever = HybridRetriever()
context_builder = ScopedContextBuilder(max_token_budget=2000)


@router.post("", response_model=RetrieveDebugResponse)
def debug_retrieve(
    payload: RetrieveDebugRequest,
    db: DBSession = Depends(get_db),
):
    """
    Debug inspection endpoint for the Temporal Evidence Firewall.
    Returns admitted candidates, straddling interpolated segments,
    and blocked future chunk IDs with explicit causal exclusion reasons.
    """
    # 1. Verify course
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID '{payload.course_id}' not found.",
        )

    # 2. Run hybrid retrieval
    ret_query = RetrievalQuery(
        query=payload.query,
        course_id=payload.course_id,
        playback_sec=payload.playback_sec,
        mode=payload.mode,
        final_top_k=payload.top_k,
    )
    result = hybrid_retriever.retrieve(query=ret_query, db=db)

    # 3. Format admitted candidates
    admitted_debug: list[AdmittedChunkDebug] = []
    admitted_ids = set()
    for c in result.admitted_candidates:
        admitted_ids.add(c.chunk_id)
        # Determine status
        is_straddling = (
            c.start_sec is not None
            and c.end_sec is not None
            and c.start_sec < payload.playback_sec < c.end_sec
        )
        status_label = "straddling_interpolated" if is_straddling else "admitted"
        reason_label = (
            f"Straddling chunk: interpolated permitted prefix up to {payload.playback_sec}s"
            if is_straddling
            else f"Permitted: content occurs before temporal boundary {payload.playback_sec}s"
        )
        admitted_debug.append(
            AdmittedChunkDebug(
                chunk_id=c.chunk_id,
                source_id=c.source_id,
                source_type=c.source_type,
                text=c.text,
                start_sec=c.start_sec,
                end_sec=c.end_sec,
                page=c.page,
                slide=c.slide,
                similarity_score=c.rerank_score or c.rrf_score,
                status=status_label,
                reason=reason_label,
            )
        )

    # 4. Fetch candidate chunks in the future to report blocked reasons
    blocked_debug: list[BlockedChunkDebug] = []
    if payload.mode == FirewallMode.LEARN_SO_FAR:
        # Query future chunks for this course
        future_chunks = (
            db.query(Chunk, Source.type)
            .join(Source, Chunk.source_id == Source.id)
            .filter(Source.course_id == payload.course_id)
            .filter(
                (Source.type == "video") & (Chunk.start_sec >= payload.playback_sec)
                | (Source.type == "ppt") & (Chunk.slide > 6) if payload.playback_sec < 1122.0 else False
            )
            .limit(10)
            .all()
        )

        for chunk, src_type in future_chunks:
            candidate = ChunkCandidate(
                chunk_id=chunk.id,
                source_id=chunk.source_id,
                source_type=src_type,
                text=chunk.text,
                start_sec=chunk.start_sec,
                end_sec=chunk.end_sec,
                page=chunk.page,
                slide=chunk.slide,
            )
            decision = evaluate_chunk_firewall(
                candidate=candidate,
                playback_sec=payload.playback_sec,
                mode=payload.mode,
            )
            if not decision.admitted:
                blocked_debug.append(
                    BlockedChunkDebug(
                        chunk_id=chunk.id,
                        source_id=chunk.source_id,
                        source_type=src_type,
                        start_sec=chunk.start_sec,
                        end_sec=chunk.end_sec,
                        page=chunk.page,
                        slide=chunk.slide,
                        status=decision.status.value,
                        reason=decision.reason,
                    )
                )

    # 5. Build Scoped Context Preview
    scoped_ctx = context_builder.build_context(
        candidates=result.admitted_candidates,
        playback_sec=payload.playback_sec,
        mode=payload.mode,
    )

    mode_str = payload.mode.value if hasattr(payload.mode, "value") else str(payload.mode)
    return RetrieveDebugResponse(
        query=payload.query,
        course_id=payload.course_id,
        playback_sec=payload.playback_sec,
        mode=mode_str,
        admitted_count=len(admitted_debug),
        blocked_count=len(blocked_debug),
        admitted=admitted_debug,
        blocked=blocked_debug,
        scoped_prompt_preview=scoped_ctx.formatted_prompt_block,
    )
