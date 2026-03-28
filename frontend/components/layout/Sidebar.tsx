"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Clock,
  ShieldAlert,
  Layers,
  Box,
  CalendarDays,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Cpu,
  GraduationCap,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  chapter?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "OS Concepts",
    items: [
      { label: "Scheduling", href: "/scheduler", icon: Clock, chapter: "Ch.5" },
      { label: "Deadlock", href: "/deadlock", icon: ShieldAlert, chapter: "Ch.8" },
      { label: "Concurrency", href: "/concurrency", icon: Layers, chapter: "Ch.6" },
      { label: "Resources", href: "/resources", icon: Box, chapter: "Ch.7" },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Timetable", href: "/timetable", icon: CalendarDays },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Admin", href: "/admin", icon: Settings },
    ],
  },
];

const conceptLegend = [
  { label: "CPU Scheduling", color: "#4f8ef7" },
  { label: "Deadlock", color: "#ef4444" },
  { label: "Concurrency", color: "#2dd4bf" },
  { label: "Memory/Resources", color: "#f59e0b" },
  { label: "Synchronization", color: "#c084fc" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen z-40 flex flex-col",
        "bg-bg-secondary border-r border-border",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[280px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-border flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-blue-soft border border-accent-blue/30">
              <GraduationCap size={18} className="text-accent-blue" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-display font-bold text-text-primary tracking-tight truncate">
                CUIScheduler
              </h1>
              <p className="text-[9px] text-text-tertiary font-mono tracking-wide truncate">
                COMSATS Wah - OS Project 2025
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-blue-soft border border-accent-blue/30 mx-auto">
            <GraduationCap size={18} className="text-accent-blue" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <h3 className="px-3 mb-1.5 text-[10px] font-mono font-semibold text-text-tertiary uppercase tracking-[0.15em]">
                {section.title}
              </h3>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium",
                        "transition-all duration-150",
                        isActive
                          ? "bg-accent-blue-soft text-accent-blue border border-accent-blue/20"
                          : "text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-transparent",
                        collapsed && "justify-center px-2"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.chapter && (
                            <span
                              className={cn(
                                "text-[9px] font-mono px-1.5 py-0.5 rounded",
                                isActive
                                  ? "bg-accent-blue/20 text-accent-blue"
                                  : "bg-os-bg text-os-text"
                              )}
                            >
                              {item.chapter}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* OS Concept Legend */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-border flex-shrink-0">
          <h4 className="text-[9px] font-mono font-semibold text-text-tertiary uppercase tracking-[0.15em] mb-2">
            OS Concept Map
          </h4>
          <div className="space-y-1.5">
            {conceptLegend.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[11px] text-text-secondary">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-10 border-t border-border text-text-tertiary hover:text-text-secondary transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}

export default Sidebar;
