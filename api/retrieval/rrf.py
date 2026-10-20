from typing import List, Dict
from api.retrieval.types import ScoredCandidate


def reciprocal_rank_fusion(
    vector_candidates: List[ScoredCandidate],
    keyword_candidates: List[ScoredCandidate],
    rrf_k: int = 60,
    top_k: int = 10,
) -> List[ScoredCandidate]:
    """
    Combines ranked lists from vector search and keyword search using
    Reciprocal Rank Fusion (RRF).

    Formula:
        RRF_Score(d) = sum_{m in {vector, keyword}} ( 1.0 / (rrf_k + rank_m(d)) )
    """
    candidate_map: Dict[str, ScoredCandidate] = {}
    rrf_scores: Dict[str, float] = {}

    # 1. Process vector results
    for rank_idx, cand in enumerate(vector_candidates, start=1):
        cid = cand.chunk_id
        if cid not in candidate_map:
            candidate_map[cid] = cand.model_copy()
        candidate_map[cid].vector_rank = rank_idx
        rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (rrf_k + rank_idx))

    # 2. Process keyword results
    for rank_idx, cand in enumerate(keyword_candidates, start=1):
        cid = cand.chunk_id
        if cid not in candidate_map:
            candidate_map[cid] = cand.model_copy()
        candidate_map[cid].keyword_rank = rank_idx
        candidate_map[cid].keyword_score = cand.keyword_score
        rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (rrf_k + rank_idx))

    # 3. Assign merged RRF scores
    merged: List[ScoredCandidate] = []
    for cid, cand in candidate_map.items():
        score = rrf_scores.get(cid, 0.0)
        cand.rrf_score = round(score, 6)
        merged.append(cand)

    # 4. Sort by RRF score descending
    merged.sort(key=lambda c: c.rrf_score, reverse=True)

    return merged[:top_k]
