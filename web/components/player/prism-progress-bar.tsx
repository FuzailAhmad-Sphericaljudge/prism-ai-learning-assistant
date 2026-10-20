"use client";

import * as React from "react";
import { usePlayerStore } from "@/lib/stores/use-player-store";
import { BST_CHAPTERS, getCurrentChapter } from "@/lib/chapters";
import { formatTime } from "@/lib/utils";

export const PrismProgressBar: React.FC = () => {
  const barRef = React.useRef<HTMLDivElement | null>(null);
  const [hoverTime, setHoverTime] = React.useState<number | null>(null);
  const [hoverX, setHoverX] = React.useState<number>(0);

  const { currentTime, duration, seekTo } = usePlayerStore();

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current || duration <= 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(pos * duration);
    setHoverX(e.clientX - rect.left);
  };

  const handleMouseLeave = () => setHoverTime(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current || duration <= 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(pos * duration);
  };

  const hoveredChapter = hoverTime !== null ? getCurrentChapter(hoverTime) : null;

  return (
    <div className="relative w-full py-3 cursor-pointer group" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={handleClick}>
      {/* Hover preview tooltip */}
      {hoverTime !== null && hoveredChapter && (
        <div
          className="absolute -top-11 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center bg-[#131622] border border-white/20 rounded-lg px-2.5 py-1 shadow-2xl backdrop-blur-md"
          style={{ left: `${hoverX}px` }}
        >
          <span className="text-[11px] font-mono text-prism-cyan font-bold leading-tight">
            {formatTime(hoverTime)}
          </span>
          <span className="text-[9px] text-slate-300 font-medium max-w-[180px] truncate leading-tight">
            {hoveredChapter.title}
          </span>
        </div>
      )}

      {/* Progress track container */}
      <div
        ref={barRef}
        className="relative h-2 w-full rounded-full bg-white/[0.08] group-hover:h-3 transition-all duration-200 overflow-visible"
      >
        {/* Progress fill */}
        <div
          className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-prism-cyan via-prism-violet to-prism-pink shadow-prism-glow transition-all duration-75"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Chapter tick dividers */}
        {BST_CHAPTERS.map((ch) => {
          if (ch.startSec === 0) return null;
          const pos = (ch.startSec / duration) * 100;
          return (
            <div
              key={ch.id}
              className="absolute top-0 bottom-0 w-[2px] bg-white/40 z-10 hover:w-[4px] hover:bg-white transition-all pointer-events-none"
              style={{ left: `${pos}%` }}
              title={ch.title}
            />
          );
        })}

        {/* Scrubber thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-white border-2 border-prism-violet shadow-lg group-hover:scale-125 transition-transform duration-150 pointer-events-none"
          style={{ left: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
