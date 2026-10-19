import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-prism-violet/50 select-none",
  {
    variants: {
      variant: {
        default:
          "border border-white/10 bg-white/[0.05] text-foreground hover:bg-white/10",
        outline:
          "border border-white/20 text-foreground-muted hover:border-white/30",
        cyan: "border border-prism-cyan/30 bg-prism-cyan/10 text-prism-cyan",
        violet:
          "border border-prism-violet/30 bg-prism-violet/10 text-prism-violet",
        pink: "border border-prism-pink/30 bg-prism-pink/10 text-prism-pink",
        amber: "border border-prism-amber/30 bg-prism-amber/10 text-prism-amber",
        success:
          "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        destructive:
          "border border-rose-500/30 bg-rose-500/10 text-rose-400",
        prism:
          "border border-white/20 bg-gradient-to-r from-prism-cyan/20 via-prism-violet/20 to-prism-pink/20 text-white shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  const dotColors: Record<string, string> = {
    default: "bg-white/60",
    outline: "bg-white/40",
    cyan: "bg-prism-cyan",
    violet: "bg-prism-violet",
    pink: "bg-prism-pink",
    amber: "bg-prism-amber",
    success: "bg-emerald-400 animate-pulse",
    destructive: "bg-rose-400",
    prism: "bg-gradient-to-r from-prism-cyan to-prism-pink",
  };

  const selectedDotColor = dotColors[variant || "default"] || "bg-white/60";

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", selectedDotColor)} />}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
