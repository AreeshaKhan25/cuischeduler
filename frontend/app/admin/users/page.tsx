"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createColumnHelper } from "@tanstack/react-table";
import { PageHeader } from "@/components/layout/PageHeader";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { DataTable } from "@/components/shared/DataTable";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  Plus,
  X,
  UserCog,
  Pencil,
  Trash2,
  Save,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  User,
  UserX,
  Mail,
  Lock,
  Building2,
} from "lucide-react";

/* ─── User type ──────────────────────────────────────────────── */
interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "faculty" | "student";
  department: string;
  lastLogin: string;
  active: boolean;
}

/* ─── Demo data ──────────────────────────────────────────────── */
const DEMO_USERS: AppUser[] = [
  { id: "u1", name: "Admin User", email: "admin@cuilwah.edu.pk", role: "admin", department: "Admin Office", lastLogin: new Date(Date.now() - 1000 * 60 * 10).toISOString(), active: true },
  { id: "u2", name: "Dr. Ahmed Khan", email: "ahmed.khan@cuilwah.edu.pk", role: "faculty", department: "Computer Science", lastLogin: new Date(Date.now() - 1000 * 60 * 30).toISOString(), active: true },
  { id: "u3", name: "Dr. Sarah Malik", email: "sarah.malik@cuilwah.edu.pk", role: "faculty", department: "Computer Science", lastLogin: new Date(Date.now() - 1000 * 60 * 120).toISOString(), active: true },
  { id: "u4", name: "Ali Hassan", email: "ali.hassan@cuilwah.edu.pk", role: "student", department: "Computer Science", lastLogin: new Date(Date.now() - 1000 * 60 * 60).toISOString(), active: true },
  { id: "u5", name: "Dr. Fatima Noor", email: "fatima.noor@cuilwah.edu.pk", role: "faculty", department: "Electrical Engineering", lastLogin: new Date(Date.now() - 1000 * 60 * 300).toISOString(), active: true },
  { id: "u6", name: "Dr. Hassan Raza", email: "hassan.raza@cuilwah.edu.pk", role: "faculty", department: "Electrical Engineering", lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), active: true },
  { id: "u7", name: "Bilal Ahmed", email: "bilal.ahmed@cuilwah.edu.pk", role: "student", department: "Computer Science", lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), active: true },
  { id: "u8", name: "Zara Iqbal", email: "zara.iqbal@cuilwah.edu.pk", role: "student", department: "Business Administration", lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), active: false },
  { id: "u9", name: "Dr. Imran Shah", email: "imran.shah@cuilwah.edu.pk", role: "faculty", department: "Physics", lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), active: true },
  { id: "u10", name: "Kamran Yousaf", email: "kamran.yousaf@cuilwah.edu.pk", role: "faculty", department: "Computer Science", lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), active: true },
  { id: "u11", name: "Sana Tariq", email: "sana.tariq@cuilwah.edu.pk", role: "student", department: "Mathematics", lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), active: false },
  { id: "u12", name: "Dr. Nadia Hussain", email: "nadia.hussain@cuilwah.edu.pk", role: "faculty", department: "Computer Science", lastLogin: new Date(Date.now() - 1000 * 60 * 45).toISOString(), active: true },
];

const ROLE_STYLES: Record<string, { bg: string; text: string; border: string; icon: typeof ShieldCheck }> = {
  admin: { bg: "bg-danger-soft", text: "text-danger", border: "border-danger/30", icon: ShieldAlert },
  faculty: { bg: "bg-accent-blue-soft", text: "text-accent-blue", border: "border-accent-blue/30", icon: ShieldCheck },
  student: { bg: "bg-accent-teal-soft", text: "text-accent-teal", border: "border-accent-teal/30", icon: User },
};

const DEPARTMENTS = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Business Administration",
  "Mathematics",
  "Physics",
  "Humanities",
  "Admin Office",
];

const columnHelper = createColumnHelper<AppUser>();

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>(DEMO_USERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [saving, setSaving] = useState(false);

  /* Form state */
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<AppUser["role"]>("student");
  const [formDepartment, setFormDepartment] = useState("");
  const [formPassword, setFormPassword] = useState("");

  const openAddModal = () => {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormRole("student");
    setFormDepartment("");
    setFormPassword("");
    setModalOpen(true);
  };

  const openEditModal = (u: AppUser) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormRole(u.role);
    setFormDepartment(u.department);
    setFormPassword("");
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formName || !formEmail || !formDepartment) {
      toast.error("All fields are required");
      return;
    }
    if (!editingUser && !formPassword) {
      toast.error("Password is required for new users");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      if (editingUser) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? { ...u, name: formName, email: formEmail, role: formRole, department: formDepartment }
              : u
          )
        );
        toast.success(`${formName} updated`);
      } else {
        const newUser: AppUser = {
          id: `u-${Date.now()}`,
          name: formName,
          email: formEmail,
          role: formRole,
          department: formDepartment,
          lastLogin: new Date().toISOString(),
          active: true,
        };
        setUsers((prev) => [...prev, newUser]);
        toast.success(`${formName} created`);
      }
      setSaving(false);
      setModalOpen(false);
    }, 500);
  };

  const toggleActive = (user: AppUser) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, active: !u.active } : u
      )
    );
    toast.success(
      user.active
        ? `${user.name} deactivated (process suspended)`
        : `${user.name} activated (process resumed)`
    );
  };

  const changeRole = (userId: string, newRole: AppUser["role"]) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, role: newRole } : u
      )
    );
    toast.success("Role updated — privilege level changed");
  };

  const handleBulkDelete = (selected: AppUser[]) => {
    const ids = new Set(selected.map((u) => u.id));
    setUsers((prev) => prev.filter((u) => !ids.has(u.id)));
    toast.success(`${selected.length} users removed`);
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Role", "Department", "Last Login", "Active"];
    const rows = users.map((u) => [u.name, u.email, u.role, u.department, u.lastLogin, u.active]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => {
          const user = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border text-[11px] font-bold",
                  user.active
                    ? "bg-accent-blue-soft border-accent-blue/20 text-accent-blue"
                    : "bg-bg-tertiary border-border text-text-tertiary"
                )}
              >
                {info.getValue().split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <span
                  className={cn(
                    "font-semibold block",
                    user.active ? "text-text-primary" : "text-text-tertiary line-through"
                  )}
                >
                  {info.getValue()}
                </span>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => (
          <span className="text-[12px] font-mono text-text-secondary">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("role", {
        header: "Role",
        cell: (info) => {
          const userId = info.row.original.id;
          const role = info.getValue();
          const style = ROLE_STYLES[role];
          const RoleIcon = style.icon;
          return (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border",
                  style.bg, style.text, style.border
                )}
              >
                <RoleIcon size={10} />
                {role}
              </span>
              <select
                value={role}
                onChange={(e) => changeRole(userId, e.target.value as AppUser["role"])}
                className="text-[10px] bg-transparent border border-border/30 rounded px-1 py-0.5 text-text-tertiary hover:text-text-secondary cursor-pointer focus:outline-none"
              >
                <option value="admin">Admin</option>
                <option value="faculty">Faculty</option>
                <option value="student">Student</option>
              </select>
            </div>
          );
        },
      }),
      columnHelper.accessor("department", {
        header: "Department",
        cell: (info) => <span className="text-text-secondary text-[12px]">{info.getValue()}</span>,
      }),
      columnHelper.accessor("lastLogin", {
        header: "Last Login",
        cell: (info) => (
          <span className="text-[12px] text-text-tertiary">
            {formatRelativeTime(info.getValue())}
          </span>
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
              onClick={() => toggleActive(row.original)}
              className={cn(
                "p-1.5 rounded-md hover:bg-bg-hover transition-colors",
                row.original.active
                  ? "text-text-tertiary hover:text-danger"
                  : "text-success hover:text-success"
              )}
              title={row.original.active ? "Deactivate" : "Activate"}
            >
              {row.original.active ? <UserX size={14} /> : <User size={14} />}
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
        title="User Management"
        subtitle="Process table management — each user is a process with PID, role (privilege ring), and state"
        breadcrumb={["CUIScheduler", "Admin", "Users"]}
        osConcepts={[OS_CONCEPTS.PCB, OS_CONCEPTS.PROCESS_STATES]}
      />

      {/* OS Concept Banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-os-bg/40 border border-os-border/30">
        <UserCog size={18} className="text-os-text flex-shrink-0" />
        <p className="text-[13px] text-os-text/80 font-mono">
          Process Table — Each user has a PCB. Admin = Ring 0 (kernel mode), Faculty = Ring 1 (privileged),
          Student = Ring 3 (user mode). Deactivation = process suspension.
        </p>
        <OSConceptBadge
          concept="Protection Rings"
          chapter="Ch.14"
          description="Role-based access maps to CPU protection rings. Admin operates in kernel mode with full system access."
          size="sm"
          pulse={false}
        />
      </div>

      {/* Add User Button */}
      <div className="flex justify-end">
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg bg-accent-blue text-white hover:bg-accent-blue/90 transition-colors shadow-blue-glow"
        >
          <Plus size={16} />
          Add User
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        data={users}
        columns={columns}
        searchPlaceholder="Search users..."
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
                  <UserCog size={18} className="text-accent-blue" />
                  {editingUser ? "Edit User" : "Add User"}
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
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-blue/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="name@cuilwah.edu.pk"
                      className="w-full pl-10 pr-4 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-blue/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                    Role (Privilege Ring)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["admin", "faculty", "student"] as AppUser["role"][]).map((r) => {
                      const style = ROLE_STYLES[r];
                      const RIcon = style.icon;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setFormRole(r)}
                          className={cn(
                            "flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg border text-center transition-all",
                            formRole === r
                              ? cn(style.bg, style.text, style.border)
                              : "border-border bg-bg-tertiary text-text-tertiary hover:border-border-light"
                          )}
                        >
                          <RIcon size={16} />
                          <span className="text-[12px] font-semibold capitalize">{r}</span>
                          <span className="text-[9px] font-mono opacity-70">
                            Ring {r === "admin" ? "0" : r === "faculty" ? "1" : "3"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                    Department
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <select
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary focus:outline-none focus:border-accent-blue/50 transition-colors appearance-none"
                    >
                      <option value="">Select department...</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Password (only for new users) */}
                {!editingUser && (
                  <div>
                    <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                      <input
                        type="password"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full pl-10 pr-4 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-blue/50 transition-colors"
                      />
                    </div>
                  </div>
                )}

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
                    {editingUser ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
