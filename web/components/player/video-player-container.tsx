"use client";

import * as React from "react";
import { VideoPlayer } from "@/components/player/video-player";
import { PrismProgressBar } from "@/components/player/prism-progress-bar";
import { PlayerControls } from "@/components/player/player-controls";
import { usePlayerShortcuts } from "@/lib/hooks/use-player-shortcuts";

interface VideoPlayerContainerProps {
  src?: string;
  poster?: string;
  onAskMoment?: () => void;
}

export const VideoPlayerContainer: React.FC<VideoPlayerContainerProps> = ({
  src,
  poster,
  onAskMoment,
}) => {
  // Activate global keyboard shortcuts
  usePlayerShortcuts();

  return (
    <div className="flex flex-col w-full rounded-2xl border border-white/[0.08] bg-[#0E1017]/80 p-4 backdrop-blur-xl shadow-2xl">
      {/* HTML5 / Canvas Video Core */}
      <VideoPlayer src={src} poster={poster} />

      {/* Progress Bar with Chapter Markers */}
      <div className="mt-3 px-1">
        <PrismProgressBar />
      </div>

      {/* Playback Controls & Timestamp */}
      <div className="mt-1">
        <PlayerControls onAskMoment={onAskMoment} />
      </div>
    </div>
  );
};
