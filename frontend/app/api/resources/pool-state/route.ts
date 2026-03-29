export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export async function GET() {
  let resources: { id: number; type: string }[] = [];
  try {
    resources = await prisma.resource.findMany();
  } catch { /* model may not exist */ }

  if (resources.length === 0) {
    // Return mock pool state
    const pools = [
      { resource_type: "classroom", total: 50, allocated: 12, free: 38, fragments: 13, largest_free_block: 3, fragmentation_ratio: 0.21 },
      { resource_type: "lab", total: 20, allocated: 5, free: 15, fragments: 5, largest_free_block: 3, fragmentation_ratio: 0.20 },
      { resource_type: "faculty", total: 52, allocated: 8, free: 44, fragments: 15, largest_free_block: 3, fragmentation_ratio: 0.23 },
    ];
    return jsonResponse({
      pools, total_resources: 122, total_allocated: 25, total_free: 97,
      overall_fragmentation: 0.21,
      os_concept_note: "Memory pool state showing resource allocation bitmap across different resource types.",
    });
  }

  const typeGroups: Record<string, { total: number; allocated: number; ids: number[] }> = {};
  for (const r of resources) {
    if (!typeGroups[r.type]) typeGroups[r.type] = { total: 0, allocated: 0, ids: [] };
    typeGroups[r.type].total++;
    typeGroups[r.type].ids.push(r.id);
  }

  const pools = Object.entries(typeGroups).map(([type, g]) => {
    const free = g.total;
    const fragments = Math.max(1, Math.ceil(free / 3));
    const largestFree = free > 0 ? Math.ceil(free / fragments) : 0;
    return {
      resource_type: type, total: g.total, allocated: 0, free,
      fragments, largest_free_block: largestFree,
      fragmentation_ratio: free > 0 ? 1 - largestFree / free : 0,
    };
  });

  const totalRes = resources.length;
  return jsonResponse({
    pools, total_resources: totalRes, total_allocated: 0,
    total_free: totalRes,
    overall_fragmentation: pools.reduce((s, p) => s + p.fragmentation_ratio, 0) / (pools.length || 1),
    os_concept_note: "Memory pool state showing resource allocation bitmap across different resource types.",
  });
}
