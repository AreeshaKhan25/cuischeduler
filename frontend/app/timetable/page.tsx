"use client";

import { useEffect, useCallback } from "react";
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Wand2, Loader2 } from "lucide-react";
import { format, addWeeks, subWeeks, startOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { DEPARTMENTS } from "@/constants/cuiData";
import { useTimetable } from "@/hooks/useTimetable";
import { useResources } from "@/hooks/useResources";
import { TimetableGrid } from "@/components/timetable/TimetableGrid";
import { ResourceSidebar } from "@/components/timetable/ResourceSidebar";
import { ExportButton } from "@/components/timetable/ExportButton";

export default function TimetablePage() {
  const {
    entries,
    currentWeek,
    selectedDepartment,
    conflicts,
    isLoading,
    isAutoScheduling,
    fetchEntries,
    setWeek,
    setDepartment,
    moveEntry,
    autoSchedule,
    setDragState,
  } = useTimetable();

  const { fetchResources } = useResources();

  useEffect(() => {
    fetchEntries();
    fetchResources();
  }, [fetchEntries, fetchResources]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setDragState({ isDragging: true, activeId: String(event.active.id) });
  }, [setDragState]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setDragState({ isDragging: false, activeId: null, overId: null });

    const { active, over } = event;
    if (!over) return;

    const overId = String(over.id);
    if (!overId.startsWith("cell-")) return;

    const parts = overId.split("-");
    const dayIdx = parseInt(parts[1]);
    const hour = parts[2];

    const activeId = String(active.id);

    // If dragged from sidebar, we would create new entry (simplified)
    if (activeId.startsWith("sidebar-")) return;

    // Move existing entry
    moveEntry(activeId, dayIdx + 1, `${hour}`);
  }, [setDragState, moveEntry]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Page Header */}
      <PageHeader
        title="Timetable Management"
        subtitle="Weekly schedule viewed as a Gantt chart. Drag to reschedule — OS process scheduling in action."
        breadcrumb={["CUIScheduler", "Timetable"]}
        osConcepts={[
          OS_CONCEPTS.FCFS,
          OS_CONCEPTS.PRIORITY,
          OS_CONCEPTS.PROCESS_STATES,
        ]}
      />

      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Week Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeek(subWeeks(currentWeek, 1))}
            className="p-2 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors border border-border"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="px-4 py-2 rounded-lg bg-bg-secondary border border-border text-[13px] font-medium text-text-primary min-w-[200px] text-center">
            Week of {format(weekStart, "MMM dd, yyyy")}
          </div>
          <button
            onClick={() => setWeek(addWeeks(currentWeek, 1))}
            className="p-2 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors border border-border"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Department Filter */}
        <select
          value={selectedDepartment}
          onChange={(e) => setDepartment(e.target.value)}
          className="px-3 py-2 rounded-lg text-[13px] bg-bg-secondary border border-border text-text-primary focus:outline-none focus:border-accent-blue cursor-pointer"
        >
          <option value="all">All Departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Auto-Schedule Buttons */}
        <div className="flex items-center gap-2">
          {(["FCFS", "SJF", "PRIORITY", "RR"] as const).map((algo) => (
            <button
              key={algo}
              onClick={() => autoSchedule(algo)}
              disabled={isAutoScheduling}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-mono font-medium",
                "border border-border transition-all duration-200",
                isAutoScheduling
                  ? "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
                  : "bg-bg-secondary text-text-secondary hover:text-accent-blue hover:border-accent-blue/30 hover:bg-accent-blue/5"
              )}
            >
              {isAutoScheduling ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Wand2 size={12} />
              )}
              {algo}
            </button>
          ))}
        </div>

        {/* Export */}
        <ExportButton entries={entries} />
      </div>

      {/* Conflict Warning */}
      {conflicts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-danger-soft border border-danger/20"
        >
          <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
          <span className="text-[13px] text-danger font-medium">
            {conflicts.length} scheduling conflict{conflicts.length !== 1 ? "s" : ""} detected
          </span>
          <span className="text-[12px] text-text-secondary">
            — {conflicts[0].reason}
          </span>
        </motion.div>
      )}

      {/* Main Content: Sidebar + Grid */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4">
          {/* Resource Sidebar */}
          <ResourceSidebar />

          {/* Timetable Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-[500px] rounded-xl border border-border bg-bg-secondary">
                <div className="flex items-center gap-3 text-text-secondary">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-[14px]">Loading timetable...</span>
                </div>
              </div>
            ) : (
              <TimetableGrid
                entries={entries}
                conflicts={conflicts}
                selectedDepartment={selectedDepartment}
              />
            )}
          </div>
        </div>
      </DndContext>
    </div>
  );
}
