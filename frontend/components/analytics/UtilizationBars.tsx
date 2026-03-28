"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";

interface UtilizationItem {
  resource_id: string;
  resource_name: string;
  utilization_pct: number;
}

interface UtilizationBarsProps {
  data: UtilizationItem[];
}

function getBarColor(pct: number): string {
  if (pct >= 80) return "#ef4444";
  if (pct >= 60) return "#f59e0b";
  if (pct >= 40) return "#4f8ef7";
  return "#2dd4bf";
}

export function UtilizationBars({ data }: UtilizationBarsProps) {
  const sorted = [...data].sort((a, b) => b.utilization_pct - a.utilization_pct);

  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-text-primary">
          Resource Utilization
        </h3>
        <OSConceptBadge
          concept="Resource Allocation Efficiency"
          chapter="Ch.8"
          description="Measures how effectively each resource is being used. Red threshold at 80% indicates potential bottleneck."
          size="sm"
        />
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3347" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#8892aa" }}
              tickLine={false}
              axisLine={{ stroke: "#2a3347" }}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="resource_name"
              tick={{ fontSize: 11, fill: "#8892aa" }}
              tickLine={false}
              axisLine={{ stroke: "#2a3347" }}
              width={90}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#161b27",
                border: "1px solid #2a3347",
                borderRadius: "8px",
                fontSize: 12,
                color: "#f0f4ff",
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, "Utilization"]}
              cursor={{ fill: "rgba(79, 142, 247, 0.05)" }}
            />
            <ReferenceLine
              x={80}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{
                value: "80% Threshold",
                position: "top",
                fill: "#ef4444",
                fontSize: 10,
              }}
            />
            <Bar dataKey="utilization_pct" radius={[0, 4, 4, 0]} maxBarSize={24}>
              {sorted.map((entry, idx) => (
                <Cell key={idx} fill={getBarColor(entry.utilization_pct)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 justify-center">
        {[
          { color: "#2dd4bf", label: "Low (<40%)" },
          { color: "#4f8ef7", label: "Moderate (40-60%)" },
          { color: "#f59e0b", label: "High (60-80%)" },
          { color: "#ef4444", label: "Critical (>80%)" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] text-text-tertiary">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UtilizationBars;
