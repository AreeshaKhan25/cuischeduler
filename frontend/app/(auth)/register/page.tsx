"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { setToken, setUser } from "@/lib/auth";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  Cpu,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  GraduationCap,
  User,
  Building2,
  Shield,
} from "lucide-react";

const DEPARTMENTS = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Mathematics",
  "Physics",
  "Humanities",
];

const ROLES = [
  { value: "student", label: "Student", description: "User-mode process" },
  { value: "faculty", label: "Faculty", description: "Privileged process" },
  { value: "admin", label: "Admin", description: "Kernel-mode process" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !department) {
      setError("Please fill in all required fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register({ name, email, password, role });
      const { access_token, user } = res.data;
      if (access_token && user) {
        setToken(access_token);
        setUser(user);
        toast.success(`Welcome, ${user.name}! Process created successfully.`);
        window.location.href = "/dashboard";
      } else {
        toast.success("Registration successful! Please sign in.");
        window.location.href = "/login";
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Registration failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary relative overflow-hidden py-8">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-accent-teal/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-accent-blue/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-os-bg/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(45,212,191,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="rounded-2xl border border-border bg-bg-secondary p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-teal-soft border border-accent-teal/20 mb-4 shadow-teal-glow">
              <Cpu size={32} className="text-accent-teal" />
            </div>
            <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight">
              Create Account
            </h1>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <GraduationCap size={14} className="text-accent-teal" />
              <p className="text-[12px] text-text-secondary">
                COMSATS University Islamabad, Wah Campus
              </p>
            </div>
            <p className="text-[11px] text-text-tertiary mt-1 font-mono">
              Intelligent Campus Resource Scheduling System
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Ahmed Khan"
                  className="w-full pl-10 pr-4 py-2.5 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-teal/50 focus:ring-1 focus:ring-accent-teal/20 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@cuilwah.edu.pk"
                  className="w-full pl-10 pr-4 py-2.5 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-teal/50 focus:ring-1 focus:ring-accent-teal/20 transition-colors"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Department
              </label>
              <div className="relative">
                <Building2
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary focus:outline-none focus:border-accent-teal/50 focus:ring-1 focus:ring-accent-teal/20 transition-colors appearance-none"
                >
                  <option value="">Select department...</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg border text-center transition-all duration-200",
                      role === r.value
                        ? "border-accent-teal/50 bg-accent-teal-soft text-accent-teal shadow-teal-glow"
                        : "border-border bg-bg-tertiary text-text-secondary hover:border-border-light"
                    )}
                  >
                    <Shield
                      size={16}
                      className={
                        role === r.value ? "text-accent-teal" : "text-text-tertiary"
                      }
                    />
                    <span className="text-[12px] font-semibold">{r.label}</span>
                    <span className="text-[9px] font-mono text-text-tertiary">
                      {r.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-teal/50 focus:ring-1 focus:ring-accent-teal/20 transition-colors"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-2.5 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-teal/50 focus:ring-1 focus:ring-accent-teal/20 transition-colors"
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 rounded-lg bg-danger-soft border border-danger/20 text-[12px] text-danger"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-2.5 text-[14px] font-semibold rounded-lg transition-all duration-200",
                loading
                  ? "bg-accent-teal/50 cursor-not-allowed text-white/70"
                  : "bg-accent-teal text-white hover:bg-accent-teal/90 shadow-teal-glow"
              )}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating Process...
                </>
              ) : (
                <>
                  Register — fork()
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-[12px] text-text-tertiary">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-accent-teal hover:text-accent-teal/80 font-medium transition-colors"
              >
                Sign in here
              </a>
            </p>
          </div>

          {/* OS Concept */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <div className="p-3 rounded-lg bg-os-bg/30 border border-os-border/20">
              <div className="flex items-start gap-2">
                <OSConceptBadge
                  concept="Process Creation — fork()"
                  chapter="Ch.3"
                  description="Registration creates a new process. fork() duplicates the parent, exec() loads the new program. The new process gets a unique PID, allocated memory, and a PCB entry."
                  size="sm"
                  pulse={false}
                />
              </div>
              <p className="text-[10px] text-os-text/60 font-mono mt-2 leading-relaxed">
                Registration = fork() + exec(). New process (user) created with unique PID,
                role-based privilege ring, and department affinity (processor group).
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
