"use client";

import * as React from "react";
import { IMPACT_STATS } from "./landing-data";
import { GlowBorder } from "@/components/prism/GlowBorder";

export const ImpactStats: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-[#07080D]">
      <div className="container max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {IMPACT_STATS.map((stat) => (
            <GlowBorder key={stat.label} intensity="low" borderRadius="18px">
              <div className="p-6 bg-[#0E1018] rounded-[17px] border border-white/[0.08] text-center flex flex-col justify-center items-center h-full group hover:border-prism-cyan/30 transition-all">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight mb-2 group-hover:text-prism-cyan transition-colors">
                  {stat.value}
                </span>
                <span className="text-xs font-bold text-foreground tracking-wide uppercase mb-1">
                  {stat.label}
                </span>
                <span className="text-xs text-foreground-subtle">
                  {stat.desc}
                </span>
              </div>
            </GlowBorder>
          ))}
        </div>
      </div>
    </section>
  );
};
