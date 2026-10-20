"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Menu, X, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useApiHealth } from "@/lib/hooks/use-api-health";

interface NavAnchor {
  label: string;
  href: string;
}

const LANDING_NAV_LINKS: NavAnchor[] = [
  { label: "Firewall Demo", href: "#firewall-demo" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Comparison", href: "#comparison" },
  { label: "Team", href: "#team" },
];

export const LandingNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const { status: apiStatus } = useApiHealth();

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const statusConfig = {
    online: {
      label: "API Online",
      color: "bg-emerald-400",
    },
    offline: {
      label: "API Offline",
      color: "bg-rose-500",
    },
    checking: {
      label: "Checking API...",
      color: "bg-amber-400",
    },
  };

  const currentStatus = statusConfig[apiStatus];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-white/[0.08] bg-[#07080D]/90 backdrop-blur-2xl shadow-lg shadow-black/40"
          : "border-b border-white/[0.04] bg-[#07080D]/60 backdrop-blur-md"
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-prism-cyan via-prism-violet to-prism-pink p-[1px] shadow-prism-glow transition-transform duration-300 group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#07080D]">
                <Sparkles className="h-4 w-4 text-prism-cyan transition-colors group-hover:text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5 font-sans">
                PRISM
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-white/[0.07] text-prism-cyan border border-white/10">
                  v0.1.0
                </span>
              </span>
              <span className="text-[10px] font-mono text-foreground-subtle tracking-wide hidden sm:inline">
                by The Falcons
              </span>
            </div>
          </Link>

          {/* Desktop Anchor Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {LANDING_NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-foreground-muted hover:text-white hover:bg-white/[0.04] transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Right Actions & Health Pill */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Live API Status Pill */}
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono"
            title="Backend server health on Render (Tokyo/Supabase)"
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                currentStatus.color,
                apiStatus === "online" && "animate-pulse"
              )}
            />
            <span className="text-foreground-muted">{currentStatus.label}</span>
          </div>

          {/* Socratic Defense Mode Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-prism-cyan/20 bg-prism-cyan/5 text-[11px] font-mono text-prism-cyan">
            <ShieldCheck className="h-3 w-3" />
            <span>Temporal Firewall Active</span>
          </div>

          {/* Try the demo button */}
          <Button
            variant="primary"
            size="sm"
            asChild
            className="shadow-prism-glow text-xs font-semibold px-4"
          >
            <a href="#firewall-demo" className="flex items-center gap-1.5">
              <span>Try the demo</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-white/10 bg-white/[0.03] text-[10px] font-mono sm:hidden">
            <span className={cn("h-1.5 w-1.5 rounded-full", currentStatus.color)} />
            <span>API</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-foreground-muted hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/[0.08] bg-[#0E1018]/95 backdrop-blur-2xl px-4 py-4 space-y-2">
          {LANDING_NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-foreground-muted hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              asChild
              className="w-full justify-center shadow-prism-glow"
            >
              <a
                href="#firewall-demo"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2"
              >
                <span>Try the demo</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
