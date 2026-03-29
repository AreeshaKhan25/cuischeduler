"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: string; // Material Symbol name
  adminOnly?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
  collapsible?: boolean;
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    ],
  },
  {
    title: "Scheduling",
    items: [
      { label: "Timetable", href: "/timetable", icon: "calendar_month" },
      { label: "Requests", href: "/requests", icon: "description" },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Auto-Schedule", href: "/admin/auto-schedule", icon: "auto_fix_high", adminOnly: true },
      { label: "Courses", href: "/admin/courses", icon: "menu_book", adminOnly: true },
      { label: "Sections", href: "/admin/sections", icon: "groups", adminOnly: true },
      { label: "Rooms & Labs", href: "/admin/rooms", icon: "domain", adminOnly: true },
      { label: "Users", href: "/admin/users", icon: "manage_accounts", adminOnly: true },
    ],
  },
];

const osSubsystems = [
  { label: "CPU Scheduling", href: "/os/scheduler" },
  { label: "Deadlock", href: "/os/deadlock" },
  { label: "Concurrency", href: "/os/concurrency" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [osExpanded, setOsExpanded] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen z-50 flex flex-col",
        "bg-slate-50 transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[220px]"
      )}
      style={{ borderRight: "none" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 flex-shrink-0">
        {!collapsed ? (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-lg font-bold text-blue-600">
              <span className="material-symbols-outlined text-2xl">dashboard_customize</span>
              <span className="tracking-tight">CUIScheduler</span>
            </div>
            <span className="font-mono text-[10px] tracking-tight text-slate-400 uppercase px-1 -mt-1">
              V3 Academic
            </span>
          </div>
        ) : (
          <span className="material-symbols-outlined text-2xl text-blue-600 mx-auto">
            dashboard_customize
          </span>
        )}
      </div>

      {/* New Booking Button */}
      {!collapsed && (
        <div className="px-4 mb-2">
          <Link
            href="/requests"
            className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            + New Booking
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <h3 className="px-3 mb-1.5 text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest">
                {section.title}
              </h3>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "text-blue-700 font-semibold bg-white shadow-sm"
                          : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-900",
                        collapsed && "justify-center px-2"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="material-symbols-outlined text-xl">{item.icon}</span>
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* OS Sub-Systems */}
      {!collapsed && (
        <div className="mt-auto pt-4 pb-4 px-4 border-t border-slate-200 flex flex-col gap-2">
          <button
            onClick={() => setOsExpanded(!osExpanded)}
            className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-widest font-label flex items-center justify-between"
          >
            <span>Sub-Systems</span>
            <span className="material-symbols-outlined text-xs">
              {osExpanded ? "expand_less" : "expand_more"}
            </span>
          </button>
          {osExpanded && (
            <div className="flex flex-col gap-1">
              {osSubsystems.map((sub) => {
                const isActive = pathname === sub.href;
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-1.5 transition-colors text-xs font-mono",
                      isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    <span className="material-symbols-outlined text-[10px]">circle</span>
                    {sub.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-10 border-t border-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <span className="material-symbols-outlined text-lg">
          {collapsed ? "chevron_right" : "chevron_left"}
        </span>
      </button>
    </aside>
  );
}

export default Sidebar;
