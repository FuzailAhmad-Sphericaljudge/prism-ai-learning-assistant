import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mastery Evidence Dashboard",
  description: "Evidence-derived mastery breakdown across course concepts, attempt history, and next best actions.",
};

export default function MasteryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
