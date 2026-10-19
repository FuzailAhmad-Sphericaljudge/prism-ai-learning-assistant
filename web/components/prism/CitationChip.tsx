"use client";

import * as React from "react";
import { Play, Presentation, FileText, Bookmark, ExternalLink } from "lucide-react";
import { cn, formatTimestamp } from "@/lib/utils";

export type EvidenceType = "timestamp" | "slide" | "page" | "note";

export interface CitationChipProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  type: EvidenceType;
  value: string | number;
  label?: string;
  excerpt?: string;
  active?: boolean;
  onSeek?: (value: string | number) => void;
}

export const CitationChip: React.FC<CitationChipProps> = ({
  type,
  value,
  label,
  excerpt,
  active = false,
  onSeek,
  className,
  ...props
}) => {
  const getIcon = () => {
    switch (type) {
      case "timestamp":
        return <Play className="h-3 w-3 fill-current text-prism-cyan" />;
      case "slide":
        return <Presentation className="h-3 w-3 text-prism-violet" />;
      case "page":
        return <FileText className="h-3 w-3 text-prism-pink" />;
      case "note":
        return <Bookmark className="h-3 w-3 text-prism-amber" />;
    }
  };

  const getDisplayLabel = () => {
    if (label) return label;
    if (type === "timestamp") {
      return typeof value === "number" ? formatTimestamp(value) : String(value);
    }
    if (type === "slide") return `Slide ${value}`;
    if (type === "page") return `p. ${value}`;
    return String(value);
  };

  const getTypeStyles = () => {
    switch (type) {
      case "timestamp":
        return "border-prism-cyan/30 bg-prism-cyan/10 text-prism-cyan hover:bg-prism-cyan/20 hover:border-prism-cyan/60 hover:shadow-prism-cyan";
      case "slide":
        return "border-prism-violet/30 bg-prism-violet/10 text-prism-violet hover:bg-prism-violet/20 hover:border-prism-violet/60 hover:shadow-prism-violet";
      case "page":
        return "border-prism-pink/30 bg-prism-pink/10 text-prism-pink hover:bg-prism-pink/20 hover:border-prism-pink/60 hover:shadow-prism-pink";
      case "note":
        return "border-prism-amber/30 bg-prism-amber/10 text-prism-amber hover:bg-prism-amber/20 hover:border-prism-amber/60 hover:shadow-prism-amber";
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onSeek) {
      e.preventDefault();
      onSeek(value);
    }
    props.onClick?.(e);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={excerpt || `Jump to ${getDisplayLabel()}`}
      className={cn(
        "group inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-xs font-mono font-medium transition-all duration-200 select-none cursor-pointer backdrop-blur-sm",
        getTypeStyles(),
        active && "ring-1 ring-white/40 border-white/60 shadow-glass scale-105",
        className
      )}
      {...props}
    >
      <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">
        {getIcon()}
      </span>
      <span className="tracking-tight">{getDisplayLabel()}</span>
      <ExternalLink className="h-2.5 w-2.5 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-60 group-hover:translate-x-0" />
    </button>
  );
};
