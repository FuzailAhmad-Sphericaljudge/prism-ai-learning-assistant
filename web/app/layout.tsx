import type { Metadata } from "next";
import { fontInter, fontMono } from "@/lib/fonts";
import "@/app/globals.css";
import { Navbar } from "@/components/prism/Navbar";
import { Footer } from "@/components/prism/Footer";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
  description: SITE_CONFIG.description,
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
