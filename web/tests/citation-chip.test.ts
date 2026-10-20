import { test } from "node:test";
import assert from "node:assert/strict";

interface CitationItem {
  evidence_id: string;
  chunk_id: string;
  source_type: string;
  coordinate: string;
  quote: string;
  start_sec?: number | null;
  end_sec?: number | null;
  slide?: number | null;
  page?: number | null;
}

function formatCitationBadge(cit: CitationItem) {
  const badgeLabel = `[${cit.evidence_id.toUpperCase()}]`;
  let displayCoord = cit.coordinate;

  if (cit.source_type === "video" && cit.start_sec !== undefined && cit.start_sec !== null) {
    const mins = Math.floor(cit.start_sec / 60);
    const secs = Math.floor(cit.start_sec % 60);
    displayCoord = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  } else if (cit.source_type === "ppt" && cit.slide) {
    displayCoord = `Slide ${cit.slide}`;
  } else if (cit.source_type === "pdf" && cit.page) {
    displayCoord = `Page ${cit.page}`;
  }

  return {
    badgeLabel,
    displayCoord,
    sourceType: cit.source_type.toLowerCase(),
    tooltipSnippet: cit.quote.length > 80 ? cit.quote.slice(0, 77) + "..." : cit.quote,
  };
}

test("CitationItem formats video coordinate and badge correctly", () => {
  const cit: CitationItem = {
    evidence_id: "E1",
    chunk_id: "chk-1",
    source_type: "video",
    coordinate: "05:15",
    quote: "All keys in the left subtree must be less than the root key.",
    start_sec: 315,
    end_sec: 360,
  };

  const formatted = formatCitationBadge(cit);
  assert.equal(formatted.badgeLabel, "[E1]");
  assert.equal(formatted.displayCoord, "05:15");
  assert.equal(formatted.sourceType, "video");
  assert.equal(formatted.tooltipSnippet, "All keys in the left subtree must be less than the root key.");
});

test("CitationItem formats slide and pdf coordinates correctly", () => {
  const slideCit: CitationItem = {
    evidence_id: "E2",
    chunk_id: "chk-2",
    source_type: "ppt",
    coordinate: "Slide 4",
    quote: "Subtree Ordering Invariant definition",
    slide: 4,
  };
  const slideFormatted = formatCitationBadge(slideCit);
  assert.equal(slideFormatted.badgeLabel, "[E2]");
  assert.equal(slideFormatted.displayCoord, "Slide 4");

  const pdfCit: CitationItem = {
    evidence_id: "E3",
    chunk_id: "chk-3",
    source_type: "pdf",
    coordinate: "p. 2",
    quote: "A long quote that definitely exceeds seventy-seven characters in total length for truncation testing purposes",
    page: 2,
  };
  const pdfFormatted = formatCitationBadge(pdfCit);
  assert.equal(pdfFormatted.badgeLabel, "[E3]");
  assert.equal(pdfFormatted.displayCoord, "Page 2");
  assert.ok(pdfFormatted.tooltipSnippet.endsWith("..."));
});
