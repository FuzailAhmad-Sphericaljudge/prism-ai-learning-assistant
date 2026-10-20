"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Lock, Compass } from "lucide-react";
import { usePlayerStore } from "@/lib/stores/use-player-store";
import { FirewallMode } from "@/lib/api-types";
import { cn } from "@/lib/utils";

interface FirewallModeToggleProps {
  className?: string;
}

export const FirewallModeToggle: React.FC<FirewallModeToggleProps> = ({ className }) => {
  const { firewallMode, setFirewallMode } = usePlayerStore();

  const options: { id: FirewallMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "learn_so_far", label: "Learn So Far", icon: Lock },
    { id: "explore_ahead", label: "Explore Ahead", icon: Compass },
  ];

  return (
    <div
      className={cn(
        "relative flex items-center bg-black/50 border border-white/[0.08] rounded-xl p-1 shadow-inner select-none",
        className
      )}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = firewallMode === opt.id;

        return (
          <button
            key={opt.id}
            onClick={() => setFirewallMode(opt.id)}
            className={cn(
              "relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200",
              isActive
                ? opt.id === "learn_so_far"
                  ? "text-emerald-300"
                  : "text-prism-pink"
                : "text-slate-400 hover:text-white"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{opt.label}</span>

            {isActive && (
              <motion.div
                layoutId="firewallPill"
                className={cn(
                  "absolute inset-0 -z-10 rounded-lg border shadow-sm",
                  opt.id === "learn_so_far"
                    ? "bg-emerald-500/15 border-emerald-500/30"
                    : "bg-prism-pink/15 border-prism-pink/30"
                )}
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
