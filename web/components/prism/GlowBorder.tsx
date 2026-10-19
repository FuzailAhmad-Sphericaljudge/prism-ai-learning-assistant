import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlowBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  borderRadius?: string;
  animated?: boolean;
  intensity?: "low" | "medium" | "high";
  gradient?: "prism" | "cyan-violet" | "pink-amber";
}

export const GlowBorder: React.FC<GlowBorderProps> = ({
  children,
  borderRadius = "16px",
  animated = false,
  intensity = "medium",
  gradient = "prism",
  className,
  ...props
}) => {
  const gradientMaps = {
    prism: "from-[#22D3EE] via-[#8B5CF6] via-[#F472B6] to-[#FBBF24]",
    "cyan-violet": "from-[#22D3EE] via-[#6366F1] to-[#8B5CF6]",
    "pink-amber": "from-[#F472B6] via-[#EC4899] to-[#FBBF24]",
  };

  const intensityClasses = {
    low: "opacity-40 blur-[8px]",
    medium: "opacity-70 blur-[14px]",
    high: "opacity-100 blur-[20px]",
  };

  return (
    <div className={cn("relative group p-[1px] isolate", className)} {...props}>
      {/* Outer Glow layer */}
      <div
        className={cn(
          "absolute -inset-[1px] bg-gradient-to-r -z-10 rounded-[inherit] transition-opacity duration-500",
          gradientMaps[gradient],
          intensityClasses[intensity],
          animated && "animate-border-glow"
        )}
        style={{ borderRadius }}
      />

      {/* Crisp 1px gradient border layer */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r -z-10 rounded-[inherit]",
          gradientMaps[gradient]
        )}
        style={{ borderRadius }}
      />

      {/* Content wrapper */}
      <div
        className="w-full h-full bg-[#0E1018] rounded-[inherit] overflow-hidden"
        style={{ borderRadius: `calc(${borderRadius} - 1px)` }}
      >
        {children}
      </div>
    </div>
  );
};
