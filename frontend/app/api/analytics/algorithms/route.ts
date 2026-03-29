export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export async function GET() {
  const completed = await prisma.booking.findMany({ where: { state: "completed", algorithmUsed: { not: null } } });
  const groups: Record<string, { w: number[]; t: number[]; count: number }> = {};
  for (const b of completed) {
    const a = b.algorithmUsed!;
    if (!groups[a]) groups[a] = { w: [], t: [], count: 0 };
    groups[a].w.push(b.waitingTime); groups[a].t.push(b.turnaroundTime); groups[a].count++;
  }

  const algorithms = Object.entries(groups).map(([algo, s]) => {
    const avgW = s.w.reduce((a, b) => a + b, 0) / s.count;
    const avgT = s.t.reduce((a, b) => a + b, 0) / s.count;
    return { algorithm: algo, avg_waiting_time: Math.round(avgW * 100) / 100, avg_turnaround_time: Math.round(avgT * 100) / 100, throughput: Math.round(s.count / Math.max(s.t.reduce((a, b) => a + b, 1), 1) * 10000) / 10000, total_runs: s.count };
  });

  return jsonResponse({ algorithms, os_concept_note: "Algorithm comparison across all completed bookings." });
}
