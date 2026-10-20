"use client";

import * as React from "react";
import { TECH_STACK } from "./landing-data";

export const TechStackMarquee: React.FC = () => {
  const [isPaused, setIsPaused] = React.useState<boolean>(false);
  // Duplicate for infinite marquee loop
  const duplicatedStack = [...TECH_STACK, ...TECH_STACK];

  return (
    <div className="py-14 border-t border-b border-white/[0.06] bg-[#07080D] overflow-hidden relative">
      {/* Edge gradient masks for smooth fade */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#07080D] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#07080D] to-transparent z-10 pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 mb-4 flex items-center justify-between text-center">
        <span className="text-[11px] font-mono tracking-widest uppercase text-foreground-subtle mx-auto">
          Architected with Modern High-Performance Infrastructure
        </span>
        <button
          type="button"
          onClick={() => setIsPaused(!isPaused)}
          className="text-[10px] font-mono text-foreground-subtle hover:text-white px-2 py-0.5 rounded border border-white/10 hidden sm:inline-block"
          aria-label={isPaused ? "Resume ticker" : "Pause ticker"}
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
      </div>

      <div className="flex overflow-hidden select-none py-2">
        <div
          className="flex items-center gap-6 animate-marquee whitespace-nowrap"
          style={{ animationPlayState: isPaused ? "paused" : "running" }}
        >
          {duplicatedStack.map((tech, idx) => (
            <div
              key={`${tech.name}-${idx}`}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05] transition-all"
            >
              <div className="h-2 w-2 rounded-full bg-prism-cyan animate-pulse" />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white tracking-wide">
                  {tech.name}
                </span>
                <span className="text-[10px] font-mono text-foreground-subtle">
                  {tech.category} &bull; {tech.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
