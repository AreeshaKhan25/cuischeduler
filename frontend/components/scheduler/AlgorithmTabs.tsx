"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { QuantumSlider } from "./QuantumSlider";
import { cn } from "@/lib/utils";
import type { SchedulingAlgorithm } from "@/types";
import { useScheduler } from "@/hooks/useScheduler";
import { Clock, Zap, RotateCw, ArrowUpDown } from "lucide-react";

const ALGORITHMS: {
  value: SchedulingAlgorithm;
  label: string;
  shortLabel: string;
  description: string;
  concept: (typeof OS_CONCEPTS)[keyof typeof OS_CONCEPTS];
  characteristic: string;
  preemptive: boolean;
  icon: React.ElementType;
}[] = [
  {
    value: "FCFS",
    label: "First Come First Served",
    shortLabel: "FCFS",
    description: "Processes are executed in the order they arrive in the ready queue",
    concept: OS_CONCEPTS.FCFS,
    characteristic: "Non-preemptive",
    preemptive: false,
    icon: Clock,
  },
  {
    value: "SJF",
    label: "Shortest Job First",
    shortLabel: "SJF",
    description: "Process with the smallest burst time is selected next from the ready queue",
    concept: OS_CONCEPTS.SJF,
    characteristic: "Non-preemptive",
    preemptive: false,
    icon: Zap,
  },
  {
    value: "RR",
    label: "Round Robin",
    shortLabel: "RR",
    description: "Each process gets a fixed time quantum; preempted and re-queued on expiry",
    concept: OS_CONCEPTS.ROUND_ROBIN,
    characteristic: "Preemptive",
    preemptive: true,
    icon: RotateCw,
  },
  {
    value: "PRIORITY",
    label: "Priority Scheduling",
    shortLabel: "Priority",
    description: "Process with highest priority number executes first; aging prevents starvation",
    concept: OS_CONCEPTS.PRIORITY,
    characteristic: "Non-preemptive",
    preemptive: false,
    icon: ArrowUpDown,
  },
];

interface AlgorithmTabsProps {
  className?: string;
}

export function AlgorithmTabs({ className }: AlgorithmTabsProps) {
  const { selectedAlgorithm, setAlgorithm, quantum, setQuantum, agingEnabled, setAging } =
    useScheduler();

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs.Root
        value={selectedAlgorithm}
        onValueChange={(v) => setAlgorithm(v as SchedulingAlgorithm)}
      >
        {/* Tab Triggers */}
        <Tabs.List className="flex gap-1 p-1 rounded-xl bg-bg-primary border border-border">
          {ALGORITHMS.map((algo) => {
            const Icon = algo.icon;
            const isActive = selectedAlgorithm === algo.value;
            return (
              <Tabs.Trigger
                key={algo.value}
                value={algo.value}
                className={cn(
                  "relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg",
                  "text-[13px] font-medium transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50",
                  isActive
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-bg-secondary border border-border-light shadow-blue-glow"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon size={16} />
                  <span className="font-mono font-semibold tracking-tight">
                    {algo.shortLabel}
                  </span>
                </span>
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>

        {/* Tab Content */}
        {ALGORITHMS.map((algo) => (
          <Tabs.Content key={algo.value} value={algo.value}>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 rounded-xl border border-border bg-bg-secondary p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-[16px] font-display font-bold text-text-primary">
                      {algo.label}
                    </h3>
                    <OSConceptBadge
                      concept={algo.concept.name}
                      chapter={algo.concept.chapter}
                      description={algo.concept.description}
                      size="sm"
                      pulse={false}
                    />
                  </div>
                  <p className="text-[13px] text-text-secondary leading-relaxed">
                    {algo.description}
                  </p>
                </div>

                <span
                  className={cn(
                    "shrink-0 px-3 py-1 rounded-full text-[11px] font-mono font-semibold tracking-wide border",
                    algo.preemptive
                      ? "bg-warning-soft text-warning border-warning/30"
                      : "bg-accent-blue-soft text-accent-blue border-accent-blue/30"
                  )}
                >
                  {algo.characteristic}
                </span>
              </div>

              {/* Round Robin: Quantum slider */}
              {algo.value === "RR" && (
                <div className="mt-5 pt-4 border-t border-border/50">
                  <QuantumSlider value={quantum} onChange={setQuantum} />
                </div>
              )}

              {/* Priority: Aging toggle */}
              {algo.value === "PRIORITY" && (
                <div className="mt-5 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-text-primary">
                        Aging Mechanism
                      </span>
                      <OSConceptBadge
                        concept="Starvation Prevention"
                        description="Aging increments the priority of waiting processes over time, ensuring no process waits indefinitely."
                        chapter="Ch.5"
                        size="sm"
                        pulse={false}
                      />
                    </div>
                    <button
                      onClick={() => setAging(!agingEnabled)}
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-colors duration-200",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50",
                        agingEnabled
                          ? "bg-accent-teal"
                          : "bg-bg-primary border border-border"
                      )}
                    >
                      <span
                        className={cn(
                          "block w-4 h-4 rounded-full bg-white shadow transition-transform duration-200",
                          agingEnabled ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                  {agingEnabled && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-[12px] text-text-tertiary mt-2"
                    >
                      Processes waiting longer than 2 cycles will have their priority incremented by 1
                      each cycle to prevent starvation.
                    </motion.p>
                  )}
                </div>
              )}
            </motion.div>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </div>
  );
}

export default AlgorithmTabs;
