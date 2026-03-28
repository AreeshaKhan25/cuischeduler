import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export async function GET() {
  const resources = await prisma.resource.findMany({ where: { type: { in: ["classroom", "lab"] } }, take: 20 });
  const activeBookings = await prisma.booking.findMany({ where: { state: { in: ["running", "waiting"] } } });

  const semaphores = resources.map(r => {
    const holders = activeBookings.filter(b => b.resourceId === r.id && b.state === "running");
    const waiters = activeBookings.filter(b => b.resourceId === r.id && b.state === "waiting");
    return {
      resource_id: r.id, resource_name: r.name, resource_type: r.type,
      max_count: 1, current_count: holders.length > 0 ? 0 : 1,
      holders: holders.map(b => ({ process_id: b.processId, title: b.title })),
      waiters: waiters.map(b => ({ process_id: b.processId, title: b.title })),
      state: holders.length > 0 ? "locked" : "free",
    };
  });

  return jsonResponse({
    semaphores,
    total_resources: resources.length,
    locked_count: semaphores.filter(s => s.state === "locked").length,
    os_concept_note: "Each resource has a binary semaphore. wait() blocks when count=0, signal() unblocks the next waiter.",
  });
}
