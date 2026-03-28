"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { GlowCard } from "@/components/ui/GlowCard";
import { useScheduler } from "@/hooks/useScheduler";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  SkipForward,
  Square,
  RotateCw,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";

const ACTION_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  start: {
    icon: Play,
    color: "text-success",
    bg: "bg-success-soft",
    label: "START",
  },
  preempt: {
    icon: Pause,
    color: "text-warning",
    bg: "bg-warning-soft",
    label: "PREEMPT",
  },
  resume: {
    icon: SkipForward,
    color: "text-accent-blue",
    bg: "bg-accent-blue-soft",
    label: "RESUME",
  },
  complete: {
    icon: CheckCircle2,
    color: "text-accent-teal",
    bg: "bg-accent-teal-soft",
    label: "COMPLETE",
  },
  wait: {
    icon: Clock,
    color: "text-text-secondary",
    bg: "bg-bg-primary",
    label: "WAIT",
  },
  age: {
    icon: ArrowUpDown,
    color: "text-[#c084fc]",
    bg: "bg-[#2d1a3e]",
    label: "AGE",
  },
  block: {
    icon: Square,
    color: "text-danger",
    bg: "bg-danger-soft",
    label: "BLOCK",
  },
};

interface AlgorithmTraceLogProps {
  className?: string;
}

export function AlgorithmTraceLog({ className }: AlgorithmTraceLogProps) {
  const { schedulingResult, currentStep, nextStep, setCurrentStep } =
    useScheduler();
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll to the latest visible step
  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const rows = container.querySelectorAll("[data-step-row]");
      if (rows[currentStep]) {
        rows[currentStep].scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [currentStep]);

  const steps = schedulingResult?.steps || [];
  const visibleSteps = steps.slice(0, currentStep + 1);

  const handleAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
      return;
    }
    autoPlayRef.current = setInterval(() => {
      const state = useScheduler.getState();
      if (
        state.schedulingResult &&
        state.currentStep < state.schedulingResult.steps.length - 1
      ) {
        state.nextStep();
      } else {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    }, 600);
  };

  const handleShowAll = () => {
    if (steps.length > 0) {
      setCurrentStep(steps.length - 1);
    }
  };

  if (!schedulingResult) {
    return (
      <GlowCard glowColor="os" className={cn("relative", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-display font-bold text-text-primary">
            Algorithm Trace Log
          </h3>
          <OSConceptBadge
            concept="Step-by-Step Trace"
            description="Trace table shows each scheduling decision the algorithm makes at each time unit."
            chapter="Ch.5"
            size="sm"
            pulse={false}
          />
        </div>
        <div className="flex items-center justify-center h-32 text-text-tertiary">
          <p className="text-[13px]">Run an algorithm to see the trace log</p>
        </div>
      </GlowCard>
    );
  }

  return (
    <GlowCard glowColor="os" className={cn("relative", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-[16px] font-display font-bold text-text-primary">
            Algorithm Trace Log
          </h3>
          <span className="text-[11px] font-mono text-text-tertiary bg-bg-primary px-2 py-0.5 rounded">
            Step {currentStep + 1} / {steps.length}
          </span>
        </div>
        <OSConceptBadge
          concept="Step-by-Step Trace"
          description="Trace table shows each scheduling decision the algorithm makes at each time unit."
          chapter="Ch.5"
          size="sm"
          pulse={false}
          position="corner"
        />
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={handleAutoPlay}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium",
            "border border-border bg-bg-primary text-text-secondary",
            "hover:border-accent-blue hover:text-accent-blue transition-colors"
          )}
        >
          <Play size={13} />
          Auto Play
        </button>
        <button
          onClick={nextStep}
          disabled={currentStep >= steps.length - 1}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium",
            "border border-border bg-bg-primary text-text-secondary",
            "hover:border-accent-teal hover:text-accent-teal transition-colors",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          <SkipForward size={13} />
          Next Step
        </button>
        <button
          onClick={handleShowAll}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium",
            "border border-border bg-bg-primary text-text-secondary",
            "hover:border-border-light hover:text-text-primary transition-colors"
          )}
        >
          Show All
        </button>
        <button
          onClick={() => setCurrentStep(0)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium",
            "border border-border bg-bg-primary text-text-secondary",
            "hover:border-border-light hover:text-text-primary transition-colors"
          )}
        >
          <RotateCw size={13} />
          Reset
        </button>
      </div>

      {/* Trace Table */}
      <div ref={scrollRef} className="overflow-auto max-h-[400px] rounded-lg border border-border">
        <table className="w-full text-[12px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-bg-primary border-b border-border">
              <th className="px-3 py-2.5 text-left font-mono font-semibold text-text-secondary uppercase tracking-wider w-16">
                Step
              </th>
              <th className="px-3 py-2.5 text-left font-mono font-semibold text-text-secondary uppercase tracking-wider w-16">
                Time
              </th>
              <th className="px-3 py-2.5 text-left font-mono font-semibold text-text-secondary uppercase tracking-wider w-20">
                Process
              </th>
              <th className="px-3 py-2.5 text-left font-mono font-semibold text-text-secondary uppercase tracking-wider w-28">
                Action
              </th>
              <th className="px-3 py-2.5 text-left font-mono font-semibold text-text-secondary uppercase tracking-wider">
                Reason
              </th>
              <th className="px-3 py-2.5 text-left font-mono font-semibold text-os-text uppercase tracking-wider bg-os-bg/40">
                OS Concept Note
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {visibleSteps.map((step, i) => {
                const config = ACTION_CONFIG[step.action] || ACTION_CONFIG.wait;
                const Icon = config.icon;
                const isLatest = i === visibleSteps.length - 1;

                return (
                  <motion.tr
                    key={step.step_number}
                    data-step-row
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i === visibleSteps.length - 1 ? 0 : 0 }}
                    className={cn(
                      "border-b border-border/30 transition-colors",
                      isLatest
                        ? "bg-accent-blue-soft/30"
                        : "bg-bg-secondary hover:bg-bg-tertiary"
                    )}
                  >
                    <td className="px-3 py-2.5 font-mono font-bold text-text-tertiary">
                      {step.step_number + 1}
                    </td>
                    <td className="px-3 py-2.5 font-mono font-semibold text-accent-teal">
                      t={step.time_unit}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-mono font-semibold text-text-primary bg-bg-primary px-1.5 py-0.5 rounded text-[11px]">
                        {step.process_id}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono font-semibold text-[10px] uppercase tracking-wider",
                          config.bg,
                          config.color
                        )}
                      >
                        <Icon size={10} />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-text-secondary text-[11px] max-w-[200px] truncate">
                      {step.reason}
                    </td>
                    <td
                      className="px-3 py-2.5 font-mono text-[11px] leading-relaxed"
                      style={{
                        backgroundColor: "var(--os-bg)",
                        color: "var(--os-text)",
                      }}
                    >
                      {step.os_concept_note}
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </GlowCard>
  );
}

export default AlgorithmTraceLog;
