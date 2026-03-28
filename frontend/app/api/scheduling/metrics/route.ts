import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";

export async function GET() {
  const completed = await prisma.booking.findMany({ where: { state: "completed" } });
  if (!completed.length) return jsonResponse({ total_completed: 0, algorithms_used: {}, overall_avg_waiting: 0, overall_avg_turnaround: 0, os_concept_note: "No completed processes yet." });

  const groups: Record<string, { count: number; tw: number; tt: number }> = {};
  let tw = 0, tt = 0;
  for (const b of completed) {
    const a = b.algorithmUsed || "unscheduled";
    if (!groups[a]) groups[a] = { count: 0, tw: 0, tt: 0 };
    groups[a].count++;
    groups[a].tw += b.waitingTime;
    groups[a].tt += b.turnaroundTime;
    tw += b.waitingTime;
    tt += b.turnaroundTime;
  }

  const n = completed.length;
  const algoStats: Record<string, unknown> = {};
  for (const [a, s] of Object.entries(groups)) {
    algoStats[a] = { count: s.count, avg_waiting_time: Math.round(s.tw / s.count * 100) / 100, avg_turnaround_time: Math.round(s.tt / s.count * 100) / 100 };
  }

  return jsonResponse({ total_completed: n, algorithms_used: algoStats, overall_avg_waiting: Math.round(tw / n * 100) / 100, overall_avg_turnaround: Math.round(tt / n * 100) / 100, os_concept_note: `${n} processes completed. Avg wait: ${(tw / n).toFixed(1)}min.` });
}
