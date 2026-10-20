"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Layers, Video, FileText, UserCheck, ShieldCheck } from "lucide-react";
import { Course } from "@/lib/api-types";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Badge } from "@/components/ui/badge";

interface CourseCardProps {
  course: Course;
  progress?: number;
  lastStudied?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  progress = 68,
  lastStudied = "Yesterday at 18:42",
}) => {
  return (
    <div className="group relative rounded-2xl border border-white/[0.08] bg-[#0E1017]/80 p-6 backdrop-blur-xl transition-all duration-300 hover:border-prism-violet/40 hover:bg-[#131622]/90 hover:shadow-prism-glow flex flex-col justify-between">
      {/* Ambient background hover glow */}
      <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-prism-violet/10 blur-3xl pointer-events-none group-hover:bg-prism-violet/20 transition-all duration-500" />

      <div>
        {/* Top Header: Code, Term & Progress */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-white/[0.06] text-prism-cyan border border-prism-cyan/20">
              {course.code}
            </span>
            <Badge variant="outline" className="border-white/10 text-slate-400 text-[11px]">
              {course.term || "Fall 2026"}
            </Badge>
          </div>

          <ProgressRing progress={progress} size={50} strokeWidth={3.5} />
        </div>

        {/* Course Title */}
        <h3 className="text-lg font-semibold text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-slate-200 group-hover:to-prism-cyan transition-all duration-300 line-clamp-2 mb-2">
          {course.title}
        </h3>

        {/* Course Description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {course.description || "Foundational principles of trees, dynamic ordered sets, and invariant verification."}
        </p>

        {/* Instructor */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-5">
          <UserCheck className="h-3.5 w-3.5 text-prism-violet" />
          <span>{course.instructor}</span>
        </div>

        {/* Modality Chips */}
        <div className="flex flex-wrap items-center gap-2 mb-6 pt-4 border-t border-white/[0.06]">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.06]">
            <Video className="h-3 w-3 text-prism-cyan" />
            <span>Lecture Video</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.06]">
            <Layers className="h-3 w-3 text-prism-violet" />
            <span>Slides Deck</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.06]">
            <BookOpen className="h-3 w-3 text-prism-pink" />
            <span>PDF Reading</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.06]">
            <FileText className="h-3 w-3 text-prism-amber" />
            <span>Notes</span>
          </span>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] mt-auto">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Firewall Protected</span>
        </div>

        <Link
          href={`/learn/${course.id}`}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-white/[0.08] hover:bg-gradient-to-r hover:from-prism-cyan/80 hover:via-prism-violet/80 hover:to-prism-pink/80 border border-white/10 hover:border-transparent transition-all duration-300 shadow-sm"
        >
          <span>Continue learning</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
};
