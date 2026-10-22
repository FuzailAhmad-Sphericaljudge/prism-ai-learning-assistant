import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practice & Diagnostics",
  description: "Targeted MCQ and short-answer diagnostic assessments with misconception identification and revision links.",
};

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
