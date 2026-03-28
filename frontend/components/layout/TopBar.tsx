"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LivePulse } from "@/components/ui/LivePulse";
import { logout } from "@/lib/auth";
import {
  Menu,
  Bell,
  BookOpen,
  ChevronDown,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { format } from "date-fns";

interface TopBarProps {
  onToggleSidebar: () => void;
  onToggleOSPanel: () => void;
  sidebarCollapsed: boolean;
  unreadCount?: number;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

export function TopBar({
  onToggleSidebar,
  onToggleOSPanel,
  sidebarCollapsed,
  unreadCount = 0,
  userName = "User",
  userEmail = "",
  userRole = "student",
}: TopBarProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    function tick() {
      const now = new Date();
      setCurrentTime(format(now, "hh:mm a"));
      setCurrentDate(format(now, "EEEE, MMM dd, yyyy"));
    }
    tick();
    const interval = setInterval(tick, 60_000); // update every minute, not every second
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    setUserMenuOpen(false);
    logout();
  };

  const roleColors: Record<string, string> = {
    admin: "text-danger",
    faculty: "text-accent-blue",
    student: "text-accent-teal",
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16",
        "bg-bg-secondary/80 backdrop-blur-xl border-b border-border",
        "flex items-center justify-between px-4",
        "transition-all duration-300",
        sidebarCollapsed ? "left-[68px]" : "left-[280px]"
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <span className="font-display font-semibold text-text-primary">
            CUIScheduler
          </span>
          <span className="text-text-tertiary">—</span>
          <span className="text-text-secondary text-[13px]">COMSATS Wah</span>
        </div>
      </div>

      {/* Center */}
      <div className="hidden md:flex items-center gap-4">
        <LivePulse />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Date/Time */}
        <div className="hidden lg:flex flex-col items-end mr-1">
          <span className="text-[11px] font-mono text-text-secondary">
            {currentTime}
          </span>
          <span className="text-[10px] text-text-tertiary">{currentDate}</span>
        </div>

        {/* OS Concepts Panel Toggle */}
        <button
          onClick={onToggleOSPanel}
          className="p-2 rounded-lg text-os-text hover:bg-os-bg/50 border border-transparent hover:border-os-border/30 transition-all"
          title="Toggle OS Concepts Panel"
        >
          <BookOpen size={18} />
        </button>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-danger text-white text-[10px] font-mono font-bold px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-bg-hover transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-accent-blue-soft border border-accent-blue/30 flex items-center justify-center">
              <User size={16} className="text-accent-blue" />
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-[12px] font-medium text-text-primary leading-tight">
                {userName.split(" ").slice(0, 2).join(" ")}
              </span>
              <span className={cn("text-[10px] capitalize", roleColors[userRole] || "text-text-tertiary")}>
                {userRole}
              </span>
            </div>
            <ChevronDown
              size={14}
              className={cn(
                "text-text-tertiary transition-transform duration-200 hidden sm:block",
                userMenuOpen && "rotate-180"
              )}
            />
          </button>

          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 z-50 rounded-lg border border-border bg-bg-secondary shadow-xl py-1">
                <div className="px-3 py-2.5 border-b border-border">
                  <p className="text-sm font-medium text-text-primary">
                    {userName}
                  </p>
                  <p className="text-[11px] text-text-tertiary mt-0.5">
                    {userEmail}
                  </p>
                  <span className={cn(
                    "inline-block mt-1 text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border",
                    userRole === "admin" ? "text-danger border-danger/30 bg-danger-soft" :
                    userRole === "faculty" ? "text-accent-blue border-accent-blue/30 bg-accent-blue-soft" :
                    "text-accent-teal border-accent-teal/30 bg-accent-teal-soft"
                  )}>
                    {userRole}
                  </span>
                </div>
                <Link
                  href="/admin"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
                >
                  <Settings size={14} />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-danger hover:bg-danger-soft transition-colors"
                >
                  <LogOut size={14} />
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
