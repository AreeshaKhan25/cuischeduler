"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { HardDrive, User, ArrowRight } from "lucide-react";

interface ConcurrentRequestSimProps {
  processCount: number;
  isRunning: boolean;
  className?: string;
}

interface ProcessNode {
  id: string;
  label: string;
  angle: number;
  state: "waiting" | "accessing" | "done";
}

export function ConcurrentRequestSim({ processCount, isRunning, className }: ConcurrentRequestSimProps) {
  const [processes, setProcesses] = useState<ProcessNode[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [queueOrder, setQueueOrder] = useState<string[]>([]);

  // Generate processes in a circle
  useEffect(() => {
    const procs: ProcessNode[] = Array.from({ length: processCount }, (_, i) => ({
      id: `P${i + 1}`,
      label: `P${i + 1}`,
      angle: (i * 360) / processCount - 90,
      state: "waiting" as const,
    }));
    setProcesses(procs);
    setCurrentStep(0);
    setQueueOrder(procs.map((p) => p.id));
  }, [processCount]);

  // Simulation steps
  const advanceStep = useCallback(() => {
    setProcesses((prev) => {
      const next = prev.map((p) => ({ ...p }));
      const waitingIdx = next.findIndex((p) => p.state === "waiting");
      const accessingIdx = next.findIndex((p) => p.state === "accessing");

      if (accessingIdx >= 0) {
        // Current process finishes
        next[accessingIdx].state = "done";
      }

      if (waitingIdx >= 0) {
        next[waitingIdx].state = "accessing";
      }

      return next;
    });
    setCurrentStep((s) => s + 1);
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      advanceStep();
    }, 1200);
    return () => clearInterval(interval);
  }, [isRunning, advanceStep]);

  const radius = 100;
  const centerX = 140;
  const centerY = 130;

  return (
    <div className={cn("rounded-xl border border-border bg-bg-secondary p-5 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-text-primary">Concurrent Request Simulation</h3>
        <span className="text-[11px] font-mono text-text-tertiary">
          Step: {currentStep}
        </span>
      </div>

      {/* Visual */}
      <div className="flex items-center gap-6">
        {/* Circle visualization */}
        <div className="relative" style={{ width: centerX * 2, height: centerY * 2 }}>
          {/* Central resource */}
          <div
            className="absolute flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-accent-teal to-[#14b8a6] border-2 border-accent-teal shadow-teal-glow"
            style={{
              left: centerX - 28,
              top: centerY - 28,
            }}
          >
            <HardDrive size={20} className="text-[#0f1117]" />
          </div>

          {/* Process nodes arranged in circle */}
          {processes.map((proc) => {
            const rad = (proc.angle * Math.PI) / 180;
            const x = centerX + radius * Math.cos(rad) - 18;
            const y = centerY + radius * Math.sin(rad) - 18;
            const isAccessing = proc.state === "accessing";
            const isDone = proc.state === "done";

            return (
              <motion.div
                key={proc.id}
                className="absolute"
                style={{ left: x, top: y }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                {/* Arrow to center when accessing */}
                {isAccessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-1/2 left-1/2"
                    style={{ zIndex: -1 }}
                  >
                    <svg
                      width={Math.abs(centerX - x - 18) + 20}
                      height={2}
                      className="absolute"
                      style={{
                        left: x < centerX ? 18 : -(centerX - x - 18),
                        top: 0,
                      }}
                    >
                      <line
                        x1="0"
                        y1="1"
                        x2={Math.abs(centerX - x - 18)}
                        y2="1"
                        stroke="#22c55e"
                        strokeWidth="2"
                      />
                    </svg>
                  </motion.div>
                )}

                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center border-2 font-mono text-[10px] font-bold transition-all duration-300",
                  isAccessing
                    ? "bg-success/20 border-success text-success shadow-success-glow scale-110"
                    : isDone
                    ? "bg-bg-tertiary border-border text-text-tertiary opacity-50"
                    : "bg-danger/10 border-danger/40 text-danger"
                )}>
                  {proc.label}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Queue visualization */}
        <div className="flex-1 space-y-2">
          <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Queue Order</span>
          <div className="flex flex-col gap-1">
            {processes.map((proc, i) => (
              <motion.div
                key={proc.id}
                layout
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-mono",
                  proc.state === "accessing"
                    ? "bg-success/10 border-success/30 text-success font-bold"
                    : proc.state === "done"
                    ? "bg-bg-tertiary border-border/30 text-text-tertiary line-through"
                    : "bg-danger/5 border-danger/20 text-danger"
                )}
              >
                <span className="w-4 text-text-tertiary">{i + 1}.</span>
                <User size={10} />
                <span>{proc.label}</span>
                {proc.state === "accessing" && (
                  <span className="ml-auto flex items-center gap-1 text-[9px]">
                    <ArrowRight size={10} />
                    ACCESSING
                  </span>
                )}
                {proc.state === "waiting" && (
                  <span className="ml-auto text-[9px] text-text-tertiary">WAITING</span>
                )}
                {proc.state === "done" && (
                  <span className="ml-auto text-[9px]">DONE</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConcurrentRequestSim;
