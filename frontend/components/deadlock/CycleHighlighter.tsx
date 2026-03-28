"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface CycleHighlighterProps {
  cycleDescription: string;
  cycleNodes: string[];
  visible: boolean;
  className?: string;
}

export function CycleHighlighter({ cycleDescription, cycleNodes, visible, className }: CycleHighlighterProps) {
  if (!visible || cycleNodes.length === 0) return null;

  // Parse cycle description or build from nodes
  const cyclePath = cycleDescription || cycleNodes.join(" -> ") + " -> " + cycleNodes[0];
  const segments = cyclePath.split(" -> ");

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "rounded-xl border border-danger/30 bg-danger/5 p-4 space-y-3",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-danger/15 flex items-center justify-center">
              <RotateCcw size={14} className="text-danger" />
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-danger">Circular Wait Detected</h4>
              <p className="text-[11px] text-text-tertiary">Coffman Condition #4 satisfied</p>
            </div>
          </div>

          {/* Cycle Path Visualization */}
          <div className="flex items-center gap-1 flex-wrap px-2 py-3 rounded-lg bg-bg-primary/60 border border-danger/20">
            {segments.map((seg, i) => {
              const trimmed = seg.trim();
              const isProcess = trimmed.startsWith("P");
              const isLast = i === segments.length - 1;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-1"
                >
                  <span
                    className={cn(
                      "px-2 py-1 rounded font-mono text-[12px] font-bold",
                      isProcess
                        ? "bg-danger/15 text-danger border border-danger/30"
                        : "bg-warning/15 text-warning border border-warning/30"
                    )}
                  >
                    {trimmed}
                  </span>
                  {!isLast && (
                    <span className="text-danger font-mono text-[14px] font-bold mx-0.5">
                      &rarr;
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Explanation */}
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-bg-primary/40">
            <AlertTriangle size={14} className="text-warning mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Each process in the cycle holds a resource requested by the next process, forming an
              unbreakable circular dependency. The system cannot progress without external intervention
              (preemption, termination, or rollback).
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CycleHighlighter;
