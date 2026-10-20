"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Github, Shield, Heart } from "lucide-react";
import { TEAM_MEMBERS } from "./landing-data";

export const LandingFooter: React.FC = () => {
  return (
    <footer id="team" className="border-t border-white/[0.08] bg-[#07080D] pt-16 pb-12">
      <div className="container max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/[0.06]">
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-prism-cyan via-prism-violet to-prism-pink p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#07080D]">
                  <Sparkles className="h-4 w-4 text-prism-cyan" />
                </div>
              </div>
              <span className="text-base font-bold tracking-tight text-white">
                PRISM
              </span>
            </Link>

            <p className="text-xs text-foreground-muted leading-relaxed max-w-sm">
              The Temporal Evidence Firewall for education. Enforces strict timestamp-bounded grounding, misconception diagnostics, and adaptive oral examination.
            </p>

            <div className="flex items-center gap-2 text-xs font-mono text-foreground-subtle">
              <Shield className="h-3.5 w-3.5 text-prism-cyan" />
              <span>Hackathon 2026 &bull; Team The Falcons</span>
            </div>
          </div>

          {/* Team Falcons Members (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Team The Falcons
            </h4>
            <div className="space-y-3">
              {TEAM_MEMBERS.map((member) => (
                <div
                  key={member.name}
                  className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
                >
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="h-6 w-6 rounded-full bg-prism-violet/20 border border-prism-violet/30 text-prism-violet text-[10px] font-mono font-bold flex items-center justify-center">
                      {member.avatar}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {member.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-foreground-subtle leading-tight">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Architecture Links (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Platform Architecture
            </h4>
            <ul className="space-y-2 text-xs text-foreground-muted">
              <li>
                <a
                  href="#firewall-demo"
                  className="hover:text-white transition-colors"
                >
                  Temporal Firewall Demo
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="hover:text-white transition-colors"
                >
                  Evidence Inspector & Bento
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-white transition-colors"
                >
                  Pipeline Specification
                </a>
              </li>
              <li>
                <Link
                  href="/design"
                  className="hover:text-white transition-colors"
                >
                  Component Kitchen Sink (/design)
                </Link>
              </li>
              <li>
                <a
                  href="https://prism-api-z7c9.onrender.com/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-prism-cyan transition-colors font-mono text-[11px]"
                >
                  API Health Status (/health) &rarr;
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-foreground-subtle">
          <p className="flex items-center gap-1.5">
            Built with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> by
            <strong className="text-white">Fuzail Ahmad</strong> and
            <strong className="text-white">Lakshya Garg</strong> (The Falcons).
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/FuzailAhmad-Sphericaljudge/prism-ai-learning-assistant"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground-muted hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Github className="h-4 w-4" />
              <span>GitHub Repository</span>
            </a>
            <span>MIT License</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
