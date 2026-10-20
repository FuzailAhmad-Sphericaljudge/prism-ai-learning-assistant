"use client";

import * as React from "react";

export const LearnPageSkeleton: React.FC = () => {
  return (
    <div className="flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-10 w-full rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-between px-4">
        <div className="h-4 w-64 rounded bg-white/[0.08]" />
        <div className="h-6 w-32 rounded-full bg-white/[0.08]" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[750px]">
        {/* Left Column (Player & Transcript) - 7 or 8 cols */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          {/* Video Player Skeleton */}
          <div className="w-full aspect-video rounded-2xl bg-white/[0.03] border border-white/[0.08] relative overflow-hidden flex flex-col justify-between p-6">
            <div className="h-4 w-48 rounded bg-white/[0.06]" />
            <div className="w-16 h-16 rounded-full bg-white/[0.06] self-center" />
            <div className="space-y-3">
              <div className="h-2 w-full rounded-full bg-white/[0.08]" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-white/[0.06]" />
                  <div className="h-4 w-24 rounded bg-white/[0.06]" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-16 rounded bg-white/[0.06]" />
                  <div className="h-6 w-16 rounded bg-white/[0.06]" />
                </div>
              </div>
            </div>
          </div>

          {/* Transcript Panel Skeleton */}
          <div className="h-[340px] rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="h-4 w-36 rounded bg-white/[0.06]" />
              <div className="h-6 w-40 rounded-lg bg-white/[0.06]" />
            </div>
            <div className="space-y-3 pt-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-4 w-12 rounded bg-white/[0.06] flex-shrink-0" />
                  <div
                    className="h-4 rounded bg-white/[0.04]"
                    style={{ width: `${Math.floor(45 + ((i * 17) % 50))}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Tabbed Panel) - 5 or 4 cols */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          <div className="h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] flex gap-2 p-1">
            <div className="flex-1 rounded-lg bg-white/[0.08]" />
            <div className="flex-1 rounded-lg bg-white/[0.04]" />
            <div className="flex-1 rounded-lg bg-white/[0.04]" />
          </div>

          <div className="flex-1 min-h-[500px] rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-14 rounded-xl bg-white/[0.05]" />
              <div className="h-20 rounded-xl bg-white/[0.04]" />
              <div className="h-20 rounded-xl bg-white/[0.04]" />
            </div>
            <div className="h-12 rounded-xl bg-white/[0.06] mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
