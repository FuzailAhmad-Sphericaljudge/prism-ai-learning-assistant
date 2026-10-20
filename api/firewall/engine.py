from typing import List, Tuple, Optional
from api.firewall.types import (
    ChunkCandidate,
    FirewallDecision,
    AdmitStatus,
    FirewallMode,
)
from api.firewall.prefix_interpolator import interpolate_permitted_prefix
from api.firewall.resource_policy import ResourceTimestampPolicy, DEFAULT_SLIDE_LANDMARKS, DEFAULT_PDF_LANDMARKS


default_resource_policy = ResourceTimestampPolicy()


def evaluate_chunk_firewall(
    candidate: ChunkCandidate,
    playback_sec: float,
    mode: FirewallMode = FirewallMode.LEARN_SO_FAR,
    policy: Optional[ResourceTimestampPolicy] = None,
) -> FirewallDecision:
    """
    Pure evaluation function determining whether a candidate chunk is admitted,
    interpolated, or blocked by the Temporal Evidence Firewall.
    """
    policy = policy or default_resource_policy

    # 1. Unconstrained exploration mode
    if mode == FirewallMode.EXPLORE_AHEAD:
        return FirewallDecision(
            chunk_id=candidate.chunk_id,
            status=AdmitStatus.ADMITTED,
            admitted=True,
            permitted_text=candidate.text,
            original_text=candidate.text,
            reason="Admitted unconditionally under explore_ahead mode",
            playback_sec=playback_sec,
            start_sec=candidate.start_sec,
            end_sec=candidate.end_sec,
            effective_end_sec=candidate.end_sec,
            source_type=candidate.source_type,
        )

    # 2. Multi-modal Static Artifacts (Slide, PDF, Notes)
    if candidate.source_type in ("ppt", "presentation", "slide", "pdf", "handout", "notes", "markdown"):
        is_admitted, reason, mapped_start = policy.is_resource_admitted(
            source_type=candidate.source_type,
            playback_sec=playback_sec,
            mode=mode,
            slide=candidate.slide,
            page=candidate.page,
            start_sec=candidate.start_sec,
        )

        return FirewallDecision(
            chunk_id=candidate.chunk_id,
            status=AdmitStatus.ADMITTED if is_admitted else AdmitStatus.EXCLUDED_RESOURCE_POLICY,
            admitted=is_admitted,
            permitted_text=candidate.text if is_admitted else "",
            original_text=candidate.text,
            reason=reason,
            playback_sec=playback_sec,
            start_sec=mapped_start,
            end_sec=candidate.end_sec,
            effective_end_sec=candidate.end_sec if is_admitted else None,
            source_type=candidate.source_type,
        )

    # 3. Video / Audio Transcript Chunks with explicit start and end times
    start = candidate.start_sec if candidate.start_sec is not None else 0.0
    end = candidate.end_sec if candidate.end_sec is not None else 0.0

    # Case A: Fully in the past
    if end <= playback_sec:
        return FirewallDecision(
            chunk_id=candidate.chunk_id,
            status=AdmitStatus.ADMITTED,
            admitted=True,
            permitted_text=candidate.text,
            original_text=candidate.text,
            reason=f"Admitted: chunk end ({end}s) <= playback boundary ({playback_sec}s)",
            playback_sec=playback_sec,
            start_sec=start,
            end_sec=end,
            effective_end_sec=end,
            source_type=candidate.source_type,
        )

    # Case B: Fully in the future (or exact start boundary with zero elapsed)
    if start >= playback_sec:
        return FirewallDecision(
            chunk_id=candidate.chunk_id,
            status=AdmitStatus.EXCLUDED_FUTURE,
            admitted=False,
            permitted_text="",
            original_text=candidate.text,
            reason=f"Blocked: chunk start ({start}s) >= playback boundary ({playback_sec}s)",
            playback_sec=playback_sec,
            start_sec=start,
            end_sec=end,
            effective_end_sec=None,
            source_type=candidate.source_type,
        )

    # Case C: Straddling the playback boundary (start < playback_sec < end)
    splittable, prefix_text, effective_end = interpolate_permitted_prefix(
        text=candidate.text,
        start_sec=start,
        end_sec=end,
        playback_sec=playback_sec,
    )

    if splittable:
        return FirewallDecision(
            chunk_id=candidate.chunk_id,
            status=AdmitStatus.STRADDLING_INTERPOLATED,
            admitted=True,
            permitted_text=prefix_text,
            original_text=candidate.text,
            reason=f"Straddling: interpolated permitted prefix up to {playback_sec}s (orig: {start}s-{end}s)",
            playback_sec=playback_sec,
            start_sec=start,
            end_sec=end,
            effective_end_sec=effective_end,
            source_type=candidate.source_type,
        )
    else:
        return FirewallDecision(
            chunk_id=candidate.chunk_id,
            status=AdmitStatus.EXCLUDED_FUTURE,
            admitted=False,
            permitted_text="",
            original_text=candidate.text,
            reason=f"Straddling: below minimum safe word threshold, excluded to avoid fragment noise",
            playback_sec=playback_sec,
            start_sec=start,
            end_sec=end,
            effective_end_sec=None,
            source_type=candidate.source_type,
        )


def filter_candidate_chunks(
    candidates: List[ChunkCandidate],
    playback_sec: float,
    mode: FirewallMode = FirewallMode.LEARN_SO_FAR,
    policy: Optional[ResourceTimestampPolicy] = None,
) -> Tuple[List[FirewallDecision], List[FirewallDecision]]:
    """
    Evaluates a collection of candidate chunks against the Temporal Evidence Firewall.

    Returns:
        (admitted_chunks, blocked_chunks)
    """
    admitted: List[FirewallDecision] = []
    blocked: List[FirewallDecision] = []

    for c in candidates:
        decision = evaluate_chunk_firewall(
            candidate=c,
            playback_sec=playback_sec,
            mode=mode,
            policy=policy,
        )
        if decision.admitted:
            admitted.append(decision)
        else:
            blocked.append(decision)

    return admitted, blocked
