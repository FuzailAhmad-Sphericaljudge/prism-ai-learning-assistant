import type { Metadata } from "next";
import { fontInter, fontMono } from "@/lib/fonts";
import "@/app/globals.css";
import { Navbar } from "@/components/prism/Navbar";
import { Footer } from "@/components/prism/Footer";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://web-one-blue-mbb8ovavhb.vercel.app"
  ),
  title: {
    default: "PRISM — Learn in context. Prove understanding.",
    template: "%s | PRISM AI Learning Assistant",
  },
  description:
    "The first timestamp-aware AI learning assistant featuring the Temporal Evidence Firewall, multi-modal evidence inspection, misconception diagnostics, and adaptive oral mock interviews.",
  keywords: [
    "PRISM",
    "Temporal Evidence Firewall",
    "AI Learning Assistant",
    "Timestamp Aware AI",
    "Educational AI",
    "Socratic Assistant",
    "Evidence Inspector",
    "The Falcons",
    "Fuzail Ahmad",
    "Lakshya Garg",
  ],
  authors: [
    { name: "Fuzail Ahmad", url: "https://github.com/FuzailAhmad-Sphericaljudge" },
    { name: "Lakshya Garg" },
    { name: "Team The Falcons" },
  ],
  creator: "Team The Falcons",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://web-one-blue-mbb8ovavhb.vercel.app",
    title: "PRISM — Learn in context. Prove understanding.",
    description:
      "The first timestamp-aware AI learning assistant with a mathematical Temporal Evidence Firewall that guarantees zero lecture spoilers.",
    siteName: "PRISM",
  },
  twitter: {
    card: "summary_large_image",
    title: "PRISM — Learn in context. Prove understanding.",
    description:
      "Timestamp-aware AI learning assistant with Temporal Evidence Firewall, Evidence Inspector, and Socratic oral defense.",
    creator: "@TheFalcons",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${fontInter.variable} ${fontMono.variable} min-h-screen bg-[#07080D] text-[#F1F5F9] font-sans antialiased flex flex-col selection:bg-prism-violet/30 selection:text-white bg-noise`}
      >
        <TooltipProvider delayDuration={200}>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
