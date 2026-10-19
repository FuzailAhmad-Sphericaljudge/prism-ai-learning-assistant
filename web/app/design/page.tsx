"use client";

import * as React from "react";
import {
  Sparkles,
  Play,
  FileText,
  Presentation,
  Bookmark,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  PanelRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent, GlassCardFooter } from "@/components/prism/GlassCard";
import { GradientText } from "@/components/prism/GradientText";
import { SectionHeading } from "@/components/prism/SectionHeading";
import { GlowBorder } from "@/components/prism/GlowBorder";
import { CitationChip } from "@/components/prism/CitationChip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function DesignKitchenSink() {
  const { toast } = useToast();
  const [activeChip, setActiveChip] = React.useState<string>("02:30");
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-16">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono text-prism-cyan w-fit">
          <Sparkles className="h-3.5 w-3.5" />
          <span>PRISM Design System v0.1</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Component <GradientText variant="prism">Kitchen Sink</GradientText>
        </h1>
        <p className="text-foreground-muted text-base max-w-3xl leading-relaxed">
          Comprehensive showcase of all design tokens, typography, glassmorphism cards, interactive
          evidence citation chips, glows, and accessible primitives tailored for the PRISM AI learning assistant.
        </p>
      </div>

      {/* 1. Brand Tokens & Color Palette */}
      <section className="space-y-6">
        <SectionHeading
          badge="Tokens"
          title="Color Palette &"
          gradientTitle="Gradients"
          subtitle="Obsidian deep void backgrounds, translucent slate surfaces, and vibrant prism gradient accents."
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/[0.08] bg-[#07080D]">
            <div className="h-12 w-full rounded-lg bg-[#07080D] border border-white/20" />
            <span className="text-xs font-mono font-medium text-white">Background</span>
            <span className="text-[11px] font-mono text-foreground-subtle">#07080D</span>
          </div>

          <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/[0.08] bg-[#0E1018]">
            <div className="h-12 w-full rounded-lg bg-[#0E1018] border border-white/20" />
            <span className="text-xs font-mono font-medium text-white">Surface</span>
            <span className="text-[11px] font-mono text-foreground-subtle">#0E1018</span>
          </div>

          <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/[0.08] bg-[#0E1018]">
            <div className="h-12 w-full rounded-lg bg-prism-cyan shadow-prism-cyan" />
            <span className="text-xs font-mono font-medium text-prism-cyan">Prism Cyan</span>
            <span className="text-[11px] font-mono text-foreground-subtle">#22D3EE</span>
          </div>

          <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/[0.08] bg-[#0E1018]">
            <div className="h-12 w-full rounded-lg bg-prism-violet shadow-prism-violet" />
            <span className="text-xs font-mono font-medium text-prism-violet">Prism Violet</span>
            <span className="text-[11px] font-mono text-foreground-subtle">#8B5CF6</span>
          </div>

          <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/[0.08] bg-[#0E1018]">
            <div className="h-12 w-full rounded-lg bg-prism-pink shadow-prism-pink" />
            <span className="text-xs font-mono font-medium text-prism-pink">Prism Pink</span>
            <span className="text-[11px] font-mono text-foreground-subtle">#F472B6</span>
          </div>

          <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/[0.08] bg-[#0E1018]">
            <div className="h-12 w-full rounded-lg bg-prism-amber shadow-prism-amber" />
            <span className="text-xs font-mono font-medium text-prism-amber">Prism Amber</span>
            <span className="text-[11px] font-mono text-foreground-subtle">#FBBF24</span>
          </div>
        </div>
      </section>

      {/* 2. Typography & Gradient Text */}
      <section className="space-y-6">
        <SectionHeading
          badge="Typography"
          title="Gradient Text &"
          gradientTitle="Styles"
          subtitle="Hierarchical type hierarchy using Inter for UI and JetBrains Mono for citations."
        />

        <GlassCard>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-mono text-foreground-subtle mb-1">Variant: prism (animated)</p>
              <h2 className="text-2xl sm:text-3xl font-bold">
                <GradientText variant="prism" animate>
                  Temporal Evidence Firewall Enforced
                </GradientText>
              </h2>
            </div>
            <div>
              <p className="text-xs font-mono text-foreground-subtle mb-1">Variant: cyan-violet</p>
              <h3 className="text-xl sm:text-2xl font-bold">
                <GradientText variant="cyan-violet">
                  Adaptive Mock Interview Architecture
                </GradientText>
              </h3>
            </div>
            <div>
              <p className="text-xs font-mono text-foreground-subtle mb-1">Variant: violet-pink</p>
              <h3 className="text-xl sm:text-2xl font-bold">
                <GradientText variant="violet-pink">
                  Misconception-to-Mastery Diagnostics
                </GradientText>
              </h3>
            </div>
            <div>
              <p className="text-xs font-mono text-foreground-subtle mb-1">Variant: amber-pink</p>
              <h3 className="text-xl sm:text-2xl font-bold">
                <GradientText variant="amber-pink">
                  Zero Hallucination Grounding
                </GradientText>
              </h3>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* 3. Buttons Showcase */}
      <section className="space-y-6">
        <SectionHeading
          badge="Actions"
          title="Buttons &"
          gradientTitle="Interactive Controls"
          subtitle="Primary radiant gradients, glass cards, ghost actions, and sizes."
        />

        <GlassCard>
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary Gradient</Button>
              <Button variant="glass">Glass Button</Button>
              <Button variant="default">Default Subdued</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive</Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/[0.06]">
              <span className="text-xs font-mono text-foreground-subtle w-full">Sizes:</span>
              <Button variant="primary" size="sm">Small (sm)</Button>
              <Button variant="primary" size="default">Default</Button>
              <Button variant="primary" size="lg">Large (lg)</Button>
              <Button variant="glass" size="icon">
                <Sparkles className="h-4 w-4 text-prism-cyan" />
              </Button>
              <Button variant="primary" isLoading>
                Processing...
              </Button>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* 4. Badges & Evidence Citation Chips */}
      <section className="space-y-6">
        <SectionHeading
          badge="Citations"
          title="Citation Chips &"
          gradientTitle="Status Badges"
          subtitle="Precise monospace timestamps and evidence badges for video, slides, notes, and PDF pages."
        />

        <GlassCard>
          <div className="flex flex-col gap-6">
            {/* Citation Chips */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-prism-cyan" /> Evidence Citation Chips (JetBrains Mono)
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                <CitationChip
                  type="timestamp"
                  value="02:30"
                  active={activeChip === "02:30"}
                  onSeek={(v) => setActiveChip(String(v))}
                />
                <CitationChip
                  type="timestamp"
                  value={275}
                  active={activeChip === "04:35"}
                  onSeek={(v) => setActiveChip(String(v))}
                />
                <CitationChip
                  type="slide"
                  value={4}
                  active={activeChip === "slide-4"}
                  onSeek={() => setActiveChip("slide-4")}
                />
                <CitationChip
                  type="page"
                  value={18}
                  active={activeChip === "page-18"}
                  onSeek={() => setActiveChip("page-18")}
                />
                <CitationChip
                  type="note"
                  value="Section 3"
                  active={activeChip === "note-3"}
                  onSeek={() => setActiveChip("note-3")}
                />
              </div>
              <p className="text-xs font-mono text-foreground-subtle mt-2">
                Selected Active Citation: <span className="text-prism-cyan">{activeChip}</span>
              </p>
            </div>

            {/* Badges */}
            <div className="pt-4 border-t border-white/[0.06]">
              <h4 className="text-sm font-semibold text-white mb-3">Status Badges</h4>
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="prism">Prism Special</Badge>
                <Badge variant="cyan" dot>Temporal Firewall Active</Badge>
                <Badge variant="violet" dot>Vector Search</Badge>
                <Badge variant="pink" dot>Evidence Linked</Badge>
                <Badge variant="amber" dot>Diagnostic Pending</Badge>
                <Badge variant="success" dot>Mastery Verified</Badge>
                <Badge variant="destructive" dot>Spoiler Intercepted</Badge>
                <Badge variant="outline">Default Outline</Badge>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* 5. GlassCard Variants & GlowBorder */}
      <section className="space-y-6">
        <SectionHeading
          badge="Cards"
          title="GlassCard &"
          gradientTitle="Glow Borders"
          subtitle="Translucent dark slate glass with 12-16px radius and multi-stop gradient frames."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard variant="default">
            <GlassCardHeader>
              <GlassCardTitle>Standard GlassCard</GlassCardTitle>
              <GlassCardDescription>
                Subtle border with 75% dark slate opacity.
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent>
              <p className="text-xs text-foreground-muted">
                Provides consistent framing without visual noise across the dashboard.
              </p>
            </GlassCardContent>
          </GlassCard>

          <GlassCard variant="accent" glowColor="violet" hoverEffect>
            <GlassCardHeader>
              <GlassCardTitle>Accent Top Gradient</GlassCardTitle>
              <GlassCardDescription>
                Features top multi-color prism line and hover glow.
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent>
              <p className="text-xs text-foreground-muted">
                Ideal for highlighted recommendations, interview feedback, or active evidence cards.
              </p>
            </GlassCardContent>
          </GlassCard>

          <GlowBorder animated intensity="medium" borderRadius="16px">
            <div className="p-6 flex flex-col justify-between h-full">
              <div>
                <Badge variant="prism" className="mb-2">Animated GlowBorder</Badge>
                <h3 className="text-lg font-semibold text-white mb-1">Radiant Frame</h3>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  Wraps critical high-priority alerts or video player playback zones with a luminous pulse.
                </p>
              </div>
            </div>
          </GlowBorder>
        </div>
      </section>

      {/* 6. Tabs & Skeletons */}
      <section className="space-y-6">
        <SectionHeading
          badge="Layouts"
          title="Tabs &"
          gradientTitle="Skeleton Loaders"
          subtitle="Accessible tabs and smooth shimmer placeholders for asynchronous loading."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tabs */}
          <GlassCard>
            <GlassCardTitle className="mb-4">Interactive Tabs</GlassCardTitle>
            <Tabs defaultValue="transcript" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="slides">Slides</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              <TabsContent value="transcript" className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-xs font-mono text-foreground-muted">
                  [00:14] Welcome to Transformer Architectures. Today we discuss multi-head attention...
                </p>
              </TabsContent>
              <TabsContent value="slides" className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-xs font-mono text-foreground-muted">
                  Slide 4: Self-Attention Affinities & Scaled Dot Product Formulation
                </p>
              </TabsContent>
              <TabsContent value="notes" className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-xs font-mono text-foreground-muted">
                  Note: Remember that keys and queries must have matching dimension d_k.
                </p>
              </TabsContent>
            </Tabs>
          </GlassCard>

          {/* Skeletons */}
          <GlassCard>
            <GlassCardTitle className="mb-4">Skeleton Loaders</GlassCardTitle>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-16 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 7. Dialog, Drawer, Tooltip & Toasts */}
      <section className="space-y-6">
        <SectionHeading
          badge="Overlays"
          title="Dialogs, Drawers &"
          gradientTitle="Toasts"
          subtitle="Modals, slide-over evidence panels, glass tooltips, and toast triggers."
        />

        <GlassCard>
          <div className="flex flex-wrap items-center gap-4">
            {/* Dialog Trigger */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="glass">Open Modal Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Temporal Firewall Rule</DialogTitle>
                  <DialogDescription>
                    You are attempting to access notes from timestamp 14:20 while your playback is at 03:45.
                  </DialogDescription>
                </DialogHeader>
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  Access restricted to protect your progressive learning curve.
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                    Stay at 03:45
                  </Button>
                  <Button variant="primary" onClick={() => setIsDialogOpen(false)}>
                    Fast-Forward Lecture
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Drawer Trigger (Simulating Evidence Inspector) */}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="primary" className="gap-2">
                  <PanelRight className="h-4 w-4" /> Open Evidence Inspector
                </Button>
              </DrawerTrigger>
              <DrawerContent side="right">
                <DrawerHeader>
                  <DrawerTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-prism-cyan" /> Evidence Inspector
                  </DrawerTitle>
                  <DrawerDescription>
                    Direct multimodal grounding extracted from permitted lecture segments.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="space-y-4 my-4">
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <div className="flex items-center justify-between mb-2">
                      <CitationChip type="timestamp" value="02:30" />
                      <Badge variant="cyan">Confidence: 98%</Badge>
                    </div>
                    <p className="text-xs text-foreground-muted leading-relaxed">
                      &quot;The dot product of queries and keys gives us unnormalized attention weights.&quot;
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <div className="flex items-center justify-between mb-2">
                      <CitationChip type="slide" value={4} />
                      <Badge variant="violet">Slide Grounding</Badge>
                    </div>
                    <p className="text-xs text-foreground-muted leading-relaxed">
                      Slide 4 diagram matches attention matrix formula A = softmax(QK^T / sqrt(d_k)).
                    </p>
                  </div>
                </div>
                <DrawerFooter>
                  <Button variant="glass" onClick={() => setIsDrawerOpen(false)}>
                    Close Inspector
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            {/* Tooltip Demonstration */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Info className="h-4 w-4 text-prism-cyan" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Temporal Firewall bounds vector search to t &le; T_playback</p>
              </TooltipContent>
            </Tooltip>

            {/* Toast Triggers */}
            <Button
              variant="glass"
              onClick={() => {
                toast({
                  title: "Evidence Verified",
                  description: "Cited 3 evidence anchors at timestamp 02:30.",
                  variant: "prism",
                });
              }}
            >
              Trigger Prism Toast
            </Button>

            <Button
              variant="glass"
              onClick={() => {
                toast({
                  title: "Mastery Recorded",
                  description: "Diagnostic response passed rubric evaluation.",
                  variant: "success",
                });
              }}
            >
              Trigger Success Toast
            </Button>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
