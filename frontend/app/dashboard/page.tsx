"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  BookOpen,
  Users,
  Building2,
  FileText,
  AlertTriangle,
  Wand2,
  Loader2,
  BarChart3,
} from "lucide-react";
import { dashboardApi } from "@/lib/api";

interface DashboardData {
  semester: { id: number; code: string; name: string } | null;
  stats: {
    totalSections: number;
    totalCourses: number;
    classrooms: number;
    labs: number;
    scheduledClasses: number;
    pendingRequests: number;
    conflicts: number;
    roomUtilization: number;
    totalOfferings: number;
  };
  recentRequests: any[];
  userStats: { myScheduleCount: number; myRequestsCount: number };
}

function StatCard({ icon: Icon, label, value, href, color }: {
  icon: React.ElementType; label: string; value: string | number; href?: string; color: string;
}) {
  const content = (
    <div className="flex items-center gap-3 p-4 bg-bg-secondary border border-border rounded-xl hover:border-border/80 transition-colors">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: `${color}15` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        <p className="text-xs text-text-tertiary">{label}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.get().then((res) => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-accent-blue" size={24} />
      </div>
    );
  }

  if (!data) return <div className="text-text-secondary">Failed to load dashboard.</div>;

  const { stats, semester, recentRequests } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-text-primary">Dashboard</h1>
          {semester && (
            <p className="text-sm text-text-secondary mt-0.5">
              {semester.name} ({semester.code})
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href="/timetable"
            className="flex items-center gap-2 px-3 py-2 text-sm bg-bg-secondary border border-border rounded-lg hover:bg-bg-hover transition-colors text-text-secondary"
          >
            <CalendarDays size={14} />
            View Timetable
          </Link>
          <Link
            href="/admin/auto-schedule"
            className="flex items-center gap-2 px-3 py-2 text-sm bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
          >
            <Wand2 size={14} />
            Auto-Schedule
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Sections" value={stats.totalSections} href="/admin/sections" color="#4f8ef7" />
        <StatCard icon={BookOpen} label="Courses" value={stats.totalCourses} href="/admin/courses" color="#2dd4bf" />
        <StatCard icon={CalendarDays} label="Scheduled Classes" value={stats.scheduledClasses} href="/timetable" color="#22c55e" />
        <StatCard icon={BarChart3} label="Room Utilization" value={`${stats.roomUtilization}%`} color="#f59e0b" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard icon={Building2} label="Classrooms" value={stats.classrooms} href="/admin/rooms" color="#6b7280" />
        <StatCard icon={Building2} label="Labs" value={stats.labs} href="/admin/rooms" color="#a855f7" />
        <StatCard icon={FileText} label="Pending Requests" value={stats.pendingRequests} href="/requests" color={stats.pendingRequests > 0 ? "#f59e0b" : "#22c55e"} />
      </div>

      {/* Conflicts warning */}
      {stats.conflicts > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertTriangle size={20} className="text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-300">
              {stats.conflicts} change request{stats.conflicts !== 1 ? "s" : ""} with conflicts
            </p>
            <p className="text-xs text-red-400/70 mt-0.5">
              Review in Change Requests to resolve resource conflicts.
            </p>
          </div>
          <Link
            href="/requests?status=conflict"
            className="ml-auto text-xs px-3 py-1.5 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Review
          </Link>
        </div>
      )}

      {/* Recent Change Requests */}
      <div className="bg-bg-secondary border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-primary">Recent Change Requests</h2>
          <Link href="/requests" className="text-xs text-accent-blue hover:underline">
            View all
          </Link>
        </div>
        {recentRequests.length === 0 ? (
          <p className="text-sm text-text-tertiary py-4 text-center">No change requests yet.</p>
        ) : (
          <div className="space-y-2">
            {recentRequests.map((req: any) => (
              <div key={req.id} className="flex items-center gap-3 p-2.5 bg-bg-primary rounded-lg border border-border/50">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: req.status === "approved" ? "#22c55e" :
                      req.status === "rejected" ? "#ef4444" :
                      req.status === "conflict" ? "#fb923c" : "#f59e0b"
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">
                    {req.type.replace("_", " ")} — {req.timetableEntry?.courseOffering?.course?.name || "General"}
                  </p>
                  <p className="text-xs text-text-tertiary truncate">
                    by {req.requestedBy?.name} &middot; {req.reason}
                  </p>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                  req.status === "approved" ? "bg-green-500/10 text-green-400" :
                  req.status === "rejected" ? "bg-red-500/10 text-red-400" :
                  req.status === "conflict" ? "bg-orange-500/10 text-orange-400" :
                  "bg-yellow-500/10 text-yellow-400"
                }`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OS Concept Note (subtle) */}
      <div className="text-[10px] font-mono text-text-tertiary text-center opacity-50 pt-4">
        CUIScheduler maps university scheduling to OS concepts: resource allocation, deadlock detection, CPU scheduling
      </div>
    </div>
  );
}
