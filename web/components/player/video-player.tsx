"use client";

import * as React from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, ShieldCheck, Sparkles } from "lucide-react";
import { usePlayerStore } from "@/lib/stores/use-player-store";
import { getCurrentChapter } from "@/lib/chapters";
import { formatTime } from "@/lib/utils";

interface VideoPlayerProps {
  src?: string;
  poster?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster }) => {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const {
    currentTime,
    duration,
    isPlaying,
    playbackSpeed,
    volume,
    isMuted,
    seekTarget,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    clearSeekTarget,
  } = usePlayerStore();

  const currentChapter = getCurrentChapter(currentTime);

  // Sync state to HTML5 video element if src exists
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (isPlaying && video.paused) {
      video.play().catch(() => setIsPlaying(false));
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [isPlaying, src, setIsPlaying]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = isMuted;
  }, [volume, isMuted]);

  React.useEffect(() => {
    if (seekTarget !== null) {
      if (videoRef.current && src) {
        videoRef.current.currentTime = seekTarget;
      }
      clearSeekTarget();
    }
  }, [seekTarget, src, clearSeekTarget]);

  // Fallback virtual simulation clock if no external MP4 file is mounted
  React.useEffect(() => {
    if (src) return; // HTML5 video events will drive time if src is present

    let animationFrameId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      if (isPlaying) {
        const delta = (now - lastTime) / 1000;
        const nextTime = Math.min(duration, currentTime + delta * playbackSpeed);
        setCurrentTime(nextTime);
        if (nextTime >= duration) {
          setIsPlaying(false);
        }
      }
      lastTime = now;
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, currentTime, duration, playbackSpeed, src, setCurrentTime, setIsPlaying]);

  // Synthetic lecture visualizer on canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || src) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Dark background
      ctx.fillStyle = "#0A0C14";
      ctx.fillRect(0, 0, width, height);

      // Subtle grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw BST node visualization representing current chapter
      const centerX = width / 2;
      const centerY = height / 2 - 20;

      // Pulse ring
      const pulse = Math.sin(Date.now() / 400) * 4;

      // Root node
      ctx.fillStyle = "#0E1017";
      ctx.strokeStyle = "#00F2FE";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY - 60, 24 + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 13px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("15 [Root]", centerX, centerY - 60);

      // Left child
      ctx.strokeStyle = "rgba(0, 242, 254, 0.4)";
      ctx.beginPath();
      ctx.moveTo(centerX - 16, centerY - 40);
      ctx.lineTo(centerX - 100, centerY + 20);
      ctx.stroke();

      ctx.fillStyle = "#0E1017";
      ctx.strokeStyle = "#8A2BE2";
      ctx.beginPath();
      ctx.arc(centerX - 100, centerY + 20, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("6", centerX - 100, centerY + 20);

      // Right child
      ctx.strokeStyle = "rgba(0, 242, 254, 0.4)";
      ctx.beginPath();
      ctx.moveTo(centerX + 16, centerY - 40);
      ctx.lineTo(centerX + 100, centerY + 20);
      ctx.stroke();

      ctx.fillStyle = "#0E1017";
      ctx.strokeStyle = "#EC4899";
      ctx.beginPath();
      ctx.arc(centerX + 100, centerY + 20, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("18", centerX + 100, centerY + 20);

      // Left-right child (7)
      ctx.strokeStyle = "rgba(138, 43, 226, 0.4)";
      ctx.beginPath();
      ctx.moveTo(centerX - 90, centerY + 35);
      ctx.lineTo(centerX - 50, centerY + 80);
      ctx.stroke();

      ctx.fillStyle = "#0E1017";
      ctx.strokeStyle = "#F59E0B";
      ctx.beginPath();
      ctx.arc(centerX - 50, centerY + 80, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("7", centerX - 50, centerY + 80);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [src]);

  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/[0.08] bg-black shadow-2xl select-none group">
      {src ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="h-full w-full object-contain"
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => setIsPlaying(false)}
          playsInline
        />
      ) : (
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="h-full w-full object-cover"
        />
      )}

      {/* Floating Lecture Watermark Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md">
        <div className="h-2 w-2 rounded-full bg-prism-cyan animate-pulse" />
        <span className="text-[11px] font-mono text-white font-medium">
          {currentChapter.title}
        </span>
      </div>

      {/* Center Clickable Play/Pause Overlay */}
      <button
        onClick={() => usePlayerStore.getState().togglePlay()}
        className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors"
        aria-label={isPlaying ? "Pause video" : "Play video"}
      >
        {!isPlaying && (
          <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-prism-cyan via-prism-violet to-prism-pink p-[1px] shadow-prism-glow transition-transform duration-300 hover:scale-110 flex items-center justify-center">
            <div className="h-full w-full rounded-full bg-[#07080D]/90 flex items-center justify-center pl-1">
              <Play className="h-7 w-7 text-white fill-white" />
            </div>
          </div>
        )}
      </button>
    </div>
  );
};
