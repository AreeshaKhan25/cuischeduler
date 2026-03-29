"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { AlgorithmTabs } from "@/components/scheduler/AlgorithmTabs";
import { BookingRequestForm } from "@/components/scheduler/BookingRequestForm";
import { ProcessReadyQueue } from "@/components/scheduler/ProcessReadyQueue";
import { AlgorithmBadge } from "@/components/ui/AlgorithmBadge";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { useScheduler } from "@/hooks/useScheduler";
import { cn } from "@/lib/utils";
import { Play, GitCompareArrows, RotateCw, Loader2 } from "lucide-react";

const GanttVisualizer = dynamic(() => import("@/components/scheduler/GanttVisualizer").then(m => m.GanttVisualizer), { ssr: false });
const AlgorithmTraceLog = dynamic(() => import("@/components/scheduler/AlgorithmTraceLog").then(m => m.AlgorithmTraceLog), { ssr: false });
const MetricsRow = dynamic(() => import("@/components/scheduler/MetricsRow").then(m => m.MetricsRow), { ssr: false });
const AlgorithmComparison = dynamic(() => import("@/components/scheduler/AlgorithmComparison").then(m => m.AlgorithmComparison), { ssr: false });

const PAGE_OS_CONCEPTS = [
  OS_CONCEPTS.FCFS,
  OS_CONCEPTS.SJF,
  OS_CONCEPTS.ROUND_ROBIN,
  OS_CONCEPTS.PRIORITY,
  OS_CONCEPTS.PCB,
  OS_CONCEPTS.CONTEXT_SWITCH,
];

export default function SchedulerPage() {
  const {
    bookingQueue,
    schedulingResult,
    comparison,
    selectedAlgorithm,
    isRunning,
    runAlgorithm,
    compareAll,
    reset,
    fetchQueue,
  } = useScheduler();

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-[1440px] mx-auto px-6 py-8 space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PageHeader
            title="Scheduling Engine"
            subtitle="CPU scheduling algorithms applied to university resource booking -- experience FCFS, SJF, Round Robin, and Priority scheduling in action."
            breadcrumb={["CUIScheduler", "Modules", "Scheduling Engine"]}
            osConcepts={PAGE_OS_CONCEPTS}
          />
        </motion.div>

        {/* Algorithm Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <AlgorithmTabs />
        </motion.div>

        {/* Split Layout: Form + Queue */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-6"
        >
          <div className="lg:col-span-2">
            <BookingRequestForm />
          </div>
          <div className="lg:col-span-3">
            <ProcessReadyQueue />
          </div>
        </motion.div>

        {/* Controls Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-border bg-bg-secondary"
        >
          <div className="flex items-center gap-2 mr-auto">
            <span className="text-[13px] font-medium text-text-secondary">
              Selected:
            </span>
            <AlgorithmBadge algorithm={selectedAlgorithm} />
            <span className="text-[12px] font-mono text-text-tertiary">
              | {bookingQueue.length} process{bookingQueue.length !== 1 ? "es" : ""} in queue
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={runAlgorithm}
            disabled={isRunning || bookingQueue.length === 0}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg",
              "bg-accent-blue text-white font-medium text-[13px]",
              "shadow-blue-glow hover:bg-accent-blue/90",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "transition-all duration-200"
            )}
          >
            {isRunning ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Play size={16} />
            )}
            Run {selectedAlgorithm}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={compareAll}
            disabled={isRunning || bookingQueue.length === 0}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg",
              "bg-accent-teal text-white font-medium text-[13px]",
              "shadow-teal-glow hover:bg-accent-teal/90",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "transition-all duration-200"
            )}
          >
            <GitCompareArrows size={16} />
            Compare All
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={reset}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg",
              "border border-border bg-bg-primary text-text-secondary font-medium text-[13px]",
              "hover:border-border-light hover:text-text-primary",
              "transition-all duration-200"
            )}
          >
            <RotateCw size={16} />
            Reset
          </motion.button>
        </motion.div>

        {/* Results Section - only shown after running */}
        {schedulingResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* OS Concept Summary */}
            <div className="p-4 rounded-xl border border-os-border/30 bg-os-bg/20">
              <div className="flex items-start gap-3">
                <OSConceptBadge
                  concept={`${schedulingResult.algorithm} Result`}
                  chapter="Ch.5"
                  size="md"
                  pulse
                />
                <p className="text-[13px] text-text-secondary leading-relaxed pt-0.5">
                  {schedulingResult.os_concept_summary}
                </p>
              </div>
            </div>

            {/* Metrics Row */}
            <MetricsRow />

            {/* Gantt Chart */}
            <GanttVisualizer />

            {/* Algorithm Trace Log */}
            <AlgorithmTraceLog />
          </motion.div>
        )}

        {/* Comparison Section */}
        {comparison && comparison.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <AlgorithmComparison />
          </motion.div>
        )}

        {/* Footer note */}
        <div className="text-center py-6 border-t border-border/30">
          <p className="text-[11px] font-mono text-text-tertiary">
            CUIScheduler -- CPU Scheduling Algorithms applied to University Resource Management
          </p>
          <p className="text-[10px] font-mono text-text-tertiary/60 mt-1">
            Operating Systems Concepts (Silberschatz, Galvin, Gagne) -- Chapter 5: CPU Scheduling
          </p>
        </div>
      </div>
    </div>
  );
}
