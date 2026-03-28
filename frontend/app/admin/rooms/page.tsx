"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createColumnHelper } from "@tanstack/react-table";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlowCard } from "@/components/ui/GlowCard";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { DataTable } from "@/components/shared/DataTable";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import api from "@/lib/api";
import {
  Plus,
  X,
  DoorOpen,
  Pencil,
  Trash2,
  Wrench,
  Save,
  Loader2,
} from "lucide-react";

/* ─── Room type ──────────────────────────────────────────────── */
interface Room {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  status: "available" | "occupied" | "maintenance";
  features: string[];
}

/* ─── Demo data ──────────────────────────────────────────────── */
const DEMO_ROOMS: Room[] = [
  { id: "r1", name: "CS-201", building: "Academic Block A", floor: 2, capacity: 60, status: "available", features: ["Projector", "AC", "Whiteboard"] },
  { id: "r2", name: "CS-202", building: "Academic Block A", floor: 2, capacity: 45, status: "occupied", features: ["Projector", "AC"] },
  { id: "r3", name: "CS-301", building: "Academic Block A", floor: 3, capacity: 80, status: "available", features: ["Projector", "AC", "Smart Board", "Sound System"] },
  { id: "r4", name: "EE-101", building: "Engineering Block", floor: 1, capacity: 50, status: "maintenance", features: ["Projector", "Whiteboard"] },
  { id: "r5", name: "EE-201", building: "Engineering Block", floor: 2, capacity: 55, status: "available", features: ["Projector", "AC", "Whiteboard"] },
  { id: "r6", name: "ME-102", building: "Engineering Block", floor: 1, capacity: 40, status: "available", features: ["Whiteboard"] },
  { id: "r7", name: "Hall-A", building: "Main Block", floor: 0, capacity: 200, status: "available", features: ["Projector", "AC", "Sound System", "Stage", "Mic"] },
  { id: "r8", name: "Hall-B", building: "Main Block", floor: 0, capacity: 150, status: "occupied", features: ["Projector", "AC", "Sound System"] },
  { id: "r9", name: "BBA-201", building: "Business Block", floor: 2, capacity: 35, status: "available", features: ["Projector", "AC"] },
  { id: "r10", name: "BBA-301", building: "Business Block", floor: 3, capacity: 40, status: "available", features: ["Projector", "AC", "Whiteboard"] },
  { id: "r11", name: "GEN-101", building: "Academic Block B", floor: 1, capacity: 70, status: "available", features: ["Projector", "AC", "Whiteboard"] },
  { id: "r12", name: "GEN-102", building: "Academic Block B", floor: 1, capacity: 65, status: "occupied", features: ["Projector", "Whiteboard"] },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  available: { bg: "bg-success-soft", text: "text-success", border: "border-success/30", dot: "#22c55e" },
  occupied: { bg: "bg-warning-soft", text: "text-warning", border: "border-warning/30", dot: "#f59e0b" },
  maintenance: { bg: "bg-danger-soft", text: "text-danger", border: "border-danger/30", dot: "#ef4444" },
};

const BUILDINGS = ["Academic Block A", "Academic Block B", "Engineering Block", "Main Block", "Business Block"];
const ALL_FEATURES = ["Projector", "AC", "Whiteboard", "Smart Board", "Sound System", "Stage", "Mic", "Lab Equipment"];

const columnHelper = createColumnHelper<Room>();

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api.get("/resources", { params: { type: "classroom" } }).then(res => {
      setRooms(res.data.map((r: Record<string, unknown>) => ({
        id: String(r.id), name: r.name, building: r.building, floor: r.floor,
        capacity: r.capacity, status: r.status || "available",
        features: Array.isArray(r.features) ? r.features : [],
      })));
    }).catch(() => toast.error("Failed to load rooms"));
  }, []);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* Form state */
  const [formName, setFormName] = useState("");
  const [formBuilding, setFormBuilding] = useState("");
  const [formFloor, setFormFloor] = useState(1);
  const [formCapacity, setFormCapacity] = useState(40);
  const [formStatus, setFormStatus] = useState<Room["status"]>("available");
  const [formFeatures, setFormFeatures] = useState<string[]>([]);

  const openAddModal = () => {
    setEditingRoom(null);
    setFormName("");
    setFormBuilding("");
    setFormFloor(1);
    setFormCapacity(40);
    setFormStatus("available");
    setFormFeatures([]);
    setModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormName(room.name);
    setFormBuilding(room.building);
    setFormFloor(room.floor);
    setFormCapacity(room.capacity);
    setFormStatus(room.status);
    setFormFeatures([...room.features]);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName || !formBuilding) {
      toast.error("Name and building are required");
      return;
    }
    setSaving(true);
    try {
      const payload = { name: formName, building: formBuilding, floor: formFloor, capacity: formCapacity, status: formStatus, features: formFeatures, type: "classroom" };
      if (editingRoom) {
        const res = await api.put(`/resources/${editingRoom.id}`, payload);
        setRooms(prev => prev.map(r => r.id === editingRoom.id ? { ...r, ...res.data, id: String(res.data.id), features: Array.isArray(res.data.features) ? res.data.features : [] } : r));
        toast.success(`Room ${formName} updated`);
      } else {
        const res = await api.post("/resources", payload);
        setRooms(prev => [...prev, { ...res.data, id: String(res.data.id), features: Array.isArray(res.data.features) ? res.data.features : [] }]);
        toast.success(`Room ${formName} created`);
      }
      setModalOpen(false);
    } catch { toast.error("Failed to save room"); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/resources/${id}`);
      setRooms(prev => prev.filter(r => r.id !== id));
      setDeleteConfirm(null);
      toast.success("Room deleted");
    } catch { toast.error("Failed to delete room"); }
  };

  const toggleMaintenance = (room: Room) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === room.id
          ? { ...r, status: r.status === "maintenance" ? "available" : "maintenance" }
          : r
      )
    );
    toast.success(
      room.status === "maintenance"
        ? `${room.name} back to available`
        : `${room.name} set to maintenance`
    );
  };

  const handleBulkDelete = (selectedRooms: Room[]) => {
    const ids = new Set(selectedRooms.map((r) => r.id));
    setRooms((prev) => prev.filter((r) => !ids.has(r.id)));
    toast.success(`${selectedRooms.length} rooms deleted`);
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Building", "Floor", "Capacity", "Status", "Features"];
    const rows = rooms.map((r) => [r.name, r.building, r.floor, r.capacity, r.status, r.features.join("; ")]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rooms.csv";
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
          <span className="font-semibold font-mono text-accent-blue">
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
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const s = STATUS_STYLES[info.getValue()];
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border",
                s.bg,
                s.text,
                s.border
              )}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: s.dot }}
              />
              {info.getValue()}
            </span>
          );
        },
      }),
      columnHelper.accessor("features", {
        header: "Features",
        enableSorting: false,
        cell: (info) => (
          <div className="flex flex-wrap gap-1">
            {info.getValue().slice(0, 3).map((f) => (
              <span
                key={f}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-bg-tertiary text-text-tertiary border border-border/50"
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
              onClick={() => toggleMaintenance(row.original)}
              className={cn(
                "p-1.5 rounded-md hover:bg-bg-hover transition-colors",
                row.original.status === "maintenance"
                  ? "text-warning hover:text-warning"
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
        title="Room Management"
        subtitle="CRUD operations on classroom resources — each room is a memory page in the resource pool"
        breadcrumb={["CUIScheduler", "Admin", "Rooms"]}
        osConcepts={[OS_CONCEPTS.MEMORY_BITMAP, OS_CONCEPTS.FRAGMENTATION]}
      />

      {/* OS Concept Banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-os-bg/40 border border-os-border/30">
        <DoorOpen size={18} className="text-os-text flex-shrink-0" />
        <p className="text-[13px] text-os-text/80 font-mono">
          Memory Pages — Each room is a memory page in the resource bitmap. Available = free frame, Occupied = allocated, Maintenance = reserved.
        </p>
        <OSConceptBadge
          concept="Memory Pages"
          chapter="Ch.8"
          description={OS_CONCEPTS.MEMORY_BITMAP.description}
          size="sm"
          pulse={false}
        />
      </div>

      {/* Add Room Button */}
      <div className="flex justify-end">
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg bg-accent-blue text-white hover:bg-accent-blue/90 transition-colors shadow-blue-glow"
        >
          <Plus size={16} />
          Add Room
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        data={rooms}
        columns={columns}
        searchPlaceholder="Search rooms..."
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
                  <DoorOpen size={18} className="text-accent-blue" />
                  {editingRoom ? "Edit Room" : "Add Room"}
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
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="CS-201"
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-blue/50 transition-colors"
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
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary focus:outline-none focus:border-accent-blue/50 transition-colors"
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
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary focus:outline-none focus:border-accent-blue/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                      Capacity
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={formCapacity}
                      onChange={(e) => setFormCapacity(Number(e.target.value))}
                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary focus:outline-none focus:border-accent-blue/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                    Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["available", "occupied", "maintenance"] as Room["status"][]).map((s) => {
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
                    Features
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_FEATURES.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleFeature(f)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all",
                          formFeatures.includes(f)
                            ? "bg-accent-blue-soft text-accent-blue border-accent-blue/30"
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
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg bg-accent-blue text-white hover:bg-accent-blue/90 transition-colors shadow-blue-glow"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    {editingRoom ? "Update" : "Create"}
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
                Are you sure you want to delete this room? This action cannot be undone.
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
