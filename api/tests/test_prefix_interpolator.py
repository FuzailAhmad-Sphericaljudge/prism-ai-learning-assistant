import pytest
from api.firewall.prefix_interpolator import interpolate_permitted_prefix


def test_straddling_chunk_at_18_42_boundary():
    """
    At 18:42 (1122.0s), a segment from 18:30 (1110.0s) to 19:00 (1140.0s):
    Total duration = 30.0s, elapsed = 12.0s, ratio = 12/30 = 0.40.
    40% of words should be permitted with cleanly formatted trailing ellipsis.
    """
    text = (
        "We have now completed our analysis of in-order successors. "
        "Next, we will begin discussing node deletion in binary search trees, "
        "which requires careful consideration of three distinct structural cases."
    )
    words = text.split()
    total_words = len(words)

    splittable, prefix, eff_end = interpolate_permitted_prefix(
        text=text,
        start_sec=1110.0,
        end_sec=1140.0,
        playback_sec=1122.0,
    )

    assert splittable is True
    assert prefix is not None
    assert prefix.endswith("...") or prefix.endswith(".")

    prefix_words = prefix.replace("...", "").split()
    expected_words = int(round(total_words * 0.40))
    assert abs(len(prefix_words) - expected_words) <= 1

    # Permitted prefix must contain the successor text, but must NOT reveal deletion cases
    assert "successors" in prefix.lower()
    assert "three distinct structural cases" not in prefix.lower()
    assert eff_end == pytest.approx(1110.0 + (30.0 * (expected_words / total_words)), 0.5)


def test_playback_before_chunk_start():
    """If playback is at or before chunk start, permitted fraction is 0."""
    splittable, prefix, eff_end = interpolate_permitted_prefix(
        text="This should be completely excluded because it is future content.",
        start_sec=100.0,
        end_sec=120.0,
        playback_sec=95.0,
    )
    assert splittable is False
    assert prefix == ""
    assert eff_end is None


def test_playback_exact_start_boundary():
    """Exact start boundary has zero elapsed duration; must be excluded."""
    splittable, prefix, eff_end = interpolate_permitted_prefix(
        text="Zero duration elapsed at exact start.",
        start_sec=100.0,
        end_sec=120.0,
        playback_sec=100.0,
    )
    assert splittable is False
    assert prefix == ""
    assert eff_end is None


def test_playback_after_chunk_end():
    """If playback is past chunk end, full text is admitted."""
    text = "Full historical chunk completely watched."
    splittable, prefix, eff_end = interpolate_permitted_prefix(
        text=text,
        start_sec=50.0,
        end_sec=80.0,
        playback_sec=90.0,
    )
    assert splittable is True
    assert prefix == text
    assert eff_end == 80.0


def test_minimum_word_rejection():
    """If the elapsed fraction yields fewer than min_permitted_words (default 3), reject to prevent fragments."""
    text = "Word1 Word2 Word3 Word4 Word5 Word6 Word7 Word8 Word9 Word10"
    # Only 10% of 10 words = 1 word < 3
    splittable, prefix, eff_end = interpolate_permitted_prefix(
        text=text,
        start_sec=0.0,
        end_sec=100.0,
        playback_sec=10.0,
        min_permitted_words=3,
    )
    assert splittable is False
    assert prefix == ""
    assert eff_end is None
