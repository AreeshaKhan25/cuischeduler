"use client";

import { cn } from "@/lib/utils";
import { DAYS, TIME_SLOT_DETAILS, COURSE_COLORS } from "@/constants/cuiData";
import { TimetableEntry } from "@/types";

interface Props {
  entries: TimetableEntry[];
  onCellClick?: (entry: TimetableEntry) => void;
  onEmptyCellClick?: (day: string, slotIndex: number) => void;
}

function getCourseColor(department: string): string {
  return COURSE_COLORS[department] || COURSE_COLORS["General"];
}

export function SectionTimetableGrid({ entries, onCellClick, onEmptyCellClick }: Props) {
  // Build a lookup: day-slot -> entry
  const grid = new Map<string, TimetableEntry>();
  for (const entry of entries) {
    grid.set(`${entry.dayOfWeek}-${entry.slotIndex}`, entry);
    // Lab entries also occupy the next slot
    if (entry.isLab && entry.slotIndex < 6) {
      grid.set(`${entry.dayOfWeek}-${entry.slotIndex + 1}`, entry);
    }
  }

  // Track which cells are the "continuation" of a lab (not the start)
  const labContinuation = new Set<string>();
  for (const entry of entries) {
    if (entry.isLab && entry.slotIndex < 6) {
      labContinuation.add(`${entry.dayOfWeek}-${entry.slotIndex + 1}`);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr>
            <th className="w-20 px-2 py-3 text-[10px] font-mono font-semibold text-text-tertiary uppercase tracking-wider border border-border bg-bg-secondary">
              Time
            </th>
            {DAYS.map((day) => (
              <th
                key={day}
                className="px-2 py-3 text-[11px] font-semibold text-text-primary uppercase tracking-wide border border-border bg-bg-secondary"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOT_DETAILS.map((slot, idx) => {
            // Add lunch separator before slot 4
            const rows = [];
            if (idx === 4) {
              rows.push(
                <tr key="lunch">
                  <td
                    colSpan={6}
                    className="py-1 text-center text-[10px] font-mono text-text-tertiary bg-bg-hover border-x border-border"
                  >
                    LUNCH BREAK (12:40 - 13:20)
                  </td>
                </tr>
              );
            }

            rows.push(
              <tr key={slot.index}>
                <td className="px-2 py-1 border border-border bg-bg-secondary text-center">
                  <div className="text-[10px] font-mono text-text-tertiary">Slot {slot.label}</div>
                  <div className="text-[11px] font-mono text-text-secondary">
                    {slot.start}
                  </div>
                  <div className="text-[10px] font-mono text-text-tertiary">
                    {slot.end}
                  </div>
                </td>
                {DAYS.map((day) => {
                  const key = `${day}-${slot.index}`;
                  const entry = grid.get(key);
                  const isContinuation = labContinuation.has(key);

                  if (isContinuation) {
                    // This cell is merged into the lab above — skip render (rowSpan handled by the start cell)
                    return null;
                  }

                  if (!entry) {
                    return (
                      <td
                        key={key}
                        className="border border-border/50 bg-bg-primary hover:bg-bg-hover/50 transition-colors cursor-pointer min-h-[60px]"
                        onClick={() => onEmptyCellClick?.(day, slot.index)}
                      >
                        <div className="h-[60px]" />
                      </td>
                    );
                  }

                  const co = entry.courseOffering;
                  const color = getCourseColor(co?.course?.department || "General");
                  const isLab = entry.isLab;

                  return (
                    <td
                      key={key}
                      className={cn(
                        "border border-border/50 p-1 cursor-pointer transition-all hover:brightness-110",
                        isLab ? "min-h-[124px]" : "min-h-[60px]"
                      )}
                      rowSpan={isLab ? 2 : 1}
                      style={{ backgroundColor: `${color}15`, borderLeftColor: color, borderLeftWidth: 3 }}
                      onClick={() => onCellClick?.(entry)}
                    >
                      <div className="flex flex-col gap-0.5 px-1">
                        <div className="flex items-center gap-1">
                          <span
                            className="text-[11px] font-bold truncate"
                            style={{ color }}
                          >
                            {co?.course?.code || "—"}
                          </span>
                          {isLab && (
                            <span
                              className="text-[8px] font-mono px-1 py-0.5 rounded"
                              style={{ backgroundColor: `${color}30`, color }}
                            >
                              LAB
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-text-secondary truncate">
                          {co?.course?.name || "Unknown Course"}
                        </div>
                        <div className="text-[10px] text-text-tertiary truncate">
                          {co?.faculty?.name || "TBD"}
                        </div>
                        <div className="text-[10px] font-mono text-text-tertiary">
                          {entry.resource?.name || "—"}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );

            return rows;
          })}
        </tbody>
      </table>
    </div>
  );
}
