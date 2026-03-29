"use client";

import Link from "next/link";
import { Wand2, BookOpen, Users, Building2, UserCog } from "lucide-react";

const adminLinks = [
  { href: "/admin/auto-schedule", label: "Auto-Schedule", desc: "Generate timetable for all sections", icon: Wand2, color: "#4f8ef7" },
  { href: "/admin/courses", label: "Courses", desc: "Manage course catalog", icon: BookOpen, color: "#2dd4bf" },
  { href: "/admin/sections", label: "Sections", desc: "Manage sections and offerings", icon: Users, color: "#a855f7" },
  { href: "/admin/rooms", label: "Rooms & Labs", desc: "Manage classrooms and labs", icon: Building2, color: "#f59e0b" },
  { href: "/admin/users", label: "Users", desc: "Manage user accounts", icon: UserCog, color: "#22c55e" },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold text-text-primary">Administration</h1>
        <p className="text-sm text-text-secondary mt-0.5">Manage the scheduling system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <div className="p-5 bg-bg-secondary border border-border rounded-xl hover:border-border/80 transition-all hover:shadow-lg group">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: `${link.color}15` }}>
                  <link.icon size={20} style={{ color: link.color }} />
                </div>
                <h2 className="text-base font-semibold text-text-primary group-hover:text-accent-blue transition-colors">
                  {link.label}
                </h2>
              </div>
              <p className="text-sm text-text-tertiary">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
