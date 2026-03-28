"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { cn } from "@/lib/utils";
import { Terminal } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: number;
  operation: string;
  process: string;
  resource: string;
  countChange: string;
  result: string;
  osNote: string;
}

interface OperationLogProps {
  entries: LogEntry[];
  className?: string;
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }) + `.${String(d.getMilliseconds()).padStart(3, "0")}`;
}

function getOperationColor(op: string): string {
  switch (op) {
    case "SEM_WAIT":
      return "text-warning";
    case "SEM_SIGNAL":
      return "text-success";
    case "MUTEX_LOCK":
      return "text-danger";
    case "MUTEX_UNLOCK":
      return "text-accent-teal";
    case "READ":
      return "text-accent-blue";
    case "WRITE":
      return "text-[#c084fc]";
    default:
      return "text-text-secondary";
  }
}

function getResultStyles(result: string): { bg: string; text: string } {
  switch (result) {
    case "GRANTED":
      return { bg: "bg-success/10", text: "text-success" };
    case "BLOCKED":
      return { bg: "bg-danger/10", text: "text-danger" };
    case "RELEASED":
      return { bg: "bg-accent-teal/10", text: "text-accent-teal" };
    case "ERROR":
      return { bg: "bg-danger/15", text: "text-danger" };
    default:
      return { bg: "bg-bg-tertiary", text: "text-text-secondary" };
  }
}

export function OperationLog({ entries, className }: OperationLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div className={cn("relative rounded-xl border border-border bg-bg-secondary overflow-hidden", className)}>
      {/* OS Badge */}
      <OSConceptBadge
        concept={OS_CONCEPTS.SEMAPHORE.name}
        chapter={OS_CONCEPTS.SEMAPHORE.chapter}
        description={OS_CONCEPTS.SEMAPHORE.description}
        size="sm"
        position="corner"
        pulse={false}
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border/50 bg-bg-tertiary/30">
        <Terminal size={14} className="text-accent-blue" />
        <h3 className="text-[13px] font-mono font-semibold text-text-primary">Operation Log</h3>
        <span className="px-2 py-0.5 rounded-full bg-bg-tertiary border border-border text-[10px] font-mono text-text-tertiary">
          {entries.length} entries
        </span>
        <div className="flex-1" />
        {entries.length > 0 && (
          <div className="flex items-center gap-1.5">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-success"
            />
            <span className="text-[10px] font-mono text-success">LIVE</span>
          </div>
        )}
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[110px_100px_60px_120px_90px_80px_1fr] gap-2 px-5 py-2 border-b border-border/30 bg-bg-primary/30">
        <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider">Timestamp</span>
        <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider">Operation</span>
        <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider">Process</span>
        <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider">Resource</span>
        <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider">Count</span>
        <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider">Result</span>
        <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider">OS Concept</span>
      </div>

      {/* Scrollable Log Body */}
      <div ref={scrollRef} className="overflow-y-auto max-h-[300px] scrollbar-thin">
        {entries.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-text-tertiary text-[13px] font-mono">
            Waiting for operations...
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {entries.map((entry) => {
              const opColor = getOperationColor(entry.operation);
              const resultStyles = getResultStyles(entry.result);

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-[110px_100px_60px_120px_90px_80px_1fr] gap-2 px-5 py-2 border-b border-border/15 hover:bg-bg-hover/30 transition-colors items-center font-mono text-[11px]"
                >
                  {/* Timestamp */}
                  <span className="text-text-tertiary tabular-nums">{formatTimestamp(entry.timestamp)}</span>

                  {/* Operation */}
                  <span className={cn("font-bold", opColor)}>{entry.operation}</span>

                  {/* Process */}
                  <span className="font-semibold text-accent-blue">{entry.process}</span>

                  {/* Resource */}
                  <span className="text-text-secondary truncate" title={entry.resource}>{entry.resource}</span>

                  {/* Count Change */}
                  <span className="text-text-secondary">{entry.countChange}</span>

                  {/* Result */}
                  <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold text-center", resultStyles.bg, resultStyles.text)}>
                    {entry.result}
                  </span>

                  {/* OS Concept Note */}
                  <span className="text-[10px] text-os-text/80 bg-os-bg/30 px-2 py-0.5 rounded truncate" title={entry.osNote}>
                    {entry.osNote}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default OperationLog;
