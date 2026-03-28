"use client";

import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { useResources } from "@/hooks/useResources";
import { HardDrive, Square, SquareCheck } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = ["8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM"];

export function MemoryBitmap() {
  const { poolState } = useResources();

  if (!poolState) return null;

  // Reshape bitmap into 2D grid (days x hours) for visualization
  // We'll use the flat bitmap but display it as rows of slots
  const COLS = 16;
  const rows = Math.ceil(poolState.bitmap.length / COLS);

  const getSlotInfo = (index: number) => {
    const alloc = poolState.allocation_map.find((a) => a.slot === index);
    return alloc;
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <OSConceptBadge
        concept={OS_CONCEPTS.MEMORY_BITMAP.name}
        chapter={OS_CONCEPTS.MEMORY_BITMAP.chapter}
        description={OS_CONCEPTS.MEMORY_BITMAP.description}
        position="banner"
        size="md"
      />

      <div className="rounded-xl border border-border bg-bg-secondary p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive size={18} className="text-accent-blue" />
            <h3 className="text-[15px] font-semibold text-text-primary">
              Resource Pool Bitmap
            </h3>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-danger" />
              <span className="text-[11px] text-text-tertiary">Allocated</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-success" />
              <span className="text-[11px] text-text-tertiary">Free</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-warning" />
              <span className="text-[11px] text-text-tertiary">Reserved</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-bg-tertiary border border-border text-center">
            <div className="text-[22px] font-display font-bold text-text-primary">
              {poolState.total_slots}
            </div>
            <div className="text-[11px] font-mono text-text-tertiary uppercase">Total Slots</div>
          </div>
          <div className="p-3 rounded-lg bg-danger-soft border border-danger/20 text-center">
            <div className="text-[22px] font-display font-bold text-danger">
              {poolState.allocated_slots}
            </div>
            <div className="text-[11px] font-mono text-text-tertiary uppercase">Allocated</div>
          </div>
          <div className="p-3 rounded-lg bg-success-soft border border-success/20 text-center">
            <div className="text-[22px] font-display font-bold text-success">
              {poolState.free_slots}
            </div>
            <div className="text-[11px] font-mono text-text-tertiary uppercase">Free</div>
          </div>
        </div>

        {/* Bitmap Grid */}
        <Tooltip.Provider delayDuration={100}>
          <div className="space-y-1">
            {Array.from({ length: rows }, (_, rowIdx) => (
              <div key={rowIdx} className="flex gap-1 justify-center">
                {Array.from({ length: COLS }, (_, colIdx) => {
                  const idx = rowIdx * COLS + colIdx;
                  if (idx >= poolState.bitmap.length) return null;
                  const isAllocated = poolState.bitmap[idx];
                  const slotInfo = getSlotInfo(idx);

                  return (
                    <Tooltip.Root key={idx}>
                      <Tooltip.Trigger asChild>
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.15, delay: idx * 0.005 }}
                          className={cn(
                            "w-5 h-5 rounded-[3px] cursor-pointer transition-all duration-150",
                            "hover:scale-125 hover:z-10 relative",
                            isAllocated
                              ? "bg-danger/80 border border-danger/40 shadow-sm shadow-danger/20"
                              : "bg-success/60 border border-success/30"
                          )}
                        >
                          <span className="absolute inset-0 flex items-center justify-center text-[7px] font-mono text-white/60">
                            {idx}
                          </span>
                        </motion.div>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          side="top"
                          sideOffset={6}
                          className="z-[9999] rounded-lg border px-3 py-2 bg-bg-secondary border-border shadow-lg animate-in fade-in-0 zoom-in-95 duration-100"
                        >
                          <div className="space-y-1">
                            <div className="text-[12px] font-mono text-text-primary">
                              Slot #{idx} — {isAllocated ? "ALLOCATED" : "FREE"}
                            </div>
                            {slotInfo && (
                              <div className="text-[11px] text-text-secondary">
                                {slotInfo.resource_name} (Booking: {slotInfo.booking_id})
                              </div>
                            )}
                            <div className="text-[10px] font-mono text-os-text">
                              bitmap[{idx}] = {isAllocated ? "1" : "0"}
                            </div>
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
        </Tooltip.Provider>

        {/* Binary representation */}
        <div className="p-3 rounded-lg bg-bg-primary border border-border font-mono text-[10px] text-text-tertiary leading-relaxed overflow-x-auto">
          <span className="text-text-secondary">bitmap[] = </span>
          {poolState.bitmap.slice(0, 40).map((b, i) => (
            <span key={i} className={cn(b ? "text-danger" : "text-success")}>
              {b ? "1" : "0"}
            </span>
          ))}
          <span className="text-text-tertiary">...</span>
        </div>
      </div>
    </div>
  );
}

export default MemoryBitmap;
