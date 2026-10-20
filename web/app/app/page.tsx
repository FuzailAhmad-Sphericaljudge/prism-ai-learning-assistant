"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, BookOpen, Clock, ShieldCheck } from "lucide-react";
import { CourseLibraryHeader } from "@/components/app/course-library-header";
import { CourseGrid } from "@/components/app/course-grid";
import { AppShell } from "@/components/app/app-shell";

export default function AppLibraryPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState("All");

  return (
    <AppShell activeNav="learn">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full">
        {/* Course Library Header */}
        <CourseLibraryHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Featured / Quick Resume Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-prism-violet/30 bg-gradient-to-r from-prism-violet/10 via-[#0E1017]/90 to-prism-cyan/10 p-6 sm:p-8 backdrop-blur-xl mb-10 shadow-prism-glow">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-prism-violet/20 border border-prism-violet/30 text-xs font-mono text-prism-violet mb-3">
                <Clock className="h-3.5 w-3.5" />
                <span>Resume Active Session</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                CS 201: Binary Search Trees & Balanced Structures
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Last viewed at <strong>18:42</strong> (Order Statistics & Successor completed; Deletion begins next). Temporal Firewall strictly enforcing zero spoilers.
              </p>
            </div>

            <Link
              href="/learn/00000000-0000-0000-0000-000000000002"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-prism-cyan via-prism-violet to-prism-pink hover:opacity-95 shadow-prism-glow transition-all duration-300 flex-shrink-0"
            >
              <span>Continue at 18:42</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Course Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white tracking-tight">
              All Enrolled Courses
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Real-time Supabase Database Sync
            </span>
          </div>

          <CourseGrid searchQuery={searchQuery} />
        </div>
      </div>
    </AppShell>
  );
}
