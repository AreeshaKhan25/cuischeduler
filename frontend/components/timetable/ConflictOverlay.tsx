"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";

interface ConflictOverlayProps {
  description: string;
}

export function ConflictOverlay({ description }: ConflictOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 bg-danger/10 border-2 border-danger/50 rounded-md flex flex-col items-center justify-center p-1 pointer-events-none"
    >
      <AlertTriangle size={14} className="text-danger mb-0.5" />
      <span className="text-[8px] font-mono text-danger text-center leading-tight">
        {description}
      </span>
      <div className="mt-1">
        <OSConceptBadge
          concept="Resource Conflict"
          size="sm"
          pulse={false}
        />
      </div>
    </motion.div>
  );
}

export default ConflictOverlay;
