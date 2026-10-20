import { create } from "zustand";
import { FirewallMode } from "@/lib/api-types";

export interface PlayerState {
  // Playback state
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackSpeed: number;
  volume: number;
  isMuted: boolean;
  seekTarget: number | null;

  // Temporal Firewall state
  firewallMode: FirewallMode;
  maxLearnedTime: number; // Highest timestamp reached in current session

  // Tabbed panel navigation
  activeRightTab: "ask" | "resources" | "evidence";
  resourcesSubTab: "slides" | "pdf" | "notes";
  activeSlide: number;
  activePdfPage: number;

  // Actions
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  togglePlay: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  seekTo: (time: number) => void;
  clearSeekTarget: () => void;

  setFirewallMode: (mode: FirewallMode) => void;
  pauseAndSnapshot: () => number;

  setActiveRightTab: (tab: "ask" | "resources" | "evidence") => void;
  setResourcesSubTab: (subTab: "slides" | "pdf" | "notes") => void;
  jumpToSlide: (slide: number) => void;
  jumpToPage: (page: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTime: 0,
  duration: 1680, // 28 minutes default until loaded from metadata
  isPlaying: false,
  playbackSpeed: 1.0,
  volume: 0.8,
  isMuted: false,
  seekTarget: null,

  firewallMode: "learn_so_far",
  maxLearnedTime: 0,

  activeRightTab: "ask",
  resourcesSubTab: "slides",
  activeSlide: 1,
  activePdfPage: 1,

  setCurrentTime: (time: number) => {
    const validTime = Math.max(0, time);
    set((state) => ({
      currentTime: validTime,
      maxLearnedTime: Math.max(state.maxLearnedTime, validTime),
    }));
  },

  setDuration: (duration: number) => {
    if (duration > 0) {
      set({ duration });
    }
  },

  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setPlaybackSpeed: (playbackSpeed: number) => set({ playbackSpeed }),

  setVolume: (volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    set({ volume: clamped, isMuted: clamped === 0 });
  },

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  seekTo: (time: number) => {
    const clamped = Math.max(0, Math.min(get().duration, time));
    set((state) => ({
      currentTime: clamped,
      seekTarget: clamped,
      maxLearnedTime: Math.max(state.maxLearnedTime, clamped),
    }));
  },

  clearSeekTarget: () => set({ seekTarget: null }),

  setFirewallMode: (firewallMode: FirewallMode) => set({ firewallMode }),

  pauseAndSnapshot: () => {
    const { currentTime } = get();
    set({ isPlaying: false });
    return currentTime;
  },

  setActiveRightTab: (activeRightTab) => set({ activeRightTab }),

  setResourcesSubTab: (resourcesSubTab) => set({ resourcesSubTab }),

  jumpToSlide: (activeSlide: number) => {
    set({
      activeSlide: Math.max(1, activeSlide),
      activeRightTab: "resources",
      resourcesSubTab: "slides",
    });
  },

  jumpToPage: (activePdfPage: number) => {
    set({
      activePdfPage: Math.max(1, activePdfPage),
      activeRightTab: "resources",
      resourcesSubTab: "pdf",
    });
  },
}));
