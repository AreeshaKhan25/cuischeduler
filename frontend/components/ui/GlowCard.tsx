"use client";

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

const glowColorMap: Record<string, string> = {
  blue: "hover:shadow-blue-glow hover:border-accent-blue/40",
  teal: "hover:shadow-teal-glow hover:border-accent-teal/40",
  success: "hover:shadow-success-glow hover:border-success/40",
  warning: "hover:shadow-warning-glow hover:border-warning/40",
  danger: "hover:shadow-danger-glow hover:border-danger/40",
  os: "hover:shadow-os-glow hover:border-os-border/40",
};

export function GlowCard({
  children,
  className,
  glowColor = "blue",
}: GlowCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-bg-secondary p-5",
        "transition-all duration-300",
        glowColorMap[glowColor] || glowColorMap.blue,
        className
      )}
    >
      {children}
    </div>
  );
}

export default GlowCard;
