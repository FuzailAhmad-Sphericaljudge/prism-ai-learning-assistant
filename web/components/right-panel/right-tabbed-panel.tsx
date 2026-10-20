"use client";

import * as React from "react";
import { MessageSquare, FolderGit2, ShieldCheck, Sparkles } from "lucide-react";
import { usePlayerStore, RightPanelTab } from "@/lib/stores/use-player-store";
import { ChatTabPanel } from "@/components/chat/chat-tab-panel";
import { ResourcesTabPanel } from "@/components/resources/resources-tab-panel";
import { EvidenceInspectorTabPanel } from "@/components/evidence/evidence-inspector-tab-panel";

export const RightTabbedPanel: React.FC = () => {
  const activeRightTab = usePlayerStore((s) => s.activeRightTab);
  const setRightTab = usePlayerStore((s) => s.setRightTab);

  const tabs: { id: RightPanelTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: "ask", label: "Ask PRISM", icon: MessageSquare, badge: "AI" },
    { id: "resources", label: "Resources", icon: FolderGit2, badge: "3" },
    { id: "evidence", label: "Evidence", icon: ShieldCheck, badge: "Grounded" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Main Tab Navigation */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0B0D14]/90 border border-white/[0.08] rounded-xl mb-3 backdrop-blur-xl">
        <div className="flex items-center gap-1.5 w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeRightTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setRightTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all relative ${
                  isActive
                    ? "bg-white/[0.1] text-white shadow-lg border border-white/[0.12]"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive
                      ? tab.id === "ask"
                        ? "text-prism-cyan"
                        : tab.id === "resources"
                        ? "text-prism-violet"
                        : "text-emerald-400"
                      : "text-slate-400"
                  }`}
                />
                <span>{tab.label}</span>

                {tab.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-gradient-to-r from-prism-cyan/30 to-prism-violet/30 text-white border border-white/[0.2]"
                        : "bg-white/[0.06] text-slate-400"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}

                {isActive && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-prism-cyan via-prism-violet to-prism-pink rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Panel Content */}
      <div className="flex-1 overflow-hidden">
        {activeRightTab === "ask" && <ChatTabPanel />}
        {activeRightTab === "resources" && <ResourcesTabPanel />}
        {activeRightTab === "evidence" && <EvidenceInspectorTabPanel />}
      </div>
    </div>
  );
};
