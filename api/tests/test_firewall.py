import pytest
from api.firewall.types import (
    ChunkCandidate,
    FirewallMode,
    AdmitStatus,
)
from api.firewall.engine import evaluate_chunk_firewall, filter_candidate_chunks


def test_chunk_fully_before_playback_admitted():
    """Chunks with end_sec <= playback_sec must be admitted with unmodified original text."""
    candidate = ChunkCandidate(
        chunk_id="chunk-1",
        source_id="src-video",
        source_type="video",
        text="The binary search tree invariant requires left keys to be smaller than root.",
        start_sec=200.0,
        end_sec=240.0,
    )
    decision = evaluate_chunk_firewall(
        candidate=candidate,
        playback_sec=300.0,
        mode=FirewallMode.LEARN_SO_FAR,
    )

    assert decision.admitted is True
    assert decision.status == AdmitStatus.ADMITTED
    assert decision.permitted_text == candidate.text
    assert decision.effective_end_sec == 240.0


def test_chunk_fully_after_playback_excluded():
    """Chunks with start_sec >= playback_sec must be blocked in learn_so_far mode."""
    candidate = ChunkCandidate(
        chunk_id="chunk-future",
        source_id="src-video",
        source_type="video",
        text="Deletion in BSTs handles three structural cases including two children.",
        start_sec=1150.0,
        end_sec=1200.0,
    )
    decision = evaluate_chunk_firewall(
        candidate=candidate,
        playback_sec=1122.0,  # 18:42
        mode=FirewallMode.LEARN_SO_FAR,
    )

    assert decision.admitted is False
    assert decision.status == AdmitStatus.EXCLUDED_FUTURE
    assert decision.permitted_text == ""


def test_straddling_chunk_at_18_42_interpolated():
    """
    At 18:42 (1122s), a chunk spanning 1110s to 1140s should be admitted
    with reconstructed prefix text, blocking the latter part.
    """
    candidate = ChunkCandidate(
        chunk_id="chunk-straddle",
        source_id="src-video",
        source_type="video",
        text="Finding in-order successors concludes our discussion of queries. Now we move on to deletion.",
        start_sec=1110.0,
        end_sec=1140.0,
    )
    decision = evaluate_chunk_firewall(
        candidate=candidate,
        playback_sec=1122.0,
        mode=FirewallMode.LEARN_SO_FAR,
    )

    assert decision.admitted is True
    assert decision.status == AdmitStatus.STRADDLING_INTERPOLATED
    assert "successors" in decision.permitted_text.lower()
    assert decision.permitted_text != candidate.text
    assert decision.permitted_text.endswith("...")


def test_filter_candidate_chunks_batch():
    """Tests batch candidate filtering into admitted and blocked groups."""
    c1 = ChunkCandidate(chunk_id="c1", source_id="s1", source_type="video", text="Intro", start_sec=0.0, end_sec=50.0)
    c2 = ChunkCandidate(chunk_id="c2", source_id="s1", source_type="video", text="Mid 1", start_sec=100.0, end_sec=150.0)
    c3 = ChunkCandidate(chunk_id="c3", source_id="s1", source_type="video", text="Future", start_sec=400.0, end_sec=450.0)

    admitted, blocked = filter_candidate_chunks(
        candidates=[c1, c2, c3],
        playback_sec=200.0,
        mode=FirewallMode.LEARN_SO_FAR,
    )

    assert len(admitted) == 2
    assert len(blocked) == 1
    assert admitted[0].chunk_id == "c1"
    assert admitted[1].chunk_id == "c2"
    assert blocked[0].chunk_id == "c3"
