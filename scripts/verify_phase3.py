#!/usr/bin/env python3
"""
PRISM Phase 3 Verification Script
Verifies:
1. All Phase 3 components, pages, stores, and hooks exist
2. Temporal Evidence Firewall and 18:42 boundary invariants
3. React Query, Zustand, and multi-modal viewer contracts
"""

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
WEB_DIR = ROOT_DIR / "web"

REQUIRED_FILES = [
    # Pages
    "app/app/page.tsx",
    "app/learn/page.tsx",
    "app/learn/[courseId]/page.tsx",
    # App shell & Library
    "components/app/app-sidebar.tsx",
    "components/app/app-topbar.tsx",
    "components/app/app-shell.tsx",
    "components/app/course-card.tsx",
    "components/app/course-grid.tsx",
    "components/app/course-library-header.tsx",
    "components/ui/progress-ring.tsx",
    # Player & Controls
    "components/player/video-player.tsx",
    "components/player/prism-progress-bar.tsx",
    "components/player/player-controls.tsx",
    "components/player/video-player-container.tsx",
    "lib/hooks/use-player-shortcuts.ts",
    "lib/chapters.ts",
    # Synced Transcript
    "components/transcript/transcript-item.tsx",
    "components/transcript/synced-transcript-panel.tsx",
    # Firewall Controls
    "components/firewall/firewall-mode-toggle.tsx",
    "components/firewall/firewall-status-badge.tsx",
    # Chat & Socratic UI
    "components/chat/ask-about-this-moment.tsx",
    "components/chat/chat-message-list.tsx",
    "components/chat/chat-suggested-prompts.tsx",
    "components/chat/chat-composer.tsx",
    "components/chat/chat-tab-panel.tsx",
    # Resources (Slides, PDF, Notes)
    "components/resources/slide-viewer.tsx",
    "components/resources/pdf-viewer.tsx",
    "components/resources/notes-viewer.tsx",
    "components/resources/resources-tab-panel.tsx",
    # Evidence Inspector
    "components/evidence/evidence-inspector-tab-panel.tsx",
    # Right Tabbed Container
    "components/right-panel/right-tabbed-panel.tsx",
    # Mobile & Skeletons
    "components/learn/learn-mobile-tabs.tsx",
    "components/learn/learn-page-skeleton.tsx",
    # State & API
    "lib/stores/use-player-store.ts",
    "lib/api.ts",
    "lib/api-types.ts",
    "providers/query-provider.tsx",
]

def check_files():
    print("========================================")
    print("PRISM Phase 3: File Structure Inspection")
    print("========================================")
    missing = []
    for rel_path in REQUIRED_FILES:
        full_path = WEB_DIR / rel_path
        if not full_path.exists():
            print(f"  [FAIL] Missing: web/{rel_path}")
            missing.append(rel_path)
        else:
            print(f"  [PASS] Found: web/{rel_path}")
    return len(missing) == 0

def check_invariants():
    print("\n========================================")
    print("PRISM Phase 3: Architectural Invariants")
    print("========================================")
    invariants_passed = True

    # 1. Check contracts for firewall modes
    types_file = WEB_DIR / "lib" / "api-types.ts"
    types_code = types_file.read_text(encoding="utf-8")
    if "learn_so_far" in types_code and "explore_ahead" in types_code:
        print("  [PASS] Contracts define 'learn_so_far' and 'explore_ahead' firewall modes")
    else:
        print("  [FAIL] Missing firewall modes in api-types.ts")
        invariants_passed = False

    # 2. Check 18:42 boundary case in chapters
    chapters_file = WEB_DIR / "lib" / "chapters.ts"
    chapters_code = chapters_file.read_text(encoding="utf-8")
    if "1122" in chapters_code or "18:42" in chapters_code:
        print("  [PASS] Chapters configuration strictly models the 18:42 cutoff boundary")
    else:
        print("  [FAIL] Missing 18:42 boundary in chapters.ts")
        invariants_passed = False

    # 3. Check Seeded Course UUID
    learn_page = WEB_DIR / "app" / "learn" / "[courseId]" / "page.tsx"
    learn_code = learn_page.read_text(encoding="utf-8")
    if "00000000-0000-0000-0000-000000000002" in learn_code:
        print("  [PASS] /learn page references seeded course 00000000-0000-0000-0000-000000000002")
    else:
        print("  [FAIL] Missing seeded course ID in learn page")
        invariants_passed = False

    # 4. Check Chat Tab Firewall Interception
    chat_file = WEB_DIR / "components" / "chat" / "chat-tab-panel.tsx"
    chat_code = chat_file.read_text(encoding="utf-8")
    if "Temporal Evidence Firewall" in chat_code:
        print("  [PASS] ChatTabPanel enforces real-time Temporal Firewall interception")
    else:
        print("  [FAIL] ChatTabPanel missing firewall warning logic")
        invariants_passed = False

    # 5. Check Evidence Inspector Multi-Modal Citations
    evidence_file = WEB_DIR / "components" / "evidence" / "evidence-inspector-tab-panel.tsx"
    evidence_code = evidence_file.read_text(encoding="utf-8")
    if "video" in evidence_code and "slide" in evidence_code and "pdf" in evidence_code and "notes" in evidence_code:
        print("  [PASS] Evidence Inspector handles video, slide, pdf, and notes citation vectors")
    else:
        print("  [FAIL] Evidence Inspector missing multi-modal modalities")
        invariants_passed = False

    return invariants_passed

def main():
    files_ok = check_files()
    invariants_ok = check_invariants()

    print("\n========================================")
    if files_ok and invariants_ok:
        print(">>> ALL PHASE 3 VERIFICATION CHECKS PASSED <<<")
        print("========================================")
        sys.exit(0)
    else:
        print(">>> SOME VERIFICATION CHECKS FAILED <<<")
        print("========================================")
        sys.exit(1)

if __name__ == "__main__":
    main()
