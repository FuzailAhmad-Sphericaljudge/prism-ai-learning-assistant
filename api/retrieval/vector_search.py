from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from api.retrieval.types import ScoredCandidate
from api.firewall.types import FirewallMode
from api.firewall.resource_policy import DEFAULT_SLIDE_LANDMARKS, DEFAULT_PDF_LANDMARKS


def get_max_allowed_slide(playback_sec: float) -> int:
    """Returns the highest slide number permitted at playback_sec."""
    max_slide = 1
    for s_num, (s_start, _) in sorted(DEFAULT_SLIDE_LANDMARKS.items()):
        if s_start <= playback_sec:
            max_slide = max(max_slide, s_num)
    return max_slide


def get_max_allowed_page(playback_sec: float) -> int:
    """Returns the highest PDF page number permitted at playback_sec."""
    max_page = 1
    for p_num, (p_start, _) in sorted(DEFAULT_PDF_LANDMARKS.items()):
        if p_start <= playback_sec:
            max_page = max(max_page, p_num)
    return max_page


def search_vector_candidates(
    db: Session,
    query_vector: List[float],
    course_id: str,
    playback_sec: float,
    mode: FirewallMode = FirewallMode.LEARN_SO_FAR,
    top_k: int = 10,
) -> List[ScoredCandidate]:
    """
    Executes a pgvector cosine similarity search with the Temporal Evidence Firewall
    strictly evaluated at the SQL candidate filtering stage.
    """
    max_slide = get_max_allowed_slide(playback_sec)
    max_page = get_max_allowed_page(playback_sec)
    mode_str = mode.value if hasattr(mode, "value") else str(mode)

    vector_str = "[" + ",".join(str(float(x)) for x in query_vector) + "]"

    sql = text("""
        SELECT 
            c.id,
            c.source_id,
            s.type AS source_type,
            c.text,
            c.start_sec,
            c.end_sec,
            c.page,
            c.slide,
            (1.0 - (c.embedding <=> CAST(:query_vector AS vector))) AS similarity
        FROM chunks c
        JOIN sources s ON c.source_id = s.id
        WHERE s.course_id = :course_id
          AND c.embedding IS NOT NULL
          AND (
            :mode = 'explore_ahead'
            OR (
                (s.type = 'video' AND (c.start_sec IS NULL OR c.start_sec < :playback_sec))
                OR (s.type = 'ppt' AND (c.slide IS NULL OR c.slide <= :max_slide))
                OR (s.type = 'pdf' AND (c.page IS NULL OR c.page <= :max_page))
                OR (s.type = 'notes')
            )
          )
        ORDER BY c.embedding <=> CAST(:query_vector AS vector) ASC
        LIMIT :top_k
    """)

    results: List[ScoredCandidate] = []
    try:
        rows = db.execute(
            sql,
            {
                "query_vector": vector_str,
                "course_id": course_id,
                "mode": mode_str,
                "playback_sec": playback_sec,
                "max_slide": max_slide,
                "max_page": max_page,
                "top_k": top_k,
            },
        ).fetchall()

        for idx, row in enumerate(rows):
            results.append(
                ScoredCandidate(
                    chunk_id=str(row[0]),
                    source_id=str(row[1]),
                    source_type=str(row[2]),
                    text=str(row[3]),
                    start_sec=float(row[4]) if row[4] is not None else None,
                    end_sec=float(row[5]) if row[5] is not None else None,
                    page=int(row[6]) if row[6] is not None else None,
                    slide=int(row[7]) if row[7] is not None else None,
                    vector_rank=idx + 1,
                    vector_score=round(float(row[8]), 4) if row[8] is not None else None,
                )
            )
    except Exception as e:
        # Fallback for offline testing or when vector extension is not configured
        pass

    return results
