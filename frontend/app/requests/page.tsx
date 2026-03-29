"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, Loader2, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { changeRequestsApi, timetableApi, sectionsApi, resourcesApi } from "@/lib/api";
import { DAYS, TIME_SLOT_DETAILS, REQUEST_STATUS_COLORS, FEATURE_OS_MAP } from "@/constants/cuiData";

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [resolving, setResolving] = useState<number | null>(null);

  // Form state
  const [formType, setFormType] = useState("room_change");
  const [formReason, setFormReason] = useState("");
  const [formEntryId, setFormEntryId] = useState<number | null>(null);
  const [formDay, setFormDay] = useState("");
  const [formSlot, setFormSlot] = useState<number | null>(null);
  const [formResourceId, setFormResourceId] = useState<number | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRequests();
    timetableApi.get({}).then((res) => setEntries(res.data.entries || []));
    resourcesApi.getAll().then((res) => setResources(res.data));
  }, []);

  async function loadRequests() {
    setLoading(true);
    const params: Record<string, unknown> = {};
    if (statusFilter !== "all") params.status = statusFilter;
    const res = await changeRequestsApi.getAll(params);
    setRequests(res.data);
    setLoading(false);
  }

  useEffect(() => { loadRequests(); }, [statusFilter]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const selectedEntry = entries.find((e: any) => e.id === formEntryId);

    await changeRequestsApi.create({
      semesterId: selectedEntry?.semesterId || 1,
      timetableEntryId: formEntryId,
      type: formType,
      currentDay: selectedEntry?.dayOfWeek || null,
      currentSlot: selectedEntry?.slotIndex ?? null,
      currentResourceId: selectedEntry?.resourceId || null,
      requestedDay: formDay || null,
      requestedSlot: formSlot,
      requestedResourceId: formResourceId,
      reason: formReason,
    });

    setSubmitting(false);
    setShowForm(false);
    setFormReason("");
    setFormEntryId(null);
    loadRequests();
  }

  async function handleResolve(id: number, status: string) {
    setResolving(id);
    await changeRequestsApi.resolve(id, { status });
    setResolving(null);
    loadRequests();
  }

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "approved") return <CheckCircle size={14} className="text-green-400" />;
    if (status === "rejected") return <XCircle size={14} className="text-red-400" />;
    if (status === "conflict") return <AlertTriangle size={14} className="text-orange-400" />;
    return <Clock size={14} className="text-yellow-400" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-text-primary">Change Requests</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Request room or time changes — admin reviews and approves
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
        >
          <Plus size={14} />
          New Request
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2">
        {["all", "pending", "conflict", "approved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
              statusFilter === s
                ? "bg-accent-blue text-white"
                : "bg-bg-secondary border border-border text-text-secondary hover:bg-bg-hover"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Request list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-accent-blue" size={20} />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-text-tertiary">
          <FileText size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No change requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const conflictData = req.conflictDetails ? JSON.parse(req.conflictDetails) : null;
            const alternatives = req.suggestedAlternatives ? JSON.parse(req.suggestedAlternatives) : [];

            return (
              <div key={req.id} className="bg-bg-secondary border border-border rounded-xl p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center gap-2">
                  <StatusIcon status={req.status} />
                  <span className="text-sm font-medium text-text-primary capitalize">
                    {req.type.replace("_", " ")}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                    req.status === "approved" ? "bg-green-500/10 text-green-400" :
                    req.status === "rejected" ? "bg-red-500/10 text-red-400" :
                    req.status === "conflict" ? "bg-orange-500/10 text-orange-400" :
                    "bg-yellow-500/10 text-yellow-400"
                  }`}>
                    {req.status}
                  </span>
                  <span className="ml-auto text-xs text-text-tertiary">
                    by {req.requestedBy?.name}
                  </span>
                </div>

                {/* Entry info */}
                {req.timetableEntry && (
                  <div className="text-sm text-text-secondary">
                    <span className="font-medium">{req.timetableEntry.courseOffering?.course?.code}</span>
                    {" "}{req.timetableEntry.courseOffering?.course?.name}
                    {" "}({req.timetableEntry.courseOffering?.section?.name})
                    {" • "}{req.timetableEntry.resource?.name}
                    {" • "}{req.timetableEntry.dayOfWeek} Slot {req.timetableEntry.slotIndex + 1}
                  </div>
                )}

                {/* Requested change */}
                <div className="text-sm">
                  <span className="text-text-tertiary">Requested: </span>
                  <span className="text-text-secondary">
                    {req.requestedDay && `${req.requestedDay} `}
                    {req.requestedSlot !== null && `Slot ${req.requestedSlot + 1} `}
                    {req.requestedResourceId && resources.find((r: any) => r.id === req.requestedResourceId)?.name}
                  </span>
                </div>

                <div className="text-sm text-text-secondary">
                  <span className="text-text-tertiary">Reason: </span>{req.reason}
                </div>

                {/* Conflict info */}
                {conflictData && (
                  <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-orange-300">
                      <AlertTriangle size={14} />
                      <span className="font-medium">Conflict Detected</span>
                    </div>
                    <p className="text-xs text-orange-400/70 mt-1">{conflictData.message}</p>
                  </div>
                )}

                {/* Suggested alternatives */}
                {alternatives.length > 0 && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-xs font-medium text-blue-300 mb-2">Suggested Alternatives:</p>
                    <div className="space-y-1">
                      {alternatives.slice(0, 3).map((alt: any, i: number) => (
                        <div key={i} className="text-xs text-blue-400/70">
                          {alt.day} Slot {alt.slotIndex + 1} ({alt.startTime}-{alt.endTime}) — {alt.resourceName}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin actions */}
                {req.status === "pending" || req.status === "conflict" ? (
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <button
                      onClick={() => handleResolve(req.id, "approved")}
                      disabled={resolving === req.id}
                      className="px-3 py-1.5 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      {resolving === req.id ? "..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleResolve(req.id, "rejected")}
                      disabled={resolving === req.id}
                      className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                ) : null}

                {/* OS concept tag (subtle) */}
                {req.osConceptTag && (
                  <p className="text-[9px] font-mono text-text-tertiary opacity-50 pt-1">
                    OS: {req.osConceptTag}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Request Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <form
            className="bg-bg-secondary border border-border rounded-xl p-6 max-w-lg w-full mx-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <h3 className="text-lg font-semibold text-text-primary">New Change Request</h3>

            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Request Type</label>
              <select value={formType} onChange={(e) => setFormType(e.target.value)} className="w-full px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary">
                <option value="room_change">Room Change</option>
                <option value="time_change">Time Change</option>
                <option value="swap">Swap (Room + Time)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Current Class</label>
              <select value={formEntryId || ""} onChange={(e) => setFormEntryId(parseInt(e.target.value))} className="w-full px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary">
                <option value="">Select a class</option>
                {entries.map((e: any) => (
                  <option key={e.id} value={e.id}>
                    {e.courseOffering?.course?.code} - {e.courseOffering?.section?.name} ({e.dayOfWeek} Slot {e.slotIndex + 1}, {e.resource?.name})
                  </option>
                ))}
              </select>
            </div>

            {(formType === "time_change" || formType === "swap") && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-tertiary mb-1 block">Requested Day</label>
                  <select value={formDay} onChange={(e) => setFormDay(e.target.value)} className="w-full px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary">
                    <option value="">Select Day</option>
                    {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-tertiary mb-1 block">Requested Slot</label>
                  <select value={formSlot ?? ""} onChange={(e) => setFormSlot(parseInt(e.target.value))} className="w-full px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary">
                    <option value="">Select Slot</option>
                    {TIME_SLOT_DETAILS.map((s) => <option key={s.index} value={s.index}>Slot {s.label} ({s.start})</option>)}
                  </select>
                </div>
              </div>
            )}

            {(formType === "room_change" || formType === "swap") && (
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Requested Room</label>
                <select value={formResourceId || ""} onChange={(e) => setFormResourceId(parseInt(e.target.value))} className="w-full px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary">
                  <option value="">Select Room</option>
                  {resources.filter((r: any) => r.type === "classroom" || r.type === "lab").map((r: any) => (
                    <option key={r.id} value={r.id}>{r.name} ({r.type}, cap: {r.capacity})</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Reason</label>
              <textarea
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                placeholder="Why is this change needed?"
                className="w-full px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary resize-none h-20"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting || !formReason}
                className="flex-1 px-3 py-2 text-sm bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
