"use client";

import { cn, getAlgorithmColor } from "@/lib/utils";

interface AlgorithmBadgeProps {
  algorithm: string;
  className?: string;
}

const algorithmLabels: Record<string, string> = {
  fcfs: "FCFS",
  sjf: "SJF",
  rr: "Round Robin",
  priority: "Priority",
  srtf: "SRTF",
  edf: "EDF",
};

export function AlgorithmBadge({ algorithm, className }: AlgorithmBadgeProps) {
  const colors = getAlgorithmColor(algorithm);
  const label = algorithmLabels[algorithm.toLowerCase()] || algorithm.toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full",
        "font-mono text-[11px] font-semibold tracking-wide",
        "border",
        colors.bg,
        colors.text,
        className
      )}
      style={{
        borderColor: "currentColor",
        opacity: 0.9,
      }}
    >
      {label}
    </span>
  );
}

export default AlgorithmBadge;
