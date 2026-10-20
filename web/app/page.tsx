import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemStrip } from "@/components/landing/ProblemStrip";
import { FirewallDemo } from "@/components/landing/FirewallDemo";
import { FeaturesBento } from "@/components/landing/FeaturesBento";
import { HowItWorksPipeline } from "@/components/landing/HowItWorksPipeline";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { TechStackMarquee } from "@/components/landing/TechStackMarquee";
import { ImpactStats } from "@/components/landing/ImpactStats";
import { FinalCta } from "@/components/landing/FinalCta";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-[#07080D]">
      {/* 1. Hero Section with Refraction Visual and Floating Product Mock */}
      <HeroSection />

      {/* 2. Problem Strip: 4 Educational Pain Points */}
      <ProblemStrip />

      {/* 3. Interactive Temporal Evidence Firewall Demo (0:00-30:00 scrubber & 18:42 boundary case) */}
      <FirewallDemo />

      {/* 4. Bento Grid of 6 Core Pedagogical Pillars */}
      <FeaturesBento />

      {/* 5. How It Works: 7-Stage Horizontal Pipeline */}
      <HowItWorksPipeline />

      {/* 6. Comparison Table: Generic LLM Chatbots vs PRISM */}
      <ComparisonTable />

      {/* 7. Tech Stack Infinite Marquee */}
      <TechStackMarquee />

      {/* 8. High-Impact Pedagogical & Architectural Stats */}
      <ImpactStats />

      {/* 9. Final Radiant Glow CTA */}
      <FinalCta />
    </div>
  );
}
