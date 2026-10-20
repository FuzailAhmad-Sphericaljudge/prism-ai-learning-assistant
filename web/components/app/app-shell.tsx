"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopBar } from "@/components/app/app-topbar";

interface AppShellProps {
  children: React.ReactNode;
  activeNav?: string;
  courseTitle?: string;
  courseCode?: string;
  lectureTitle?: string;
  fullHeight?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeNav = "learn",
  courseTitle,
  courseCode,
  lectureTitle,
  fullHeight = false,
}) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07080D] text-slate-100">
      {/* Collapsible Left Navigation Sidebar */}
      <AppSidebar activeId={activeNav} />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <AppTopBar
          courseTitle={courseTitle}
          courseCode={courseCode}
          lectureTitle={lectureTitle}
        />

        {/* Dynamic Viewport Area */}
        <main className={`flex-1 min-w-0 ${fullHeight ? "overflow-hidden flex flex-col" : "overflow-y-auto"}`}>
          {children}
        </main>
      </div>
    </div>
  );
};
