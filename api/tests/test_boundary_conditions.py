import pytest
from api.firewall.types import ChunkCandidate, FirewallMode, AdmitStatus
from api.firewall.engine import evaluate_chunk_firewall


def test_exact_equal_chunk_end_timestamp():
    """When playback_sec exactly equals chunk.end_sec, the chunk has completed and must be admitted."""
    cand = ChunkCandidate(
        chunk_id="c_exact_end",
        source_id="s1",
        source_type="video",
        text="This sentence concludes precisely at 18:42.",
        start_sec=1100.0,
        end_sec=1122.0,
    )
    decision = evaluate_chunk_firewall(cand, playback_sec=1122.0, mode=FirewallMode.LEARN_SO_FAR)
    assert decision.admitted is True
    assert decision.status == AdmitStatus.ADMITTED
    assert decision.permitted_text == cand.text


def test_exact_equal_chunk_start_timestamp():
    """When playback_sec exactly equals chunk.start_sec, 0 seconds have elapsed; chunk must be excluded."""
    cand = ChunkCandidate(
        chunk_id="c_exact_start",
        source_id="s1",
        source_type="video",
        text="This sentence begins at 18:42 and has not elapsed yet.",
        start_sec=1122.0,
        end_sec=1150.0,
    )
    decision = evaluate_chunk_firewall(cand, playback_sec=1122.0, mode=FirewallMode.LEARN_SO_FAR)
    assert decision.admitted is False
    assert decision.status == AdmitStatus.EXCLUDED_FUTURE


def test_sub_second_epsilon_precision():
    """Epsilon before boundary (1121.999s) vs at/after boundary (1122.0s)."""
    cand = ChunkCandidate(
        chunk_id="c_boundary",
        source_id="s1",
        source_type="video",
        text="A boundary chunk from 1122 to 1150.",
        start_sec=1122.0,
        end_sec=1150.0,
    )
    # Epsilon before: strictly excluded
    dec_before = evaluate_chunk_firewall(cand, playback_sec=1121.999, mode=FirewallMode.LEARN_SO_FAR)
    assert dec_before.admitted is False

    # Exact boundary: excluded (0 seconds elapsed)
    dec_at = evaluate_chunk_firewall(cand, playback_sec=1122.0, mode=FirewallMode.LEARN_SO_FAR)
    assert dec_at.admitted is False

    # Straddling slightly in (1125.0s, elapsed 3s): interpolated or admitted
    cand_long = ChunkCandidate(
        chunk_id="c_long",
        source_id="s1",
        source_type="video",
        text="One two three four five six seven eight nine ten eleven twelve.",
        start_sec=1120.0,
        end_sec=1140.0,
    )
    dec_in = evaluate_chunk_firewall(cand_long, playback_sec=1130.0, mode=FirewallMode.LEARN_SO_FAR)
    assert dec_in.admitted is True
    assert dec_in.status == AdmitStatus.STRADDLING_INTERPOLATED
