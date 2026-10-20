"""
PRISM Chat Stream CLI Tester
Demonstrates live SSE token streaming, citation extraction, and diagnostic check cards.

Usage:
    python scripts/test_chat_stream.py
    python scripts/test_chat_stream.py --query "Explain deletion with two children" --playback-sec 500
"""

import sys
import json
import argparse
from pathlib import Path

# Add project root to path
_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_ROOT))

from fastapi.testclient import TestClient
from api.main import create_app


def run_stream_cli(query: str, playback_sec: float, mode: str, course_id: str):
    print("=" * 65)
    print("  PRISM Grounded Tutor - Live SSE Stream & Firewall Tester")
    print("=" * 65)
    print(f" Course ID:     {course_id}")
    print(f" Playback Time: {playback_sec}s ({int(playback_sec//60)}:{int(playback_sec%60):02d})")
    print(f" Firewall Mode: {mode}")
    print(f" Query:         '{query}'")
    print("-" * 65)
    print(" [STREAMING RESPONSE]:")

    app = create_app()
    client = TestClient(app)

    payload = {
        "query": query,
        "course_id": course_id,
        "playback_sec": playback_sec,
        "mode": mode,
    }

    res = client.post("/chat/stream", json=payload)
    if res.status_code != 200:
        print(f"Error {res.status_code}: {res.text}")
        return

    body = res.text
    lines = body.split("\n")
    final_data = None

    for line in lines:
        if line.startswith("data: "):
            data_str = line[len("data: "):].strip()
            try:
                parsed = json.loads(data_str)
                if "token" in parsed:
                    sys.stdout.write(parsed["token"])
                    sys.stdout.flush()
                elif "answer" in parsed:
                    final_data = parsed
            except Exception:
                pass

    print("\n" + "-" * 65)

    if final_data:
        if final_data.get("is_not_covered"):
            print(" [FIREWALL STATUS]: WITHHELD (Concept Not Covered Yet)")
            print(f"   Detected Topic:  {final_data.get('not_covered_topic')}")
            avail = final_data.get('available_at_sec')
            if avail:
                print(f"   Unlocks At:      {avail}s ({int(avail//60)}:{int(avail%60):02d})")
        else:
            print(" [FIREWALL STATUS]: ADMITTED & GROUNDED")
            print(f"   Validation Passed: {final_data.get('validation_passed')}")
            citations = final_data.get("citations", [])
            print(f"   Citations ({len(citations)}):")
            for c in citations:
                print(f"     - [{c.get('evidence_id')}] ({c.get('source_type')} @ {c.get('coordinate')}): \"{c.get('quote')[:70]}...\"")

        check = final_data.get("check")
        if check:
            print("\n [DIAGNOSTIC UNDERSTANDING CHECK]:")
            print(f"   Question: {check.get('question')}")
            for idx, opt in enumerate(check.get("options", [])):
                letter = chr(65 + idx)
                mark = "*" if idx == check.get("correct_index") else " "
                print(f"     [{mark}] {letter}. {opt}")
            print(f"   Explanation: {check.get('explanation')}")

    print("=" * 65)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test PRISM chat streaming")
    parser.add_argument("--query", type=str, default="What is the binary search tree property?")
    parser.add_argument("--playback-sec", type=float, default=700.0)
    parser.add_argument("--mode", type=str, default="learn_so_far")
    parser.add_argument("--course-id", type=str, default="00000000-0000-0000-0000-000000000002")

    args = parser.parse_args()
    run_stream_cli(
        query=args.query,
        playback_sec=args.playback_sec,
        mode=args.mode,
        course_id=args.course_id,
    )
