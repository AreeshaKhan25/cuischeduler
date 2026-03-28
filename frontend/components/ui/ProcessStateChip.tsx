"use client";

import { cn, getProcessStateColor } from "@/lib/utils";

interface ProcessStateChipProps {
  state: string;
  size?: "sm" | "md";
  showDot?: boolean;
  className?: string;
}

export function ProcessStateChip({
  state,
  size = "md",
  showDot = true,
  className,
}: ProcessStateChipProps) {
  const colors = getProcessStateColor(state);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-mono font-medium uppercase tracking-wider",
        colors.bg,
        colors.text,
        colors.border,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        className
      )}
    >
      {showDot && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: colors.dot }}
        />
      )}
      {state}
    </span>
  );
}

export default ProcessStateChip;
