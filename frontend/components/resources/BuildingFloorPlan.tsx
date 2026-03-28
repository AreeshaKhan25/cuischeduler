"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Users, Wifi, Wind, Mic, Video, Cpu as CpuIcon, Wrench } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { Resource, ResourceStatus } from "@/types";
import { ResourceDot } from "@/components/ui/ResourceDot";
import { useResources } from "@/hooks/useResources";

const featureIcons: Record<string, React.ReactNode> = {
  Projector: <Monitor size={12} />,
  PCs: <CpuIcon size={12} />,
  "Air Conditioning": <Wind size={12} />,
  "Mic System": <Mic size={12} />,
  "Video Conferencing": <Video size={12} />,
  Whiteboard: <Wrench size={12} />,
  "Smart Board": <Monitor size={12} />,
  Recording: <Video size={12} />,
  "Network Racks": <Wifi size={12} />,
};

const statusBorderColor: Record<ResourceStatus, string> = {
  available: "border-success/40 hover:border-success/70",
  occupied: "border-danger/40 hover:border-danger/70",
  reserved: "border-warning/40 hover:border-warning/70",
  maintenance: "border-text-tertiary/40 hover:border-text-tertiary/70",
};

const statusBgGlow: Record<ResourceStatus, string> = {
  available: "hover:shadow-success-glow",
  occupied: "hover:shadow-danger-glow",
  reserved: "hover:shadow-warning-glow",
  maintenance: "",
};

interface BuildingFloorPlanProps {
  className?: string;
}

export function BuildingFloorPlan({ className }: BuildingFloorPlanProps) {
  const {
    resources,
    selectedBuilding,
    selectedResource,
    typeFilter,
    statusFilter,
    searchQuery,
    selectResource,
  } = useResources();

  // Filter resources for selected building
  const buildingResources = resources.filter((r) => {
    if (r.building !== selectedBuilding) return false;
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Group by floor (descending so top floor appears first)
  const floors = [...new Set(buildingResources.map((r) => r.floor))].sort((a, b) => b - a);

  return (
    <div className={cn("space-y-6", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedBuilding}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {floors.length === 0 && (
            <div className="text-center py-12 text-text-tertiary text-[14px]">
              No rooms found matching your filters.
            </div>
          )}

          {floors.map((floor) => {
            const floorRooms = buildingResources.filter((r) => r.floor === floor);
            return (
              <div key={floor} className="space-y-3">
                {/* Floor Header */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-bg-tertiary border border-border">
                    <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">
                      Floor {floor}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[11px] text-text-tertiary">
                    {floorRooms.length} room{floorRooms.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Rooms Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {floorRooms.map((room, idx) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      isSelected={selectedResource?.id === room.id}
                      onSelect={() => selectResource(selectedResource?.id === room.id ? null : room)}
                      index={idx}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface RoomCardProps {
  room: Resource;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

function RoomCard({ room, isSelected, onSelect, index }: RoomCardProps) {
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            onClick={onSelect}
            className={cn(
              "relative w-full text-left p-4 rounded-xl border transition-all duration-200",
              "bg-bg-secondary group cursor-pointer",
              statusBorderColor[room.status],
              statusBgGlow[room.status],
              isSelected && "ring-2 ring-accent-blue ring-offset-2 ring-offset-bg-primary border-accent-blue/60"
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-[14px] font-semibold text-text-primary leading-tight">
                  {room.name}
                </h4>
                <span className="text-[11px] font-mono text-text-tertiary uppercase">
                  {room.type}
                </span>
              </div>
              <ResourceDot status={room.status} pulse={room.status === "available"} size="md" />
            </div>

            {/* Capacity */}
            <div className="flex items-center gap-1.5 mb-3">
              <Users size={12} className="text-text-tertiary" />
              <span className="text-[12px] text-text-secondary">{room.capacity} seats</span>
            </div>

            {/* Feature Icons */}
            <div className="flex flex-wrap gap-1.5">
              {room.features.slice(0, 4).map((feat) => (
                <span
                  key={feat}
                  className="flex items-center justify-center w-6 h-6 rounded-md bg-bg-tertiary text-text-tertiary"
                >
                  {featureIcons[feat] || <Wrench size={12} />}
                </span>
              ))}
              {room.features.length > 4 && (
                <span className="flex items-center justify-center w-6 h-6 rounded-md bg-bg-tertiary text-text-tertiary text-[10px] font-mono">
                  +{room.features.length - 4}
                </span>
              )}
            </div>

            {/* Status Label */}
            <div className="mt-3 pt-2 border-t border-border">
              <span className={cn(
                "text-[11px] font-mono uppercase tracking-wider",
                room.status === "available" && "text-success",
                room.status === "occupied" && "text-danger",
                room.status === "reserved" && "text-warning",
                room.status === "maintenance" && "text-text-tertiary",
              )}>
                {room.status}
              </span>
            </div>
          </motion.button>
        </Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            sideOffset={8}
            className="z-[9999] max-w-xs rounded-lg border px-4 py-3 bg-bg-secondary border-border shadow-lg animate-in fade-in-0 zoom-in-95 duration-150"
          >
            <div className="space-y-2">
              <div className="font-semibold text-[13px] text-text-primary">{room.name}</div>
              <div className="text-[12px] text-text-secondary">
                {room.building} - Floor {room.floor} - {room.capacity} seats
              </div>
              <div className="text-[11px] text-text-tertiary">
                Features: {room.features.join(", ")}
              </div>
              {room.status === "occupied" && (
                <div className="text-[11px] text-danger font-mono">
                  Currently in use
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

export default BuildingFloorPlan;
