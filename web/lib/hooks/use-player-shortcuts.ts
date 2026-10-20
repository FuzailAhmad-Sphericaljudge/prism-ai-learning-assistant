import * as React from "react";
import { usePlayerStore } from "@/lib/stores/use-player-store";

export function usePlayerShortcuts() {
  const {
    currentTime,
    volume,
    togglePlay,
    seekTo,
    setVolume,
    toggleMute,
  } = usePlayerStore();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if focus is in an input or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;

        case "arrowleft":
        case "j":
          e.preventDefault();
          seekTo(currentTime - 10);
          break;

        case "arrowright":
        case "l":
          e.preventDefault();
          seekTo(currentTime + 10);
          break;

        case "m":
          e.preventDefault();
          toggleMute();
          break;

        case "arrowup":
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;

        case "arrowdown":
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTime, volume, togglePlay, seekTo, setVolume, toggleMute]);
}
