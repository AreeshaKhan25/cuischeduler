import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  const { strategy } = await request.json();
  const blocked = await prisma.booking.findMany({ where: { state: { in: ["blocked", "waiting"] } } });
  if (!blocked.length) return jsonResponse({ resolved: false, message: "No deadlocked processes found." });

  if (strategy === "terminate_youngest") {
    const victim = blocked.sort((a, b) => b.id - a.id)[0];
    await prisma.booking.update({ where: { id: victim.id }, data: { state: "new", resourceId: null, osConceptNote: "Terminated to resolve deadlock (youngest process)." } });
    return jsonResponse({ resolved: true, strategy, victim: victim.processId, action: "Process terminated and resources released.", os_concept_note: "Youngest process terminated to break circular wait." });
  }
  if (strategy === "preempt_lowest_priority") {
    const victim = blocked.sort((a, b) => b.priority - a.priority)[0];
    await prisma.booking.update({ where: { id: victim.id }, data: { state: "ready", resourceId: null, osConceptNote: "Resources preempted from lowest priority process." } });
    return jsonResponse({ resolved: true, strategy, victim: victim.processId, action: "Resources preempted.", os_concept_note: "Lowest priority process loses its resources." });
  }
  if (strategy === "rollback") {
    await prisma.booking.updateMany({ where: { state: { in: ["blocked", "waiting"] } }, data: { state: "ready", resourceId: null } });
    return jsonResponse({ resolved: true, strategy, victim: "all_deadlocked", action: "All rolled back to ready.", os_concept_note: "All deadlocked processes rolled back." });
  }

  return jsonResponse({ resolved: false, error: `Unknown strategy: ${strategy}` });
}
