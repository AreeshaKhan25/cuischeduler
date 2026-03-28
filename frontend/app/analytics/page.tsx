"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Cpu, Activity } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { AnalyticsData, AlgorithmComparison } from "@/types";
import { analyticsApi } from "@/lib/api";

const AlgoComparisonChart = dynamic(() => import("@/components/analytics/AlgoComparisonChart").then(m => m.AlgoComparisonChart), { ssr: false });
const UsageHeatmap = dynamic(() => import("@/components/analytics/UsageHeatmap").then(m => m.UsageHeatmap), { ssr: false });
const UtilizationBars = dynamic(() => import("@/components/analytics/UtilizationBars").then(m => m.UtilizationBars), { ssr: false });
const FacultyRadarChart = dynamic(() => import("@/components/analytics/FacultyRadarChart").then(m => m.FacultyRadarChart), { ssr: false });
const ReportExporter = dynamic(() => import("@/components/analytics/ReportExporter").then(m => m.ReportExporter), { ssr: false });

// ─── Mock Analytics Data ────────────────────────────────────────
const MOCK_ANALYTICS: AnalyticsData = {
  utilization: [
    { resource_id: "cs-101", resource_name: "CS Lab 1", utilization_pct: 85.2 },
    { resource_id: "cs-201", resource_name: "Room 201", utilization_pct: 72.5 },
    { resource_id: "cs-301", resource_name: "AI Lab", utilization_pct: 68.0 },
    { resource_id: "cs-202", resource_name: "Room 202", utilization_pct: 55.3 },
    { resource_id: "cs-303", resource_name: "SE Lab", utilization_pct: 48.7 },
    { resource_id: "ee-101", resource_name: "Circuits Lab", utilization_pct: 62.1 },
    { resource_id: "ee-301", resource_name: "DSP Lab", utilization_pct: 38.4 },
    { resource_id: "nb-101", resource_name: "Lecture Hall A", utilization_pct: 91.0 },
    { resource_id: "nb-102", resource_name: "Lecture Hall B", utilization_pct: 45.0 },
    { resource_id: "nb-201", resource_name: "NB Room 201", utilization_pct: 33.8 },
    { resource_id: "ab-201", resource_name: "Seminar Hall", utilization_pct: 78.2 },
    { resource_id: "ab-101", resource_name: "Conference Room", utilization_pct: 25.5 },
  ],
  algorithm_comparison: [
    { algorithm: "FCFS", avg_waiting_time: 12.4, avg_turnaround_time: 18.2, cpu_utilization: 68.5, throughput: 4.2, context_switches: 0, best_for: "Simple sequential scheduling with no preemption needed" },
    { algorithm: "SJF", avg_waiting_time: 7.8, avg_turnaround_time: 13.6, cpu_utilization: 78.2, throughput: 5.1, context_switches: 0, best_for: "Minimizing wait time when burst times are known" },
    { algorithm: "RR", avg_waiting_time: 10.1, avg_turnaround_time: 16.5, cpu_utilization: 82.0, throughput: 4.8, context_switches: 18, best_for: "Fair time-sharing with equal quantum allocation" },
    { algorithm: "PRIORITY", avg_waiting_time: 9.2, avg_turnaround_time: 14.8, cpu_utilization: 75.5, throughput: 4.6, context_switches: 8, best_for: "Urgent bookings processed first with aging to prevent starvation" },
  ],
  heatmap: [
    [0, 3, 5, 8, 7, 4, 2, 1, 6, 9, 8, 5, 3, 2, 1, 0],  // Mon
    [0, 2, 4, 6, 8, 5, 3, 1, 5, 7, 9, 6, 4, 2, 1, 0],  // Tue
    [0, 4, 6, 9, 7, 5, 2, 1, 7, 8, 7, 5, 3, 1, 1, 0],  // Wed
    [0, 3, 5, 7, 6, 4, 2, 1, 6, 8, 8, 6, 3, 2, 1, 0],  // Thu
    [0, 2, 4, 5, 6, 3, 2, 0, 4, 6, 5, 4, 2, 1, 0, 0],  // Fri
    [0, 0, 1, 2, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],  // Sat
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // Sun
  ],
  faculty_load: [
    { faculty_id: "f1", name: "Dr. Ahmed Khan", hours: 16, max_hours: 18 },
    { faculty_id: "f2", name: "Dr. Fatima Noor", hours: 14, max_hours: 16 },
    { faculty_id: "f3", name: "Dr. Usman Tariq", hours: 20, max_hours: 18 },
    { faculty_id: "f4", name: "Dr. Sara Malik", hours: 12, max_hours: 16 },
    { faculty_id: "f5", name: "Dr. Hassan Ali", hours: 18, max_hours: 18 },
    { faculty_id: "f6", name: "Dr. Bilal Shah", hours: 15, max_hours: 16 },
    { faculty_id: "f7", name: "Dr. Ayesha Rizwan", hours: 19, max_hours: 16 },
    { faculty_id: "f8", name: "Dr. Imran Sajid", hours: 10, max_hours: 18 },
    { faculty_id: "f9", name: "Dr. Nadia Akram", hours: 14, max_hours: 18 },
  ],
  fragmentation_history: [
    { date: "2026-03-22", fragmentation_pct: 35.2 },
    { date: "2026-03-23", fragmentation_pct: 31.8 },
    { date: "2026-03-24", fragmentation_pct: 28.5 },
    { date: "2026-03-25", fragmentation_pct: 33.1 },
    { date: "2026-03-26", fragmentation_pct: 25.4 },
    { date: "2026-03-27", fragmentation_pct: 22.7 },
    { date: "2026-03-28", fragmentation_pct: 28.5 },
  ],
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>(MOCK_ANALYTICS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [utilRes, algoRes, heatRes, facRes, fragRes] = await Promise.all([
          analyticsApi.getUtilization(),
          analyticsApi.getAlgorithms(),
          analyticsApi.getHeatmap(),
          analyticsApi.getFacultyLoad(),
          analyticsApi.getFragmentation(),
        ]);
        setData({
          utilization: utilRes.data,
          algorithm_comparison: algoRes.data,
          heatmap: heatRes.data,
          faculty_load: facRes.data,
          fragmentation_history: fragRes.data,
        });
      } catch {
        // Use mock data on API failure
        setData(MOCK_ANALYTICS);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const avgUtil = data.utilization.reduce((s, r) => s + r.utilization_pct, 0) / data.utilization.length;
  const totalBookings = data.heatmap.flat().reduce((s, v) => s + v, 0);
  const bestAlgo = [...data.algorithm_comparison].sort((a, b) => a.avg_waiting_time - b.avg_waiting_time)[0];
  const overloaded = data.faculty_load.filter((f) => f.hours > f.max_hours).length;

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Page Header */}
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Resource utilization, scheduling efficiency, and faculty load analysis mapped to OS concepts."
        breadcrumb={["CUIScheduler", "Analytics"]}
        osConcepts={[
          OS_CONCEPTS.LOAD_BALANCE,
          OS_CONCEPTS.MEMORY_BITMAP,
          OS_CONCEPTS.FRAGMENTATION,
        ]}
      />

      {/* Export Button */}
      <div className="flex justify-end">
        <ReportExporter data={data} />
      </div>

      {/* Summary Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item}>
          <StatCard
            label="Avg Utilization"
            value={avgUtil}
            decimals={1}
            suffix="%"
            icon={BarChart3}
            subtitle="Across all resources"
            osConcept={{ concept: "Resource Allocation", chapter: "Ch.8" }}
            trend={{ value: 3.2, positive: true }}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            label="Weekly Bookings"
            value={totalBookings}
            icon={Activity}
            subtitle="Total processed this week"
            osConcept={{ concept: "Process Count", chapter: "Ch.3" }}
            trend={{ value: 8, positive: true }}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            label="Best Algorithm"
            value={bestAlgo.avg_waiting_time}
            decimals={1}
            suffix=" min"
            icon={Cpu}
            subtitle={`${bestAlgo.algorithm} — Lowest avg wait`}
            osConcept={{ concept: "Scheduling Optimal", chapter: "Ch.5" }}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            label="Faculty Overloaded"
            value={overloaded}
            icon={Users}
            subtitle={`of ${data.faculty_load.length} total faculty`}
            osConcept={{ concept: "Load Imbalance", chapter: "Ch.5" }}
            trend={overloaded > 0 ? { value: overloaded, positive: false } : undefined}
          />
        </motion.div>
      </motion.div>

      {/* Charts */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Algorithm Comparison */}
        <motion.div variants={item}>
          <AlgoComparisonChart data={data.algorithm_comparison} />
        </motion.div>

        {/* Two-column layout: Heatmap + Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={item}>
            <UsageHeatmap data={data.heatmap} />
          </motion.div>
          <motion.div variants={item}>
            <FacultyRadarChart data={data.faculty_load} />
          </motion.div>
        </div>

        {/* Resource Utilization Bars */}
        <motion.div variants={item}>
          <UtilizationBars data={data.utilization} />
        </motion.div>
      </motion.div>
    </div>
  );
}
