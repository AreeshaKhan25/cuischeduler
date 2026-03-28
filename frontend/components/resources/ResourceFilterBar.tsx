"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { BUILDINGS } from "@/constants/cuiData";
import { useResources } from "@/hooks/useResources";

export function ResourceFilterBar() {
  const {
    selectedBuilding,
    typeFilter,
    statusFilter,
    searchQuery,
    setSelectedBuilding,
    setTypeFilter,
    setStatusFilter,
    setSearchQuery,
  } = useResources();

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-border bg-bg-secondary">
      <div className="flex items-center gap-2 text-text-secondary">
        <SlidersHorizontal size={16} />
        <span className="text-[12px] font-mono uppercase tracking-wider">Filters</span>
      </div>

      <div className="h-6 w-px bg-border" />

      {/* Building Dropdown */}
      <select
        value={selectedBuilding}
        onChange={(e) => setSelectedBuilding(e.target.value)}
        className={cn(
          "px-3 py-1.5 rounded-lg text-[13px] bg-bg-tertiary border border-border",
          "text-text-primary focus:outline-none focus:border-accent-blue",
          "transition-colors cursor-pointer"
        )}
      >
        {BUILDINGS.map((b) => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>

      {/* Type Filter */}
      <select
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
        className={cn(
          "px-3 py-1.5 rounded-lg text-[13px] bg-bg-tertiary border border-border",
          "text-text-primary focus:outline-none focus:border-accent-blue",
          "transition-colors cursor-pointer"
        )}
      >
        <option value="all">All Types</option>
        <option value="classroom">Classroom</option>
        <option value="lab">Lab</option>
      </select>

      {/* Status Filter */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className={cn(
          "px-3 py-1.5 rounded-lg text-[13px] bg-bg-tertiary border border-border",
          "text-text-primary focus:outline-none focus:border-accent-blue",
          "transition-colors cursor-pointer"
        )}
      >
        <option value="all">All Status</option>
        <option value="available">Available</option>
        <option value="occupied">Occupied</option>
        <option value="reserved">Reserved</option>
        <option value="maintenance">Maintenance</option>
      </select>

      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search rooms..."
          className={cn(
            "w-full pl-8 pr-3 py-1.5 rounded-lg text-[13px]",
            "bg-bg-tertiary border border-border text-text-primary",
            "placeholder:text-text-tertiary focus:outline-none focus:border-accent-blue",
            "transition-colors"
          )}
        />
      </div>
    </div>
  );
}

export default ResourceFilterBar;
