"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GitBranch, Link2, Shield, Settings2, Loader2 } from "lucide-react";

interface DeadlockScenarioBuilderProps {
  onCreateScenario: (type: string) => void;
  selectedScenario: string | null;
  isLoading: boolean;
  className?: string;
}

const SCENARIOS = [
  {
    type: "classic",
    name: "Classic 2-Process",
    description: "Two processes each hold one resource and request the other. The simplest deadlock cycle.",
    icon: GitBranch,
    color: "danger",
    borderColor: "border-danger/30",
    bgColor: "bg-danger/5",
    hoverBg: "hover:bg-danger/10",
    iconColor: "text-danger",
  },
  {
    type: "chain",
    name: "3-Process Chain",
    description: "Three processes form a circular chain of resource dependencies. P1->R2->P2->R3->P3->R1->P1.",
    icon: Link2,
    color: "warning",
    borderColor: "border-warning/30",
    bgColor: "bg-warning/5",
    hoverBg: "hover:bg-warning/10",
    iconColor: "text-warning",
  },
  {
    type: "safe",
    name: "Safe Near-Deadlock",
    description: "Looks dangerous but Banker's Algorithm finds a safe sequence. No actual deadlock.",
    icon: Shield,
    color: "success",
    borderColor: "border-success/30",
    bgColor: "bg-success/5",
    hoverBg: "hover:bg-success/10",
    iconColor: "text-success",
  },
];

export function DeadlockScenarioBuilder({
  onCreateScenario,
  selectedScenario,
  isLoading,
  className,
}: DeadlockScenarioBuilderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Settings2 size={14} className="text-text-tertiary" />
        <span className="text-[12px] font-mono font-semibold text-text-tertiary uppercase tracking-wider">
          Scenario Builder
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SCENARIOS.map((scenario) => {
          const Icon = scenario.icon;
          const isSelected = selectedScenario === scenario.type;
          const isActive = isSelected && isLoading;

          return (
            <motion.button
              key={scenario.type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCreateScenario(scenario.type)}
              disabled={isLoading}
              className={cn(
                "relative flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all duration-200",
                scenario.borderColor,
                scenario.bgColor,
                scenario.hoverBg,
                isSelected && "ring-1 ring-offset-1 ring-offset-bg-primary",
                isSelected && scenario.color === "danger" && "ring-danger/50",
                isSelected && scenario.color === "warning" && "ring-warning/50",
                isSelected && scenario.color === "success" && "ring-success/50",
                isLoading && "opacity-60 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  scenario.bgColor
                )}>
                  {isActive ? (
                    <Loader2 size={16} className={cn(scenario.iconColor, "animate-spin")} />
                  ) : (
                    <Icon size={16} className={scenario.iconColor} />
                  )}
                </div>
                <span className="text-[13px] font-semibold text-text-primary">{scenario.name}</span>
              </div>
              <p className="text-[11px] text-text-tertiary leading-relaxed">{scenario.description}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default DeadlockScenarioBuilder;
