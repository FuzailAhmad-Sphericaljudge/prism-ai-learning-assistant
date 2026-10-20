"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Target,
  BarChart3,
  Mic,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  activeColor: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "learn",
    label: "Learn",
    href: "/app",
    icon: BookOpen,
    activeColor: "text-prism-cyan bg-prism-cyan/10 border-prism-cyan/30",
  },
  {
    id: "practice",
    label: "Practice",
    href: "/practice",
    icon: Target,
    badge: "Drills",
    activeColor: "text-prism-violet bg-prism-violet/10 border-prism-violet/30",
  },
  {
    id: "mastery",
    label: "Mastery",
    href: "/mastery",
    icon: BarChart3,
    badge: "92%",
    activeColor: "text-prism-pink bg-prism-pink/10 border-prism-pink/30",
  },
  {
    id: "interview",
    label: "Interview",
    href: "/interview",
    icon: Mic,
    badge: "Oral",
    activeColor: "text-prism-amber bg-prism-amber/10 border-prism-amber/30",
  },
  {
    id: "educator",
    label: "Educator",
    href: "/educator",
    icon: GraduationCap,
    badge: "Admin",
    activeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
];

interface AppSidebarProps {
  activeId?: string;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ activeId = "learn" }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-white/[0.08] bg-[#07080D]/95 backdrop-blur-xl transition-all duration-300 z-30 flex-shrink-0 select-none",
        isCollapsed ? "w-18" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/[0.08]">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden group">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-prism-cyan via-prism-violet to-prism-pink p-[1px] shadow-prism-glow transition-transform duration-300 group-hover:scale-105 flex-shrink-0">
            <div className="h-full w-full rounded-[7px] bg-[#07080D] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-prism-cyan" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-white">
                PRISM
              </span>
              <span className="text-[10px] font-mono text-slate-400 leading-none">
                Evidence Engine
              </span>
            </div>
          )}
        </Link>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-7 w-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeId === item.id ||
            pathname === item.href ||
            (item.id === "learn" && (pathname?.startsWith("/learn") || pathname === "/app"));

          const navButton = (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border",
                isActive
                  ? item.activeColor
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04] border-transparent",
                isCollapsed && "justify-center px-0 h-10 w-10 mx-auto"
              )}
            >
              <Icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-current" : "text-slate-400")} />

              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.08] text-slate-300 border border-white/[0.06]">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                <TooltipContent side="right" className="font-sans text-xs bg-[#131622] border-white/10 text-white">
                  {item.label} {item.badge && `(${item.badge})`}
                </TooltipContent>
              </Tooltip>
            );
          }

          return navButton;
        })}
      </nav>

      {/* Footer Info / Firewall Protected Status */}
      <div className="p-3 border-t border-white/[0.08] space-y-2">
        {!isCollapsed ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3 text-left">
            <div className="flex items-center gap-1.5 mb-1 text-emerald-400 font-mono text-[11px] font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Firewall Engine Active</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              PostgreSQL 17.11 & pgvector hybrid verification online.
            </p>
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="h-10 w-10 mx-auto rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 flex items-center justify-center text-emerald-400 cursor-pointer">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-sans text-xs bg-[#131622] border-white/10 text-emerald-400">
              Firewall Engine Active
            </TooltipContent>
          </Tooltip>
        )}

        {/* User Identity Pill */}
        <div className={cn("flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.04] border border-white/[0.06]", isCollapsed && "justify-center p-2")}>
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-prism-cyan to-prism-violet flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            AM
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-white truncate">Alex Mercer</span>
              <span className="text-[10px] text-slate-400 font-mono truncate">demo-learner@prism.edu</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
