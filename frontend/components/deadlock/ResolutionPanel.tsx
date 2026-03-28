"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DeadlockAnalysis } from "@/types";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { cn } from "@/lib/utils";
import {
  Scissors,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Cpu,
} from "lucide-react";

interface ResolutionPanelProps {
  analysis: DeadlockAnalysis | null;
  visible: boolean;
  isResolving: boolean;
  onResolve: (strategy: string) => void;
  className?: string;
}

const RESOLUTION_STRATEGIES = [
  {
    strategy: "preempt",
    name: "Preempt Resource",
    description: "Forcibly take a resource from the lowest-priority process in the cycle and assign it to the waiting process.",
    icon: Scissors,
    osNote: "Resource preemption breaks the 'No Preemption' Coffman condition. The victim process is rolled back to before it acquired the resource.",
    color: "warning",
    iconBg: "bg-warning/10",
    border: "border-warning/30",
    hoverBorder: "hover:border-warning/60",
    textColor: "text-warning",
  },
  {
    strategy: "terminate",
    name: "Terminate Process",
    description: "Kill the lowest-priority process in the deadlock cycle, releasing all its held resources.",
    icon: Trash2,
    osNote: "Process termination breaks the 'Hold & Wait' condition. The terminated process must restart from scratch. Choose the one with minimum cost.",
    color: "danger",
    iconBg: "bg-danger/10",
    border: "border-danger/30",
    hoverBorder: "hover:border-danger/60",
    textColor: "text-danger",
  },
  {
    strategy: "rollback",
    name: "Rollback Process",
    description: "Roll back the first process to the state before its last resource request, undoing the request that caused the cycle.",
    icon: RotateCcw,
    osNote: "Checkpoint-based rollback reverts the process state. Requires the system to maintain process checkpoints. Least disruptive resolution.",
    color: "accent-blue",
    iconBg: "bg-accent-blue-soft",
    border: "border-accent-blue/30",
    hoverBorder: "hover:border-accent-blue/60",
    textColor: "text-accent-blue",
  },
];

export function ResolutionPanel({
  analysis,
  visible,
  isResolving,
  onResolve,
  className,
}: ResolutionPanelProps) {
  if (!analysis || !visible) return null;

  const involvedProcesses = analysis.cycle_nodes.filter((n) => n.startsWith("P"));
  const involvedResources = analysis.cycle_nodes.filter((n) => n.startsWith("R"));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "rounded-xl border border-danger/30 bg-bg-secondary overflow-hidden",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 bg-danger/5 border-b border-danger/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-danger/15 flex items-center justify-center">
                <AlertTriangle size={16} className="text-danger" />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-text-primary">Deadlock Resolution</h3>
                <p className="text-[11px] text-text-tertiary">Choose a strategy to break the deadlock</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-text-tertiary uppercase">Processes:</span>
                <div className="flex gap-1">
                  {involvedProcesses.map((p) => (
                    <span key={p} className="px-1.5 py-0.5 rounded bg-danger/10 text-[11px] font-mono font-bold text-danger border border-danger/20">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-text-tertiary uppercase">Resources:</span>
                <div className="flex gap-1">
                  {involvedResources.map((r) => (
                    <span key={r} className="px-1.5 py-0.5 rounded bg-warning/10 text-[11px] font-mono font-bold text-warning border border-warning/20">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Resolution Options */}
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {RESOLUTION_STRATEGIES.map((strat) => {
                const Icon = strat.icon;
                const matchingOption = analysis.resolution_options.find(
                  (o) => o.action === strat.strategy
                );

                return (
                  <motion.button
                    key={strat.strategy}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onResolve(strat.strategy)}
                    disabled={isResolving}
                    className={cn(
                      "flex flex-col items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200",
                      strat.border,
                      strat.hoverBorder,
                      "bg-bg-primary/50 hover:bg-bg-hover",
                      isResolving && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", strat.iconBg)}>
                        {isResolving ? (
                          <Loader2 size={16} className={cn(strat.textColor, "animate-spin")} />
                        ) : (
                          <Icon size={16} className={strat.textColor} />
                        )}
                      </div>
                      <span className={cn("text-[13px] font-semibold", strat.textColor)}>
                        {strat.name}
                      </span>
                    </div>

                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      {strat.description}
                    </p>

                    {matchingOption && (
                      <div className="w-full px-2.5 py-1.5 rounded-lg bg-bg-tertiary border border-border/50">
                        <span className="text-[10px] font-mono text-text-tertiary">
                          Target: <span className="text-text-primary font-semibold">{matchingOption.target_process}</span>
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-1.5 w-full pt-2 border-t border-border/30">
                      <Cpu size={10} className="text-os-text mt-0.5 flex-shrink-0" />
                      <span className="text-[10px] text-text-tertiary leading-relaxed">{strat.osNote}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ResolutionPanel;
