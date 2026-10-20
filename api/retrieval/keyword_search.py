import re
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from api.retrieval.types import ScoredCandidate
from api.firewall.types import FirewallMode
from api.retrieval.vector_search import get_max_allowed_slide, get_max_allowed_page


def clean_keyword_query(query: str) -> str:
    """Sanitizes user query for plainto_tsquery usage."""
    cleaned = re.sub(r"[^\w\s]", " ", query).strip()
    return " ".join(cleaned.split())


def search_keyword_candidates(
    db: Session,
    query: str,
    course_id: str,
    playback_sec: float,
    mode: FirewallMode = FirewallMode.LEARN_SO_FAR,
    top_k: int = 10,
) -> List[ScoredCandidate]:
    """
    Executes a Postgres tsvector full-text search with the Temporal Evidence Firewall
    evaluated at the SQL candidate stage before any candidates are loaded into memory.
    """
    max_slide = get_max_allowed_slide(playback_sec)
    max_page = get_max_allowed_page(playback_sec)
    mode_str = mode.value if hasattr(mode, "value") else str(mode)
    clean_q = clean_keyword_query(query)

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
            ts_rank_cd(c.tsv, plainto_tsquery('english', :query)) AS rank_score
        FROM chunks c
        JOIN sources s ON c.source_id = s.id
        WHERE s.course_id = :course_id
          AND c.tsv IS NOT NULL
          AND c.tsv @@ plainto_tsquery('english', :query)
          AND (
            :mode = 'explore_ahead'
            OR (
                (s.type = 'video' AND (c.start_sec IS NULL OR c.start_sec < :playback_sec))
                OR (s.type = 'ppt' AND (c.slide IS NULL OR c.slide <= :max_slide))
                OR (s.type = 'pdf' AND (c.page IS NULL OR c.page <= :max_page))
                OR (s.type = 'notes')
            )
          )
        ORDER BY ts_rank_cd(c.tsv, plainto_tsquery('english', :query)) DESC
        LIMIT :top_k
    """)

    results: List[ScoredCandidate] = []
    try:
        rows = db.execute(
            sql,
            {
                "query": clean_q,
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
                    keyword_rank=idx + 1,
                    keyword_score=round(float(row[8]), 4) if row[8] is not None else None,
                )
            )
    except Exception as e:
        # Fallback for SQLite in tests or environments without tsvector
        pass

    return results
