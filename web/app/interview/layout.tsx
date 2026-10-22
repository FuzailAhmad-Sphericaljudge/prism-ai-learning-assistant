import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Oral Defense Interview",
  description: "Rubric-grounded viva-voce mock interviews with justified follow-up questions and audio speech synthesis.",
};

export default function InterviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
