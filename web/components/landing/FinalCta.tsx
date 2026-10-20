"use client";

import * as React from "react";
import { ArrowRight, Sparkles, Play, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlowBorder } from "@/components/prism/GlowBorder";
import { GradientText } from "@/components/prism/GradientText";

export const FinalCta: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-[#07080D]">
      {/* Radiant Prism Core Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-prism-cyan/15 via-prism-violet/15 to-prism-pink/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container max-w-5xl mx-auto px-4 sm:px-8 text-center">
        <GlowBorder animated intensity="high" borderRadius="24px">
          <div className="p-8 sm:p-14 bg-[#0E1018] rounded-[23px] border border-white/[0.08] relative overflow-hidden flex flex-col items-center">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-prism-cyan/30 bg-prism-cyan/5 text-xs font-mono text-prism-cyan mb-6">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Ready for Classroom Deployment</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 max-w-3xl leading-[1.15]">
              Experience Socratic AI without the{" "}
              <GradientText variant="prism" animate>
                Spoilers & Hallucinations.
              </GradientText>
            </h2>

            <p className="text-sm sm:text-base text-foreground-muted max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              Empower students to explore ideas fearlessly while preserving inductive derivation, evidence inspection, and verifiable oral defense.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                asChild
                className="shadow-prism-glow text-sm font-semibold px-8 py-6"
              >
                <a href="#firewall-demo" className="flex items-center gap-2">
                  <Play className="h-4 w-4 fill-current text-white" />
                  <span>Try Temporal Firewall Demo</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>

              <Button
                variant="glass"
                size="lg"
                asChild
                className="border-white/10 text-sm font-semibold px-8 py-6 hover:bg-white/10 transition-colors"
              >
                <a href="/design" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-prism-violet" />
                  <span>Explore Design Kitchen Sink</span>
                </a>
              </Button>
            </div>
          </div>
        </GlowBorder>
      </div>
    </section>
  );
};
