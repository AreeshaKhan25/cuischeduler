"use client";

import { useState, useEffect } from "react";
import {
  FileText, Plus, Loader2, AlertTriangle, CheckCircle, XCircle, Clock,
  AlertOctagon, Search, Building2,
} from "lucide-react";
import { changeRequestsApi, resourceRequestsApi, resourcesApi, timetableApi } from "@/lib/api";
import { DAYS, TIME_SLOT_DETAILS } from "@/constants/cuiData";

type TabMode = "resource" | "change";

export default function RequestsPage() {
  const [tab, setTab] = useState<TabMode>("resource");
  const [loading, setLoading] = useState(true);

  // ─── Resource Request State ─────────────────────────────────
  const [resources, setResources] = useState<any[]>([]);
  const [resourceRequests, setResourceRequests] = useState<any[]>([]);
  const [selectedResource, setSelectedResource] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [availabilityResult, setAvailabilityResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestReason, setRequestReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  // ─── Change Request State ──────────────────────────────────
  const [changeRequests, setChangeRequests] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [changeFormData, setChangeFormData] = useState({
    type: "room_change", entryId: null as number | null, day: "", slot: null as number | null,
    resourceId: null as number | null, reason: "",
  });
  const [resolving, setResolving] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [resRes, rrRes, crRes, ttRes] = await Promise.all([
      resourcesApi.getAll(),
      resourceRequestsApi.getAll(),
      changeRequestsApi.getAll(),
      timetableApi.get({}),
    ]);
    setResources(resRes.data);
    setResourceRequests(rrRes.data);
    setChangeRequests(crRes.data);
    setEntries(ttRes.data.entries || []);
    setLoading(false);
  }

  // ─── Check Availability ────────────────────────────────────
  async function checkAvailability() {
    if (!selectedResource || !selectedDay || selectedSlot === null) return;
    setChecking(true);
    setAvailabilityResult(null);
    try {
      const res = await resourcesApi.checkAvailability({
        resource_id: selectedResource,
        day: selectedDay,
        slot: selectedSlot,
      });
      setAvailabilityResult(res.data);
    } catch (err) {
      console.error(err);
    }
    setChecking(false);
  }

  // ─── Submit Resource Request ───────────────────────────────
  async function submitResourceRequest() {
    if (!selectedResource || !selectedDay || selectedSlot === null || !requestReason) return;
    setSubmitting(true);
    await resourceRequestsApi.create({
      resourceId: selectedResource,
      dayOfWeek: selectedDay,
      slotIndex: selectedSlot,
      reason: requestReason,
    });
    setSubmitting(false);
    setShowRequestForm(false);
    setRequestReason("");
    setAvailabilityResult(null);
    loadData();
  }

  // ─── Resolve Resource Request (Admin) ──────────────────────
  async function resolveResourceRequest(id: number, status: string) {
    setResolving(id);
    await resourceRequestsApi.resolve(id, { status });
    setResolving(null);
    loadData();
  }

  // ─── Submit Change Request ─────────────────────────────────
  async function submitChangeRequest(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const entry = entries.find((e: any) => e.id === changeFormData.entryId);
    await changeRequestsApi.create({
      semesterId: entry?.semesterId || 1,
      timetableEntryId: changeFormData.entryId,
      type: changeFormData.type,
      currentDay: entry?.dayOfWeek || null,
      currentSlot: entry?.slotIndex ?? null,
      currentResourceId: entry?.resourceId || null,
      requestedDay: changeFormData.day || null,
      requestedSlot: changeFormData.slot,
      requestedResourceId: changeFormData.resourceId,
      reason: changeFormData.reason,
    });
    setSubmitting(false);
    setShowChangeForm(false);
    setChangeFormData({ type: "room_change", entryId: null, day: "", slot: null, resourceId: null, reason: "" });
    loadData();
  }

  async function resolveChangeRequest(id: number, status: string) {
    setResolving(id);
    await changeRequestsApi.resolve(id, { status });
    setResolving(null);
    loadData();
  }

  const classrooms = resources.filter((r) => r.type === "classroom" || r.type === "lab");

  const filteredRR = statusFilter === "all"
    ? resourceRequests
    : resourceRequests.filter((r: any) => r.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-text-primary">Requests</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Check resource availability, request rooms, and manage schedule changes
          </p>
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex rounded-lg border border-border overflow-hidden w-fit">
        <button
          onClick={() => setTab("resource")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
            tab === "resource" ? "bg-accent-blue text-white" : "bg-bg-secondary text-text-secondary hover:bg-bg-hover"
          }`}
        >
          <Building2 size={14} />
          Resource Requests
        </button>
        <button
          onClick={() => setTab("change")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
            tab === "change" ? "bg-accent-blue text-white" : "bg-bg-secondary text-text-secondary hover:bg-bg-hover"
          }`}
        >
          <FileText size={14} />
          Schedule Changes
        </button>
      </div>

      {/* ═══ RESOURCE REQUESTS TAB ═══ */}
      {tab === "resource" && (
        <div className="space-y-4">
          {/* Availability Checker */}
          <div className="bg-bg-secondary border border-border rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Search size={14} />
              Check Resource Availability
            </h2>
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedResource || ""}
                onChange={(e) => { setSelectedResource(parseInt(e.target.value)); setAvailabilityResult(null); }}
                className="px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary"
              >
                <option value="">Select Room/Lab</option>
                {classrooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
                ))}
              </select>
              <select
                value={selectedDay}
                onChange={(e) => { setSelectedDay(e.target.value); setAvailabilityResult(null); }}
                className="px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary"
              >
                <option value="">Select Day</option>
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select
                value={selectedSlot ?? ""}
                onChange={(e) => { setSelectedSlot(parseInt(e.target.value)); setAvailabilityResult(null); }}
                className="px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary"
              >
                <option value="">Select Slot</option>
                {TIME_SLOT_DETAILS.map((s) => (
                  <option key={s.index} value={s.index}>Slot {s.label} ({s.start}-{s.end})</option>
                ))}
              </select>
              <button
                onClick={checkAvailability}
                disabled={!selectedResource || !selectedDay || selectedSlot === null || checking}
                className="px-4 py-2 text-sm bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 disabled:opacity-50 transition-colors"
              >
                {checking ? "Checking..." : "Check"}
              </button>
            </div>

            {/* Availability Result */}
            {availabilityResult && (
              <div className={`p-4 rounded-lg border ${
                availabilityResult.available
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}>
                {availabilityResult.available ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle size={16} />
                      <span className="font-medium">Available!</span>
                    </div>
                    <p className="text-sm text-green-400/70">
                      {availabilityResult.resource?.name} is free on {availabilityResult.day} Slot {availabilityResult.slotIndex + 1}.
                    </p>
                    <button
                      onClick={() => setShowRequestForm(true)}
                      className="px-3 py-1.5 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      Request This Slot
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertOctagon size={16} />
                      <span className="font-medium">Occupied!</span>
                    </div>
                    <div className="text-sm text-red-400/80 space-y-1">
                      <p>
                        <strong>{availabilityResult.resource?.name}</strong> is currently assigned to:
                      </p>
                      <p className="pl-3">
                        {availabilityResult.occupiedBy?.courseCode} — {availabilityResult.occupiedBy?.courseName}
                        <br />
                        Section: {availabilityResult.occupiedBy?.sectionName}
                        <br />
                        Faculty: {availabilityResult.occupiedBy?.facultyName}
                        {availabilityResult.occupiedBy?.isLab && " (Lab session)"}
                      </p>
                    </div>

                    {/* RED BUTTON — "Manage this for me" → escalate to admin */}
                    <button
                      onClick={() => setShowRequestForm(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      <AlertOctagon size={14} />
                      Request Anyway — Send to Admin
                    </button>
                    <p className="text-[10px] text-red-400/50">
                      This will create a conflict/deadlock scenario. Admin will review and resolve it.
                    </p>
                  </div>
                )}

                {/* OS concept note */}
                <p className="text-[9px] font-mono text-text-tertiary mt-2 pt-2 border-t border-border/30">
                  OS: {availabilityResult.osNote}
                </p>
              </div>
            )}
          </div>

          {/* Request Form Modal */}
          {showRequestForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowRequestForm(false)}>
              <div className="bg-bg-secondary border border-border rounded-xl p-6 max-w-md w-full mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-text-primary">
                  {availabilityResult?.available ? "Request Resource" : "⚠️ Request Occupied Resource"}
                </h3>
                {!availabilityResult?.available && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300">
                    <AlertTriangle size={14} className="inline mr-1" />
                    This resource is currently occupied. Your request will create a <strong>deadlock scenario</strong> that admin must resolve.
                  </div>
                )}
                <div className="text-sm text-text-secondary">
                  <p><strong>Resource:</strong> {resources.find((r) => r.id === selectedResource)?.name}</p>
                  <p><strong>Day:</strong> {selectedDay}, <strong>Slot:</strong> {selectedSlot !== null ? selectedSlot + 1 : ""}</p>
                </div>
                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="Why do you need this resource at this time?"
                  className="w-full px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary resize-none h-24"
                  required
                />
                <div className="flex gap-2">
                  <button
                    onClick={submitResourceRequest}
                    disabled={submitting || !requestReason}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 ${
                      availabilityResult?.available
                        ? "bg-accent-blue text-white hover:bg-accent-blue/90"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {submitting ? "Submitting..." : availabilityResult?.available ? "Submit Request" : "Send Conflict to Admin"}
                  </button>
                  <button onClick={() => setShowRequestForm(false)} className="px-4 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Status filter */}
          <div className="flex gap-2">
            {["all", "pending", "conflict", "approved", "rejected"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                  statusFilter === s ? "bg-accent-blue text-white" : "bg-bg-secondary border border-border text-text-secondary hover:bg-bg-hover"
                }`}
              >{s}</button>
            ))}
          </div>

          {/* Resource Requests List */}
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-accent-blue" size={20} /></div>
          ) : filteredRR.length === 0 ? (
            <div className="text-center py-12 text-text-tertiary">
              <Building2 size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No resource requests found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRR.map((rr: any) => (
                <div key={rr.id} className={`bg-bg-secondary border rounded-xl p-4 space-y-2 ${
                  rr.isDeadlock ? "border-red-500/40" : "border-border"
                }`}>
                  <div className="flex items-center gap-2">
                    {rr.isDeadlock ? (
                      <AlertOctagon size={14} className="text-red-400" />
                    ) : rr.status === "approved" ? (
                      <CheckCircle size={14} className="text-green-400" />
                    ) : rr.status === "rejected" ? (
                      <XCircle size={14} className="text-red-400" />
                    ) : (
                      <Clock size={14} className="text-yellow-400" />
                    )}
                    <span className="text-sm font-medium text-text-primary">
                      {rr.resource?.name} — {rr.dayOfWeek} Slot {rr.slotIndex + 1}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                      rr.status === "conflict" ? "bg-red-500/10 text-red-400" :
                      rr.status === "approved" ? "bg-green-500/10 text-green-400" :
                      rr.status === "rejected" ? "bg-red-500/10 text-red-400" :
                      "bg-yellow-500/10 text-yellow-400"
                    }`}>
                      {rr.isDeadlock ? "DEADLOCK" : rr.status}
                    </span>
                    <span className="ml-auto text-xs text-text-tertiary">by {rr.requestedBy?.name}</span>
                  </div>
                  <p className="text-sm text-text-secondary">{rr.reason}</p>

                  {rr.isDeadlock && rr.deadlockDetails && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400/80">
                      <strong>Deadlock:</strong> {JSON.parse(rr.deadlockDetails).description}
                    </div>
                  )}

                  {(rr.status === "pending" || rr.status === "conflict") && (
                    <div className="flex gap-2 pt-2 border-t border-border/50">
                      <button onClick={() => resolveResourceRequest(rr.id, "approved")} disabled={resolving === rr.id}
                        className="px-3 py-1.5 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">
                        {resolving === rr.id ? "..." : rr.isDeadlock ? "Resolve: Approve (Preempt)" : "Approve"}
                      </button>
                      <button onClick={() => resolveResourceRequest(rr.id, "rejected")} disabled={resolving === rr.id}
                        className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                        {rr.isDeadlock ? "Resolve: Deny" : "Reject"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ SCHEDULE CHANGES TAB ═══ */}
      {tab === "change" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowChangeForm(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90">
              <Plus size={14} />
              New Change Request
            </button>
          </div>

          {changeRequests.length === 0 ? (
            <div className="text-center py-12 text-text-tertiary">
              <FileText size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No schedule change requests.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {changeRequests.map((cr: any) => {
                const conflictData = cr.conflictDetails ? JSON.parse(cr.conflictDetails) : null;
                const alternatives = cr.suggestedAlternatives ? JSON.parse(cr.suggestedAlternatives) : [];
                return (
                  <div key={cr.id} className="bg-bg-secondary border border-border rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      {cr.status === "approved" ? <CheckCircle size={14} className="text-green-400" /> :
                       cr.status === "conflict" ? <AlertTriangle size={14} className="text-orange-400" /> :
                       cr.status === "rejected" ? <XCircle size={14} className="text-red-400" /> :
                       <Clock size={14} className="text-yellow-400" />}
                      <span className="text-sm font-medium text-text-primary capitalize">{cr.type.replace("_", " ")}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                        cr.status === "approved" ? "bg-green-500/10 text-green-400" :
                        cr.status === "conflict" ? "bg-orange-500/10 text-orange-400" :
                        cr.status === "rejected" ? "bg-red-500/10 text-red-400" :
                        "bg-yellow-500/10 text-yellow-400"
                      }`}>{cr.status}</span>
                      <span className="ml-auto text-xs text-text-tertiary">by {cr.requestedBy?.name}</span>
                    </div>
                    {cr.timetableEntry && (
                      <p className="text-sm text-text-secondary">
                        {cr.timetableEntry.courseOffering?.course?.code} {cr.timetableEntry.courseOffering?.course?.name}
                        ({cr.timetableEntry.courseOffering?.section?.name}) — {cr.timetableEntry.resource?.name}, {cr.timetableEntry.dayOfWeek} Slot {cr.timetableEntry.slotIndex + 1}
                      </p>
                    )}
                    <p className="text-sm text-text-secondary"><span className="text-text-tertiary">Reason:</span> {cr.reason}</p>
                    {conflictData && (
                      <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg text-xs text-orange-400">{conflictData.message}</div>
                    )}
                    {alternatives.length > 0 && (
                      <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-400">
                        Alternatives: {alternatives.slice(0, 3).map((a: any) => `${a.day} Slot ${a.slotIndex + 1} (${a.resourceName})`).join(", ")}
                      </div>
                    )}
                    {(cr.status === "pending" || cr.status === "conflict") && (
                      <div className="flex gap-2 pt-2 border-t border-border/50">
                        <button onClick={() => resolveChangeRequest(cr.id, "approved")} disabled={resolving === cr.id} className="px-3 py-1.5 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">Approve</button>
                        <button onClick={() => resolveChangeRequest(cr.id, "rejected")} disabled={resolving === cr.id} className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">Reject</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Change Request Form Modal */}
          {showChangeForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowChangeForm(false)}>
              <form className="bg-bg-secondary border border-border rounded-xl p-6 max-w-lg w-full mx-4 space-y-4" onClick={(e) => e.stopPropagation()} onSubmit={submitChangeRequest}>
                <h3 className="text-lg font-semibold text-text-primary">New Schedule Change</h3>
                <select value={changeFormData.type} onChange={(e) => setChangeFormData({ ...changeFormData, type: e.target.value })} className="w-full px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary">
                  <option value="room_change">Room Change</option>
                  <option value="time_change">Time Change</option>
                  <option value="swap">Swap (Room + Time)</option>
                </select>
                <select value={changeFormData.entryId || ""} onChange={(e) => setChangeFormData({ ...changeFormData, entryId: parseInt(e.target.value) })} className="w-full px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary">
                  <option value="">Select current class</option>
                  {entries.map((e: any) => (
                    <option key={e.id} value={e.id}>
                      {e.courseOffering?.course?.code} - {e.courseOffering?.section?.name} ({e.dayOfWeek} Slot {e.slotIndex + 1}, {e.resource?.name})
                    </option>
                  ))}
                </select>
                {(changeFormData.type === "time_change" || changeFormData.type === "swap") && (
                  <div className="grid grid-cols-2 gap-3">
                    <select value={changeFormData.day} onChange={(e) => setChangeFormData({ ...changeFormData, day: e.target.value })} className="px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary">
                      <option value="">Day</option>
                      {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select value={changeFormData.slot ?? ""} onChange={(e) => setChangeFormData({ ...changeFormData, slot: parseInt(e.target.value) })} className="px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary">
                      <option value="">Slot</option>
                      {TIME_SLOT_DETAILS.map((s) => <option key={s.index} value={s.index}>Slot {s.label} ({s.start})</option>)}
                    </select>
                  </div>
                )}
                {(changeFormData.type === "room_change" || changeFormData.type === "swap") && (
                  <select value={changeFormData.resourceId || ""} onChange={(e) => setChangeFormData({ ...changeFormData, resourceId: parseInt(e.target.value) })} className="w-full px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary">
                    <option value="">Select room</option>
                    {classrooms.map((r: any) => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
                  </select>
                )}
                <textarea value={changeFormData.reason} onChange={(e) => setChangeFormData({ ...changeFormData, reason: e.target.value })} placeholder="Reason" className="w-full px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary resize-none h-20" required />
                <div className="flex gap-2">
                  <button type="submit" disabled={submitting || !changeFormData.reason} className="flex-1 px-3 py-2 text-sm bg-accent-blue text-white rounded-lg disabled:opacity-50">{submitting ? "..." : "Submit"}</button>
                  <button type="button" onClick={() => setShowChangeForm(false)} className="px-4 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
