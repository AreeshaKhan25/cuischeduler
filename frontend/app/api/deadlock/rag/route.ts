export const dynamic = "force-dynamic";
import { jsonResponse } from "@/lib/auth-helpers";
import { buildRag, detectCycleDfs } from "@/lib/deadlock-detector";

export async function GET() {
  // Mock booking/resource data for RAG demo
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
  return jsonResponse({ ...result, os_concept_note: result.has_deadlock ? `DEADLOCK DETECTED: ${result.cycle_description}` : "No deadlock - system is in a safe state." });
}
