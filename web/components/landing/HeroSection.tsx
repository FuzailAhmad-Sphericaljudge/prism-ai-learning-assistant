"use client";

import * as React from "react";
import { ArrowRight, Sparkles, Shield, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientText } from "@/components/prism/GradientText";
import { RefractionVisual } from "./RefractionVisual";
import { FloatingProductMock } from "./FloatingProductMock";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-12 pb-20 overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] hero-prism-radial pointer-events-none -z-10" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-8 flex flex-col items-center text-center">
        {/* Top Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md text-xs font-mono mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <span className="flex h-2 w-2 rounded-full bg-prism-cyan animate-pulse" />
          <span className="text-foreground-muted">Hackathon 2026</span>
          <span className="text-white/20">|</span>
          <span className="text-prism-pink font-semibold">Team The Falcons</span>
          <span className="text-white/20">|</span>
          <span className="text-prism-cyan font-mono">Temporal Evidence Firewall</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.08] mb-6">
          Learn in context.{" "}
          <GradientText variant="prism" animate>
            Prove understanding.
          </GradientText>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-foreground-muted max-w-3xl leading-relaxed mb-10 font-normal">
          The first timestamp-aware AI learning assistant that refuses to spoil future lecture concepts or hallucinate unsupported claims. Cited answers, diagnostic checks, and adaptive oral defense.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <Button
            variant="primary"
            size="lg"
            asChild
            className="shadow-prism-glow text-sm font-semibold px-6 py-6"
          >
            <a href="#firewall-demo" className="flex items-center gap-2">
              <Play className="h-4 w-4 fill-current text-white" />
              <span>Launch Interactive Demo</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>

          <Button
            variant="glass"
            size="lg"
            asChild
            className="border-white/10 text-sm font-semibold px-6 py-6 hover:bg-white/10 transition-colors"
          >
            <a href="#how-it-works" className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-prism-cyan" />
              <span>How The Firewall Works</span>
            </a>
          </Button>
        </div>

        {/* Interactive Prism Refraction Visual */}
        <div className="w-full max-w-4xl mb-12">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-mono text-foreground-muted flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-prism-violet" />
              Interactive Refraction Engine: Move cursor to modulate prism angle &lambda;
            </span>
            <span className="text-[11px] font-mono text-prism-cyan hidden sm:inline">
              Continuous Spectral Dispersion
            </span>
          </div>
          <RefractionVisual />
        </div>

        {/* Floating Product UI Mock */}
        <div className="w-full">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="h-1 w-8 rounded-full bg-gradient-to-r from-prism-cyan to-prism-violet" />
            <span className="text-xs font-mono tracking-wider text-foreground-subtle uppercase">
              Live Product Canvas Preview
            </span>
            <span className="h-1 w-8 rounded-full bg-gradient-to-r from-prism-violet to-prism-pink" />
          </div>
          <FloatingProductMock />
        </div>
      </div>
    </section>
  );
};
