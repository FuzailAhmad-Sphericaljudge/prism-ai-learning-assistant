"use client";

import * as React from "react";
import { PlayCircle, FileText, MessageSquare, ShieldCheck } from "lucide-react";

export type LearnMobileView = "player" | "transcript" | "chat" | "resources";

interface LearnMobileTabsProps {
  activeView: LearnMobileView;
  onViewChange: (view: LearnMobileView) => void;
  unreadCount?: number;
}

export const LearnMobileTabs: React.FC<LearnMobileTabsProps> = ({
  activeView,
  onViewChange,
  unreadCount = 0,
}) => {
  const tabs: { id: LearnMobileView; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { id: "player", label: "Lecture", icon: PlayCircle },
    { id: "transcript", label: "Transcript", icon: FileText },
    { id: "chat", label: "Ask PRISM", icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : undefined },
    { id: "resources", label: "Evidence & Docs", icon: ShieldCheck },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07080D]/95 border-t border-white/[0.08] backdrop-blur-2xl px-2 py-2">
      <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
                isActive
                  ? "text-white bg-white/[0.1] font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? "text-prism-cyan" : "text-slate-400"}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-prism-pink text-[9px] font-mono font-bold text-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-prism-cyan to-prism-violet rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
