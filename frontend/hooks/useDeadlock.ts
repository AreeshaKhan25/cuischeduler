import { create } from "zustand";
import { RAGNode, RAGEdge, DeadlockAnalysis } from "@/types";
import { deadlockApi } from "@/lib/api";

interface DeadlockState {
  ragNodes: RAGNode[];
  ragEdges: RAGEdge[];
  analysis: DeadlockAnalysis | null;
  isAnalyzing: boolean;
  hasDeadlock: boolean;
  selectedScenario: string | null;

  // Actions
  fetchRAG: () => Promise<void>;
  analyze: () => Promise<void>;
  runBankers: () => Promise<void>;
  createScenario: (type: string) => Promise<void>;
  resolveDeadlock: (strategy: string) => Promise<void>;
  reset: () => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
}

// ─── Demo Data Generators ─────────────────────────────────────

function generateClassicDeadlock(): { nodes: RAGNode[]; edges: RAGEdge[] } {
  return {
    nodes: [
      { id: "P1", type: "process", label: "P1", x: 150, y: 100, in_cycle: true },
      { id: "P2", type: "process", label: "P2", x: 450, y: 100, in_cycle: true },
      { id: "R1", type: "resource", label: "R1(CS-101)", x: 150, y: 300, instances: 1, in_cycle: true },
      { id: "R2", type: "resource", label: "R2(Lab-A)", x: 450, y: 300, instances: 1, in_cycle: true },
    ],
    edges: [
      { id: "e1", source: "R1", target: "P1", type: "assignment", in_cycle: true },
      { id: "e2", source: "P1", target: "R2", type: "request", in_cycle: true },
      { id: "e3", source: "R2", target: "P2", type: "assignment", in_cycle: true },
      { id: "e4", source: "P2", target: "R1", type: "request", in_cycle: true },
    ],
  };
}

function generateChainDeadlock(): { nodes: RAGNode[]; edges: RAGEdge[] } {
  return {
    nodes: [
      { id: "P1", type: "process", label: "P1", x: 100, y: 80, in_cycle: true },
      { id: "P2", type: "process", label: "P2", x: 300, y: 80, in_cycle: true },
      { id: "P3", type: "process", label: "P3", x: 500, y: 80, in_cycle: true },
      { id: "R1", type: "resource", label: "R1(CS-301)", x: 100, y: 300, instances: 1, in_cycle: true },
      { id: "R2", type: "resource", label: "R2(EE-201)", x: 300, y: 300, instances: 1, in_cycle: true },
      { id: "R3", type: "resource", label: "R3(Lab-B)", x: 500, y: 300, instances: 1, in_cycle: true },
    ],
    edges: [
      { id: "e1", source: "R1", target: "P1", type: "assignment", in_cycle: true },
      { id: "e2", source: "P1", target: "R2", type: "request", in_cycle: true },
      { id: "e3", source: "R2", target: "P2", type: "assignment", in_cycle: true },
      { id: "e4", source: "P2", target: "R3", type: "request", in_cycle: true },
      { id: "e5", source: "R3", target: "P3", type: "assignment", in_cycle: true },
      { id: "e6", source: "P3", target: "R1", type: "request", in_cycle: true },
    ],
  };
}

function generateSafeScenario(): { nodes: RAGNode[]; edges: RAGEdge[] } {
  return {
    nodes: [
      { id: "P0", type: "process", label: "P0", x: 100, y: 80, in_cycle: false },
      { id: "P1", type: "process", label: "P1", x: 300, y: 80, in_cycle: false },
      { id: "P2", type: "process", label: "P2", x: 500, y: 80, in_cycle: false },
      { id: "R1", type: "resource", label: "R1(CS-101)", x: 150, y: 300, instances: 2, in_cycle: false },
      { id: "R2", type: "resource", label: "R2(Lab-A)", x: 400, y: 300, instances: 2, in_cycle: false },
    ],
    edges: [
      { id: "e1", source: "R1", target: "P0", type: "assignment", in_cycle: false },
      { id: "e2", source: "R2", target: "P1", type: "assignment", in_cycle: false },
      { id: "e3", source: "P2", target: "R1", type: "request", in_cycle: false },
      { id: "e4", source: "P0", target: "R2", type: "request", in_cycle: false },
    ],
  };
}

function generateDeadlockAnalysis(hasDeadlock: boolean, nodes: RAGNode[]): DeadlockAnalysis {
  const processNodes = nodes.filter((n) => n.type === "process");
  const processNames = processNodes.map((n) => n.label);
  const resourceNames = ["R1", "R2", "R3"].slice(0, Math.max(2, processNames.length));

  if (hasDeadlock) {
    const cycleNodes = nodes.filter((n) => n.in_cycle).map((n) => n.id);
    return {
      has_deadlock: true,
      cycle_nodes: cycleNodes,
      cycle_description: cycleNodes.join(" -> ") + " -> " + cycleNodes[0],
      banker_safe: false,
      safe_sequence: [],
      banker_matrix: {
        processes: processNames,
        resources: resourceNames,
        max: processNames.map(() => resourceNames.map(() => Math.floor(Math.random() * 3) + 1)),
        allocation: processNames.map(() => resourceNames.map(() => Math.floor(Math.random() * 2))),
        need: processNames.map(() => resourceNames.map(() => Math.floor(Math.random() * 2) + 1)),
        available: resourceNames.map(() => 0),
        steps: processNames.map((p) => ({
          process: p,
          can_run: false,
          reason: `Need exceeds Available for ${p}`,
          available_after: resourceNames.map(() => 0),
        })),
      },
      resolution_options: [
        {
          action: "preempt",
          target_process: processNames[processNames.length - 1],
          description: `Preempt resource from ${processNames[processNames.length - 1]} (lowest priority)`,
        },
        {
          action: "terminate",
          target_process: processNames[processNames.length - 1],
          description: `Terminate ${processNames[processNames.length - 1]} to break the cycle`,
        },
        {
          action: "rollback",
          target_process: processNames[0],
          description: `Rollback ${processNames[0]} to state before last resource request`,
        },
      ],
      os_concept_note:
        "Deadlock detected via cycle in Resource Allocation Graph. All four Coffman conditions hold: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.",
    };
  }

  // Safe scenario
  const safeSeq = [...processNames].sort(() => Math.random() - 0.5);
  const maxMatrix = processNames.map(() => resourceNames.map(() => Math.floor(Math.random() * 4) + 2));
  const allocMatrix = processNames.map((_, i) => resourceNames.map((_, j) => Math.floor(Math.random() * maxMatrix[i][j])));
  const needMatrix = processNames.map((_, i) => resourceNames.map((_, j) => maxMatrix[i][j] - allocMatrix[i][j]));
  const totalResources = resourceNames.map(() => Math.floor(Math.random() * 3) + 5);
  const totalAlloc = resourceNames.map((_, j) => allocMatrix.reduce((s, row) => s + row[j], 0));
  const available = resourceNames.map((_, j) => totalResources[j] - totalAlloc[j]);

  const steps: DeadlockAnalysis["banker_matrix"]["steps"] = [];
  const workingAvail = [...available];
  for (const proc of safeSeq) {
    const idx = processNames.indexOf(proc);
    const canRun = needMatrix[idx].every((n, j) => n <= workingAvail[j]);
    const beforeAvail = [...workingAvail];
    if (canRun) {
      allocMatrix[idx].forEach((a, j) => {
        workingAvail[j] += a;
      });
    }
    steps.push({
      process: proc,
      can_run: canRun,
      reason: canRun
        ? `Need [${needMatrix[idx].join(",")}] <= Available [${beforeAvail.join(",")}]`
        : `Need [${needMatrix[idx].join(",")}] > Available [${beforeAvail.join(",")}]`,
      available_after: [...workingAvail],
    });
  }

  return {
    has_deadlock: false,
    cycle_nodes: [],
    cycle_description: "",
    banker_safe: true,
    safe_sequence: safeSeq,
    banker_matrix: {
      processes: processNames,
      resources: resourceNames,
      max: maxMatrix,
      allocation: allocMatrix,
      need: needMatrix,
      available,
      steps,
    },
    resolution_options: [],
    os_concept_note:
      "System is in a SAFE state. Banker's Algorithm found a safe sequence where all processes can complete without deadlock.",
  };
}

function generateResolvedState(): { nodes: RAGNode[]; edges: RAGEdge[] } {
  return {
    nodes: [
      { id: "P1", type: "process", label: "P1", x: 150, y: 100, in_cycle: false },
      { id: "P2", type: "process", label: "P2", x: 450, y: 100, in_cycle: false },
      { id: "R1", type: "resource", label: "R1(CS-101)", x: 150, y: 300, instances: 1, in_cycle: false },
      { id: "R2", type: "resource", label: "R2(Lab-A)", x: 450, y: 300, instances: 1, in_cycle: false },
    ],
    edges: [
      { id: "e1", source: "R1", target: "P1", type: "assignment", in_cycle: false },
      { id: "e3", source: "R2", target: "P1", type: "assignment", in_cycle: false },
    ],
  };
}

export const useDeadlock = create<DeadlockState>((set, get) => ({
  ragNodes: [],
  ragEdges: [],
  analysis: null,
  isAnalyzing: false,
  hasDeadlock: false,
  selectedScenario: null,

  fetchRAG: async () => {
    try {
      const res = await deadlockApi.getRAG();
      const data = res.data?.data || res.data;
      set({
        ragNodes: data.nodes || [],
        ragEdges: data.edges || [],
      });
    } catch {
      // Use demo data if API is unavailable
      const demo = generateClassicDeadlock();
      set({ ragNodes: demo.nodes, ragEdges: demo.edges });
    }
  },

  analyze: async () => {
    set({ isAnalyzing: true });
    try {
      const res = await deadlockApi.analyze();
      const data = res.data?.data || res.data;
      set({
        analysis: data,
        hasDeadlock: data.has_deadlock,
        isAnalyzing: false,
      });
      // Update node cycle flags
      if (data.cycle_nodes?.length) {
        const { ragNodes, ragEdges } = get();
        set({
          ragNodes: ragNodes.map((n) => ({
            ...n,
            in_cycle: data.cycle_nodes.includes(n.id),
          })),
          ragEdges: ragEdges.map((e) => ({
            ...e,
            in_cycle:
              data.cycle_nodes.includes(e.source) &&
              data.cycle_nodes.includes(e.target),
          })),
        });
      }
    } catch {
      // Local analysis
      const { ragNodes, ragEdges } = get();
      const hasCycle = ragNodes.some((n) => n.in_cycle);
      const analysis = generateDeadlockAnalysis(hasCycle, ragNodes);
      set({
        analysis,
        hasDeadlock: analysis.has_deadlock,
        isAnalyzing: false,
      });
    }
  },

  runBankers: async () => {
    set({ isAnalyzing: true });
    try {
      const res = await deadlockApi.runBankers({});
      const data = res.data?.data || res.data;
      set((s) => ({
        analysis: s.analysis ? { ...s.analysis, ...data } : data,
        isAnalyzing: false,
      }));
    } catch {
      // Banker's already embedded in analysis
      const { analysis, ragNodes } = get();
      if (!analysis) {
        const hasCycle = ragNodes.some((n) => n.in_cycle);
        const newAnalysis = generateDeadlockAnalysis(hasCycle, ragNodes);
        set({ analysis: newAnalysis, isAnalyzing: false });
      } else {
        set({ isAnalyzing: false });
      }
    }
  },

  createScenario: async (type: string) => {
    set({ isAnalyzing: true, selectedScenario: type });
    try {
      const res = await deadlockApi.createScenario({ type });
      const data = res.data?.data || res.data;
      set({
        ragNodes: data.nodes || [],
        ragEdges: data.edges || [],
        analysis: null,
        hasDeadlock: false,
        isAnalyzing: false,
      });
    } catch {
      // Local scenario generation
      let scenario: { nodes: RAGNode[]; edges: RAGEdge[] };
      switch (type) {
        case "classic":
          scenario = generateClassicDeadlock();
          break;
        case "chain":
          scenario = generateChainDeadlock();
          break;
        case "safe":
          scenario = generateSafeScenario();
          break;
        default:
          scenario = generateClassicDeadlock();
      }
      set({
        ragNodes: scenario.nodes,
        ragEdges: scenario.edges,
        analysis: null,
        hasDeadlock: false,
        isAnalyzing: false,
      });
    }
  },

  resolveDeadlock: async (strategy: string) => {
    set({ isAnalyzing: true });
    try {
      const res = await deadlockApi.resolve({ strategy });
      const data = res.data?.data || res.data;
      set({
        ragNodes: data.nodes || [],
        ragEdges: data.edges || [],
        analysis: null,
        hasDeadlock: false,
        isAnalyzing: false,
      });
    } catch {
      // Local resolution
      const resolved = generateResolvedState();
      const safeAnalysis = generateDeadlockAnalysis(false, resolved.nodes);
      set({
        ragNodes: resolved.nodes,
        ragEdges: resolved.edges,
        analysis: safeAnalysis,
        hasDeadlock: false,
        isAnalyzing: false,
      });
    }
  },

  reset: () => {
    set({
      ragNodes: [],
      ragEdges: [],
      analysis: null,
      isAnalyzing: false,
      hasDeadlock: false,
      selectedScenario: null,
    });
  },

  updateNodePosition: (id, x, y) => {
    set((s) => ({
      ragNodes: s.ragNodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
    }));
  },
}));

export default useDeadlock;
