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


def test_slide_temporal_policy_admission_and_exclusion():
    """Slide 6 is admitted at 18:42 (1122s); Slide 7 (starts at 1122s) is blocked prior to 1122s."""
    slide6 = ChunkCandidate(
        chunk_id="slide-6",
        source_id="src-ppt",
        source_type="ppt",
        text="Order statistics: Tree-Minimum, Tree-Maximum, Successor.",
        slide=6,
    )
    slide7 = ChunkCandidate(
        chunk_id="slide-7",
        source_id="src-ppt",
        source_type="ppt",
        text="Deletion: 3 Structural Cases (Leaf, Single Child, Two Children).",
        slide=7,
    )

    # At 15:00 (900s): Slide 6 admitted, Slide 7 blocked
    dec6 = evaluate_chunk_firewall(slide6, playback_sec=900.0, mode=FirewallMode.LEARN_SO_FAR)
    dec7 = evaluate_chunk_firewall(slide7, playback_sec=900.0, mode=FirewallMode.LEARN_SO_FAR)
    assert dec6.admitted is True
    assert dec7.admitted is False
    assert dec7.status == AdmitStatus.EXCLUDED_RESOURCE_POLICY

    # At 18:42 (1122s): Slide 7 becomes permitted
    dec7_at_1842 = evaluate_chunk_firewall(slide7, playback_sec=1122.0, mode=FirewallMode.LEARN_SO_FAR)
    assert dec7_at_1842.admitted is True


def test_pdf_handout_temporal_policy_admission_and_exclusion():
    """PDF Page 2 is admitted up to 18:42; Page 3 is blocked before 18:42."""
    pdf_p2 = ChunkCandidate(
        chunk_id="pdf-p2",
        source_id="src-pdf",
        source_type="pdf",
        text="Section 3: Search, Insertion, Successor algorithms.",
        page=2,
    )
    pdf_p3 = ChunkCandidate(
        chunk_id="pdf-p3",
        source_id="src-pdf",
        source_type="pdf",
        text="Section 5: Deletion algorithm and self-balancing trees.",
        page=3,
    )

    # At 10:00 (600s): Page 2 admitted, Page 3 blocked
    dec_p2 = evaluate_chunk_firewall(pdf_p2, playback_sec=600.0, mode=FirewallMode.LEARN_SO_FAR)
    dec_p3 = evaluate_chunk_firewall(pdf_p3, playback_sec=600.0, mode=FirewallMode.LEARN_SO_FAR)
    assert dec_p2.admitted is True
    assert dec_p3.admitted is False


def test_explore_ahead_mode_unconstrained_admission():
    """In explore_ahead mode, future chunks and future slides are admitted."""
    future_chunk = ChunkCandidate(
        chunk_id="chunk-avl",
        source_id="src-video",
        source_type="video",
        text="AVL tree rotations maintain height balance invariant |h_L - h_R| <= 1.",
        start_sec=1600.0,
        end_sec=1650.0,
    )
    decision = evaluate_chunk_firewall(
        candidate=future_chunk,
        playback_sec=500.0,
        mode=FirewallMode.EXPLORE_AHEAD,
    )
    assert decision.admitted is True
    assert decision.status == AdmitStatus.ADMITTED
    assert decision.permitted_text == future_chunk.text


def test_mode_switch_back_purges_explored_ahead_conversation_turns():
    """
    When returning to learn_so_far mode, any prior turns tagged as explored_ahead
    or occurring at a future timestamp must be strictly excised from conversation context.
    """
    from api.firewall.conversation_filter import filter_conversation_history

    messages = [
        {"id": "m1", "role": "user", "content": "What is the BST property?", "playback_sec": 300.0, "explored_ahead": False},
        {"id": "m2", "role": "assistant", "content": "Keys in left subtree < x.key.", "playback_sec": 300.0, "explored_ahead": False},
        {"id": "m3", "role": "user", "content": "Tell me about AVL rotations in advance.", "playback_sec": 1600.0, "explored_ahead": True},
        {"id": "m4", "role": "assistant", "content": "AVL trees rotate around the unbalanced pivot.", "playback_sec": 1600.0, "explored_ahead": True},
    ]

    # In explore_ahead: all 4 turns visible
    exploratory_history = filter_conversation_history(messages, current_mode=FirewallMode.EXPLORE_AHEAD, playback_sec=300.0)
    assert len(exploratory_history) == 4

    # Returning to learn_so_far at 300s: m3 and m4 must be purged!
    guarded_history = filter_conversation_history(messages, current_mode=FirewallMode.LEARN_SO_FAR, playback_sec=300.0)
    assert len(guarded_history) == 2
    assert [m["id"] for m in guarded_history] == ["m1", "m2"]


def test_anti_leakage_future_concept_question():
    """
    Leakage Test:
    Question: 'How do we delete a node with two children?'
    The only candidate containing the answer is c_deletion (starts at 1122s / 18:42).
    In learn_so_far mode at t=1000s (before 18:42), c_deletion MUST NOT be admitted.
    """
    c_intro = ChunkCandidate(chunk_id="c_intro", source_id="s1", source_type="video", text="Intro to dynamic sets.", start_sec=0.0, end_sec=142.0)
    c_search = ChunkCandidate(chunk_id="c_search", source_id="s1", source_type="video", text="Search takes O(h) path.", start_sec=585.0, end_sec=780.0)
    c_succ = ChunkCandidate(chunk_id="c_succ", source_id="s1", source_type="video", text="Finding successor takes O(h).", start_sec=780.0, end_sec=1122.0)
    c_deletion = ChunkCandidate(
        chunk_id="c_deletion",
        source_id="s1",
        source_type="video",
        text="Case 3: to delete a node with two children, replace it with its in-order successor from the right subtree.",
        start_sec=1122.0,
        end_sec=1390.0,
    )

    all_candidates = [c_intro, c_search, c_succ, c_deletion]

    # Student at 1000s (< 18:42): c_deletion must be completely blocked
    admitted, blocked = filter_candidate_chunks(all_candidates, playback_sec=1000.0, mode=FirewallMode.LEARN_SO_FAR)
    admitted_ids = [a.chunk_id for a in admitted]
    blocked_ids = [b.chunk_id for b in blocked]

    assert "c_deletion" not in admitted_ids
    assert "c_deletion" in blocked_ids
    # Verify no admitted text contains the words 'replace it with its in-order successor'
    admitted_corpus = " ".join([a.permitted_text for a in admitted])
    assert "replace it with its in-order successor" not in admitted_corpus

    # But at 1200s (> 18:42), c_deletion is unlocked
    admitted_future, _ = filter_candidate_chunks(all_candidates, playback_sec=1200.0, mode=FirewallMode.LEARN_SO_FAR)
    assert "c_deletion" in [a.chunk_id for a in admitted_future]



