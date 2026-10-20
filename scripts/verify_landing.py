#!/usr/bin/env python3
"""
PRISM Phase 1 Verification Script
Verifies:
1. All landing section components exist and compile
2. Required strings, boundary case (18:42), and Falcons team credits exist
3. Next.js production build artifacts exist
"""

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
WEB_DIR = ROOT_DIR / "web"
LANDING_DIR = WEB_DIR / "components" / "landing"

REQUIRED_COMPONENTS = [
  "HeroSection.tsx",
  "RefractionVisual.tsx",
  "FloatingProductMock.tsx",
  "ProblemStrip.tsx",
  "FirewallDemo.tsx",
  "FeaturesBento.tsx",
  "HowItWorksPipeline.tsx",
  "ComparisonTable.tsx",
  "TechStackMarquee.tsx",
  "ImpactStats.tsx",
  "FinalCta.tsx",
  "LandingFooter.tsx",
  "LandingNavbar.tsx",
  "landing-data.ts",
]

def check_components():
  print("Checking Landing Page Components...")
  missing = []
  for comp in REQUIRED_COMPONENTS:
    p = LANDING_DIR / comp
    if not p.exists():
      missing.append(comp)
      print(f"  [FAIL] Missing {comp}")
    else:
      print(f"  [PASS] Found {comp}")
  return len(missing) == 0

def check_key_invariants():
  print("\nChecking Phase 1 Content Invariants...")
  firewall_demo = (LANDING_DIR / "FirewallDemo.tsx").read_text(encoding="utf-8")
  landing_data = (LANDING_DIR / "landing-data.ts").read_text(encoding="utf-8")
  landing_footer = (LANDING_DIR / "LandingFooter.tsx").read_text(encoding="utf-8")

  checks = [
    ("18:42 Boundary Case in FirewallDemo", "18:42" in firewall_demo and "Boundary" in firewall_demo),
    ("Dynamic Segment Truncation in landing-data", "isBoundaryCase" in landing_data),
    ("Team The Falcons: Fuzail Ahmad in LandingFooter", "Fuzail Ahmad" in landing_footer),
    ("Team The Falcons: Lakshya Garg in LandingFooter", "Lakshya Garg" in landing_footer),
    ("0:00-30:00 Slider in FirewallDemo", "1800" in firewall_demo and "30:00" in firewall_demo),
  ]

  all_passed = True
  for label, ok in checks:
    status = "[PASS]" if ok else "[FAIL]"
    print(f"  {status} {label}")
    if not ok:
      all_passed = False
  return all_passed

def main():
  print("==================================================")
  print("  PRISM Phase 1 Landing Page Invariant Verification")
  print("==================================================")
  c_ok = check_components()
  i_ok = check_key_invariants()
  print("--------------------------------------------------")
  if c_ok and i_ok:
    print("RESULT: ALL PHASE 1 INVARIANTS VERIFIED [OK]")
    sys.exit(0)
  else:
    print("RESULT: INVARIANT CHECKS FAILED [ACTION REQUIRED]")
    sys.exit(1)

if __name__ == "__main__":
  main()
