import pytest
from api.context.resolver import DeicticContextResolver


def test_deictic_reference_detection():
    resolver = DeicticContextResolver()
    assert resolver.has_deictic_reference("Can you explain this?") is True
    assert resolver.has_deictic_reference("Why did that happen?") is True
    assert resolver.has_deictic_reference("What is being calculated here?") is True
    assert resolver.has_deictic_reference("Explain the Binary Search Tree property.") is False


def test_deictic_reference_resolution_with_permitted_cue():
    resolver = DeicticContextResolver(window_sec=60.0)

    cues = [
        {"start_sec": 100.0, "end_sec": 130.0, "text": "Early intro text."},
        {"start_sec": 1100.0, "end_sec": 1120.0, "text": "The successor of x is the minimum in the right subtree."},
        {"start_sec": 1150.0, "end_sec": 1180.0, "text": "Future deletion discussion."},  # In future relative to 1122s
    ]

    # At 18:42 (1122.0s), student asks "Why is this the case?"
    resolved_query, focal_cue = resolver.resolve_reference(
        query="Why is this the case?",
        playback_sec=1122.0,
        nearby_transcript_cues=cues,
    )

    assert focal_cue is not None
    assert focal_cue["start_sec"] == 1100.0
    assert "successor of x is the minimum" in focal_cue["text"]
    assert '[Context at 1122.0s: "The successor of x is the minimum in the right subtree."]' in resolved_query
    assert "Why is this the case?" in resolved_query


def test_future_cues_never_used_as_anchor():
    resolver = DeicticContextResolver()

    future_only_cues = [
        {"start_sec": 1200.0, "end_sec": 1250.0, "text": "Future content only."},
    ]

    resolved_query, focal = resolver.resolve_reference(
        query="What is this?",
        playback_sec=1100.0,
        nearby_transcript_cues=future_only_cues,
    )

    assert focal is None
    assert resolved_query == "What is this?"
