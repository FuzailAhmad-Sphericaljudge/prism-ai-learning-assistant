import pytest
from api.tutor.validator import OutputValidator
from api.context.builder import ScopedEvidenceItem
from api.firewall.types import FirewallMode


def test_validator_detects_hallucinated_citation_id():
    validator = OutputValidator()

    admitted = [
        ScopedEvidenceItem(
            evidence_id="E1",
            chunk_id="c1",
            source_type="video",
            coordinate="05:00 - 06:00",
            start_sec=300.0,
            end_sec=360.0,
            text="Grounded BST invariant explanation.",
            estimated_tokens=20,
        )
    ]

    # Model hallucinated [E99]
    answer = "The binary search tree maintains invariant [E1], but also rotates nodes [E99]."
    res = validator.validate(
        answer_text=answer,
        admitted_evidence=admitted,
        playback_sec=500.0,
        mode=FirewallMode.LEARN_SO_FAR,
    )

    assert res.is_valid is False
    assert "E99" in res.invalid_citation_ids
    assert res.unsupported_claims_flagged is True


def test_validator_detects_future_temporal_violation():
    validator = OutputValidator()

    admitted = [
        ScopedEvidenceItem(
            evidence_id="E1",
            chunk_id="c1",
            source_type="video",
            coordinate="20:00 - 21:00",
            start_sec=1200.0,  # Beyond playback_sec
            end_sec=1260.0,
            text="Deletion Case 3 explanation.",
            estimated_tokens=20,
        )
    ]

    answer = "Deleting two children replaces with successor [E1]."
    # Student is at 1000s (< 1200s)
    res = validator.validate(
        answer_text=answer,
        admitted_evidence=admitted,
        playback_sec=1000.0,
        mode=FirewallMode.LEARN_SO_FAR,
    )

    assert res.is_valid is False
    assert res.unsupported_claims_flagged is True


def test_validator_passes_fully_supported_grounded_answer():
    validator = OutputValidator()

    admitted = [
        ScopedEvidenceItem(
            evidence_id="E1",
            chunk_id="c1",
            source_type="video",
            coordinate="05:00 - 06:00",
            start_sec=300.0,
            end_sec=360.0,
            text="Grounded BST invariant explanation.",
            estimated_tokens=20,
        ),
        ScopedEvidenceItem(
            evidence_id="E2",
            chunk_id="c2",
            source_type="ppt",
            coordinate="Slide 3",
            slide=3,
            text="Slide invariant definition.",
            estimated_tokens=20,
        ),
    ]

    answer = "The binary search tree maintains invariant [E1], which is reinforced on Slide 3 [E2]."
    res = validator.validate(
        answer_text=answer,
        admitted_evidence=admitted,
        playback_sec=500.0,
        mode=FirewallMode.LEARN_SO_FAR,
    )

    assert res.is_valid is True
    assert res.unsupported_claims_flagged is False
    assert set(res.detected_citation_ids) == {"E1", "E2"}


def test_validator_passes_not_covered_yet_state():
    validator = OutputValidator()

    answer = "This topic has not been covered yet up to 18:42 in this lecture."
    res = validator.validate(
        answer_text=answer,
        admitted_evidence=[],
        playback_sec=1122.0,
        mode=FirewallMode.LEARN_SO_FAR,
        is_not_covered=True,
    )

    assert res.is_valid is True
    assert res.unsupported_claims_flagged is False

