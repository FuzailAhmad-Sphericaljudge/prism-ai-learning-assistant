"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchCourse, fetchCourseTranscript, fetchCourseResources } from "@/lib/api";
import { usePlayerStore } from "@/lib/stores/use-player-store";
import { AppShell } from "@/components/app/app-shell";
import { VideoPlayerContainer } from "@/components/player/video-player-container";
import { SyncedTranscriptPanel } from "@/components/transcript/synced-transcript-panel";
import { RightTabbedPanel } from "@/components/right-panel/right-tabbed-panel";
import { FirewallModeToggle } from "@/components/firewall/firewall-mode-toggle";
import { FirewallStatusBadge } from "@/components/firewall/firewall-status-badge";
import { LearnMobileTabs, LearnMobileView } from "@/components/learn/learn-mobile-tabs";
import { LearnPageSkeleton } from "@/components/learn/learn-page-skeleton";
import { TranscriptCue } from "@/lib/api-types";

// Seeded course cues fallback in case of cold-start API network delay
const SEEDED_FALLBACK_CUES: TranscriptCue[] = [
  {
    id: "cue-01",
    start_sec: 0,
    end_sec: 142,
    text: "Welcome back, everyone. Today we begin our deep dive into Binary Search Trees, or BSTs.",
    speaker: "Dr. Elena Rostova",
  },
  {
    id: "cue-02",
    start_sec: 142,
    end_sec: 255,
    text: "Let's first review the fundamental motivation behind dynamic tree structures. In an unsorted array, insertion is O(1), but searching requires O(N) linear time.",
    speaker: "Dr. Elena Rostova",
  },
  {
    id: "cue-03",
    start_sec: 255,
    end_sec: 420,
    text: "Now, what is the Binary Search Tree Property? For any node x, all keys in its left subtree must be strictly less than x.key.",
    speaker: "Dr. Elena Rostova",
  },
  {
    id: "cue-04",
    start_sec: 420,
    end_sec: 585,
    text: "Let's prove the in-order traversal theorem. An in-order tree walk systematically prints keys in non-decreasing order.",
    speaker: "Dr. Elena Rostova",
  },
  {
    id: "cue-05",
    start_sec: 585,
    end_sec: 780,
    text: "Next, we explore tree search and insertion. Both algorithms descend along a single root-to-leaf path, taking O(h) time.",
    speaker: "Dr. Elena Rostova",
  },
  {
    id: "cue-06",
    start_sec: 780,
    end_sec: 1122,
    text: "Now consider Order Statistics: finding the Minimum, Maximum, and Successor. Finding the successor takes O(h) time. This brings us to 18:42.",
    speaker: "Dr. Elena Rostova",
  },
  {
    id: "cue-07",
    start_sec: 1122,
    end_sec: 1390,
    text: "Now we arrive at the most intricate operation on binary search trees: deletion.",
    speaker: "Dr. Elena Rostova",
  },
  {
    id: "cue-08",
    start_sec: 1390,
    end_sec: 1530,
    text: "What happens when keys are inserted in sorted order? The tree collapses into an O(N) linear chain.",
    speaker: "Dr. Elena Rostova",
  },
  {
    id: "cue-09",
    start_sec: 1530,
    end_sec: 1714,
    text: "To eliminate O(N) worst-case degradation, we introduce self-balancing architectures: AVL trees and Red-Black trees.",
    speaker: "Dr. Elena Rostova",
  },
];

export default function LearnCoursePage() {
  const params = useParams();
  const courseId = (params?.courseId as string) || "00000000-0000-0000-0000-000000000002";

  const [mobileView, setMobileView] = React.useState<LearnMobileView>("player");
  const setRightTab = usePlayerStore((s) => s.setRightTab);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);

  // 1. Fetch course details
  const {
    data: course,
    isLoading: isCourseLoading,
    isError: isCourseError,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => fetchCourse(courseId),
    retry: 2,
    staleTime: 60000,
  });

  // 2. Fetch transcript cues
  const {
    data: transcriptData,
    isLoading: isTranscriptLoading,
  } = useQuery({
    queryKey: ["course-transcript", courseId],
    queryFn: () => fetchCourseTranscript(courseId),
    retry: 2,
    staleTime: 60000,
  });

  // 3. Fetch course resources (slides, pdf, notes)
  const {
    data: resourcesData,
    isLoading: isResourcesLoading,
  } = useQuery({
    queryKey: ["course-resources", courseId],
    queryFn: () => fetchCourseResources(courseId),
    retry: 2,
    staleTime: 60000,
  });

  const effectiveCues = transcriptData?.cues?.length
    ? transcriptData.cues
    : SEEDED_FALLBACK_CUES;

  // Handle "Ask about this moment" shortcut from video player
  const handleAskMoment = () => {
    setIsPlaying(false);
    setRightTab("ask");
    setMobileView("chat");
  };

  const handleMobileViewChange = (view: LearnMobileView) => {
    setMobileView(view);
    if (view === "chat") {
      setRightTab("ask");
    } else if (view === "resources") {
      setRightTab("resources");
    }
  };

  const courseTitle = course?.title || "CS 201: Binary Search Trees & Balanced Structures";
  const courseCode = course?.code || "CS 201";

  if (isCourseLoading && !transcriptData) {
    return (
      <AppShell
        activeNav="learn"
        courseTitle={courseTitle}
        courseCode={courseCode}
        fullHeight
      >
        <LearnPageSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell
      activeNav="learn"
      courseTitle={courseTitle}
      courseCode={courseCode}
      lectureTitle="Lecture 14 &bull; Binary Search Tree Invariants & Operations"
      fullHeight
    >
      <div className="flex-1 flex flex-col min-h-0 px-3 sm:px-6 py-3 max-w-[1720px] mx-auto w-full overflow-hidden">
        {/* Top Control Bar: Firewall Mode Segmented Control + Live Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-[#0E1017]/90 px-4 py-2.5 rounded-xl border border-white/[0.08] backdrop-blur-xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <FirewallModeToggle />
            <div className="hidden md:block h-4 w-[1px] bg-white/[0.1]" />
            <span className="hidden md:inline text-xs text-slate-400">
              Zero spoiler policy active
            </span>
          </div>

          <div className="flex items-center gap-3">
            <FirewallStatusBadge />
          </div>
        </div>

        {/* Desktop 3-Column / 2-Column Split Workspace */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
          {/* Left / Center Column: Video Player & Synced Transcript (7 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-0 gap-3 overflow-hidden">
            {/* Custom HTML5 Video Player with Canvas Fallback & Controls */}
            <div className="flex-shrink-0">
              <VideoPlayerContainer onAskMoment={handleAskMoment} />
            </div>

            {/* Synced Transcript Panel underneath */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <SyncedTranscriptPanel
                cues={effectiveCues}
                isLoading={isTranscriptLoading}
              />
            </div>
          </div>

          {/* Right Column: Tabbed Panel (Ask, Resources, Evidence) (5 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col min-h-0 overflow-hidden">
            <RightTabbedPanel />
          </div>
        </div>

        {/* Mobile Viewports: Stacked Single-Column with Switcher */}
        <div className="lg:hidden flex-1 flex flex-col min-h-0 pb-16 overflow-y-auto">
          {mobileView === "player" && (
            <div className="space-y-4">
              <VideoPlayerContainer onAskMoment={handleAskMoment} />
              <SyncedTranscriptPanel cues={effectiveCues} />
            </div>
          )}

          {mobileView === "transcript" && (
            <div className="h-[calc(100vh-220px)]">
              <SyncedTranscriptPanel cues={effectiveCues} />
            </div>
          )}

          {mobileView === "chat" && (
            <div className="h-[calc(100vh-220px)]">
              <RightTabbedPanel />
            </div>
          )}

          {mobileView === "resources" && (
            <div className="h-[calc(100vh-220px)]">
              <RightTabbedPanel />
            </div>
          )}
        </div>

        {/* Mobile Tab Navigation Bar */}
        <LearnMobileTabs
          activeView={mobileView}
          onViewChange={handleMobileViewChange}
        />
      </div>
    </AppShell>
  );
}
