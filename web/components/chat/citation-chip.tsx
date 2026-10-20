"use client";

import * as React from "react";
import { Video, BookOpen, Layers, FileText, ExternalLink, ShieldCheck } from "lucide-react";
import { CitationItem } from "@/lib/api-types";
import { cn } from "@/lib/utils";

interface CitationChipProps {
  citation: CitationItem;
  onInspect?: (citation: CitationItem) => void;
  className?: string;
}

export const CitationChip: React.FC<CitationChipProps> = ({
  citation,
  onInspect,
  className,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const getSourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "video":
        return <Video className="w-3 h-3 text-cyan-400 shrink-0" />;
      case "ppt":
      case "slide":
        return <Layers className="w-3 h-3 text-amber-400 shrink-0" />;
      case "pdf":
        return <BookOpen className="w-3 h-3 text-rose-400 shrink-0" />;
      case "notes":
      default:
        return <FileText className="w-3 h-3 text-emerald-400 shrink-0" />;
    }
  };

  const getSourceColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "video":
        return "text-cyan-400 border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/40 hover:border-cyan-400";
      case "ppt":
      case "slide":
        return "text-amber-400 border-amber-500/30 bg-amber-950/40 hover:bg-amber-900/40 hover:border-amber-400";
      case "pdf":
        return "text-rose-400 border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/40 hover:border-rose-400";
      case "notes":
      default:
        return "text-emerald-400 border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/40 hover:border-emerald-400";
    }
  };

  return (
    <span
      className="relative inline-block align-baseline mx-0.5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        onClick={() => onInspect?.(citation)}
        className={cn(
          "font-mono text-[11px] font-medium tracking-tight rounded px-1.5 py-0.5 border inline-flex items-center gap-1 transition-all duration-150 cursor-pointer shadow-sm group select-none",
          getSourceColor(citation.source_type),
          className
        )}
        title={`Inspect Evidence [${citation.evidence_id}]`}
      >
        {getSourceIcon(citation.source_type)}
        <span className="font-semibold">[{citation.evidence_id}]</span>
        <span className="opacity-75 text-[10px] hidden sm:inline">{citation.coordinate}</span>
      </button>

      {/* Hover Preview Tooltip */}
      {isHovered && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 p-3 rounded-lg border border-border/80 bg-popover/95 backdrop-blur-md shadow-2xl text-popover-foreground text-xs pointer-events-none animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/40 text-[10px]">
                {citation.evidence_id}
              </span>
              <span className="capitalize font-medium text-foreground text-[11px]">
                {citation.source_type}
              </span>
              <span className="text-muted-foreground text-[11px]">
                • {citation.coordinate}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              <span>Admitted</span>
            </div>
          </div>

          {/* Quote Excerpt */}
          <p className="italic text-muted-foreground line-clamp-3 leading-relaxed mb-2 text-[11px] font-sans">
            &ldquo;{citation.quote}&rdquo;
          </p>

          {/* Action Footer */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 pt-1 border-t border-border/30">
            <span>Temporal Evidence Firewall</span>
            <span className="text-cyan-400 font-medium inline-flex items-center gap-0.5">
              Click to inspect <ExternalLink className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      )}
    </span>
  );
};
