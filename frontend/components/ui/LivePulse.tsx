"use client";

import { cn } from "@/lib/utils";

interface LivePulseProps {
  showLabel?: boolean;
  className?: string;
}

export function LivePulse({ showLabel = true, className }: LivePulseProps) {
  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
      </span>
      {showLabel && (
        <span className="text-[11px] font-mono font-semibold text-success uppercase tracking-widest">
          Live
        </span>
      )}
    </div>
  );
}

export default LivePulse;
