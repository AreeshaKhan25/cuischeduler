"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DeadlockAnalysis } from "@/types";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, CheckCircle2, XCircle } from "lucide-react";

interface BankersMatrixProps {
  analysis: DeadlockAnalysis | null;
  className?: string;
}

function MatrixTable({
  title,
  processes,
  resources,
  data,
  highlightRow,
  highlightColor,
}: {
  title: string;
  processes: string[];
  resources: string[];
  data: number[][];
  highlightRow?: number;
  highlightColor?: string;
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider">{title}</h4>
      <div className="overflow-auto">
        <table className="w-full text-[12px] font-mono">
          <thead>
            <tr>
              <th className="px-2 py-1.5 text-left text-text-tertiary font-medium border-b border-border" />
              {resources.map((r) => (
                <th key={r} className="px-2 py-1.5 text-center text-accent-teal font-medium border-b border-border">
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processes.map((p, i) => (
              <tr
                key={p}
                className={cn(
                  "transition-colors duration-300",
                  highlightRow === i && highlightColor === "green" && "bg-success/10",
                  highlightRow === i && highlightColor === "red" && "bg-danger/10",
                  highlightRow === i && !highlightColor && "bg-accent-blue/10"
                )}
              >
                <td className="px-2 py-1.5 text-accent-blue font-semibold border-b border-border/50">{p}</td>
                {data[i]?.map((val, j) => (
                  <td
                    key={j}
                    className={cn(
                      "px-2 py-1.5 text-center border-b border-border/50 text-text-primary",
                      highlightRow === i && "font-bold"
                    )}
                  >
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function BankersMatrix({ analysis, className }: BankersMatrixProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [currentHighlight, setCurrentHighlight] = useState<number | null>(null);

  if (!analysis?.banker_matrix) {
    return (
      <div className={cn("rounded-xl border border-border bg-bg-secondary p-5", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold text-text-primary">Banker&apos;s Algorithm</h3>
          <OSConceptBadge
            concept={OS_CONCEPTS.BANKERS.name}
            chapter={OS_CONCEPTS.BANKERS.chapter}
            description={OS_CONCEPTS.BANKERS.description}
            size="sm"
            pulse={false}
          />
        </div>
        <div className="flex items-center justify-center h-48 text-text-tertiary text-[13px]">
          Run analysis to see Banker&apos;s Algorithm matrices
        </div>
      </div>
    );
  }

  const { processes, resources, max, allocation, need, available, steps } = analysis.banker_matrix;

  return (
    <div className={cn("rounded-xl border border-border bg-bg-secondary p-5 space-y-5 overflow-auto", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-text-primary font-mono">Banker&apos;s Algorithm</h3>
        <OSConceptBadge
          concept={OS_CONCEPTS.BANKERS.name}
          chapter={OS_CONCEPTS.BANKERS.chapter}
          description={OS_CONCEPTS.BANKERS.description}
          size="sm"
          pulse={false}
        />
      </div>

      {/* Safe Sequence or Unsafe Notice */}
      {analysis.banker_safe && analysis.safe_sequence.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/30"
        >
          <CheckCircle2 size={16} className="text-success flex-shrink-0" />
          <span className="text-[12px] font-mono text-success font-medium">
            Safe Sequence: {analysis.safe_sequence.join(" -> ")}
          </span>
        </motion.div>
      )}
      {!analysis.banker_safe && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-danger/10 border border-danger/30"
        >
          <XCircle size={16} className="text-danger flex-shrink-0" />
          <span className="text-[12px] font-mono text-danger font-medium">
            UNSAFE STATE - No safe sequence exists
          </span>
        </motion.div>
      )}

      {/* Matrices Row */}
      <div className="grid grid-cols-3 gap-4">
        <MatrixTable
          title="MAX"
          processes={processes}
          resources={resources}
          data={max}
          highlightRow={currentHighlight ?? undefined}
        />
        <MatrixTable
          title="ALLOCATION"
          processes={processes}
          resources={resources}
          data={allocation}
          highlightRow={currentHighlight ?? undefined}
        />
        <MatrixTable
          title="NEED"
          processes={processes}
          resources={resources}
          data={need}
          highlightRow={currentHighlight ?? undefined}
        />
      </div>

      {/* Available Vector */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider">Available</h4>
        <div className="flex gap-3">
          {resources.map((r, i) => (
            <div key={r} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-accent-teal">{r}</span>
              <span className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center font-mono text-[16px] font-bold border",
                available[i] > 0
                  ? "bg-success/10 border-success/30 text-success"
                  : "bg-danger/10 border-danger/30 text-danger"
              )}>
                {available[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step Proof */}
      {steps.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider">
            Step-by-Step Proof
          </h4>
          <div className="space-y-1">
            {steps.map((step, i) => (
              <div key={i} className="rounded-lg border border-border/50 overflow-hidden">
                <button
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                    "hover:bg-bg-hover",
                    expandedStep === i && "bg-bg-tertiary"
                  )}
                  onClick={() => {
                    setExpandedStep(expandedStep === i ? null : i);
                    setCurrentHighlight(i);
                  }}
                >
                  <span className="text-[11px] font-mono text-text-tertiary w-6">#{i + 1}</span>
                  {expandedStep === i ? (
                    <ChevronDown size={12} className="text-text-tertiary" />
                  ) : (
                    <ChevronRight size={12} className="text-text-tertiary" />
                  )}
                  <span className="text-[12px] font-mono font-semibold text-accent-blue">{step.process}</span>
                  {step.can_run ? (
                    <CheckCircle2 size={14} className="text-success" />
                  ) : (
                    <XCircle size={14} className="text-danger" />
                  )}
                  <span className={cn(
                    "text-[11px] font-mono ml-auto",
                    step.can_run ? "text-success" : "text-danger"
                  )}>
                    {step.can_run ? "CAN RUN" : "BLOCKED"}
                  </span>
                </button>
                <AnimatePresence>
                  {expandedStep === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 space-y-2 border-t border-border/30 pt-2">
                        <p className="text-[11px] font-mono text-text-secondary">{step.reason}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-text-tertiary">Available after:</span>
                          <div className="flex gap-1.5">
                            {step.available_after.map((v, j) => (
                              <span key={j} className="px-1.5 py-0.5 rounded bg-bg-primary text-[11px] font-mono text-text-primary border border-border/50">
                                {resources[j]}={v}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BankersMatrix;
