export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export async function GET() {
  const resources = await prisma.resource.findMany();
  const bookings = await prisma.booking.findMany({
    where: { state: { in: ["running", "waiting", "blocked"] } },
  });

  const typeGroups: Record<string, { total: number; allocated: number; ids: number[] }> = {};
  for (const r of resources) {
    if (!typeGroups[r.type]) typeGroups[r.type] = { total: 0, allocated: 0, ids: [] };
    typeGroups[r.type].total++;
    typeGroups[r.type].ids.push(r.id);
  }

  const allocatedResIds = new Set(bookings.map(b => b.resourceId).filter(Boolean));
  for (const [type, group] of Object.entries(typeGroups)) {
    group.allocated = group.ids.filter(id => allocatedResIds.has(id)).length;
  }

  const pools = Object.entries(typeGroups).map(([type, g]) => {
    const free = g.total - g.allocated;
    const fragments = Math.max(1, Math.ceil(free / 3));
    const largestFree = free > 0 ? Math.ceil(free / fragments) : 0;
    return {
      resource_type: type, total: g.total, allocated: g.allocated, free,
      fragments, largest_free_block: largestFree,
      fragmentation_ratio: free > 0 ? 1 - largestFree / free : 0,
    };
  });

  const totalRes = resources.length;
  const totalAlloc = allocatedResIds.size;
  return jsonResponse({
    pools, total_resources: totalRes, total_allocated: totalAlloc,
    total_free: totalRes - totalAlloc,
    overall_fragmentation: pools.reduce((s, p) => s + p.fragmentation_ratio, 0) / (pools.length || 1),
    os_concept_note: "Memory pool state showing resource allocation bitmap across different resource types.",
  });
}
