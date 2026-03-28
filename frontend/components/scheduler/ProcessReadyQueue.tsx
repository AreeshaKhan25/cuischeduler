"use client";

import { motion, AnimatePresence } from "framer-motion";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { PCBCard } from "@/components/ui/PCBCard";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { GlowCard } from "@/components/ui/GlowCard";
import { useScheduler } from "@/hooks/useScheduler";
import { cn } from "@/lib/utils";
import { Inbox, GripVertical, Trash2 } from "lucide-react";

interface ProcessReadyQueueProps {
  className?: string;
}

export function ProcessReadyQueue({ className }: ProcessReadyQueueProps) {
  const { bookingQueue, removeFromQueue, selectedAlgorithm } = useScheduler();

  // Sort display based on selected algorithm
  const sortedQueue = [...bookingQueue].sort((a, b) => {
    switch (selectedAlgorithm) {
      case "SJF":
        return a.duration_minutes - b.duration_minutes;
      case "PRIORITY":
        return b.priority - a.priority;
      case "FCFS":
      default:
        return a.arrival_time - b.arrival_time;
    }
  });

  const sortLabel = {
    FCFS: "Sorted by Arrival Time",
    SJF: "Sorted by Burst Time (ascending)",
    RR: "Sorted by Arrival Time (Round Robin)",
    PRIORITY: "Sorted by Priority (descending)",
  }[selectedAlgorithm];

  return (
    <GlowCard glowColor="teal" className={cn("flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-[16px] font-display font-bold text-text-primary">
            Process Ready Queue
          </h3>
          <OSConceptBadge
            concept={OS_CONCEPTS.PROCESS_STATES.name}
            chapter={OS_CONCEPTS.PROCESS_STATES.chapter}
            description={OS_CONCEPTS.PROCESS_STATES.description}
            size="sm"
            pulse={false}
          />
        </div>
        <span className="text-[11px] font-mono text-text-tertiary bg-bg-primary px-2 py-1 rounded">
          {bookingQueue.length} process{bookingQueue.length !== 1 ? "es" : ""}
        </span>
      </div>

      {/* Sort indicator */}
      {bookingQueue.length > 0 && (
        <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-md bg-bg-primary border border-border/50">
          <span className="text-[10px] font-mono text-accent-teal uppercase tracking-wider">
            {sortLabel}
          </span>
        </div>
      )}

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto max-h-[500px] space-y-2 pr-1 scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {sortedQueue.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-text-tertiary"
            >
              <Inbox size={40} className="mb-3 opacity-40" />
              <p className="text-[13px] font-medium">Ready queue is empty</p>
              <p className="text-[11px] mt-1">
                Add booking requests to begin scheduling
              </p>
            </motion.div>
          ) : (
            sortedQueue.map((booking, index) => (
              <motion.div
                key={booking.id}
                layout
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -40, scale: 0.95 }}
                transition={{
                  type: "spring",
                  bounce: 0.15,
                  duration: 0.4,
                  delay: index * 0.05,
                }}
                className="relative group"
              >
                <div className="flex items-start gap-2">
                  {/* Drag Handle */}
                  <div className="flex-shrink-0 mt-4 cursor-grab opacity-0 group-hover:opacity-50 transition-opacity">
                    <GripVertical size={16} className="text-text-tertiary" />
                  </div>

                  {/* Queue Position */}
                  <div className="flex-shrink-0 mt-4 w-6 h-6 rounded-full bg-bg-primary border border-border flex items-center justify-center">
                    <span className="text-[10px] font-mono font-bold text-text-secondary">
                      {index + 1}
                    </span>
                  </div>

                  {/* PCB Card */}
                  <div className="flex-1">
                    <PCBCard
                      processId={booking.process_id}
                      title={booking.title}
                      courseCode={booking.course_code}
                      burstTime={booking.duration_minutes}
                      priority={booking.priority}
                      state={booking.state}
                      arrivalTime={booking.arrival_time}
                      waitingTime={booking.waiting_time}
                    />
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromQueue(booking.id)}
                    className={cn(
                      "flex-shrink-0 mt-4 p-1.5 rounded-md",
                      "opacity-0 group-hover:opacity-100",
                      "text-text-tertiary hover:text-danger hover:bg-danger-soft",
                      "transition-all duration-150"
                    )}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </GlowCard>
  );
}

export default ProcessReadyQueue;
