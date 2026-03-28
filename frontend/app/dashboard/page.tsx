"use client";

import { useState, useEffect } from "react";
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
  AlertTriangle,
  Bell,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";

interface DashboardData {
  stats: {
    totalResources: number;
    classrooms: number;
    labs: number;
    faculty: number;
    totalBookings: number;
    activeBookings: number;
    readyBookings: number;
    completedBookings: number;
    blockedBookings: number;
    waitingBookings: number;
    newBookings: number;
    conflicts: number;
    unreadNotifs: number;
  };
  recentBookings: {
    id: number;
    processId: string;
    title: string;
    state: string;
    resourceName: string;
    startTime: string;
    endTime: string;
    date: string;
    priority: number;
    algorithmUsed: string;
  }[];
  readyQueue: {
    id: number;
    processId: string;
    title: string;
    durationMinutes: number;
    priority: number;
  }[];
}

const stateColors: Record<string, string> = {
  new: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  ready: "text-green-400 bg-green-400/10 border-green-400/30",
  running: "text-teal-400 bg-teal-400/10 border-teal-400/30",
  waiting: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  completed: "text-gray-400 bg-gray-400/10 border-gray-400/30",
  blocked: "text-red-400 bg-red-400/10 border-red-400/30",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard").then(res => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
      </div>
    );
  }

  const s = data?.stats;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Real-time campus resource scheduling overview"
        breadcrumb={["CUIScheduler", "Dashboard"]}
        osConcepts={[
          { name: "CPU Scheduling", chapter: "OS Ch. 5", description: "Booking requests are processes competing for CPU time." },
          { name: "Resource Allocation", chapter: "OS Ch. 7", description: "Campus resources managed like OS resources." },
        ]}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Resources" value={s?.totalResources || 0} subtitle={`${s?.classrooms || 0} rooms, ${s?.labs || 0} labs, ${s?.faculty || 0} faculty`} icon={Box} osConcept={{ concept: "Resource Pool", chapter: "OS Ch. 7" }} />
        <StatCard label="Active Bookings" value={s?.activeBookings || 0} subtitle={`${s?.readyBookings || 0} ready, ${s?.waitingBookings || 0} waiting`} icon={Clock} osConcept={{ concept: "Process States", chapter: "OS Ch. 3" }} trend={{ value: s?.readyBookings || 0, positive: true }} />
        <StatCard label="Completed" value={s?.completedBookings || 0} subtitle={`of ${s?.totalBookings || 0} total bookings`} icon={CalendarDays} />
        <StatCard label="Conflicts" value={s?.conflicts || 0} subtitle={s?.conflicts ? "Deadlock risk detected" : "System in safe state"} icon={AlertTriangle} osConcept={{ concept: "Deadlock Detection", chapter: "OS Ch. 7" }} trend={s?.conflicts ? { value: s.conflicts, positive: false } : undefined} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <GlowCard glowColor="blue">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Activity size={16} className="text-accent-blue" />
                Recent Bookings
              </h3>
              <LivePulse />
            </div>
            {data?.recentBookings?.length ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {data.recentBookings.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-bg-primary/50 border border-border/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[11px] font-mono font-bold text-accent-blue bg-accent-blue/10 px-1.5 py-0.5 rounded">{b.processId}</span>
                      <div className="min-w-0">
                        <p className="text-[13px] text-text-primary truncate">{b.title}</p>
                        <p className="text-[11px] text-text-tertiary">{b.resourceName} &middot; {b.startTime}–{b.endTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {b.algorithmUsed && <span className="text-[9px] font-mono text-text-tertiary uppercase">{b.algorithmUsed}</span>}
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${stateColors[b.state] || stateColors.new}`}>
                        {b.state}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-tertiary text-center py-8">No bookings yet. Visit the Scheduler to create some.</p>
            )}
          </GlowCard>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Ready Queue */}
          <GlowCard glowColor="teal">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Clock size={16} className="text-accent-teal" />
                Ready Queue
              </h3>
              <OSConceptBadge concept="Ready Queue" chapter="Ch.3" size="sm" />
            </div>
            {data?.readyQueue?.length ? (
              <div className="space-y-2">
                {data.readyQueue.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-2 rounded-md bg-bg-primary/50 border border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-accent-teal">{b.processId}</span>
                      <span className="text-[12px] text-text-secondary truncate max-w-[120px]">{b.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-text-tertiary">{b.durationMinutes}min</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-warning/10 text-warning border border-warning/30">P{b.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-text-tertiary text-center py-4">Queue empty</p>
            )}
          </GlowCard>

          {/* System Status */}
          <GlowCard glowColor="os">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <LayoutDashboard size={16} className="text-os-text" />
                System Status
              </h3>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "New processes", value: s?.newBookings || 0, color: "text-blue-400" },
                { label: "Ready", value: s?.readyBookings || 0, color: "text-green-400" },
                { label: "Running", value: s?.activeBookings || 0, color: "text-teal-400" },
                { label: "Waiting", value: s?.waitingBookings || 0, color: "text-yellow-400" },
                { label: "Blocked", value: s?.blockedBookings || 0, color: "text-red-400" },
                { label: "Completed", value: s?.completedBookings || 0, color: "text-gray-400" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-[13px]">
                  <span className="text-text-secondary">{item.label}</span>
                  <span className={`font-mono font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </GlowCard>

          {/* Notifications */}
          <GlowCard>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Bell size={16} />
                Notifications
              </h3>
              {(s?.unreadNotifs || 0) > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-danger/20 text-danger border border-danger/30">{s?.unreadNotifs} unread</span>
              )}
            </div>
            <a href="/notifications" className="text-[12px] text-accent-blue hover:underline">View all notifications &rarr;</a>
          </GlowCard>
        </div>
      </div>
    </div>
  );
}
