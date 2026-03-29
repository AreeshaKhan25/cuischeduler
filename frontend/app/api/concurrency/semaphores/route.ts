export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export async function GET() {
  let resources: { id: number; name: string; type: string }[] = [];
  try {
    resources = await prisma.resource.findMany({ where: { type: { in: ["classroom", "lab"] } }, take: 20 });
  } catch { /* model may not exist */ }

  // Mock semaphore data for OS concepts demo
  const semaphores = resources.length > 0
    ? resources.map(r => ({
        resource_id: r.id, resource_name: r.name, resource_type: r.type,
        max_count: 1, current_count: 1,
        holders: [] as { process_id: string; title: string }[],
        waiters: [] as { process_id: string; title: string }[],
        state: "free",
      }))
    : [
        { resource_id: 1, resource_name: "Lab-1", resource_type: "lab", max_count: 1, current_count: 0, holders: [{ process_id: "P1", title: "OS Lab Session" }], waiters: [{ process_id: "P2", title: "Data Structures Lab" }], state: "locked" },
        { resource_id: 2, resource_name: "Lab-2", resource_type: "lab", max_count: 1, current_count: 1, holders: [], waiters: [], state: "free" },
        { resource_id: 3, resource_name: "Room 503", resource_type: "classroom", max_count: 1, current_count: 0, holders: [{ process_id: "P3", title: "Software Engineering" }], waiters: [], state: "locked" },
        { resource_id: 4, resource_name: "Room 501", resource_type: "classroom", max_count: 1, current_count: 1, holders: [], waiters: [], state: "free" },
      ];

  return jsonResponse({
    semaphores,
    total_resources: semaphores.length,
    locked_count: semaphores.filter(s => s.state === "locked").length,
    os_concept_note: "Each resource has a binary semaphore. wait() blocks when count=0, signal() unblocks the next waiter.",
  });
}
