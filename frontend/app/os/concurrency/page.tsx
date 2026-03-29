"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlowCard } from "@/components/ui/GlowCard";
import { SemaphoreVisualizer } from "@/components/concurrency/SemaphoreVisualizer";
import { MutexDisplay } from "@/components/concurrency/MutexDisplay";
import { RaceConditionDemo } from "@/components/concurrency/RaceConditionDemo";
import { ConcurrentRequestSim } from "@/components/concurrency/ConcurrentRequestSim";
import { OperationLog } from "@/components/concurrency/OperationLog";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { useConcurrency } from "@/hooks/useConcurrency";
import { cn } from "@/lib/utils";
import {
  Play,
  Loader2,
  RotateCcw,
  Zap,
  SlidersHorizontal,
  HardDrive,
} from "lucide-react";

const PAGE_OS_CONCEPTS = [
  OS_CONCEPTS.SEMAPHORE,
  OS_CONCEPTS.MUTEX,
  OS_CONCEPTS.RACE_CONDITION,
];

export default function ConcurrencyPage() {
  const {
    semaphores,
    mutexes,
    simulationLog,
    raceDemo,
    isSimulating,
    concurrentCount,
    selectedResource,
    fetchSemaphores,
    fetchMutexes,
    simulate,
    runRaceDemo,
    setConcurrentCount,
    setSelectedResource,
    reset,
  } = useConcurrency();

  useEffect(() => {
    fetchSemaphores();
    fetchMutexes();
  }, [fetchSemaphores, fetchMutexes]);

  const activeSemaphore = semaphores.find((s) => s.id === selectedResource) || semaphores[0] || null;

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-[1440px] mx-auto px-6 py-8 space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <PageHeader
            title="Concurrency Monitor"
            subtitle="Visualize semaphores, mutexes, and race conditions in real-time. See how OS synchronization primitives protect shared resources."
            osConcepts={PAGE_OS_CONCEPTS}
            breadcrumb={["CUIScheduler", "OS Concepts", "Concurrency Control"]}
          />
        </motion.div>

        {/* Controls Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4 flex-wrap p-4 rounded-xl border border-border bg-bg-secondary"
        >
          {/* Resource Selector */}
          <div className="flex items-center gap-2">
            <HardDrive size={14} className="text-text-tertiary" />
            <span className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider">Resource:</span>
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-bg-primary border border-border text-[12px] font-mono text-text-primary outline-none focus:border-accent-blue transition-colors"
            >
              {semaphores.map((s) => (
                <option key={s.id} value={s.id}>{s.resource_name}</option>
              ))}
              {semaphores.length === 0 && <option value="">No resources</option>}
            </select>
          </div>

          {/* Concurrent Count Slider */}
          <div className="flex items-center gap-3">
            <SlidersHorizontal size={14} className="text-text-tertiary" />
            <span className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider">
              Concurrent Requests:
            </span>
            <input
              type="range"
              min={2}
              max={10}
              value={concurrentCount}
              onChange={(e) => setConcurrentCount(parseInt(e.target.value))}
              className="w-28 accent-accent-blue"
            />
            <span className="text-[14px] font-mono font-bold text-accent-blue w-6 text-center">
              {concurrentCount}
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => simulate(selectedResource, concurrentCount)}
              disabled={isSimulating || semaphores.length === 0}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-[13px] transition-all",
                "bg-accent-blue text-white hover:bg-accent-blue/90",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "shadow-blue-glow"
              )}
            >
              {isSimulating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Play size={14} />
              )}
              Run Simulation
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={runRaceDemo}
              disabled={isSimulating}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-[13px] transition-all",
                "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Zap size={14} />
              Race Demo
            </motion.button>

            <button
              onClick={reset}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-text-secondary border border-border hover:border-border-light hover:text-text-primary transition-all bg-bg-primary"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </motion.div>

        {/* Top Row: 55/45 Split - Semaphore + Mutex */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-[11fr_9fr] gap-6"
        >
          <SemaphoreVisualizer semaphore={activeSemaphore} />
          <MutexDisplay mutexes={mutexes} />
        </motion.div>

        {/* Middle: Race Condition Demo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <RaceConditionDemo
            withoutLock={raceDemo?.withoutLock || null}
            withLock={raceDemo?.withLock || null}
          />
        </motion.div>

        {/* Concurrent Request Simulation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <ConcurrentRequestSim
            processCount={concurrentCount}
            isRunning={isSimulating}
          />
        </motion.div>

        {/* Bottom: Operation Log */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <OperationLog entries={simulationLog} />
        </motion.div>
      </div>
    </div>
  );
}
