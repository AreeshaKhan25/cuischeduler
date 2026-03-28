"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { GlowCard } from "@/components/ui/GlowCard";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { LivePulse } from "@/components/ui/LivePulse";
import {
  LayoutDashboard,
  Clock,
  Box,
  Users,
  CalendarDays,
  Activity,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Real-time campus resource scheduling overview with OS concept visualization"
        breadcrumb={["CUIScheduler", "Dashboard"]}
        osConcepts={[
          {
            name: "CPU Scheduling",
            chapter: "OS Ch. 5",
            description:
              "Booking requests are treated as processes competing for CPU (resource) time using scheduling algorithms.",
          },
          {
            name: "Resource Allocation",
            chapter: "OS Ch. 7",
            description:
              "Campus resources (rooms, labs, equipment) are managed like OS resources with allocation and deallocation tracking.",
          },
        ]}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Bookings"
          value={42}
          subtitle="Currently running processes"
          icon={Clock}
          osConcept={{
            concept: "Process States",
            chapter: "OS Ch. 3",
            description: "Active bookings represent processes in the RUNNING state.",
          }}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          label="Resources"
          value={128}
          subtitle="Total managed resources"
          icon={Box}
          osConcept={{
            concept: "Resource Pool",
            chapter: "OS Ch. 7",
          }}
        />
        <StatCard
          label="Faculty"
          value={67}
          subtitle="Active faculty members"
          icon={Users}
        />
        <StatCard
          label="Scheduled Today"
          value={18}
          subtitle="Classes and events"
          icon={CalendarDays}
          trend={{ value: 5, positive: false }}
        />
      </div>

      {/* Quick Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlowCard glowColor="blue">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Activity size={16} className="text-accent-blue" />
              System Status
            </h3>
            <LivePulse />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-secondary">Scheduler Algorithm</span>
              <span className="font-mono text-accent-blue">Round Robin (q=4)</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-secondary">Queue Length</span>
              <span className="font-mono text-warning">7 waiting</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-secondary">CPU Utilization</span>
              <span className="font-mono text-success">87.3%</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-secondary">Deadlock Status</span>
              <span className="font-mono text-success">No deadlock detected</span>
            </div>
          </div>
        </GlowCard>

        <GlowCard glowColor="os">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <LayoutDashboard size={16} className="text-os-text" />
              OS Concepts Active
            </h3>
            <OSConceptBadge
              concept="Multi-level Queue"
              chapter="OS Ch. 5"
              size="sm"
              pulse
            />
          </div>
          <div className="space-y-2">
            {[
              { concept: "FCFS Scheduling", status: "Active", chapter: "Ch. 5" },
              { concept: "Banker's Algorithm", status: "Monitoring", chapter: "Ch. 8" },
              { concept: "Semaphore Control", status: "Active", chapter: "Ch. 6" },
              { concept: "Memory Allocation", status: "Idle", chapter: "Ch. 9" },
            ].map((item) => (
              <div
                key={item.concept}
                className="flex items-center justify-between text-[13px] py-1"
              >
                <div className="flex items-center gap-2">
                  <span className="text-os-text font-mono text-[11px]">
                    [{item.chapter}]
                  </span>
                  <span className="text-text-secondary">{item.concept}</span>
                </div>
                <span
                  className={`font-mono text-[11px] ${
                    item.status === "Active"
                      ? "text-success"
                      : item.status === "Monitoring"
                      ? "text-warning"
                      : "text-text-tertiary"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
