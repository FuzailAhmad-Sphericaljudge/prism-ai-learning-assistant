"use client";

import * as React from "react";
import { ShieldAlert, FileWarning, Brain, EyeOff, AlertTriangle } from "lucide-react";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent } from "@/components/prism/GlassCard";
import { SectionHeading } from "@/components/prism/SectionHeading";
import { PAIN_POINTS } from "./landing-data";

export const ProblemStrip: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "ShieldAlert":
        return <ShieldAlert className="h-6 w-6" />;
      case "FileWarning":
        return <FileWarning className="h-6 w-6" />;
      case "BrainOff":
        return <Brain className="h-6 w-6" />;
      case "EyeOff":
        return <EyeOff className="h-6 w-6" />;
      default:
        return <AlertTriangle className="h-6 w-6" />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case "pink":
        return {
          iconBg: "bg-prism-pink/10 border-prism-pink/25 text-prism-pink",
          glow: "pink" as const,
          badge: "text-prism-pink bg-prism-pink/10 border-prism-pink/20",
        };
      case "amber":
        return {
          iconBg: "bg-prism-amber/10 border-prism-amber/25 text-prism-amber",
          glow: "amber" as const,
          badge: "text-prism-amber bg-prism-amber/10 border-prism-amber/20",
        };
      case "violet":
        return {
          iconBg: "bg-prism-violet/10 border-prism-violet/25 text-prism-violet",
          glow: "violet" as const,
          badge: "text-prism-violet bg-prism-violet/10 border-prism-violet/20",
        };
      case "cyan":
      default:
        return {
          iconBg: "bg-prism-cyan/10 border-prism-cyan/25 text-prism-cyan",
          glow: "cyan" as const,
          badge: "text-prism-cyan bg-prism-cyan/10 border-prism-cyan/20",
        };
    }
  };

  return (
    <section className="py-20 border-t border-white/[0.08] relative overflow-hidden bg-[#07080D]">
      <div className="container max-w-7xl mx-auto px-4 sm:px-8">
        <SectionHeading
          badge="The Broken Status Quo"
          title="Why generic AI chatbots"
          gradientTitle="fail education"
          subtitle="Frontier LLMs are designed for open conversation, not pedagogical sequencing. When dropped into coursework, they break learning in four catastrophic ways."
          align="center"
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PAIN_POINTS.map((point) => {
            const styling = getColorClasses(point.color);
            return (
              <GlassCard
                key={point.id}
                variant="accent"
                glowColor={styling.glow}
                hoverEffect
                className="flex flex-col justify-between group transition-all duration-300"
              >
                <div>
                  <GlassCardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`h-12 w-12 rounded-2xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm ${styling.iconBg}`}
                      >
                        {getIcon(point.icon)}
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${styling.badge}`}
                      >
                        {point.subtitle}
                      </span>
                    </div>

                    <GlassCardTitle className="text-lg font-bold group-hover:text-white transition-colors">
                      {point.title}
                    </GlassCardTitle>
                    <GlassCardDescription className="text-xs text-foreground-muted leading-relaxed mt-2">
                      {point.description}
                    </GlassCardDescription>
                  </GlassCardHeader>
                </div>

                <GlassCardContent className="pt-4 border-t border-white/[0.06] mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-mono text-white tracking-tight">
                      {point.stat}
                    </span>
                    <span className="text-[11px] text-foreground-subtle leading-tight font-sans">
                      {point.statLabel}
                    </span>
                  </div>
                </GlassCardContent>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};
