"use client";

import { cn } from "@/lib/utils";
import { Cpu, X, ExternalLink, BookOpen } from "lucide-react";

interface OSConcept {
  name: string;
  chapter: string;
  description: string;
  details?: string;
}

interface OSConceptSidebarProps {
  open: boolean;
  onClose: () => void;
  concepts: OSConcept[];
  pageTitle?: string;
}

const defaultConcepts: OSConcept[] = [
  {
    name: "CPU Scheduling",
    chapter: "OS Ch. 5",
    description:
      "The basis of multiprogrammed operating systems. By switching the CPU among processes, the OS makes the computer more productive.",
    details:
      "Scheduling algorithms include FCFS, SJF, Priority, and Round Robin. Each has different performance characteristics measured by turnaround time, waiting time, and response time.",
  },
  {
    name: "Process Synchronization",
    chapter: "OS Ch. 6",
    description:
      "Cooperating processes require mechanisms to ensure orderly execution. Semaphores, mutexes, and monitors provide this synchronization.",
  },
  {
    name: "Deadlock",
    chapter: "OS Ch. 8",
    description:
      "A set of blocked processes each holding a resource and waiting to acquire a resource held by another process. Characterized by mutual exclusion, hold and wait, no preemption, and circular wait.",
  },
  {
    name: "Memory Management",
    chapter: "OS Ch. 9",
    description:
      "Memory management keeps track of each byte in memory and manages allocation/deallocation of memory spaces as needed by programs.",
  },
];

export function OSConceptSidebar({
  open,
  onClose,
  concepts,
  pageTitle,
}: OSConceptSidebarProps) {
  const displayConcepts = concepts.length > 0 ? concepts : defaultConcepts;

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <aside
        className={cn(
          "fixed top-16 right-0 h-[calc(100vh-64px)] z-40",
          "bg-bg-secondary border-l border-border",
          "transition-all duration-300 ease-in-out",
          "flex flex-col",
          open ? "w-[320px] translate-x-0" : "w-[320px] translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-os-bg border border-os-border/50">
              <BookOpen size={14} className="text-os-text" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-text-primary">
                OS Concepts
              </h3>
              {pageTitle && (
                <p className="text-[10px] text-text-tertiary">
                  Related to: {pageTitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Concepts List */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-3">
          {displayConcepts.map((concept) => (
            <div
              key={concept.name}
              className="rounded-lg border border-border bg-bg-primary p-3 space-y-2 hover:border-os-border/30 transition-colors"
            >
              <div className="flex items-start gap-2">
                <Cpu size={14} className="text-os-text mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-[13px] font-mono font-semibold text-os-text">
                      {concept.name}
                    </h4>
                    <span className="text-[9px] font-mono text-os-text/50 bg-os-bg px-1.5 py-0.5 rounded">
                      {concept.chapter}
                    </span>
                  </div>
                  <p className="text-[12px] text-text-secondary mt-1 leading-relaxed">
                    {concept.description}
                  </p>
                  {concept.details && (
                    <p className="text-[11px] text-text-tertiary mt-1.5 leading-relaxed">
                      {concept.details}
                    </p>
                  )}
                </div>
              </div>
              <button className="flex items-center gap-1 text-[11px] font-mono text-accent-blue hover:text-accent-blue/80 transition-colors ml-6">
                <ExternalLink size={10} />
                Full Explanation
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border flex-shrink-0">
          <p className="text-[10px] text-text-tertiary font-mono text-center">
            Based on &quot;Operating System Concepts&quot; by Silberschatz, Galvin, Gagne
          </p>
        </div>
      </aside>
    </>
  );
}

export default OSConceptSidebar;
