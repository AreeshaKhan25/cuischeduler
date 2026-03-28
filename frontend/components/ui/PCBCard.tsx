"use client";

import { cn } from "@/lib/utils";
import { ProcessStateChip } from "./ProcessStateChip";
import { Clock, Hash, Layers, Timer, Hourglass } from "lucide-react";

interface PCBCardProps {
  processId: number | string;
  title: string;
  courseCode?: string;
  burstTime: number;
  priority: number;
  state: string;
  arrivalTime: number;
  waitingTime?: number;
  className?: string;
}

function DataRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-1.5 text-text-tertiary">
        <Icon size={12} />
        <span className="text-[11px] uppercase tracking-wider">{label}</span>
      </div>
      <span className="font-mono text-[12px] text-text-primary font-medium">
        {value}
      </span>
    </div>
  );
}

export function PCBCard({
  processId,
  title,
  courseCode,
  burstTime,
  priority,
  state,
  arrivalTime,
  waitingTime,
  className,
}: PCBCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-bg-secondary p-4",
        "hover:border-border-light hover:bg-bg-tertiary transition-all duration-200",
        "group",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-text-tertiary bg-bg-primary px-1.5 py-0.5 rounded">
              PID:{processId}
            </span>
            {courseCode && (
              <span className="font-mono text-[10px] text-accent-blue bg-accent-blue-soft px-1.5 py-0.5 rounded">
                {courseCode}
              </span>
            )}
          </div>
          <h4 className="text-sm font-medium text-text-primary leading-tight">
            {title}
          </h4>
        </div>
        <ProcessStateChip state={state} size="sm" />
      </div>

      {/* PCB Data Fields */}
      <div className="space-y-0.5 border-t border-border/50 pt-2">
        <DataRow icon={Clock} label="Arrival" value={arrivalTime} />
        <DataRow icon={Timer} label="Burst" value={`${burstTime}ms`} />
        <DataRow icon={Layers} label="Priority" value={priority} />
        <DataRow icon={Hash} label="PID" value={processId} />
        {waitingTime !== undefined && (
          <DataRow icon={Hourglass} label="Wait" value={`${waitingTime}ms`} />
        )}
      </div>
    </div>
  );
}

export default PCBCard;
