"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { OS_CONCEPTS } from "@/constants/osConcepts";

interface FacultyLoad {
  faculty_id: string;
  name: string;
  hours: number;
  max_hours: number;
}

interface FacultyRadarChartProps {
  data: FacultyLoad[];
}

export function FacultyRadarChart({ data }: FacultyRadarChartProps) {
  const chartData = data.map((f) => ({
    name: f.name.split(" ").pop() || f.name, // Last name for readability
    fullName: f.name,
    hours: f.hours,
    max_hours: f.max_hours,
    overloaded: f.hours > f.max_hours,
    load_pct: Math.round((f.hours / f.max_hours) * 100),
  }));

  const maxHour = Math.max(...data.map((d) => Math.max(d.hours, d.max_hours)), 20);

  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-text-primary">
          Faculty Load Distribution
        </h3>
        <OSConceptBadge
          concept={OS_CONCEPTS.LOAD_BALANCE.name}
          chapter={OS_CONCEPTS.LOAD_BALANCE.chapter}
          description={OS_CONCEPTS.LOAD_BALANCE.description}
          size="sm"
        />
      </div>

      <div className="h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="#2a3347" />
            <PolarAngleAxis
              dataKey="name"
              tick={({ x, y, payload, index }) => {
                const item = chartData[index];
                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={11}
                    fill={item?.overloaded ? "#ef4444" : "#8892aa"}
                    fontWeight={item?.overloaded ? 700 : 400}
                    fontFamily="'JetBrains Mono', monospace"
                  >
                    {payload.value}
                  </text>
                );
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, maxHour]}
              tick={{ fontSize: 9, fill: "#5a6480" }}
              tickCount={5}
            />
            <Radar
              name="Max Hours"
              dataKey="max_hours"
              stroke="#3a4560"
              fill="#3a4560"
              fillOpacity={0.15}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <Radar
              name="Current Hours"
              dataKey="hours"
              stroke="#4f8ef7"
              fill="#4f8ef7"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#161b27",
                border: "1px solid #2a3347",
                borderRadius: "8px",
                fontSize: 12,
                color: "#f0f4ff",
              }}
              formatter={(value: number, name: string) => [
                `${value} hrs`,
                name,
              ]}
              labelFormatter={(label) => {
                const item = chartData.find((d) => d.name === label);
                return item ? `${item.fullName} (${item.load_pct}% load)` : label;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
              formatter={(value) => <span style={{ color: "#8892aa" }}>{value}</span>}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Overloaded Warning */}
      {chartData.some((d) => d.overloaded) && (
        <div className="p-3 rounded-lg bg-danger-soft border border-danger/20">
          <div className="text-[12px] text-danger font-medium mb-1">Overloaded Faculty</div>
          <div className="flex flex-wrap gap-2">
            {chartData
              .filter((d) => d.overloaded)
              .map((d) => (
                <span
                  key={d.fullName}
                  className="px-2 py-0.5 rounded-md bg-danger/10 border border-danger/30 text-[11px] text-danger font-mono"
                >
                  {d.fullName}: {d.hours}/{d.max_hours}hrs ({d.load_pct}%)
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultyRadarChart;
