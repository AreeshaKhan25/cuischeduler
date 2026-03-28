"use client";

import { useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { RAGNode, RAGEdge } from "@/types";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface RAGCanvasProps {
  nodes: RAGNode[];
  edges: RAGEdge[];
  hasDeadlock: boolean;
  onNodeDrag?: (id: string, x: number, y: number) => void;
  className?: string;
}

export function RAGCanvas({ nodes, edges, hasDeadlock, onNodeDrag, className }: RAGCanvasProps) {
  const flowNodes: Node[] = useMemo(() =>
    nodes.map((n, i) => ({
      id: n.id,
      position: { x: n.x ?? (n.type === "process" ? 100 + i * 180 : 100 + i * 180), y: n.y ?? (n.type === "process" ? 80 : 280) },
      data: { label: n.label || n.id },
      type: "default",
      style: {
        background: n.in_cycle
          ? "rgba(239, 68, 68, 0.15)"
          : n.type === "process"
          ? "rgba(79, 142, 247, 0.12)"
          : "rgba(45, 212, 191, 0.12)",
        border: n.in_cycle
          ? "2px solid #ef4444"
          : n.type === "process"
          ? "2px solid rgba(79, 142, 247, 0.5)"
          : "2px solid rgba(45, 212, 191, 0.5)",
        borderRadius: n.type === "process" ? "50%" : "8px",
        color: n.in_cycle ? "#fca5a5" : n.type === "process" ? "#93c5fd" : "#5eead4",
        fontSize: "12px",
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 600,
        width: n.type === "process" ? 70 : 100,
        height: n.type === "process" ? 70 : 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: n.in_cycle ? "0 0 20px rgba(239, 68, 68, 0.4)" : "0 0 8px rgba(0,0,0,0.3)",
        animation: n.in_cycle ? "pulse 1.5s ease-in-out infinite" : undefined,
      },
    })),
    [nodes]
  );

  const flowEdges: Edge[] = useMemo(() =>
    edges.map((e, i) => ({
      id: e.id || `e${i}`,
      source: e.source,
      target: e.target,
      label: e.type === "assignment" ? "holds" : "requests",
      labelStyle: { fontSize: 10, fill: e.in_cycle ? "#fca5a5" : "#8892aa", fontFamily: "'JetBrains Mono', monospace" },
      labelBgStyle: { fill: "rgba(12, 15, 24, 0.8)" },
      animated: e.in_cycle,
      style: {
        stroke: e.in_cycle ? "#ef4444" : e.type === "assignment" ? "#2dd4bf" : "#4f8ef7",
        strokeWidth: e.in_cycle ? 3 : 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: e.in_cycle ? "#ef4444" : e.type === "assignment" ? "#2dd4bf" : "#4f8ef7",
        width: 16,
        height: 16,
      },
    })),
    [edges]
  );

  const onNodeDragStop = useCallback(
    (_: unknown, node: Node) => {
      onNodeDrag?.(node.id, node.position.x, node.position.y);
    },
    [onNodeDrag]
  );

  return (
    <div className={cn("relative rounded-xl border border-border bg-bg-primary overflow-hidden", className)} style={{ height: 420 }}>
      {/* Header */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <OSConceptBadge concept="Resource Allocation Graph" chapter="Ch.7" size="sm" />
        {hasDeadlock && (
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-danger/20 border border-danger/40 text-danger text-[11px] font-mono font-bold animate-pulse">
            <AlertTriangle size={12} />
            DEADLOCK DETECTED
          </span>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 text-[10px] font-mono">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border-2 border-blue-400/50 bg-blue-400/10" /> Process</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border-2 border-teal-400/50 bg-teal-400/10" /> Resource</span>
        <span className="flex items-center gap-1"><span className="w-5 h-0.5 bg-teal-400" /> Holds</span>
        <span className="flex items-center gap-1"><span className="w-5 h-0.5 bg-blue-400" /> Requests</span>
        {hasDeadlock && <span className="flex items-center gap-1"><span className="w-5 h-0.5 bg-red-500" /> Cycle</span>}
      </div>

      {nodes.length > 0 ? (
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodeDragStop={onNodeDragStop}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.3}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1a2035" gap={20} size={1} />
          <Controls
            style={{ button: { background: "#1a2035", color: "#8892aa", border: "1px solid #2a3347" } } as unknown as React.CSSProperties}
            showInteractive={false}
          />
          <MiniMap
            nodeColor={(n) => (n.style?.border as string)?.includes("ef4444") ? "#ef4444" : (n.style?.border as string)?.includes("2dd4bf") ? "#2dd4bf" : "#4f8ef7"}
            maskColor="rgba(12, 15, 24, 0.8)"
            style={{ background: "#0d1117", border: "1px solid #2a3347" }}
          />
        </ReactFlow>
      ) : (
        <div className="flex items-center justify-center h-full text-text-tertiary text-sm">
          <div className="text-center">
            <p>No RAG data available</p>
            <p className="text-[11px] mt-1">Create a scenario or click "Detect Now" to build the graph</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default RAGCanvas;
