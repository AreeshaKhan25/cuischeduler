import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export async function GET() {
  const resources = await prisma.resource.findMany();
  const bookings = await prisma.booking.findMany({ where: { state: { in: ["running", "waiting", "blocked"] } } });
  const allocSet = new Set(bookings.map(b => b.resourceId).filter(Boolean));

  const groups: Record<string, { total: number; alloc: number }> = {};
  for (const r of resources) {
    if (!groups[r.type]) groups[r.type] = { total: 0, alloc: 0 };
    groups[r.type].total++;
    if (allocSet.has(r.id)) groups[r.type].alloc++;
  }

  const data = Object.entries(groups).map(([type, g]) => {
    const free = g.total - g.alloc;
    const frags = Math.max(1, Math.ceil(free / 3));
    const largest = free > 0 ? Math.ceil(free / frags) : 0;
    return { resource_type: type, total_slots: g.total, used_slots: g.alloc, free_slots: free, fragments: frags, largest_free_block: largest, fragmentation_ratio: free > 0 ? Math.round((1 - largest / free) * 1000) / 1000 : 0 };
  });

  const overallFrag = data.length > 0 ? data.reduce((s, d) => s + d.fragmentation_ratio, 0) / data.length : 0;
  return jsonResponse({ data, overall_fragmentation: overallFrag, os_concept_note: `External fragmentation: ${(overallFrag * 100).toFixed(1)}%.` });
}
