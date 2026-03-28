"use client";

import { cn } from "@/lib/utils";

interface ResourceDotProps {
  status: "available" | "occupied" | "reserved" | "maintenance";
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusColors = {
  available: { dot: "bg-success", ring: "ring-success/30" },
  occupied: { dot: "bg-danger", ring: "ring-danger/30" },
  reserved: { dot: "bg-warning", ring: "ring-warning/30" },
  maintenance: { dot: "bg-text-tertiary", ring: "ring-text-tertiary/30" },
};

const sizeMap = {
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
};

export function ResourceDot({
  status,
  pulse = false,
  size = "md",
  className,
}: ResourceDotProps) {
  const colors = statusColors[status];

  return (
    <span className={cn("relative inline-flex", className)}>
      <span
        className={cn(
          "rounded-full",
          sizeMap[size],
          colors.dot
        )}
      />
      {pulse && (
        <span
          className={cn(
            "absolute inset-0 rounded-full ring-2 animate-ping opacity-50",
            colors.dot,
            colors.ring
          )}
        />
      )}
    </span>
  );
}

export default ResourceDot;
