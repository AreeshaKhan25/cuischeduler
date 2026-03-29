"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Users, Layers, Monitor, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Resource, ResourceStatus } from "@/types";
import { ResourceDot } from "@/components/ui/ResourceDot";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { useResources } from "@/hooks/useResources";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

// Mock schedule data for visual display
const mockScheduleSlots: Record<string, { day: number; hour: number; course: string; faculty: string }[]> = {
  "cs-101": [
    { day: 0, hour: 0, course: "CSC301", faculty: "Dr. Ahmed" },
    { day: 0, hour: 1, course: "CSC301", faculty: "Dr. Ahmed" },
    { day: 2, hour: 0, course: "CSC301", faculty: "Dr. Ahmed" },
    { day: 2, hour: 1, course: "CSC301", faculty: "Dr. Ahmed" },
    { day: 4, hour: 3, course: "CSC205", faculty: "Dr. Fatima" },
  ],
  "cs-201": [
    { day: 0, hour: 2, course: "CSC302", faculty: "Dr. Fatima" },
    { day: 3, hour: 2, course: "CSC302", faculty: "Dr. Fatima" },
    { day: 3, hour: 3, course: "CSC302", faculty: "Dr. Fatima" },
  ],
  "cs-301": [
    { day: 0, hour: 6, course: "CSC401", faculty: "Dr. Usman" },
    { day: 0, hour: 7, course: "CSC401", faculty: "Dr. Usman" },
    { day: 4, hour: 1, course: "CSC401", faculty: "Dr. Usman" },
    { day: 4, hour: 2, course: "CSC401", faculty: "Dr. Usman" },
  ],
};

interface ResourceDetailPanelProps {
  className?: string;
}

export function ResourceDetailPanel({ className }: ResourceDetailPanelProps) {
  const { selectedResource, selectResource } = useResources();

  const scheduleSlots = selectedResource ? (mockScheduleSlots[selectedResource.id] || []) : [];

  const isSlotBooked = (dayIdx: number, hourIdx: number) => {
    return scheduleSlots.find((s) => s.day === dayIdx && s.hour === hourIdx);
  };

  return (
    <AnimatePresence>
      {selectedResource && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => selectResource(null)}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed top-0 right-0 h-full w-full max-w-[480px] z-50",
              "bg-bg-primary border-l border-border overflow-y-auto",
              className
            )}
          >
            {/* Close Button */}
            <button
              onClick={() => selectResource(null)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-bg-hover text-text-tertiary hover:text-text-primary transition-colors z-10"
            >
              <X size={18} />
            </button>

            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-bg-secondary border border-border">
                    <Monitor size={24} className="text-accent-blue" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-display font-bold text-text-primary">
                      {selectedResource.name}
                    </h2>
                    <span className="text-[12px] font-mono text-text-tertiary uppercase tracking-wider">
                      {selectedResource.type}
                    </span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  selectedResource.status === "available" && "bg-success-soft border-success/20",
                  selectedResource.status === "occupied" && "bg-danger-soft border-danger/20",
                  selectedResource.status === "reserved" && "bg-warning-soft border-warning/20",
                  selectedResource.status === "maintenance" && "bg-bg-tertiary border-border",
                )}>
                  <ResourceDot status={selectedResource.status as ResourceStatus} pulse size="lg" />
                  <span className={cn(
                    "text-[14px] font-semibold capitalize",
                    selectedResource.status === "available" && "text-success",
                    selectedResource.status === "occupied" && "text-danger",
                    selectedResource.status === "reserved" && "text-warning",
                    selectedResource.status === "maintenance" && "text-text-tertiary",
                  )}>
                    {selectedResource.status}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <DetailItem icon={MapPin} label="Building" value={selectedResource.building} />
                <DetailItem icon={Layers} label="Floor" value={`Floor ${selectedResource.floor}`} />
                <DetailItem icon={Users} label="Capacity" value={`${selectedResource.capacity} seats`} />
                <DetailItem icon={Clock} label="Department" value={selectedResource.department} />
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h3 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider">
                  Features
                </h3>
                <div className="flex flex-wrap gap-2">
                  {((() => { try { const f = selectedResource.features; return Array.isArray(f) ? f : typeof f === 'string' ? JSON.parse(f) : []; } catch { return []; } })() as string[]).map((feat) => (
                    <span
                      key={feat}
                      className="px-2.5 py-1 rounded-md bg-bg-tertiary border border-border text-[12px] text-text-secondary"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Weekly Schedule Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                    <Calendar size={14} />
                    Weekly Schedule
                  </h3>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  {/* Day Headers */}
                  <div className="grid grid-cols-[60px_repeat(5,1fr)] bg-bg-tertiary border-b border-border">
                    <div className="p-1.5 text-[10px] font-mono text-text-tertiary text-center">
                      Time
                    </div>
                    {DAYS.map((day) => (
                      <div key={day} className="p-1.5 text-[10px] font-mono text-text-secondary text-center border-l border-border">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Time Rows */}
                  {HOURS.map((hour, hourIdx) => (
                    <div
                      key={hour}
                      className={cn(
                        "grid grid-cols-[60px_repeat(5,1fr)]",
                        hourIdx < HOURS.length - 1 && "border-b border-border/50",
                        hour === "12:00" && "bg-warning-soft/30"
                      )}
                    >
                      <div className="p-1.5 text-[10px] font-mono text-text-tertiary text-center flex items-center justify-center">
                        {hour}
                      </div>
                      {DAYS.map((_, dayIdx) => {
                        const booking = isSlotBooked(dayIdx, hourIdx);
                        return (
                          <div
                            key={dayIdx}
                            className={cn(
                              "p-1 border-l border-border/50 min-h-[28px] flex items-center justify-center",
                              booking ? "bg-accent-blue-soft" : "bg-transparent"
                            )}
                          >
                            {booking && (
                              <span className="text-[9px] font-mono text-accent-blue font-medium truncate">
                                {booking.course}
                              </span>
                            )}
                            {hour === "12:00" && !booking && (
                              <span className="text-[8px] font-mono text-warning/50">BREAK</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* OS Concept */}
              <OSConceptBadge
                concept={OS_CONCEPTS.PCB.name}
                chapter={OS_CONCEPTS.PCB.chapter}
                description={OS_CONCEPTS.PCB.description}
                position="banner"
                size="md"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-lg bg-bg-secondary border border-border">
      <Icon size={14} className="text-text-tertiary flex-shrink-0" />
      <div>
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">{label}</div>
        <div className="text-[13px] text-text-primary font-medium">{value}</div>
      </div>
    </div>
  );
}

export default ResourceDetailPanel;
