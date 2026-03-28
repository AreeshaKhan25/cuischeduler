"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { ALGORITHM_COLORS } from "@/constants/cuiData";
import { AlgorithmComparison } from "@/types";

interface AlgoComparisonChartProps {
  data: AlgorithmComparison[];
}

const METRICS = [
  { key: "avg_waiting_time", label: "Avg Wait Time", unit: "min" },
  { key: "avg_turnaround_time", label: "Avg Turnaround", unit: "min" },
  { key: "cpu_utilization", label: "CPU Utilization", unit: "%" },
  { key: "context_switches", label: "Context Switches", unit: "" },
];

export function AlgoComparisonChart({ data }: AlgoComparisonChartProps) {
  // Transform data for grouped bar chart: each metric as a group, each algo as a bar
  const chartData = METRICS.map((metric) => {
    const point: Record<string, string | number> = { metric: metric.label };
    data.forEach((algo) => {
      point[algo.algorithm] = algo[metric.key as keyof AlgorithmComparison] as number;
    });
    return point;
  });

  const algorithms = data.map((d) => d.algorithm);

  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-text-primary">
          Algorithm Comparison
        </h3>
        <OSConceptBadge
          concept="Scheduling Criteria"
          chapter={OS_CONCEPTS.FCFS.chapter}
          description="Compare algorithms by average waiting time, turnaround time, CPU utilization, and context switches."
          size="sm"
        />
      </div>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3347" />
            <XAxis
              dataKey="metric"
              tick={{ fontSize: 11, fill: "#8892aa" }}
              tickLine={false}
              axisLine={{ stroke: "#2a3347" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#8892aa" }}
              tickLine={false}
              axisLine={{ stroke: "#2a3347" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#161b27",
                border: "1px solid #2a3347",
                borderRadius: "8px",
                fontSize: 12,
                color: "#f0f4ff",
              }}
              labelStyle={{ color: "#8892aa", fontWeight: 600, marginBottom: 4 }}
              cursor={{ fill: "rgba(79, 142, 247, 0.05)" }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
              formatter={(value) => <span style={{ color: "#8892aa" }}>{value}</span>}
            />
            {algorithms.map((algo) => (
              <Bar
                key={algo}
                dataKey={algo}
                fill={ALGORITHM_COLORS[algo] || "#4f8ef7"}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Algorithm Cards */}
      <div className="grid grid-cols-4 gap-3">
        {data.map((algo) => (
          <div
            key={algo.algorithm}
            className="p-3 rounded-lg bg-bg-tertiary border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: ALGORITHM_COLORS[algo.algorithm] }}
              />
              <span className="text-[12px] font-mono font-semibold text-text-primary">
                {algo.algorithm}
              </span>
            </div>
            <p className="text-[10px] text-text-tertiary leading-relaxed">
              {algo.best_for}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlgoComparisonChart;
