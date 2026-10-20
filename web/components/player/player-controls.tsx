"use client";

import * as React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Gauge,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { usePlayerStore } from "@/lib/stores/use-player-store";
import { formatTime } from "@/lib/utils";

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0];

interface PlayerControlsProps {
  onAskMoment?: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({ onAskMoment }) => {
  const {
    currentTime,
    duration,
    isPlaying,
    playbackSpeed,
    volume,
    isMuted,
    togglePlay,
    seekTo,
    setPlaybackSpeed,
    setVolume,
    toggleMute,
    pauseAndSnapshot,
  } = usePlayerStore();

  const handleAskMoment = () => {
    pauseAndSnapshot();
    if (onAskMoment) {
      onAskMoment();
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-2 px-1 select-none">
      {/* Left controls: Play, Pause, Jumps, Volume & Time */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="h-9 w-9 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white flex items-center justify-center transition-colors"
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 fill-white" />
          ) : (
            <Play className="h-4 w-4 fill-white pl-0.5" />
          )}
        </button>

        {/* -10s */}
        <button
          onClick={() => seekTo(currentTime - 10)}
          className="h-8 w-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors"
          title="Back 10 seconds (Left Arrow or J)"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* +10s */}
        <button
          onClick={() => seekTo(currentTime + 10)}
          className="h-8 w-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors"
          title="Forward 10 seconds (Right Arrow or L)"
        >
          <RotateCw className="h-4 w-4" />
        </button>

        {/* Volume controls */}
        <div className="flex items-center gap-2 group/vol">
          <button
            onClick={toggleMute}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            title={isMuted ? "Unmute (M)" : "Mute (M)"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4 text-rose-400" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-prism-cyan"
            title="Volume"
          />
        </div>

        {/* Timestamp Display */}
        <div className="font-mono text-xs text-slate-300 ml-2">
          <span className="font-semibold text-white">{formatTime(currentTime)}</span>
          <span className="text-slate-500 mx-1">/</span>
          <span className="text-slate-400">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right controls: Speed Presets & "Ask about this moment" */}
      <div className="flex items-center gap-2.5">
        {/* Speed presets */}
        <div className="flex items-center gap-1 bg-black/40 border border-white/[0.08] rounded-lg p-0.5">
          {SPEED_OPTIONS.map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                playbackSpeed === speed
                  ? "bg-white/10 text-prism-cyan font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Ask about this moment button */}
        <button
          onClick={handleAskMoment}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-prism-cyan/20 via-prism-violet/20 to-prism-pink/20 hover:from-prism-cyan/30 hover:via-prism-violet/30 hover:to-prism-pink/30 border border-white/20 transition-all duration-200 shadow-sm"
          title="Pause playback and query the Temporal Evidence Firewall"
        >
          <Sparkles className="h-3.5 w-3.5 text-prism-cyan" />
          <span>Ask about this moment</span>
        </button>
      </div>
    </div>
  );
};
