"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Search, Monitor, FlaskConical, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Resource } from "@/types";
import { ResourceDot } from "@/components/ui/ResourceDot";
import { useResources } from "@/hooks/useResources";

export function ResourceSidebar() {
  const { resources } = useResources();
  const [search, setSearch] = useState("");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const filtered = resources.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (showAvailableOnly && r.status !== "available") return false;
    return true;
  });

  const classrooms = filtered.filter((r) => r.type === "classroom");
  const labs = filtered.filter((r) => r.type === "lab");

  return (
    <div className="w-[220px] flex-shrink-0 rounded-xl border border-border bg-bg-secondary overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <h3 className="text-[13px] font-semibold text-text-primary mb-2">Resources</h3>
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-7 pr-2 py-1.5 rounded-md text-[11px] bg-bg-tertiary border border-border text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-blue"
          />
        </div>
        <label className="flex items-center gap-2 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showAvailableOnly}
            onChange={(e) => setShowAvailableOnly(e.target.checked)}
            className="rounded border-border text-accent-blue focus:ring-accent-blue/50 w-3 h-3"
          />
          <span className="text-[11px] text-text-secondary">Available only</span>
        </label>
      </div>

      {/* Resource Groups */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {/* Classrooms */}
        <ResourceGroup
          label="Classrooms"
          icon={<Monitor size={12} />}
          resources={classrooms}
        />

        {/* Labs */}
        <ResourceGroup
          label="Labs"
          icon={<FlaskConical size={12} />}
          resources={labs}
        />
      </div>
    </div>
  );
}

function ResourceGroup({
  label,
  icon,
  resources,
}: {
  label: string;
  icon: React.ReactNode;
  resources: Resource[];
}) {
  if (resources.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-1.5 px-1 mb-1.5">
        <span className="text-text-tertiary">{icon}</span>
        <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
          {label} ({resources.length})
        </span>
      </div>
      <div className="space-y-1">
        {resources.map((resource) => (
          <DraggableResource key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}

function DraggableResource({ resource }: { resource: Resource }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${resource.id}`,
    data: { resource, fromSidebar: true },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-grab active:cursor-grabbing",
        "bg-bg-tertiary/50 border border-transparent hover:border-border hover:bg-bg-tertiary",
        "transition-all duration-150 group",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <GripVertical size={10} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      <ResourceDot status={resource.status} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-text-primary truncate">{resource.name}</div>
        <div className="text-[9px] text-text-tertiary">{resource.capacity} seats</div>
      </div>
    </div>
  );
}

export default ResourceSidebar;
