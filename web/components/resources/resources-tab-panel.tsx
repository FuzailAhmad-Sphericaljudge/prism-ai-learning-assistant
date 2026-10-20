"use client";

import * as React from "react";
import { Presentation, FileText, BookOpen } from "lucide-react";
import { usePlayerStore, ResourcesSubTab } from "@/lib/stores/use-player-store";
import { SlideViewer } from "@/components/resources/slide-viewer";
import { PdfViewer } from "@/components/resources/pdf-viewer";
import { NotesViewer } from "@/components/resources/notes-viewer";

export const ResourcesTabPanel: React.FC = () => {
  const resourcesSubTab = usePlayerStore((s) => s.resourcesSubTab);
  const setResourcesSubTab = usePlayerStore((s) => s.setResourcesSubTab);
  const activeSlide = usePlayerStore((s) => s.activeSlide);
  const activePdfPage = usePlayerStore((s) => s.activePdfPage);

  const tabs: { id: ResourcesSubTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: "slides", label: "Slides", icon: Presentation, badge: `Slide ${activeSlide}/10` },
    { id: "pdf", label: "Handout (PDF)", icon: FileText, badge: `P.${activePdfPage}/3` },
    { id: "notes", label: "Notes", icon: BookOpen, badge: "6 Secs" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0E1017]/90 rounded-2xl border border-white/[0.08] backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Sub-tab Navigation Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#07080D]/80 border-b border-white/[0.08]">
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.06]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = resourcesSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setResourcesSubTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white/[0.1] text-white shadow-sm border border-white/[0.1]"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-prism-cyan" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      isActive
                        ? "bg-prism-cyan/20 text-prism-cyan border border-prism-cyan/30"
                        : "bg-white/[0.05] text-slate-500"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400">
          <span>Multi-modal Source Sync</span>
        </div>
      </div>

      {/* Sub-tab Content Area */}
      <div className="flex-1 p-3 overflow-hidden">
        {resourcesSubTab === "slides" && <SlideViewer />}
        {resourcesSubTab === "pdf" && <PdfViewer />}
        {resourcesSubTab === "notes" && <NotesViewer />}
      </div>
    </div>
  );
};
