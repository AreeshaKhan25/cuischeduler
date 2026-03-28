"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { BUILDINGS } from "@/constants/cuiData";
import { useResources } from "@/hooks/useResources";
import { BuildingFloorPlan } from "@/components/resources/BuildingFloorPlan";
import { ResourceDetailPanel } from "@/components/resources/ResourceDetailPanel";
import { ResourceFilterBar } from "@/components/resources/ResourceFilterBar";
import { MemoryBitmap } from "@/components/resources/MemoryBitmap";
import { FragmentationBar } from "@/components/resources/FragmentationBar";
import { Building2 } from "lucide-react";

export default function ResourcesPage() {
  const {
    selectedBuilding,
    setSelectedBuilding,
    fetchResources,
    fetchPoolState,
  } = useResources();

  useEffect(() => {
    fetchResources();
    fetchPoolState();
  }, [fetchResources, fetchPoolState]);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Page Header */}
      <PageHeader
        title="Resource Management"
        subtitle="Campus rooms and labs managed as a physical memory bitmap — each slot tracked, allocated, and compacted."
        breadcrumb={["CUIScheduler", "Resources"]}
        osConcepts={[
          OS_CONCEPTS.MEMORY_BITMAP,
          OS_CONCEPTS.FRAGMENTATION,
        ]}
      />

      {/* Building Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-bg-secondary border border-border">
        {BUILDINGS.map((building) => (
          <button
            key={building}
            onClick={() => setSelectedBuilding(building)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200",
              selectedBuilding === building
                ? "bg-accent-blue/10 text-accent-blue border border-accent-blue/30 shadow-sm shadow-accent-blue/10"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
            )}
          >
            <Building2 size={14} />
            {building}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <ResourceFilterBar />

      {/* Building Floor Plan */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <BuildingFloorPlan />
      </motion.div>

      {/* Resource Detail Panel (slide-out) */}
      <ResourceDetailPanel />

      {/* Memory Bitmap Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <MemoryBitmap />
      </motion.div>

      {/* Fragmentation Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <FragmentationBar />
      </motion.div>
    </div>
  );
}
