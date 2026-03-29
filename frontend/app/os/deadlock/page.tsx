"use client";

import { useState, useEffect } from "react";
import { AlertOctagon, Plus, Loader2, CheckCircle, RefreshCw, Database, Zap } from "lucide-react";
import { osScenariosApi } from "@/lib/api";

export default function DeadlockPage() {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showManual, setShowManual] = useState(false);
  const [manualForm, setManualForm] = useState({ title: "", description: "", processes: "", resources: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await osScenariosApi.getAll({ type: "deadlock" });
      setScenarios(res.data.scenarios || []);
      setLiveStats(res.data.liveStats || null);
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function createManualScenario(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await osScenariosApi.create({
      type: "deadlock",
      title: manualForm.title,
      description: manualForm.description,
      data: {
        processes: manualForm.processes.split(",").map((p: string) => p.trim()).filter(Boolean),
        resources: manualForm.resources.split(",").map((r: string) => r.trim()).filter(Boolean),
        type: "manual_entry",
      },
      source: "manual",
    });
    setSubmitting(false);
    setShowManual(false);
    setManualForm({ title: "", description: "", processes: "", resources: "" });
    loadData();
  }

  const activeDeadlocks = scenarios.filter((s) => s.status === "active");
  const resolvedDeadlocks = scenarios.filter((s) => s.status === "resolved");
  const systemGenerated = scenarios.filter((s) => s.source === "system");
  const manualEntries = scenarios.filter((s) => s.source === "manual");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-text-primary">Deadlock Detection & Resolution</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            OS Ch.7 — Real deadlocks from resource conflicts + manual scenarios
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} className="flex items-center gap-2 px-3 py-2 text-sm bg-bg-secondary border border-border rounded-lg text-text-secondary hover:bg-bg-hover">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowManual(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90">
            <Plus size={14} /> Manual Scenario
          </button>
        </div>
      </div>

      {/* Live System Stats */}
      {liveStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`p-4 rounded-xl border ${liveStats.activeDeadlocks > 0 ? "bg-red-500/10 border-red-500/30" : "bg-bg-secondary border-border"}`}>
            <p className={`text-2xl font-bold ${liveStats.activeDeadlocks > 0 ? "text-red-400" : "text-text-primary"}`}>{liveStats.activeDeadlocks}</p>
            <p className="text-xs text-text-tertiary">Active Deadlocks</p>
          </div>
          <div className="p-4 bg-bg-secondary border border-border rounded-xl">
            <p className="text-2xl font-bold text-yellow-400">{liveStats.conflictRequests}</p>
            <p className="text-xs text-text-tertiary">Conflict Requests</p>
          </div>
          <div className="p-4 bg-bg-secondary border border-border rounded-xl">
            <p className="text-2xl font-bold text-text-primary">{liveStats.pendingRequests}</p>
            <p className="text-xs text-text-tertiary">Pending Requests</p>
          </div>
          <div className="p-4 bg-bg-secondary border border-border rounded-xl">
            <p className="text-2xl font-bold text-accent-blue">{liveStats.totalScheduledClasses}</p>
            <p className="text-xs text-text-tertiary">Scheduled Classes</p>
          </div>
        </div>
      )}

      {/* OS Concept Explanation */}
      <div className="p-4 bg-bg-secondary border border-border rounded-xl">
        <h3 className="text-sm font-semibold text-text-primary mb-2">How Deadlocks Work Here</h3>
        <div className="text-xs text-text-secondary space-y-1">
          <p><strong>System-detected:</strong> When a user requests a room that is occupied, the system detects resource contention — Process A holds Resource R, Process B requests it.</p>
          <p><strong>Resolution strategies (OS Ch.7):</strong></p>
          <ul className="list-disc list-inside pl-2 space-y-0.5">
            <li><strong>Preemption:</strong> Admin approves → existing allocation removed</li>
            <li><strong>Process termination:</strong> Admin rejects → requesting process denied</li>
            <li><strong>Rollback:</strong> Admin suggests alternative slot/room</li>
          </ul>
          <p><strong>Manual:</strong> Create custom scenarios for demonstration.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-accent-blue" size={20} /></div>
      ) : (
        <>
          {activeDeadlocks.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                <AlertOctagon size={14} /> Active Deadlocks ({activeDeadlocks.length})
              </h2>
              {activeDeadlocks.map((s) => {
                let data: any = {};
                try { data = typeof s.data === "string" ? JSON.parse(s.data) : s.data; } catch {}
                return (
                  <div key={s.id} className="bg-red-500/5 border border-red-500/30 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertOctagon size={14} className="text-red-400" />
                      <span className="text-sm font-medium text-text-primary">{s.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-red-500/20 text-red-400 rounded">{s.source.toUpperCase()}</span>
                    </div>
                    <p className="text-sm text-text-secondary">{s.description}</p>
                    {data.type === "resource_contention" && (
                      <div className="p-3 bg-bg-secondary rounded-lg text-xs font-mono space-y-1">
                        <p><span className="text-red-400">Holding:</span> {data.holdingProcess} ({data.holdingCourse})</p>
                        <p><span className="text-yellow-400">Requesting:</span> {data.requestingUser}</p>
                        <p><span className="text-text-tertiary">Resource:</span> {data.resource} — {data.day} Slot {(data.slot || 0) + 1}</p>
                      </div>
                    )}
                    {data.processes && (
                      <div className="p-3 bg-bg-secondary rounded-lg text-xs font-mono">
                        <p>Processes: {Array.isArray(data.processes) ? data.processes.join(", ") : data.processes}</p>
                        {data.resources && <p>Resources: {Array.isArray(data.resources) ? data.resources.join(", ") : data.resources}</p>}
                      </div>
                    )}
                    <p className="text-[9px] font-mono text-text-tertiary">Created: {new Date(s.createdAt).toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          )}

          {resolvedDeadlocks.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-green-400 flex items-center gap-2">
                <CheckCircle size={14} /> Resolved ({resolvedDeadlocks.length})
              </h2>
              {resolvedDeadlocks.map((s) => (
                <div key={s.id} className="bg-bg-secondary border border-border rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-400" />
                    <span className="text-sm text-text-primary">{s.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-green-500/10 text-green-400 rounded">RESOLVED</span>
                  </div>
                  <p className="text-sm text-text-secondary">{s.description}</p>
                  {s.resolution && <p className="text-xs text-green-400/70">Resolution: {s.resolution}</p>}
                </div>
              ))}
            </div>
          )}

          {scenarios.length === 0 && (
            <div className="text-center py-12 text-text-tertiary">
              <Database size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No deadlock scenarios yet.</p>
              <p className="text-xs mt-1">Auto-detected when users request occupied resources, or create manual scenarios.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-bg-secondary border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={12} className="text-yellow-400" />
                <span className="text-xs font-semibold text-text-primary">System-Generated</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{systemGenerated.length}</p>
              <p className="text-[10px] text-text-tertiary">From real resource conflicts</p>
            </div>
            <div className="p-3 bg-bg-secondary border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Plus size={12} className="text-accent-blue" />
                <span className="text-xs font-semibold text-text-primary">Manual Entries</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{manualEntries.length}</p>
              <p className="text-[10px] text-text-tertiary">Custom scenarios</p>
            </div>
          </div>
        </>
      )}

      {/* Manual Scenario Form */}
      {showManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowManual(false)}>
          <form className="bg-bg-secondary border border-border rounded-xl p-6 max-w-md w-full mx-4 space-y-3" onClick={(e) => e.stopPropagation()} onSubmit={createManualScenario}>
            <h3 className="text-lg font-semibold text-text-primary">Create Deadlock Scenario</h3>
            <input placeholder="Title (e.g., Circular Wait Demo)" value={manualForm.title} onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })} className="w-full px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary" required />
            <textarea placeholder="Description" value={manualForm.description} onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })} className="w-full px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary resize-none h-20" required />
            <input placeholder="Processes (P1, P2, P3)" value={manualForm.processes} onChange={(e) => setManualForm({ ...manualForm, processes: e.target.value })} className="w-full px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary" />
            <input placeholder="Resources (R1, R2, R3)" value={manualForm.resources} onChange={(e) => setManualForm({ ...manualForm, resources: e.target.value })} className="w-full px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary" />
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="flex-1 px-3 py-2 text-sm bg-accent-blue text-white rounded-lg disabled:opacity-50">{submitting ? "Creating..." : "Create"}</button>
              <button type="button" onClick={() => setShowManual(false)} className="px-4 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
