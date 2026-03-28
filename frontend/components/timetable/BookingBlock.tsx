"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import * as Tooltip from "@radix-ui/react-tooltip";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { TimetableEntry } from "@/types";

interface BookingBlockProps {
  entry: TimetableEntry;
  isConflicting?: boolean;
  isDragging?: boolean;
}

export function BookingBlock({ entry, isConflicting = false, isDragging = false }: BookingBlockProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: entry.id,
    data: { entry },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform), zIndex: 50 }
    : undefined;

  const startH = parseInt(entry.start_time.split(":")[0]);
  const endH = parseInt(entry.end_time.split(":")[0]);
  const durationSlots = endH - startH;

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div
            ref={setNodeRef}
            style={{
              ...style,
              backgroundColor: `${entry.color}18`,
              borderColor: `${entry.color}60`,
              height: `${durationSlots * 100}%`,
            }}
            className={cn(
              "absolute inset-x-0.5 rounded-md border px-2 py-1 cursor-grab active:cursor-grabbing",
              "transition-shadow duration-150 overflow-hidden group",
              "hover:shadow-lg",
              isDragging && "opacity-70 shadow-xl",
              isConflicting && "ring-2 ring-danger animate-pulse"
            )}
            {...attributes}
            {...listeners}
          >
            {/* Drag Handle */}
            <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-60 transition-opacity">
              <GripVertical size={10} className="text-text-tertiary" />
            </div>

            {/* Content */}
            <div className="flex flex-col h-full justify-between min-h-0">
              <div>
                <div
                  className="text-[11px] font-mono font-bold leading-tight truncate"
                  style={{ color: entry.color }}
                >
                  {entry.course_code}
                </div>
                {durationSlots >= 2 && (
                  <div className="text-[9px] text-text-secondary truncate mt-0.5">
                    {entry.resource_name}
                  </div>
                )}
              </div>
              {durationSlots >= 2 && (
                <div className="text-[8px] text-text-tertiary truncate">
                  {entry.faculty_name}
                </div>
              )}
            </div>

            {/* Resize handle */}
            <div className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize bg-transparent hover:bg-white/10 rounded-b" />
          </div>
        </Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content
            side="right"
            sideOffset={8}
            className="z-[9999] max-w-xs rounded-lg border px-4 py-3 bg-bg-secondary border-border shadow-lg animate-in fade-in-0 zoom-in-95 duration-150"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="font-semibold text-[13px] text-text-primary">{entry.course_code}</span>
              </div>
              <div className="text-[12px] text-text-primary">{entry.title}</div>
              <div className="space-y-1 text-[11px] text-text-secondary">
                <div>Room: {entry.resource_name}</div>
                <div>Faculty: {entry.faculty_name}</div>
                <div>Department: {entry.department}</div>
                <div>Time: {entry.start_time} - {entry.end_time}</div>
              </div>
              {isConflicting && (
                <div className="text-[11px] text-danger font-mono font-medium pt-1 border-t border-border">
                  CONFLICT DETECTED
                </div>
              )}
            </div>
            <Tooltip.Arrow className="fill-bg-secondary" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export default BookingBlock;
