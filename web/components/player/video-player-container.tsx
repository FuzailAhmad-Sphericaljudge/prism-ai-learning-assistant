"use client";

import * as React from "react";
import { ShieldCheck, Video } from "lucide-react";
import { VideoPlayer } from "@/components/player/video-player";
import { PrismProgressBar } from "@/components/player/prism-progress-bar";
import { PlayerControls } from "@/components/player/player-controls";
import { usePlayerShortcuts } from "@/lib/hooks/use-player-shortcuts";
import { usePlayerStore } from "@/lib/stores/use-player-store";

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

  const activeEvidenceCitation = usePlayerStore((s) => s.activeEvidenceCitation);
  const isEvidenceDrawerOpen = usePlayerStore((s) => s.isEvidenceDrawerOpen);

  return (
    <div className="flex flex-col w-full rounded-2xl border border-white/[0.08] bg-[#0E1017]/80 p-4 backdrop-blur-xl shadow-2xl relative">
      {/* Evidence Jumping Indicator */}
      {isEvidenceDrawerOpen && activeEvidenceCitation && (
        <div className="absolute top-6 right-6 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs backdrop-blur-md shadow-lg animate-in fade-in zoom-in-95 duration-150">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono font-semibold">[{activeEvidenceCitation.evidence_id}]</span>
          <span className="opacity-75">{activeEvidenceCitation.coordinate}</span>
        </div>
      )}

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

