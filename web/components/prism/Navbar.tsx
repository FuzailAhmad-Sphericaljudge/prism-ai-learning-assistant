"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Activity, Github, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface NavbarProps {
  apiStatus?: "online" | "offline" | "checking";
}

export const Navbar: React.FC<NavbarProps> = ({ apiStatus = "online" }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const statusConfig = {
    online: {
      label: "API Online",
      variant: "success" as const,
      color: "bg-emerald-400",
    },
    offline: {
      label: "API Offline",
      variant: "destructive" as const,
      color: "bg-rose-500",
    },
    checking: {
      label: "Checking...",
      variant: "amber" as const,
      color: "bg-amber-400",
    },
  };

  const currentStatus = statusConfig[apiStatus];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#07080D]/85 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-prism-cyan via-prism-violet to-prism-pink p-[1px] shadow-prism-glow transition-transform duration-300 group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#07080D]">
                <Sparkles className="h-4 w-4 text-prism-cyan transition-colors group-hover:text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                PRISM
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-white/[0.07] text-prism-cyan border border-white/10">
                  v{SITE_CONFIG.version}
                </span>
              </span>
              <span className="text-[10px] font-mono text-foreground-subtle tracking-wide hidden sm:inline">
                by The Falcons
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {SITE_CONFIG.navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                    isActive
                      ? "text-white bg-white/10 font-semibold shadow-sm"
                      : "text-foreground-muted hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side status and actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* API Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono">
            <span className={cn("h-2 w-2 rounded-full", currentStatus.color, apiStatus === "online" && "animate-pulse")} />
            <span className="text-foreground-muted">{currentStatus.label}</span>
          </div>

          {/* Demo Mode Badge */}
          <Badge variant="prism" className="text-[11px] py-0.5">
            MOCK DEMO
          </Badge>

          {/* GitHub Link */}
          <Button
            variant="glass"
            size="icon-sm"
            asChild
            className="text-foreground-muted hover:text-white"
          >
            <a
              href="https://github.com/FuzailAhmad-Sphericaljudge/Prism"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.03] text-[10px] font-mono">
            <span className={cn("h-1.5 w-1.5 rounded-full", currentStatus.color)} />
            <span>API</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-foreground-muted hover:text-white focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-[#0E1018]/95 backdrop-blur-2xl px-4 py-4 space-y-2">
          {SITE_CONFIG.navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/10 text-white font-semibold"
                    : "text-foreground-muted hover:text-white hover:bg-white/[0.04]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
