import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";
import { buildRag, detectCycleDfs } from "@/lib/deadlock-detector";

export async function POST() {
  const bookings = await prisma.booking.findMany({ where: { state: { in: ["running", "waiting", "blocked"] } } });
  const resources = await prisma.resource.findMany();
  const bd = bookings.map(b => ({ id: b.id, process_id: b.processId, title: b.title, resource_id: b.resourceId, state: b.state }));
  const rd = resources.map(r => ({ id: r.id, name: r.name, type: r.type }));
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
