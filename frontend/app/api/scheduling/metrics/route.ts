export const dynamic = "force-dynamic";
import { jsonResponse } from "@/lib/auth-helpers";

export async function GET() {
  // Mock scheduling metrics for OS concepts demo
  const algoStats = {
    fcfs: { count: 8, avg_waiting_time: 12.5, avg_turnaround_time: 72.5 },
    sjf: { count: 6, avg_waiting_time: 8.3, avg_turnaround_time: 68.3 },
    round_robin: { count: 6, avg_waiting_time: 15.0, avg_turnaround_time: 75.0 },
    priority: { count: 5, avg_waiting_time: 10.0, avg_turnaround_time: 70.0 },
  };

  return jsonResponse({
    total_completed: 25,
    algorithms_used: algoStats,
    overall_avg_waiting: 11.5,
    overall_avg_turnaround: 71.5,
    os_concept_note: "25 processes completed. Avg wait: 11.5min.",
  });
}
