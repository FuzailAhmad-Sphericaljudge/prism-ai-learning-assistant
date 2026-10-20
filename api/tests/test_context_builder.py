import pytest
from api.retrieval.types import ScoredCandidate
from api.context.builder import ScopedContextBuilder
from api.firewall.types import FirewallMode


def test_scoped_context_builder_stable_ids_and_coordinates():
    builder = ScopedContextBuilder(max_token_budget=1000)

    candidates = [
        ScoredCandidate(
            chunk_id="c1",
            source_id="s1",
            source_type="video",
            text="First candidate content on tree invariant.",
            start_sec=120.0,
            end_sec=180.0,
        ),
        ScoredCandidate(
            chunk_id="c2",
            source_id="s2",
            source_type="ppt",
            text="Second candidate content on slide.",
            slide=3,
        ),
        ScoredCandidate(
            chunk_id="c3",
            source_id="s3",
            source_type="pdf",
            text="Third candidate content in handout.",
            page=1,
        ),
    ]

    ctx = builder.build_context(candidates, playback_sec=300.0, mode=FirewallMode.LEARN_SO_FAR)

    assert len(ctx.items) == 3
    assert ctx.items[0].evidence_id == "E1"
    assert ctx.items[0].coordinate == "2:00 - 3:00"
    assert ctx.items[1].evidence_id == "E2"
    assert ctx.items[1].coordinate == "Slide 3"
    assert ctx.items[2].evidence_id == "E3"
    assert ctx.items[2].coordinate == "Page 1"

    assert "[E1] Source: VIDEO (2:00 - 3:00)" in ctx.formatted_prompt_block
    assert "[E2] Source: PPT (Slide 3)" in ctx.formatted_prompt_block
    assert "[E3] Source: PDF (Page 1)" in ctx.formatted_prompt_block
    assert ctx.budget_exhausted is False


def test_token_budget_limiting():
    # Set a tiny token budget of only 50 tokens
    builder = ScopedContextBuilder(max_token_budget=50)

    long_text = "This is a very long text chunk designed to consume token budget rapidly. " * 10
    candidates = [
        ScoredCandidate(chunk_id=f"c{i}", source_id="s1", source_type="video", text=long_text, start_sec=0.0, end_sec=30.0)
        for i in range(5)
    ]

    ctx = builder.build_context(candidates, playback_sec=100.0)

    # Must truncate and set budget_exhausted to True
    assert ctx.budget_exhausted is True
    assert len(ctx.items) < len(candidates)
