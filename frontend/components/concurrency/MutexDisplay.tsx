"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MutexState } from "@/types";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { cn } from "@/lib/utils";
import { Lock, Unlock, User, Clock, Users } from "lucide-react";

interface MutexDisplayProps {
  mutexes: MutexState[];
  className?: string;
}

export function MutexDisplay({ mutexes, className }: MutexDisplayProps) {
  const [heldDurations, setHeldDurations] = useState<Record<string, number>>({});

  // Simulate held duration counter for locked mutexes
  useEffect(() => {
    const interval = setInterval(() => {
      setHeldDurations((prev) => {
        const next = { ...prev };
        mutexes.forEach((m) => {
          if (m.locked) {
            next[m.id] = (next[m.id] || 0) + 1;
          } else {
            next[m.id] = 0;
          }
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mutexes]);

  if (mutexes.length === 0) {
    return (
      <div className={cn("rounded-xl border border-border bg-bg-secondary p-5", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold text-text-primary">Mutex Locks</h3>
          <OSConceptBadge
            concept={OS_CONCEPTS.MUTEX.name}
            chapter={OS_CONCEPTS.MUTEX.chapter}
            description={OS_CONCEPTS.MUTEX.description}
            size="sm"
            pulse={false}
          />
        </div>
        <div className="flex items-center justify-center h-36 text-text-tertiary text-[13px]">
          No mutex data loaded
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-xl border border-border bg-bg-secondary p-5 space-y-4", className)}>
      {/* OS Badge */}
      <OSConceptBadge
        concept={OS_CONCEPTS.MUTEX.name}
        chapter={OS_CONCEPTS.MUTEX.chapter}
        description={OS_CONCEPTS.MUTEX.description}
        size="sm"
        position="corner"
        pulse={false}
      />

      <h3 className="text-[14px] font-semibold text-text-primary">Mutex Locks</h3>

      <div className="space-y-3">
        {mutexes.map((mutex) => {
          const duration = heldDurations[mutex.id] || 0;
          // Simulate a timeline bar width based on duration
          const timelineWidth = Math.min(100, duration * 5);

          return (
            <motion.div
              key={mutex.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-border/60 bg-bg-primary/50 p-4 space-y-3"
            >
              {/* Resource Name + State Bar */}
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-text-primary">{mutex.resource_name}</span>
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono text-[11px] font-bold uppercase tracking-wider",
                  mutex.locked
                    ? "bg-danger/10 border-danger/30 text-danger"
                    : "bg-success/10 border-success/30 text-success"
                )}>
                  {mutex.locked ? <Lock size={12} /> : <Unlock size={12} />}
                  {mutex.locked ? "LOCKED" : "UNLOCKED"}
                </div>
              </div>

              {/* Owner + Duration */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <User size={12} className="text-text-tertiary" />
                  <span className="text-[11px] font-mono text-text-secondary">
                    Owner: {mutex.owner_pid ? (
                      <span className="font-bold text-accent-blue">{mutex.owner_pid}</span>
                    ) : (
                      <span className="text-text-tertiary italic">none</span>
                    )}
                  </span>
                </div>
                {mutex.locked && (
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-text-tertiary" />
                    <span className="text-[11px] font-mono text-text-secondary">
                      Held: <span className="text-warning font-bold">{duration}s</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Waiters */}
              {mutex.wait_queue.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users size={12} className="text-text-tertiary flex-shrink-0" />
                  <span className="text-[10px] font-mono text-text-tertiary uppercase">Waiters:</span>
                  <div className="flex gap-1.5">
                    {mutex.wait_queue.map((pid) => (
                      <span
                        key={pid}
                        className="px-2 py-0.5 rounded-md bg-warning/10 border border-warning/25 text-[11px] font-mono font-semibold text-warning"
                      >
                        {pid}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline Bar */}
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider">Lock Timeline</span>
                <div className="h-3 rounded-full bg-bg-tertiary border border-border/50 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${timelineWidth}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full transition-colors duration-300",
                      mutex.locked
                        ? "bg-gradient-to-r from-danger/80 to-danger"
                        : "bg-gradient-to-r from-success/80 to-success"
                    )}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-text-tertiary">
                  <span>0s</span>
                  <span>{mutex.locked ? `${duration}s held` : "released"}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default MutexDisplay;
