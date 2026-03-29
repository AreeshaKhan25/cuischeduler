"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Wand2,
  BookOpen,
  Users,
  Building2,
  UserCog,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  Cpu,
  Clock,
  ShieldAlert,
  Layers,
  Bell,
  BarChart3,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
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
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Scheduling",
    items: [
      { label: "Timetable", href: "/timetable", icon: CalendarDays },
      { label: "Change Requests", href: "/requests", icon: FileText },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Auto-Schedule", href: "/admin/auto-schedule", icon: Wand2, adminOnly: true },
      { label: "Courses", href: "/admin/courses", icon: BookOpen, adminOnly: true },
      { label: "Sections", href: "/admin/sections", icon: Users, adminOnly: true },
      { label: "Rooms & Labs", href: "/admin/rooms", icon: Building2, adminOnly: true },
      { label: "Users", href: "/admin/users", icon: UserCog, adminOnly: true },
    ],
  },
  {
    title: "OS Concepts Lab",
    collapsible: true,
    items: [
      { label: "CPU Scheduling", href: "/os/scheduler", icon: Clock },
      { label: "Deadlock", href: "/os/deadlock", icon: ShieldAlert },
      { label: "Concurrency", href: "/os/concurrency", icon: Layers },
    ],
  },
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
        "fixed left-0 top-0 h-screen z-40 flex flex-col",
        "bg-bg-secondary border-r border-border",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[260px]"
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
                COMSATS Wah &middot; SP-26
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
        {navSections.map((section) => {
          const isCollapsible = section.collapsible;
          const isExpanded = !isCollapsible || osExpanded;

          return (
            <div key={section.title}>
              {!collapsed && (
                <button
                  onClick={() => isCollapsible && setOsExpanded(!osExpanded)}
                  className={cn(
                    "flex items-center w-full px-3 mb-1.5 text-[10px] font-mono font-semibold text-text-tertiary uppercase tracking-[0.15em]",
                    isCollapsible && "cursor-pointer hover:text-text-secondary"
                  )}
                >
                  <span>{section.title}</span>
                  {isCollapsible && (
                    <ChevronDown
                      size={12}
                      className={cn("ml-auto transition-transform", isExpanded && "rotate-180")}
                    />
                  )}
                </button>
              )}
              {isExpanded && (
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
                          {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

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
