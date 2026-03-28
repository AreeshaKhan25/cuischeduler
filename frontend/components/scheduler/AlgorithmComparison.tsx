"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { AlgorithmBadge } from "@/components/ui/AlgorithmBadge";
import { GlowCard } from "@/components/ui/GlowCard";
import { useScheduler } from "@/hooks/useScheduler";
import { cn } from "@/lib/utils";
import { Trophy, TrendingDown } from "lucide-react";
import type { AlgorithmComparison as AlgoCompType } from "@/types";

interface AlgorithmComparisonProps {
  className?: string;
}

function ComparisonTooltip({ active, payload, label }: { active?: boolean; payload?: unknown[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-bg-secondary p-3 shadow-lg">
      <p className="font-mono text-[12px] font-semibold text-text-primary mb-2">{label}</p>
      <div className="space-y-1">
        {(payload as { name: string; value: number; color: string }[]).map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-[11px]">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
            <span className="text-text-secondary">{entry.name}:</span>
            <span className="font-mono font-semibold text-text-primary">
              {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AlgorithmComparison({ className }: AlgorithmComparisonProps) {
  const { comparison } = useScheduler();

  const { chartData, winner } = useMemo(() => {
    if (!comparison || comparison.length === 0) {
      return { chartData: [], winner: null };
    }

    // Determine winner by lowest avg waiting time
    const win = comparison.reduce(
      (best, curr) =>
        curr.avg_waiting_time < best.avg_waiting_time ? curr : best,
      comparison[0]
    );

    const data = comparison.map((c) => ({
      name: c.algorithm,
      "Avg Wait": c.avg_waiting_time,
      "Avg Turnaround": c.avg_turnaround_time,
      "CPU Util %": c.cpu_utilization,
      "Ctx Switches": c.context_switches,
    }));

    return { chartData: data, winner: win };
  }, [comparison]);

  if (!comparison || comparison.length === 0) {
    return (
      <GlowCard glowColor="teal" className={cn("relative", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-display font-bold text-text-primary">
            Algorithm Comparison
          </h3>
          <OSConceptBadge
            concept="Scheduling Comparison"
            description="Compare all CPU scheduling algorithms on the same workload to identify the best fit."
            chapter="Ch.5"
            size="sm"
            pulse={false}
          />
        </div>
        <div className="flex items-center justify-center h-48 text-text-tertiary">
          <p className="text-[13px]">Click &quot;Compare All&quot; to see comparison results</p>
        </div>
      </GlowCard>
    );
  }

  return (
    <GlowCard glowColor="teal" className={cn("relative", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-[16px] font-display font-bold text-text-primary">
            Algorithm Comparison
          </h3>
          <OSConceptBadge
            concept="Scheduling Comparison"
            description="Compare all CPU scheduling algorithms on the same workload to identify the best fit."
            chapter="Ch.5"
            size="sm"
            pulse={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Table */}
        <div className="overflow-auto rounded-lg border border-border">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-bg-primary border-b border-border">
                <th className="px-3 py-2.5 text-left font-mono font-semibold text-text-secondary uppercase tracking-wider">
                  Algorithm
                </th>
                <th className="px-3 py-2.5 text-right font-mono font-semibold text-text-secondary uppercase tracking-wider">
                  Avg Wait
                </th>
                <th className="px-3 py-2.5 text-right font-mono font-semibold text-text-secondary uppercase tracking-wider">
                  Avg TAT
                </th>
                <th className="px-3 py-2.5 text-right font-mono font-semibold text-text-secondary uppercase tracking-wider">
                  CPU %
                </th>
                <th className="px-3 py-2.5 text-right font-mono font-semibold text-text-secondary uppercase tracking-wider">
                  Ctx Sw
                </th>
                <th className="px-3 py-2.5 text-left font-mono font-semibold text-text-secondary uppercase tracking-wider">
                  Best For
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((algo, i) => {
                const isWinner =
                  winner && algo.algorithm === winner.algorithm;
                return (
                  <motion.tr
                    key={algo.algorithm}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "border-b border-border/30 transition-colors",
                      isWinner
                        ? "bg-success-soft/30"
                        : "bg-bg-secondary hover:bg-bg-tertiary"
                    )}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {isWinner && (
                          <Trophy size={13} className="text-success flex-shrink-0" />
                        )}
                        <AlgorithmBadge algorithm={algo.algorithm} />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-medium text-text-primary">
                      {algo.avg_waiting_time.toFixed(1)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-medium text-text-primary">
                      {algo.avg_turnaround_time.toFixed(1)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-medium text-accent-teal">
                      {algo.cpu_utilization.toFixed(1)}%
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-medium text-text-primary">
                      {algo.context_switches}
                    </td>
                    <td className="px-3 py-3 text-[11px] text-text-secondary max-w-[150px]">
                      {algo.best_for}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bar Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                opacity={0.3}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--text-secondary)", fontSize: 11, fontFamily: "JetBrains Mono" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={{ stroke: "var(--border)" }}
              />
              <YAxis
                tick={{ fill: "var(--text-tertiary)", fontSize: 10, fontFamily: "JetBrains Mono" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={{ stroke: "var(--border)" }}
              />
              <Tooltip content={<ComparisonTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono" }}
              />
              <Bar
                dataKey="Avg Wait"
                fill="#4f8ef7"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="Avg Turnaround"
                fill="#2dd4bf"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="CPU Util %"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="Ctx Switches"
                fill="#c084fc"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Winner banner */}
      {winner && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-5 flex items-center gap-3 p-3 rounded-lg bg-success-soft/20 border border-success/20"
        >
          <Trophy size={18} className="text-success flex-shrink-0" />
          <div className="flex-1">
            <span className="text-[13px] font-medium text-text-primary">
              Winner:{" "}
              <span className="font-mono font-bold text-success">
                {winner.algorithm}
              </span>
            </span>
            <span className="text-[11px] text-text-secondary ml-2">
              Lowest avg waiting time ({winner.avg_waiting_time.toFixed(1)} min) --{" "}
              {winner.best_for}
            </span>
          </div>
          <TrendingDown size={16} className="text-success flex-shrink-0" />
        </motion.div>
      )}
    </GlowCard>
  );
}

export default AlgorithmComparison;
