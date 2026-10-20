"use client";

import * as React from "react";
import { Check, X, Sparkles, Shield, AlertCircle } from "lucide-react";
import { SectionHeading } from "@/components/prism/SectionHeading";
import { COMPARISON_ROWS } from "./landing-data";

export const ComparisonTable: React.FC = () => {
  return (
    <section id="comparison" className="py-24 border-t border-white/[0.08] relative overflow-hidden bg-[#07080D]">
      <div className="container max-w-7xl mx-auto px-4 sm:px-8">
        <SectionHeading
          badge="Direct Benchmark"
          title="Generic Chatbots vs"
          gradientTitle="PRISM Assistant"
          subtitle="Why frontier foundation models cannot be trusted with educational curricula without an active Temporal Evidence Firewall."
          align="center"
          className="mb-16"
        />

        <div className="w-full max-w-5xl mx-auto overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0E1018] shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#0B0D14]">
                  <th className="py-5 px-6 text-xs font-mono font-bold text-foreground-muted uppercase tracking-wider w-1/3">
                    Pedagogical Capability
                  </th>
                  <th className="py-5 px-6 text-xs font-mono font-bold text-rose-400 uppercase tracking-wider w-1/3">
                    Generic LLM Chatbots
                  </th>
                  <th className="py-5 px-6 text-xs font-mono font-bold text-prism-cyan uppercase tracking-wider w-1/3 bg-prism-cyan/[0.03]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-prism-cyan" />
                      <span>PRISM Learning Assistant</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs">
                {COMPARISON_ROWS.map((row) => (
                  <tr
                    key={row.feature}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-5 px-6 font-semibold text-white">
                      {row.feature}
                    </td>

                    {/* Generic Chatbot Column */}
                    <td className="py-5 px-6 text-foreground-muted">
                      <div className="flex items-start gap-2.5">
                        <div className="h-5 w-5 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-rose-400">
                          <X className="h-3 w-3" />
                        </div>
                        <span className="leading-relaxed">{row.generic}</span>
                      </div>
                    </td>

                    {/* PRISM Column */}
                    <td className="py-5 px-6 text-white font-medium bg-prism-cyan/[0.02]">
                      <div className="flex items-start gap-2.5">
                        <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-emerald-400">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                        <span className="leading-relaxed text-foreground-bright font-sans">
                          {row.prism}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Bottom Takeaway Banner */}
          <div className="p-4 sm:p-5 bg-[#0B0D14] border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-foreground-muted">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-prism-cyan" />
              <span>Verdict: PRISM guarantees curriculum integrity and inductive derivation.</span>
            </span>
            <span className="text-prism-pink font-semibold">
              Zero Spoilers &bull; 100% Attributed
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
