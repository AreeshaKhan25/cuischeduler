"use client";

import { useDroppable } from "@dnd-kit/core";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { TimetableEntry } from "@/types";
import { BookingBlock } from "./BookingBlock";
import { ConflictOverlay } from "./ConflictOverlay";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { OS_CONCEPTS } from "@/constants/osConcepts";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00",
];

interface TimetableGridProps {
  entries: TimetableEntry[];
  conflicts: { entryA: string; entryB: string; reason: string }[];
  selectedDepartment: string;
}

export function TimetableGrid({ entries, conflicts, selectedDepartment }: TimetableGridProps) {
  const filteredEntries = selectedDepartment === "all"
    ? entries
    : entries.filter((e) => e.department === selectedDepartment);

  const conflictingIds = new Set(conflicts.flatMap((c) => [c.entryA, c.entryB]));

  const getEntriesForCell = (dayIdx: number, hourStr: string) => {
    const hour = parseInt(hourStr.split(":")[0]);
    return filteredEntries.filter((e) => {
      const startH = parseInt(e.start_time.split(":")[0]);
      return e.day_of_week === dayIdx + 1 && startH === hour;
    });
  };

  const isSlotOccupied = (dayIdx: number, hourStr: string) => {
    const hour = parseInt(hourStr.split(":")[0]);
    return filteredEntries.some((e) => {
      const startH = parseInt(e.start_time.split(":")[0]);
      const endH = parseInt(e.end_time.split(":")[0]);
      return e.day_of_week === dayIdx + 1 && hour >= startH && hour < endH;
    });
  };

  return (
    <div className="relative rounded-xl border border-border bg-bg-secondary overflow-hidden">
      {/* OS Concept Badge */}
      <OSConceptBadge
        concept={OS_CONCEPTS.FCFS.name}
        chapter={OS_CONCEPTS.FCFS.chapter}
        description={OS_CONCEPTS.FCFS.description}
        size="sm"
        position="corner"
        pulse={false}
      />

      {/* Grid */}
      <div className="grid grid-cols-[70px_repeat(5,1fr)]">
        {/* Header Row */}
        <div className="p-2 bg-bg-tertiary border-b border-r border-border" />
        {DAYS.map((day) => (
          <div
            key={day}
            className="p-2.5 bg-bg-tertiary border-b border-r border-border last:border-r-0 text-center"
          >
            <span className="text-[12px] font-semibold text-text-primary">{day}</span>
          </div>
        ))}

        {/* Time Rows */}
        {HOURS.map((hour, hourIdx) => {
          const isBreak = hour === "12:00";
          return (
            <div key={hour} className="contents">
              {/* Time Label */}
              <div
                className={cn(
                  "p-2 border-b border-r border-border flex items-start justify-center",
                  isBreak && "bg-warning-soft/20"
                )}
              >
                <span className="text-[11px] font-mono text-text-tertiary">{hour}</span>
              </div>

              {/* Day Cells */}
              {DAYS.map((_, dayIdx) => (
                <DroppableCell
                  key={`${dayIdx}-${hour}`}
                  dayIdx={dayIdx}
                  hour={hour}
                  isBreak={isBreak}
                  entries={getEntriesForCell(dayIdx, hour)}
                  isOccupied={isSlotOccupied(dayIdx, hour)}
                  conflictingIds={conflictingIds}
                  conflicts={conflicts}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DroppableCell({
  dayIdx,
  hour,
  isBreak,
  entries,
  isOccupied,
  conflictingIds,
  conflicts,
}: {
  dayIdx: number;
  hour: string;
  isBreak: boolean;
  entries: TimetableEntry[];
  isOccupied: boolean;
  conflictingIds: Set<string>;
  conflicts: { entryA: string; entryB: string; reason: string }[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${dayIdx}-${hour}`,
    data: { dayIdx, hour },
  });

  // Find if any entry in this cell has a conflict
  const cellConflict = entries.length > 0
    ? conflicts.find((c) => entries.some((e) => e.id === c.entryA || e.id === c.entryB))
    : null;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative border-b border-r border-border last:border-r-0 min-h-[56px]",
        isBreak && "bg-warning-soft/10",
        isOver && !isOccupied && "bg-accent-blue/10 border-accent-blue/30",
        isOver && isOccupied && "bg-danger/10 border-danger/30"
      )}
    >
      {/* Break Label */}
      {isBreak && entries.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-mono text-warning/40 uppercase tracking-widest">
            Break
          </span>
        </div>
      )}

      {/* Drop highlight */}
      {isOver && (
        <div className={cn(
          "absolute inset-0 border-2 border-dashed rounded-sm z-20 pointer-events-none",
          !isOccupied ? "border-accent-blue/50" : "border-danger/50"
        )} />
      )}

      {/* Booking Blocks */}
      {entries.map((entry) => (
        <BookingBlock
          key={entry.id}
          entry={entry}
          isConflicting={conflictingIds.has(entry.id)}
        />
      ))}

      {/* Conflict Overlay */}
      <AnimatePresence>
        {cellConflict && (
          <ConflictOverlay description={cellConflict.reason} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default TimetableGrid;
