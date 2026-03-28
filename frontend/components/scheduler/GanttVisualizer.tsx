"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { GlowCard } from "@/components/ui/GlowCard";
import { useScheduler } from "@/hooks/useScheduler";
import { cn } from "@/lib/utils";

interface GanttVisualizerProps {
  className?: string;
}

// Custom tooltip for the Gantt chart
function GanttTooltip({ active, payload }: { active?: boolean; payload?: unknown[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const data = (payload[0] as { payload: Record<string, unknown> })?.payload;
  if (!data) return null;

  return (
    <div className="rounded-lg border border-border bg-bg-secondary p-3 shadow-lg max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-sm"
          style={{ backgroundColor: data.color as string }}
        />
        <span className="font-mono text-[13px] font-semibold text-text-primary">
          {data.pid as string}
        </span>
      </div>
      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between gap-4">
          <span className="text-text-tertiary">Label</span>
          <span className="text-text-primary font-medium">{data.label as string}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-text-tertiary">Start</span>
          <span className="font-mono text-text-primary">t={data.start as number}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-text-tertiary">End</span>
          <span className="font-mono text-text-primary">t={data.end as number}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-text-tertiary">Duration</span>
          <span className="font-mono text-accent-teal">{(data.end as number) - (data.start as number)} units</span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-border/50">
        <p className="text-[10px] font-mono text-os-text bg-os-bg/50 px-2 py-1 rounded">
          Each bar = CPU burst execution in Gantt chart
        </p>
      </div>
    </div>
  );
}

export function GanttVisualizer({ className }: GanttVisualizerProps) {
  const { schedulingResult, selectedAlgorithm } = useScheduler();

  // Transform gantt_chart data for Recharts horizontal bar representation
  const { chartData, maxTime, contextSwitchTimes, uniquePids } = useMemo(() => {
    if (!schedulingResult?.gantt_chart || schedulingResult.gantt_chart.length === 0) {
      return { chartData: [], maxTime: 0, contextSwitchTimes: [], uniquePids: [] };
    }

    const gantt = schedulingResult.gantt_chart;
    const max = Math.max(...gantt.map((g) => g.end));
    const pids = [...new Set(gantt.map((g) => g.pid))];

    // Build chart data: each segment as a row
    const data = gantt.map((bar, i) => ({
      ...bar,
      index: i,
      // For the stacked-like horizontal view, we use offset + duration
      offset: bar.start,
      duration: bar.end - bar.start,
    }));

    // Context switch times (where RR preemption happens)
    const csTimes: number[] = [];
    if (selectedAlgorithm === "RR") {
      for (let i = 1; i < gantt.length; i++) {
        if (gantt[i].pid !== gantt[i - 1].pid) {
          csTimes.push(gantt[i].start);
        }
      }
    }

    return { chartData: data, maxTime: max, contextSwitchTimes: csTimes, uniquePids: pids };
  }, [schedulingResult, selectedAlgorithm]);

  if (!schedulingResult) {
    return (
      <GlowCard glowColor="blue" className={cn("relative", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-display font-bold text-text-primary">
            Gantt Chart
          </h3>
          <OSConceptBadge
            concept="CPU Gantt Chart"
            description="Visual timeline showing which process occupies the CPU at each time unit."
            chapter="Ch.5"
            size="sm"
            pulse={false}
          />
        </div>
        <div className="flex items-center justify-center h-48 text-text-tertiary">
          <p className="text-[13px]">Run an algorithm to see the Gantt chart</p>
        </div>
      </GlowCard>
    );
  }

  return (
    <GlowCard glowColor="blue" className={cn("relative", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-display font-bold text-text-primary">
          Gantt Chart
        </h3>
        <OSConceptBadge
          concept="CPU Gantt Chart"
          description="Visual timeline showing which process occupies the CPU at each time unit."
          chapter="Ch.5"
          size="sm"
          pulse={false}
        />
      </div>

      {/* Timeline visualization */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Gantt bars - custom rendering for proper Gantt look */}
          <div className="space-y-1.5 mb-4">
            {uniquePids.map((pid, pidIdx) => {
              const bars = chartData.filter((d) => d.pid === pid);
              return (
                <div key={pid} className="flex items-center gap-3">
                  {/* PID label */}
                  <div className="w-16 shrink-0 text-right">
                    <span className="font-mono text-[11px] text-text-secondary font-medium">
                      {pid}
                    </span>
                  </div>
                  {/* Timeline track */}
                  <div className="flex-1 relative h-9 bg-bg-primary rounded border border-border/50">
                    {bars.map((bar, barIdx) => {
                      const leftPct = (bar.start / maxTime) * 100;
                      const widthPct = ((bar.end - bar.start) / maxTime) * 100;
                      return (
                        <motion.div
                          key={`${bar.pid}-${barIdx}`}
                          initial={{ scaleX: 0, opacity: 0 }}
                          animate={{ scaleX: 1, opacity: 1 }}
                          transition={{
                            duration: 0.4,
                            delay: bar.index * 0.08,
                            ease: "easeOut",
                          }}
                          style={{
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                            backgroundColor: bar.color,
                            originX: 0,
                          }}
                          className="absolute top-1 bottom-1 rounded-sm cursor-pointer hover:brightness-110 transition-all group/bar"
                        >
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white/90 truncate px-1">
                            {bar.end - bar.start > (maxTime * 0.06) ? `${bar.end - bar.start}` : ""}
                          </span>
                          {/* Hover tooltip inline */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/bar:block z-20">
                            <div className="rounded border border-border bg-bg-secondary px-2 py-1 shadow-lg whitespace-nowrap">
                              <span className="text-[10px] font-mono text-text-primary">
                                {bar.pid}: t={bar.start} - t={bar.end}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* Context switch markers */}
                    {contextSwitchTimes.map((t, i) => {
                      const leftPct = (t / maxTime) * 100;
                      return (
                        <div
                          key={`cs-${i}`}
                          className="absolute top-0 bottom-0 w-px border-l border-dashed border-danger/50"
                          style={{ left: `${leftPct}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time axis */}
          <div className="flex items-center gap-3">
            <div className="w-16 shrink-0" />
            <div className="flex-1 relative h-6">
              {/* Tick marks */}
              {Array.from({ length: Math.min(Math.ceil(maxTime / (maxTime > 100 ? 20 : maxTime > 50 ? 10 : 5)) + 1, 20) }, (_, i) => {
                const step = maxTime > 100 ? 20 : maxTime > 50 ? 10 : 5;
                const t = i * step;
                if (t > maxTime) return null;
                const leftPct = (t / maxTime) * 100;
                return (
                  <span
                    key={t}
                    className="absolute text-[9px] font-mono text-text-tertiary -translate-x-1/2"
                    style={{ left: `${leftPct}%` }}
                  >
                    {t}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Context switch legend */}
          {selectedAlgorithm === "RR" && contextSwitchTimes.length > 0 && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-px border-t border-dashed border-danger" />
                <span className="text-[10px] font-mono text-text-tertiary">
                  Context Switch
                </span>
              </div>
              <OSConceptBadge
                concept={OS_CONCEPTS.CONTEXT_SWITCH.name}
                chapter={OS_CONCEPTS.CONTEXT_SWITCH.chapter}
                description={OS_CONCEPTS.CONTEXT_SWITCH.description}
                size="sm"
                pulse={false}
              />
            </div>
          )}

          {/* Color legend */}
          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-border/50">
            {schedulingResult.gantt_chart
              .filter(
                (bar, i, arr) => arr.findIndex((b) => b.pid === bar.pid) === i
              )
              .map((bar) => (
                <div key={bar.pid} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: bar.color }}
                  />
                  <span className="text-[10px] font-mono text-text-secondary">
                    {bar.pid}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </GlowCard>
  );
}

export default GanttVisualizer;
