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
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const { access_token, user } = res.data;
      setToken(access_token);
      setUser(user);
      toast.success(`Welcome back, ${user.name}!`);
      // Hard redirect so root layout re-renders with sidebar/topbar
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Invalid email or password";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-accent-blue/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-accent-teal/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-os-bg/10 blur-3xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(79,142,247,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,247,0.3) 1px, transparent 1px)",
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
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-blue-soft border border-accent-blue/20 mb-4 shadow-blue-glow">
              <Cpu size={32} className="text-accent-blue" />
            </div>
            <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight">
              CUIScheduler
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

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
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
                  placeholder="faculty@cuilwah.edu.pk"
                  className="w-full pl-10 pr-4 py-2.5 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20 transition-colors"
                  autoComplete="email"
                />
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
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20 transition-colors"
                  autoComplete="current-password"
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
                  ? "bg-accent-blue/50 cursor-not-allowed text-white/70"
                  : "bg-accent-blue text-white hover:bg-accent-blue/90 shadow-blue-glow hover:shadow-blue-glow"
              )}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-[12px] text-text-tertiary">
              Don&apos;t have an account?{" "}
              <a
                href="/register"
                className="text-accent-blue hover:text-accent-blue/80 font-medium transition-colors"
              >
                Register here
              </a>
            </p>
          </div>

          {/* OS Concept */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <div className="p-3 rounded-lg bg-os-bg/30 border border-os-border/20">
              <div className="flex items-start gap-2">
                <OSConceptBadge
                  concept="Process Identity"
                  chapter="Ch.3"
                  description="Authentication assigns a Process ID (PID) to the user — like OS process creation. Each authenticated session is a unique process with its own PCB."
                  size="sm"
                  pulse={false}
                />
              </div>
              <p className="text-[10px] text-os-text/60 font-mono mt-2 leading-relaxed">
                Authentication = PID assignment. Each login creates a process with
                unique credentials, role-based access (privilege levels), and session state (PCB).
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
