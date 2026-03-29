"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Loader2, ChevronRight } from "lucide-react";
import { sectionsApi } from "@/lib/api";
import { PROGRAMS } from "@/constants/cuiData";

export default function SectionsPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", program: "BCS", semester: 1, strength: 50, department: "Computer Science" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    sectionsApi.getAll().then((res) => { setSections(res.data); setLoading(false); });
  }, []);

  async function loadOfferings(sectionId: number) {
    const res = await sectionsApi.getById(sectionId);
    setSelectedSection(res.data);
    setOfferings(res.data.courseOfferings || []);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await sectionsApi.create(formData);
    const res = await sectionsApi.getAll();
    setSections(res.data);
    setShowForm(false);
    setFormData({ name: "", program: "BCS", semester: 1, strength: 50, department: "Computer Science" });
    setSubmitting(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-text-primary">Sections</h1>
          <p className="text-sm text-text-secondary">{sections.length} sections</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors">
          <Plus size={14} />
          Add Section
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-accent-blue" size={20} /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Sections list */}
          <div className="bg-bg-secondary border border-border rounded-xl p-3 space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => loadOfferings(s.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                  selectedSection?.id === s.id ? "bg-accent-blue/10 border border-accent-blue/20" : "hover:bg-bg-hover border border-transparent"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">{s.name}</p>
                  <p className="text-xs text-text-tertiary">
                    {s.program} &middot; Sem {s.semester} &middot; {s.strength} students
                    &middot; {s._count?.courseOfferings || 0} courses
                  </p>
                </div>
                <ChevronRight size={14} className="text-text-tertiary" />
              </button>
            ))}
          </div>

          {/* Section detail / offerings */}
          <div className="bg-bg-secondary border border-border rounded-xl p-4">
            {selectedSection ? (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-text-primary">{selectedSection.name}</h2>
                <p className="text-sm text-text-tertiary">
                  {selectedSection.program} — Semester {selectedSection.semester} — {selectedSection.strength} students
                </p>

                <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mt-4">
                  Course Offerings ({offerings.length})
                </h3>
                <div className="space-y-2">
                  {offerings.map((o: any) => (
                    <div key={o.id} className="p-2.5 bg-bg-primary border border-border/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-mono text-accent-blue">{o.course?.code}</span>
                          <span className="text-sm text-text-primary ml-2">{o.course?.name}</span>
                        </div>
                        <div className="text-xs text-text-tertiary">
                          {o.classesPerWeek}×/wk {o.labsPerWeek > 0 ? `+ ${o.labsPerWeek} lab` : ""}
                        </div>
                      </div>
                      <p className="text-xs text-text-tertiary mt-0.5">
                        Faculty: {o.faculty?.name || "Not assigned"}
                        &middot; Scheduled: {o._count?.timetableEntries || 0} slots
                      </p>
                    </div>
                  ))}
                  {offerings.length === 0 && (
                    <p className="text-sm text-text-tertiary py-4 text-center">No course offerings yet.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-text-tertiary">
                <Users size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Select a section to view its courses</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <form className="bg-bg-secondary border border-border rounded-xl p-6 max-w-md w-full mx-4 space-y-3" onClick={(e) => e.stopPropagation()} onSubmit={handleCreate}>
            <h3 className="text-lg font-semibold text-text-primary">Add Section</h3>
            <input placeholder="Section Name (e.g., BCS-1C)" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary" required />
            <select value={formData.program} onChange={(e) => setFormData({ ...formData, program: e.target.value })} className="w-full px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary">
              {PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="flex gap-3">
              <input type="number" placeholder="Semester" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })} className="w-24 px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary" min={1} max={8} />
              <input type="number" placeholder="Strength" value={formData.strength} onChange={(e) => setFormData({ ...formData, strength: parseInt(e.target.value) })} className="w-24 px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="flex-1 px-3 py-2 text-sm bg-accent-blue text-white rounded-lg disabled:opacity-50">{submitting ? "Creating..." : "Create"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
