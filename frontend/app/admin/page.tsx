"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { GlowCard } from "@/components/ui/GlowCard";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  Users,
  Box,
  CalendarDays,
  AlertTriangle,
  DoorOpen,
  Monitor,
  GraduationCap,
  UserCog,
  Settings,
  Save,
  Activity,
  Clock,
  Shield,
  Cpu,
  ArrowRight,
} from "lucide-react";

/* ─── Demo activity log ──────────────────────────────────────── */
const RECENT_ACTIVITY = [
  {
    id: 1,
    action: "Room CS-201 status changed to maintenance",
    user: "Admin",
    time: "2 min ago",
    type: "resource",
  },
  {
    id: 2,
    action: "New faculty Dr. Sarah added to CS department",
    user: "Admin",
    time: "15 min ago",
    type: "user",
  },
  {
    id: 3,
    action: "Scheduling algorithm changed to Round Robin (q=4)",
    user: "System",
    time: "1 hour ago",
    type: "settings",
  },
  {
    id: 4,
    action: "Bulk import: 12 classrooms added to Building A",
    user: "Admin",
    time: "3 hours ago",
    type: "resource",
  },
  {
    id: 5,
    action: "User role updated: ali@cuilwah.edu.pk -> faculty",
    user: "Admin",
    time: "5 hours ago",
    type: "user",
  },
  {
    id: 6,
    action: "Deadlock detected and auto-resolved via preemption",
    user: "System",
    time: "6 hours ago",
    type: "system",
  },
];

const ACTIVITY_COLORS: Record<string, string> = {
  resource: "text-accent-blue",
  user: "text-accent-teal",
  settings: "text-warning",
  system: "text-success",
};

export default function AdminPage() {
  const [algorithm, setAlgorithm] = useState<string>("RR");
  const [quantum, setQuantum] = useState(4);
  const [priorityAging, setPriorityAging] = useState(true);
  const [maxConcurrent, setMaxConcurrent] = useState(5);
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("System settings saved successfully");
    }, 1000);
  };

  const quickActions = [
    {
      label: "Manage Rooms",
      href: "/admin/rooms",
      icon: DoorOpen,
      color: "accent-blue",
      count: 45,
    },
    {
      label: "Manage Labs",
      href: "/admin/labs",
      icon: Monitor,
      color: "accent-teal",
      count: 12,
    },
    {
      label: "Manage Faculty",
      href: "/admin/faculty",
      icon: GraduationCap,
      color: "warning",
      count: 67,
    },
    {
      label: "Manage Users",
      href: "/admin/users",
      icon: UserCog,
      color: "success",
      count: 234,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="System administration — kernel-mode operations for campus resource management"
        breadcrumb={["CUIScheduler", "Admin"]}
        osConcepts={[
          OS_CONCEPTS.PRIORITY,
          OS_CONCEPTS.LOAD_BALANCE,
          OS_CONCEPTS.ROUND_ROBIN,
        ]}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={234}
          subtitle="Registered processes"
          icon={Users}
          osConcept={{
            concept: "Process Table",
            chapter: "Ch.3",
            description: "Total registered processes in the system process table",
          }}
          trend={{ value: 8, positive: true }}
        />
        <StatCard
          label="Total Resources"
          value={57}
          subtitle="Rooms + Labs"
          icon={Box}
          osConcept={{
            concept: "Resource Pool",
            chapter: "Ch.7",
            description: "Total allocatable resources in the system",
          }}
        />
        <StatCard
          label="Total Bookings"
          value={1247}
          subtitle="All time scheduled"
          icon={CalendarDays}
          trend={{ value: 15, positive: true }}
        />
        <StatCard
          label="Active Conflicts"
          value={3}
          subtitle="Deadlock / contention"
          icon={AlertTriangle}
          osConcept={{
            concept: "Deadlock Detection",
            chapter: "Ch.7",
            description: "Active resource conflicts requiring resolution",
          }}
          trend={{ value: 2, positive: false }}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <a key={action.label} href={action.href}>
              <GlowCard
                glowColor={action.color === "accent-blue" ? "blue" : action.color === "accent-teal" ? "teal" : action.color}
                className="cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg border",
                        action.color === "accent-blue" && "bg-accent-blue-soft border-accent-blue/20",
                        action.color === "accent-teal" && "bg-accent-teal-soft border-accent-teal/20",
                        action.color === "warning" && "bg-warning-soft border-warning/20",
                        action.color === "success" && "bg-success-soft border-success/20"
                      )}
                    >
                      <Icon
                        size={20}
                        className={cn(
                          action.color === "accent-blue" && "text-accent-blue",
                          action.color === "accent-teal" && "text-accent-teal",
                          action.color === "warning" && "text-warning",
                          action.color === "success" && "text-success"
                        )}
                      />
                    </div>
                    <div>
                      <span className="text-[14px] font-semibold text-text-primary block">
                        {action.label}
                      </span>
                      <span className="text-[11px] text-text-tertiary font-mono">
                        {action.count} entries
                      </span>
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-text-tertiary group-hover:text-text-primary group-hover:translate-x-1 transition-all"
                  />
                </div>
              </GlowCard>
            </a>
          );
        })}
      </div>

      {/* Settings + Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Settings */}
        <GlowCard glowColor="os">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Settings size={16} className="text-os-text" />
              System Settings
            </h3>
            <OSConceptBadge
              concept="Kernel Parameters"
              chapter="Ch.2"
              description="System-level configuration — like kernel tuning parameters that control scheduling behavior"
              size="sm"
              pulse={false}
            />
          </div>

          <div className="space-y-5">
            {/* Scheduling Algorithm */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
                  Default Scheduling Algorithm
                </label>
                <OSConceptBadge
                  concept="CPU Scheduler"
                  chapter="Ch.5"
                  description="Choose which scheduling algorithm processes booking requests"
                  size="sm"
                  pulse={false}
                />
              </div>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary focus:outline-none focus:border-os-border/50 transition-colors"
              >
                <option value="FCFS">First Come First Served (FCFS)</option>
                <option value="SJF">Shortest Job First (SJF)</option>
                <option value="RR">Round Robin (RR)</option>
                <option value="PRIORITY">Priority Scheduling</option>
              </select>
            </div>

            {/* Round Robin Quantum */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
                  Round Robin Quantum: <span className="text-os-text">{quantum}</span> time units
                </label>
                <OSConceptBadge
                  concept="Time Quantum"
                  chapter="Ch.5"
                  description="Time slice allocated to each process before context switch. Smaller = more fair, larger = fewer switches."
                  size="sm"
                  pulse={false}
                />
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={quantum}
                onChange={(e) => setQuantum(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-bg-tertiary accent-os-border"
              />
              <div className="flex justify-between text-[10px] text-text-tertiary font-mono mt-1">
                <span>1 (high overhead)</span>
                <span>20 (low fairness)</span>
              </div>
            </div>

            {/* Priority Aging Toggle */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider block">
                    Priority Aging
                  </label>
                  <span className="text-[11px] text-text-tertiary">
                    Gradually increase priority of waiting processes
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <OSConceptBadge
                    concept="Aging"
                    chapter="Ch.5"
                    description="Prevents starvation by incrementing priority of long-waiting processes"
                    size="sm"
                    pulse={false}
                  />
                  <button
                    onClick={() => setPriorityAging(!priorityAging)}
                    className={cn(
                      "relative w-11 h-6 rounded-full transition-colors duration-200",
                      priorityAging ? "bg-success" : "bg-bg-tertiary border border-border"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
                        priorityAging && "translate-x-5"
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Max Concurrent Bookings */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
                  Max Concurrent Bookings: <span className="text-os-text">{maxConcurrent}</span>
                </label>
                <OSConceptBadge
                  concept="Semaphore Count"
                  chapter="Ch.6"
                  description="Maximum concurrent resource allocations — like a counting semaphore max value"
                  size="sm"
                  pulse={false}
                />
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={maxConcurrent}
                onChange={(e) => setMaxConcurrent(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-bg-tertiary accent-os-border"
              />
              <div className="flex justify-between text-[10px] text-text-tertiary font-mono mt-1">
                <span>1 (sequential)</span>
                <span>20 (high parallelism)</span>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold rounded-lg transition-all duration-200",
                saving
                  ? "bg-os-border/50 cursor-not-allowed text-os-text/50"
                  : "bg-os-bg border border-os-border text-os-text hover:shadow-os-glow"
              )}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Cpu size={14} className="animate-spin" />
                  Updating kernel parameters...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save size={14} />
                  Save Settings
                </span>
              )}
            </button>
          </div>
        </GlowCard>

        {/* Recent Activity Log */}
        <GlowCard glowColor="blue">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Activity size={16} className="text-accent-blue" />
              Recent Admin Activity
            </h3>
            <OSConceptBadge
              concept="Audit Log"
              chapter="Ch.14"
              description="System call trace — every privileged operation is logged for audit"
              size="sm"
              pulse={false}
            />
          </div>

          <div className="space-y-1">
            {RECENT_ACTIVITY.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 py-3 border-b border-border/30 last:border-0"
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                    ACTIVITY_COLORS[item.type] || "text-text-tertiary"
                  )}
                  style={{
                    backgroundColor:
                      item.type === "resource"
                        ? "#4f8ef7"
                        : item.type === "user"
                        ? "#2dd4bf"
                        : item.type === "settings"
                        ? "#f59e0b"
                        : "#22c55e",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-text-primary leading-snug">
                    {item.action}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-text-tertiary font-mono">
                      {item.user}
                    </span>
                    <span className="text-text-tertiary">·</span>
                    <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                      <Clock size={10} />
                      {item.time}
                    </span>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border",
                    item.type === "resource" && "bg-accent-blue-soft text-accent-blue border-accent-blue/20",
                    item.type === "user" && "bg-accent-teal-soft text-accent-teal border-accent-teal/20",
                    item.type === "settings" && "bg-warning-soft text-warning border-warning/20",
                    item.type === "system" && "bg-success-soft text-success border-success/20"
                  )}
                >
                  {item.type}
                </span>
              </motion.div>
            ))}
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
