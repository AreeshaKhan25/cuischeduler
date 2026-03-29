"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth";

interface TopBarProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  userName?: string;
  userRole?: string;
}

export function TopBar({
  onToggleSidebar,
  sidebarCollapsed,
  userName = "User",
  userRole = "student",
}: TopBarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = () => {
    setUserMenuOpen(false);
    logout();
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16",
        "bg-white/85 backdrop-blur-md border-b border-slate-100",
        "flex items-center justify-between px-8",
        "transition-all duration-300",
        sidebarCollapsed ? "left-[68px]" : "left-[220px]"
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">CUIScheduler</h1>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1">
            Dashboard
          </Link>
          <Link href="/timetable" className="text-sm font-medium text-slate-400 hover:text-blue-500 transition-colors">
            Timetable
          </Link>
          <Link href="/requests" className="text-sm font-medium text-slate-400 hover:text-blue-500 transition-colors">
            Requests
          </Link>
        </nav>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            className="pl-10 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-sm focus:ring-2 ring-blue-500/20 w-64"
            placeholder="Search resources..."
            type="text"
          />
        </div>

        {/* Notifications */}
        <Link href="/notifications" className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </Link>

        {/* User */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1"
          >
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center ring-2 ring-white overflow-hidden">
              <span className="material-symbols-outlined text-slate-500 text-lg">person</span>
            </div>
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 z-50 rounded-xl border border-slate-100 bg-white shadow-lg py-1">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900">{userName}</p>
                  <span className="text-[10px] font-mono uppercase text-slate-400">{userRole}</span>
                </div>
                <Link
                  href="/admin"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">settings</span>
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopBar;
