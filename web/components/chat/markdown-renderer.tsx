"use client";

import * as React from "react";
import { CitationItem } from "@/lib/api-types";
import { CitationChip } from "./citation-chip";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  citations?: CitationItem[];
  onInspectCitation?: (citation: CitationItem) => void;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  citations = [],
  onInspectCitation,
  className,
}) => {
  // Build lookup map for citations
  const citationMap = React.useMemo(() => {
    const map = new Map<string, CitationItem>();
    citations.forEach((c) => {
      map.set(c.evidence_id.toUpperCase(), c);
      map.set(c.evidence_id.toLowerCase(), c);
    });
    return map;
  }, [citations]);

  // Splits inline text by citation patterns like [E1] or [E2]
  const renderInlineWithCitations = (text: string) => {
    // Regex for [E1], [E2], etc.
    const parts = text.split(/(\[E\d+\])/gi);

    return parts.map((part, idx) => {
      const match = part.match(/\[(E\d+)\]/i);
      if (match) {
        const evidenceId = match[1].toUpperCase();
        const cit = citationMap.get(evidenceId);

        if (cit) {
          return (
            <CitationChip
              key={`cit-${evidenceId}-${idx}`}
              citation={cit}
              onInspect={onInspectCitation}
            />
          );
        }

        // Fallback badge if citation metadata is still loading
        return (
          <span
            key={`cit-fallback-${evidenceId}-${idx}`}
            className="font-mono text-[11px] font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 rounded px-1.5 py-0.5 mx-0.5"
          >
            [{evidenceId}]
          </span>
        );
      }

      // Handle simple bold formatting within inline text
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      if (boldParts.length > 1) {
        return (
          <React.Fragment key={`inline-${idx}`}>
            {boldParts.map((bPart, bIdx) => {
              if (bPart.startsWith("**") && bPart.endsWith("**")) {
                return (
                  <strong key={`b-${bIdx}`} className="font-semibold text-foreground">
                    {bPart.slice(2, -2)}
                  </strong>
                );
              }
              // Code formatting `code`
              const codeParts = bPart.split(/(`[^`]+`)/g);
              if (codeParts.length > 1) {
                return codeParts.map((cPart, cIdx) => {
                  if (cPart.startsWith("`") && cPart.endsWith("`")) {
                    return (
                      <code
                        key={`code-${cIdx}`}
                        className="font-mono text-xs bg-muted/80 text-cyan-300 px-1 py-0.5 rounded border border-border"
                      >
                        {cPart.slice(1, -1)}
                      </code>
                    );
                  }
                  return cPart;
                });
              }
              return bPart;
            })}
          </React.Fragment>
        );
      }

      // Inline code fallback
      const codeParts = part.split(/(`[^`]+`)/g);
      if (codeParts.length > 1) {
        return (
          <React.Fragment key={`inline-code-${idx}`}>
            {codeParts.map((cPart, cIdx) => {
              if (cPart.startsWith("`") && cPart.endsWith("`")) {
                return (
                  <code
                    key={`code-${cIdx}`}
                    className="font-mono text-xs bg-muted/80 text-cyan-300 px-1 py-0.5 rounded border border-border"
                  >
                    {cPart.slice(1, -1)}
                  </code>
                );
              }
              return cPart;
            })}
          </React.Fragment>
        );
      }

      return part;
    });
  };

  // Split lines and parse blocks (paragraphs, bullets, headers)
  const lines = content.split("\n");

  return (
    <div className={cn("space-y-2 text-sm leading-relaxed text-foreground/90", className)}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={`empty-${lineIdx}`} className="h-1" />;
        }

        // Bullet lists
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={`bullet-${lineIdx}`} className="flex items-start gap-2 pl-2">
              <span className="text-cyan-400 mt-1 select-none">•</span>
              <div className="flex-1">{renderInlineWithCitations(trimmed.slice(2))}</div>
            </div>
          );
        }

        // Numbered lists
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={`num-${lineIdx}`} className="flex items-start gap-2 pl-2">
              <span className="font-mono text-xs text-muted-foreground mt-0.5 select-none">
                {numMatch[1]}.
              </span>
              <div className="flex-1">{renderInlineWithCitations(numMatch[2])}</div>
            </div>
          );
        }

        // Headers
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={`h4-${lineIdx}`} className="font-semibold text-foreground text-sm pt-2">
              {renderInlineWithCitations(trimmed.slice(4))}
            </h4>
          );
        }

        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={`h3-${lineIdx}`} className="font-bold text-foreground text-base pt-2">
              {renderInlineWithCitations(trimmed.slice(3))}
            </h3>
          );
        }

        // Standard paragraph
        return (
          <p key={`p-${lineIdx}`} className="leading-relaxed">
            {renderInlineWithCitations(line)}
          </p>
        );
      })}
    </div>
  );
};
