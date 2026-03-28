"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { useResources } from "@/hooks/useResources";

export function FragmentationBar() {
  const { poolState, compact, isCompacting } = useResources();
  const [showBefore, setShowBefore] = useState(true);
  const [beforeBitmap, setBeforeBitmap] = useState<boolean[] | null>(null);

  if (!poolState) return null;

  const handleCompact = async () => {
    setBeforeBitmap([...poolState.bitmap]);
    setShowBefore(true);
    await compact();
    // After compaction, show the "after" state
    setTimeout(() => setShowBefore(false), 500);
  };

  const bitmapToRender = poolState.bitmap;

  // Compute fragmentation segments for visual bar
  const computeSegments = (bitmap: boolean[]) => {
    const segments: { allocated: boolean; length: number }[] = [];
    let current = bitmap[0];
    let count = 1;
    for (let i = 1; i < bitmap.length; i++) {
      if (bitmap[i] === current) {
        count++;
      } else {
        segments.push({ allocated: current, length: count });
        current = bitmap[i];
        count = 1;
      }
    }
    segments.push({ allocated: current, length: count });
    return segments;
  };

  const segments = computeSegments(bitmapToRender);
  const beforeSegments = beforeBitmap ? computeSegments(beforeBitmap) : null;

  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shuffle size={18} className="text-warning" />
          <h3 className="text-[15px] font-semibold text-text-primary">
            External Fragmentation
          </h3>
          <OSConceptBadge
            concept={OS_CONCEPTS.FRAGMENTATION.name}
            chapter={OS_CONCEPTS.FRAGMENTATION.chapter}
            description={OS_CONCEPTS.FRAGMENTATION.description}
            size="sm"
          />
        </div>

        {/* Fragmentation Percentage */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className={cn(
              "text-2xl font-display font-bold",
              poolState.fragmentation_pct > 30 ? "text-danger" :
              poolState.fragmentation_pct > 15 ? "text-warning" : "text-success"
            )}>
              {poolState.fragmentation_pct.toFixed(1)}%
            </div>
            <div className="text-[11px] font-mono text-text-tertiary uppercase">Fragmentation</div>
          </div>

          <button
            onClick={handleCompact}
            disabled={isCompacting || poolState.fragmentation_pct === 0}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium",
              "transition-all duration-200",
              poolState.fragmentation_pct === 0
                ? "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
                : "bg-accent-blue/10 text-accent-blue border border-accent-blue/30 hover:bg-accent-blue/20"
            )}
          >
            {isCompacting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Shuffle size={14} />
            )}
            {isCompacting ? "Compacting..." : "Compact Schedule"}
          </button>
        </div>
      </div>

      {/* Before/After Comparison */}
      {beforeBitmap && beforeSegments && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-mono text-text-tertiary uppercase tracking-wider">
            <span>Before Compaction</span>
          </div>
          <SegmentBar segments={beforeSegments} total={poolState.total_slots} label="before" />

          <div className="flex justify-center">
            <ArrowRight size={16} className="text-accent-blue animate-pulse" />
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-text-tertiary uppercase tracking-wider">
            <span>After Compaction</span>
          </div>
        </div>
      )}

      {/* Current / After Fragmentation Bar */}
      <SegmentBar segments={segments} total={poolState.total_slots} label="current" />

      {/* Explanation */}
      <div className="p-3 rounded-lg bg-bg-primary border border-border">
        <p className="text-[12px] text-text-secondary leading-relaxed">
          <span className="text-os-text font-mono font-medium">External fragmentation</span> occurs when
          free time slots are scattered between allocated blocks. Like OS memory compaction, the
          &quot;Compact Schedule&quot; operation consolidates bookings to create contiguous free blocks,
          reducing fragmentation from{" "}
          <span className="font-mono text-warning">
            {beforeBitmap ? `${computeFragPct(beforeBitmap).toFixed(1)}%` : `${poolState.fragmentation_pct.toFixed(1)}%`}
          </span>{" "}
          to{" "}
          <span className="font-mono text-success">{poolState.fragmentation_pct.toFixed(1)}%</span>.
        </p>
      </div>
    </div>
  );
}

function computeFragPct(bitmap: boolean[]): number {
  const allocated = bitmap.filter(Boolean).length;
  const free = bitmap.length - allocated;
  if (free === 0) return 0;
  let freeBlocks = 0;
  let inFree = false;
  for (const bit of bitmap) {
    if (!bit && !inFree) { freeBlocks++; inFree = true; }
    if (bit) inFree = false;
  }
  return freeBlocks > 1 ? ((freeBlocks - 1) / free) * 100 : 0;
}

function SegmentBar({
  segments,
  total,
  label,
}: {
  segments: { allocated: boolean; length: number }[];
  total: number;
  label: string;
}) {
  return (
    <div className="flex w-full h-8 rounded-lg overflow-hidden border border-border">
      {segments.map((seg, i) => (
        <motion.div
          key={`${label}-${i}`}
          initial={{ width: 0 }}
          animate={{ width: `${(seg.length / total) * 100}%` }}
          transition={{ duration: 0.5, delay: i * 0.03 }}
          className={cn(
            "h-full flex items-center justify-center text-[9px] font-mono",
            "border-r border-border/30 last:border-r-0",
            seg.allocated
              ? "bg-danger/60 text-white/70"
              : "bg-success/40 text-white/50"
          )}
        >
          {seg.length > 2 && seg.length}
        </motion.div>
      ))}
    </div>
  );
}

export default FragmentationBar;
