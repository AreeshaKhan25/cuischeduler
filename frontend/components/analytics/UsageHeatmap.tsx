"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 16 }, (_, i) => {
  const h = i + 7;
  return h < 12 ? `${h}AM` : h === 12 ? "12PM" : `${h - 12}PM`;
});

interface UsageHeatmapProps {
  data: number[][]; // 7 rows x 16 cols
}

export function UsageHeatmap({ data }: UsageHeatmapProps) {
  // Find max for normalization
  const maxVal = Math.max(...data.flat(), 1);

  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-text-primary">
          Usage Heatmap
        </h3>
        <OSConceptBadge
          concept="Memory Access Patterns"
          chapter="Ch.8"
          description="Booking density mirrors memory access patterns. Peak hours show temporal locality."
          size="sm"
        />
      </div>

      <Tooltip.Provider delayDuration={100}>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Column Headers */}
            <div className="grid grid-cols-[50px_repeat(16,1fr)] gap-[2px] mb-[2px]">
              <div />
              {HOURS.map((h) => (
                <div key={h} className="text-center text-[9px] font-mono text-text-tertiary py-1">
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            {DAYS.map((day, dayIdx) => (
              <div
                key={day}
                className="grid grid-cols-[50px_repeat(16,1fr)] gap-[2px] mb-[2px]"
              >
                {/* Row Header */}
                <div className="flex items-center justify-end pr-2 text-[11px] font-mono text-text-tertiary">
                  {day}
                </div>

                {/* Cells */}
                {HOURS.map((hour, hourIdx) => {
                  const value = data[dayIdx]?.[hourIdx] ?? 0;
                  const intensity = value / maxVal;

                  return (
                    <Tooltip.Root key={`${dayIdx}-${hourIdx}`}>
                      <Tooltip.Trigger asChild>
                        <div
                          className={cn(
                            "aspect-square rounded-[3px] cursor-pointer transition-all duration-150",
                            "hover:scale-110 hover:z-10 border",
                            value === 0
                              ? "bg-bg-tertiary border-transparent"
                              : "border-accent-teal/20"
                          )}
                          style={{
                            backgroundColor: value > 0
                              ? `rgba(45, 212, 191, ${Math.max(0.1, intensity * 0.85)})`
                              : undefined,
                          }}
                        />
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          side="top"
                          sideOffset={6}
                          className="z-[9999] rounded-lg border px-3 py-2 bg-bg-secondary border-border shadow-lg animate-in fade-in-0 zoom-in-95 duration-100"
                        >
                          <div className="text-[12px] text-text-primary font-medium">
                            {day} at {hour}
                          </div>
                          <div className="text-[11px] text-text-secondary">
                            {value} booking{value !== 1 ? "s" : ""}
                          </div>
                          <Tooltip.Arrow className="fill-bg-secondary" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Tooltip.Provider>

      {/* Color Scale */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-[10px] text-text-tertiary">Less</span>
        <div className="flex gap-[2px]">
          {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((opacity, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-[2px]"
              style={{ backgroundColor: `rgba(45, 212, 191, ${opacity})` }}
            />
          ))}
        </div>
        <span className="text-[10px] text-text-tertiary">More</span>
      </div>
    </div>
  );
}

export default UsageHeatmap;
