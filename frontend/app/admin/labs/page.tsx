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
  Monitor,
  Pencil,
  Trash2,
  Wrench,
  Save,
  Loader2,
} from "lucide-react";

/* ─── Lab type ───────────────────────────────────────────────── */
interface Lab {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  features: string[];
  status: "available" | "occupied" | "maintenance";
}

/* ─── Demo data ──────────────────────────────────────────────── */
const DEMO_LABS: Lab[] = [
  { id: "l1", name: "CS Lab-1", building: "Academic Block A", floor: 1, capacity: 40, features: ["Windows PCs", "Projector", "AC", "Internet"], status: "available" },
  { id: "l2", name: "CS Lab-2", building: "Academic Block A", floor: 1, capacity: 35, features: ["Linux PCs", "Projector", "AC", "Internet", "GPU Servers"], status: "occupied" },
  { id: "l3", name: "CS Lab-3", building: "Academic Block A", floor: 2, capacity: 30, features: ["Windows PCs", "AC", "Internet"], status: "available" },
  { id: "l4", name: "Network Lab", building: "Academic Block A", floor: 2, capacity: 25, features: ["Cisco Routers", "Switches", "Projector", "AC"], status: "available" },
  { id: "l5", name: "EE Lab-1", building: "Engineering Block", floor: 1, capacity: 30, features: ["Oscilloscopes", "Signal Generators", "Power Supplies", "AC"], status: "occupied" },
  { id: "l6", name: "EE Lab-2", building: "Engineering Block", floor: 2, capacity: 25, features: ["PLC Equipment", "AC", "Internet"], status: "maintenance" },
  { id: "l7", name: "Physics Lab", building: "Science Block", floor: 1, capacity: 35, features: ["Lab Equipment", "Projector", "AC"], status: "available" },
  { id: "l8", name: "Chemistry Lab", building: "Science Block", floor: 1, capacity: 30, features: ["Fume Hoods", "Lab Equipment", "Safety Showers", "AC"], status: "available" },
  { id: "l9", name: "Digital Logic Lab", building: "Academic Block A", floor: 3, capacity: 28, features: ["FPGA Boards", "Logic Analyzers", "AC", "Internet"], status: "available" },
  { id: "l10", name: "Software Lab", building: "Academic Block B", floor: 2, capacity: 45, features: ["Windows PCs", "Mac Stations", "Projector", "AC", "Internet", "VR Headsets"], status: "occupied" },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  available: { bg: "bg-success-soft", text: "text-success", border: "border-success/30", dot: "#22c55e" },
  occupied: { bg: "bg-warning-soft", text: "text-warning", border: "border-warning/30", dot: "#f59e0b" },
  maintenance: { bg: "bg-danger-soft", text: "text-danger", border: "border-danger/30", dot: "#ef4444" },
};

const BUILDINGS = ["Academic Block A", "Academic Block B", "Engineering Block", "Science Block", "Main Block"];
const ALL_FEATURES = [
  "Windows PCs", "Linux PCs", "Mac Stations", "GPU Servers", "Projector", "AC",
  "Internet", "Cisco Routers", "Switches", "FPGA Boards", "Logic Analyzers",
  "Oscilloscopes", "Signal Generators", "Power Supplies", "PLC Equipment",
  "Lab Equipment", "Fume Hoods", "Safety Showers", "VR Headsets",
];

const columnHelper = createColumnHelper<Lab>();

export default function LabsPage() {
  const [labs, setLabs] = useState<Lab[]>([]);

  useEffect(() => {
    api.get("/resources", { params: { type: "lab" } }).then(res => {
      setLabs(res.data.map((r: Record<string, unknown>) => ({
        id: String(r.id), name: r.name, building: r.building, floor: r.floor,
        capacity: r.capacity, status: r.status || "available",
        software: Array.isArray(r.features) ? r.features : [],
        computers: r.capacity || 30,
      })));
    }).catch(() => toast.error("Failed to load labs"));
  }, []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* Form state */
  const [formName, setFormName] = useState("");
  const [formBuilding, setFormBuilding] = useState("");
  const [formFloor, setFormFloor] = useState(1);
  const [formCapacity, setFormCapacity] = useState(30);
  const [formStatus, setFormStatus] = useState<Lab["status"]>("available");
  const [formFeatures, setFormFeatures] = useState<string[]>([]);

  const openAddModal = () => {
    setEditingLab(null);
    setFormName("");
    setFormBuilding("");
    setFormFloor(1);
    setFormCapacity(30);
    setFormStatus("available");
    setFormFeatures([]);
    setModalOpen(true);
  };

  const openEditModal = (lab: Lab) => {
    setEditingLab(lab);
    setFormName(lab.name);
    setFormBuilding(lab.building);
    setFormFloor(lab.floor);
    setFormCapacity(lab.capacity);
    setFormStatus(lab.status);
    setFormFeatures([...lab.features]);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formName || !formBuilding) {
      toast.error("Name and building are required");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      if (editingLab) {
        setLabs((prev) =>
          prev.map((l) =>
            l.id === editingLab.id
              ? { ...l, name: formName, building: formBuilding, floor: formFloor, capacity: formCapacity, status: formStatus, features: formFeatures }
              : l
          )
        );
        toast.success(`Lab ${formName} updated`);
      } else {
        const newLab: Lab = {
          id: `l-${Date.now()}`,
          name: formName,
          building: formBuilding,
          floor: formFloor,
          capacity: formCapacity,
          status: formStatus,
          features: formFeatures,
        };
        setLabs((prev) => [...prev, newLab]);
        toast.success(`Lab ${formName} created`);
      }
      setSaving(false);
      setModalOpen(false);
    }, 500);
  };

  const handleDelete = (id: string) => {
    setLabs((prev) => prev.filter((l) => l.id !== id));
    setDeleteConfirm(null);
    toast.success("Lab deleted");
  };

  const toggleMaintenance = (lab: Lab) => {
    setLabs((prev) =>
      prev.map((l) =>
        l.id === lab.id
          ? { ...l, status: l.status === "maintenance" ? "available" : "maintenance" }
          : l
      )
    );
    toast.success(
      lab.status === "maintenance"
        ? `${lab.name} back to available`
        : `${lab.name} set to maintenance`
    );
  };

  const handleBulkDelete = (selectedLabs: Lab[]) => {
    const ids = new Set(selectedLabs.map((l) => l.id));
    setLabs((prev) => prev.filter((l) => !ids.has(l.id)));
    toast.success(`${selectedLabs.length} labs deleted`);
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Building", "Floor", "Capacity", "Status", "Features"];
    const rows = labs.map((l) => [l.name, l.building, l.floor, l.capacity, l.status, l.features.join("; ")]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "labs.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const toggleFeature = (feature: string) => {
    setFormFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <span className="font-semibold font-mono text-accent-teal">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("building", {
        header: "Building",
        cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
      }),
      columnHelper.accessor("floor", {
        header: "Floor",
        cell: (info) => (
          <span className="font-mono text-text-secondary">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("capacity", {
        header: "Capacity",
        cell: (info) => (
          <span className="font-mono font-semibold text-text-primary">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("features", {
        header: "Features",
        enableSorting: false,
        cell: (info) => (
          <div className="flex flex-wrap gap-1">
            {info.getValue().slice(0, 3).map((f) => (
              <span
                key={f}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-accent-teal-soft text-accent-teal border border-accent-teal/20"
              >
                {f}
              </span>
            ))}
            {info.getValue().length > 3 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-bg-tertiary text-text-tertiary border border-border/50">
                +{info.getValue().length - 3}
              </span>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const s = STATUS_STYLES[info.getValue()];
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border",
                s.bg, s.text, s.border
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
              {info.getValue()}
            </span>
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
              className="p-1.5 rounded-md hover:bg-bg-hover text-text-tertiary hover:text-accent-teal transition-colors"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => toggleMaintenance(row.original)}
              className={cn(
                "p-1.5 rounded-md hover:bg-bg-hover transition-colors",
                row.original.status === "maintenance"
                  ? "text-warning"
                  : "text-text-tertiary hover:text-warning"
              )}
              title="Toggle maintenance"
            >
              <Wrench size={14} />
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
        title="Lab Management"
        subtitle="CRUD operations on laboratory resources — specialized memory pages with device features"
        breadcrumb={["CUIScheduler", "Admin", "Labs"]}
        osConcepts={[OS_CONCEPTS.MEMORY_BITMAP, OS_CONCEPTS.SEMAPHORE]}
      />

      {/* OS Concept Banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-os-bg/40 border border-os-border/30">
        <Monitor size={18} className="text-os-text flex-shrink-0" />
        <p className="text-[13px] text-os-text/80 font-mono">
          Labs are specialized memory pages with attached I/O devices (features). Semaphore controls concurrent access to shared equipment.
        </p>
        <OSConceptBadge
          concept="I/O Devices"
          chapter="Ch.13"
          description="Lab features represent attached I/O devices — each requires a device driver (configuration) to operate"
          size="sm"
          pulse={false}
        />
      </div>

      {/* Add Lab Button */}
      <div className="flex justify-end">
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg bg-accent-teal text-white hover:bg-accent-teal/90 transition-colors shadow-teal-glow"
        >
          <Plus size={16} />
          Add Lab
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        data={labs}
        columns={columns}
        searchPlaceholder="Search labs..."
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
              className="w-full max-w-lg rounded-xl border border-border bg-bg-secondary p-6 shadow-lg mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
                  <Monitor size={18} className="text-accent-teal" />
                  {editingLab ? "Edit Lab" : "Add Lab"}
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
                    Lab Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="CS Lab-1"
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-teal/50 transition-colors"
                  />
                </div>

                {/* Building */}
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                    Building
                  </label>
                  <select
                    value={formBuilding}
                    onChange={(e) => setFormBuilding(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary focus:outline-none focus:border-accent-teal/50 transition-colors"
                  >
                    <option value="">Select building...</option>
                    {BUILDINGS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Floor + Capacity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                      Floor
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={formFloor}
                      onChange={(e) => setFormFloor(Number(e.target.value))}
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary focus:outline-none focus:border-accent-teal/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                      Capacity
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={formCapacity}
                      onChange={(e) => setFormCapacity(Number(e.target.value))}
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary focus:outline-none focus:border-accent-teal/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                    Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["available", "occupied", "maintenance"] as Lab["status"][]).map((s) => {
                      const style = STATUS_STYLES[s];
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setFormStatus(s)}
                          className={cn(
                            "px-3 py-2 rounded-lg border text-[12px] font-mono font-semibold uppercase transition-all",
                            formStatus === s
                              ? cn(style.bg, style.text, style.border)
                              : "border-border bg-bg-tertiary text-text-tertiary hover:border-border-light"
                          )}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                    Features / Equipment
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 rounded-lg border border-border/30 bg-bg-tertiary/50">
                    {ALL_FEATURES.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleFeature(f)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all",
                          formFeatures.includes(f)
                            ? "bg-accent-teal-soft text-accent-teal border-accent-teal/30"
                            : "border-border bg-bg-tertiary text-text-tertiary hover:border-border-light"
                        )}
                      >
                        {f}
                      </button>
                    ))}
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
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg bg-accent-teal text-white hover:bg-accent-teal/90 transition-colors shadow-teal-glow"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    {editingLab ? "Update" : "Create"}
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
                Confirm Delete
              </h3>
              <p className="text-[13px] text-text-secondary mb-5">
                Are you sure you want to delete this lab? This will deallocate all associated resources.
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
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
