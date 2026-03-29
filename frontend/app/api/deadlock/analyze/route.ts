export const dynamic = "force-dynamic";
import { jsonResponse } from "@/lib/auth-helpers";
import { buildRag, detectCycleDfs } from "@/lib/deadlock-detector";

export async function POST() {
  // Mock booking/resource data for deadlock analysis demo
  const bd = [
    { id: 1, process_id: "P1", title: "OS Lab Session", resource_id: 1, state: "running" },
    { id: 2, process_id: "P2", title: "Data Structures Lab", resource_id: 2, state: "running" },
    { id: 3, process_id: "P3", title: "AI Lab Session", resource_id: 3, state: "waiting" },
  ];
  const rd = [
    { id: 1, name: "Lab-1", type: "lab" },
    { id: 2, name: "Lab-2", type: "lab" },
    { id: 3, name: "Room 503", type: "classroom" },
  ];
  const rag = buildRag(bd, rd);
  const result = detectCycleDfs(rag.nodes, rag.edges);

  return jsonResponse({
    has_deadlock: result.has_deadlock, deadlocked_processes: result.deadlocked_processes,
    deadlocked_resources: result.deadlocked_resources, cycle: result.cycle,
    rag: { nodes: result.nodes, edges: result.edges, has_deadlock: result.has_deadlock, cycle_description: result.cycle_description },
    resolution_options: result.has_deadlock ? ["terminate_youngest", "preempt_lowest_priority", "rollback"] : [],
    os_concept_note: `Deadlock analysis complete. ${result.has_deadlock ? result.deadlocked_processes.length + " processes in circular wait." : "No deadlock detected."}`,
  });
}
