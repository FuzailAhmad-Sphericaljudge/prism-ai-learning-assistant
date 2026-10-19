import * as React from "react";
import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#07080D] py-12 px-4 sm:px-8">
      <div className="container max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand info */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-prism-cyan to-prism-violet p-[1px]">
              <div className="h-full w-full bg-[#07080D] rounded-[7px] flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-prism-cyan" />
              </div>
            </div>
            <span className="font-bold text-sm tracking-tight text-white">
              PRISM
            </span>
            <span className="text-xs text-foreground-subtle">
              — Temporal Evidence Firewall
            </span>
          </div>
          <p className="text-xs text-foreground-muted text-center md:text-left max-w-md">
            Built with precision by Team <strong className="text-foreground">The Falcons</strong> for Hackathon 2026.
            Zero spoilers, exact temporal grounding.
          </p>
        </div>

        {/* Footer links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-foreground-muted">
          <Link href="/design" className="hover:text-white transition-colors">
            Design Kitchen Sink
          </Link>
          <a
            href="https://github.com/FuzailAhmad-Sphericaljudge/Prism"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
          <span className="text-foreground-subtle">|</span>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Temporal Firewall Active
          </div>
        </div>
      </div>
    </footer>
  );
};
