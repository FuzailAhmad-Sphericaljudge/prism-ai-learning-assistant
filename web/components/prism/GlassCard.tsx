import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive" | "accent";
  glowColor?: "cyan" | "violet" | "pink" | "amber" | "prism" | "none";
  hoverEffect?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      variant = "default",
      glowColor = "none",
      hoverEffect = false,
      children,
      ...props
    },
    ref
  ) => {
    const glowClasses = {
      none: "",
      cyan: "hover:shadow-prism-cyan hover:border-prism-cyan/30",
      violet: "hover:shadow-prism-violet hover:border-prism-violet/30",
      pink: "hover:shadow-prism-pink hover:border-prism-pink/30",
      amber: "hover:shadow-prism-amber hover:border-prism-amber/30",
      prism: "hover:shadow-prism-glow hover:border-white/20",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-xl border border-white/[0.08] bg-[#0E1018]/80 backdrop-blur-md p-6 text-foreground transition-all duration-300",
          variant === "elevated" &&
            "bg-[#161926]/90 border-white/[0.12] shadow-2xl shadow-black/40",
          variant === "accent" &&
            "before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-prism-cyan before:via-prism-violet before:to-prism-pink before:rounded-t-xl",
          hoverEffect &&
            "hover:-translate-y-1 hover:bg-[#0E1018]/95 hover:border-white/[0.16] cursor-pointer",
          glowClasses[glowColor],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export const GlassCardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex flex-col space-y-1.5 pb-4 border-b border-white/[0.06] mb-4", className)}
    {...props}
  />
);

export const GlassCardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h3
    className={cn("text-lg font-semibold tracking-tight text-foreground", className)}
    {...props}
  />
);

export const GlassCardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => (
  <p
    className={cn("text-sm text-foreground-muted", className)}
    {...props}
  />
);

export const GlassCardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn("pt-0", className)} {...props} />;

export const GlassCardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex items-center pt-4 mt-4 border-t border-white/[0.06]", className)}
    {...props}
  />
);
