"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { GlowCard } from "@/components/ui/GlowCard";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { useDeadlock } from "@/hooks/useDeadlock";
import { cn } from "@/lib/utils";

const RAGCanvas = dynamic(() => import("@/components/deadlock/RAGCanvas").then(m => m.RAGCanvas), { ssr: false });
const BankersMatrix = dynamic(() => import("@/components/deadlock/BankersMatrix").then(m => m.BankersMatrix), { ssr: false });
const SafeSequenceDisplay = dynamic(() => import("@/components/deadlock/SafeSequenceDisplay").then(m => m.SafeSequenceDisplay), { ssr: false });
const DeadlockScenarioBuilder = dynamic(() => import("@/components/deadlock/DeadlockScenarioBuilder").then(m => m.DeadlockScenarioBuilder), { ssr: false });
const CycleHighlighter = dynamic(() => import("@/components/deadlock/CycleHighlighter").then(m => m.CycleHighlighter), { ssr: false });
const ResolutionPanel = dynamic(() => import("@/components/deadlock/ResolutionPanel").then(m => m.ResolutionPanel), { ssr: false });
import {
  Play,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  Cpu,
  HardDrive,
  RefreshCw,
  Zap,
} from "lucide-react";

const PAGE_OS_CONCEPTS = [OS_CONCEPTS.DEADLOCK_RAG, OS_CONCEPTS.BANKERS];

const COFFMAN_CONDITIONS = [
  { name: "Mutual Exclusion", description: "Resources are non-shareable" },
  { name: "Hold & Wait", description: "Processes hold resources while requesting more" },
  { name: "No Preemption", description: "Resources cannot be forcibly taken" },
  { name: "Circular Wait", description: "Processes form a circular chain of requests" },
];

export default function DeadlockPage() {
  const {
    ragNodes,
    ragEdges,
    analysis,
    isAnalyzing,
    hasDeadlock,
    selectedScenario,
    fetchRAG,
    analyze,
    createScenario,
    resolveDeadlock,
    updateNodePosition,
    reset,
  } = useDeadlock();

  useEffect(() => {
    fetchRAG();
  }, [fetchRAG]);

  const processCount = ragNodes.filter((n) => n.type === "process").length;
  const resourceCount = ragNodes.filter((n) => n.type === "resource").length;

  const handleCreateScenario = async (type: string) => {
    await createScenario(type);
    // Auto-run detection after scenario creation
    setTimeout(() => {
      analyze();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-[1440px] mx-auto px-6 py-8 space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <PageHeader
            title="Deadlock Detector"
            subtitle="Visualize Resource Allocation Graphs, detect cycles, and run Banker's Algorithm for safe state verification"
            osConcepts={PAGE_OS_CONCEPTS}
            breadcrumb={["CUIScheduler", "OS Concepts", "Deadlock Detection"]}
          />
        </motion.div>

        {/* Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4 flex-wrap"
        >
          {/* System Status */}
          <div className={cn(
            "flex items-center gap-2.5 px-4 py-2.5 rounded-xl border",
            hasDeadlock
              ? "bg-danger/5 border-danger/30"
              : "bg-success/5 border-success/30"
          )}>
            {hasDeadlock ? (
              <ShieldAlert size={18} className="text-danger" />
            ) : (
              <ShieldCheck size={18} className="text-success" />
            )}
            <div>
              <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider block">
                System Status
              </span>
              <span className={cn(
                "text-[14px] font-mono font-bold",
                hasDeadlock ? "text-danger" : "text-success"
              )}>
                {hasDeadlock ? "DEADLOCK" : "SAFE"}
              </span>
            </div>
          </div>

          {/* Active Processes */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-bg-secondary">
            <Cpu size={16} className="text-accent-blue" />
            <div>
              <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider block">Processes</span>
              <span className="text-[14px] font-mono font-bold text-text-primary">{processCount}</span>
            </div>
          </div>

          {/* Resources */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-bg-secondary">
            <HardDrive size={16} className="text-accent-teal" />
            <div>
              <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider block">Resources</span>
              <span className="text-[14px] font-mono font-bold text-text-primary">{resourceCount}</span>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Controls */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => analyze()}
              disabled={isAnalyzing || ragNodes.length === 0}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-[13px] transition-all",
                "bg-accent-blue text-white hover:bg-accent-blue/90",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "shadow-blue-glow"
              )}
            >
              {isAnalyzing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Play size={14} />
              )}
              Run Detection
            </motion.button>

            {hasDeadlock && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => resolveDeadlock("preempt")}
                disabled={isAnalyzing}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-[13px] transition-all",
                  "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <Zap size={14} />
                Resolve Deadlock
              </motion.button>
            )}

            <button
              onClick={reset}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] text-text-secondary border border-border hover:border-border-light hover:text-text-primary transition-all bg-bg-secondary"
            >
              <RefreshCw size={14} />
              Reset
            </button>
          </div>
        </motion.div>

        {/* Coffman Conditions Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-os-bg/20 border border-os-border/15"
        >
          <span className="text-[10px] font-mono text-os-text/60 uppercase tracking-wider mr-1 flex-shrink-0">
            Coffman Conditions:
          </span>
          <div className="flex flex-wrap gap-2">
            {COFFMAN_CONDITIONS.map((cond, i) => (
              <div
                key={cond.name}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono text-[11px]",
                  hasDeadlock
                    ? "bg-danger/8 border-danger/25 text-danger"
                    : "bg-bg-tertiary border-border/50 text-text-secondary"
                )}
              >
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full flex-shrink-0",
                  hasDeadlock ? "bg-danger animate-pulse" : "bg-text-tertiary"
                )} />
                {cond.name}
                {i < COFFMAN_CONDITIONS.length - 1 && (
                  <span className="text-text-tertiary ml-1">|</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main Content: 60/40 Split */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6"
        >
          {/* Left: RAG Canvas */}
          <div className="space-y-4">
            <RAGCanvas
              nodes={ragNodes}
              edges={ragEdges}
              hasDeadlock={hasDeadlock}
              onNodeDrag={updateNodePosition}
              className="h-[480px]"
            />

            {/* Cycle Highlighter */}
            {hasDeadlock && analysis && (
              <CycleHighlighter
                cycleDescription={analysis.cycle_description}
                cycleNodes={analysis.cycle_nodes}
                visible={hasDeadlock}
              />
            )}
          </div>

          {/* Right: Banker's Matrix */}
          <div className="space-y-4">
            <BankersMatrix analysis={analysis} className="max-h-[480px] overflow-y-auto" />

            {/* Safe Sequence */}
            {analysis && (
              <GlowCard glowColor={analysis.banker_safe ? "success" : "danger"} className="p-4">
                <SafeSequenceDisplay
                  sequence={analysis.safe_sequence}
                  isSafe={analysis.banker_safe}
                />
              </GlowCard>
            )}
          </div>
        </motion.div>

        {/* Scenario Builder */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlowCard glowColor="os">
            <DeadlockScenarioBuilder
              onCreateScenario={handleCreateScenario}
              selectedScenario={selectedScenario}
              isLoading={isAnalyzing}
            />
          </GlowCard>
        </motion.div>

        {/* Resolution Panel (slides up on deadlock) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <ResolutionPanel
            analysis={analysis}
            visible={hasDeadlock}
            isResolving={isAnalyzing}
            onResolve={resolveDeadlock}
          />
        </motion.div>

        {/* OS Concept Note */}
        {analysis?.os_concept_note && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="px-4 py-3 rounded-xl bg-os-bg/20 border border-os-border/15"
          >
            <OSConceptBadge
              concept="Deadlock Theory"
              chapter="Ch.7"
              description={analysis.os_concept_note}
              size="md"
              position="banner"
              pulse={false}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
