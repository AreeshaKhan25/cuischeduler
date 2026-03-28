"use client";

import { motion } from "framer-motion";
import { StatCard } from "@/components/ui/StatCard";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { useScheduler } from "@/hooks/useScheduler";
import { cn } from "@/lib/utils";
import { Clock, Timer, Cpu, BarChart3, RotateCw } from "lucide-react";

interface MetricsRowProps {
  className?: string;
}

export function MetricsRow({ className }: MetricsRowProps) {
  const { schedulingResult } = useScheduler();
  const metrics = schedulingResult?.metrics;

  const cards = [
    {
      label: "Avg Waiting Time",
      value: metrics?.avg_waiting_time ?? 0,
      suffix: " min",
      decimals: 1,
      icon: Clock,
      osConcept: {
        concept: "Waiting Time",
        chapter: "Ch.5",
        description:
          "Time a process spends in the ready queue waiting for CPU. A key metric for scheduling algorithm performance.",
      },
    },
    {
      label: "Avg Turnaround Time",
      value: metrics?.avg_turnaround_time ?? 0,
      suffix: " min",
      decimals: 1,
      icon: Timer,
      osConcept: {
        concept: "Turnaround Time",
        chapter: "Ch.5",
        description:
          "Total time from process arrival to completion. Turnaround = Waiting + Burst time.",
      },
    },
    {
      label: "CPU Utilization",
      value: metrics?.cpu_utilization ?? 0,
      suffix: "%",
      decimals: 1,
      icon: Cpu,
      osConcept: {
        concept: "CPU Utilization",
        chapter: "Ch.5",
        description:
          "Percentage of time the CPU is executing processes vs. idle. Ideal: 40-90% depending on system type.",
      },
    },
    {
      label: "Throughput",
      value: metrics?.throughput ? metrics.throughput * 100 : 0,
      suffix: "/100t",
      decimals: 2,
      icon: BarChart3,
      osConcept: {
        concept: "Throughput",
        chapter: "Ch.5",
        description:
          "Number of processes completed per unit time. Higher throughput = more efficient scheduling.",
      },
    },
    {
      label: "Context Switches",
      value: metrics?.context_switches ?? 0,
      suffix: "",
      decimals: 0,
      icon: RotateCw,
      osConcept: {
        concept: OS_CONCEPTS.CONTEXT_SWITCH.name,
        chapter: OS_CONCEPTS.CONTEXT_SWITCH.chapter,
        description: OS_CONCEPTS.CONTEXT_SWITCH.description,
      },
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4", className)}>
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.08 }}
        >
          <StatCard
            label={card.label}
            value={card.value}
            suffix={card.suffix}
            decimals={card.decimals}
            icon={card.icon}
            osConcept={card.osConcept}
          />
        </motion.div>
      ))}
    </div>
  );
}

export default MetricsRow;
