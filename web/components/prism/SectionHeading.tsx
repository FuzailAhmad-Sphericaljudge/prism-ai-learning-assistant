import * as React from "react";
import { cn } from "@/lib/utils";
import { GradientText } from "./GradientText";

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  badge?: string;
  title: string;
  gradientTitle?: string;
  subtitle?: string;
  align?: "left" | "center";
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  badge,
  title,
  gradientTitle,
  subtitle,
  align = "left",
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
      {...props}
    >
      {badge && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono uppercase tracking-wider text-prism-cyan backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-prism-cyan animate-pulse" />
          {badge}
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
        {title}{" "}
        {gradientTitle && (
          <GradientText variant="prism" animate>
            {gradientTitle}
          </GradientText>
        )}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-foreground-muted max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
