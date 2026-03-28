"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createColumnHelper } from "@tanstack/react-table";
import { PageHeader } from "@/components/layout/PageHeader";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { DataTable } from "@/components/shared/DataTable";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import api from "@/lib/api";
import {
  Plus,
  X,
  GraduationCap,
  Pencil,
  Trash2,
  Save,
  Loader2,
  AlertTriangle,
} from "lucide-react";

/* ─── Faculty type ───────────��───────────────────────────────── */
interface Faculty {
  id: string;
  name: string;
  department: string;
  designation: string;
  maxHours: number;
  currentLoad: number;
}

/* ─── Demo data ───────────���─────────────────────────────���────── */
const DEMO_FACULTY: Faculty[] = [
  { id: "f1", name: "Dr. Ahmed Khan", department: "Computer Science", designation: "Professor", maxHours: 12, currentLoad: 10 },
  { id: "f2", name: "Dr. Sarah Malik", department: "Computer Science", designation: "Associate Professor", maxHours: 14, currentLoad: 14 },
  { id: "f3", name: "Dr. Usman Ali", department: "Computer Science", designation: "Assistant Professor", maxHours: 16, currentLoad: 12 },
  { id: "f4", name: "Dr. Fatima Noor", department: "Electrical Engineering", designation: "Professor", maxHours: 12, currentLoad: 8 },
  { id: "f5", name: "Dr. Hassan Raza", department: "Electrical Engineering", designation: "Associate Professor", maxHours: 14, currentLoad: 15 },
  { id: "f6", name: "Dr. Ayesha Siddiqui", department: "Mechanical Engineering", designation: "Assistant Professor", maxHours: 16, currentLoad: 6 },
  { id: "f7", name: "Dr. Bilal Tariq", department: "Mathematics", designation: "Professor", maxHours: 12, currentLoad: 11 },
  { id: "f8", name: "Dr. Nadia Hussain", department: "Computer Science", designation: "Lecturer", maxHours: 18, currentLoad: 18 },
  { id: "f9", name: "Dr. Imran Shah", department: "Physics", designation: "Associate Professor", maxHours: 14, currentLoad: 9 },
  { id: "f10", name: "Dr. Zara Ahmed", department: "Business Administration", designation: "Assistant Professor", maxHours: 16, currentLoad: 13 },
  { id: "f11", name: "Mr. Kamran Yousaf", department: "Computer Science", designation: "Lecturer", maxHours: 18, currentLoad: 16 },
  { id: "f12", name: "Ms. Rabia Khan", department: "Humanities", designation: "Lecturer", maxHours: 18, currentLoad: 10 },
];

const DEPARTMENTS = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Business Administration",
  "Mathematics",
  "Physics",
  "Humanities",
];

const DESIGNATIONS = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
  "Visiting Faculty",
];

const columnHelper = createColumnHelper<Faculty>();

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);

  useEffect(() => {
    api.get("/resources", { params: { type: "faculty" } }).then(res => {
      setFaculty(res.data.map((r: Record<string, unknown>) => ({
        id: String(r.id), name: r.name, department: r.department || "Computer Science",
        designation: "Faculty", specialization: "",
        email: `${String(r.name).toLowerCase().replace(/\s+/g, ".")}@cuilwah.edu.pk`,
        officeHours: "9:00 AM - 5:00 PM",
        status: r.status === "maintenance" ? "on_leave" : "active",
      })));
    }).catch(() => toast.error("Failed to load faculty"));
  }, []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* Form state */
  const [formName, setFormName] = useState("");
  const [formDepartment, setFormDepartment] = useState("");
  const [formDesignation, setFormDesignation] = useState("");
  const [formMaxHours, setFormMaxHours] = useState(16);
  const [formCurrentLoad, setFormCurrentLoad] = useState(0);

  const openAddModal = () => {
    setEditingFaculty(null);
    setFormName("");
    setFormDepartment("");
    setFormDesignation("");
    setFormMaxHours(16);
    setFormCurrentLoad(0);
    setModalOpen(true);
  };

  const openEditModal = (f: Faculty) => {
    setEditingFaculty(f);
    setFormName(f.name);
    setFormDepartment(f.department);
    setFormDesignation(f.designation);
    setFormMaxHours(f.maxHours);
    setFormCurrentLoad(f.currentLoad);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formName || !formDepartment || !formDesignation) {
      toast.error("All fields are required");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      if (editingFaculty) {
        setFaculty((prev) =>
          prev.map((f) =>
            f.id === editingFaculty.id
              ? { ...f, name: formName, department: formDepartment, designation: formDesignation, maxHours: formMaxHours, currentLoad: formCurrentLoad }
              : f
          )
        );
        toast.success(`${formName} updated`);
      } else {
        const newFaculty: Faculty = {
          id: `f-${Date.now()}`,
          name: formName,
          department: formDepartment,
          designation: formDesignation,
          maxHours: formMaxHours,
          currentLoad: formCurrentLoad,
        };
        setFaculty((prev) => [...prev, newFaculty]);
        toast.success(`${formName} added`);
      }
      setSaving(false);
      setModalOpen(false);
    }, 500);
  };

  const handleDelete = (id: string) => {
    setFaculty((prev) => prev.filter((f) => f.id !== id));
    setDeleteConfirm(null);
    toast.success("Faculty member removed");
  };

  const handleBulkDelete = (selected: Faculty[]) => {
    const ids = new Set(selected.map((f) => f.id));
    setFaculty((prev) => prev.filter((f) => !ids.has(f.id)));
    toast.success(`${selected.length} faculty members removed`);
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Department", "Designation", "Max Hours", "Current Load"];
    const rows = faculty.map((f) => [f.name, f.department, f.designation, f.maxHours, f.currentLoad]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "faculty.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent-blue-soft border border-accent-blue/20 text-[11px] font-bold text-accent-blue">
              {info.getValue().split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <span className="font-semibold text-text-primary">{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor("department", {
        header: "Department",
        cell: (info) => <span className="text-text-secondary text-[12px]">{info.getValue()}</span>,
      }),
      columnHelper.accessor("designation", {
        header: "Designation",
        cell: (info) => (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-bg-tertiary text-text-secondary border border-border/50">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("maxHours", {
        header: "Max Hours",
        cell: (info) => (
          <span className="font-mono text-text-secondary">{info.getValue()}h</span>
        ),
      }),
      columnHelper.accessor("currentLoad", {
        header: "Current Load",
        cell: (info) => {
          const current = info.getValue();
          const max = info.row.original.maxHours;
          const pct = Math.round((current / max) * 100);
          const overloaded = current >= max;
          return (
            <div className="flex items-center gap-2 min-w-[140px]">
              <div className="flex-1 h-2 rounded-full bg-bg-tertiary overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    overloaded
                      ? "bg-danger"
                      : pct > 80
                      ? "bg-warning"
                      : "bg-success"
                  )}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <span
                className={cn(
                  "text-[11px] font-mono font-semibold min-w-[48px] text-right",
                  overloaded ? "text-danger" : pct > 80 ? "text-warning" : "text-success"
                )}
              >
                {current}/{max}h
              </span>
              {overloaded && (
                <AlertTriangle size={12} className="text-danger flex-shrink-0" />
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => openEditModal(row.original)}
              className="p-1.5 rounded-md hover:bg-bg-hover text-text-tertiary hover:text-accent-blue transition-colors"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setDeleteConfirm(row.original.id)}
              className="p-1.5 rounded-md hover:bg-bg-hover text-text-tertiary hover:text-danger transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Management"
        subtitle="Faculty load balancing — distribute teaching hours evenly across processors"
        breadcrumb={["CUIScheduler", "Admin", "Faculty"]}
        osConcepts={[OS_CONCEPTS.LOAD_BALANCE, OS_CONCEPTS.PRIORITY]}
      />

      {/* OS Concept Banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-os-bg/40 border border-os-border/30">
        <GraduationCap size={18} className="text-os-text flex-shrink-0" />
        <p className="text-[13px] text-os-text/80 font-mono">
          Load Balancing — Faculty members are processors. Teaching hours are CPU bursts.
          Overloaded faculty = processor hotspot. Goal: even distribution across all cores.
        </p>
        <OSConceptBadge
          concept="Load Balancing"
          chapter="Ch.5"
          description={OS_CONCEPTS.LOAD_BALANCE.description}
          size="sm"
          pulse={false}
        />
      </div>

      {/* Add Faculty Button */}
      <div className="flex justify-end">
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg bg-accent-blue text-white hover:bg-accent-blue/90 transition-colors shadow-blue-glow"
        >
          <Plus size={16} />
          Add Faculty
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        data={faculty}
        columns={columns}
        searchPlaceholder="Search faculty..."
        enableRowSelection
        onBulkDelete={handleBulkDelete}
        onExportCSV={handleExportCSV}
      />

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-xl border border-border bg-bg-secondary p-6 shadow-lg mx-4"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
                  <GraduationCap size={18} className="text-accent-blue" />
                  {editingFaculty ? "Edit Faculty" : "Add Faculty"}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-md hover:bg-bg-hover text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Dr. Ahmed Khan"
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-blue/50 transition-colors"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                    Department
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary focus:outline-none focus:border-accent-blue/50 transition-colors"
                  >
                    <option value="">Select department...</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                    Designation
                  </label>
                  <select
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary focus:outline-none focus:border-accent-blue/50 transition-colors"
                  >
                    <option value="">Select designation...</option>
                    {DESIGNATIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Max Hours + Current Load */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                      Max Hours/Week
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={formMaxHours}
                      onChange={(e) => setFormMaxHours(Number(e.target.value))}
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary focus:outline-none focus:border-accent-blue/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                      Current Load (hrs)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={40}
                      value={formCurrentLoad}
                      onChange={(e) => setFormCurrentLoad(Number(e.target.value))}
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary focus:outline-none focus:border-accent-blue/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Load Preview */}
                <div className="p-3 rounded-lg bg-bg-tertiary border border-border/50">
                  <div className="flex items-center justify-between text-[12px] mb-2">
                    <span className="text-text-secondary">Load Preview</span>
                    <span
                      className={cn(
                        "font-mono font-semibold",
                        formCurrentLoad >= formMaxHours ? "text-danger" : formCurrentLoad / formMaxHours > 0.8 ? "text-warning" : "text-success"
                      )}
                    >
                      {Math.round((formCurrentLoad / formMaxHours) * 100)}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-bg-primary overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        formCurrentLoad >= formMaxHours
                          ? "bg-danger"
                          : formCurrentLoad / formMaxHours > 0.8
                          ? "bg-warning"
                          : "bg-success"
                      )}
                      style={{
                        width: `${Math.min(Math.round((formCurrentLoad / formMaxHours) * 100), 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-[13px] font-medium rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-border-light transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg bg-accent-blue text-white hover:bg-accent-blue/90 transition-colors shadow-blue-glow"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    {editingFaculty ? "Update" : "Add"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-xl border border-border bg-bg-secondary p-6 shadow-lg mx-4"
            >
              <h3 className="text-lg font-display font-bold text-text-primary mb-2">
                Confirm Removal
              </h3>
              <p className="text-[13px] text-text-secondary mb-5">
                Remove this faculty member? Their scheduled classes will need to be reassigned.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-[13px] font-medium rounded-lg border border-border text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 text-[13px] font-semibold rounded-lg bg-danger text-white hover:bg-danger/90 transition-colors"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
