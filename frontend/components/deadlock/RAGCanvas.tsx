"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import { RAGNode, RAGEdge } from "@/types";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { cn } from "@/lib/utils";
import { AlertTriangle, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface RAGCanvasProps {
  nodes: RAGNode[];
  edges: RAGEdge[];
  hasDeadlock: boolean;
  onNodeDrag?: (id: string, x: number, y: number) => void;
  className?: string;
}

export function RAGCanvas({ nodes, edges, hasDeadlock, onNodeDrag, className }: RAGCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  // Measure container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({
        width: Math.max(600, width),
        height: Math.max(400, height),
      });
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  const renderGraph = useCallback(() => {
    const svg = d3.select(svgRef.current);
    if (!svgRef.current || nodes.length === 0) {
      svg.selectAll("*").remove();
      return;
    }

    svg.selectAll("*").remove();

    const { width, height } = dimensions;

    // Defs for gradients, markers, filters
    const defs = svg.append("defs");

    // Process gradient (blue)
    const procGrad = defs.append("linearGradient").attr("id", "procGradient").attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
    procGrad.append("stop").attr("offset", "0%").attr("stop-color", "#4f8ef7");
    procGrad.append("stop").attr("offset", "100%").attr("stop-color", "#2563eb");

    // Process gradient (red for cycle)
    const procRedGrad = defs.append("linearGradient").attr("id", "procRedGradient").attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
    procRedGrad.append("stop").attr("offset", "0%").attr("stop-color", "#ef4444");
    procRedGrad.append("stop").attr("offset", "100%").attr("stop-color", "#dc2626");

    // Resource gradient (teal)
    const resGrad = defs.append("linearGradient").attr("id", "resGradient").attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
    resGrad.append("stop").attr("offset", "0%").attr("stop-color", "#2dd4bf");
    resGrad.append("stop").attr("offset", "100%").attr("stop-color", "#14b8a6");

    // Resource gradient (red for cycle)
    const resRedGrad = defs.append("linearGradient").attr("id", "resRedGradient").attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
    resRedGrad.append("stop").attr("offset", "0%").attr("stop-color", "#f87171");
    resRedGrad.append("stop").attr("offset", "100%").attr("stop-color", "#ef4444");

    // Glow filter
    const glowFilter = defs.append("filter").attr("id", "glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    glowFilter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
    const feMerge = glowFilter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Red glow filter
    const redGlowFilter = defs.append("filter").attr("id", "redGlow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    redGlowFilter.append("feGaussianBlur").attr("stdDeviation", "6").attr("result", "coloredBlur");
    const redMerge = redGlowFilter.append("feMerge");
    redMerge.append("feMergeNode").attr("in", "coloredBlur");
    redMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Arrow markers
    defs.append("marker")
      .attr("id", "arrowTeal")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 38)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#2dd4bf");

    defs.append("marker")
      .attr("id", "arrowOrange")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 38)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#f59e0b");

    defs.append("marker")
      .attr("id", "arrowRed")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 38)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#ef4444");

    // Zoom behavior
    const g = svg.append("g");
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom as any);

    // Map nodes by ID
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    // Draw edges
    const edgeGroup = g.append("g").attr("class", "edges");
    edges.forEach((edge) => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (!source || !target) return;

      const isInCycle = edge.in_cycle && hasDeadlock;
      const isAssignment = edge.type === "assignment";
      const dimmed = hasDeadlock && !edge.in_cycle;

      edgeGroup.append("line")
        .attr("x1", source.x)
        .attr("y1", source.y)
        .attr("x2", target.x)
        .attr("y2", target.y)
        .attr("stroke", isInCycle ? "#ef4444" : isAssignment ? "#2dd4bf" : "#f59e0b")
        .attr("stroke-width", isInCycle ? 3 : 2)
        .attr("stroke-dasharray", isAssignment ? "none" : "8,4")
        .attr("marker-end", `url(#${isInCycle ? "arrowRed" : isAssignment ? "arrowTeal" : "arrowOrange"})`)
        .attr("opacity", dimmed ? 0.3 : 1)
        .attr("filter", isInCycle ? "url(#redGlow)" : "none");
    });

    // Draw nodes
    const nodeGroup = g.append("g").attr("class", "nodes");

    const drag = d3.drag<SVGGElement, RAGNode>()
      .on("drag", function (event, d) {
        d.x = event.x;
        d.y = event.y;
        d3.select(this).attr("transform", `translate(${event.x},${event.y})`);

        // Update connected edges
        edgeGroup.selectAll("line").each(function () {
          const line = d3.select(this);
          edges.forEach((edge) => {
            const src = nodeMap.get(edge.source);
            const tgt = nodeMap.get(edge.target);
            if (!src || !tgt) return;
            if (edge.source === d.id || edge.target === d.id) {
              line.filter(function () {
                const lx1 = parseFloat(d3.select(this).attr("x1"));
                const ly1 = parseFloat(d3.select(this).attr("y1"));
                return (
                  (Math.abs(lx1 - src.x) < 1 && Math.abs(ly1 - src.y) < 1) ||
                  edge.source === d.id
                );
              });
            }
          });
        });
        // Re-render edges on drag
        onNodeDrag?.(d.id, event.x, event.y);
      });

    nodes.forEach((node) => {
      const isInCycle = node.in_cycle && hasDeadlock;
      const dimmed = hasDeadlock && !node.in_cycle;

      const nodeG = nodeGroup.append("g")
        .datum(node)
        .attr("transform", `translate(${node.x},${node.y})`)
        .attr("cursor", "grab")
        .attr("opacity", dimmed ? 0.3 : 1)
        .call(drag as unknown as (selection: d3.Selection<SVGGElement, RAGNode, null, undefined>) => void);

      if (node.type === "process") {
        // Process: circle
        nodeG.append("circle")
          .attr("r", 30)
          .attr("fill", isInCycle ? "url(#procRedGradient)" : "url(#procGradient)")
          .attr("stroke", isInCycle ? "#ef4444" : "#4f8ef7")
          .attr("stroke-width", 2)
          .attr("filter", isInCycle ? "url(#redGlow)" : "url(#glow)");

        // Pulsing ring for cycle nodes
        if (isInCycle) {
          nodeG.append("circle")
            .attr("r", 34)
            .attr("fill", "none")
            .attr("stroke", "#ef4444")
            .attr("stroke-width", 2)
            .attr("opacity", 0.6)
            .append("animate")
            .attr("attributeName", "r")
            .attr("values", "34;40;34")
            .attr("dur", "1.5s")
            .attr("repeatCount", "indefinite");

          nodeG.select("circle:last-of-type")
            .append("animate")
            .attr("attributeName", "opacity")
            .attr("values", "0.6;0;0.6")
            .attr("dur", "1.5s")
            .attr("repeatCount", "indefinite");
        }

        nodeG.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("fill", "#ffffff")
          .attr("font-family", "'JetBrains Mono', monospace")
          .attr("font-size", "14px")
          .attr("font-weight", "bold")
          .text(node.label);
      } else {
        // Resource: rounded rectangle
        const rectW = 80;
        const rectH = 40;
        nodeG.append("rect")
          .attr("x", -rectW / 2)
          .attr("y", -rectH / 2)
          .attr("width", rectW)
          .attr("height", rectH)
          .attr("rx", 8)
          .attr("ry", 8)
          .attr("fill", isInCycle ? "url(#resRedGradient)" : "url(#resGradient)")
          .attr("stroke", isInCycle ? "#ef4444" : "#14b8a6")
          .attr("stroke-width", 2)
          .attr("filter", isInCycle ? "url(#redGlow)" : "url(#glow)");

        if (isInCycle) {
          nodeG.append("rect")
            .attr("x", -rectW / 2 - 3)
            .attr("y", -rectH / 2 - 3)
            .attr("width", rectW + 6)
            .attr("height", rectH + 6)
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("fill", "none")
            .attr("stroke", "#ef4444")
            .attr("stroke-width", 2)
            .attr("opacity", 0.5)
            .append("animate")
            .attr("attributeName", "opacity")
            .attr("values", "0.5;0;0.5")
            .attr("dur", "1.5s")
            .attr("repeatCount", "indefinite");
        }

        // Instance dots
        if (node.instances && node.instances > 1) {
          for (let i = 0; i < node.instances; i++) {
            const dotX = -((node.instances - 1) * 8) / 2 + i * 8;
            nodeG.append("circle")
              .attr("cx", dotX)
              .attr("cy", rectH / 2 - 10)
              .attr("r", 3)
              .attr("fill", "#0f1117");
          }
        }

        nodeG.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", node.instances && node.instances > 1 ? "-0.1em" : "0.35em")
          .attr("fill", "#0f1117")
          .attr("font-family", "'JetBrains Mono', monospace")
          .attr("font-size", "11px")
          .attr("font-weight", "bold")
          .text(node.label);
      }
    });

    // Fit to view
    const bounds = g.node()?.getBBox();
    if (bounds) {
      const pad = 60;
      const scale = Math.min(
        (width - pad * 2) / (bounds.width || 1),
        (height - pad * 2) / (bounds.height || 1),
        1.5
      );
      const tx = width / 2 - (bounds.x + bounds.width / 2) * scale;
      const ty = height / 2 - (bounds.y + bounds.height / 2) * scale;
      svg.call(zoom.transform as any, d3.zoomIdentity.translate(tx, ty).scale(scale));
    }
  }, [nodes, edges, hasDeadlock, dimensions, onNodeDrag]);

  useEffect(() => {
    renderGraph();
    return () => {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove();
      }
    };
  }, [renderGraph]);

  const handleZoomIn = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>();
    svg.transition().duration(300).call(zoom.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>();
    svg.transition().duration(300).call(zoom.scaleBy, 0.7);
  };

  const handleFitView = () => {
    renderGraph();
  };

  return (
    <div className={cn("relative rounded-xl border border-border bg-bg-secondary overflow-hidden", className)} ref={containerRef}>
      {/* OS Concept Badge */}
      <OSConceptBadge
        concept={OS_CONCEPTS.DEADLOCK_RAG.name}
        chapter={OS_CONCEPTS.DEADLOCK_RAG.chapter}
        description={OS_CONCEPTS.DEADLOCK_RAG.description}
        size="sm"
        position="corner"
        pulse={false}
      />

      {/* Title */}
      <div className="absolute top-3 left-3 z-10">
        <h3 className="text-[13px] font-semibold text-text-primary font-mono">Resource Allocation Graph</h3>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-3 left-3 z-10 flex gap-1.5">
        <button onClick={handleZoomIn} className="w-8 h-8 rounded-lg bg-bg-tertiary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-light transition-all">
          <ZoomIn size={14} />
        </button>
        <button onClick={handleZoomOut} className="w-8 h-8 rounded-lg bg-bg-tertiary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-light transition-all">
          <ZoomOut size={14} />
        </button>
        <button onClick={handleFitView} className="w-8 h-8 rounded-lg bg-bg-tertiary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-light transition-all">
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1.5 bg-bg-primary/80 backdrop-blur-sm rounded-lg border border-border p-2.5">
        <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-0.5">Legend</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-b from-[#4f8ef7] to-[#2563eb]" />
          <span className="text-[10px] text-text-secondary">Process</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-3 rounded bg-gradient-to-b from-[#2dd4bf] to-[#14b8a6]" />
          <span className="text-[10px] text-text-secondary">Resource</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-0 border-t-2 border-[#2dd4bf]" />
          <span className="text-[10px] text-text-secondary">Assignment (R-&gt;P)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-0 border-t-2 border-dashed border-[#f59e0b]" />
          <span className="text-[10px] text-text-secondary">Request (P-&gt;R)</span>
        </div>
        {hasDeadlock && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-0 border-t-[3px] border-[#ef4444]" />
            <span className="text-[10px] text-danger font-medium">Cycle (Deadlock)</span>
          </div>
        )}
      </div>

      {/* Deadlock Alert Banner */}
      <AnimatePresence>
        {hasDeadlock && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-lg bg-danger/20 border border-danger/50 backdrop-blur-sm"
          >
            <AlertTriangle size={16} className="text-danger animate-pulse" />
            <span className="text-[13px] font-mono font-semibold text-danger">
              DEADLOCK DETECTED - Circular Wait in RAG
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-bg-tertiary border border-border flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary">
                <circle cx="8" cy="8" r="4" />
                <circle cx="16" cy="16" r="4" />
                <path d="M12 8h4v4" strokeDasharray="4 2" />
                <path d="M12 16H8v-4" strokeDasharray="4 2" />
              </svg>
            </div>
            <p className="text-[13px] text-text-tertiary">No processes or resources loaded</p>
            <p className="text-[11px] text-text-tertiary">Create a scenario to visualize the RAG</p>
          </div>
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
        style={{ minHeight: 400, background: "transparent" }}
      />
    </div>
  );
}

export default RAGCanvas;
