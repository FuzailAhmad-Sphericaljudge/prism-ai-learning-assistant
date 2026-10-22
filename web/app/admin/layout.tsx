import { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Observability & Firewall Verification",
  description: "Real-time latency percentiles (p50, p95), validation pass rate, and execution telemetry traces.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
