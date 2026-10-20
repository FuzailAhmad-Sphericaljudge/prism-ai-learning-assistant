from unittest.mock import MagicMock
import pytest
from api.retrieval.types import RetrievalQuery, ScoredCandidate
from api.retrieval.hybrid import HybridRetriever
from api.retrieval.reranker import CrossEncoderHeuristicReranker
from api.firewall.types import FirewallMode


def test_hybrid_retriever_pipeline_and_interpolation():
    """
    Tests the HybridRetriever orchestration:
    - Merges vector and keyword candidate sets
    - Interpolates text of straddling chunk at 18:42
    - Re-ranks candidates using CrossEncoderHeuristicReranker
    """
    retriever = HybridRetriever(reranker=CrossEncoderHeuristicReranker())

    # Mock DB session
    mock_db = MagicMock()

    # Suppose vector search returns 2 candidates
    cand1 = ScoredCandidate(
        chunk_id="chunk-bst-prop",
        source_id="s1",
        source_type="video",
        text="The binary search tree property guarantees that left child is less than root.",
        start_sec=255.0,
        end_sec=420.0,
        vector_rank=1,
        vector_score=0.92,
    )
    # Suppose keyword search returns a straddling chunk at 18:42 (1110s to 1140s)
    cand2 = ScoredCandidate(
        chunk_id="chunk-straddle",
        source_id="s1",
        source_type="video",
        text="The successor of node x is found. Now we transition to deletion in trees.",
        start_sec=1110.0,
        end_sec=1140.0,
        keyword_rank=1,
        keyword_score=0.88,
    )

    query = RetrievalQuery(
        query="What is the BST property?",
        course_id="c1",
        playback_sec=1122.0,  # 18:42
        mode=FirewallMode.LEARN_SO_FAR,
        final_top_k=2,
    )

    # Patch the vector and keyword search functions directly for unit test
    import api.retrieval.hybrid as h_module
    orig_vec = h_module.search_vector_candidates
    orig_key = h_module.search_keyword_candidates

    try:
        h_module.search_vector_candidates = lambda db, query_vector, course_id, playback_sec, mode, top_k: [cand1]
        h_module.search_keyword_candidates = lambda db, query, course_id, playback_sec, mode, top_k: [cand2]

        result = retriever.retrieve(query=query, db=mock_db, query_vector=[0.1] * 768)

        assert len(result.admitted_candidates) == 2
        # Verify straddling candidate had its text interpolated
        straddle_res = next(c for c in result.admitted_candidates if c.chunk_id == "chunk-straddle")
        assert "deletion" not in straddle_res.text.lower()
        assert straddle_res.text.endswith("...")

        # cand1 should rank #1 because it has exact term match for 'BST property'
        assert result.admitted_candidates[0].chunk_id == "chunk-bst-prop"
        assert result.admitted_candidates[0].rerank_score is not None
        assert result.admitted_candidates[0].rerank_score > 0.0

    finally:
        h_module.search_vector_candidates = orig_vec
        h_module.search_keyword_candidates = orig_key
