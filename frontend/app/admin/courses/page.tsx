"use client";

import { useState, useEffect } from "react";
import { BookOpen, Plus, Loader2, Search } from "lucide-react";
import { coursesApi } from "@/lib/api";

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ code: "", name: "", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    coursesApi.getAll().then((res) => { setCourses(res.data); setLoading(false); });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await coursesApi.create(formData);
    const res = await coursesApi.getAll();
    setCourses(res.data);
    setShowForm(false);
    setFormData({ code: "", name: "", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" });
    setSubmitting(false);
  }

  const filtered = courses.filter(
    (c) => c.code.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-text-primary">Courses</h1>
          <p className="text-sm text-text-secondary">{courses.length} courses registered</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors">
          <Plus size={14} />
          Add Course
        </button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm bg-bg-secondary border border-border rounded-lg text-text-primary"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-accent-blue" size={20} /></div>
      ) : (
        <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase">Name</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-text-tertiary uppercase">Credits</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-text-tertiary uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase">Department</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-bg-hover/50">
                  <td className="px-4 py-2.5 font-mono text-accent-blue">{c.code}</td>
                  <td className="px-4 py-2.5 text-text-primary">{c.name}</td>
                  <td className="px-4 py-2.5 text-center text-text-secondary">{c.creditHours}</td>
                  <td className="px-4 py-2.5 text-center">
                    {c.isLab ? (
                      <span className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded">Lab</span>
                    ) : c.isTechnical ? (
                      <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded">Technical</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 bg-gray-500/10 text-gray-400 rounded">General</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-text-tertiary">{c.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <form className="bg-bg-secondary border border-border rounded-xl p-6 max-w-md w-full mx-4 space-y-3" onClick={(e) => e.stopPropagation()} onSubmit={handleCreate}>
            <h3 className="text-lg font-semibold text-text-primary">Add Course</h3>
            <input placeholder="Course Code (e.g., CSC341)" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary" required />
            <input placeholder="Course Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary" required />
            <div className="flex gap-3">
              <input type="number" placeholder="Credits" value={formData.creditHours} onChange={(e) => setFormData({ ...formData, creditHours: parseInt(e.target.value) })} className="w-20 px-3 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-primary" />
              <label className="flex items-center gap-2 text-sm text-text-secondary"><input type="checkbox" checked={formData.isLab} onChange={(e) => setFormData({ ...formData, isLab: e.target.checked })} /> Lab</label>
              <label className="flex items-center gap-2 text-sm text-text-secondary"><input type="checkbox" checked={formData.isTechnical} onChange={(e) => setFormData({ ...formData, isTechnical: e.target.checked })} /> Technical</label>
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
