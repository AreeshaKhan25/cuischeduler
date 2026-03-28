"use client";

import { cn } from "@/lib/utils";
import CountUp from "react-countup";
import { OSConceptBadge } from "./OSConceptBadge";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  osConcept?: {
    concept: string;
    chapter?: string;
    description?: string;
  };
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  decimals = 0,
  suffix = "",
  prefix = "",
  osConcept,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-border bg-bg-secondary p-5",
        "hover:border-border-light hover:shadow-blue-glow transition-all duration-300",
        "group overflow-hidden",
        className
      )}
    >
      {/* OS Concept Badge */}
      {osConcept && (
        <OSConceptBadge
          concept={osConcept.concept}
          chapter={osConcept.chapter}
          description={osConcept.description}
          size="sm"
          position="corner"
          pulse={false}
        />
      )}

      {/* Icon */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent-blue-soft border border-accent-blue/20">
          <Icon size={20} className="text-accent-blue" />
        </div>
        <span className="text-[13px] text-text-secondary font-medium">
          {label}
        </span>
      </div>

      {/* Value with CountUp */}
      <div className="flex items-end gap-2">
        <span className="text-3xl font-display font-bold text-text-primary leading-none">
          {prefix}
          <CountUp
            end={value}
            decimals={decimals}
            duration={2}
            separator=","
            preserveValue
          />
          {suffix}
        </span>
        {trend && (
          <span
            className={cn(
              "text-[12px] font-mono font-medium mb-1",
              trend.positive ? "text-success" : "text-danger"
            )}
          >
            {trend.positive ? "+" : ""}
            {trend.value}%
          </span>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-[12px] text-text-tertiary mt-1.5">{subtitle}</p>
      )}

      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-accent-blue/[0.03] to-transparent" />
    </div>
  );
}

export default StatCard;
