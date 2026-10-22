import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Educator Insights & Confusion Heatmap",
  description: "Cohort-level lecture confusion heatmaps, prevalent misconceptions, and exportable analytics.",
};

export default function EducatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
