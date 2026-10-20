"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, RefreshCw, BookOpen } from "lucide-react";
import { fetchCourses } from "@/lib/api";
import { CourseCard } from "@/components/app/course-card";
import { Button } from "@/components/ui/button";

export const CourseGrid: React.FC<{ searchQuery?: string }> = ({ searchQuery = "" }) => {
  const { data: courses, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  });

  const filteredCourses = React.useMemo(() => {
    if (!courses) return [];
    if (!searchQuery.trim()) return courses;
    const q = searchQuery.toLowerCase().trim();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.instructor && c.instructor.toLowerCase().includes(q))
    );
  }, [courses, searchQuery]);

  // Loading Skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-white/[0.08] bg-[#0E1017]/60 p-6 backdrop-blur-xl animate-pulse flex flex-col justify-between h-[360px]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-20 bg-white/[0.08] rounded-md" />
                <div className="h-12 w-12 rounded-full bg-white/[0.08]" />
              </div>
              <div className="h-6 w-3/4 bg-white/[0.08] rounded-md mb-2" />
              <div className="h-4 w-full bg-white/[0.06] rounded-md mb-2" />
              <div className="h-4 w-2/3 bg-white/[0.06] rounded-md mb-6" />
              <div className="h-4 w-1/3 bg-white/[0.06] rounded-md mb-6" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-white/[0.06] rounded-md" />
                <div className="h-6 w-16 bg-white/[0.06] rounded-md" />
                <div className="h-6 w-16 bg-white/[0.06] rounded-md" />
              </div>
            </div>
            <div className="pt-4 border-t border-white/[0.06] flex justify-between items-center">
              <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
              <div className="h-8 w-32 bg-white/[0.08] rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] p-8 text-center max-w-lg mx-auto my-12 backdrop-blur-xl">
        <AlertCircle className="h-10 w-10 text-rose-400 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-white mb-2">Unable to load courses</h4>
        <p className="text-xs text-rose-300/80 mb-5 leading-relaxed">
          {error instanceof Error ? error.message : "Failed to connect to PRISM database."}
        </p>
        <Button
          onClick={() => refetch()}
          size="sm"
          className="bg-white/10 hover:bg-white/20 text-white gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Connection</span>
        </Button>
      </div>
    );
  }

  // Empty State
  if (filteredCourses.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-[#0E1017]/40 p-12 text-center max-w-md mx-auto my-12 backdrop-blur-xl">
        <BookOpen className="h-10 w-10 text-slate-500 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-white mb-2">No matching courses found</h4>
        <p className="text-xs text-slate-400 mb-4">
          {searchQuery ? `No courses matching "${searchQuery}".` : "No courses have been ingested yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCourses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
};
