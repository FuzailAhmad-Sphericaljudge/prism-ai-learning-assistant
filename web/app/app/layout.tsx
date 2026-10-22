import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Course Library",
  description: "Browse courses, progress rings, and continue timestamp-aware learning sessions.",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
