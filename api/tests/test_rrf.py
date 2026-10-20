import pytest
from api.retrieval.types import ScoredCandidate
from api.retrieval.rrf import reciprocal_rank_fusion


def test_rrf_boosts_dual_match_candidate():
    """A candidate appearing in both vector and keyword rankings must score highest."""
    c_dual = ScoredCandidate(chunk_id="dual", source_id="s1", source_type="video", text="Dual match text")
    c_vec_only = ScoredCandidate(chunk_id="vec", source_id="s1", source_type="video", text="Vector only text")
    c_key_only = ScoredCandidate(chunk_id="key", source_id="s1", source_type="video", text="Keyword only text")

    # Vector list: c_vec_only (rank 1), c_dual (rank 2)
    vector_list = [c_vec_only, c_dual]
    # Keyword list: c_dual (rank 1), c_key_only (rank 2)
    keyword_list = [c_dual, c_key_only]

    fused = reciprocal_rank_fusion(vector_list, keyword_list, rrf_k=60)

    # c_dual score = 1/(60+2) + 1/(60+1) = 0.016129 + 0.016393 = 0.03252
    # c_vec_only score = 1/(60+1) = 0.016393
    # c_key_only score = 1/(60+2) = 0.016129
    assert len(fused) == 3
    assert fused[0].chunk_id == "dual"
    assert fused[0].rrf_score > fused[1].rrf_score
    assert fused[1].chunk_id == "vec"
    assert fused[2].chunk_id == "key"


def test_rrf_empty_inputs():
    """Empty inputs return empty output without errors."""
    fused = reciprocal_rank_fusion([], [])
    assert fused == []


def test_rrf_top_k_limiting():
    """Top-k slice respects the requested limit."""
    cands = [ScoredCandidate(chunk_id=f"c{i}", source_id="s1", source_type="video", text=f"Text {i}") for i in range(15)]
    fused = reciprocal_rank_fusion(cands, [], top_k=5)
    assert len(fused) == 5
