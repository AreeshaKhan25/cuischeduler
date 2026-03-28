"use client";

import { Cpu } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

interface OSConceptBadgeProps {
  concept: string;
  description?: string;
  chapter?: string;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  position?: "inline" | "corner" | "banner";
}

const sizeStyles = {
  sm: {
    container: "px-2 py-0.5 gap-1",
    text: "text-[11px]",
    icon: 10,
  },
  md: {
    container: "px-2.5 py-1 gap-1.5",
    text: "text-[12px]",
    icon: 12,
  },
  lg: {
    container: "px-3 py-1.5 gap-2",
    text: "text-[14px]",
    icon: 14,
  },
};

export function OSConceptBadge({
  concept,
  description,
  chapter,
  size = "md",
  pulse = true,
  position = "inline",
}: OSConceptBadgeProps) {
  const styles = sizeStyles[size];

  const positionStyles = {
    inline: "inline-flex",
    corner: "absolute top-3 right-3 z-10",
    banner:
      "flex w-full px-4 py-2 rounded-lg justify-between items-center",
  };

  const badge = (
    <div
      className={cn(
        "items-center rounded-md border font-mono select-none",
        "bg-os-bg border-os-border text-os-text",
        "shadow-os-glow",
        pulse && "animate-os-pulse",
        styles.container,
        styles.text,
        positionStyles[position],
        position === "banner" ? "flex" : "inline-flex"
      )}
    >
      <div className="flex items-center gap-1.5">
        <Cpu size={styles.icon} className="text-os-text flex-shrink-0 opacity-80" />
        <span className="font-semibold tracking-tight whitespace-nowrap">
          {concept}
        </span>
      </div>
      {chapter && position === "banner" && (
        <span className="ml-auto text-os-text/60 text-[11px] font-normal tracking-wide uppercase">
          {chapter}
        </span>
      )}
      {chapter && position !== "banner" && (
        <span className="text-os-text/50 text-[10px] ml-0.5">
          [{chapter}]
        </span>
      )}
    </div>
  );

  if (!description && !chapter) return badge;

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{badge}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="bottom"
            align="start"
            sideOffset={6}
            className={cn(
              "z-[9999] max-w-xs rounded-lg border px-4 py-3",
              "bg-bg-secondary border-os-border/50 shadow-os-glow",
              "animate-in fade-in-0 zoom-in-95 duration-150"
            )}
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-os-border" />
                <span className="font-mono text-[13px] font-semibold text-os-text">
                  {concept}
                </span>
              </div>
              {description && (
                <p className="text-[12px] text-text-secondary leading-relaxed">
                  {description}
                </p>
              )}
              {chapter && (
                <div className="flex items-center gap-1.5 pt-1 border-t border-border/50">
                  <span className="text-[10px] text-os-text/60 font-mono uppercase tracking-wider">
                    Reference
                  </span>
                  <span className="text-[11px] text-os-text font-mono font-medium">
                    {chapter}
                  </span>
                </div>
              )}
            </div>
            <Tooltip.Arrow className="fill-bg-secondary" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export default OSConceptBadge;
