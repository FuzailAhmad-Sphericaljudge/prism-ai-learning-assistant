#!/usr/bin/env python3
"""
PRISM Retrieve CLI Debug Utility
Executes the Temporal Evidence Firewall and Hybrid Retrieval pipeline
from the command line for rapid inspection and verification.
"""

import sys
import argparse
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from api.database import SessionLocal
from api.retrieval.hybrid import HybridRetriever
from api.retrieval.types import RetrievalQuery
from api.firewall.types import FirewallMode
from api.context.builder import ScopedContextBuilder


def main():
    parser = argparse.ArgumentParser(description="PRISM Temporal Evidence Firewall Debug CLI")
    parser.add_argument("--query", "-q", default="How do we delete a node with two children?", help="User search query")
    parser.add_argument("--course-id", "-c", default="00000000-0000-0000-0000-000000000002", help="Course UUID")
    parser.add_argument("--time", "-t", type=float, default=1122.0, help="Playback position in seconds (default: 1122.0 / 18:42)")
    parser.add_argument("--mode", "-m", choices=["learn_so_far", "explore_ahead"], default="learn_so_far", help="Firewall mode")
    parser.add_argument("--top-k", "-k", type=int, default=5, help="Number of final candidates to retrieve")

    args = parser.parse_args()

    mode = FirewallMode.EXPLORE_AHEAD if args.mode == "explore_ahead" else FirewallMode.LEARN_SO_FAR

    print("==================================================")
    print("  PRISM Temporal Evidence Firewall Debug Tool")
    print("==================================================")
    print(f" Query:        '{args.query}'")
    print(f" Course ID:    {args.course_id}")
    print(f" Playback:     {args.time}s ({int(args.time // 60)}:{int(args.time % 60):02d})")
    print(f" Firewall Mode: {mode.value.upper()}")
    print("--------------------------------------------------\n")

    db = SessionLocal()
    retriever = HybridRetriever()
    builder = ScopedContextBuilder()

    try:
        ret_query = RetrievalQuery(
            query=args.query,
            course_id=args.course_id,
            playback_sec=args.time,
            mode=mode,
            final_top_k=args.top_k,
        )

        result = retriever.retrieve(query=ret_query, db=db)

        print(f"Admitted Candidates: {len(result.admitted_candidates)}")
        for idx, cand in enumerate(result.admitted_candidates, start=1):
            coord = (
                f"{cand.start_sec}s-{cand.end_sec}s"
                if cand.start_sec is not None
                else f"Slide {cand.slide}" if cand.slide else f"Page {cand.page}" if cand.page else "Notes"
            )
            print(f"  [{idx}] E{idx} ({cand.source_type.upper()}: {coord})")
            print(f"      Text: {cand.text[:120]}...")
            print(f"      RRF: {cand.rrf_score:.5f} | Rerank: {cand.rerank_score or 0.0:.4f}")

        scoped = builder.build_context(result.admitted_candidates, playback_sec=args.time, mode=mode)
        print("\n--- Scoped Prompt Block Preview ---")
        print(scoped.formatted_prompt_block)

    finally:
        db.close()


if __name__ == "__main__":
    main()
