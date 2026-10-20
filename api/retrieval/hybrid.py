from typing import Optional, List
from sqlalchemy.orm import Session
from api.retrieval.types import RetrievalQuery, RetrievalResult, ScoredCandidate
from api.retrieval.vector_search import search_vector_candidates
from api.retrieval.keyword_search import search_keyword_candidates
from api.retrieval.rrf import reciprocal_rank_fusion
from api.retrieval.reranker import BaseReranker, CrossEncoderHeuristicReranker
from api.firewall.prefix_interpolator import interpolate_permitted_prefix
from api.firewall.types import FirewallMode
from api.providers.factory import get_provider


class HybridRetriever:
    """
    Unified Hybrid Retrieval Engine combining:
    1. SQL Pre-Filtered pgvector Cosine Search
    2. SQL Pre-Filtered Postgres tsvector Keyword Search
    3. Reciprocal Rank Fusion (RRF)
    4. Word-Level Straddling Interpolation
    5. Cross-Encoder / Semantic Reranking

    Guarantees that the Temporal Evidence Firewall is evaluated in SQL BEFORE
    any raw text reaches the model.
    """

    def __init__(self, reranker: Optional[BaseReranker] = None):
        self.reranker = reranker or CrossEncoderHeuristicReranker()
        self.provider = get_provider()

    def retrieve(
        self,
        query: RetrievalQuery,
        db: Session,
        query_vector: Optional[List[float]] = None,
    ) -> RetrievalResult:
        # 1. Obtain query embedding
        if query_vector is None:
            try:
                emb_res = self.provider.embed([query.query])
                if emb_res and len(emb_res) > 0:
                    query_vector = emb_res[0]
            except Exception:
                pass

        if query_vector is None:
            # Deterministic mock fallback
            query_vector = [0.05] * 768

        # 2. SQL Candidate Vector Search (strictly pre-filtered by firewall in SQL)
        vector_candidates = search_vector_candidates(
            db=db,
            query_vector=query_vector,
            course_id=query.course_id,
            playback_sec=query.playback_sec,
            mode=query.mode,
            top_k=query.vector_top_k,
        )

        # 3. SQL Candidate Keyword Search (strictly pre-filtered by firewall in SQL)
        keyword_candidates = search_keyword_candidates(
            db=db,
            query=query.query,
            course_id=query.course_id,
            playback_sec=query.playback_sec,
            mode=query.mode,
            top_k=query.keyword_top_k,
        )

        # 4. Merge via Reciprocal Rank Fusion (RRF)
        fused = reciprocal_rank_fusion(
            vector_candidates=vector_candidates,
            keyword_candidates=keyword_candidates,
            rrf_k=query.rrf_k,
            top_k=max(query.vector_top_k, query.keyword_top_k),
        )

        # 5. Apply word-level straddling interpolation for any chunk that crosses the boundary
        admitted: List[ScoredCandidate] = []
        for cand in fused:
            if (
                query.mode == FirewallMode.LEARN_SO_FAR
                and cand.start_sec is not None
                and cand.end_sec is not None
                and cand.start_sec < query.playback_sec < cand.end_sec
            ):
                splittable, prefix_text, eff_end = interpolate_permitted_prefix(
                    text=cand.text,
                    start_sec=cand.start_sec,
                    end_sec=cand.end_sec,
                    playback_sec=query.playback_sec,
                )
                if splittable:
                    cand_copy = cand.model_copy()
                    cand_copy.text = prefix_text
                    cand_copy.end_sec = eff_end
                    admitted.append(cand_copy)
            else:
                admitted.append(cand)

        # 6. Re-rank top candidates
        reranked = self.reranker.rerank(
            query=query.query,
            candidates=admitted,
            top_n=query.final_top_k,
        )

        return RetrievalResult(
            query=query.query,
            course_id=query.course_id,
            playback_sec=query.playback_sec,
            mode=query.mode,
            admitted_candidates=reranked,
        )
