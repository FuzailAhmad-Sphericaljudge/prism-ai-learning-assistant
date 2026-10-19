import * as React from "react";
import { cn } from "@/lib/utils";

export interface GradientTextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?: "prism" | "cyan-violet" | "violet-pink" | "subtle" | "amber-pink";
  animate?: boolean;
  as?: "span" | "h1" | "h2" | "h3" | "h4" | "p" | "div";
}

const variantGradients: Record<NonNullable<GradientTextProps["variant"]>, string> = {
  prism:
    "bg-gradient-to-r from-[#22D3EE] via-[#8B5CF6] via-[#F472B6] to-[#FBBF24]",
  "cyan-violet": "bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6]",
  "violet-pink": "bg-gradient-to-r from-[#8B5CF6] to-[#F472B6]",
  "amber-pink": "bg-gradient-to-r from-[#FBBF24] to-[#F472B6]",
  subtle: "bg-gradient-to-r from-[#93C5FD] via-[#C4B5FD] to-[#F9A8D4]",
};

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className,
  variant = "prism",
  animate = false,
  as: Component = "span",
  ...props
}) => {
  return (
    <Component
      className={cn(
        "bg-clip-text text-transparent font-semibold tracking-tight inline-block",
        variantGradients[variant],
        animate && "animate-gradient-shift bg-[length:200%_auto]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
