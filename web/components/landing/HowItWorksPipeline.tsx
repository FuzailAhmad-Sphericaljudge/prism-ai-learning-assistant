"use client";

import * as React from "react";
import {
  MessageSquare,
  Shield,
  Filter,
  Search,
  SlidersHorizontal,
  Bot,
  CheckCheck,
  ChevronRight,
  Code2,
} from "lucide-react";
import { SectionHeading } from "@/components/prism/SectionHeading";
import { PIPELINE_STAGES } from "./landing-data";

export const HowItWorksPipeline: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState<number>(2); // Default to Step 03 (Temporal Filter)
  const [copied, setCopied] = React.useState<boolean>(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(STEP_PAYLOADS[activeStep].json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStepIcon = (index: number) => {
    switch (index) {
      case 0:
        return <MessageSquare className="h-5 w-5" />;
      case 1:
        return <Shield className="h-5 w-5" />;
      case 2:
        return <Filter className="h-5 w-5" />;
      case 3:
        return <Search className="h-5 w-5" />;
      case 4:
        return <SlidersHorizontal className="h-5 w-5" />;
      case 5:
        return <Bot className="h-5 w-5" />;
      case 6:
      default:
        return <CheckCheck className="h-5 w-5" />;
    }
  };

  // Simulated payload per step
  const STEP_PAYLOADS: Record<number, { title: string; json: string }> = {
    0: {
      title: "Query Ingestion Payload",
      json: JSON.stringify(
        {
          student_query: "How does a node know events are concurrent?",
          playback_timestamp: "14:28",
          playback_seconds: 868,
          video_id: "lec-dist-sys-04",
        },
        null,
        2
      ),
    },
    1: {
      title: "Policy & Injection Audit",
      json: JSON.stringify(
        {
          intent_verified: "educational_question",
          jailbreak_detected: false,
          leakage_attack_detected: false,
          permitted_to_query: true,
        },
        null,
        2
      ),
    },
    2: {
      title: "Temporal Firewall Filter (Hard Boundary)",
      json: JSON.stringify(
        {
          firewall_boundary_t: 868,
          total_lecture_chunks: 142,
          chunks_retained: 38,
          chunks_firewalled: 104,
          forward_leakage_risk: 0.0,
        },
        null,
        2
      ),
    },
    3: {
      title: "Hybrid pgvector + BM25 Candidate Retrieval",
      json: JSON.stringify(
        {
          query_embedding_dim: 3072,
          vector_model: "gemini-embedding-001",
          dense_candidates: ["chunk_14_12", "chunk_12_40", "slide_18"],
          bm25_sparse_candidates: ["chunk_14_28", "slide_18"],
          rrf_fusion_score: 0.941,
        },
        null,
        2
      ),
    },
    4: {
      title: "Pedagogical Cross-Encoder Rerank",
      json: JSON.stringify(
        {
          top_candidates: [
            { id: "chunk_14_12", score: 0.98, modality: "audio" },
            { id: "slide_18", score: 0.95, modality: "deck" },
            { id: "page_42", score: 0.89, modality: "notes" },
          ],
        },
        null,
        2
      ),
    },
    5: {
      title: "Grounded Socratic Synthesis",
      json: JSON.stringify(
        {
          llm_engine: "gemini-3.5-flash-lite",
          citations_enforced: ["[14:12]", "[Slide 18]", "[Page 42]"],
          socratic_followup_ready: true,
        },
        null,
        2
      ),
    },
    6: {
      title: "Mathematical Temporal Verification",
      json: JSON.stringify(
        {
          max_citation_seconds: 852,
          playback_seconds: 868,
          validation_formula: "852 <= 868",
          proof_status: "VERIFIED_PERMITTED",
          allow_client_render: true,
        },
        null,
        2
      ),
    },
  };

  return (
    <section id="how-it-works" className="py-24 border-t border-white/[0.08] relative overflow-hidden bg-[#07080D]">
      <div className="container max-w-7xl mx-auto px-4 sm:px-8">
        <SectionHeading
          badge="End-to-End Pipeline"
          title="From student query to"
          gradientTitle="mathematically verified answer"
          subtitle="A seven-stage deterministic pipeline guarantees zero future leakage and 100% auditable evidence attribution."
          align="center"
          className="mb-16"
        />

        {/* Horizontal Scrollable Stages on Mobile, Clean Flow on Desktop */}
        <div className="overflow-x-auto pb-6 mb-8 scrollbar-thin">
          <div className="flex items-center justify-between min-w-[880px] gap-2 px-2">
            {PIPELINE_STAGES.map((stage, idx) => {
              const isSelected = activeStep === idx;
              return (
                <React.Fragment key={stage.step}>
                  <button
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    className={`flex-1 p-3.5 rounded-2xl border text-left transition-all duration-300 relative group cursor-pointer focus:outline-none ${
                      isSelected
                        ? "bg-[#141726] border-prism-cyan/50 shadow-lg shadow-prism-cyan/10 scale-105"
                        : "bg-[#0E1018] border-white/[0.06] hover:border-white/20 hover:bg-white/[0.03]"
                    }`}
                  >
                    {/* Top Step Number */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          isSelected
                            ? "bg-prism-cyan/20 text-prism-cyan border border-prism-cyan/30"
                            : "bg-white/[0.06] text-foreground-subtle"
                        }`}
                      >
                        {stage.step}
                      </span>
                      <div
                        className={`${
                          isSelected ? "text-prism-cyan" : "text-foreground-subtle group-hover:text-white"
                        }`}
                      >
                        {getStepIcon(idx)}
                      </div>
                    </div>

                    <h4
                      className={`text-xs font-bold tracking-tight mb-1 ${
                        isSelected ? "text-white" : "text-foreground group-hover:text-white"
                      }`}
                    >
                      {stage.name}
                    </h4>
                    <p className="text-[10px] font-mono text-foreground-subtle truncate">
                      {stage.type}
                    </p>
                  </button>

                  {idx < PIPELINE_STAGES.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-white/20 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Interactive Step Telemetry Inspector Drawer */}
        <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-[#0E1018] border border-white/[0.08] shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-prism-cyan px-2 py-0.5 rounded bg-prism-cyan/10 border border-prism-cyan/20">
                  STAGE {PIPELINE_STAGES[activeStep].step}
                </span>
                <h3 className="text-base font-bold text-white">
                  {PIPELINE_STAGES[activeStep].name}: {PIPELINE_STAGES[activeStep].type}
                </h3>
              </div>
              <p className="text-xs text-foreground-muted">
                {PIPELINE_STAGES[activeStep].desc}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-mono text-foreground-subtle">Metric:</span>
              <span className="text-xs font-mono font-bold text-white px-2.5 py-1 rounded bg-white/[0.04] border border-white/10">
                {PIPELINE_STAGES[activeStep].metric}
              </span>
            </div>
          </div>

          {/* JSON Inspector View */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-foreground-subtle">
              <span className="flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-prism-violet" />
                Live State Inspection ({STEP_PAYLOADS[activeStep].title})
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 hover:bg-white/10 text-[10px] text-foreground-muted hover:text-white transition-colors flex items-center gap-1"
                aria-label="Copy JSON payload"
              >
                {copied ? (
                  <span className="text-emerald-400 font-bold">✓ Copied!</span>
                ) : (
                  <span>Copy Payload</span>
                )}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#07080D] border border-white/[0.06] text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed shadow-inner">
              {STEP_PAYLOADS[activeStep].json}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};
