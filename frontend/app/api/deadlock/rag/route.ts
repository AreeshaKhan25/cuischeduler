import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";
import { buildRag, detectCycleDfs } from "@/lib/deadlock-detector";

export async function GET() {
  const bookings = await prisma.booking.findMany({ where: { state: { in: ["running", "waiting", "blocked"] } } });
  const resources = await prisma.resource.findMany();
  const bd = bookings.map(b => ({ id: b.id, process_id: b.processId, title: b.title, resource_id: b.resourceId, state: b.state }));
  const rd = resources.map(r => ({ id: r.id, name: r.name, type: r.type }));
  const rag = buildRag(bd, rd);
  const result = detectCycleDfs(rag.nodes, rag.edges);
  return jsonResponse({ ...result, os_concept_note: result.has_deadlock ? `DEADLOCK DETECTED: ${result.cycle_description}` : "No deadlock - system is in a safe state." });
}
