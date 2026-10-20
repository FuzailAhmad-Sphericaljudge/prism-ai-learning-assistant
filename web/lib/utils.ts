import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines conditional class names with clsx and merges Tailwind CSS conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats seconds into MM:SS or HH:MM:SS format for lecture timestamps.
 */
export function formatTimestamp(seconds: number): string {
  const rounded = Math.floor(seconds);
  const hrs = Math.floor(rounded / 3600);
  const mins = Math.floor((rounded % 3600) / 60);
  const secs = rounded % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export const formatTime = formatTimestamp;

/**
 * Formats a citation source string into readable badge text.
 */
export function formatCitationLabel(
  type: "timestamp" | "slide" | "page" | "note",
  value: string | number
): string {
  switch (type) {
    case "timestamp":
      return typeof value === "number" ? formatTimestamp(value) : String(value);
    case "slide":
      return `Slide ${value}`;
    case "page":
      return `Page ${value}`;
    case "note":
      return `Note ${value}`;
    default:
      return String(value);
  }
}

