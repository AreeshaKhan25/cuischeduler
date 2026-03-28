"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SemaphoreState } from "@/types";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Lock, User } from "lucide-react";

interface SemaphoreVisualizerProps {
  semaphore: SemaphoreState | null;
  className?: string;
}

export function SemaphoreVisualizer({ semaphore, className }: SemaphoreVisualizerProps) {
  const [prevCount, setPrevCount] = useState(0);
  const [animateCount, setAnimateCount] = useState(false);

  useEffect(() => {
    if (semaphore && semaphore.count !== prevCount) {
      setAnimateCount(true);
      setPrevCount(semaphore.count);
      const timer = setTimeout(() => setAnimateCount(false), 600);
      return () => clearTimeout(timer);
    }
  }, [semaphore?.count, prevCount, semaphore]);

  if (!semaphore) {
    return (
      <div className={cn("rounded-xl border border-border bg-bg-secondary p-5", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold text-text-primary">Semaphore</h3>
          <OSConceptBadge
            concept={OS_CONCEPTS.SEMAPHORE.name}
            chapter={OS_CONCEPTS.SEMAPHORE.chapter}
            description={OS_CONCEPTS.SEMAPHORE.description}
            size="sm"
            pulse={false}
          />
        </div>
        <div className="flex items-center justify-center h-48 text-text-tertiary text-[13px]">
          No semaphore data loaded
        </div>
      </div>
    );
  }

  const countPositive = semaphore.count > 0;
  const currentProcess = semaphore.history.filter((h) => h.action === "wait").slice(-1)[0]?.pid;

  return (
    <div className={cn("relative rounded-xl border border-border bg-bg-secondary p-5 space-y-5", className)}>
      {/* OS Badge */}
      <OSConceptBadge
        concept={OS_CONCEPTS.SEMAPHORE.name}
        chapter={OS_CONCEPTS.SEMAPHORE.chapter}
        description={OS_CONCEPTS.SEMAPHORE.description}
        size="sm"
        position="corner"
        pulse={false}
      />

      {/* Header */}
      <div>
        <h3 className="text-[14px] font-semibold text-text-primary">{semaphore.resource_name}</h3>
        <p className="text-[11px] text-text-tertiary font-mono">Counting Semaphore (max={semaphore.max_count})</p>
      </div>

      {/* Large Count Display */}
      <div className="flex items-center justify-center">
        <motion.div
          animate={animateCount ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.5 }}
          className={cn(
            "w-28 h-28 rounded-2xl flex flex-col items-center justify-center border-2",
            "font-mono transition-colors duration-500",
            countPositive
              ? "bg-success/10 border-success/40 shadow-success-glow"
              : "bg-danger/10 border-danger/40 shadow-danger-glow"
          )}
        >
          <span className="text-[10px] uppercase tracking-wider text-text-tertiary mb-1">Count</span>
          <span className={cn(
            "text-[40px] font-bold leading-none",
            countPositive ? "text-success" : "text-danger"
          )}>
            {semaphore.count}
          </span>
          <span className="text-[10px] text-text-tertiary mt-1">/ {semaphore.max_count}</span>
        </motion.div>
      </div>

      {/* Operation Arrows */}
      <div className="flex items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-1">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-8 h-8 rounded-lg bg-success/10 border border-success/30 flex items-center justify-center"
          >
            <ArrowDown size={14} className="text-success" />
          </motion.div>
          <span className="text-[10px] font-mono text-success">wait()</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            className="w-8 h-8 rounded-lg bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center"
          >
            <ArrowUp size={14} className="text-accent-teal" />
          </motion.div>
          <span className="text-[10px] font-mono text-accent-teal">signal()</span>
        </div>
      </div>

      {/* Critical Section Box */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Critical Section</span>
        <div className={cn(
          "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed",
          currentProcess
            ? "bg-accent-blue/5 border-accent-blue/30"
            : "bg-bg-primary/50 border-border/50"
        )}>
          <Lock size={14} className={currentProcess ? "text-accent-blue" : "text-text-tertiary"} />
          {currentProcess ? (
            <span className="text-[13px] font-mono font-semibold text-accent-blue">
              {currentProcess} executing
            </span>
          ) : (
            <span className="text-[13px] text-text-tertiary font-mono">EMPTY</span>
          )}
        </div>
      </div>

      {/* Wait Queue */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Wait Queue</span>
          <span className="px-1.5 py-0.5 rounded bg-bg-tertiary text-[10px] font-mono text-text-secondary">
            {semaphore.wait_queue.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {semaphore.wait_queue.length === 0 ? (
              <span className="text-[11px] text-text-tertiary italic">No waiting processes</span>
            ) : (
              semaphore.wait_queue.map((w, i) => (
                <motion.div
                  key={w.process_id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-danger/8 border border-danger/25"
                >
                  <motion.div
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                  >
                    <User size={12} className="text-danger" />
                  </motion.div>
                  <span className="text-[11px] font-mono font-semibold text-danger">{w.process_id}</span>
                  <span className="text-[9px] font-mono text-text-tertiary">
                    {Math.round((Date.now() - w.waiting_since) / 1000)}s
                  </span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default SemaphoreVisualizer;
