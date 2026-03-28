"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, ShieldOff, Shield } from "lucide-react";

interface RaceDemoStep {
  step: number;
  process: string;
  action: string;
  sharedValue: string;
  result: string;
  isCritical: boolean;
}

interface RaceConditionDemoProps {
  withoutLock: RaceDemoStep[] | null;
  withLock: RaceDemoStep[] | null;
  className?: string;
}

function DemoColumn({
  title,
  titleIcon: TitleIcon,
  steps,
  isBroken,
  resultLabel,
  resultColor,
}: {
  title: string;
  titleIcon: React.ElementType;
  steps: RaceDemoStep[];
  isBroken: boolean;
  resultLabel: string;
  resultColor: "danger" | "success";
}) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setVisibleCount(current);
      if (current >= steps.length) {
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, [steps]);

  return (
    <div className={cn(
      "flex-1 rounded-xl border p-4 space-y-3",
      isBroken
        ? "border-danger/30 bg-danger/3"
        : "border-success/30 bg-success/3"
    )}>
      {/* Title */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/30">
        <TitleIcon size={16} className={isBroken ? "text-danger" : "text-success"} />
        <span className={cn(
          "text-[12px] font-mono font-bold uppercase tracking-wider",
          isBroken ? "text-danger" : "text-success"
        )}>
          {title}
        </span>
      </div>

      {/* Steps */}
      <div className="space-y-1 font-mono text-[11px]">
        {/* Header */}
        <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-2 pb-1 border-b border-border/20">
          <span className="text-text-tertiary text-[9px] uppercase">#</span>
          <span className="text-text-tertiary text-[9px] uppercase">Process</span>
          <span className="text-text-tertiary text-[9px] uppercase">Action</span>
          <span className="text-text-tertiary text-[9px] uppercase">Result</span>
        </div>

        <AnimatePresence>
          {steps.map((step, i) => {
            if (i >= visibleCount) return null;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "grid grid-cols-[40px_1fr_1fr_1fr] gap-2 py-1.5 px-1 rounded-md items-center",
                  step.isCritical && isBroken && "bg-danger/10 animate-pulse"
                )}
              >
                <span className="text-text-tertiary">{step.step}</span>
                <span className={cn(
                  "font-semibold",
                  step.process === "P1" ? "text-accent-blue" : "text-accent-teal"
                )}>
                  {step.process}
                </span>
                <span className="text-text-secondary truncate" title={step.action}>{step.action}</span>
                <span className={cn(
                  "truncate",
                  step.isCritical && isBroken ? "text-danger font-bold" : "text-text-primary"
                )} title={step.result}>
                  {step.result}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Result */}
      {visibleCount >= steps.length && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border font-mono text-[13px] font-bold",
            resultColor === "danger"
              ? "bg-danger/10 border-danger/30 text-danger"
              : "bg-success/10 border-success/30 text-success"
          )}
        >
          {resultColor === "danger" ? (
            <AlertTriangle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
          {resultLabel}
        </motion.div>
      )}
    </div>
  );
}

export function RaceConditionDemo({ withoutLock, withLock, className }: RaceConditionDemoProps) {
  if (!withoutLock || !withLock) {
    return (
      <div className={cn("rounded-xl border border-border bg-bg-secondary p-5", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold text-text-primary">Race Condition Demo</h3>
          <OSConceptBadge
            concept={OS_CONCEPTS.RACE_CONDITION.name}
            chapter={OS_CONCEPTS.RACE_CONDITION.chapter}
            description={OS_CONCEPTS.RACE_CONDITION.description}
            size="sm"
            pulse={false}
          />
        </div>
        <div className="flex items-center justify-center h-36 text-text-tertiary text-[13px]">
          Click &quot;Race Demo&quot; to see the side-by-side comparison
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-border bg-bg-secondary p-5 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-text-primary">Race Condition Demo</h3>
        <OSConceptBadge
          concept={OS_CONCEPTS.RACE_CONDITION.name}
          chapter={OS_CONCEPTS.RACE_CONDITION.chapter}
          description={OS_CONCEPTS.RACE_CONDITION.description}
          size="sm"
          pulse={false}
        />
      </div>

      {/* OS Concept Banner */}
      <OSConceptBadge
        concept={OS_CONCEPTS.RACE_CONDITION.name}
        chapter={OS_CONCEPTS.RACE_CONDITION.chapter}
        description={OS_CONCEPTS.RACE_CONDITION.description}
        position="banner"
        pulse={false}
      />

      {/* Side-by-side columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DemoColumn
          title="WITHOUT SEMAPHORE"
          titleIcon={ShieldOff}
          steps={withoutLock}
          isBroken={true}
          resultLabel="DOUBLE BOOKING"
          resultColor="danger"
        />
        <DemoColumn
          title="WITH SEMAPHORE"
          titleIcon={Shield}
          steps={withLock}
          isBroken={false}
          resultLabel="CORRECT"
          resultColor="success"
        />
      </div>
    </div>
  );
}

export default RaceConditionDemo;
