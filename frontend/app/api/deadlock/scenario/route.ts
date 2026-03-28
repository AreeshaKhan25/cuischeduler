import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  const { scenario_type } = await request.json();
  const today = new Date().toISOString().split("T")[0];

  if (scenario_type === "classic" || scenario_type === "chain") {
    const limit = scenario_type === "classic" ? 2 : 3;
    const resources = await prisma.resource.findMany({ take: limit });
    if (resources.length < limit) return errorResponse(`Need at least ${limit} resources`);

    const maxB = await prisma.booking.findFirst({ orderBy: { id: "desc" } });
    let nextId = (maxB?.id || 0) + 1;
    const ids: number[] = [];

    for (let i = 0; i < limit; i++) {
      const r = resources[i];
      const rNext = resources[(i + 1) % limit];
      const b1 = await prisma.booking.create({ data: { processId: `P${nextId}`, title: `Deadlock Demo: holds ${r.name}`, department: "Computer Science", resourceId: r.id, resourceType: r.type, requestedBy: 1, date: today, startTime: "09:00", endTime: "10:00", durationMinutes: 60, priority: 5, state: "running", arrivalTime: i * 5, osConceptNote: `Holds ${r.name}, wants ${rNext.name}.` } });
      ids.push(b1.id); nextId++;
      const b2 = await prisma.booking.create({ data: { processId: `P${nextId}`, title: `Deadlock Demo: requests ${rNext.name}`, department: "Computer Science", resourceId: rNext.id, resourceType: rNext.type, requestedBy: 1, date: today, startTime: "09:00", endTime: "10:00", durationMinutes: 60, priority: 5, state: "waiting", arrivalTime: i * 5, osConceptNote: `Requests ${rNext.name} (held by another).` } });
      ids.push(b2.id); nextId++;
    }

    return jsonResponse({ scenario: scenario_type, description: `${scenario_type} deadlock created with ${limit} processes.`, booking_ids: ids, os_concept_note: "Deadlock scenario demonstrating circular wait condition." });
  }

  if (scenario_type === "safe") {
    const resources = await prisma.resource.findMany({ take: 2 });
    if (resources.length < 2) return errorResponse("Need at least 2 resources");
    const maxB = await prisma.booking.findFirst({ orderBy: { id: "desc" } });
    let nextId = (maxB?.id || 0) + 1;
    const ids: number[] = [];
    for (let i = 0; i < 3; i++) {
      const r = resources[i % resources.length];
      const b = await prisma.booking.create({ data: { processId: `P${nextId}`, title: `Safe State Demo: Process ${i + 1}`, department: "Computer Science", resourceId: r.id, resourceType: r.type, requestedBy: 1, date: today, startTime: "11:00", endTime: "12:00", durationMinutes: 60, priority: 5 - i, state: "ready", arrivalTime: i * 10, osConceptNote: "Process in safe state." } });
      ids.push(b.id); nextId++;
    }
    return jsonResponse({ scenario: "safe", description: "Safe state - no deadlock.", booking_ids: ids, os_concept_note: "A safe state means all processes can complete." });
  }

  return errorResponse(`Unknown scenario: ${scenario_type}`);
}
